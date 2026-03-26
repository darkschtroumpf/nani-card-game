import type {
  GameState,
  GameConfig,
  Player,
  Action,
  PlayerView,
  PublicPlayerInfo,
  GameLogEntry,
  Card,
} from './types';
import {
  STARTING_PLOT_ARMOR,
  STARTING_HAND_SIZE,
  ARC_INTERVAL,
  TRAIN_DRAW_COUNT,
} from './constants';
import { createDeck, dealHands, drawCards } from './deck';
import { resolveDuel, applyDuelResult } from './duel';
import { dealIdentities, getVictoryCandidates } from './identity';
import { createArcDeck, drawArc, applyArc } from './arcs';

// ============================================================
// Game initialization
// ============================================================

export function createGame(config: GameConfig): GameState {
  const deck = createDeck();
  const { hands, remaining } = dealHands(deck, config.playerCount, STARTING_HAND_SIZE);
  const identities = dealIdentities(config.playerCount);

  const players: Player[] = [];
  for (let i = 0; i < config.playerCount; i++) {
    players.push({
      id: `player-${i}`,
      name: config.playerNames[i] ?? `Joueur ${i + 1}`,
      hand: hands[i],
      plotArmor: STARTING_PLOT_ARMOR,
      shields: 0,
      identity: identities[i],
      identityRevealed: false,
      eliminated: false,
      isBot: i >= config.playerCount - config.botCount,
      hasBluffed: false,
      damagedPlayerIds: new Set<string>(),
      eliminatedPlayerIds: [],
    });
  }

  return {
    players,
    deck: remaining,
    discard: [],
    currentPlayerIndex: 0,
    turnPhase: 'opening',
    turnNumber: 1,
    turnsWithoutAttack: 0,
    pendingDuel: null,
    arcDeck: createArcDeck(),
    currentArc: null,
    nextArcInTurns: ARC_INTERVAL,
    finalBossHp: null,
    winner: null,
    gameOver: false,
    log: [],
  };
}

// ============================================================
// Action processing
// ============================================================

export function applyAction(state: GameState, action: Action, playerId: string): string[] {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.eliminated) return ['Joueur invalide ou éliminé.'];
  if (state.gameOver) return ['La partie est terminée.'];

  switch (action.type) {
    case 'attack':
      return handleAttack(state, player, action);
    case 'defend':
      return handleDefend(state, player, action);
    case 'train':
      return handleTrain(state, player, action);
    case 'spy':
      return handleSpy(state, player, action);
    case 'claim_victory':
      return handleClaimVictory(state, player);
    default:
      return ['Action inconnue.'];
  }
}

function handleAttack(
  state: GameState,
  player: Player,
  action: Extract<Action, { type: 'attack' }>,
): string[] {
  if (state.turnPhase !== 'action_choice') return ['Ce n\'est pas le moment d\'attaquer.'];

  const target = state.players.find((p) => p.id === action.targetId);
  if (!target || target.eliminated) return ['Cible invalide.'];
  if (target.id === player.id) return ['Tu ne peux pas t\'attaquer toi-même.'];
  if (action.cardIndex < 0 || action.cardIndex >= player.hand.length) return ['Carte invalide.'];

  // Check if bluffing (declared universe differs from actual)
  const actualCard = player.hand[action.cardIndex];
  if (action.declaredUniverse !== actualCard.universe) {
    player.hasBluffed = true;
  }

  state.pendingDuel = {
    attackerId: player.id,
    defenderId: target.id,
    attackerCardIndex: action.cardIndex,
    declaredUniverse: action.declaredUniverse,
  };
  state.turnPhase = 'duel_response';

  const log = addLog(state, player.id, 'attack',
    `${player.name} attaque ${target.name} et déclare "${action.declaredUniverse}" !`);

  return [log.details];
}

