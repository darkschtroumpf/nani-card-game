// ============================================================
// NANI?! — Bot Scoring Strategies
// ============================================================

import type { Card, GameState, Player, Universe } from '../types';
import { UNIVERSES, dominates, DOMINANCE_BONUS } from '../constants';
import type { PersonalityProfile } from './personalities';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Add noise proportional to the personality's randomness setting. */
export function addNoise(score: number, profile: PersonalityProfile): number {
  const noise = (Math.random() - 0.5) * 2 * profile.randomness * 5;
  return score + noise;
}

/**
 * Count how many cards of each universe remain outside the discard pile.
 * Only meaningful when profile.countsDiscards is true.
 */
export function countRemainingByUniverse(state: GameState): Record<Universe, number> {
  const counts: Record<string, number> = {};
  for (const u of UNIVERSES) counts[u] = 0;

  for (const card of state.discard) {
    counts[card.universe] = (counts[card.universe] ?? 0) + 1;
  }

  // 10 cards per universe in the full deck
  const remaining: Record<string, number> = {};
  for (const u of UNIVERSES) {
    remaining[u] = 10 - counts[u];
  }
  return remaining as Record<Universe, number>;
}

// ------------------------------------------------------------------
// Target scoring
// ------------------------------------------------------------------

export interface TargetScore {
  playerId: string;
  score: number;
}

/**
 * Score every valid target for the bot.
 * Higher score = more desirable target.
 */
export function scoreTargets(
  state: GameState,
  bot: Player,
  profile: PersonalityProfile,
): TargetScore[] {
  const targets = state.players.filter(
    (p) => p.id !== bot.id && !p.eliminated,
  );

  return targets.map((target) => {
    let score = 0;

    // Prefer targets with low plot armor
    const maxArmor = 4;
    const weakness = maxArmor - target.plotArmor;
    score += weakness * profile.targetWeaknessWeight * 2;

    // Penalise targets with shields (harder to damage)
    score -= target.shields * 1.5;

    // Prefer targets with fewer cards (less defence options)
    score += Math.max(0, 5 - target.hand.length) * 0.5;

    // --- Identity-driven objectives ---
    score += objectiveTargetBonus(state, bot, target, profile);

    return {
      playerId: target.id,
      score: addNoise(score, profile),
    };
  });
}

/**
 * Return a bonus (or penalty) for attacking a specific target
 * based on the bot's secret identity objective.
 */
function objectiveTargetBonus(
  state: GameState,
  bot: Player,
  target: Player,
  profile: PersonalityProfile,
): number {
  const w = profile.objectiveWeight;
  if (w === 0) return 0;

  switch (bot.identity.type) {
    case 'rival': {
      // Must eliminate the player who precedes the bot in play order
      const botIndex = state.players.findIndex((p) => p.id === bot.id);
      let rivalIndex = botIndex - 1;
      if (rivalIndex < 0) rivalIndex = state.players.length - 1;
      const rivalTarget = state.players[rivalIndex];
      if (target.id === rivalTarget.id) return 8 * w;
      return 0;
    }

    case 'mentor': {
      // Never attack the protected player
      if (bot.identity.protectedPlayerId === target.id) return -20 * w;
      // If protected player is eliminated, target the killer
      const protectedPlayer = state.players.find(
        (p) => p.id === bot.identity.protectedPlayerId,
      );
      if (protectedPlayer && protectedPlayer.eliminated) {
        const killer = state.players.find((p) =>
          p.eliminatedPlayerIds.includes(protectedPlayer.id),
        );
        if (killer && target.id === killer.id) return 10 * w;
      }
      return 0;
    }

    case 'traitre':
      // Prioritise targets close to elimination (PA = 1)
      if (target.plotArmor === 1 && target.shields === 0) return 6 * w;
      return 1 * w; // generally aggressive

    case 'antagoniste': {
      // Prioritise players not yet damaged
      if (!bot.damagedPlayerIds.has(target.id)) return 7 * w;
      return 0;
    }

    case 'protagoniste':
      // Generic — just survive. Prefer weaker targets (already handled).
      return 0;

    case 'comic_relief':
      // No special targeting preference
      return 0;

    default:
      return 0;
  }
}

// ------------------------------------------------------------------
// Card scoring (attack)
// ------------------------------------------------------------------

export interface CardScore {
  cardIndex: number;
  card: Card;
  score: number;
}

/**
 * Score each card in the bot's hand for attacking a given target.
 * Considers dominance cycle, card value, and universe bonus.
 */
export function scoreAttackCards(
  bot: Player,
  _target: Player,
  profile: PersonalityProfile,
): CardScore[] {
  return bot.hand.map((card, index) => {
    let score = 0;

    // Higher value = stronger attack
    score += card.value * 1.2;

    // Special: value 1 can beat 7 (outsider rule) — risky but high-reward
    if (card.value === 1) {
      score += 1; // slight bump for surprise factor
    }

    // Value 7 doubles the universe bonus — very valuable
    if (card.value === 7) {
      score += 3;
    }

    // Universe bonus value
    score += universeAttackBonusScore(card.universe);

    return {
      cardIndex: index,
      card,
      score: addNoise(score, profile),
    };
  });
}

