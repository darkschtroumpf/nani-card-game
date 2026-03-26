// ============================================================
// NANI?! — Bot Personality Profiles
// ============================================================

export type BotDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Configuration knobs for each difficulty level.
 * All probabilities are 0..1.
 */
export interface PersonalityProfile {
  /** Weight of random noise added to every score (0 = none, 1 = huge) */
  randomness: number;

  /** Probability of attempting a bluff when it would be advantageous */
  bluffChance: number;

  /** How strongly the bot pursues its secret identity objective (0 = ignores, 1 = laser-focused) */
  objectiveWeight: number;

  /** Whether the bot tracks the discard pile to infer remaining cards */
  countsDiscards: boolean;

  /** Probability of choosing Train when it would be smarter to attack */
  passivity: number;

  /** Bonus score given to weaker targets (multiplied by HP difference) */
  targetWeaknessWeight: number;
}

export const PERSONALITIES: Record<BotDifficulty, PersonalityProfile> = {
  easy: {
    randomness: 0.8,
    bluffChance: 0.05,
    objectiveWeight: 0.0,
    countsDiscards: false,
    passivity: 0.4,
    targetWeaknessWeight: 0.2,
  },
  medium: {
    randomness: 0.35,
    bluffChance: 0.25,
    objectiveWeight: 0.5,
    countsDiscards: false,
    passivity: 0.2,
    targetWeaknessWeight: 0.6,
  },
  hard: {
    randomness: 0.1,
    bluffChance: 0.5,
    objectiveWeight: 1.0,
    countsDiscards: true,
    passivity: 0.05,
    targetWeaknessWeight: 1.0,
  },
};
