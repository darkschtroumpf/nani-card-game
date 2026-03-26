import type { Player, GameState, IdentityType, Identity } from './types';
import { IDENTITY_TYPES } from './constants';
import { shuffle } from './deck';

/** Deal random identities to players */
export function dealIdentities(playerCount: number): Identity[] {
  const available = shuffle([...IDENTITY_TYPES]).slice(0, playerCount);
  return available.map((type) => ({ type }));
}

/**
 * Check if a player has fulfilled their secret objective.
 * Returns true if the player can claim victory.
 */
export function checkObjective(state: GameState, player: Player): boolean {
  const alivePlayers = state.players.filter((p) => !p.eliminated);

  switch (player.identity.type) {
    case 'protagoniste':
      // Be the last survivor
      return alivePlayers.length === 1 && alivePlayers[0].id === player.id;

    case 'rival': {
      // Eliminate the player who precedes you in play order
      const myIndex = state.players.findIndex((p) => p.id === player.id);
      let targetIndex = myIndex - 1;
      if (targetIndex < 0) targetIndex = state.players.length - 1;
      const target = state.players[targetIndex];
      return target.eliminated && player.eliminatedPlayerIds.includes(target.id);
    }

    case 'mentor': {
      // Protected player must survive, OR mentor must have avenged them
      const protectedId = player.identity.protectedPlayerId;
      if (!protectedId) return false;
      const protectedPlayer = state.players.find((p) => p.id === protectedId);
      if (!protectedPlayer) return false;

      if (!protectedPlayer.eliminated) {
        // Protected player is alive — check at end of game
        return alivePlayers.length === 1 || state.gameOver;
      }

      // Protected player is dead — mentor must have eliminated their killer
      const killerId = state.players.find(
        (p) => p.eliminatedPlayerIds.includes(protectedId),
      )?.id;
      return killerId ? player.eliminatedPlayerIds.includes(killerId) : false;
    }

    case 'traitre':
      // Eliminate 2+ players AND survive
      return player.eliminatedPlayerIds.length >= 2 && !player.eliminated;

    case 'comic_relief':
      // Win without ever bluffing
      return !player.hasBluffed && !player.eliminated && alivePlayers.length === 1;

    case 'antagoniste': {
      // Deal damage to ALL other players at least once
      const otherPlayers = state.players.filter((p) => p.id !== player.id);
      return otherPlayers.every((p) => player.damagedPlayerIds.has(p.id));
    }

    default:
      return false;
  }
}

/** Get all players who can claim victory right now */
export function getVictoryCandidates(state: GameState): Player[] {
  return state.players.filter((p) => !p.eliminated && checkObjective(state, p));
}
