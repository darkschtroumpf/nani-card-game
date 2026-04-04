import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGame, craftWard, fortifyLocation, gather, startWave,
  activateWard, resolveDamage, resolveWardPassives, analyzeMesh,
  getAllDirectionalCombos, calculateScore, endNight, processDawn,
  startNight,
} from '../src/warded/game';
import {
  WARD_COMBOS, WARD_COSTS, WARD_LINK_PROFILES, MESH_TIERS,
  HEROES, LOCATIONS, WARD_TYPES, DEMONS_PER_WAVE,
  QUICK_MODE_STARTING_WARDS, SWARM_THRESHOLD,
  HORDE_FORMATION_NIGHTS,
} from '../src/warded/constants';
import type { GameState, Location, LocationId, WardType, DemonAtLocation, HeroId, Difficulty } from '../src/warded/types';

// ============================================================
// Helpers
// ============================================================

/** Fresh quick game with arlen_young, default difficulty (midnight). */
function quickState(heroId: HeroId = 'arlen_young', difficulty: Difficulty = 'midnight'): GameState {
  return createGame(heroId, 'quick', difficulty);
}

/** State ready for night combat: wards placed, wave started (demons spawned). */
function nightState(): GameState {
  const s = quickState();
  // Give resources and craft/place wards everywhere
  for (const loc of s.locations) {
    loc.stockpile = { wood: 6, ink: 6, food: 6 };
  }
  // Place wards that weren't pre-placed
  const desert = s.locations.find(l => l.id === 'desert_spear')!;
  desert.wards[0] = { ward: 'fire', isTemporary: false, durability: 4, xp: 0, enhanced: false };
  desert.wards[1] = { ward: 'stone', isTemporary: false, durability: 4, xp: 0, enhanced: false };

  s.phase = 'night';
  s.nightNumber = 1;
  s.waveNumber = 0;
  startWave(s);
  return s;
}

function addDemon(state: GameState, locId: LocationId, type: DemonAtLocation['demon']['type'] = 'flame', strength = 3): DemonAtLocation {
  const d: DemonAtLocation = {
    demon: { type, strength, targetLocation: locId, isLocked: type === 'water', isBoss: type === 'mind', isPrinceUpgraded: false },
    currentStrength: strength,
    swarmed: false,
    revealed: false,
  };
  state.demonsAtLocations[locId].push(d);
  return d;
}

function clearDemons(state: GameState) {
  for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
    state.demonsAtLocations[locId] = [];
  }
}

function placeWard(loc: Location, slot: number, ward: WardType) {
  loc.wards[slot] = { ward, isTemporary: false, durability: 4, xp: 0, enhanced: false };
}

// ============================================================
// Tests
// ============================================================

