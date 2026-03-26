import type { GameState, Player } from '../../engine/src/types';

export function serializeGameState(state: GameState): any {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      damagedPlayerIds: Array.from(p.damagedPlayerIds),
    })),
  };
}

export function deserializeGameState(raw: any): GameState {
  return {
    ...raw,
    players: raw.players.map((p: any) => ({
      ...p,
      damagedPlayerIds: new Set<string>(p.damagedPlayerIds || []),
    })),
  };
}
