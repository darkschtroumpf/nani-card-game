// ============================================================
// NANI?! Dojo — Game Engine
// ============================================================

import type {
  DojoGameState, DojoPlayer, DojoMarket, CardInstance, CardDef,
  FieldSlot, TrapSlot, CombatState, ArcEvent, LogEntry,
  Archetype, Universe, DojoPlayerView, OpponentView, PublicFieldSlot,
  PublicCombatState,
} from './types';
import { dominates, UNIVERSES } from './types';
import { ALL_CARDS, SENSEI_DECKS, createDojoSupply } from './cards';

let _nextId = 0;
function nextInstanceId(): string { return `ci-${_nextId++}`; }

function cardInstance(card: CardDef, fromDojo: boolean): CardInstance {
  return { card, instanceId: nextInstanceId(), concealed: false, fromDojo, summonedThisTurn: false };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// Game Creation
// ============================================================

export function createDojoGame(playerConfigs: { name: string; archetype: Archetype; draftedCards?: CardDef[] }[]): DojoGameState {
  _nextId = 0;

  const dojoSupplyDefs = shuffle(createDojoSupply());
  const dojoSupply = dojoSupplyDefs.map(c => cardInstance(c, true));

  const players: DojoPlayer[] = playerConfigs.map((cfg, i) => {
    // Use drafted cards if provided, otherwise fall back to fixed deck
    const deckDefs: CardDef[] = cfg.draftedCards ?? SENSEI_DECKS[cfg.archetype].map(id => ALL_CARDS.find(c => c.id === id)!);
    const senseiCards = deckDefs.map(def => cardInstance(def, false));
    const shuffled = shuffle(senseiCards);
    const hand = shuffled.slice(0, 4);
    const drawPile = shuffled.slice(4);

    return {
      id: `p${i}`,
      name: cfg.name,
      archetype: cfg.archetype,
      lp: 50,
      ki: 2,
      maxKi: 2,
      focus: 0,
      hand,
      drawPile,
      discardPile: [],
      field: [{ fighter: null }, { fighter: null }, { fighter: null }] as [FieldSlot, FieldSlot, FieldSlot],
      traps: [{ card: null, turnsSet: 0 }, { card: null, turnsSet: 0 }] as [TrapSlot, TrapSlot],
      dojoPicksVisible: [],
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      bluffsAttempted: 0,
      bluffsCaught: 0,
      bluffsSuccessful: 0,
      naniCalls: 0,
      naniCallsCorrect: 0,
      fightersPlayed: 0,
      fightersLost: 0,
      turnsAlive: 0,
      turnsSinceLastAttack: 0,
    };
  });

  // Set up dojo market (3 visible cards)
  const dojoCards: (CardInstance | null)[] = [
    dojoSupply.pop() ?? null,
    dojoSupply.pop() ?? null,
    dojoSupply.pop() ?? null,
  ];

  return {
    players,
    currentPlayerIndex: 0,
    turnPhase: 'ki',
    turnNumber: 1,
    dojo: { cards: dojoCards, supply: dojoSupply },
    combat: null,
    arcDeck: createArcDeck(),
    currentArc: null,
    gameOver: false,
    winnerId: null,
    winCondition: null,
    log: [],
  };
}

function createArcDeck(): ArcEvent[] {
  return shuffle([
    { name: 'Tournament Arc', description: 'Tous doivent attaquer ce tour', effect: 'tournament' as const },
    { name: 'Filler Episode', description: 'Tous piochent 2 cartes', effect: 'beach' as const },
    { name: 'Power Up', description: 'Tous les fighters +1 ATK', effect: 'power_up' as const },
    { name: 'Plot Twist', description: 'Les pièges face cachée sont révélés', effect: 'plot_twist' as const },
    { name: 'Betrayal Arc', description: 'Chaque joueur perd 2 LP', effect: 'betrayal' as const },
  ]);
}

// ============================================================
// Player View (information filtering)
// ============================================================

export function getDojoPlayerView(state: DojoGameState, playerId: string): DojoPlayerView {
  const me = state.players.find(p => p.id === playerId)!;
  const opponents: OpponentView[] = state.players
    .filter(p => p.id !== playerId)
    .map(p => ({
      id: p.id,
      name: p.name,
      archetype: null,  // hidden — deck composition is secret thanks to draft
      lp: p.lp,
      ki: p.ki,
      maxKi: p.maxKi,
      focus: p.focus,
      handSize: p.hand.length,
      drawPileSize: p.drawPile.length,
      discardPileSize: p.discardPile.length,
      field: p.field.map(slot => ({
        hasFighter: slot.fighter !== null,
        concealed: slot.fighter?.concealed ?? false,
        fighter: slot.fighter && !slot.fighter.concealed ? slot.fighter.card : null,
        equipment: slot.fighter?.attachedEquipment && !slot.fighter.attachedEquipment.concealed
          ? slot.fighter.attachedEquipment.card : null,
      })) as [PublicFieldSlot, PublicFieldSlot, PublicFieldSlot],
      traps: p.traps.map(t => t.card !== null) as [boolean, boolean],
      dojoPicksVisible: p.dojoPicksVisible,
    }));

  let publicCombat: PublicCombatState | null = null;
  if (state.combat) {
    publicCombat = {
      attackerId: state.combat.attackerId,
      defenderId: state.combat.defenderId,
      attackerSlot: state.combat.attackerSlot,
      defenderSlot: state.combat.defenderSlot,
      declaredUniverse: state.combat.declaredUniverse,
      defenderTechniqueUsed: state.combat.defenderTechniqueUsed?.card ?? null,
      attackerTechniqueUsed: state.combat.attackerTechniqueUsed?.card ?? null,
      naniCalled: state.combat.naniCalled,
    };
  }

  return {
    me,
    opponents,
    dojo: state.dojo,
    turnPhase: state.turnPhase,
    turnNumber: state.turnNumber,
    currentPlayerIndex: state.currentPlayerIndex,
    combat: publicCombat,
    currentArc: state.currentArc,
    log: state.log,
  };
}

// ============================================================
// Phase Processing
// ============================================================

function addLog(state: DojoGameState, playerId: string, action: string, detail: string) {
  state.log.push({ turn: state.turnNumber, playerId, action, detail });
}

function drawCard(player: DojoPlayer): CardInstance | null {
  if (player.drawPile.length === 0) {
    if (player.discardPile.length === 0) return null;
    player.drawPile = shuffle(player.discardPile);
    player.discardPile = [];
  }
  return player.drawPile.pop() ?? null;
}

export function processKiPhase(state: DojoGameState): void {
  const player = state.players[state.currentPlayerIndex];
  player.maxKi = Math.min(7, player.maxKi + 1);
  player.ki = player.maxKi;
  player.turnsAlive++;

  // Clear summoning sickness from previous turn's deploys
  for (const slot of player.field) {
    if (slot.fighter) slot.fighter.summonedThisTurn = false;
  }

  const drawn = drawCard(player);
  if (drawn) {
    player.hand.push(drawn);
  } else if (player.hand.length === 0) {
    // Deck out
    player.lp = 0;
    addLog(state, player.id, 'deckout', `${player.name} n'a plus de cartes!`);
  }

  // Arc event every 5 turns
  if (state.turnNumber > 1 && state.turnNumber % 5 === 1) {
    const arc = state.arcDeck.pop();
    if (arc) {
      state.currentArc = arc;
      applyArcEvent(state, arc);
      addLog(state, '', 'arc', `${arc.name}: ${arc.description}`);
    }
  } else {
    state.currentArc = null;
  }

  // Age traps
  for (const trap of player.traps) {
    if (trap.card) {
      trap.turnsSet++;
      if (trap.turnsSet > 3) {
        player.discardPile.push(trap.card);
        trap.card = null;
        trap.turnsSet = 0;
      }
    }
  }

  state.turnPhase = 'dojo';
}

function applyArcEvent(state: DojoGameState, arc: ArcEvent): void {
  switch (arc.effect) {
    case 'beach': // Filler Episode — everyone draws 2
      for (const p of state.players.filter(p => p.lp > 0)) {
        for (let i = 0; i < 2; i++) {
          const drawn = drawCard(p);
          if (drawn) p.hand.push(drawn);
        }
      }
      break;
    case 'power_up':
      for (const p of state.players) {
        for (const slot of p.field) {
          if (slot.fighter) slot.fighter.card = { ...slot.fighter.card, atk: (slot.fighter.card.atk ?? 0) + 1 };
        }
      }
      break;
    case 'betrayal':
      for (const p of state.players.filter(p => p.lp > 0)) {
        p.lp -= 2;
      }
      break;
    case 'plot_twist':
      for (const p of state.players) {
        for (const trap of p.traps) {
          if (trap.card) trap.card.concealed = false;
        }
      }
      break;
    // tournament: handled in bot decision (forced attack)
  }
}

export function processDojoBuy(state: DojoGameState, slotIndex: number): void {
  const player = state.players[state.currentPlayerIndex];
  const card = state.dojo.cards[slotIndex];
  if (!card) return;

  const cost = card.card.kiCost;
  if (player.ki < cost) return;

  player.ki -= cost;
  player.discardPile.push(card);
  player.dojoPicksVisible.push(card.card.id);
  addLog(state, player.id, 'dojo_buy', `${player.name} achète ${card.card.name} au Dojo`);

  // Refill slot
  state.dojo.cards[slotIndex] = state.dojo.supply.pop() ?? null;
}

export function processDojoMeditate(state: DojoGameState): void {
  const player = state.players[state.currentPlayerIndex];
  player.focus += 2;
  addLog(state, player.id, 'meditate', `${player.name} médite (+2 Focus)`);
}

export function deployFighter(state: DojoGameState, handIndex: number, fieldSlot: number, concealed: boolean): boolean {
  const player = state.players[state.currentPlayerIndex];
  if (handIndex < 0 || handIndex >= player.hand.length) return false;
  if (fieldSlot < 0 || fieldSlot > 2) return false;
  if (player.field[fieldSlot].fighter) return false;

  const card = player.hand[handIndex];
  if (card.card.type !== 'fighter') return false;

  const cost = concealed ? Math.max(0, card.card.kiCost - 1) : card.card.kiCost;
  if (player.ki < cost) return false;

  player.ki -= cost;
  card.concealed = concealed;
  card.summonedThisTurn = true;  // summoning sickness: can't attack this turn
  player.field[fieldSlot].fighter = card;
  player.hand.splice(handIndex, 1);
  player.fightersPlayed++;

  if (concealed) {
    addLog(state, player.id, 'deploy_concealed', `${player.name} pose un fighter face cachée`);
  } else {
    addLog(state, player.id, 'deploy', `${player.name} deploie ${card.card.name} (${card.card.atk}/${card.card.hp})`);
  }
  return true;
}

export function setTrap(state: DojoGameState, handIndex: number, trapSlot: number): boolean {
  const player = state.players[state.currentPlayerIndex];
  if (handIndex < 0 || handIndex >= player.hand.length) return false;
  if (trapSlot < 0 || trapSlot > 1) return false;

  const card = player.hand[handIndex];
  // Any card can be set as a trap (bluff)
  const cost = card.card.type === 'trap' ? card.card.kiCost : 1;
  if (player.ki < cost) return false;

  // Remove old trap if present
  if (player.traps[trapSlot].card) {
    player.discardPile.push(player.traps[trapSlot].card!);
  }

  player.ki -= cost;
  card.concealed = true;
  player.traps[trapSlot] = { card, turnsSet: 0 };
  player.hand.splice(handIndex, 1);

  addLog(state, player.id, 'set_trap', `${player.name} pose un piège face cachée`);
  return true;
}

export function equipCard(state: DojoGameState, handIndex: number, fieldSlot: number, concealed: boolean): boolean {
  const player = state.players[state.currentPlayerIndex];
  if (handIndex < 0 || handIndex >= player.hand.length) return false;
  const card = player.hand[handIndex];
  if (card.card.type !== 'equipment') return false;

  const fighter = player.field[fieldSlot]?.fighter;
  if (!fighter) return false;
  if (fighter.attachedEquipment) return false;
  if (player.ki < card.card.kiCost) return false;

  player.ki -= card.card.kiCost;
  card.concealed = concealed;
  fighter.attachedEquipment = card;
  player.hand.splice(handIndex, 1);

  addLog(state, player.id, 'equip', `${player.name} equipe ${concealed ? 'un equipement' : card.card.name}`);
  return true;
}

// ============================================================
// Combat
// ============================================================

export function initiateCombat(
  state: DojoGameState,
  attackerSlot: number,
  defenderId: string,
  defenderSlot: number | null,
  declaredUniverse: Universe,
): boolean {
  const attacker = state.players[state.currentPlayerIndex];
  const atkFighter = attacker.field[attackerSlot]?.fighter;
  if (!atkFighter) return false;
  if (atkFighter.summonedThisTurn) return false; // summoning sickness

  const defender = state.players.find(p => p.id === defenderId);
  if (!defender || defender.lp <= 0) return false;

  // Direct attack only if no fighters
  const hasAnyFighter = defender.field.some(s => s.fighter !== null);
  if (defenderSlot === null && hasAnyFighter) return false;

  // If defenderSlot specified, must have a fighter there
  if (defenderSlot !== null && !defender.field[defenderSlot]?.fighter) return false;

  // Direct attacks: always use true universe (no bluff possible on LP)
  const effectiveDeclared = defenderSlot === null ? atkFighter.card.universe : declaredUniverse;
  const actualUniverse = atkFighter.card.universe;
  const isBluff = atkFighter.concealed && defenderSlot !== null && effectiveDeclared !== actualUniverse;
  if (isBluff) attacker.bluffsAttempted++;

  attacker.turnsSinceLastAttack = 0; // reset attack timer
  state.combat = {
    attackerId: attacker.id,
    defenderId: defender.id,
    attackerSlot,
    defenderSlot,
    declaredUniverse: effectiveDeclared,
    isBluff,
    defenderTechniqueUsed: null,
    attackerTechniqueUsed: null,
    naniCalled: false,
  };

  state.turnPhase = 'combat_declare';
  if (defenderSlot === null) {
    addLog(state, attacker.id, 'attack',
      `${attacker.name} attaque directement ${defender.name}!`);
  } else {
    addLog(state, attacker.id, 'attack',
      `${attacker.name} attaque ${defender.name} et déclare ${effectiveDeclared}!`);
  }
  return true;
}

export function defenderChooseBlocker(state: DojoGameState, blockerSlot: number): boolean {
  if (!state.combat) return false;
  const defender = state.players.find(p => p.id === state.combat!.defenderId)!;
  if (!defender.field[blockerSlot]?.fighter) return false;
  state.combat.defenderSlot = blockerSlot;
  addLog(state, defender.id, 'block',
    `${defender.name} envoie ${defender.field[blockerSlot].fighter!.card.name} en defense!`);
  return true;
}

export function defenderPlayTechnique(state: DojoGameState, handIndex: number): boolean {
  if (!state.combat) return false;
  const defender = state.players.find(p => p.id === state.combat!.defenderId)!;
  if (handIndex < 0 || handIndex >= defender.hand.length) return false;

  const card = defender.hand[handIndex];
  if (card.card.type !== 'technique') return false;
  if (defender.ki < card.card.kiCost) return false;

  defender.ki -= card.card.kiCost;
  state.combat.defenderTechniqueUsed = card;
  defender.hand.splice(handIndex, 1);
  addLog(state, defender.id, 'technique', `${defender.name} joue ${card.card.name}!`);
  return true;
}

export function callNani(state: DojoGameState): boolean {
  if (!state.combat) return false;
  const defender = state.players.find(p => p.id === state.combat!.defenderId)!;
  const attacker = state.players.find(p => p.id === state.combat!.attackerId)!;
  const atkFighter = attacker.field[state.combat.attackerSlot]?.fighter;

  if (!atkFighter) return false;
  if (!atkFighter.concealed) return false; // can't call NANI on face-up
  if (state.combat.defenderSlot === null) return false; // can't call NANI on direct LP attack
  // NANI?! is free to call — the 3 LP penalty for wrong call is enough risk
  defender.naniCalls++;
  state.combat.naniCalled = true;

  addLog(state, defender.id, 'nani', `${defender.name} crie NANI?!`);
  return true;
}

export function resolveCombat(state: DojoGameState): string[] {
  if (!state.combat) return [];
  const events: string[] = [];
  const combat = state.combat;
  const attacker = state.players.find(p => p.id === combat.attackerId)!;
  const defender = state.players.find(p => p.id === combat.defenderId)!;
  const atkFighter = attacker.field[combat.attackerSlot]?.fighter;

  if (!atkFighter) {
    state.combat = null;
    state.turnPhase = 'end';
    return ['Le fighter attaquant a disparu!'];
  }

  // Reveal concealed fighter
  if (atkFighter.concealed) {
    atkFighter.concealed = false;
    events.push(`${atkFighter.card.name} est révélé! (${atkFighter.card.universe} ${atkFighter.card.atk}/${atkFighter.card.hp})`);
  }

  // NANI?! resolution
  if (combat.naniCalled) {
    if (combat.isBluff) {
      // Bluff caught!
      events.push(`NANI?! CORRECT! ${attacker.name} bluffait!`);
      destroyFighter(state, attacker, combat.attackerSlot, events);
      const drawn = drawCard(defender);
      if (drawn) { defender.hand.push(drawn); events.push(`${defender.name} pioche 1 carte.`); }
      attacker.bluffsCaught++;
      defender.naniCallsCorrect++;
      state.combat = null;
      state.turnPhase = 'end';
      return events;
    } else {
      // Wrong call
      events.push(`NANI?! RATÉ! ${attacker.name} disait vrai!`);
      defender.lp -= 3;
      defender.totalDamageReceived += 3;
      attacker.totalDamageDealt += 3;
      events.push(`${defender.name} perd 3 LP! (${defender.lp} restants)`);
      // attacker told truth, no bluff tracking needed
    }
  }

  // Track bluff success (not caught by NANI)
  if (combat.isBluff && !combat.naniCalled) {
    attacker.bluffsSuccessful++;
  }

  // Check for trap trigger
  for (let i = 0; i < defender.traps.length; i++) {
    const trap = defender.traps[i];
    if (trap.card && trap.card.card.type === 'trap') {
      events.push(`${defender.name} active le piège ${trap.card.card.name}!`);
      applyTrapEffect(state, trap.card, attacker, defender, combat, events);
      defender.discardPile.push(trap.card);
      defender.traps[i] = { card: null, turnsSet: 0 };
      // Only trigger first real trap
      break;
    }
  }

  // Check if attacker fighter still alive after trap
  const atkFighterAfterTrap = attacker.field[combat.attackerSlot]?.fighter;
  if (!atkFighterAfterTrap) {
    state.combat = null;
    state.turnPhase = 'end';
    return events;
  }

  // Apply technique effects
  let atkBonus = 0;
  let defBonus = 0;
  let shieldAmount = 0;
  let techNegated = false;

  if (combat.defenderTechniqueUsed) {
    const tech = combat.defenderTechniqueUsed.card;
    switch (tech.effectType) {
      case 'buff_atk': defBonus += 3; break;
      case 'heal': defender.lp = Math.min(50, defender.lp + 3); events.push(`${defender.name} se soigne de 3 LP`); break;
      case 'shield': shieldAmount += 4; break;
      case 'negate': techNegated = true; events.push('Technique adversaire annulée!'); break;
      case 'return_hand':
        if (atkFighterAfterTrap) {
          attacker.hand.push(atkFighterAfterTrap);
          attacker.field[combat.attackerSlot].fighter = null;
          events.push(`${atkFighterAfterTrap.card.name} renvoyé en main!`);
          defender.discardPile.push(combat.defenderTechniqueUsed);
          state.combat = null;
          state.turnPhase = 'end';
          return events;
        }
        break;
      case 'direct_damage':
        attacker.lp -= 3;
        attacker.totalDamageReceived += 3;
        defender.totalDamageDealt += 3;
        events.push(`${attacker.name} subit 3 dégâts directs!`);
        break;
      case 'steal_ki':
        const stolen = Math.min(2, attacker.ki);
        attacker.ki -= stolen;
        defender.ki += stolen;
        events.push(`${defender.name} vole ${stolen} Ki!`);
        break;
    }
    defender.discardPile.push(combat.defenderTechniqueUsed);
  }

  if (combat.attackerTechniqueUsed && !techNegated) {
    const tech = combat.attackerTechniqueUsed.card;
    if (tech.effectType === 'buff_atk') atkBonus += 3;
    attacker.discardPile.push(combat.attackerTechniqueUsed);
  } else if (combat.attackerTechniqueUsed) {
    attacker.discardPile.push(combat.attackerTechniqueUsed);
  }

  // Fighter vs fighter resolution
  const atkCard = atkFighterAfterTrap.card;
  const atkEquip = atkFighterAfterTrap.attachedEquipment;
  let totalAtk = (atkCard.atk ?? 0) + atkBonus + (atkEquip?.card.atkBonus ?? 0);

  // Direct attack
  if (combat.defenderSlot === null) {
    const damage = Math.max(0, totalAtk - shieldAmount);
    defender.lp -= damage;
    defender.totalDamageReceived += damage;
    attacker.totalDamageDealt += damage;
    events.push(`Attaque directe! ${defender.name} perd ${damage} LP! (${defender.lp} restants)`);
  } else {
    // Fighter vs fighter
    const defFighter = defender.field[combat.defenderSlot]?.fighter;
    if (defFighter) {
      if (defFighter.concealed) {
        defFighter.concealed = false;
        events.push(`${defFighter.card.name} révélé! (${defFighter.card.universe} ${defFighter.card.atk}/${defFighter.card.hp})`);
      }

      const defCard = defFighter.card;
      const defEquip = defFighter.attachedEquipment;
      let totalDef = (defCard.atk ?? 0) + defBonus + (defEquip?.card.atkBonus ?? 0);
      const defHp = (defCard.hp ?? 0) + (defEquip?.card.hpBonus ?? 0);
      const atkHp = (atkCard.hp ?? 0) + (atkEquip?.card.hpBonus ?? 0);

      // Dominance bonus
      if (dominates(atkCard.universe, defCard.universe)) {
        totalAtk += 3;
        events.push(`Bonus dominance ${atkCard.universe} > ${defCard.universe}! +3 ATK`);
      } else if (dominates(defCard.universe, atkCard.universe)) {
        totalDef += 3;
        events.push(`Bonus dominance ${defCard.universe} > ${atkCard.universe}! +3 DEF ATK`);
      }

      // Apply shield
      const effectiveAtk = Math.max(0, totalAtk - shieldAmount);

      // Damage
      const defDamage = effectiveAtk;
      const atkDamage = totalDef;

      events.push(`${atkCard.name} (${totalAtk} ATK) vs ${defCard.name} (${totalDef} ATK)`);

      // Both fighters deal damage simultaneously
      if (effectiveAtk >= defHp) {
        destroyFighter(state, defender, combat.defenderSlot, events);
        attacker.totalDamageDealt += defHp;
        defender.totalDamageReceived += defHp;
        const overflow = effectiveAtk - defHp;
        if (overflow > 0) {
          defender.lp -= overflow;
          defender.totalDamageReceived += overflow;
          attacker.totalDamageDealt += overflow;
          events.push(`Dégâts excédentaires: ${defender.name} perd ${overflow} LP!`);
        }
      } else {
        defFighter.card = { ...defFighter.card, hp: defHp - effectiveAtk };
        events.push(`${defCard.name} survit avec ${defHp - effectiveAtk} HP!`);
      }

      // Defender counter-attacks
      if (totalDef >= atkHp && attacker.field[combat.attackerSlot]?.fighter) {
        destroyFighter(state, attacker, combat.attackerSlot, events);
      } else if (attacker.field[combat.attackerSlot]?.fighter) {
        const atkFighterNow = attacker.field[combat.attackerSlot].fighter!;
        atkFighterNow.card = { ...atkFighterNow.card, hp: atkHp - totalDef };
        events.push(`${atkCard.name} survit avec ${atkHp - totalDef} HP!`);
      }
    }
  }

  // Give focus to winner (attacker if they have a fighter still)
  if (attacker.field[combat.attackerSlot]?.fighter) {
    attacker.focus += 1;
  }

  state.combat = null;
  state.turnPhase = 'end';
  return events;
}

function destroyFighter(state: DojoGameState, player: DojoPlayer, slot: number, events: string[]) {
  const fighter = player.field[slot]?.fighter;
  if (!fighter) return;
  events.push(`${fighter.card.name} de ${player.name} est détruit!`);
  if (fighter.attachedEquipment) {
    player.discardPile.push(fighter.attachedEquipment);
  }
  player.discardPile.push(fighter);
  player.field[slot].fighter = null;
  player.fightersLost++;

  // Reward the killer: the current player draws a card (aggression reward)
  const killer = state.players[state.currentPlayerIndex];
  if (killer.id !== player.id) {
    const drawn = drawCard(killer);
    if (drawn) {
      killer.hand.push(drawn);
      events.push(`${killer.name} pioche 1 carte (récompense de kill)!`);
    }
  }
}

function applyTrapEffect(
  state: DojoGameState, trap: CardInstance,
  attacker: DojoPlayer, defender: DojoPlayer,
  combat: CombatState, events: string[],
) {
  switch (trap.card.effectType) {
    case 'damage': {
      // Reflect/mine damage
      const dmg = trap.card.id.includes('mc') ? 4 : 3;
      const atkFighter = attacker.field[combat.attackerSlot]?.fighter;
      if (atkFighter) {
        const hp = (atkFighter.card.hp ?? 0) + (atkFighter.attachedEquipment?.card.hpBonus ?? 0);
        if (dmg >= hp) {
          destroyFighter(state, attacker, combat.attackerSlot, events);
        }
      }
      break;
    }
    case 'heal':
      defender.lp = Math.min(50, defender.lp + 2);
      events.push(`${defender.name} se soigne de 2 LP`);
      break;
    case 'return_hand': {
      const atkFighter = attacker.field[combat.attackerSlot]?.fighter;
      if (atkFighter) {
        attacker.hand.push(atkFighter);
        attacker.field[combat.attackerSlot].fighter = null;
        events.push(`${atkFighter.card.name} renvoyé en main!`);
      }
      break;
    }
    case 'destroy': {
      const atkFighter = attacker.field[combat.attackerSlot]?.fighter;
      if (atkFighter && (atkFighter.card.atk ?? 0) <= 3) {
        destroyFighter(state, attacker, combat.attackerSlot, events);
      } else {
        events.push(`Embuscade ratée (ATK > 3)`);
      }
      break;
    }
  }
}

// ============================================================
// End Phase & Victory Check
// ============================================================

export function processEndPhase(state: DojoGameState): void {
  const player = state.players[state.currentPlayerIndex];

  // Anti-turtle: penalize inactivity
  player.turnsSinceLastAttack++;
  if (player.turnsSinceLastAttack >= 3) {
    player.lp -= 5;
    player.totalDamageReceived += 5;
    addLog(state, player.id, 'stagnation', `${player.name} perd 5 LP (inactivité)!`);
    player.turnsSinceLastAttack = 0;
  }

  // Discard to 7
  while (player.hand.length > 7) {
    player.discardPile.push(player.hand.pop()!);
  }

  // Refill dojo
  for (let i = 0; i < state.dojo.cards.length; i++) {
    if (!state.dojo.cards[i] && state.dojo.supply.length > 0) {
      state.dojo.cards[i] = state.dojo.supply.pop()!;
    }
  }

  // Check victories
  checkVictory(state);

  if (!state.gameOver) {
    // Advance to next living player
    do {
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    } while (state.players[state.currentPlayerIndex].lp <= 0 && !state.gameOver);

    if (state.currentPlayerIndex === 0) state.turnNumber++;
    state.turnPhase = 'ki';
  }
}

function checkVictory(state: DojoGameState): void {
  const alive = state.players.filter(p => p.lp > 0);

  if (alive.length <= 1) {
    state.gameOver = true;
    if (alive.length === 1) {
      state.winnerId = alive[0].id;
      state.winCondition = 'lp';
      addLog(state, alive[0].id, 'victory', `${alive[0].name} gagne! Dernier survivant.`);
    }
    return;
  }

  // Multiverse victory check
  for (const p of alive) {
    const universes = new Set<Universe>();
    for (const slot of p.field) {
      if (slot.fighter && !slot.fighter.concealed) {
        universes.add(slot.fighter.card.universe);
      }
    }
    if (universes.size >= 3) {
      state.gameOver = true;
      state.winnerId = p.id;
      state.winCondition = 'multiverse';
      addLog(state, p.id, 'victory', `${p.name} gagne par Convergence Multiverse!`);
      return;
    }
  }

  // Stalemate check (too many turns)
  if (state.turnNumber > 60) {
    state.gameOver = true;
    const best = alive.reduce((a, b) => a.lp > b.lp ? a : b);
    state.winnerId = best.id;
    state.winCondition = 'lp';
    addLog(state, best.id, 'victory', `${best.name} gagne aux LP après 50 tours!`);
  }
}

// ============================================================
// Signature Activation
// ============================================================

export function activateSignature(state: DojoGameState, handIndex: number): string[] {
  const player = state.players[state.currentPlayerIndex];
  const card = player.hand[handIndex];
  if (!card || card.card.type !== 'signature') return ['Pas une signature'];
  if (player.ki < card.card.kiCost) return ['Pas assez de Ki'];
  if (player.focus < (card.card.focusCost ?? 0)) return ['Pas assez de Focus'];

  player.ki -= card.card.kiCost;
  player.focus -= card.card.focusCost ?? 0;
  player.hand.splice(handIndex, 1);
  player.discardPile.push(card);

  const events: string[] = [`${player.name} active ${card.card.name}!`];

  switch (card.card.effectType) {
    case 'buff_atk': // Bankai - all fighters +4 ATK
      for (const slot of player.field) {
        if (slot.fighter) {
          slot.fighter.card = { ...slot.fighter.card, atk: (slot.fighter.card.atk ?? 0) + 4 };
          events.push(`${slot.fighter.card.name} +4 ATK!`);
        }
      }
      break;
    case 'heal': // Constellation - heal all fighters + 5 LP
      for (const slot of player.field) {
        if (slot.fighter) {
          // Reset HP to base
          events.push(`${slot.fighter.card.name} soigné!`);
        }
      }
      player.lp = Math.min(50, player.lp + 4);
      events.push(`${player.name} +4 LP!`);
      break;
    case 'shield': // Eva Sync — +4 HP to best fighter
      const bestSlot = player.field.find(s => s.fighter);
      if (bestSlot?.fighter) {
        bestSlot.fighter.card = { ...bestSlot.fighter.card, hp: (bestSlot.fighter.card.hp ?? 0) + 4 };
        events.push(`${bestSlot.fighter.card.name} gagne +4 HP!`);
      }
      break;
    case 'revive': // Respawn - revive from discard
      const deadFighter = player.discardPile.find(c => c.card.type === 'fighter');
      if (deadFighter) {
        const emptySlot = player.field.findIndex(s => !s.fighter);
        if (emptySlot >= 0) {
          player.discardPile = player.discardPile.filter(c => c !== deadFighter);
          player.field[emptySlot].fighter = deadFighter;
          events.push(`${deadFighter.card.name} ressuscité!`);
        }
      }
      break;
    case 'destroy': // Death Note - destroy any enemy fighter
      for (const opp of state.players.filter(p => p.id !== player.id)) {
        for (let i = 0; i < opp.field.length; i++) {
          if (opp.field[i].fighter) {
            destroyFighter(state, opp, i, events);
            return events; // only destroy one
          }
        }
      }
      break;
  }

  addLog(state, player.id, 'signature', events.join(' '));
  return events;
}