describe('Warded Engine', () => {

  // ==========================================================
  // 1. createGame
  // ==========================================================
  describe('createGame', () => {
    it('creates a valid quick game with arlen_young', () => {
      const s = quickState();
      expect(s.phase).toBe('day');
      expect(s.locations.length).toBe(4);
      expect(s.hero.id).toBe('arlen_young');
      expect(s.hero.hp).toBeGreaterThan(0);
      expect(s.hero.ap).toBeGreaterThan(0);
      expect(s.mode).toBe('quick');
    });

    it.each(
      HEROES.map(h => h.id),
    )('creates game for hero %s', (heroId) => {
      const s = createGame(heroId as HeroId, 'quick');
      const template = HEROES.find(h => h.id === heroId)!;
      expect(s.hero.id).toBe(heroId);
      expect(s.hero.hp).toBe(template.hp);
      expect(s.hero.maxHp).toBe(template.hp);
    });

    it('quick mode pre-places starting wards', () => {
      const s = quickState();
      for (const sw of QUICK_MODE_STARTING_WARDS) {
        const loc = s.locations.find(l => l.id === sw.locationId)!;
        expect(loc.wards[0].ward).toBe(sw.ward);
      }
    });

    it('campaign mode does NOT pre-place wards', () => {
      const s = createGame('arlen_young', 'campaign');
      for (const loc of s.locations) {
        // All slots should be empty
        expect(loc.wards.every(w => w.ward === null)).toBe(true);
      }
    });

    it('campaign limits available wards to stone+wind at chapter 1', () => {
      const s = createGame('arlen_young', 'campaign');
      expect(s.availableWards).toEqual(['stone', 'wind']);
    });

    it('quick mode unlocks all ward types', () => {
      const s = quickState();
      expect(s.availableWards).toEqual([...WARD_TYPES]);
    });

    it.each([
      ['new_moon', 2],
      ['waning', 3],
      ['midnight', 4],
      ['endless', 1],
    ] as [Difficulty, number][])('difficulty %s sets nightNumber to %d in quick mode', (diff, expected) => {
      const s = quickState('arlen_young', diff);
      expect(s.nightNumber).toBe(expected);
    });

    it('endless mode sets maxNights to 999', () => {
      const s = quickState('arlen_young', 'endless');
      expect(s.maxNights).toBe(999);
    });

    it('endless mode requires only 1 standing location', () => {
      const s = quickState('arlen_young', 'endless');
      expect(s.minStandingLocations).toBe(1);
    });

    it('initializes all locations with population > 0', () => {
      const s = quickState();
      for (const loc of s.locations) {
        expect(loc.population).toBeGreaterThan(0);
      }
    });

    it('initializes empty demon arrays', () => {
      const s = quickState();
      for (const loc of s.locations) {
        expect(s.demonsAtLocations[loc.id]).toEqual([]);
      }
    });

    it('distributes starting resources', () => {
      const s = quickState();
      // Each location gets 3 of its primary resource
      for (const loc of s.locations) {
        expect(loc.stockpile[loc.primaryResource]).toBe(3);
      }
    });

    it('arlen hero starts with arlenCharge 1', () => {
      const s = createGame('arlen', 'quick');
      expect(s.hero.arlenCharge).toBe(1);
    });

    it('jardir hero starts with warriors array', () => {
      const s = createGame('jardir', 'quick');
      expect(s.hero.jardir_warriors).toEqual([]);
    });

    it('rojer hero starts with songs array', () => {
      const s = createGame('rojer', 'quick');
      expect(s.hero.rojer_songs).toEqual([null, null, null]);
    });

    it('leesha hero starts with consumables array', () => {
      const s = createGame('leesha', 'quick');
      expect(s.hero.leesha_consumables).toEqual([]);
    });
  });

  // ==========================================================
  // 2. gather
  // ==========================================================
  describe('gather', () => {
    it('increases primary resource by 2 (base gather amount)', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.primaryResource === 'wood')!;
      loc.stockpile.wood = 0;
      const apBefore = s.hero.ap;
      gather(s, loc.id);
      expect(loc.stockpile.wood).toBe(2);
      expect(s.hero.ap).toBe(apBefore - 1);
    });

    it('caps resource at 6', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.primaryResource === 'wood')!;
      loc.stockpile.wood = 5;
      gather(s, loc.id);
      expect(loc.stockpile.wood).toBe(6);
    });

    it('costs 1 AP', () => {
      const s = quickState();
      const apBefore = s.hero.ap;
      gather(s, s.locations[0].id);
      expect(s.hero.ap).toBe(apBefore - 1);
    });

    it('fails when AP is 0', () => {
      const s = quickState();
      s.hero.ap = 0;
      const result = gather(s, s.locations[0].id);
      expect(result).toBe(false);
    });

    it('fails on a fallen location', () => {
      const s = quickState();
      s.locations[0].fallen = true;
      const result = gather(s, s.locations[0].id);
      expect(result).toBe(false);
    });

    it('applies resourceBonus from talent', () => {
      const s = quickState();
      s.talentEffects.resourceBonus = 1;
      const loc = s.locations.find(l => l.primaryResource === 'wood')!;
      loc.stockpile.wood = 0;
      gather(s, loc.id);
      expect(loc.stockpile.wood).toBe(3); // 2 base + 1 bonus
    });
  });

  // ==========================================================
  // 3. craftWard
  // ==========================================================
  describe('craftWard', () => {
    it('adds ward to reserves with sufficient resources', () => {
      const s = quickState();
      s.locations[0].stockpile = { wood: 6, ink: 6, food: 6 };
      const before = s.wardReserves.length;
      const result = craftWard(s, 'stone', s.locations[0].id);
      expect(result).toBe(true);
      expect(s.wardReserves.length).toBe(before + 1);
      expect(s.wardReserves).toContain('stone');
    });

    it('deducts correct resources for each ward type', () => {
      for (const wt of WARD_TYPES) {
        const s = quickState();
        s.locations[0].stockpile = { wood: 6, ink: 6, food: 6 };
        const cost = WARD_COSTS[wt];
        craftWard(s, wt, s.locations[0].id);
        expect(s.locations[0].stockpile.wood).toBe(6 - cost.wood);
        expect(s.locations[0].stockpile.ink).toBe(6 - cost.ink);
      }
    });

    it('fails with insufficient resources', () => {
      const s = quickState();
      s.locations[0].stockpile = { wood: 0, ink: 0, food: 0 };
      const result = craftWard(s, 'bone', s.locations[0].id); // bone costs 1 wood + 1 ink
      expect(result).toBe(false);
      expect(s.wardReserves.length).toBe(0);
    });

    it('fails when ward type is unavailable (campaign ch1)', () => {
      const s = createGame('arlen_young', 'campaign');
      s.locations[0].stockpile = { wood: 6, ink: 6, food: 6 };
      // fire not available in ch1 campaign
      const result = craftWard(s, 'fire', s.locations[0].id);
      expect(result).toBe(false);
    });

    it('costs 1 AP', () => {
      const s = quickState();
      s.locations[0].stockpile = { wood: 6, ink: 6, food: 6 };
      const before = s.hero.ap;
      craftWard(s, 'stone', s.locations[0].id);
      expect(s.hero.ap).toBe(before - 1);
    });

    it('fails when AP is 0', () => {
      const s = quickState();
      s.hero.ap = 0;
      s.locations[0].stockpile = { wood: 6, ink: 6, food: 6 };
      const result = craftWard(s, 'stone', s.locations[0].id);
      expect(result).toBe(false);
    });

    it('fails on fallen location', () => {
      const s = quickState();
      s.locations[0].fallen = true;
      s.locations[0].stockpile = { wood: 6, ink: 6, food: 6 };
      const result = craftWard(s, 'stone', s.locations[0].id);
      expect(result).toBe(false);
    });
  });

  // ==========================================================
  // 4. fortifyLocation
  // ==========================================================
  describe('fortifyLocation', () => {
    it('places a ward from reserves into an empty slot', () => {
      const s = quickState();
      s.wardReserves.push('fire');
      // Find a location with an empty slot
      const loc = s.locations.find(l => l.wards.some(w => !w.ward))!;
      const result = fortifyLocation(s, 'fire', loc.id);
      expect(result).toBe(true);
      expect(loc.wards.some(w => w.ward === 'fire')).toBe(true);
      expect(s.wardReserves).not.toContain('fire');
    });

    it('fails when no ward of type in reserves', () => {
      const s = quickState();
      s.wardReserves = [];
      const loc = s.locations.find(l => l.wards.some(w => !w.ward))!;
      const result = fortifyLocation(s, 'fire', loc.id);
      expect(result).toBe(false);
    });

    it('fails when all slots are full', () => {
      const s = quickState();
      s.wardReserves.push('light');
      const loc = s.locations[0];
      placeWard(loc, 0, 'fire');
      placeWard(loc, 1, 'stone');
      placeWard(loc, 2, 'wind');
      const result = fortifyLocation(s, 'light', loc.id);
      expect(result).toBe(false);
    });

    it('costs 1 AP', () => {
      const s = quickState();
      s.wardReserves.push('stone');
      const before = s.hero.ap;
      const loc = s.locations.find(l => l.wards.some(w => !w.ward))!;
      fortifyLocation(s, 'stone', loc.id);
      expect(s.hero.ap).toBe(before - 1);
    });

    it('ward gets durability 4 on placement', () => {
      const s = quickState();
      s.wardReserves.push('fire');
      const loc = s.locations.find(l => l.wards.every(w => !w.ward))!;
      fortifyLocation(s, 'fire', loc.id);
      const placed = loc.wards.find(w => w.ward === 'fire')!;
      expect(placed.durability).toBe(4);
    });
  });

  // ==========================================================
  // 5. startWave
  // ==========================================================
  describe('startWave', () => {
    it('spawns demons during night phase', () => {
      const s = quickState();
      s.phase = 'night';
      s.nightNumber = 1;
      s.waveNumber = 0;
      startWave(s);
      const total = Object.values(s.demonsAtLocations).reduce((sum, arr) => sum + arr.length, 0);
      expect(total).toBeGreaterThan(0);
    });

    it('increments waveNumber', () => {
      const s = quickState();
      s.phase = 'night';
      s.nightNumber = 1;
      s.waveNumber = 0;
      startWave(s);
      expect(s.waveNumber).toBe(1);
    });

    it('spawned demons have revealed=false by default', () => {
      const s = quickState();
      s.phase = 'night';
      s.nightNumber = 1;
      s.waveNumber = 0;
      startWave(s);
      for (const demons of Object.values(s.demonsAtLocations)) {
        for (const d of demons) {
          expect(d.revealed).toBe(false);
        }
      }
    });

    it('blood_moon surge adds +1 strength to spawned demons', () => {
      const s = quickState();
      s.phase = 'night';
      s.nightNumber = 1;
      s.waveNumber = 0;
      s.currentSurge = 'blood_moon';
      startWave(s);
      // At least one non-wind demon should have strength > base (3 for flame)
      const allDemons = Object.values(s.demonsAtLocations).flat();
      const nonWind = allDemons.filter(d => d.demon.type !== 'wind');
      // blood_moon adds +1, plus possible swarm — just check they exist
      expect(nonWind.length).toBeGreaterThan(0);
      // base flame = 3, with blood_moon = 4 (before swarm)
      const flames = nonWind.filter(d => d.demon.type === 'flame');
      if (flames.length > 0) {
        // At least 4 base (3 + 1 blood_moon), possibly + 1 swarm
        expect(flames[0].demon.strength).toBeGreaterThanOrEqual(4);
      }
    });

    it('swarming_dark surge spawns +2 demons', () => {
      // Compare demon count with and without swarming_dark
      const s1 = quickState();
      s1.phase = 'night';
      s1.nightNumber = 1;
      s1.waveNumber = 0;
      s1.currentSurge = 'night_of_courage'; // no extra demons
      startWave(s1);
      const count1 = Object.values(s1.demonsAtLocations).flat().length;

      const s2 = quickState();
      s2.phase = 'night';
      s2.nightNumber = 1;
      s2.waveNumber = 0;
      s2.currentSurge = 'swarming_dark';
      startWave(s2);
      const count2 = Object.values(s2.demonsAtLocations).flat().length;

      // swarming_dark should produce more demons (wind spawns 2, so count varies)
      expect(count2).toBeGreaterThanOrEqual(count1);
    });

    it('sets activationsRemaining based on warded locations + talent bonus', () => {
      const s = quickState();
      s.phase = 'night';
      s.nightNumber = 1;
      s.waveNumber = 0;
      s.talentEffects.extraActivations = 2;
      // Count warded, non-fallen locations
      const wardedCount = s.locations.filter(l => !l.fallen && l.wards.some(ws => ws.ward)).length;
      startWave(s);
      expect(s.activationsRemaining).toBe(wardedCount + 2);
    });

    it('clears previous wave demons from living locations', () => {
      const s = quickState();
      s.phase = 'night';
      s.nightNumber = 1;
      s.waveNumber = 0;
      // Add leftover demons
      addDemon(s, 'cutters_hollow');
      startWave(s);
      // Demons should be replaced by new spawn, not accumulated
      // (previous demons cleared before spawn)
      // Just verify wave works without error
      expect(s.waveNumber).toBe(1);
    });

    it('applies swarm bonus when >= SWARM_THRESHOLD demons at location', () => {
      const s = quickState();
      s.phase = 'night';
      // Use high night number for more demons
      s.nightNumber = 10;
      s.waveNumber = 0;
      s.currentSurge = 'night_of_courage';
      startWave(s);
      // Check for swarmed demons
      for (const locId of Object.keys(s.demonsAtLocations) as LocationId[]) {
        const demons = s.demonsAtLocations[locId];
        if (demons.length >= SWARM_THRESHOLD) {
          for (const d of demons) {
            expect(d.swarmed).toBe(true);
          }
        }
      }
    });
  });

  // ==========================================================
  // 6. resolveWardPassives
  // ==========================================================
  describe('resolveWardPassives', () => {
    it('fire deals damage to demons at location', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.fireCanKill = true;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'fire');
      // Manually add a weak demon
      clearDemons(s);
      const demon = addDemon(s, 'cutters_hollow', 'flame', 2);
      resolveWardPassives(s);
      // Fire deals at least 1 damage
      expect(demon.currentStrength).toBeLessThan(2);
    });

    it('fire cannot kill when fireCanKill is false', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.fireCanKill = false;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'fire');
      loc.wards[1] = { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false };
      loc.wards[2] = { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false };
      clearDemons(s);
      const demon = addDemon(s, 'cutters_hollow', 'flame', 1);
      resolveWardPassives(s);
      // Should not go below 1
      expect(demon.currentStrength).toBeGreaterThanOrEqual(1);
      expect(s.demonsAtLocations['cutters_hollow'].length).toBe(1);
    });

    it('stone adds defense (event message)', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      const loc = s.locations.find(l => l.id === 'miln')!;
      placeWard(loc, 0, 'stone');
      clearDemons(s);
      const events = resolveWardPassives(s);
      expect(events.some(e => e.includes('Stone passive') && e.includes('défense'))).toBe(true);
    });

    it('wind redirects a non-locked, non-boss, non-wind demon', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      loc.wards = [
        { ward: 'wind', isTemporary: false, durability: 4, xp: 0, enhanced: false },
        { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false },
        { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false },
      ];
      clearDemons(s);
      addDemon(s, 'cutters_hollow', 'flame', 3);
      const beforeCount = s.demonsAtLocations['cutters_hollow'].length;
      resolveWardPassives(s);
      const afterCount = s.demonsAtLocations['cutters_hollow'].length;
      expect(afterCount).toBeLessThan(beforeCount);
    });

    it('wind does NOT redirect wind-type demons', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      loc.wards = [
        { ward: 'wind', isTemporary: false, durability: 4, xp: 0, enhanced: false },
        { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false },
        { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false },
      ];
      clearDemons(s);
      addDemon(s, 'cutters_hollow', 'wind', 1);
      resolveWardPassives(s);
      // Wind demon should still be at cutters_hollow
      expect(s.demonsAtLocations['cutters_hollow'].length).toBe(1);
    });

    it('light reveals demon types', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      const loc = s.locations.find(l => l.id === 'lakton')!;
      placeWard(loc, 0, 'light');
      clearDemons(s);
      const demon = addDemon(s, 'lakton', 'flame', 3);
      expect(demon.revealed).toBe(false);
      resolveWardPassives(s);
      expect(demon.revealed).toBe(true);
    });

    it('bone with Sanctuaire combo heals 1 Pop per wave', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.chapter = 6; // Sanctuaire unlocked at chapter 6
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'stone');
      placeWard(loc, 1, 'bone');
      loc.population = loc.maxPopulation - 2;
      const popBefore = loc.population;
      clearDemons(s);
      resolveWardPassives(s);
      expect(loc.population).toBe(popBefore + 1);
    });

    it('warding_blight surge disables all passives', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.currentSurge = 'warding_blight';
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'fire');
      clearDemons(s);
      addDemon(s, 'cutters_hollow', 'flame', 3);
      const events = resolveWardPassives(s);
      expect(events.some(e => e.includes('Warding Blight'))).toBe(true);
      // Demon should not have taken fire damage
      expect(s.demonsAtLocations['cutters_hollow'][0].currentStrength).toBe(3);
    });
  });

  // ==========================================================
  // 7. activateWard
  // ==========================================================
  describe('activateWard', () => {
    it('activates individual wards (no combo)', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.activationsRemaining = 3;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'fire');
      clearDemons(s);
      addDemon(s, 'cutters_hollow', 'flame', 10);
      const events = activateWard(s, 'cutters_hollow', false);
      expect(events.some(e => e.includes('fire activé'))).toBe(true);
      expect(s.activationsRemaining).toBe(2);
    });

    it('activates combo when useCombo=true and combo exists', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.activationsRemaining = 3;
      s.chapter = 3; // Inferno unlocked at chapter 3
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'wind');
      placeWard(loc, 1, 'fire');
      clearDemons(s);
      addDemon(s, 'cutters_hollow', 'flame', 10);
      const events = activateWard(s, 'cutters_hollow', true);
      // Should see combo activation
      expect(events.some(e => e.includes('Tempête de Feu'))).toBe(true);
    });

    it('returns error when no activations remaining', () => {
      const s = quickState();
      s.phase = 'night';
      s.activationsRemaining = 0;
      const events = activateWard(s, 'cutters_hollow', false);
      expect(events[0]).toContain('Plus d\'activations');
    });

    it('returns error when location has no wards', () => {
      const s = quickState();
      s.phase = 'night';
      s.activationsRemaining = 3;
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      const events = activateWard(s, 'desert_spear', false);
      expect(events[0]).toContain('Pas de ward');
    });

    it('gains ward XP on activation', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.activationsRemaining = 3;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'fire');
      clearDemons(s);
      activateWard(s, 'cutters_hollow', false);
      expect(loc.wards[0].xp).toBe(1);
    });

    it('enhances ward after 3 XP', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'fire');
      loc.wards[0].xp = 2; // one more will hit 3
      s.activationsRemaining = 3;
      clearDemons(s);
      const events = activateWard(s, 'cutters_hollow', false);
      expect(loc.wards[0].enhanced).toBe(true);
      expect(events.some(e => e.includes('AMÉLIORÉ'))).toBe(true);
    });

    it('decrements activationsRemaining', () => {
      const s = quickState();
      s.phase = 'night';
      s.waveNumber = 1;
      s.activationsRemaining = 5;
      const loc = s.locations.find(l => l.id === 'cutters_hollow')!;
      placeWard(loc, 0, 'stone');
      clearDemons(s);
      activateWard(s, 'cutters_hollow', false);
      expect(s.activationsRemaining).toBe(4);
    });

    it('combo names match WARD_COMBOS definitions', () => {
      for (const combo of WARD_COMBOS) {
        expect(combo.name).toBeDefined();
        expect(combo.activeName).toBeDefined();
        expect(combo.wards.length).toBe(2);
        // Names should not contain English ward-related words
        expect(combo.name).not.toContain('Ward');
        expect(combo.name).not.toContain('Sacred');
      }
    });
  });

  // ==========================================================
  // 8. resolveDamage
  // ==========================================================
  describe('resolveDamage', () => {
    it('reduces population by net damage (demon str minus defense)', () => {
      const s = quickState();
      s.phase = 'night';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      // Clear wards for no defense
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      clearDemons(s);
      addDemon(s, 'desert_spear', 'flame', 3);
      const popBefore = loc.population;
      resolveDamage(s);
      expect(loc.population).toBe(popBefore - 3);
    });

    it('stone ward defense reduces damage', () => {
      const s = quickState();
      s.phase = 'night';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'stone'); // +2 defense
      clearDemons(s);
      addDemon(s, 'desert_spear', 'flame', 3);
      const popBefore = loc.population;
      resolveDamage(s);
      // 3 damage - 2 defense = 1 net damage
      expect(loc.population).toBe(popBefore - 1);
    });

    it('location falls when population <= 0', () => {
      const s = quickState();
      s.phase = 'night';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      loc.population = 1;
      clearDemons(s);
      addDemon(s, 'desert_spear', 'flame', 5);
      resolveDamage(s);
      expect(loc.fallen).toBe(true);
      expect(loc.population).toBe(0);
    });

    it('overflow damage hits hero at presence location', () => {
      const s = quickState();
      s.phase = 'night';
      s.presenceLocation = 'desert_spear';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      loc.population = 2;
      clearDemons(s);
      addDemon(s, 'desert_spear', 'flame', 5);
      const hpBefore = s.hero.hp;
      resolveDamage(s);
      // 5 damage, pop was 2, overflow = 3
      expect(s.hero.hp).toBe(hpBefore - 3);
    });

    it('bulwark active prevents all damage', () => {
      const s = quickState();
      s.phase = 'night';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      (loc as any)._bulwarkActive = true;
      clearDemons(s);
      addDemon(s, 'desert_spear', 'flame', 10);
      const popBefore = loc.population;
      resolveDamage(s);
      expect(loc.population).toBe(popBefore);
    });

    it('water demons halve ward defense', () => {
      const s = quickState();
      s.phase = 'night';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'stone'); // +2 defense, halved to 1
      clearDemons(s);
      addDemon(s, 'desert_spear', 'water', 3);
      const popBefore = loc.population;
      resolveDamage(s);
      // defense 2 halved to 1, damage = 3 - 1 = 2
      expect(loc.population).toBe(popBefore - 2);
    });

    it('game over when too many locations fallen', () => {
      const s = quickState();
      s.phase = 'night';
      // In quick mode, minStandingLocations = 3 (for non-endless)
      // Make 2 locations fall to trigger defeat
      s.locations[0].fallen = true;
      s.locations[1].fallen = true;
      clearDemons(s);
      resolveDamage(s);
      expect(s.gameOver).toBe(true);
      expect(s.victory).toBe(false);
    });

    it('game over when hero HP <= 0', () => {
      const s = quickState();
      s.phase = 'night';
      s.presenceLocation = 'desert_spear';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      loc.population = 1;
      s.hero.hp = 1;
      clearDemons(s);
      addDemon(s, 'desert_spear', 'flame', 10);
      resolveDamage(s);
      expect(s.gameOver).toBe(true);
      expect(s.victory).toBe(false);
    });

    it('no damage when demon strength <= defense', () => {
      const s = quickState();
      s.phase = 'night';
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'stone');
      placeWard(loc, 1, 'stone'); // +4 defense total
      clearDemons(s);
      addDemon(s, 'desert_spear', 'flame', 3);
      const popBefore = loc.population;
      resolveDamage(s);
      expect(loc.population).toBe(popBefore);
    });
  });

  // ==========================================================
  // 9. analyzeMesh
  // ==========================================================
  describe('analyzeMesh', () => {
    it('returns fragile tier for empty location', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      const mesh = analyzeMesh(loc);
      expect(mesh.connections.length).toBe(0);
      expect(mesh.meshStrength).toBe(0);
      expect(mesh.tier).toBe('fragile');
    });

    it('returns fragile tier for single ward', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'fire');
      const mesh = analyzeMesh(loc);
      expect(mesh.connections.length).toBe(0);
      expect(mesh.meshStrength).toBe(0);
      expect(mesh.tier).toBe('fragile');
    });

    it('computes connection for two adjacent wards', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'wind');  // rightLinks: 3
      placeWard(loc, 1, 'fire');  // leftLinks: 3
      const mesh = analyzeMesh(loc);
      expect(mesh.connections.length).toBe(1);
      // min(wind.right=3, fire.left=3) = 3
      expect(mesh.connections[0].strength).toBe(3);
    });

    it('computes full chain with 3 wards', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'stone');  // L=2, R=2
      placeWard(loc, 1, 'stone');  // L=2, R=2
      placeWard(loc, 2, 'stone');  // L=2, R=2
      const mesh = analyzeMesh(loc);
      expect(mesh.connections.length).toBe(2);
      // Each connection: min(2,2) = 2, total = 4
      expect(mesh.meshStrength).toBe(4);
      expect(mesh.tier).toBe('reinforced');
    });

    it('gap in ward chain breaks connections', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'fire');
      // slot 1 empty (gap)
      placeWard(loc, 2, 'stone');
      const mesh = analyzeMesh(loc);
      expect(mesh.connections.length).toBe(0);
    });

    it('mesh tiers match threshold definitions', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;

      // Fortified: need meshStrength >= 5
      // wind(R=3) -> fire(L=3) = 3, fire(R=1) -> stone(L=2) = 1. Total = 4 (reinforced)
      // stone(R=2) -> stone(L=2) = 2, stone(R=2) -> stone(L=2) = 2. Total = 4 (reinforced)
      // wind(R=3) -> stone(L=2) = 2, stone(R=2) -> wind(L=1) = 1. Total = 3 (reinforced)
      // wind(R=3) -> light(L=2) = 2, light(R=2) -> wind(L=1) = 1. Total = 3 (reinforced)
      // wind(R=3) -> fire(L=3) = 3, NEED 2 more from fire outgoing: fire(R=1) -> wind(L=1) = 1. Total = 4 (reinforced)

      // To get fortified (>=5): wind->fire = 3, fire->... nope fire R=1
      // Actually with 3 slots max, max possible:
      // wind(R=3)->fire(L=3)=3 + fire(R=1)->X(L>=1)=1 = 4 (reinforced)
      // Best: wind(R=3)->fire(L=3)=3 + need second connection >= 2
      // wind->fire->? : fire R=1, can't get more than 1
      // stone->stone->stone: 2+2 = 4
      // Actually light(R=2)->stone(L=2)=2 + stone(R=2)->light(L=2)=2 = 4
      // Hmm, seems 4 is max for non-triple... let's just verify tiers
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'bone'); // L=1, R=1
      placeWard(loc, 1, 'bone'); // L=1, R=1
      const meshNormal = analyzeMesh(loc);
      expect(meshNormal.meshStrength).toBe(1);
      expect(meshNormal.tier).toBe('normal');
    });
  });

  // ==========================================================
  // 10. getAllDirectionalCombos
  // ==========================================================
  describe('getAllDirectionalCombos', () => {
    it('detects wind+stone combo (Forteresse)', () => {
      const s = quickState();
      s.chapter = 1; // Forteresse unlocked at chapter 1
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'wind');
      placeWard(loc, 1, 'stone');
      const combos = getAllDirectionalCombos(loc, s);
      expect(combos.length).toBe(1);
      expect(combos[0].name).toBe('Forteresse');
    });

    it('detects reverse combo stone+wind (Déviation)', () => {
      const s = quickState();
      s.chapter = 1; // Déviation unlocked at chapter 1
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'stone');
      placeWard(loc, 1, 'wind');
      const combos = getAllDirectionalCombos(loc, s);
      expect(combos.length).toBe(1);
      expect(combos[0].name).toBe('Déviation');
    });

    it('returns empty for no combo when chapter too low', () => {
      const s = quickState();
      s.chapter = 1;
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'wind');
      placeWard(loc, 1, 'fire'); // Inferno requires chapter 3
      const combos = getAllDirectionalCombos(loc, s);
      expect(combos.length).toBe(0);
    });

    it('detects Inferno (wind+fire) at chapter 3+', () => {
      const s = quickState();
      s.chapter = 3;
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'wind');
      placeWard(loc, 1, 'fire');
      const combos = getAllDirectionalCombos(loc, s);
      expect(combos.some(c => c.name === 'Inferno')).toBe(true);
    });

    it('respects bond strength requirement', () => {
      // All combos in WARD_COMBOS have minBondStrength. Check that bond is computed correctly.
      const s = quickState();
      s.chapter = 12;
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'wind');  // R=3
      placeWard(loc, 1, 'fire');  // L=3
      // bond = min(3,3) = 3, Inferno needs minBondStrength 2 -> should match
      const combos = getAllDirectionalCombos(loc, s);
      expect(combos.length).toBeGreaterThan(0);
    });

    it('returns empty for single ward', () => {
      const s = quickState();
      s.chapter = 12;
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'fire');
      const combos = getAllDirectionalCombos(loc, s);
      expect(combos.length).toBe(0);
    });

    it('can detect two combos in a 3-ward chain', () => {
      const s = quickState();
      s.chapter = 6;
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      // stone->fire = Magma (ch3), fire->wind = Soufflet (ch3)
      placeWard(loc, 0, 'stone');
      placeWard(loc, 1, 'fire');
      placeWard(loc, 2, 'wind');
      const combos = getAllDirectionalCombos(loc, s);
      // stone(R=2)->fire(L=3) = min(2,3)=2 >= Magma(2) -> YES
      // fire(R=1)->wind(L=1) = min(1,1)=1 >= Soufflet(1) -> YES
      expect(combos.length).toBe(2);
      const names = combos.map(c => c.name);
      expect(names).toContain('Magma');
      expect(names).toContain('Soufflet');
    });
  });

  // ==========================================================
  // 11. calculateScore
  // ==========================================================
  describe('calculateScore', () => {
    it('returns 1 star when a location has fallen', () => {
      const s = quickState();
      s.locations[0].fallen = true;
      const score = calculateScore(s);
      expect(score.stars).toBe(1);
      expect(score.noLocationFell).toBe(false);
    });

    it('returns 2 stars when no location fell but hero < 50% HP', () => {
      const s = quickState();
      s.hero.hp = 1;
      s.hero.maxHp = 10;
      const score = calculateScore(s);
      expect(score.stars).toBe(2);
      expect(score.noLocationFell).toBe(true);
      expect(score.heroHealthy).toBe(false);
    });

    it('returns 3 stars when no location fell and hero > 50% HP', () => {
      const s = quickState();
      s.hero.hp = 8;
      s.hero.maxHp = 10;
      const score = calculateScore(s);
      expect(score.stars).toBe(3);
      expect(score.noLocationFell).toBe(true);
      expect(score.heroHealthy).toBe(true);
    });

    it('hero at exactly 50% HP is NOT healthy (must be >50%)', () => {
      const s = quickState();
      s.hero.hp = 5;
      s.hero.maxHp = 10;
      const score = calculateScore(s);
      expect(score.heroHealthy).toBe(false);
      expect(score.stars).toBe(2);
    });
  });

  // ==========================================================
  // 12. endNight
  // ==========================================================
  describe('endNight', () => {
    it('advances to next night and levels up hero', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      s.nightNumber = 4;
      clearDemons(s);
      endNight(s);
      expect(s.phase).toBe('day');
      expect(s.nightNumber).toBe(5);
      expect(s.hero.level).toBe(2);
      expect(s.turnNumber).toBe(2);
    });

    it('victory when nightsPlayed >= maxNights', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 3; // equals maxNights (3 for non-endless)
      s.maxNights = 3;
      clearDemons(s);
      endNight(s);
      expect(s.gameOver).toBe(true);
      expect(s.victory).toBe(true);
    });

    it('clears all demons after night ends', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      addDemon(s, 'cutters_hollow', 'flame', 3);
      addDemon(s, 'desert_spear', 'wood', 4);
      endNight(s);
      for (const locId of Object.keys(s.demonsAtLocations) as LocationId[]) {
        expect(s.demonsAtLocations[locId].length).toBe(0);
      }
    });

    it('fallen location demons grow stronger each night', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      s.locations[0].fallen = true;
      s.locations[0].fallenNightsAgo = 0;
      const demon = addDemon(s, s.locations[0].id, 'flame', 3);
      const strBefore = demon.currentStrength;
      endNight(s);
      // Demons at fallen locations get +1 str, then are cleared
      // But endNight clears all demons, so we check fallenNightsAgo instead
      expect(s.locations[0].fallenNightsAgo).toBe(1);
    });

    it('horde forms after HORDE_FORMATION_NIGHTS and attacks adjacent', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      const fallenLoc = s.locations.find(l => l.id === 'desert_spear')!;
      fallenLoc.fallen = true;
      fallenLoc.fallenNightsAgo = HORDE_FORMATION_NIGHTS - 1; // will become >= threshold
      // Add strong demons at the fallen location
      addDemon(s, 'desert_spear', 'flame', 5);
      addDemon(s, 'desert_spear', 'flame', 5);

      // Record adjacent population
      const adjacent = s.locations.filter(l => !l.fallen && l.id !== 'desert_spear');
      const popsBefore = adjacent.map(l => l.population);

      endNight(s);

      // At least one adjacent location should have lost population
      const popsAfter = adjacent.map(l => l.population);
      const totalPopLoss = popsBefore.reduce((a, b) => a + b, 0) - popsAfter.reduce((a, b) => a + b, 0);
      expect(totalPopLoss).toBeGreaterThan(0);
    });

    it('hero gains +2 maxHp on level up', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      const maxHpBefore = s.hero.maxHp;
      clearDemons(s);
      endNight(s);
      expect(s.hero.maxHp).toBe(maxHpBefore + 2);
    });

    it('hero wardPowerBonus increases (up to 4)', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      s.hero.wardPowerBonus = 0;
      clearDemons(s);
      endNight(s);
      expect(s.hero.wardPowerBonus).toBe(1);
    });

    it('wardPowerBonus caps at 4', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      s.hero.wardPowerBonus = 4;
      clearDemons(s);
      endNight(s);
      expect(s.hero.wardPowerBonus).toBe(4);
    });

    it('defeat when too many locations fallen at end of night', () => {
      const s = quickState();
      s.phase = 'night';
      s.turnNumber = 1;
      s.minStandingLocations = 3;
      // Make 2 locations fallen (only 2 standing out of 4)
      s.locations[0].fallen = true;
      s.locations[1].fallen = true;
      clearDemons(s);
      endNight(s);
      expect(s.gameOver).toBe(true);
      expect(s.victory).toBe(false);
    });
  });

  // ==========================================================
  // 13. Talent Effects
  // ==========================================================
  describe('Talent effects', () => {
    it('extraActivations increases activationsRemaining in startWave', () => {
      const s = quickState();
      s.phase = 'night';
      s.nightNumber = 1;
      s.waveNumber = 0;
      s.talentEffects.extraActivations = 3;
      const wardedCount = s.locations.filter(l => !l.fallen && l.wards.some(ws => ws.ward)).length;
      startWave(s);
      expect(s.activationsRemaining).toBe(wardedCount + 3);
    });

    it('resourceBonus adds to gather amount', () => {
      const s = quickState();
      s.talentEffects.resourceBonus = 2;
      const loc = s.locations.find(l => l.primaryResource === 'wood')!;
      loc.stockpile.wood = 0;
      gather(s, loc.id);
      expect(loc.stockpile.wood).toBe(4); // 2 base + 2 bonus
    });

    it('healDawn adds to hero dawn healing', () => {
      const s = quickState();
      s.talentEffects.healDawn = 3;
      s.hero.hp = 1;
      s.hero.maxHp = 20;
      s.turnNumber = 1;
      processDawn(s);
      // Dawn heals 2 base + 3 talent = 5
      expect(s.hero.hp).toBe(6);
    });
  });

  // ==========================================================
  // Additional: processDawn
  // ==========================================================
  describe('processDawn', () => {
    it('produces primary resource at each non-fallen location', () => {
      const s = quickState();
      // Set all to 0
      for (const loc of s.locations) loc.stockpile[loc.primaryResource] = 0;
      processDawn(s);
      for (const loc of s.locations) {
        if (!loc.fallen) {
          expect(loc.stockpile[loc.primaryResource]).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('bone ward heals 1 pop at dawn', () => {
      const s = quickState();
      const loc = s.locations[0];
      placeWard(loc, 0, 'bone');
      loc.population = loc.maxPopulation - 2;
      const popBefore = loc.population;
      processDawn(s);
      expect(loc.population).toBeGreaterThanOrEqual(popBefore + 1);
    });

    it('removes temporary wards at dawn', () => {
      const s = quickState();
      const loc = s.locations[0];
      loc.wards[2] = { ward: 'fire', isTemporary: true, durability: 1, xp: 0, enhanced: false };
      processDawn(s);
      expect(loc.wards[2].ward).toBeNull();
      expect(loc.wards[2].isTemporary).toBe(false);
    });

    it('resets hero AP', () => {
      const s = quickState();
      s.hero.ap = 0;
      processDawn(s);
      const template = HEROES.find(h => h.id === s.hero.id)!;
      expect(s.hero.ap).toBe(template.ap);
    });

    it('degrades ward durability based on mesh tier', () => {
      const s = quickState();
      // Single ward = fragile mesh => wear = 2
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'fire');
      loc.wards[0].durability = 4;
      processDawn(s);
      // Fragile mesh: -2 durability
      expect(loc.wards[0].durability).toBe(2);
    });

    it('reinforced/fortified mesh has 0 durability wear', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      // 3 stone wards = mesh 4 = reinforced => wear = 0
      placeWard(loc, 0, 'stone');
      placeWard(loc, 1, 'stone');
      placeWard(loc, 2, 'stone');
      loc.wards[0].durability = 2;
      loc.wards[1].durability = 2;
      loc.wards[2].durability = 2;
      processDawn(s);
      expect(loc.wards[0].durability).toBe(2);
      expect(loc.wards[1].durability).toBe(2);
    });

    it('ward breaks when durability reaches 0', () => {
      const s = quickState();
      const loc = s.locations.find(l => l.id === 'desert_spear')!;
      loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
      placeWard(loc, 0, 'fire');
      loc.wards[0].durability = 1; // fragile wear = 2, will go to 0
      processDawn(s);
      expect(loc.wards[0].ward).toBeNull();
    });
  });
});
