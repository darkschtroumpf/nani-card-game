// ============================================================
// The Warded Man: Sharak Ka — Game Engine
// ============================================================

import type {
  GameState, Location, LocationId, WardType, WardSlot,
  DemonCard, DemonAtLocation, DemonType, DemonSurgeType,
  Hero, HeroId, ResourceStockpile, ResourceType, LogEntry,
  Difficulty, WardCombo, TripleWardCombo, SongType, Consumable, ThreatLevel,
  MeshAnalysis, MeshTier, LinkConnection, ChapterScore,
} from './types';
import {
  LOCATIONS, ADJACENCY, WARD_COSTS, WARD_COMBOS, TRIPLE_WARD_COMBOS,
  WARD_LINK_PROFILES, MESH_TIERS,
  DEMON_TYPES, DEMONS_PER_WAVE, QUICK_MODE_SURGES, CAMPAIGN_SURGES,
  QUICK_MODE_STARTING_WARDS, HEROES, SWARM_THRESHOLD,
  HORDE_FORMATION_NIGHTS, SONGS, CONSUMABLE_RECIPES,
  TERRAIN_DEMON_AFFINITY, WARD_TYPES,
} from './constants';

// ============================================================
// Helpers
// ============================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addLog(state: GameState, message: string, important = false) {
  state.log.push({ phase: state.phase, message, important });
}

function getLocation(state: GameState, id: LocationId): Location {
  return state.locations.find(l => l.id === id)!;
}

function getAdjacentIds(locationId: LocationId): LocationId[] {
  return ADJACENCY[locationId] ?? [];
}

// ============================================================
// Ward Chain — Mesh Analysis & Directional Combos
// ============================================================

/** Analyze the ward chain at a location. Returns connections, mesh strength, and tier. */
export function analyzeMesh(loc: Location): MeshAnalysis {
  const connections: LinkConnection[] = [];
  const filledSlots = loc.wards
    .map((ws, i) => ({ ws, i }))
    .filter(({ ws }) => ws.ward !== null);

  // Check each consecutive pair of filled slots
  for (let idx = 0; idx < filledSlots.length - 1; idx++) {
    const left = filledSlots[idx];
    const right = filledSlots[idx + 1];
    // Only adjacent slots form connections (no gaps)
    if (right.i !== left.i + 1) continue;
    const leftProfile = WARD_LINK_PROFILES[left.ws.ward!];
    const rightProfile = WARD_LINK_PROFILES[right.ws.ward!];
    const strength = Math.min(leftProfile.rightLinks, rightProfile.leftLinks);
    connections.push({
      leftSlot: left.i,
      rightSlot: right.i,
      leftWard: left.ws.ward!,
      rightWard: right.ws.ward!,
      strength,
    });
  }

  const meshStrength = connections.reduce((sum, c) => sum + c.strength, 0);
  const tier = getMeshTier(meshStrength);
  return { connections, meshStrength, tier };
}

function getMeshTier(strength: number): MeshTier {
  for (const t of MESH_TIERS) {
    if (strength >= t.min && strength <= t.max) return t.tier;
  }
  return 'normal';
}

/** Find the best directional combo at a location, respecting chapter unlock and bond strength. */
function getDirectionalCombo(loc: Location, state: GameState): WardCombo | TripleWardCombo | null {
  const mesh = analyzeMesh(loc);
  const orderedWards = loc.wards.filter(ws => ws.ward).map(ws => ws.ward!);
  if (orderedWards.length < 2) return null;

  // Check triple combos first (if unlocked)
  if (state.maxComboSize >= 3 && orderedWards.length >= 3) {
    for (const tc of TRIPLE_WARD_COMBOS) {
      if (tc.unlockedAtChapter > state.chapter) continue;
      if (mesh.meshStrength < tc.minTotalMesh) continue;
      // Check exact ordered match
      if (orderedWards.length === 3 &&
          orderedWards[0] === tc.wards[0] &&
          orderedWards[1] === tc.wards[1] &&
          orderedWards[2] === tc.wards[2]) {
        return tc;
      }
    }
  }

  // Check dual combos — scan adjacent pairs, return the best (highest bond)
  let bestCombo: WardCombo | null = null;
  let bestBond = 0;

  for (const conn of mesh.connections) {
    for (const combo of WARD_COMBOS) {
      if (combo.unlockedAtChapter > state.chapter) continue;
      if (conn.leftWard === combo.wards[0] && conn.rightWard === combo.wards[1]) {
        if (conn.strength >= combo.minBondStrength && conn.strength > bestBond) {
          bestCombo = combo;
          bestBond = conn.strength;
        }
      }
    }
  }

  return bestCombo;
}

/** Get ALL active directional combos at a location (multiple pairs can each trigger a combo). */
export function getAllDirectionalCombos(loc: Location, state: GameState): WardCombo[] {
  const mesh = analyzeMesh(loc);
  const combos: WardCombo[] = [];

  for (const conn of mesh.connections) {
    for (const combo of WARD_COMBOS) {
      if (combo.unlockedAtChapter > state.chapter) continue;
      if (conn.leftWard === combo.wards[0] && conn.rightWard === combo.wards[1]) {
        if (conn.strength >= combo.minBondStrength) {
          combos.push(combo);
          break; // one combo per connection
        }
      }
    }
  }

  return combos;
}

// Legacy wrapper — returns first/best combo (used by most activation code)
function getWardCombo(loc: Location, state?: GameState): WardCombo | TripleWardCombo | null {
  if (!state) {
    // Fallback for calls without state — use permissive defaults
    const fakeState = { chapter: 12, maxComboSize: 3 } as GameState;
    return getDirectionalCombo(loc, fakeState);
  }
  return getDirectionalCombo(loc, state);
}

function wardedLocationCount(state: GameState): number {
  return state.locations.filter(l => !l.fallen && l.wards.some(ws => ws.ward)).length;
}

// ============================================================
// Game Creation
// ============================================================

export function createGame(heroId: HeroId, mode: 'quick' | 'campaign', difficulty: Difficulty = 'midnight'): GameState {
  const heroTemplate = HEROES.find(h => h.id === heroId)!;

  const locations: Location[] = LOCATIONS.map(l => ({
    id: l.id,
    name: l.name,
    position: l.position,
    terrain: l.terrain,
    population: l.startPop,
    maxPopulation: l.startPop,
    primaryResource: l.primaryResource,
    secondaryFoodTurn: l.secondaryFoodTurn,
    wards: [{ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }, { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }, { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }],
    fallen: false,
    fallenNightsAgo: 0,
    stockpile: { wood: 0, ink: 0, food: 0 },
  }));

  // Pre-place wards for Quick Mode
  if (mode === 'quick') {
    for (const sw of QUICK_MODE_STARTING_WARDS) {
      const loc = locations.find(l => l.id === sw.locationId)!;
      loc.wards[0] = { ward: sw.ward, isTemporary: false, durability: 4, xp: 0, enhanced: false };
    }
  }

  const hero: Hero = {
    id: heroId,
    name: heroTemplate.name,
    title: heroTemplate.title,
    hp: heroTemplate.hp,
    maxHp: heroTemplate.hp,
    ap: heroTemplate.ap,
    level: 1,
    wardPowerBonus: 0,
    arlenCharge: heroId === 'arlen' ? 1 : (heroId === 'arlen_young' ? undefined : undefined),
    jardir_warriors: heroId === 'jardir' ? [] : undefined,
    rojer_songs: heroId === 'rojer' ? [null, null, null] : undefined,
    leesha_consumables: heroId === 'leesha' ? [] : undefined,
  };

  // Night number depends on difficulty
  const nightNumber = difficulty === 'new_moon' ? 2 : difficulty === 'waning' ? 3 : difficulty === 'midnight' ? 4 : 1;

  const state: GameState = {
    phase: 'day',
    nightNumber: mode === 'quick' ? nightNumber : 1,
    waveNumber: 0,
    turnNumber: 1,
    locations,
    adjacency: ADJACENCY,
    hero,
    presenceLocation: 'cutters_hollow',
    currentSurge: null,
    demonsAtLocations: {
      desert_spear: [], cutters_hollow: [], lakton: [], miln: [],
    },
    activationsRemaining: 0,
    activationsUsedAt: [],
    heroWaveAbilityUsed: false,
    presenceMoveUsed: false,
    wardReserves: [],
    mode,
    chapter: 1,
    // Ward chain progression
    availableWards: mode === 'quick' ? [...WARD_TYPES] : ['stone', 'wind'],
    maxComboSize: mode === 'quick' ? 3 : 2,
    fireCanKill: mode === 'quick',
    talentEffects: { extraActivations: 0, resourceBonus: 0, healDawn: 0 },
    wardUsageStats: { fire: 0, stone: 0, wind: 0, light: 0, bone: 0 },
    maxNights: difficulty === 'endless' ? 999 : 3,
    minStandingLocations: mode === 'quick' ? (difficulty === 'endless' ? 1 : 3) : 1,
    gameOver: false,
    victory: false,
    defeatReason: null,
    log: [],
  };

  // Distribute starting resources
  distributeStartingResources(state);

  addLog(state, `${hero.name} se prépare pour la nuit ${state.nightNumber}.`, true);
  return state;
}

function distributeStartingResources(state: GameState) {
  // Each location gets 2 of its primary resource + 1 food for food producers
  for (const loc of state.locations) {
    const primary = loc.primaryResource;
    loc.stockpile[primary] = 3;
  }
  // Lakton gets extra food
  getLocation(state, 'lakton').stockpile.food = 3;
}

// ============================================================
// Day Phase
// ============================================================

export function processDawn(state: GameState): void {
  // Each location produces 1 of its primary resource
  for (const loc of state.locations) {
    if (loc.fallen) continue;
    loc.stockpile[loc.primaryResource] = Math.min(6, loc.stockpile[loc.primaryResource] + 1);

    // Secondary food production
    if (loc.secondaryFoodTurn === 'odd' && state.turnNumber % 2 === 1) {
      loc.stockpile.food = Math.min(6, loc.stockpile.food + 1);
    } else if (loc.secondaryFoodTurn === 'even' && state.turnNumber % 2 === 0) {
      loc.stockpile.food = Math.min(6, loc.stockpile.food + 1);
    }

    // Lakton always produces food
    if (loc.id === 'lakton') {
      loc.stockpile.food = Math.min(6, loc.stockpile.food + 1);
    }

    // Bone ward dawn heal
    for (const ws of loc.wards) {
      if (ws.ward === 'bone' && !ws.isTemporary) {
        loc.population = Math.min(loc.maxPopulation, loc.population + 1);
      }
    }
  }

  // Ward durability degradation — fragile mesh = extra wear
  for (const loc of state.locations) {
    if (loc.fallen) continue;
    const mesh = analyzeMesh(loc);
    for (const ws of loc.wards) {
      if (!ws.ward || ws.isTemporary) continue;
      // Normal: -1 durability per night. Fragile: -2. Reinforced/Fortified: 0.
      let wear = 1;
      if (mesh.tier === 'fragile') wear = 2;
      if (mesh.tier === 'reinforced' || mesh.tier === 'fortified') wear = 0;
      ws.durability = Math.max(0, ws.durability - wear);
      if (ws.durability <= 0) {
        addLog(state, `Ward de ${ws.ward} à ${loc.name} est brisé!`, true);
        ws.ward = null;
        ws.xp = 0;
        ws.enhanced = false;
      }
    }
  }

  // Remove temporary wards
  for (const loc of state.locations) {
    for (let i = 0; i < loc.wards.length; i++) {
      if (loc.wards[i].isTemporary) {
        loc.wards[i] = { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false };
      }
    }
  }

  // Hero dawn heal (base 2 + talent bonus)
  const dawnHeal = 1 + (state.talentEffects?.healDawn ?? 0);
  if (state.hero.hp < state.hero.maxHp) {
    state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + dawnHeal);
  }

  // Reset AP and surge of will
  state.hero.ap = HEROES.find(h => h.id === state.hero.id)!.ap;
  delete (state as any)._surgeOfWillUsed;

  addLog(state, 'Aube — ressources produites, wards temporaires retirés.');
}