function handleDefend(
  state: GameState,
  player: Player,
  action: Extract<Action, { type: 'defend' }>,
): string[] {
  if (state.turnPhase !== 'duel_response') return ['Ce n\'est pas le moment de défendre.'];
  if (!state.pendingDuel) return ['Pas de duel en cours.'];
  if (player.id !== state.pendingDuel.defenderId) return ['Ce n\'est pas toi le défenseur.'];
  if (action.cardIndex < 0 || action.cardIndex >= player.hand.length) return ['Carte invalide.'];

  const attacker = state.players.find((p) => p.id === state.pendingDuel!.attackerId)!;
  const attackerCard = attacker.hand[state.pendingDuel.attackerCardIndex];
  const defenderCard = player.hand[action.cardIndex];

  // Resolve the duel
  const result = resolveDuel(attackerCard, defenderCard, attacker.id, player.id);
  state.turnPhase = 'resolution';

  const duelEvents = applyDuelResult(state, result);

  // Track that an attack happened this round
  state.turnsWithoutAttack = 0;

  // Clear pending duel
  state.pendingDuel = null;

  // Log
  for (const event of duelEvents) {
    addLog(state, player.id, 'duel', event);
  }

  // Move to ending phase
  state.turnPhase = 'ending';
  const endEvents = processEnding(state);

  return [...duelEvents, ...endEvents];
}

function handleTrain(
  state: GameState,
  player: Player,
  action: Extract<Action, { type: 'train' }>,
): string[] {
  if (state.turnPhase !== 'action_choice') return ['Ce n\'est pas le moment de s\'entraîner.'];

  // Check if forced to attack (Tournament Arc)
  if (state.currentArc?.type === 'tournament') {
    return ['Tournament Arc ! Tu dois attaquer ce tour.'];
  }

  // Check if attacks are blocked (Beach Episode)
  // Training is allowed during Beach Episode

  if (action.discardIndex < 0 || action.discardIndex >= player.hand.length) {
    return ['Carte invalide.'];
  }

  // Discard 1, draw 2
  const discarded = player.hand.splice(action.discardIndex, 1)[0];
  state.discard.push(discarded);
  const drawn = drawCards(state.deck, TRAIN_DRAW_COUNT);
  player.hand.push(...drawn);

  const details = `${player.name} s'entraîne : défausse ${discarded.universe}-${discarded.value}, pioche ${drawn.length} carte(s).`;
  addLog(state, player.id, 'train', details);

  state.turnPhase = 'ending';
  const endEvents = processEnding(state);

  return [details, ...endEvents];
}

function handleSpy(
  state: GameState,
  player: Player,
  action: Extract<Action, { type: 'spy' }>,
): string[] {
  if (state.turnPhase !== 'action_choice') return ['Ce n\'est pas le moment d\'espionner.'];

  if (state.currentArc?.type === 'tournament') {
    return ['Tournament Arc ! Tu dois attaquer ce tour.'];
  }

  const target = state.players.find((p) => p.id === action.targetId);
  if (!target || target.eliminated) return ['Cible invalide.'];
  if (target.id === player.id) return ['Tu ne peux pas t\'espionner toi-même.'];

  // Reveal 1 random card from target's hand (handled by UI for the spying player)
  const details = `${player.name} espionne ${target.name}.`;
  addLog(state, player.id, 'spy', details);

  state.turnPhase = 'ending';
  const endEvents = processEnding(state);

  return [details, ...endEvents];
}

function handleClaimVictory(state: GameState, player: Player): string[] {
  const candidates = getVictoryCandidates(state);
  if (candidates.some((c) => c.id === player.id)) {
    state.winner = player.id;
    state.gameOver = true;
    const details = `${player.name} remporte la victoire avec l'objectif ${player.identity.type} !`;
    addLog(state, player.id, 'victory', details);
    return [details];
  }
  return ['Objectif non rempli. Tu ne peux pas réclamer la victoire.'];
}

// ============================================================
// Turn management
// ============================================================

