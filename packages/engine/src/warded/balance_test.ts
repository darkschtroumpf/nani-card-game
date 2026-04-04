/**
 * Bot simulation: plays 200 Quick Mode games with a simple bot strategy
 * to measure win rate, average nights survived, and identify balance issues.
 *
 * Run: npx tsx packages/engine/src/warded/balance_test.ts
 */

import {
  createGame, processDawn, craftWard, fortifyLocation, gather,
  startNight, movePresence, startWave, activateWard, resolveDamage,
  endNight, arlenWardedFist, arlenWardedFlesh, arlenBloodWard,
  resolveWardPassives, surgeOfWill,
} from './game';
import type { GameState, LocationId, WardType } from './types';
import { WARD_COSTS } from './constants';

const NUM_GAMES = 200;
const HERO = 'arlen' as const;
const DIFFICULTY = 'waning' as const;

interface GameResult {
  victory: boolean;
  nightsSurvived: number;
  fallenLocations: number;
  heroHpEnd: number;
  defeatReason: string | null;
  maxDemonsOnOneLocation: number;
  totalDemonsSpawned: number;
}

function botPlayDay(state: GameState): void {
  while (state.hero.ap > 0 && state.phase === 'day') {
    // Place reserves on unprotected locations
    if (state.wardReserves.length > 0) {
      const bestTarget = state.locations
        .filter(l => !l.fallen && l.wards.some(w => !w.ward))
        .sort((a, b) => a.wards.filter(w => w.ward).length - b.wards.filter(w => w.ward).length)[0];
      if (bestTarget) {
        fortifyLocation(state, state.wardReserves[0], bestTarget.id);
        continue;
      }
    }

    // Craft wards
    const wardToCraft: WardType = Math.random() < 0.5 ? 'fire' : (Math.random() < 0.5 ? 'stone' : 'wind');
    const cost = WARD_COSTS[wardToCraft];
    const craftLoc = state.locations.find(l => !l.fallen &&
      l.stockpile.wood >= cost.wood && l.stockpile.ink >= cost.ink && l.stockpile.food >= cost.food);
    if (craftLoc) { craftWard(state, wardToCraft, craftLoc.id); continue; }

    // Arlen: Blood Ward (HP cost, permanent) if HP > 6
    if (state.hero.id === 'arlen' && state.hero.hp > 6) {
      const bloodTarget = state.locations.find(l => !l.fallen && l.wards.some(w => !w.ward));
      if (bloodTarget) {
        const result = arlenBloodWard(state, Math.random() < 0.5 ? 'fire' : 'stone', bloodTarget.id);
        if (!result[0]?.includes('Trop') && !result[0]?.includes('Pas')) continue;
      }
    }

    // Arlen Warded Flesh (AP cost, temp)
    if (state.hero.id === 'arlen') {
      const tempTarget = state.locations.find(l => !l.fallen && l.wards.some(w => !w.ward));
      if (tempTarget) { arlenWardedFlesh(state, 'fire', tempTarget.id); continue; }
    }

    // Gather
    const gatherLoc = state.locations.find(l => !l.fallen);
    if (gatherLoc) { gather(state, gatherLoc.id); continue; }

    // Surge of Will: spend HP for more AP if we have spare HP
    if (state.hero.hp > 6) {
      const surge = surgeOfWill(state);
      if (!surge[0]?.includes('Maximum') && !surge[0]?.includes('Uniquement') && !surge[0]?.includes('Trop')) continue;
    }
    break;
  }
}