// --- Day Actions ---

export function canCraftWard(state: GameState, wardType: WardType): boolean {
  const cost = WARD_COSTS[wardType];
  // Check if any location has enough resources
  for (const loc of state.locations) {
    if (loc.fallen) continue;
    if (loc.stockpile.wood >= cost.wood && loc.stockpile.ink >= cost.ink && loc.stockpile.food >= cost.food) {
      return true;
    }
  }
  return false;
}

export function craftWard(state: GameState, wardType: WardType, fromLocationId: LocationId): boolean {
  if (state.hero.ap <= 0) return false;
  if (!state.availableWards.includes(wardType)) return false;
  const cost = WARD_COSTS[wardType];
  const loc = getLocation(state, fromLocationId);
  if (loc.fallen) return false;
  if (loc.stockpile.wood < cost.wood || loc.stockpile.ink < cost.ink || loc.stockpile.food < cost.food) return false;

  loc.stockpile.wood -= cost.wood;
  loc.stockpile.ink -= cost.ink;
  loc.stockpile.food -= cost.food;
  state.wardReserves.push(wardType);
  state.hero.ap--;

  addLog(state, `Ward de ${wardType} crafté depuis ${loc.name}. (${state.wardReserves.length} en réserve)`);
  return true;
}

export function fortifyLocation(state: GameState, wardType: WardType, targetLocationId: LocationId): boolean {
  if (state.hero.ap <= 0) return false;
  const idx = state.wardReserves.indexOf(wardType);
  if (idx < 0) return false;
  const loc = getLocation(state, targetLocationId);
  if (loc.fallen) return false;

  // Find empty slot
  const slotIdx = loc.wards.findIndex(w => !w.ward);
  if (slotIdx < 0) return false; // both slots full

  loc.wards[slotIdx] = { ward: wardType, isTemporary: false, durability: 4, xp: 0, enhanced: false };
  state.wardReserves.splice(idx, 1);
  state.hero.ap--;

  const mesh = analyzeMesh(loc);
  const combo = getWardCombo(loc, state);
  const comboText = combo ? ` → ${combo.name}!` : '';
  const meshLabel = MESH_TIERS.find(t => t.tier === mesh.tier)?.label ?? '';
  addLog(state, `Ward de ${wardType} placé à ${loc.name}${comboText} (Maillage: ${mesh.meshStrength} — ${meshLabel}).`, !!combo);
  return true;
}

export function gather(state: GameState, locationId: LocationId): boolean {
  if (state.hero.ap <= 0) return false;
  const loc = getLocation(state, locationId);
  if (loc.fallen) return false;

  const gatherAmount = 2 + (state.talentEffects?.resourceBonus ?? 0);
  loc.stockpile[loc.primaryResource] = Math.min(6, loc.stockpile[loc.primaryResource] + gatherAmount);
  state.hero.ap--;

  addLog(state, `Récolte à ${loc.name}: +${gatherAmount} ${loc.primaryResource}.`);
  return true;
}

// ============================================================
// Night Phase
// ============================================================

export function startNight(state: GameState): void {
  state.phase = 'night';
  state.waveNumber = 0;
  state.presenceMoveUsed = false;

  // Reset hero-specific state
  if (state.hero.id === 'arlen') {
    state.hero.arlenCharge = 1;
  }
  if (state.hero.id === 'rojer') {
    delete (state as any)._symphonyActive;
  }

  // Draw surge (campaign can force a specific surge)
  if (state.campaignModifiers?.forcedSurge) {
    state.currentSurge = state.campaignModifiers.forcedSurge;
    state.campaignModifiers.forcedSurge = undefined;
  } else {
    const surgePool = state.mode === 'quick' ? QUICK_MODE_SURGES : CAMPAIGN_SURGES;
    state.currentSurge = surgePool[Math.floor(Math.random() * surgePool.length)];
  }

  addLog(state, `Nuit ${state.nightNumber} commence!`, true);
  if (state.currentSurge !== 'night_of_courage') {
    addLog(state, `Demon Surge: ${state.currentSurge}!`, true);
  } else {
    addLog(state, 'Nuit tranquille — pas de surge.');
  }
}

export function movePresence(state: GameState, newLocationId: LocationId): boolean {
  if (state.presenceMoveUsed) return false;
  const loc = getLocation(state, newLocationId);
  if (loc.fallen) return false;

  state.presenceLocation = newLocationId;
  state.presenceMoveUsed = true;

  addLog(state, `Présence déplacée à ${loc.name}.`);
  return true;
}

export function startWave(state: GameState): void {
  state.waveNumber++;
  state.activationsRemaining = wardedLocationCount(state) + (state.talentEffects?.extraActivations ?? 0);
  state.activationsUsedAt = [];
  state.heroWaveAbilityUsed = false;
  delete (state as any)._nightRepairUsed;
  state.hero.ap = 2; // Night AP for hero abilities

  // Clear demons from living locations (previous wave's demons are resolved)
  for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
    const loc = getLocation(state, locId);
    if (!loc.fallen) {
      state.demonsAtLocations[locId] = [];
    }
  }

  // Spawn demons
  spawnDemons(state);

  addLog(state, `Vague ${state.waveNumber} — ${getTotalDemonCount(state)} démons apparaissent!`, true);
}

function spawnDemons(state: GameState): void {
  const baseCount = DEMONS_PER_WAVE[state.nightNumber] ?? Math.min(12, 6 + Math.floor((state.nightNumber - 12) / 2));
  let count = baseCount;

  // Surge modifiers
  if (state.currentSurge === 'swarming_dark') count += 2;
  if (state.currentSurge === 'rising_tide') count += 1;

  // Campaign modifiers
  if (state.campaignModifiers?.extraDemonsPerWave) count += state.campaignModifiers.extraDemonsPerWave;

  // Adaptive demons: find most-used ward type → spawn resistant demons
  const mostUsedWard = Object.entries(state.wardUsageStats)
    .sort(([, a], [, b]) => b - a)[0];
  const adaptiveType: DemonType | null = mostUsedWard && mostUsedWard[1] >= 3
    ? ({ fire: 'flame', stone: 'rock', wind: 'wind', light: 'mind', bone: 'water' } as Record<string, DemonType>)[mostUsedWard[0]] ?? null
    : null;

  // Terrain-based demon spawning — each location attracts demons matching its terrain
  const living = state.locations.filter(l => !l.fallen && l.maxPopulation > 0);
  if (living.length === 0) return; // no valid locations
  // Use nightNumber for demon availability (not chapter, which is always 1)
  const availableChapter = state.nightNumber;
  // Ensure minimum demons per wave (at least 1 per living location)
  count = Math.max(count, living.length);

  for (let i = 0; i < count; i++) {
    // Pick target location (spread evenly with slight randomness)
    const target = living[i % living.length];
    const targetId = target.id;

    // Pick demon type: 25% chance adaptive, 75% terrain-based
    const affinity = TERRAIN_DEMON_AFFINITY[target.terrain] ?? TERRAIN_DEMON_AFFINITY.plains;
    const useAdaptive = adaptiveType && Math.random() < 0.25;
    const pool = useAdaptive ? [adaptiveType!] : (Math.random() < 0.7 ? affinity.primary : affinity.secondary);
    // Filter by what's available at this chapter/night
    const available = pool.filter(dt => DEMON_TYPES.find(d => d.type === dt && d.introducedChapter <= availableChapter));
    const demonType = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : 'flame'; // fallback to flame (most common)
    const demonDef = DEMON_TYPES.find(d => d.type === demonType)!;

    let strength = demonDef.baseStrength;
    if (state.currentSurge === 'blood_moon') strength += 1;
    if (state.campaignModifiers?.demonStrengthBonus) strength += state.campaignModifiers.demonStrengthBonus;

    // Mind demons always target hero presence
    const finalTarget = demonType === 'mind' ? state.presenceLocation : targetId;

    // Wind demons: spawn 2 but spread across locations
    if (demonType === 'wind') {
      const windStr = 1 + (state.currentSurge === 'blood_moon' ? 1 : 0) + (state.campaignModifiers?.demonStrengthBonus ?? 0);
      const windLocs = shuffle(living.map(l => l.id));
      for (let w = 0; w < 2; w++) {
        const wTarget = windLocs[w % windLocs.length];
        state.demonsAtLocations[wTarget].push({
          demon: { type: 'wind', strength: windStr, targetLocation: wTarget, isLocked: false, isBoss: false, isPrinceUpgraded: false },
          currentStrength: windStr, swarmed: false, revealed: false,
        });
      }
      continue;
    }

    state.demonsAtLocations[finalTarget].push({
      demon: { type: demonType, strength, targetLocation: finalTarget, isLocked: demonDef.isLocked, isBoss: demonDef.isBoss, isPrinceUpgraded: false },
      currentStrength: strength, swarmed: false, revealed: false,
    });
  }

  // Coreling Prince: upgrade 1 random demon +2 str
  if (state.currentSurge === 'coreling_prince') {
    const allDemons = Object.values(state.demonsAtLocations).flat();
    if (allDemons.length > 0) {
      const target = allDemons[Math.floor(Math.random() * allDemons.length)];
      target.currentStrength += 2;
      target.demon.isPrinceUpgraded = true;
    }
  }

  // Mist Shroud: 2 random demons swap target locations
  if (state.currentSurge === 'mist_shroud') {
    const allDemonEntries: { locId: LocationId; idx: number }[] = [];
    for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
      state.demonsAtLocations[locId].forEach((_, idx) => allDemonEntries.push({ locId, idx }));
    }
    for (let swaps = 0; swaps < 2 && allDemonEntries.length >= 2; swaps++) {
      const aIdx = Math.floor(Math.random() * allDemonEntries.length);
      const a = allDemonEntries[aIdx];
      allDemonEntries.splice(aIdx, 1);
      const bIdx = Math.floor(Math.random() * allDemonEntries.length);
      const b = allDemonEntries[bIdx];
      allDemonEntries.splice(bIdx, 1);
      if (a.locId !== b.locId) {
        const demonA = state.demonsAtLocations[a.locId][a.idx];
        const demonB = state.demonsAtLocations[b.locId][b.idx];
        state.demonsAtLocations[a.locId][a.idx] = demonB;
        state.demonsAtLocations[b.locId][b.idx] = demonA;
        addLog(state, `Brume: ${demonA.demon.type} et ${demonB.demon.type} échangent de cible!`);
      }
    }
  }

  // Demon Frenzy: demons from fallen locations attack adjacent
  if (state.currentSurge === 'demon_frenzy') {
    for (const loc of state.locations) {
      if (loc.fallen) {
        const adjIds = getAdjacentIds(loc.id);
        const aliveAdj = adjIds.filter(a => {
          const al = getLocation(state, a);
          return al && !al.fallen && al.maxPopulation > 0;
        });
        if (aliveAdj.length > 0) {
          const targetId = aliveAdj[Math.floor(Math.random() * aliveAdj.length)];
          // Spawn 2 extra flame demons at the adjacent location
          for (let f = 0; f < 2; f++) {
            state.demonsAtLocations[targetId].push({
              demon: { type: 'flame', strength: 3, targetLocation: targetId, isLocked: false, isBoss: false, isPrinceUpgraded: false },
              currentStrength: 3, swarmed: false, revealed: false,
            });
          }
          addLog(state, `Frénésie: les démons de ${loc.name} envoient des renforts vers ${getLocation(state, targetId).name}!`);
        }
      }
    }
  }

  // Apply Swarm
  for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
    const demons = state.demonsAtLocations[locId];
    if (demons.length >= SWARM_THRESHOLD) {
      for (const d of demons) {
        d.currentStrength += 1;
        d.swarmed = true;
      }
      addLog(state, `Swarm à ${getLocation(state, locId).name}! (${demons.length} démons, +1 str chacun)`, true);
    }
  }

  // Demon Magnet: 1 demon per wave redirected to each fallen location from adjacent
  // (only real fallen locations, not hidden ones)
  for (const loc of state.locations) {
    if (!loc.fallen || loc.maxPopulation === 0) continue;
    const adjacentIds = getAdjacentIds(loc.id);
    for (const adjId of adjacentIds) {
      const adjDemons = state.demonsAtLocations[adjId];
      const nonLocked = adjDemons.findIndex(d => !d.demon.isLocked && !d.demon.isBoss);
      if (nonLocked >= 0) {
        const [redirected] = adjDemons.splice(nonLocked, 1);
        state.demonsAtLocations[loc.id].push(redirected);
        break; // only 1 per fallen location
      }
    }
  }
}