/** Rate how valuable each universe bonus is when attacking. */
function universeAttackBonusScore(universe: Universe): number {
  switch (universe) {
    case 'shonen': return 1.5;   // draw cards
    case 'magical': return 2.0;  // +1 plot armor is very strong
    case 'mecha': return 1.5;    // shield
    case 'isekai': return 1.0;   // steal card
    case 'seinen': return 1.0;   // info advantage
  }
}

// ------------------------------------------------------------------
// Bluff decision
// ------------------------------------------------------------------

export interface BluffDecision {
  shouldBluff: boolean;
  declaredUniverse: Universe;
}

/**
 * Decide whether to bluff (declare a different universe than the actual card).
 * If bluffing, pick a universe that dominates the target's most likely
 * defence universe (or just a random one for lower difficulties).
 */
export function decideBluff(
  actualCard: Card,
  bot: Player,
  target: Player,
  profile: PersonalityProfile,
  state: GameState,
): BluffDecision {
  const noBluff: BluffDecision = {
    shouldBluff: false,
    declaredUniverse: actualCard.universe,
  };

  // Comic Relief must NEVER bluff to fulfil objective
  if (bot.identity.type === 'comic_relief' && profile.objectiveWeight > 0) {
    return noBluff;
  }

  // Roll against bluff chance
  if (Math.random() > profile.bluffChance) {
    return noBluff;
  }

  // Pick a universe to declare that would be most intimidating.
  // Strategy: declare a universe that dominates what the target is likely
  // to play. For simplicity, look at target's revealed cards or guess
  // from the discard pile.

  // Hard bots: pick a universe that dominates the most remaining cards
  if (profile.countsDiscards) {
    const remaining = countRemainingByUniverse(state);
    let bestUniverse = actualCard.universe;
    let bestDominatedCount = -1;

    for (const u of UNIVERSES) {
      if (u === actualCard.universe) continue;
      // How many remaining cards does this universe dominate?
      const dominated = UNIVERSES.filter((v) => dominates(u, v));
      const dominatedCount = dominated.reduce((sum, v) => sum + remaining[v], 0);
      if (dominatedCount > bestDominatedCount) {
        bestDominatedCount = dominatedCount;
        bestUniverse = u;
      }
    }

    return { shouldBluff: true, declaredUniverse: bestUniverse };
  }

  // Medium / easy: pick a random different universe
  const otherUniverses = UNIVERSES.filter((u) => u !== actualCard.universe);
  const picked = otherUniverses[Math.floor(Math.random() * otherUniverses.length)];
  return { shouldBluff: true, declaredUniverse: picked };
}

// ------------------------------------------------------------------
// Defence card scoring
// ------------------------------------------------------------------

/**
 * Score each card in the defender's hand for responding to an attack.
 * Takes into account the attacker's *declared* universe (which may be a bluff).
 */
export function scoreDefenceCards(
  defender: Player,
  declaredUniverse: Universe,
  profile: PersonalityProfile,
): CardScore[] {
  return defender.hand.map((card, index) => {
    let score = 0;

    // Higher value = better defence
    score += card.value * 1.2;

    // Dominance bonus: does our card dominate the declared universe?
    if (dominates(card.universe, declaredUniverse)) {
      score += DOMINANCE_BONUS * 1.5; // very strong advantage
    }

    // Penalty if the declared universe dominates our card
    if (dominates(declaredUniverse, card.universe)) {
      score -= DOMINANCE_BONUS * 1.2;
    }

    // Value 1 can beat value 7 — worth considering if attacker likely has 7
    if (card.value === 1) {
      score += 0.5; // small bump for outsider chance
    }

    // Prefer not to waste a 7 on defence unless necessary
    if (card.value === 7) {
      score -= 1;
    }

    return {
      cardIndex: index,
      card,
      score: addNoise(score, profile),
    };
  });
}

// ------------------------------------------------------------------
// Train scoring (which card to discard)
// ------------------------------------------------------------------

/**
 * Score each card for *discarding* during training.
 * Higher score = more desirable to throw away.
 */
export function scoreTrainDiscards(
  bot: Player,
  profile: PersonalityProfile,
): CardScore[] {
  return bot.hand.map((card, index) => {
    let score = 0;

    // Prefer to discard low-value cards
    score += (7 - card.value) * 1.0;

    // Keep a diverse hand — count how many cards share this universe
    const sameUniverse = bot.hand.filter(
      (c) => c.universe === card.universe,
    ).length;
    if (sameUniverse > 1) {
      score += sameUniverse * 0.8; // duplicates are more expendable
    }

    return {
      cardIndex: index,
      card,
      score: addNoise(score, profile),
    };
  });
}

// ------------------------------------------------------------------
// Spy target scoring
// ------------------------------------------------------------------

/**
 * Score targets for the spy action.
 * Prefer players whose identity is still hidden.
 */
export function scoreSpyTargets(
  state: GameState,
  bot: Player,
  profile: PersonalityProfile,
): TargetScore[] {
  const targets = state.players.filter(
    (p) => p.id !== bot.id && !p.eliminated,
  );

  return targets.map((target) => {
    let score = 0;

    // Prefer players whose identity is not revealed
    if (!target.identityRevealed) {
      score += 3;
    }

    // Prefer players with more cards (more info to gain)
    score += target.hand.length * 0.5;

    // Identity-driven: spy on the rival target or antagonist objectives
    score += objectiveTargetBonus(state, bot, target, profile) * 0.5;

    return {
      playerId: target.id,
      score: addNoise(score, profile),
    };
  });
}
