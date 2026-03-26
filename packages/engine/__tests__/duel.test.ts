import { describe, it, expect } from 'vitest';
import { resolveDuel } from '../src/duel';
import type { Card } from '../src/types';
import { DOMINANCE_BONUS } from '../src/constants';

function card(universe: Card['universe'], value: number): Card {
  return { id: `${universe}-${value}`, universe, value };
}

describe('resolveDuel', () => {
  describe('basic combat', () => {
    it('higher value wins in same universe', () => {
      const result = resolveDuel(card('shonen', 5), card('shonen', 3), 'a', 'b');
      expect(result.winnerId).toBe('a');
      expect(result.loserId).toBe('b');
      expect(result.tie).toBe(false);
    });

    it('equal values in same universe is a tie', () => {
      const result = resolveDuel(card('shonen', 4), card('shonen', 4), 'a', 'b');
      expect(result.tie).toBe(true);
      expect(result.winnerId).toBeNull();
      expect(result.loserId).toBeNull();
    });
  });

  describe('dominance', () => {
    it('shonen dominates seinen (+3 bonus)', () => {
      const result = resolveDuel(card('shonen', 3), card('seinen', 5), 'a', 'b');
      // shonen 3 + 3 = 6 vs seinen 5
      expect(result.attackerTotal).toBe(3 + DOMINANCE_BONUS);
      expect(result.defenderTotal).toBe(5);
      expect(result.winnerId).toBe('a');
      expect(result.dominanceBonus).toBe('attacker');
    });

    it('shonen dominates magical', () => {
      const result = resolveDuel(card('shonen', 2), card('magical', 4), 'a', 'b');
      // shonen 2 + 3 = 5 vs magical 4
      expect(result.winnerId).toBe('a');
    });

    it('isekai dominates shonen', () => {
      const result = resolveDuel(card('shonen', 5), card('isekai', 3), 'a', 'b');
      // shonen 5 vs isekai 3 + 3 = 6
      expect(result.winnerId).toBe('b');
      expect(result.dominanceBonus).toBe('defender');
    });

    it('mecha dominates shonen', () => {
      const result = resolveDuel(card('mecha', 2), card('shonen', 4), 'a', 'b');
      // mecha 2 + 3 = 5 vs shonen 4
      expect(result.winnerId).toBe('a');
    });

    it('seinen dominates magical', () => {
      const result = resolveDuel(card('seinen', 3), card('magical', 5), 'a', 'b');
      // seinen 3 + 3 = 6 vs magical 5
      expect(result.winnerId).toBe('a');
    });

    it('magical dominates isekai', () => {
      const result = resolveDuel(card('magical', 2), card('isekai', 4), 'a', 'b');
      expect(result.winnerId).toBe('a');
    });

    it('magical dominates mecha', () => {
      const result = resolveDuel(card('magical', 3), card('mecha', 5), 'a', 'b');
      // magical 3 + 3 = 6 vs mecha 5
      expect(result.winnerId).toBe('a');
    });

    it('dominance can still lose if value gap is too large', () => {
      const result = resolveDuel(card('shonen', 2), card('seinen', 6), 'a', 'b');
      // shonen 2 + 3 = 5 vs seinen 6
      expect(result.winnerId).toBe('b');
    });
  });

  describe('outsider rule (1 beats 7)', () => {
    it('1 beats 7 regardless of universe', () => {
      const result = resolveDuel(card('shonen', 1), card('seinen', 7), 'a', 'b');
      expect(result.winnerId).toBe('a');
      expect(result.outsiderVictory).toBe(true);
    });

    it('7 beats 1 — wait, no: 1 ALWAYS beats 7', () => {
      const result = resolveDuel(card('mecha', 7), card('isekai', 1), 'a', 'b');
      expect(result.winnerId).toBe('b');
      expect(result.outsiderVictory).toBe(true);
    });

    it('1 beats 7 even when dominated', () => {
      // isekai dominates shonen, but 1 still beats 7
      const result = resolveDuel(card('shonen', 1), card('isekai', 7), 'a', 'b');
      expect(result.winnerId).toBe('a');
      expect(result.outsiderVictory).toBe(true);
    });

    it('1 vs non-7 loses normally', () => {
      const result = resolveDuel(card('shonen', 1), card('shonen', 3), 'a', 'b');
      expect(result.winnerId).toBe('b');
      expect(result.outsiderVictory).toBe(false);
    });
  });

  describe('bonus tracking', () => {
    it('winner with value 7 has doubled bonus', () => {
      const result = resolveDuel(card('magical', 7), card('magical', 3), 'a', 'b');
      expect(result.winnerId).toBe('a');
      expect(result.bonusApplied.type).toBe('magical');
      expect(result.bonusApplied.doubled).toBe(true);
    });

    it('winner with non-7 has normal bonus', () => {
      const result = resolveDuel(card('shonen', 5), card('shonen', 3), 'a', 'b');
      expect(result.bonusApplied.doubled).toBe(false);
    });
  });
});