function getWardDefense(loc: Location, state?: GameState): number {
  let def = 0;
  for (const ws of loc.wards) {
    if (ws.ward === 'stone') def += 2;
  }
  // Mesh tier bonus
  const mesh = analyzeMesh(loc);
  if (mesh.tier === 'reinforced') def += 1;
  if (mesh.tier === 'fortified') def += 2;
  // Directional combo bonuses
  if (state) {
    const combos = getAllDirectionalCombos(loc, state);
    const names = new Set(combos.map(c => c.name));
    if (names.has('Forteresse')) def += 3;
    if (names.has('Rempart')) def += 3;
    if (names.has('Sentinelle')) def += 2;
    if (names.has('Révélation')) def += 2;
  }
  return def;
}

function getTotalDemonCount(state: GameState): number {
  return Object.values(state.demonsAtLocations).reduce((sum, arr) => sum + arr.length, 0);
}

// ============================================================
// Ward Passives (resolve automatically each wave after spawn)
// ============================================================

export function resolveWardPassives(state: GameState): string[] {
  const events: string[] = [];

  // Skip if Warding Blight surge
  if (state.currentSurge === 'warding_blight') {
    events.push('Warding Blight! Les passives de wards sont désactivées cette nuit.');
    return events;
  }

  for (const loc of state.locations) {
    if (loc.fallen) continue;
    const demons = state.demonsAtLocations[loc.id];
    if (!demons) continue;
    const isPresence = state.presenceLocation === loc.id;
    const presenceBonus = isPresence ? 1 : 0;

    const mesh = analyzeMesh(loc);
    const combos = getAllDirectionalCombos(loc, state);
    const comboNames = new Set(combos.map(c => c.name));

    // Mesh tier bonus for passive numeric effects
    const meshBonus = mesh.tier === 'fortified' ? 1 : mesh.tier === 'reinforced' ? 1 : 0;

    // Helper: apply fire damage to a demon, respecting fireCanKill
    const applyFireDamage = (d: DemonAtLocation, dmg: number, locId: LocationId, locName: string): boolean => {
      const multiplier = d.demon.type === 'wood' ? 2 : 1;
      d.currentStrength -= dmg * multiplier;
      if (!state.fireCanKill && d.currentStrength < 1) d.currentStrength = 1;
      if (d.currentStrength <= 0) {
        const demonList = state.demonsAtLocations[locId];
        const idx = demonList.indexOf(d);
        if (idx >= 0) demonList.splice(idx, 1);
        events.push(`🜂 ${locName}: ${d.demon.type} détruit par Fire!`);
        onDemonKilled(state, locId);
        return true;
      }
      return false;
    };

    for (const ws of loc.wards) {
      if (!ws.ward) continue;

      switch (ws.ward) {
        case 'fire': {
          let fireDmg = 1 + meshBonus;
          if (comboNames.has('Magma')) fireDmg += 1;
          if (comboNames.has('Forge')) fireDmg += 1;
          if (comboNames.has('Soufflet')) fireDmg += 2;
          fireDmg += presenceBonus;

          if (demons.length > 0) {
            for (let i = demons.length - 1; i >= 0; i--) {
              applyFireDamage(demons[i], fireDmg, loc.id, loc.name);
            }
            if (demons.length > 0) {
              events.push(`🜂 ${loc.name}: Fire inflige ${fireDmg} à ${demons.length} démon(s).`);
            }
          }
          break;
        }

        case 'stone': {
          const stoneDef = 2 + meshBonus;
          events.push(`⬡ ${loc.name}: Stone passive — +${stoneDef} défense.`);
          break;
        }

        case 'wind': {
          if (comboNames.has('Soufflet')) break; // Soufflet disables wind redirect
          const redirectCount = 1 + (comboNames.has('Déviation') ? 1 : 0);
          if (demons.length > 0) {
            let redirected = 0;
            for (let r = 0; r < redirectCount && demons.length > 0; r++) {
              const redirectable = demons.findIndex(d => !d.demon.isLocked && !d.demon.isBoss && d.demon.type !== 'wind');
              if (redirectable < 0) break;
              const adj = getAdjacentIds(loc.id).filter(a => {
                const adjLoc = getLocation(state, a);
                return !adjLoc.fallen && adjLoc.maxPopulation > 0;
              });
              if (adj.length === 0) break;
              let bestAdj = adj[0];
              let bestCount = 99;
              for (const a of adj) {
                const c = (state.demonsAtLocations[a] ?? []).length;
                if (c < bestCount) { bestCount = c; bestAdj = a; }
              }
              const [demon] = demons.splice(redirectable, 1);
              state.demonsAtLocations[bestAdj].push(demon);
              events.push(`🜁 ${loc.name}: ${demon.demon.type} redirigé vers ${getLocation(state, bestAdj).name}.`);
              redirected++;
            }
          }
          break;
        }

        case 'light': {
          // Reveal all demon types at this location
          for (const d of demons) {
            if (!d.revealed) {
              d.revealed = true;
            }
          }
          events.push(`✦ ${loc.name}: Lumière révèle ${demons.length} démon(s).`);
          break;
        }

        case 'bone': {
          if (comboNames.has('Sanctuaire')) {
            loc.population = Math.min(loc.maxPopulation, loc.population + 1);
            events.push(`☽ ${loc.name}: Sanctuaire soigne 1 Pop (${loc.population}/${loc.maxPopulation}).`);
          }
          if (comboNames.has('Consécration') && isPresence) {
            state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + 1);
            events.push(`☽ ${loc.name}: Consécration soigne 1 HP héros.`);
          }
          break;
        }
      }
    }

    // Sentinelle/Révélation combo: reveal demon types (passive)
    if (comboNames.has('Sentinelle') || comboNames.has('Révélation')) {
      for (const d of demons) d.revealed = true;
      events.push(`✦ ${loc.name}: combo révèle ${demons.length} démon(s).`);
    }

    // Inferno combo: Fire passive affects adjacent too
    if (comboNames.has('Inferno')) {
      for (const adjId of getAdjacentIds(loc.id)) {
        const adjDemons = state.demonsAtLocations[adjId];
        if (!adjDemons || adjDemons.length === 0) continue;
        for (let i = adjDemons.length - 1; i >= 0; i--) {
          applyFireDamage(adjDemons[i], 1 + meshBonus, adjId, getLocation(state, adjId).name);
        }
      }
    }

    // Phare combo: demons killed by Fire give +1 resource (tracked via onDemonKilled)
  }

  return events;
}

// ============================================================
// Arlen: Warded Flesh (Day Action — place temp ward)
// ============================================================

export function arlenWardedFlesh(state: GameState, wardType: WardType, targetLocationId: LocationId): boolean {
  if (state.hero.id !== 'arlen') return false;
  if (state.hero.ap <= 0) return false;

  const loc = getLocation(state, targetLocationId);
  if (loc.fallen) return false;

  // Find a slot (prefer empty, or use temp slot)
  const emptySlot = loc.wards.findIndex(w => !w.ward);
  if (emptySlot >= 0) {
    loc.wards[emptySlot] = { ward: wardType, isTemporary: true, durability: 1, xp: 0, enhanced: false };
  } else {
    // Both slots full — can't place temp ward
    return false;
  }

  state.hero.ap--;
  addLog(state, `Warded Flesh: ward temporaire de ${wardType} à ${loc.name}.`);
  return true;
}

// ============================================================
// Ward Repair (restore durability)
// ============================================================

export function repairWard(state: GameState, locationId: LocationId, slotIndex: number): boolean {
  if (state.phase !== 'day' || state.hero.ap <= 0) return false;
  const loc = getLocation(state, locationId);
  if (loc.fallen) return false;
  const ws = loc.wards[slotIndex];
  if (!ws || !ws.ward || ws.isTemporary) return false;
  if (ws.durability >= 4) return false; // already full

  ws.durability = Math.min(4, ws.durability + 2);
  state.hero.ap--;
  addLog(state, `Ward de ${ws.ward} réparé à ${loc.name} (durabilité ${ws.durability}/4).`);
  return true;
}

/** Emergency repair: costs 1 AP (night). 1 per wave limit. */
export function emergencyRepairWard(state: GameState, locationId: LocationId, slotIndex: number): string | null {
  const loc = getLocation(state, locationId);
  if (!loc || loc.fallen) return 'Lieu indisponible.';
  const ws = loc.wards[slotIndex];
  if (!ws || !ws.ward || ws.isTemporary) return 'Pas de ward ici.';
  if (ws.durability >= 4) return 'Ward déjà intact.';

  // Night: only at presence, 1 per wave
  if (state.phase === 'night') {
    if (locationId !== state.presenceLocation) return 'Trop loin — présence requise.';
    if ((state as any)._nightRepairUsed) return 'Déjà réparé cette vague.';
    if (state.hero.ap <= 0) return 'Pas assez d\'AP (coût: 1).';
  }
  // Day: only when 0 AP (uses regular repair instead)
  if (state.phase === 'day' && state.hero.ap > 0) return 'Utilise tes AP d\'abord.';

  ws.durability = 4;
  if (state.phase === 'night') {
    state.hero.ap--;
    (state as any)._nightRepairUsed = true;
  }
  addLog(state, `Réparation d'urgence! ${ws.ward} réparé (-1 AP).`, true);
  return null; // success
}

/** Swap a placed ward with one from reserves, costs 1 HP when no AP. */
export function emergencySwapReserve(state: GameState, locationId: LocationId, slotIndex: number, reserveIndex: number): string | null {
  if (state.hero.ap > 0) return 'Utilise tes AP d\'abord.';
  const loc = getLocation(state, locationId);
  if (!loc || loc.fallen) return 'Lieu indisponible.';
  const ws = loc.wards[slotIndex];
  if (!ws) return 'Slot invalide.';
  if (reserveIndex < 0 || reserveIndex >= state.wardReserves.length) return 'Réserve invalide.';
  if (state.hero.hp <= 1) return 'Pas assez de HP.';

  // Swap: old ward goes to reserve, reserve ward goes to slot
  const oldWard = ws.ward;
  const newWard = state.wardReserves[reserveIndex];
  ws.ward = newWard;
  ws.durability = 4;
  ws.xp = 0;
  ws.enhanced = false;
  state.wardReserves.splice(reserveIndex, 1);
  if (oldWard) state.wardReserves.push(oldWard);
  state.hero.hp -= 1;
  addLog(state, `Échange d'urgence! ${newWard} placé à ${loc.name} (-1 HP).`);
  return null;
}

// ============================================================
// Ward Management (remove / swap)
// ============================================================

export function removeWard(state: GameState, locationId: LocationId, slotIndex: number): boolean {
  if (state.phase !== 'day') return false;
  const loc = getLocation(state, locationId);
  if (loc.fallen) return false;
  const ws = loc.wards[slotIndex];
  if (!ws || !ws.ward) return false;
  if (ws.isTemporary) return false; // can't recover temp wards

  // Return ward to reserves
  state.wardReserves.push(ws.ward);
  loc.wards[slotIndex] = { ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false };
  addLog(state, `Ward de ${ws.ward} retiré de ${loc.name} → réserves.`);
  return true;
}

