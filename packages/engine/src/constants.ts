import type { Universe, ArcEvent, ArcType, IdentityType } from './types';

// ============================================================
// Universes
// ============================================================

export const UNIVERSES: Universe[] = ['shonen', 'magical', 'mecha', 'isekai', 'seinen'];

export const UNIVERSE_NAMES: Record<Universe, string> = {
  shonen: 'Shonen Force',
  magical: 'Magical Sparkle',
  mecha: 'Mecha Titanium',
  isekai: 'Isekai Cheat',
  seinen: 'Seinen Shadow',
};

export const UNIVERSE_BONUS_DESCRIPTIONS: Record<Universe, string> = {
  shonen: 'Pioche 1 carte',
  magical: '+1 Plot Armor',
  mecha: '+1 Bouclier (max 2)',
  isekai: 'Vole la carte défaussée',
  seinen: 'Regarde identité OU 2 cartes',
};

export const UNIVERSE_BONUS_DOUBLED_DESCRIPTIONS: Record<Universe, string> = {
  shonen: 'Pioche 2 cartes',
  magical: '+2 Plot Armor',
  mecha: '+2 Boucliers (max 2)',
  isekai: 'Vole la carte + regarde toute la main',
  seinen: 'Regarde identité ET 2 cartes',
};

// ============================================================
// Dominance cycle — each universe beats 2, loses to 2
// ============================================================
//
//          SHONEN
//         ↙      ↘
//     MECHA       SEINEN
//       ↑    ✦      ↓
//     ISEKAI  ←  MAGICAL
//

export const DOMINANCE: Record<Universe, Universe[]> = {
  shonen: ['seinen', 'magical'],
  seinen: ['magical', 'isekai'],
  magical: ['isekai', 'mecha'],
  isekai: ['mecha', 'shonen'],
  mecha: ['shonen', 'seinen'],
};

export const DOMINANCE_BONUS = 3;

/** Check if universe A dominates universe B */
export function dominates(a: Universe, b: Universe): boolean {
  return DOMINANCE[a].includes(b);
}

// ============================================================
// Cards
// ============================================================

/**
 * Cards per universe (10 cards each):
 * 1(×1), 2(×1), 3(×2), 4(×2), 5(×2), 6(×1), 7(×1) = 10
 * Middle values (3,4,5) are doubled — the vanilla core.
 * 1 and 7 are unique special cards.
 */
export const CARDS_PER_UNIVERSE = [1, 2, 3, 3, 4, 4, 5, 5, 6, 7];
export const TOTAL_CARDS = UNIVERSES.length * CARDS_PER_UNIVERSE.length; // 50


export const STARTING_PLOT_ARMOR = 4;
export const MAX_SHIELDS = 2;
export const STARTING_HAND_SIZE = 5;
export const MIN_UNIVERSES_IN_HAND = 3;
export const ARC_INTERVAL = 3; // every 3 turns
export const TRAIN_DRAW_COUNT = 2;

// ============================================================
// Identities
// ============================================================

export const IDENTITY_TYPES: IdentityType[] = [
  'protagoniste',
  'rival',
  'mentor',
  'traitre',
  'comic_relief',
  'antagoniste',
];

export const IDENTITY_NAMES: Record<IdentityType, string> = {
  protagoniste: 'Le Protagoniste',
  rival: 'Le Rival',
  mentor: 'Le Mentor',
  traitre: 'Le Traître',
  comic_relief: 'Le Comic Relief',
  antagoniste: "L'Antagoniste",
};

export const IDENTITY_OBJECTIVES: Record<IdentityType, string> = {
  protagoniste: 'Être le dernier survivant',
  rival: 'Éliminer le joueur qui te précède dans l\'ordre de jeu',
  mentor: 'Le joueur choisi doit survivre, ou venger son élimination',
  traitre: 'Éliminer 2+ joueurs ET survivre',
  comic_relief: 'Gagner sans avoir bluffé une seule fois',
  antagoniste: 'Infliger des dégâts à tous les autres joueurs',
};

// ============================================================
// Arc Narratifs
// ============================================================

export const ARC_EVENTS: ArcEvent[] = [
  {
    type: 'tournament',
    name: 'Tournament Arc',
    description: 'Chaque joueur DOIT attaquer ce tour.',
  },
  {
    type: 'beach_episode',
    name: 'Beach Episode',
    description: 'Aucune attaque possible. Tout le monde pioche 2 cartes.',
  },
  {
    type: 'trahison',
    name: 'Trahison !',
    description: 'Deux joueurs aléatoires échangent leurs identités secrètes.',
  },
  {
    type: 'final_boss',
    name: 'Final Boss',
    description: 'Un boss (5 PV) apparaît. Coopérez... ou pas.',
  },
  {
    type: 'flashback',
    name: 'Flashback',
    description: 'Un joueur éliminé revient avec 1 PA et 2 cartes.',
  },
  {
    type: 'filler',
    name: 'Filler Episode',
    description: 'Rien ne se passe.',
  },
  {
    type: 'power_up',
    name: 'Power Up',
    description: 'Défaussez 2 cartes pour gagner 1 Plot Armor.',
  },
  {
    type: 'plot_twist',
    name: 'Plot Twist',
    description: 'Toutes les mains sont mélangées et redistribuées.',
  },
];
