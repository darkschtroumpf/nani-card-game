import type { Card, Universe } from './types';
import {
  UNIVERSES,
  CARDS_PER_UNIVERSE,
  STARTING_HAND_SIZE,
  MIN_UNIVERSES_IN_HAND,
} from './constants';

/** Create the full 50-card deck */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const universe of UNIVERSES) {
    const valueCounts = new Map<number, number>();
    for (const value of CARDS_PER_UNIVERSE) {
      const count = (valueCounts.get(value) ?? 0) + 1;
      valueCounts.set(value, count);
      const suffix = count > 1 ? `-${String.fromCharCode(96 + count)}` : '';
      deck.push({
        id: `${universe}-${value}${suffix}`,
        universe,
        value,
      });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle (mutates array) */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Count distinct universes in a set of cards */
function countUniverses(cards: Card[]): number {
  const universes = new Set<Universe>();
  for (const card of cards) {
    universes.add(card.universe);
  }
  return universes.size;
}

/**
 * Deal cards to players, guaranteeing each hand has at least
 * MIN_UNIVERSES_IN_HAND different universes.
 *
 * Strategy: shuffle and deal, re-shuffle if any hand fails the constraint.
 * With 50 cards and 5 universes, the constraint is almost always met naturally.
 */
export function dealHands(
  deck: Card[],
  playerCount: number,
  handSize: number = STARTING_HAND_SIZE,
  maxAttempts: number = 100,
): { hands: Card[][]; remaining: Card[] } {
  const totalNeeded = playerCount * handSize;
  if (totalNeeded > deck.length) {
    throw new Error(
      `Not enough cards: need ${totalNeeded} for ${playerCount} players, deck has ${deck.length}`,
    );
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffle([...deck]);
    const hands: Card[][] = [];
    let valid = true;

    for (let i = 0; i < playerCount; i++) {
      const hand = shuffled.slice(i * handSize, (i + 1) * handSize);
      if (countUniverses(hand) < MIN_UNIVERSES_IN_HAND) {
        valid = false;
        break;
      }
      hands.push(hand);
    }

    if (valid) {
      const remaining = shuffled.slice(totalNeeded);
      return { hands, remaining };
    }
  }

  // Fallback: just deal whatever we have (extremely unlikely to reach here)
  const shuffled = shuffle([...deck]);
  const hands: Card[][] = [];
  for (let i = 0; i < playerCount; i++) {
    hands.push(shuffled.slice(i * handSize, (i + 1) * handSize));
  }
  return { hands, remaining: shuffled.slice(totalNeeded) };
}

/** Draw cards from the deck (mutates deck) */
export function drawCards(deck: Card[], count: number): Card[] {
  return deck.splice(0, Math.min(count, deck.length));
}