export function swapWards(state: GameState, locationId: LocationId, slotA: number, slotB: number): boolean {
  if (state.phase !== 'day') return false;
  const loc = getLocation(state, locationId);
  if (loc.fallen) return false;
  if (slotA === slotB) return false;
  if (slotA < 0 || slotA >= loc.wards.length || slotB < 0 || slotB >= loc.wards.length) return false;

  const temp = loc.wards[slotA];
  loc.wards[slotA] = loc.wards[slotB];
  loc.wards[slotB] = temp;
  const mesh = analyzeMesh(loc);
  const meshLabel = MESH_TIERS.find(t => t.tier === mesh.tier)?.label ?? '';
  addLog(state, `Wards intervertis à ${loc.name}. (Maillage: ${mesh.meshStrength} — ${meshLabel})`);
  return true;
}

/** Reorder wards at a location (drag-and-drop). Free action (0 AP). */
export function reorderWards(state: GameState, locationId: LocationId, newOrder: number[]): boolean {
  if (state.phase !== 'day') return false;
  const loc = getLocation(state, locationId);
  if (loc.fallen) return false;
  if (newOrder.length !== loc.wards.length) return false;
  // Validate permutation
  const sorted = [...newOrder].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) return false;
  }
  const reordered = newOrder.map(i => loc.wards[i]);
  loc.wards = reordered;
  const mesh = analyzeMesh(loc);
  const meshLabel = MESH_TIERS.find(t => t.tier === mesh.tier)?.label ?? '';
  addLog(state, `Wards réordonnés à ${loc.name}. (Maillage: ${mesh.meshStrength} — ${meshLabel})`);
  return true;
}

// ============================================================
// Ward Activation
// ============================================================

export function activateWard(state: GameState, locationId: LocationId, useCombo: boolean): string[] {
  if (state.activationsRemaining <= 0) return ['Plus d\'activations disponibles.'];
  const loc = getLocation(state, locationId);
  if (loc.fallen) return ['Lieu tombé.'];
  if (!loc.wards.some(ws => ws.ward)) return ['Pas de ward ici.'];

  const events: string[] = [];
  const demons = state.demonsAtLocations[locationId];
  const isPresence = state.presenceLocation === locationId;
  const presenceBonus = isPresence ? 1 : 0;

  if (useCombo) {
    const combo = getWardCombo(loc, state);
    if (combo) {
      events.push(`${combo.activeName} activé à ${loc.name}!`);
      applyComboActive(state, locationId, combo, presenceBonus, events);
    } else {
      // No combo available — fallback to individual ward actives
      for (const ws of loc.wards) {
        if (!ws.ward) continue;
        events.push(`${ws.ward} activé à ${loc.name}!`);
        applyWardActive(state, locationId, ws.ward, presenceBonus, events);
      }
    }
  } else {
    // Activate each individual ward
    for (const ws of loc.wards) {
      if (!ws.ward) continue;
      events.push(`${ws.ward} activé à ${loc.name}!`);
      applyWardActive(state, locationId, ws.ward, presenceBonus, events);
    }
  }

  state.activationsRemaining--;
  state.activationsUsedAt.push(locationId);

  // Ward XP gain + evolution check
  for (const ws of loc.wards) {
    if (ws.ward && !ws.isTemporary) {
      ws.xp++;
      state.wardUsageStats[ws.ward] = (state.wardUsageStats[ws.ward] ?? 0) + 1;
      if (ws.xp >= 3 && !ws.enhanced) {
        ws.enhanced = true;
        events.push(`✨ Ward de ${ws.ward} à ${loc.name} est devenu AMÉLIORÉ ! (+1 dégât, effet bonus)`);
        addLog(state, `Ward de ${ws.ward} amélioré à ${loc.name}!`, true);
      }
    }
  }

  return events;
}

function applyWardActive(state: GameState, locId: LocationId, ward: WardType, presenceBonus: number, events: string[]) {
  const demons = state.demonsAtLocations[locId];
  const powerBonus = state.hero.wardPowerBonus ?? 0;
  // Enhanced ward bonus
  const loc = getLocation(state, locId);
  const enhancedBonus = loc.wards.some(ws => ws.ward === ward && ws.enhanced) ? 1 : 0;

  switch (ward) {
    case 'fire': {
      // Blaze: 3 + level bonus + enhanced damage to 1 demon
      if (demons.length > 0) {
        const strongest = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        const dmg = 3 + presenceBonus + powerBonus + enhancedBonus;
        strongest.currentStrength -= dmg;
        if (!state.fireCanKill && strongest.currentStrength < 1) strongest.currentStrength = 1;
        events.push(`Blaze inflige ${dmg} dégâts à ${strongest.demon.type} (str ${strongest.currentStrength}).`);
        if (strongest.currentStrength <= 0) {
          demons.splice(demons.indexOf(strongest), 1);
          events.push(`${strongest.demon.type} détruit!`);
          onDemonKilled(state, locId);
        }
      }
      break;
    }
    case 'stone': {
      // Bulwark: 0 damage this wave
      const loc = getLocation(state, locId);
      (loc as any)._bulwarkActive = true;
      events.push(`Bulwark activé — ${loc.name} est protégé cette vague.`);
      break;
    }
    case 'wind': {
      // Gale: redirect up to 3 non-locked, non-boss, non-wind demons
      let redirected = 0;
      const adjacent = getAdjacentIds(locId);
      for (let i = demons.length - 1; i >= 0 && redirected < 3; i--) {
        const d = demons[i];
        if (!d.demon.isLocked && !d.demon.isBoss && d.demon.type !== 'wind') {
          const target = adjacent[Math.floor(Math.random() * adjacent.length)];
          state.demonsAtLocations[target].push(d);
          demons.splice(i, 1);
          redirected++;
          events.push(`${d.demon.type} redirigé vers ${getLocation(state, target).name}.`);
        }
      }
      break;
    }
    case 'light': {
      // Flare: 1 damage to all + rearrange 1
      const dmg = 1 + presenceBonus;
      for (let i = demons.length - 1; i >= 0; i--) {
        demons[i].currentStrength -= dmg;
        if (demons[i].currentStrength <= 0) {
          events.push(`${demons[i].demon.type} détruit par Flare!`);
          onDemonKilled(state, locId);
          demons.splice(i, 1);
        }
      }
      break;
    }
    case 'bone': {
      // Mend: heal 2 Pop
      const loc = getLocation(state, locId);
      const healed = Math.min(2, loc.maxPopulation - loc.population);
      loc.population += healed;
      events.push(`Mend soigne ${healed} Pop à ${loc.name}.`);
      break;
    }
  }
}

