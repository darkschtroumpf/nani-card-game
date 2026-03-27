// Serialization for DojoGameState — handles any non-JSON-safe types
// Currently DojoGameState is fully JSON-safe (no Set/Map), but we keep
// this layer for safety and future-proofing.

import type { DojoGameState } from '../../engine/src/dojo/types';

export function serializeDojoState(state: DojoGameState): any {
  return JSON.parse(JSON.stringify(state));
}

export function deserializeDojoState(raw: any): DojoGameState {
  return raw as DojoGameState;
}

// Legacy: old game serialization (kept for compatibility)
import type { GameState } from '../../engine/src/types';

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
