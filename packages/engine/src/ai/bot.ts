// ============================================================
// NANI?! — Bot AI Decision Engine
// ============================================================

import type {
  Action,
  AttackAction,
  DefendAction,
  TrainAction,
  SpyAction,
  GameState,
  Player,
  Universe,
} from '../types';
import { PERSONALITIES } from './personalities';
import type { BotDifficulty } from './personalities';
import {
  scoreTargets,
  scoreAttackCards,
  scoreDefenceCards,
  scoreTrainDiscards,
  scoreSpyTargets,
  decideBluff,
} from './strategies';

export type { BotDifficulty } from './personalities';

// ------------------------------------------------------------------
// Main entry point
// ------------------------------------------------------------------

/**
 * Compute the best action for a bot given the current game state.
 *
 * Call this when:
 * - turnPhase === 'action_choice' and it's the bot's turn  -> returns Attack | Train | Spy
 * - turnPhase === 'duel_response' and the bot is the defender -> returns Defend
 *
 * The caller is responsible for applying the returned Action via `applyAction`.
 */
export function computeBotAction(
  state: GameState,
  botId: string,
  difficulty: BotDifficulty,
): Action {
  const bot = state.players.find((p) => p.id === botId);
  if (!bot) throw new Error(`Bot ${botId} not found`);

  const profile = PERSONALITIES[difficulty];

  // ----- Defence phase -----
  if (state.turnPhase === 'duel_response' && state.pendingDuel) {
    return chooseDefenceCard(state, bot, difficulty);
  }

  // ----- Action choice phase -----
  if (state.turnPhase === 'action_choice') {
    return chooseAction(state, bot, difficulty);
  }

  // Fallback — should not happen in normal flow
  // Return a train action to avoid crashing
  return { type: 'train', discardIndex: 0 } as TrainAction;
}

// ------------------------------------------------------------------
// Action choice (attack / train / spy)
// ------------------------------------------------------------------

function chooseAction(
  state: GameState,
  bot: Player,
  difficulty: BotDifficulty,
): AttackAction | TrainAction | SpyAction {
  const profile = PERSONALITIES[difficulty];

  // If tournament arc is active, the bot MUST attack
  const mustAttack = state.currentArc?.type === 'tournament';

  // If beach episode, the bot CANNOT attack
  const cannotAttack = state.currentArc?.type === 'beach_episode';

  if (cannotAttack) {
    // Choose between train and spy
    return Math.random() < 0.5
      ? chooseTrain(bot, difficulty)
      : chooseSpy(state, bot, difficulty);
  }

  if (mustAttack) {
    return chooseAttack(state, bot, difficulty);
  }

  // Decide whether to attack, train, or spy based on personality
  // Easy bots are more passive; hard bots attack more often
  const roll = Math.random();
  if (roll < profile.passivity) {
    // Passive action: train or spy
    return Math.random() < 0.6
      ? chooseTrain(bot, difficulty)
      : chooseSpy(state, bot, difficulty);
  }

  // Check if the bot has a strong enough hand to attack
  const hasDecentCard = bot.hand.some((c) => c.value >= 4);
  if (!hasDecentCard && Math.random() < 0.5) {
    // Weak hand — maybe train instead
    return chooseTrain(bot, difficulty);
  }

  return chooseAttack(state, bot, difficulty);
}

// ------------------------------------------------------------------
// Attack
// ------------------------------------------------------------------

function chooseAttack(
  state: GameState,
  bot: Player,
  difficulty: BotDifficulty,
): AttackAction {
  const profile = PERSONALITIES[difficulty];

  // 1. Pick target
  const targetScores = scoreTargets(state, bot, profile);
  targetScores.sort((a, b) => b.score - a.score);
  const targetId = targetScores[0].playerId;

  const target = state.players.find((p) => p.id === targetId)!;

  // 2. Pick card
  const cardScores = scoreAttackCards(bot, target, profile);
  cardScores.sort((a, b) => b.score - a.score);
  const bestCard = cardScores[0];

  // 3. Decide bluff
  const bluff = decideBluff(bestCard.card, bot, target, profile, state);

  return {
    type: 'attack',
    targetId,
    cardIndex: bestCard.cardIndex,
    declaredUniverse: bluff.declaredUniverse,
  };
}

// ------------------------------------------------------------------
// Defence
// ------------------------------------------------------------------

function chooseDefenceCard(
  state: GameState,
  bot: Player,
  difficulty: BotDifficulty,
): DefendAction {
  const profile = PERSONALITIES[difficulty];
  const duel = state.pendingDuel!;
  const declaredUniverse: Universe = duel.declaredUniverse;

  const cardScores = scoreDefenceCards(bot, declaredUniverse, profile);
  cardScores.sort((a, b) => b.score - a.score);

  return {
    type: 'defend',
    cardIndex: cardScores[0].cardIndex,
  };
}

// ------------------------------------------------------------------
// Train
// ------------------------------------------------------------------

function chooseTrain(
  bot: Player,
  difficulty: BotDifficulty,
): TrainAction {
  const profile = PERSONALITIES[difficulty];
  const discardScores = scoreTrainDiscards(bot, profile);
  discardScores.sort((a, b) => b.score - a.score);

  return {
    type: 'train',
    discardIndex: discardScores[0].cardIndex,
  };
}

// ------------------------------------------------------------------
// Spy
// ------------------------------------------------------------------

function chooseSpy(
  state: GameState,
  bot: Player,
  difficulty: BotDifficulty,
): SpyAction | TrainAction {
  const profile = PERSONALITIES[difficulty];
  const spyScores = scoreSpyTargets(state, bot, profile);

  if (spyScores.length === 0) {
    // No valid spy targets — fall back to train
    return chooseTrain(bot, difficulty);
  }

  spyScores.sort((a, b) => b.score - a.score);

  return {
    type: 'spy',
    targetId: spyScores[0].playerId,
  };
}
