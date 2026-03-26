import { describe, it, expect } from 'vitest';
import { createGame, processOpening, applyAction, getPlayerView } from '../src/game';
import type { GameConfig } from '../src/types';

function defaultConfig(playerCount = 4): GameConfig {
  return {
    playerCount,
    botCount: 0,
    playerNames: Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`),
  };
}

describe('createGame', () => {
  it('should create a game with the correct number of players', () => {
    const state = createGame(defaultConfig(4));
    expect(state.players.length).toBe(4);
  });

  it('should give each player 5 cards and 4 plot armor', () => {
    const state = createGame(defaultConfig(4));
    for (const player of state.players) {
      expect(player.hand.length).toBe(5);
      expect(player.plotArmor).toBe(4);
      expect(player.shields).toBe(0);
      expect(player.eliminated).toBe(false);
    }
  });

  it('should leave 30 cards in deck for 4 players', () => {
    const state = createGame(defaultConfig(4));
    expect(state.deck.length).toBe(30);
  });

  it('should assign unique identities', () => {
    const state = createGame(defaultConfig(4));
    const types = new Set(state.players.map((p) => p.identity.type));
    expect(types.size).toBe(4);
  });

  it('should start at turn 1, opening phase', () => {
    const state = createGame(defaultConfig(4));
    expect(state.turnNumber).toBe(1);
    expect(state.turnPhase).toBe('opening');
    expect(state.gameOver).toBe(false);
  });
});

describe('processOpening', () => {
  it('should draw 1 card for current player', () => {
    const state = createGame(defaultConfig(4));
    const player = state.players[0];
    const handBefore = player.hand.length;
    processOpening(state);
    expect(player.hand.length).toBe(handBefore + 1);
    expect(state.turnPhase).toBe('action_choice');
  });
});

describe('applyAction — train', () => {
  it('should discard 1 and draw 2', () => {
    const state = createGame(defaultConfig(4));
    processOpening(state);
    const player = state.players[0];
    const handBefore = player.hand.length;

    const events = applyAction(state, { type: 'train', discardIndex: 0 }, player.id);
    // Discard 1 (-1) + draw 2 (+2) = net +1
    expect(player.hand.length).toBe(handBefore + 1);
    expect(state.discard.length).toBe(1);
    expect(events.length).toBeGreaterThan(0);
  });
});

describe('applyAction — attack + defend', () => {
  it('should resolve a complete duel', () => {
    const state = createGame(defaultConfig(4));
    processOpening(state);

    const attacker = state.players[0];
    const defender = state.players[1];

    // Attack
    const attackEvents = applyAction(
      state,
      {
        type: 'attack',
        targetId: defender.id,
        cardIndex: 0,
        declaredUniverse: attacker.hand[0].universe,
      },
      attacker.id,
    );
    expect(state.turnPhase).toBe('duel_response');
    expect(state.pendingDuel).not.toBeNull();

    // Defend
    const defendEvents = applyAction(
      state,
      { type: 'defend', cardIndex: 0 },
      defender.id,
    );
    expect(state.pendingDuel).toBeNull();
    expect(defendEvents.length).toBeGreaterThan(0);
  });
});

describe('applyAction — spy', () => {
  it('should allow spying on another player', () => {
    const state = createGame(defaultConfig(4));
    processOpening(state);

    const player = state.players[0];
    const target = state.players[1];

    const events = applyAction(state, { type: 'spy', targetId: target.id }, player.id);
    expect(events[0]).toContain('espionne');
  });
});

describe('getPlayerView', () => {
  it('should hide other players hands', () => {
    const state = createGame(defaultConfig(4));
    const view = getPlayerView(state, state.players[0].id);

    expect(view.myPlayer.hand.length).toBe(5);
    for (const other of view.otherPlayers) {
      expect(other.cardCount).toBe(5);
      expect((other as any).hand).toBeUndefined();
    }
  });

  it('should hide unrevealed identities', () => {
    const state = createGame(defaultConfig(4));
    const view = getPlayerView(state, state.players[0].id);

    for (const other of view.otherPlayers) {
      expect(other.identityType).toBeNull();
    }
  });
});

describe('identity objectives', () => {
  it('antagoniste wins after damaging all others', () => {
    const state = createGame(defaultConfig(3));
    const p0 = state.players[0];
    p0.identity = { type: 'antagoniste' };

    // Simulate damaging both other players
    p0.damagedPlayerIds.add(state.players[1].id);
    p0.damagedPlayerIds.add(state.players[2].id);

    const events = applyAction(state, { type: 'claim_victory' }, p0.id);
    expect(state.gameOver).toBe(true);
    expect(state.winner).toBe(p0.id);
  });
});
