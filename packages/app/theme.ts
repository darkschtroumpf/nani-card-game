export const colors = {
  bg: '#1a1a2e',
  bgLight: '#16213e',
  bgCard: '#0f3460',
  primary: '#e94560',
  secondary: '#533483',
  accent: '#ffd700',
  text: '#ffffff',
  textDim: '#a0a0b0',
  textDark: '#6b6b80',

  // Universe colors
  shonen: '#ff6b35',
  magical: '#ff69b4',
  mecha: '#4fc3f7',
  isekai: '#7c4dff',
  seinen: '#78909c',

  // Status
  success: '#4caf50',
  danger: '#f44336',
  warning: '#ff9800',
  shield: '#29b6f6',
  plotArmor: '#ffd700',

  // Card types
  fighter: '#2196f3',
  technique: '#ab47bc',
  trap: '#ef5350',
  equipment: '#ffc107',
  signature: '#ffd700',

  // Resources
  ki: '#42a5f5',
  focus: '#ffab00',
  lp: '#e94560',
} as const;

export const fonts = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    title: 40,
  },
} as const;

export type Universe = 'shonen' | 'magical' | 'mecha' | 'isekai' | 'seinen';

export function universeColor(universe: Universe): string {
  return colors[universe];
}