function botPlayNight(state: GameState): { maxDemonsOneLocation: number; totalDemonsSpawned: number } {
  startNight(state);
  let maxDemonsOneLocation = 0;
  let totalDemonsSpawned = 0;

  // Move presence to weakest location
  const livingLocs = state.locations.filter(l => !l.fallen);
  if (livingLocs.length > 0) {
    const weakest = livingLocs.reduce((a, b) => {
      const aW = a.wards.filter(w => w.ward).length;
      const bW = b.wards.filter(w => w.ward).length;
      return aW < bW ? a : (aW > bW ? b : (a.population < b.population ? a : b));
    });
    movePresence(state, weakest.id);
  }

  for (let wave = 0; wave < 3; wave++) {
    if (state.gameOver) break;
    startWave(state);

    // Track clustering
    for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
      const count = state.demonsAtLocations[locId].length;
      maxDemonsOneLocation = Math.max(maxDemonsOneLocation, count);
    }
    totalDemonsSpawned += Object.values(state.demonsAtLocations).flat().length;

    resolveWardPassives(state);
    for (const loc of state.locations) {
      if (loc.fallen || !loc.wards.some(ws => ws.ward)) continue;
      const wardCount = loc.wards.filter(ws => ws.ward).length;
      activateWard(state, loc.id, wardCount >= 2);
    }
    state.activationsRemaining = 0;
    if (state.hero.id === 'arlen' && (state.hero.arlenCharge ?? 0) > 0) arlenWardedFist(state);
    resolveDamage(state);
    if (state.gameOver) break;
  }

  if (!state.gameOver) endNight(state);
  return { maxDemonsOneLocation, totalDemonsSpawned };
}

function playOneGame(): GameResult {
  const state = createGame(HERO, 'quick', DIFFICULTY);
  processDawn(state);
  let nightsSurvived = 0;
  let maxDemonsOnOneLocation = 0;
  let totalDemonsSpawned = 0;

  while (!state.gameOver) {
    botPlayDay(state);
    const ns = botPlayNight(state);
    maxDemonsOnOneLocation = Math.max(maxDemonsOnOneLocation, ns.maxDemonsOneLocation);
    totalDemonsSpawned += ns.totalDemonsSpawned;
    if (!state.gameOver) { nightsSurvived++; processDawn(state); }
  }

  return {
    victory: state.victory, nightsSurvived,
    fallenLocations: state.locations.filter(l => l.fallen).length,
    heroHpEnd: state.hero.hp, defeatReason: state.defeatReason,
    maxDemonsOnOneLocation, totalDemonsSpawned,
  };
}

console.log(`\n=== BALANCE TEST (BEFORE CHANGES) ===`);
console.log(`Hero: ${HERO} | Difficulty: ${DIFFICULTY} | Games: ${NUM_GAMES}\n`);

const results: GameResult[] = [];
for (let i = 0; i < NUM_GAMES; i++) results.push(playOneGame());

const wins = results.filter(r => r.victory).length;
const losses = results.filter(r => !r.victory);
const avgNights = results.reduce((s, r) => s + r.nightsSurvived, 0) / NUM_GAMES;
const avgFallen = results.reduce((s, r) => s + r.fallenLocations, 0) / NUM_GAMES;
const avgMaxDemons = results.reduce((s, r) => s + r.maxDemonsOnOneLocation, 0) / NUM_GAMES;

console.log(`Win rate: ${wins}/${NUM_GAMES} (${(wins/NUM_GAMES*100).toFixed(1)}%)`);
console.log(`Avg nights survived: ${avgNights.toFixed(1)}`);
console.log(`Avg fallen locations: ${avgFallen.toFixed(1)}`);
console.log(`Avg max demons on ONE location: ${avgMaxDemons.toFixed(1)}`);

const clusteringBuckets = { '1-3': 0, '4-6': 0, '7-9': 0, '10+': 0 };
for (const r of results) {
  if (r.maxDemonsOnOneLocation <= 3) clusteringBuckets['1-3']++;
  else if (r.maxDemonsOnOneLocation <= 6) clusteringBuckets['4-6']++;
  else if (r.maxDemonsOnOneLocation <= 9) clusteringBuckets['7-9']++;
  else clusteringBuckets['10+']++;
}
console.log(`\nDemon clustering (max on one city):`);
for (const [k, v] of Object.entries(clusteringBuckets))
  console.log(`  ${k}: ${v} games (${(v/NUM_GAMES*100).toFixed(0)}%)`);

const defeatReasons: Record<string, number> = {};
for (const r of losses) defeatReasons[r.defeatReason ?? 'unknown'] = (defeatReasons[r.defeatReason ?? 'unknown'] ?? 0) + 1;
console.log(`\nDefeat reasons:`);
for (const [reason, count] of Object.entries(defeatReasons).sort((a, b) => b[1] - a[1]))
  console.log(`  ${reason}: ${count}`);
console.log('');
