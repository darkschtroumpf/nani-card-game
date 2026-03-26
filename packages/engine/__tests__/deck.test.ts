import { describe, it, expect } from 'vitest';
import { createDeck, dealHands, shuffle } from '../src/deck';
import { UNIVERSES, TOTAL_CARDS, MIN_UNIVERSES_IN_HAND } from '../src/constants';
import type { Universe } from '../src/types';

describe('createDeck', () => {
  it('should create exactly 50 cards', () => {
    const deck = createDeck();
    expect(deck.length).toBe(TOTAL_CARDS);
    expect(deck.length).toBe(50);
  });

  it('should have 10 cards per universe', () => {
    const deck = createDeck();
    for (const universe of UNIVERSES) {
      const count = deck.filter((c) => c.universe === universe).length;
      expect(count).toBe(10);
    }
  });

  it('should have unique IDs for all cards', () => {
    const deck = createDeck();
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(50);
  });

  it('should have exactly one 1 and one 7 per universe', () => {
    const deck = createDeck();
    for (const universe of UNIVERSES) {
      const ones = deck.filter((c) => c.universe === universe && c.value === 1);
      const sevens = deck.filter((c) => c.universe === universe && c.value === 7);
      expect(ones.length).toBe(1);
      expect(sevens.length).toBe(1);
    }
  });

  it('should have doubled 3s, 4s and 5s per universe', () => {
    const deck = createDeck();
    for (const universe of UNIVERSES) {
      for (const value of [3, 4, 5]) {
        const count = deck.filter((c) => c.universe === universe && c.value === value).length;
        expect(count).toBe(2);
      }
    }
  });

  it('should have single 2s and 6s per universe', () => {
    const deck = createDeck();
    for (const universe of UNIVERSES) {
      for (const value of [2, 6]) {
        const count = deck.filter((c) => c.universe === universe && c.value === value).length;
        expect(count).toBe(1);
      }
    }
  });
});

describe('shuffle', () => {
  it('should maintain all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle([...arr]);
    expect(shuffled.sort()).toEqual(arr.sort());
  });
});

describe('dealHands', () => {
  it('should deal the correct number of cards per player', () => {
    const deck = createDeck();
    const { hands, remaining } = dealHands(deck, 4, 5);
    expect(hands.length).toBe(4);
    for (const hand of hands) {
      expect(hand.length).toBe(5);
    }
    expect(remaining.length).toBe(30);
  });

  it('should guarantee at least 3 universes per hand', () => {
    const deck = createDeck();
    for (let i = 0; i < 20; i++) {
      const { hands } = dealHands(deck, 4, 5);
      for (const hand of hands) {
        const universes = new Set<Universe>(hand.map((c) => c.universe));
        expect(universes.size).toBeGreaterThanOrEqual(MIN_UNIVERSES_IN_HAND);
      }
    }
  });

  it('should work for 3 to 6 players', () => {
    const deck = createDeck();
    for (let playerCount = 3; playerCount <= 6; playerCount++) {
      const { hands, remaining } = dealHands(deck, playerCount, 5);
      expect(hands.length).toBe(playerCount);
      expect(remaining.length).toBe(50 - playerCount * 5);
    }
  });

  it('should throw if not enough cards', () => {
    const deck = createDeck();
    expect(() => dealHands(deck, 11, 5)).toThrow('Not enough cards');
  });
});
