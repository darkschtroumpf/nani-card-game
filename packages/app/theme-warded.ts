// ============================================================
// The Warded Man: Sharak Ka — Theme
// ============================================================

export const warded = {
  // Base
  bg: '#0a0a0f',
  bgLight: '#141420',
  bgCard: '#1a1a2a',
  bgWarm: '#1c1410',

  // Text
  text: '#e8e0d4',
  textDim: '#8a7e6e',
  textDark: '#5a4e3e',

  // Wards
  wardFire: '#ff6b2b',
  wardStone: '#8b7355',
  wardWind: '#5ec4d4',
  wardLight: '#ffd740',
  wardBone: '#d4c4a8',

  // Demons
  demonFlame: '#ff4444',
  demonWood: '#4a8c3f',
  demonWind: '#7ecfcf',
  demonWater: '#3a7bd5',
  demonRock: '#6b5b4b',
  demonMind: '#9b30ff',

  // Resources
  wood: '#8b6914',
  ink: '#4a6fa5',
  food: '#6aaa3a',

  // Status
  danger: '#dc3545',
  warning: '#ff9800',
  success: '#4caf50',
  accent: '#ffd740',

  // Phase
  dayBg: '#1a1812',
  nightBg: '#080810',
  daySky: '#c4956a',
  nightSky: '#1a1a3a',

  // UI
  border: '#2a2a3a',
  highlight: '#ffd74033',
} as const;

export const wardedFonts = {
  xs: 9,
  sm: 11,
  md: 13,
  lg: 16,
  xl: 22,
  xxl: 28,
  title: 36,
} as const;

// Ward symbols (Unicode runes / geometric shapes)
export const WARD_SYMBOLS: Record<string, string> = {
  fire: '🔥',
  stone: '🪨',
  wind: '💨',
  light: '✨',
  bone: '💀',
};

// Demon symbols
export const DEMON_SYMBOLS: Record<string, string> = {
  flame: '🔥',
  wood: '🌿',
  wind: '💨',
  water: '🌊',
  rock: '🪨',
  mind: '👁',
};

// Hero symbols
export const HERO_SYMBOLS: Record<string, string> = {
  arlen: '⚔',
  jardir: '🗡',
  rojer: '🎵',
  leesha: '⚗',
};

export function wardColor(wardType: string): string {
  const colors: Record<string, string> = {
    fire: warded.wardFire,
    stone: warded.wardStone,
    wind: warded.wardWind,
    light: warded.wardLight,
    bone: warded.wardBone,
  };
  return colors[wardType] ?? warded.textDim;
}

export function demonColor(demonType: string): string {
  const colors: Record<string, string> = {
    flame: warded.demonFlame,
    wood: warded.demonWood,
    wind: warded.demonWind,
    water: warded.demonWater,
    rock: warded.demonRock,
    mind: warded.demonMind,
  };
  return colors[demonType] ?? warded.danger;
}

export function resourceColor(res: string): string {
  const colors: Record<string, string> = {
    wood: warded.wood,
    ink: warded.ink,
    food: warded.food,
  };
  return colors[res] ?? warded.textDim;
}