function applyComboActive(state: GameState, locId: LocationId, combo: WardCombo | TripleWardCombo, presenceBonus: number, events: string[]) {
  const demons = state.demonsAtLocations[locId];
  const loc = getLocation(state, locId);
  const powerBonus = state.hero.wardPowerBonus ?? 0;

  switch (combo.name) {
    case 'Magma': {
      // Éruption: 4 dmg to strongest + 3 defense
      if (demons.length > 0) {
        const strongest = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        const dmg = 4 + presenceBonus + powerBonus;
        strongest.currentStrength -= dmg;
        events.push(`Eruption: ${dmg} dégâts à ${strongest.demon.type}.`);
        if (strongest.currentStrength <= 0) {
          demons.splice(demons.indexOf(strongest), 1);
          events.push(`${strongest.demon.type} détruit!`);
          onDemonKilled(state, locId);
        }
      }
      (loc as any)._comboDefense = 3;
      events.push('+3 défense cette vague.');
      break;
    }
    case 'Tempête': {
      // Ouragan: rearrange up to 3 demons between any locations
      const tempRedirectables = demons.filter(d => !d.demon.isLocked && !d.demon.isBoss);
      const tempCount = Math.min(3, tempRedirectables.length);
      for (let i = 0; i < tempCount; i++) {
        const d = tempRedirectables[i];
        const adjIds = getAdjacentIds(locId);
        const target = adjIds.reduce((best, a) => {
          const c = (state.demonsAtLocations[a] ?? []).length;
          const bc = (state.demonsAtLocations[best] ?? []).length;
          return c < bc ? a : best;
        }, adjIds[0]);
        const idx = demons.indexOf(d);
        if (idx >= 0) {
          demons.splice(idx, 1);
          state.demonsAtLocations[target].push(d);
          events.push(`Ouragan: ${d.demon.type} redirigé vers ${getLocation(state, target).name}.`);
        }
      }
      if (tempCount === 0) events.push('Ouragan: aucun démon redistribuable.');
      break;
    }
    case 'Cataclysme': {
      // Cataclysme: 5 dmg to strongest + immune + redirect all non-locked
      if (demons.length > 0) {
        const strongest = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        const dmg = 5 + presenceBonus + powerBonus;
        strongest.currentStrength -= dmg;
        events.push(`Cataclysm: ${dmg} dégâts à ${strongest.demon.type}.`);
        if (strongest.currentStrength <= 0) {
          demons.splice(demons.indexOf(strongest), 1);
          events.push(`${strongest.demon.type} détruit!`);
          onDemonKilled(state, locId);
        }
      }
      (loc as any)._bulwarkActive = true;
      // Redirect remaining non-locked
      const adj = getAdjacentIds(locId);
      for (let i = demons.length - 1; i >= 0; i--) {
        if (!demons[i].demon.isLocked && !demons[i].demon.isBoss) {
          const target = adj[Math.floor(Math.random() * adj.length)];
          state.demonsAtLocations[target].push(demons[i]);
          events.push(`${demons[i].demon.type} redirigé vers ${getLocation(state, target).name}.`);
          demons.splice(i, 1);
        }
      }
      break;
    }
    case 'Lumière Divine': {
      // Lumière Divine: 4 dmg to all + heal 2 + purge str<=3
      const dmg = 4 + presenceBonus + powerBonus;
      for (let i = demons.length - 1; i >= 0; i--) {
        demons[i].currentStrength -= dmg;
        if (demons[i].currentStrength <= 0) {
          events.push(`${demons[i].demon.type} purifié par Divine Light!`);
          onDemonKilled(state, locId);
          demons.splice(i, 1);
        }
      }
      loc.population = Math.min(loc.maxPopulation, loc.population + 2);
      events.push(`Divine Light: +2 Pop à ${loc.name}.`);
      break;
    }
    case 'Grand Sanctuaire': {
      // Grande Restauration: heal all 2 pop + rearrange non-boss
      for (const l of state.locations) {
        if (!l.fallen) l.population = Math.min(l.maxPopulation, l.population + 2);
      }
      events.push('Grand Restoration: +2 Pop partout!');
      break;
    }
    case 'Bastion Éternel': {
      // Dernier Rempart: 4 dmg to strongest + immune + heal 3
      if (demons.length > 0) {
        const strongest = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        const dmg = 4 + presenceBonus + powerBonus;
        strongest.currentStrength -= dmg;
        events.push(`Last Stand: ${dmg} dégâts à ${strongest.demon.type}.`);
        if (strongest.currentStrength <= 0) {
          demons.splice(demons.indexOf(strongest), 1);
          events.push(`${strongest.demon.type} détruit!`);
          onDemonKilled(state, locId);
        }
      }
      (loc as any)._bulwarkActive = true;
      loc.population = Math.min(loc.maxPopulation, loc.population + 3);
      events.push(`+3 Pop et immunité à ${loc.name}.`);
      break;
    }
    case 'Nexus': {
      // Apocalypse: 3 dmg to all here + all adjacent
      const dmg = 3 + presenceBonus + powerBonus;
      for (let i = demons.length - 1; i >= 0; i--) {
        demons[i].currentStrength -= dmg;
        if (demons[i].currentStrength <= 0) {
          events.push(`${demons[i].demon.type} détruit par Apocalypse!`);
          onDemonKilled(state, locId);
          demons.splice(i, 1);
        }
      }
      for (const adjId of getAdjacentIds(locId)) {
        const adjDemons = state.demonsAtLocations[adjId];
        for (let i = adjDemons.length - 1; i >= 0; i--) {
          adjDemons[i].currentStrength -= dmg;
          if (adjDemons[i].currentStrength <= 0) {
            events.push(`${adjDemons[i].demon.type} détruit à ${getLocation(state, adjId).name}!`);
            onDemonKilled(state, adjId);
            adjDemons.splice(i, 1);
          }
        }
      }
      events.push(`Apocalypse: ${dmg} dégâts ici et aux lieux adjacents!`);
      break;
    }
    case 'Inferno': {
      // Tempête de Feu: 2 dmg to all here + adjacent locations
      const dmg = 2 + presenceBonus + powerBonus;
      for (let i = demons.length - 1; i >= 0; i--) {
        demons[i].currentStrength -= dmg;
        if (demons[i].currentStrength <= 0) {
          events.push(`${demons[i].demon.type} détruit par Tempête de Feu!`);
          onDemonKilled(state, locId);
          demons.splice(i, 1);
        }
      }
      for (const adjId of getAdjacentIds(locId)) {
        const adjDemons = state.demonsAtLocations[adjId];
        for (let i = adjDemons.length - 1; i >= 0; i--) {
          adjDemons[i].currentStrength -= dmg;
          if (adjDemons[i].currentStrength <= 0) {
            events.push(`${adjDemons[i].demon.type} détruit à ${getLocation(state, adjId).name}!`);
            onDemonKilled(state, adjId);
            adjDemons.splice(i, 1);
          }
        }
      }
      events.push(`Tempête de Feu: ${dmg} dégâts ici et adjacents!`);
      break;
    }
    case 'Forteresse': {
      // Rempart: +5 defense this wave + attract 1 demon from each adjacent
      (loc as any)._comboDefense = ((loc as any)._comboDefense ?? 0) + 5;
      for (const adjId of getAdjacentIds(locId)) {
        const adjDemons = state.demonsAtLocations[adjId];
        const pullable = adjDemons.findIndex(d => !d.demon.isLocked && !d.demon.isBoss);
        if (pullable >= 0) {
          const [pulled] = adjDemons.splice(pullable, 1);
          demons.push(pulled);
          events.push(`Rempart attire ${pulled.demon.type} de ${getLocation(state, adjId).name}.`);
        }
      }
      events.push(`Rempart: +5 défense cette vague à ${loc.name}.`);
      break;
    }
    case 'Renouveau': {
      // Restauration: heal 1 pop everywhere + redirect 2 demons
      for (const l of state.locations) {
        if (!l.fallen && l.population < l.maxPopulation) {
          l.population++;
        }
      }
      events.push('Restauration: +1 Pop partout!');
      const renewRedirect = demons.filter(d => !d.demon.isLocked && !d.demon.isBoss);
      for (let i = 0; i < Math.min(2, renewRedirect.length); i++) {
        const d = renewRedirect[i];
        const adjIds = getAdjacentIds(locId);
        const target = adjIds.reduce((best, a) => {
          return (state.demonsAtLocations[a]?.length ?? 0) < (state.demonsAtLocations[best]?.length ?? 0) ? a : best;
        }, adjIds[0]);
        const idx = demons.indexOf(d);
        if (idx >= 0) {
          demons.splice(idx, 1);
          state.demonsAtLocations[target].push(d);
          events.push(`Restauration: ${d.demon.type} redirigé vers ${getLocation(state, target).name}.`);
        }
      }
      break;
    }
    case 'Sentinelle':
    case 'Révélation': {
      // Jugement/Illumination: 2 defense + 2 dmg to all revealed demons
      (loc as any)._comboDefense = ((loc as any)._comboDefense ?? 0) + 2;
      const revealDmg = 2 + presenceBonus + powerBonus;
      for (let i = demons.length - 1; i >= 0; i--) {
        if (demons[i].revealed) {
          demons[i].currentStrength -= revealDmg;
          if (demons[i].currentStrength <= 0) {
            events.push(`${demons[i].demon.type} jugé et détruit!`);
            onDemonKilled(state, locId);
            demons.splice(i, 1);
          }
        }
      }
      events.push(`${combo.activeName}: +2 défense + ${revealDmg} dégâts aux démons révélés.`);
      break;
    }
    case 'Sanctuaire': {
      // Refuge: heal 3 pop + +4 defense
      loc.population = Math.min(loc.maxPopulation, loc.population + 3);
      (loc as any)._comboDefense = ((loc as any)._comboDefense ?? 0) + 4;
      events.push(`Refuge: +3 Pop et +4 défense à ${loc.name}.`);
      break;
    }
    case 'Phare': {
      // Éclat Solaire: 3 dmg + reveal all at this location
      const phareDmg = 3 + presenceBonus + powerBonus;
      for (let i = demons.length - 1; i >= 0; i--) {
        demons[i].revealed = true;
        demons[i].currentStrength -= phareDmg;
        if (demons[i].currentStrength <= 0) {
          events.push(`${demons[i].demon.type} détruit par Éclat Solaire!`);
          onDemonKilled(state, locId);
          demons.splice(i, 1);
        }
      }
      events.push(`Éclat Solaire: ${phareDmg} dégâts + révélation à ${loc.name}.`);
      break;
    }
    case 'Consécration': {
      // Purification: purge all demons with str <= 2
      for (let i = demons.length - 1; i >= 0; i--) {
        if (demons[i].currentStrength <= 2) {
          events.push(`${demons[i].demon.type} purifié (str ${demons[i].currentStrength})!`);
          onDemonKilled(state, locId);
          demons.splice(i, 1);
        }
      }
      events.push(`Purification: tous les démons faibles purifiés.`);
      break;
    }
    case 'Bûcher': {
      // Crémation: 3 dmg to all, heal 1 pop per kill
      const bucherDmg = 3 + presenceBonus + powerBonus;
      let kills = 0;
      for (let i = demons.length - 1; i >= 0; i--) {
        demons[i].currentStrength -= bucherDmg;
        if (demons[i].currentStrength <= 0) {
          kills++;
          events.push(`${demons[i].demon.type} incinéré!`);
          onDemonKilled(state, locId);
          demons.splice(i, 1);
        }
      }
      if (kills > 0) {
        const healPop = Math.min(kills, loc.maxPopulation - loc.population);
        loc.population += healPop;
        events.push(`Crémation: ${bucherDmg} dégâts à tous, +${healPop} Pop.`);
      } else {
        events.push(`Crémation: ${bucherDmg} dégâts à tous les démons.`);
      }
      break;
    }
    case 'Déviation': {
      // Bourrasque: redirect up to 3 non-locked demons
      const devRedirect = demons.filter(d => !d.demon.isLocked && !d.demon.isBoss);
      const devCount = Math.min(3, devRedirect.length);
      for (let i = 0; i < devCount; i++) {
        const d = devRedirect[i];
        const adjIds = getAdjacentIds(locId);
        const target = adjIds.reduce((best, a) => {
          return (state.demonsAtLocations[a]?.length ?? 0) < (state.demonsAtLocations[best]?.length ?? 0) ? a : best;
        }, adjIds[0]);
        const idx = demons.indexOf(d);
        if (idx >= 0) {
          demons.splice(idx, 1);
          state.demonsAtLocations[target].push(d);
          events.push(`Bourrasque: ${d.demon.type} redirigé vers ${getLocation(state, target).name}.`);
        }
      }
      if (devCount === 0) events.push('Bourrasque: aucun démon redistribuable.');
      break;
    }
    case 'Soufflet': {
      // Brasier: 4 dmg to strongest (no redirect)
      if (demons.length > 0) {
        const strongest = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        const dmg = 4 + presenceBonus + powerBonus;
        strongest.currentStrength -= dmg;
        events.push(`Brasier: ${dmg} dégâts à ${strongest.demon.type}.`);
        if (strongest.currentStrength <= 0) {
          demons.splice(demons.indexOf(strongest), 1);
          events.push(`${strongest.demon.type} détruit!`);
          onDemonKilled(state, locId);
        }
      }
      break;
    }
    case 'Forge': {
      // Forge: 3 dmg + 2 defense
      if (demons.length > 0) {
        const strongest = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        const dmg = 3 + presenceBonus + powerBonus;
        strongest.currentStrength -= dmg;
        events.push(`Forge: ${dmg} dégâts à ${strongest.demon.type}.`);
        if (strongest.currentStrength <= 0) {
          demons.splice(demons.indexOf(strongest), 1);
          events.push(`${strongest.demon.type} détruit!`);
          onDemonKilled(state, locId);
        }
      }
      (loc as any)._comboDefense = ((loc as any)._comboDefense ?? 0) + 2;
      events.push('+2 défense cette vague.');
      break;
    }
    default:
      events.push(`${combo.activeName} activé.`);
  }
}

function onDemonKilled(state: GameState, locationId: LocationId) {
  // Arlen charge
  if (state.hero.id === 'arlen' && locationId === state.presenceLocation) {
    state.hero.arlenCharge = (state.hero.arlenCharge ?? 0) + 1;
    if (state.hero.arlenCharge >= 5) {
      addLog(state, 'Arlen atteint Charge 5 — Mist Walk disponible!', true);
    }
  }

  // Leesha Hora Craft
  if (state.hero.id === 'leesha') {
    // +1 ink to any stockpile (pick the one with least)
    const living = state.locations.filter(l => !l.fallen);
    if (living.length > 0) {
      const target = living.reduce((a, b) => a.stockpile.ink <= b.stockpile.ink ? a : b);
      target.stockpile.ink = Math.min(6, target.stockpile.ink + 1);
    }
  }
}

// ============================================================
// Damage Resolution
// ============================================================