/** Process the opening phase: draw a card, check for arc */
export function processOpening(state: GameState): string[] {
  const events: string[] = [];
  const player = getCurrentPlayer(state);

  if (!player || player.eliminated) {
    advanceToNextPlayer(state);
    return processOpening(state);
  }

  // Draw 1 card
  const drawn = drawCards(state.deck, 1);
  player.hand.push(...drawn);
  if (drawn.length > 0) {
    events.push(`${player.name} pioche 1 carte.`);
  }

  // Check for arc narratif
  state.nextArcInTurns--;
  if (state.nextArcInTurns <= 0) {
    const arc = drawArc(state);
    if (arc) {
      state.currentArc = arc;
      const arcEvents = applyArc(state, arc);
      events.push(...arcEvents);
    }
    state.nextArcInTurns = ARC_INTERVAL;
  } else {
    state.currentArc = null;
  }

  state.turnPhase = 'action_choice';
  return events;
}

/** Process the ending phase: check victories, anti-stagnation, advance turn */
function processEnding(state: GameState): string[] {
  const events: string[] = [];

  // Check if only 1 player alive
  const alivePlayers = state.players.filter((p) => !p.eliminated);
  if (alivePlayers.length <= 1) {
    if (alivePlayers.length === 1) {
      state.winner = alivePlayers[0].id;
      events.push(`${alivePlayers[0].name} est le dernier survivant !`);
    }
    state.gameOver = true;
    return events;
  }

  // Check secret objectives
  const candidates = getVictoryCandidates(state);
  if (candidates.length > 0) {
    // Don't auto-win — player must claim it. But we can hint.
  }

  // Advance to next player
  advanceToNextPlayer(state);
  state.turnNumber++;

  // Anti-stagnation: check after a full round
  // (simplified: if no attack happened for playerCount consecutive turns)
  if (state.turnsWithoutAttack >= state.players.filter((p) => !p.eliminated).length) {
    for (const p of state.players.filter((p) => !p.eliminated)) {
      p.plotArmor--;
      if (p.plotArmor <= 0) {
        p.eliminated = true;
        events.push(`${p.name} est éliminé par la stagnation !`);
      }
    }
    events.push('Le public s\'ennuie ! Tous les joueurs perdent 1 Plot Armor.');
    state.turnsWithoutAttack = 0;
  } else {
    state.turnsWithoutAttack++;
  }

  state.turnPhase = 'opening';
  return events;
}

function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

function advanceToNextPlayer(state: GameState): void {
  const playerCount = state.players.length;
  let next = (state.currentPlayerIndex + 1) % playerCount;
  let attempts = 0;
  while (state.players[next].eliminated && attempts < playerCount) {
    next = (next + 1) % playerCount;
    attempts++;
  }
  state.currentPlayerIndex = next;
}

// ============================================================
// View filtering (hide secret info)
// ============================================================

export function getPlayerView(state: GameState, playerId: string): PlayerView {
  const myPlayer = state.players.find((p) => p.id === playerId)!;

  const otherPlayers: PublicPlayerInfo[] = state.players
    .filter((p) => p.id !== playerId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      cardCount: p.hand.length,
      plotArmor: p.plotArmor,
      shields: p.shields,
      identityRevealed: p.identityRevealed,
      identityType: p.identityRevealed ? p.identity.type : null,
      eliminated: p.eliminated,
      isBot: p.isBot,
    }));

  return {
    myPlayer,
    otherPlayers,
    deckCount: state.deck.length,
    discard: state.discard,
    currentPlayerIndex: state.currentPlayerIndex,
    turnPhase: state.turnPhase,
    turnNumber: state.turnNumber,
    pendingDuel: state.pendingDuel,
    currentArc: state.currentArc,
    finalBossHp: state.finalBossHp,
    winner: state.winner,
    gameOver: state.gameOver,
    log: state.log,
  };
}

// ============================================================
// Helpers
// ============================================================

function addLog(
  state: GameState,
  playerId: string,
  action: string,
  details: string,
): GameLogEntry {
  const entry: GameLogEntry = {
    turnNumber: state.turnNumber,
    playerId,
    action,
    details,
  };
  state.log.push(entry);
  return entry;
}
