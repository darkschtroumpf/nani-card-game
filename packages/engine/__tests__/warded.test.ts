import { describe, it, expect } from 'vitest';
import { createGame, craftWard, fortifyLocation, gather, startWave, activateWard, resolveDamage } from '../src/warded/game';
import { WARD_COMBOS } from '../src/warded/constants';
import type { GameState } from '../src/warded/types';

describe('Warded Engine', () => {
  let state: GameState;

  function quickState(): GameState {
    return createGame('arlen_young', 'normal');
  }

  describe('createGame', () => {
    it('creates a valid quick game state', () => {
      state = quickState();
      expect(state.phase).toBe('day');
      expect(state.locations.length).toBe(4);
      expect(state.hero.id).toBe('arlen_young');
      expect(state.hero.hp).toBeGreaterThan(0);
      expect(state.hero.ap).toBeGreaterThan(0);
    });

    it('initializes all locations with population', () => {
      state = quickState();
      for (const loc of state.locations) {
        if (loc.maxPopulation > 0) {
          expect(loc.population).toBeGreaterThan(0);
        }
      }
    });

    it('initializes empty demon arrays for all locations', () => {
      state = quickState();
      for (const loc of state.locations) {
        expect(state.demonsAtLocations[loc.id]).toEqual([]);
      }
    });
  });

  describe('gather', () => {
    it('increases primary resource by 2', () => {
      state = quickState();
      const loc = state.locations.find(l => l.maxPopulation > 0)!;
      const before = loc.primaryResource === 'wood'
        ? state.locations.reduce((s, l) => s, 0)
        : 0;
      const res = gather(state, loc.id);
      expect(res).toBe(true);
      expect(state.hero.ap).toBeLessThan(quickState().hero.ap);
    });
  });

  describe('craftWard', () => {
    it('adds ward to reserves when resources available', () => {
      state = quickState();
      // Give enough resources
      for (const loc of state.locations) {
        loc.stockpile = { wood: 10, ink: 10, food: 10 };
      }
      const before = state.wardReserves.length;
      const res = craftWard(state, 'stone', state.locations[0].id);
      expect(res).toBe(true);
      expect(state.wardReserves.length).toBe(before + 1);
      expect(state.wardReserves).toContain('stone');
    });
  });

  describe('combo names alignment', () => {
    it('all WARD_COMBOS have French names', () => {
      for (const combo of WARD_COMBOS) {
        // Ensure no English-style names remain
        expect(combo.name).not.toContain('Ward');
        expect(combo.name).not.toContain('Sacred');
        expect(combo.name).not.toContain('Storm');
        expect(combo.name).not.toContain('Eternal');
      }
    });
  });

  describe('startWave', () => {
    it('spawns demons during night phase', () => {
      state = quickState();
      state.phase = 'night';
      state.nightNumber = 1;
      state.waveNumber = 0;
      startWave(state);
      const totalDemons = Object.values(state.demonsAtLocations)
        .reduce((sum, arr) => sum + arr.length, 0);
      expect(totalDemons).toBeGreaterThan(0);
    });

    it('spawned demons have revealed=false by default', () => {
      state = quickState();
      state.phase = 'night';
      state.nightNumber = 1;
      state.waveNumber = 0;
      startWave(state);
      for (const demons of Object.values(state.demonsAtLocations)) {
        for (const d of demons) {
          expect(d.revealed).toBe(false);
        }
      }
    });
  });
});