export function resolveDamage(state: GameState): string[] {
  const events: string[] = [];

  for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
    const loc = getLocation(state, locId);
    if (loc.fallen) continue;

    const demons = state.demonsAtLocations[locId];
    if (demons.length === 0) continue;

    // Calculate defense (mesh-aware)
    let defense = getWardDefense(loc, state);
    // Forbiddance Circle (Leesha consumable)
    if ((loc as any)._forbiddance > 0) {
      events.push(`${loc.name}: Forbiddance Circle — aucun dégât!`);
      (loc as any)._forbiddance--;
      if ((loc as any)._forbiddance <= 0) delete (loc as any)._forbiddance;
      continue;
    }
    if ((loc as any)._bulwarkActive) {
      events.push(`${loc.name}: Bulwark — aucun dégât!`);
      delete (loc as any)._bulwarkActive;
      delete (loc as any)._comboDefense;
      continue;
    }
    // Filter out lullaby'd demons (Rojer)
    const activeDemonsCount = demons.filter(d => !(d as any)._lullaby).length;
    if (activeDemonsCount === 0 && demons.length > 0) {
      events.push(`${loc.name}: Lullaby — démons endormis, aucun dégât!`);
      for (const d of demons) delete (d as any)._lullaby;
      continue;
    }
    if ((loc as any)._comboDefense) {
      defense += (loc as any)._comboDefense;
      delete (loc as any)._comboDefense;
    }

    // Water demons halve defense
    const hasWater = demons.some(d => d.demon.type === 'water');
    if (hasWater) defense = Math.floor(defense / 2);

    // Rock demons ignore 1 defense
    const hasRock = demons.some(d => d.demon.type === 'rock');
    if (hasRock && defense > 0) defense = Math.max(0, defense - 1);

    // Total demon strength (skip lullaby'd)
    const totalStr = demons.filter(d => !(d as any)._lullaby).reduce((sum, d) => sum + Math.max(0, d.currentStrength), 0);
    // Clean up lullaby markers
    for (const d of demons) delete (d as any)._lullaby;
    const damage = Math.max(0, totalStr - defense);

    if (damage > 0) {
      loc.population -= damage;
      events.push(`${loc.name}: ${damage} dégâts! (Pop: ${Math.max(0, loc.population)})`);

      // Flame demons destroy resources
      const flameCount = demons.filter(d => d.demon.type === 'flame').length;
      for (let i = 0; i < flameCount; i++) {
        const resources: ResourceType[] = ['wood', 'ink', 'food'];
        for (const r of resources) {
          if (loc.stockpile[r] > 0) { loc.stockpile[r]--; break; }
        }
      }

      // Mind demon direct hero damage
      if (locId === state.presenceLocation) {
        const mindDemons = demons.filter(d => d.demon.type === 'mind');
        for (const md of mindDemons) {
          state.hero.hp -= 2;
          events.push(`Mind Demon inflige 2 dégâts directs à ${state.hero.name}! (HP: ${state.hero.hp})`);
        }

        // Overflow to hero
        if (loc.population < 0) {
          const overflow = Math.abs(loc.population);
          state.hero.hp -= overflow;
          events.push(`Overflow: ${overflow} dégâts à ${state.hero.name}! (HP: ${state.hero.hp})`);
          // Arlen charge from damage
          if (state.hero.id === 'arlen') {
            state.hero.arlenCharge = (state.hero.arlenCharge ?? 0) + 1;
          }
        }
      }

      // Check if location falls
      if (loc.population <= 0) {
        loc.population = 0;
        loc.fallen = true;
        loc.fallenNightsAgo = 0;
        // Destroy wards
        loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
        events.push(`${loc.name} est TOMBÉ!`);
        addLog(state, `${loc.name} est tombé!`, true);
        // Hero presence location falls = game over
        if (locId === state.presenceLocation) {
          state.gameOver = true;
          state.victory = false;
          state.defeatReason = `${loc.name} est tombé — ${state.hero.name} est submergé par les démons!`;
        }
        // Demons scatter: ~50% of surviving demons migrate to adjacent alive locations
        const scatterTargets = getAdjacentIds(locId).filter(a => {
          const al = getLocation(state, a);
          return al && !al.fallen && al.maxPopulation > 0;
        });
        if (scatterTargets.length > 0 && demons.length > 0) {
          const scatterCount = Math.ceil(demons.length / 2);
          for (let s = 0; s < scatterCount && demons.length > 0; s++) {
            const d = demons.pop()!;
            const targetId = scatterTargets[s % scatterTargets.length];
            state.demonsAtLocations[targetId].push(d);
            events.push(`${d.demon.type} fuit ${loc.name} vers ${getLocation(state, targetId).name}!`);
          }
        }
      }
    } else {
      events.push(`${loc.name}: wards tiennent! (0 dégâts)`);
    }

    // === WARD WEAR: demons erode wards even if defense holds ===
    if (!loc.fallen && demons.length > 0) {
      const mesh = analyzeMesh(loc);
      // Fortified mesh: no ward wear (strong enough to resist erosion)
      if (mesh.tier === 'fortified') continue;
      let wear = demons.length >= 5 ? 2 : 1;
      // Reinforced mesh: reduce wear by 1
      if (mesh.tier === 'reinforced') wear = Math.max(0, wear - 1);
      if (wear === 0) continue;
      const wardSlots = loc.wards.filter(ws => ws.ward && !ws.isTemporary);

      if (demons.length < 3 && wardSlots.length > 0) {
        // Light pressure: only 1 random ward takes wear
        const target = wardSlots[Math.floor(Math.random() * wardSlots.length)];
        target.durability = Math.max(0, target.durability - wear);
        if (target.durability === 0) {
          events.push(`⚠ ${loc.name}: rune ${target.ward} brisée par l'assaut!`);
          target.ward = null;
          target.xp = 0;
          target.enhanced = false;
        }
      } else {
        // Heavy pressure: all wards take wear
        for (const ws of wardSlots) {
          ws.durability = Math.max(0, ws.durability - wear);
          if (ws.durability === 0) {
            events.push(`⚠ ${loc.name}: rune ${ws.ward} brisée par l'assaut!`);
            ws.ward = null;
            ws.xp = 0;
            ws.enhanced = false;
          }
        }
      }
    }
  }

  // Check defeat — too many locations fallen
  const standing = state.locations.filter(l => !l.fallen && l.maxPopulation > 0).length;
  if (standing < state.minStandingLocations) {
    state.gameOver = true;
    state.victory = false;
    state.defeatReason = `Trop de lieux tombés (${standing} restants).`;
  }
  if (state.hero.hp <= 0) {
    state.gameOver = true;
    state.victory = false;
    state.defeatReason = `${state.hero.name} est tombé au combat.`;
  }

  return events;
}

// ============================================================
// End of Night / Victory
// ============================================================

export function endNight(state: GameState): void {
  // Fallen locations: demons grow
  for (const loc of state.locations) {
    if (loc.fallen) {
      loc.fallenNightsAgo++;
      const demons = state.demonsAtLocations[loc.id];
      for (const d of demons) {
        d.currentStrength += 1;
      }
      // Horde check — fallen location demons attack adjacent
      if (loc.fallenNightsAgo >= HORDE_FORMATION_NIGHTS) {
        addLog(state, `HORDE se forme à ${loc.name}! Les démons attaquent un lieu adjacent!`, true);
        const adjIds = getAdjacentIds(loc.id);
        const aliveAdj = adjIds.filter(a => {
          const adjLoc = getLocation(state, a);
          return adjLoc && !adjLoc.fallen && adjLoc.maxPopulation > 0;
        });
        if (aliveAdj.length > 0) {
          // Attack the adjacent with highest population
          const targetId = aliveAdj.reduce((best, a) => {
            return getLocation(state, a).population > getLocation(state, best).population ? a : best;
          }, aliveAdj[0]);
          const targetLoc = getLocation(state, targetId);
          const hordeDmg = demons.reduce((sum, d) => sum + Math.max(1, d.currentStrength), 0);
          const popLoss = Math.min(targetLoc.population, Math.ceil(hordeDmg / 3));
          targetLoc.population -= popLoss;
          addLog(state, `La Horde de ${loc.name} inflige ${popLoss} pertes à ${targetLoc.name}! (Pop: ${targetLoc.population}/${targetLoc.maxPopulation})`, true);
          if (targetLoc.population <= 0) {
            targetLoc.fallen = true;
            targetLoc.fallenNightsAgo = 0;
            addLog(state, `${targetLoc.name} TOMBE sous l'assaut de la Horde!`, true);
          }
        }
      }
    }
  }

  // Ward degradation is now handled in processDawn (mesh-aware)

  // Clear demons from ALL locations (including fallen — demons don't stay)
  for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
    state.demonsAtLocations[locId] = [];
  }

  // Check victory (Quick Mode AND Campaign)
  if (!state.gameOver) {
    const standing = state.locations.filter(l => !l.fallen && l.maxPopulation > 0).length;
    const nightsPlayed = state.turnNumber;

    if (standing < state.minStandingLocations) {
      state.gameOver = true;
      state.victory = false;
      state.defeatReason = `Trop de lieux tombés (${standing} restants).`;
    } else if (nightsPlayed >= state.maxNights) {
      state.gameOver = true;
      state.victory = true;
      addLog(state, `L'aube se lève — vous avez survécu ${state.maxNights} nuit${state.maxNights > 1 ? 's' : ''}!`, true);
    } else {
      // Continue to next day — LEVEL UP
      state.nightNumber++;
      state.hero.level++;
      if (state.hero.wardPowerBonus < 4) state.hero.wardPowerBonus++;
      state.hero.maxHp += 1;
      state.hero.hp = Math.min(state.hero.hp + 5, state.hero.maxHp); // heal 5 HP
      if (state.hero.id === 'arlen') {
        state.hero.arlenCharge = Math.min((state.hero.arlenCharge ?? 0) + 1, 3);
      }
      if (state.hero.id === 'jardir') {
        // Warriors heal between nights
        for (const w of (state.hero.jardir_warriors ?? [])) w.strength = Math.min(w.strength + 1, 3);
      }
      addLog(state, `Nuit ${nightsPlayed} survécue! Niveau ${state.hero.level} — wards +${state.hero.wardPowerBonus} dégâts, +1 HP max`, true);
    }
  }

  state.phase = 'day';
  state.turnNumber++;
}

// ============================================================
// Threat Forecast
// ============================================================

export function getThreatForecast(state: GameState): Record<LocationId, ThreatLevel> {
  const forecast: Record<LocationId, ThreatLevel> = {} as any;
  const demonsPerWave = DEMONS_PER_WAVE[state.nightNumber] ?? Math.min(12, 6 + Math.floor((state.nightNumber - 12) / 2));

  for (const loc of state.locations) {
    if (loc.fallen) { forecast[loc.id] = 'low'; continue; }

    // Estimate threat based on demon targeting + ward strength
    const defense = getWardDefense(loc);
    let threatScore = 0;

    // Location-specific targeting
    if (loc.id === 'lakton') threatScore += 2; // Water Demons
    if (loc.id === 'desert_spear') threatScore += 1; // some Water Demons
    if (loc.population >= 5) threatScore += 1; // Rock Demons target high pop

    threatScore -= defense;
    threatScore += Math.random() * 2; // some uncertainty

    if (threatScore <= 0) forecast[loc.id] = 'low';
    else if (threatScore <= 2) forecast[loc.id] = 'medium';
    else if (threatScore <= 4) forecast[loc.id] = 'high';
    else forecast[loc.id] = 'extreme';
  }

  return forecast;
}

// ============================================================
// Arlen-specific
// ============================================================

export function arlenWardedFist(state: GameState): string[] {
  if (state.hero.id !== 'arlen' || state.heroWaveAbilityUsed) return ['Déjà utilisé.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];
  const charge = state.hero.arlenCharge ?? 0;
  if (charge <= 0) return ['Pas de charge.'];

  const demons = state.demonsAtLocations[state.presenceLocation];
  if (demons.length === 0) return ['Pas de démon à la Présence.'];

  // Deal damage = charge to strongest demon
  const target = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
  target.currentStrength -= charge;

  state.hero.ap--;
  state.heroWaveAbilityUsed = true;
  const events = [`Warded Fist: ${charge} dégâts à ${target.demon.type}!`];

  if (target.currentStrength <= 0) {
    demons.splice(demons.indexOf(target), 1);
    events.push(`${target.demon.type} détruit!`);
    onDemonKilled(state, state.presenceLocation);
  }

  return events;
}

export function arlenMistWalk(state: GameState, targetLocationId: LocationId): boolean {
  if (state.hero.id !== 'arlen') return false;
  if ((state.hero.arlenCharge ?? 0) < 5) return false;

  state.presenceLocation = targetLocationId;
  state.hero.arlenCharge = 0;
  addLog(state, `Mist Walk! Arlen se téléporte à ${getLocation(state, targetLocationId).name}. Charge reset à 0.`, true);
  return true;
}

// ============================================================
// Arlen Young — Leurre (lure demon to presence)
// ============================================================

export function arlenYoung_leurre(state: GameState): string[] {
  if (state.hero.id !== 'arlen_young') return ['Arlen jeune uniquement.'];
  if (state.heroWaveAbilityUsed) return ['Déjà utilisé cette vague.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];

  const adjacentIds = getAdjacentIds(state.presenceLocation);
  for (const adjId of adjacentIds) {
    const demons = state.demonsAtLocations[adjId];
    const idx = demons.findIndex(d => !d.demon.isLocked && !d.demon.isBoss);
    if (idx >= 0) {
      const [demon] = demons.splice(idx, 1);
      state.demonsAtLocations[state.presenceLocation].push(demon);
      state.hero.ap--;
      state.heroWaveAbilityUsed = true;
      const fromName = getLocation(state, adjId).name;
      const toName = getLocation(state, state.presenceLocation).name;
      addLog(state, `Leurre! Arlen attire un ${demon.demon.type} de ${fromName} vers ${toName}.`, true);
      return [`🏃 Leurre: ${demon.demon.type} attiré de ${fromName} vers ${toName}!`];
    }
  }
  return ['Aucun démon à attirer des lieux adjacents.'];
}

// ============================================================
// Jardir Young — Coup de Lance (spear strike)
// ============================================================

export function jardirYoung_spearStrike(state: GameState): string[] {
  if (state.hero.id !== 'jardir_young') return ['Jardir jeune uniquement.'];
  if (state.heroWaveAbilityUsed) return ['Déjà utilisé cette vague.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];

  const demons = state.demonsAtLocations[state.presenceLocation];
  if (demons.length === 0) return ['Pas de démon à la Présence.'];

  const target = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
  target.currentStrength -= 2;
  state.hero.ap--;
  state.heroWaveAbilityUsed = true;

  const events = [`🔱 Coup de Lance: 2 dégâts à ${target.demon.type}!`];
  if (target.currentStrength <= 0) {
    demons.splice(demons.indexOf(target), 1);
    events.push(`${target.demon.type} détruit!`);
    onDemonKilled(state, state.presenceLocation);
  }
  addLog(state, `Coup de Lance: 2 dégâts à ${target.demon.type}.`);
  return events;
}

// ============================================================
// Rojer Young — Mélodie Instinctive (weaken demon)
// ============================================================

export function rojerYoung_melody(state: GameState): string[] {
  if (state.hero.id !== 'rojer_young') return ['Rojer jeune uniquement.'];
  if (state.heroWaveAbilityUsed) return ['Déjà utilisé cette vague.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];

  const demons = state.demonsAtLocations[state.presenceLocation];
  if (demons.length === 0) return ['Pas de démon à la Présence.'];

  const target = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
  target.currentStrength = Math.max(0, target.currentStrength - 2);
  state.hero.ap--;
  state.heroWaveAbilityUsed = true;

  const events = [`🎵 Mélodie Instinctive: ${target.demon.type} affaibli (force ${target.currentStrength})!`];
  if (target.currentStrength <= 0) {
    demons.splice(demons.indexOf(target), 1);
    events.push(`${target.demon.type} dissipé par la musique!`);
    onDemonKilled(state, state.presenceLocation);
  }
  addLog(state, `Mélodie Instinctive affaiblit ${target.demon.type}.`);
  return events;
}

// ============================================================
// Leesha Young — Cataplasme (heal population)
// ============================================================

export function leeshaYoung_cataplasme(state: GameState): string[] {
  if (state.hero.id !== 'leesha_young') return ['Leesha jeune uniquement.'];
  if (state.heroWaveAbilityUsed) return ['Déjà utilisé cette vague.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];

  // Heal the location at presence (or most damaged)
  const loc = getLocation(state, state.presenceLocation);
  if (loc.fallen) return ['Lieu tombé.'];

  const healed = Math.min(2, loc.maxPopulation - loc.population);
  loc.population += healed;
  state.hero.ap--;
  state.heroWaveAbilityUsed = true;

  addLog(state, `Cataplasme: +${healed} Pop à ${loc.name}.`);
  return [`🌿 Cataplasme: +${healed} Pop à ${loc.name} (${loc.population}/${loc.maxPopulation})`];
}

// ============================================================
// Jardir-specific
// ============================================================

export function jardir_deployWarrior(state: GameState, locationId: LocationId): string[] {
  if (state.hero.id !== 'jardir') return ['Jardir uniquement.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];
  const loc = getLocation(state, locationId);
  if (loc.fallen) return ['Lieu tombé.'];

  state.hero.jardir_warriors = state.hero.jardir_warriors ?? [];
  state.hero.jardir_warriors.push({ locationId, strength: 2 });
  state.hero.ap--;

  addLog(state, `Sharum déployé à ${loc.name} (force 2).`);
  return [`Guerrier Sharum déployé à ${loc.name} (force 2).`];
}

export function jardir_crownOfKaji(state: GameState): string[] {
  if (state.hero.id !== 'jardir') return ['Jardir uniquement.'];
  if (state.hero.ap < 2) return ['Coûte 2 AP.'];
  const warriors = state.hero.jardir_warriors ?? [];
  if (warriors.length === 0) return ['Aucun guerrier déployé.'];

  for (const w of warriors) w.strength += 2;
  state.hero.ap -= 2;

  addLog(state, 'Crown of Kaji! Tous les guerriers +2 force.', true);
  return [`Crown of Kaji: ${warriors.length} guerrier(s) gagnent +2 force!`];
}

export function jardir_rally(state: GameState): string[] {
  if (state.hero.id !== 'jardir' || state.heroWaveAbilityUsed) return ['Déjà utilisé.'];
  const warriors = (state.hero.jardir_warriors ?? []).filter(w => w.locationId === state.presenceLocation);
  if (warriors.length === 0) return ['Pas de guerrier à la Présence.'];

  const target = warriors[0];
  target.strength = 3; // heal to full (2) + 1 bonus
  state.heroWaveAbilityUsed = true;

  addLog(state, `Rally! Guerrier à ${getLocation(state, target.locationId).name} monte à force ${target.strength}.`);
  return [`Rally: guerrier à la Présence monte à force ${target.strength}!`];
}

/** Auto-resolve warrior combat during waves */
export function resolveWarriorCombat(state: GameState): string[] {
  if (state.hero.id !== 'jardir') return [];
  const warriors = state.hero.jardir_warriors ?? [];
  const events: string[] = [];

  for (let i = warriors.length - 1; i >= 0; i--) {
    const w = warriors[i];
    const demons = state.demonsAtLocations[w.locationId];
    if (!demons || demons.length === 0) continue;

    // Warrior attacks weakest demon
    const weakest = demons.reduce((a, b) => a.currentStrength <= b.currentStrength ? a : b);
    weakest.currentStrength -= w.strength;
    events.push(`Sharum (${w.strength}) combat ${weakest.demon.type} à ${getLocation(state, w.locationId).name}.`);

    if (weakest.currentStrength <= 0) {
      demons.splice(demons.indexOf(weakest), 1);
      events.push(`${weakest.demon.type} détruit par le guerrier!`);
      onDemonKilled(state, w.locationId);
    } else {
      // Demon counter-attacks — warrior takes 1 damage
      w.strength -= 1;
      if (w.strength <= 0) {
        warriors.splice(i, 1);
        events.push('Guerrier Sharum tombé au combat!');
      }
    }
  }

  return events;
}

// ============================================================
// Rojer-specific
// ============================================================

export function rojer_rehearse(state: GameState, songs: [SongType | null, SongType | null, SongType | null]): string[] {
  if (state.hero.id !== 'rojer') return ['Rojer uniquement.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];

  state.hero.rojer_songs = songs;
  state.hero.ap--;

  const songNames = songs.filter(Boolean).map(s => SONGS.find(x => x.type === s)?.name ?? s);
  addLog(state, `Répétition: ${songNames.join(', ')}.`);
  return [`Chansons préparées: ${songNames.join(', ')}`];
}

export function rojer_symphony(state: GameState): string[] {
  if (state.hero.id !== 'rojer') return ['Rojer uniquement.'];
  if (state.hero.ap < 2) return ['Coûte 2 AP.'];

  (state as any)._symphonyActive = true;
  state.hero.ap -= 2;

  addLog(state, 'Symphony of the Damned! Toutes les chansons affectent TOUS les lieux cette nuit.', true);
  return ['Symphony of the Damned activée!'];
}

export function rojer_minorCharm(state: GameState): string[] {
  if (state.hero.id !== 'rojer' || state.heroWaveAbilityUsed) return ['Déjà utilisé.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];

  // Move 1 non-locked, non-boss demon from adjacent to Presence
  const adjacentIds = getAdjacentIds(state.presenceLocation);
  for (const adjId of adjacentIds) {
    const demons = state.demonsAtLocations[adjId];
    const idx = demons.findIndex(d => !d.demon.isLocked && !d.demon.isBoss);
    if (idx >= 0) {
      const [demon] = demons.splice(idx, 1);
      state.demonsAtLocations[state.presenceLocation].push(demon);
      state.hero.ap--;
      state.heroWaveAbilityUsed = true;
      const locName = getLocation(state, state.presenceLocation).name;
      return [`Minor Charm: ${demon.demon.type} attiré vers ${locName}.`];
    }
  }
  return ['Aucun démon à attirer.'];
}

/** Auto-resolve songs during waves */
export function resolveSongs(state: GameState, waveIndex: number): string[] {
  if (state.hero.id !== 'rojer') return [];
  const songs = state.hero.rojer_songs ?? [null, null, null];
  const song = songs[waveIndex] ?? null;
  if (!song) return [];

  const events: string[] = [];
  const isSymphony = !!(state as any)._symphonyActive;
  const targetLocations = isSymphony
    ? state.locations.filter(l => !l.fallen).map(l => l.id)
    : [state.presenceLocation, ...getAdjacentIds(state.presenceLocation)];

  for (const locId of targetLocations) {
    const demons = state.demonsAtLocations[locId];
    if (!demons || demons.length === 0) continue;

    switch (song) {
      case 'lullaby': {
        // Demons at location skip their attack (mark them)
        for (const d of demons) (d as any)._lullaby = true;
        events.push(`Lullaby à ${getLocation(state, locId).name}: ${demons.length} démon(s) endormis.`);
        break;
      }
      case 'frenzy': {
        // Demons attack each other (each deals 1 dmg to another)
        for (let i = demons.length - 1; i >= 0; i--) {
          demons[i].currentStrength -= 1;
          if (demons[i].currentStrength <= 0) {
            events.push(`${demons[i].demon.type} détruit par Frenzy à ${getLocation(state, locId).name}!`);
            onDemonKilled(state, locId);
            demons.splice(i, 1);
          }
        }
        if (demons.length > 0) events.push(`Frenzy à ${getLocation(state, locId).name}: démons s'attaquent!`);
        break;
      }
      case 'the_call': {
        // Move up to 2 non-locked demons from adjacent to this location
        if (locId !== state.presenceLocation) break; // only at presence
        let moved = 0;
        for (const adjId of getAdjacentIds(locId)) {
          const adjDemons = state.demonsAtLocations[adjId];
          for (let i = adjDemons.length - 1; i >= 0 && moved < 2; i--) {
            if (!adjDemons[i].demon.isLocked && !adjDemons[i].demon.isBoss) {
              state.demonsAtLocations[locId].push(adjDemons[i]);
              adjDemons.splice(i, 1);
              moved++;
            }
          }
        }
        if (moved > 0) events.push(`The Call: ${moved} démon(s) attirés à la Présence.`);
        break;
      }
      case 'dissipation': {
        // Remove up to 2 demons with str<=2
        let removed = 0;
        for (let i = demons.length - 1; i >= 0 && removed < 2; i--) {
          if (demons[i].currentStrength <= 2) {
            events.push(`Dissipation: ${demons[i].demon.type} dissipé à ${getLocation(state, locId).name}!`);
            onDemonKilled(state, locId);
            demons.splice(i, 1);
            removed++;
          }
        }
        break;
      }
    }
  }

  // Harmony bonus: 3 different songs in wave 3 = +1 activation
  if (waveIndex === 2) {
    const uniqueSongs = new Set(songs.filter(Boolean));
    if (uniqueSongs.size >= 3) {
      state.activationsRemaining += 1;
      events.push('Harmony! 3 chansons différentes — +1 activation bonus!');
    }
  }

  return events;
}

// ============================================================
// Leesha-specific
// ============================================================

export function leesha_craftConsumable(state: GameState, type: Consumable['type'], fromLocationId: LocationId): string[] {
  if (state.hero.id !== 'leesha') return ['Leesha uniquement.'];
  if (state.hero.ap <= 0) return ['Pas assez d\'AP.'];

  const recipe = CONSUMABLE_RECIPES.find(r => r.type === type);
  if (!recipe) return ['Recette inconnue.'];

  const loc = getLocation(state, fromLocationId);
  if (loc.fallen) return ['Lieu tombé.'];
  if (loc.stockpile.wood < recipe.cost.wood || loc.stockpile.ink < recipe.cost.ink || loc.stockpile.food < recipe.cost.food) {
    return ['Ressources insuffisantes.'];
  }

  loc.stockpile.wood -= recipe.cost.wood;
  loc.stockpile.ink -= recipe.cost.ink;
  loc.stockpile.food -= recipe.cost.food;
  state.hero.leesha_consumables = state.hero.leesha_consumables ?? [];
  state.hero.leesha_consumables.push({ type, name: recipe.name });
  state.hero.ap--;

  addLog(state, `${recipe.name} fabriqué depuis ${loc.name}.`);
  return [`${recipe.name} créé!`];
}

export function leesha_useConsumable(state: GameState, index: number, targetLocationId?: LocationId): string[] {
  if (state.hero.id !== 'leesha') return ['Leesha uniquement.'];
  const consumables = state.hero.leesha_consumables ?? [];
  if (index < 0 || index >= consumables.length) return ['Consommable invalide.'];

  const item = consumables[index];
  const events: string[] = [];

  switch (item.type) {
    case 'healing_potion': {
      if (targetLocationId) {
        const loc = getLocation(state, targetLocationId);
        const healed = Math.min(3, loc.maxPopulation - loc.population);
        loc.population += healed;
        events.push(`Healing Potion: +${healed} Pop à ${loc.name}.`);
      } else {
        const healed = Math.min(3, state.hero.maxHp - state.hero.hp);
        state.hero.hp += healed;
        events.push(`Healing Potion: +${healed} HP à ${state.hero.name}.`);
      }
      break;
    }
    case 'firespit': {
      const locId = targetLocationId ?? state.presenceLocation;
      const demons = state.demonsAtLocations[locId];
      if (demons.length > 0) {
        const target = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        target.currentStrength -= 3;
        events.push(`Firespit: 3 dégâts à ${target.demon.type} à ${getLocation(state, locId).name}.`);
        if (target.currentStrength <= 0) {
          demons.splice(demons.indexOf(target), 1);
          events.push(`${target.demon.type} détruit!`);
          onDemonKilled(state, locId);
        }
      }
      break;
    }
    case 'forbiddance_circle': {
      const locId = targetLocationId ?? state.presenceLocation;
      const loc = getLocation(state, locId);
      (loc as any)._forbiddance = locId === state.presenceLocation ? 2 : 1;
      events.push(`Forbiddance Circle: ${loc.name} protégé${locId === state.presenceLocation ? ' (2 vagues)' : ''}.`);
      break;
    }
    case 'hora_lantern': {
      events.push('Hora Lantern: tous les démons révélés cette vague!');
      break;
    }
  }

  consumables.splice(index, 1);
  return events;
}

export function leesha_greaterWardCircle(state: GameState): string[] {
  if (state.hero.id !== 'leesha') return ['Leesha uniquement.'];
  if (state.hero.ap < 3) return ['Coûte 3 AP.'];

  // Place a temporary ward at every location that has an empty slot
  for (const loc of state.locations) {
    if (loc.fallen) continue;
    const emptyIdx = loc.wards.findIndex(ws => !ws.ward);
    if (emptyIdx >= 0) {
      const wardType: WardType = loc.wards.some(w => w.ward === 'fire') ? 'stone' : 'fire';
      loc.wards[emptyIdx] = { ward: wardType, isTemporary: true, durability: 1, xp: 0, enhanced: false };
    }
  }

  state.hero.ap -= 3;
  addLog(state, 'Greater Ward Circle! Wards temporaires placés partout.', true);
  return ['Greater Ward Circle: ward temporaire à chaque lieu!'];
}

export function leesha_triage(state: GameState, consumableIndex: number, targetLocationId?: LocationId): string[] {
  if (state.hero.id !== 'leesha' || state.heroWaveAbilityUsed) return ['Déjà utilisé.'];
  const result = leesha_useConsumable(state, consumableIndex, targetLocationId);
  state.heroWaveAbilityUsed = true;
  return result;
}

// ============================================================
// HP-Cost Abilities (all heroes)
// ============================================================

/** Surge of Will: spend 2 HP to recover 1 AP (max 2/day) */
export function surgeOfWill(state: GameState): string[] {
  if (state.phase !== 'day') return ['Uniquement le jour.'];
  if (state.hero.hp <= 3) return ['Trop peu de HP (min 4).'];
  const used = (state as any)._surgeOfWillUsed ?? 0;
  if (used >= 2) return ['Maximum 2 Surge of Will par jour.'];

  state.hero.hp -= 2;
  state.hero.ap += 1;
  (state as any)._surgeOfWillUsed = used + 1;

  addLog(state, `Surge of Will! -2 HP → +1 AP (HP: ${state.hero.hp})`, true);
  return [`💉 Surge of Will: -2 HP, +1 AP (HP: ${state.hero.hp})`];
}

/** Arlen — Blood Ward: spend 3 HP to place a PERMANENT ward (no AP cost) */
export function arlenBloodWard(state: GameState, wardType: WardType, targetLocationId: LocationId): string[] {
  if (state.hero.id !== 'arlen') return ['Arlen uniquement.'];
  if (state.hero.hp <= 4) return ['Trop peu de HP (min 5).'];

  const loc = getLocation(state, targetLocationId);
  if (loc.fallen) return ['Lieu tombé.'];
  const emptySlot = loc.wards.findIndex(w => !w.ward);
  if (emptySlot < 0) return ['Pas d\'emplacement libre.'];

  loc.wards[emptySlot] = { ward: wardType, isTemporary: false, durability: 4, xp: 0, enhanced: false };
  state.hero.hp -= 3;

  addLog(state, `Blood Ward! ${wardType} permanent à ${loc.name} (-3 HP).`, true);
  return [`🩸 Blood Ward: ${wardType} permanent placé à ${loc.name} (-3 HP, HP: ${state.hero.hp})`];
}

/** Jardir — Sacrifice Sharum: destroy a warrior, deal its str x2 damage to all demons at location */
export function jardir_sacrifice(state: GameState, locationId: LocationId): string[] {
  if (state.hero.id !== 'jardir') return ['Jardir uniquement.'];
  if (state.hero.hp <= 3) return ['Trop peu de HP (min 4).'];
  const warriors = state.hero.jardir_warriors ?? [];
  const wIdx = warriors.findIndex(w => w.locationId === locationId);
  if (wIdx < 0) return ['Pas de guerrier à ce lieu.'];

  const warrior = warriors[wIdx];
  const dmg = warrior.strength * 2;
  warriors.splice(wIdx, 1);
  state.hero.hp -= 2;

  const demons = state.demonsAtLocations[locationId];
  const events: string[] = [`🩸 Sacrifice Sharum: guerrier (force ${warrior.strength}) explose! ${dmg} dégâts à tous les démons (-2 HP)`];

  for (let i = demons.length - 1; i >= 0; i--) {
    demons[i].currentStrength -= dmg;
    if (demons[i].currentStrength <= 0) {
      events.push(`${demons[i].demon.type} détruit par le sacrifice!`);
      onDemonKilled(state, locationId);
      demons.splice(i, 1);
    }
  }

  addLog(state, `Sacrifice Sharum à ${getLocation(state, locationId).name}: ${dmg} dégâts à tous! (-2 HP)`, true);
  return events;
}

/** Rojer — Desperate Melody: spend 3 HP to play an extra song this wave */
export function rojer_desperateMelody(state: GameState, songType: SongType): string[] {
  if (state.hero.id !== 'rojer') return ['Rojer uniquement.'];
  if (state.hero.hp <= 4) return ['Trop peu de HP (min 5).'];
  if (state.phase !== 'night' || state.waveNumber === 0) return ['Uniquement pendant une vague.'];

  state.hero.hp -= 3;

  // Apply the song immediately at presence + adjacent
  const isSymphony = !!(state as any)._symphonyActive;
  const targetLocations = isSymphony
    ? state.locations.filter(l => !l.fallen).map(l => l.id)
    : [state.presenceLocation, ...getAdjacentIds(state.presenceLocation)];

  const events: string[] = [`🩸 Desperate Melody: ${SONGS.find(s => s.type === songType)?.name ?? songType} (-3 HP)`];

  for (const locId of targetLocations) {
    const demons = state.demonsAtLocations[locId];
    if (!demons || demons.length === 0) continue;
    switch (songType) {
      case 'lullaby':
        for (const d of demons) (d as any)._lullaby = true;
        events.push(`Lullaby à ${getLocation(state, locId).name}: ${demons.length} démon(s) endormis.`);
        break;
      case 'frenzy':
        for (let i = demons.length - 1; i >= 0; i--) {
          demons[i].currentStrength -= 1;
          if (demons[i].currentStrength <= 0) {
            events.push(`${demons[i].demon.type} détruit par Frenzy!`);
            onDemonKilled(state, locId);
            demons.splice(i, 1);
          }
        }
        break;
      case 'dissipation': {
        let removed = 0;
        for (let i = demons.length - 1; i >= 0 && removed < 2; i--) {
          if (demons[i].currentStrength <= 2) {
            events.push(`${demons[i].demon.type} dissipé!`);
            onDemonKilled(state, locId);
            demons.splice(i, 1);
            removed++;
          }
        }
        break;
      }
      case 'the_call': {
        // Move demons to presence only
        if (locId !== state.presenceLocation) break;
        let moved = 0;
        for (const adjId of getAdjacentIds(locId)) {
          const adj = state.demonsAtLocations[adjId];
          for (let i = adj.length - 1; i >= 0 && moved < 2; i--) {
            if (!adj[i].demon.isLocked && !adj[i].demon.isBoss) {
              state.demonsAtLocations[locId].push(adj[i]);
              adj.splice(i, 1);
              moved++;
            }
          }
        }
        if (moved > 0) events.push(`The Call: ${moved} démon(s) attirés.`);
        break;
      }
    }
  }

  addLog(state, `Desperate Melody: ${songType} (-3 HP)`, true);
  return events;
}

/** Leesha — Blood Potion: spend 4 HP to create 2 free consumables */
export function leesha_bloodPotion(state: GameState): string[] {
  if (state.hero.id !== 'leesha') return ['Leesha uniquement.'];
  if (state.hero.hp <= 5) return ['Trop peu de HP (min 6).'];

  state.hero.hp -= 4;
  state.hero.leesha_consumables = state.hero.leesha_consumables ?? [];
  state.hero.leesha_consumables.push({ type: 'healing_potion', name: 'Healing Potion' });
  state.hero.leesha_consumables.push({ type: 'firespit', name: 'Firespit' });

  addLog(state, 'Blood Potion! 2 consommables gratuits (-4 HP).', true);
  return [`🩸 Blood Potion: +1 Healing Potion + 1 Firespit (-4 HP, HP: ${state.hero.hp})`];
}

// ============================================================
// Scoring
// ============================================================

export function calculateScore(state: GameState): ChapterScore {
  const noLocationFell = state.locations
    .filter(l => l.maxPopulation > 0)
    .every(l => !l.fallen);
  const heroHealthy = state.hero.hp > state.hero.maxHp * 0.5;

  let stars: 1 | 2 | 3 = 1; // completed
  if (noLocationFell) stars = 2;
  if (noLocationFell && heroHealthy) stars = 3;

  return { stars, noLocationFell, heroHealthy };
}
