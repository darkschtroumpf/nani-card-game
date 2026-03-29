// ============================================================
// The Warded Man: Sharak Ka — Game Engine
// ============================================================

import type {
  GameState, Location, LocationId, WardType, WardSlot,
  DemonCard, DemonAtLocation, DemonType, DemonSurgeType,
  Hero, HeroId, ResourceStockpile, ResourceType, LogEntry,
  Difficulty, WardCombo, SongType, Consumable, ThreatLevel,
} from './types';
import {
  LOCATIONS, ADJACENCY, WARD_COSTS, WARD_COMBOS,
  DEMON_TYPES, DEMONS_PER_WAVE, QUICK_MODE_SURGES, CAMPAIGN_SURGES,
  QUICK_MODE_STARTING_WARDS, HEROES, SWARM_THRESHOLD,
  HORDE_FORMATION_NIGHTS, SONGS, CONSUMABLE_RECIPES,
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

function getWardCombo(loc: Location): WardCombo | null {
  const activeWards = loc.wards.filter(ws => ws.ward).map(ws => ws.ward!);
  if (activeWards.length < 2) return null;

  // Check triple combos first (3 wards)
  if (activeWards.length >= 3) {
    const tripleCombo = WARD_COMBOS.find(c =>
      c.wards.length === 3 &&
      c.wards.every(cw => activeWards.includes(cw)) &&
      activeWards.filter(w => c.wards.includes(w)).length >= 3
    );
    if (tripleCombo) return tripleCombo;
  }

  // Check double combos (best pair)
  for (const combo of WARD_COMBOS) {
    if (combo.wards.length !== 2) continue;
    if (activeWards.includes(combo.wards[0]) && activeWards.includes(combo.wards[1])) {
      return combo;
    }
  }
  return null;
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
    population: l.startPop,
    maxPopulation: l.startPop,
    primaryResource: l.primaryResource,
    secondaryFoodTurn: l.secondaryFoodTurn,
    wards: [{ ward: null, isTemporary: false }, { ward: null, isTemporary: false }, { ward: null, isTemporary: false }],
    fallen: false,
    fallenNightsAgo: 0,
    stockpile: { wood: 0, ink: 0, food: 0 },
  }));

  // Pre-place wards for Quick Mode
  if (mode === 'quick') {
    for (const sw of QUICK_MODE_STARTING_WARDS) {
      const loc = locations.find(l => l.id === sw.locationId)!;
      loc.wards[0] = { ward: sw.ward, isTemporary: false };
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
    arlenCharge: heroId === 'arlen' ? 1 : undefined,
    jardir_warriors: heroId === 'jardir' ? [] : undefined,
    rojer_songs: heroId === 'rojer' ? [null, null, null] : undefined,
    leesha_consumables: heroId === 'leesha' ? [] : undefined,
  };

  // Night number depends on difficulty
  const nightNumber = difficulty === 'new_moon' ? 2 : difficulty === 'waning' ? 3 : 4;

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
    skillPoints: 0,
    questsCompleted: [],
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

  // Remove temporary wards
  for (const loc of state.locations) {
    for (let i = 0; i < loc.wards.length; i++) {
      if (loc.wards[i].isTemporary) {
        loc.wards[i] = { ward: null, isTemporary: false };
      }
    }
  }

  // Hero dawn heal
  if (state.hero.hp < state.hero.maxHp) {
    state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + 2);
  }

  // Reset AP
  state.hero.ap = HEROES.find(h => h.id === state.hero.id)!.ap;

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

  loc.wards[slotIdx] = { ward: wardType, isTemporary: false };
  state.wardReserves.splice(idx, 1);
  state.hero.ap--;

  const combo = getWardCombo(loc);
  const comboText = combo ? ` → ${combo.name}!` : '';
  addLog(state, `Ward de ${wardType} placé à ${loc.name}${comboText}.`, !!combo);
  return true;
}

export function gather(state: GameState, locationId: LocationId): boolean {
  if (state.hero.ap <= 0) return false;
  const loc = getLocation(state, locationId);
  if (loc.fallen) return false;

  loc.stockpile[loc.primaryResource] = Math.min(6, loc.stockpile[loc.primaryResource] + 2);
  state.hero.ap--;

  addLog(state, `Récolte à ${loc.name}: +2 ${loc.primaryResource}.`);
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

  // Draw surge
  const surgePool = state.mode === 'quick' ? QUICK_MODE_SURGES : CAMPAIGN_SURGES;
  state.currentSurge = surgePool[Math.floor(Math.random() * surgePool.length)];

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
  state.activationsRemaining = wardedLocationCount(state);
  state.activationsUsedAt = [];
  state.heroWaveAbilityUsed = false;

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
  const baseCount = DEMONS_PER_WAVE[state.nightNumber] ?? 6;
  let count = baseCount;

  // Surge modifiers
  if (state.currentSurge === 'swarming_dark') count += 2;
  if (state.currentSurge === 'rising_tide') count += 1; // extra water demon

  // Build demon pool based on night/chapter
  const availableTypes = DEMON_TYPES.filter(d => d.introducedChapter <= (state.mode === 'campaign' ? state.chapter : state.nightNumber));

  for (let i = 0; i < count; i++) {
    const demonDef = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const target = determineDemonTarget(state, demonDef.type);

    let strength = demonDef.baseStrength;

    // Blood Moon surge
    if (state.currentSurge === 'blood_moon') strength += 1;

    // Wind demons: group of 2, SPREAD across locations instead of stacking
    if (demonDef.type === 'wind') {
      const windLocs = shuffle(state.locations.filter(l => !l.fallen).map(l => l.id));
      for (let w = 0; w < 2; w++) {
        const windTarget = windLocs[w % windLocs.length];
        const windDemon: DemonCard = {
          type: 'wind',
          strength: 1 + (state.currentSurge === 'blood_moon' ? 1 : 0),
          targetLocation: windTarget,
          isLocked: false,
          isBoss: false,
          isPrinceUpgraded: false,
        };
        state.demonsAtLocations[windTarget].push({ demon: windDemon, currentStrength: windDemon.strength, swarmed: false });
      }
      continue;
    }

    const demon: DemonCard = {
      type: demonDef.type,
      strength,
      targetLocation: target,
      isLocked: demonDef.isLocked,
      isBoss: demonDef.isBoss,
      isPrinceUpgraded: false,
    };

    state.demonsAtLocations[target].push({ demon, currentStrength: strength, swarmed: false });
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
  for (const loc of state.locations) {
    if (!loc.fallen) continue;
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

function determineDemonTarget(state: GameState, demonType: DemonType): LocationId {
  const living = state.locations.filter(l => !l.fallen);
  if (living.length === 0) return 'cutters_hollow';

  // Anti-clustering: soft cap — locations with many demons are less likely targets
  const demonCounts = new Map<LocationId, number>();
  for (const l of living) {
    demonCounts.set(l.id, (state.demonsAtLocations[l.id] ?? []).length);
  }
  const maxPerLoc = Math.max(2, Math.ceil(DEMONS_PER_WAVE[state.nightNumber] / living.length));

  // Helper: pick among candidates, preferring less crowded locations
  function pickSpread(candidates: Location[]): LocationId {
    // Filter out overly crowded first
    const uncrowded = candidates.filter(l => (demonCounts.get(l.id) ?? 0) < maxPerLoc);
    const pool = uncrowded.length > 0 ? uncrowded : candidates;
    // Weighted random: fewer demons = higher chance
    const weights = pool.map(l => 1 / (1 + (demonCounts.get(l.id) ?? 0)));
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i].id;
    }
    return pool[pool.length - 1].id;
  }

  switch (demonType) {
    case 'wood': {
      // Prefer least defense, but spread
      const sorted = [...living].sort((a, b) => getWardDefense(a) - getWardDefense(b));
      return pickSpread(sorted.slice(0, Math.max(2, Math.ceil(sorted.length / 2))));
    }
    case 'rock':
      return pickSpread(living.sort((a, b) => b.population - a.population).slice(0, 2));
    case 'water': {
      const waterTargets = living.filter(l => l.id === 'lakton' || l.id === 'desert_spear');
      return waterTargets.length > 0 ? pickSpread(waterTargets) : pickSpread(living);
    }
    case 'mind':
      return state.presenceLocation;
    default:
      return pickSpread(living);
  }
}

function getWardDefense(loc: Location): number {
  let def = 0;
  for (const ws of loc.wards) {
    if (ws.ward === 'stone') def += 2;
  }
  // Fortress combo bonus
  const combo = getWardCombo(loc);
  if (combo?.name === 'Fortress Ward') def += 3;
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

    const combo = getWardCombo(loc);

    for (const ws of loc.wards) {
      if (!ws.ward) continue;

      switch (ws.ward) {
        case 'fire': {
          // Deal 1 damage to all demons (2 with Magma combo, +1 at Presence)
          let fireDmg = 1;
          if (combo?.name === 'Magma Ward') fireDmg = 2;
          fireDmg += presenceBonus;

          if (demons.length > 0) {
            for (let i = demons.length - 1; i >= 0; i--) {
              const d = demons[i];
              // Wood demons take double from Fire
              const multiplier = d.demon.type === 'wood' ? 2 : 1;
              d.currentStrength -= fireDmg * multiplier;
              if (d.currentStrength <= 0) {
                events.push(`🜂 ${loc.name}: ${d.demon.type} détruit par Fire passive!`);
                demons.splice(i, 1);
                onDemonKilled(state, loc.id);
              }
            }
            if (demons.length > 0) {
              events.push(`🜂 ${loc.name}: Fire inflige ${fireDmg} à ${demons.length} démon(s).`);
            }
          }
          break;
        }

        case 'stone': {
          // +2 defense (handled in resolveDamage, not here)
          // Just log for clarity
          events.push(`⬡ ${loc.name}: Stone passive — +2 défense.`);
          break;
        }

        case 'wind': {
          // Redirect 1 non-locked, non-Wind demon to adjacent
          if (demons.length > 0) {
            const redirectable = demons.findIndex(d => !d.demon.isLocked && !d.demon.isBoss && d.demon.type !== 'wind');
            if (redirectable >= 0) {
              const adj = getAdjacentIds(loc.id);
              // Pick the adjacent with fewest demons (spread the load)
              let bestAdj = adj[0];
              let bestCount = 99;
              for (const a of adj) {
                const c = (state.demonsAtLocations[a] ?? []).length;
                if (c < bestCount) { bestCount = c; bestAdj = a; }
              }
              const [demon] = demons.splice(redirectable, 1);
              state.demonsAtLocations[bestAdj].push(demon);
              events.push(`🜁 ${loc.name}: ${demon.demon.type} redirigé vers ${getLocation(state, bestAdj).name}.`);
            }
          }
          break;
        }

        case 'light': {
          // Reveal exact demon types (info is already visible in UI)
          // With Storm combo: preview next wave (handled separately)
          break;
        }

        case 'bone': {
          // Heal at dawn (handled in processDawn), not per-wave
          // Haven combo heals 1 Pop per wave
          if (combo?.name === 'Haven Ward') {
            loc.population = Math.min(loc.maxPopulation, loc.population + 1);
            events.push(`☽ ${loc.name}: Haven Ward soigne 1 Pop (${loc.population}/${loc.maxPopulation}).`);
          }
          // Consecration combo: hero heals 1 HP per wave
          if (combo?.name === 'Consecration Ward' && isPresence) {
            state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + 1);
            events.push(`☽ ${loc.name}: Consecration soigne 1 HP héros.`);
          }
          break;
        }
      }
    }

    // Inferno combo (Fire+Wind): Fire passive affects adjacent too
    if (combo?.name === 'Inferno Ward') {
      for (const adjId of getAdjacentIds(loc.id)) {
        const adjDemons = state.demonsAtLocations[adjId];
        if (!adjDemons || adjDemons.length === 0) continue;
        for (let i = adjDemons.length - 1; i >= 0; i--) {
          const d = adjDemons[i];
          const multiplier = d.demon.type === 'wood' ? 2 : 1;
          d.currentStrength -= 1 * multiplier;
          if (d.currentStrength <= 0) {
            events.push(`🜂 ${getLocation(state, adjId).name}: ${d.demon.type} détruit par Inferno!`);
            adjDemons.splice(i, 1);
            onDemonKilled(state, adjId);
          }
        }
      }
    }

    // Beacon combo (Fire+Light): demons killed by Fire give +1 resource
    if (combo?.name === 'Beacon Ward') {
      // Already handled via onDemonKilled (Hora Craft for Leesha)
      // For Beacon, add the resource bonus
      // Count how many demons were killed this resolution at this location
      // (handled implicitly via Fire damage above)
    }
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
    loc.wards[emptySlot] = { ward: wardType, isTemporary: true };
  } else {
    // Both slots full — can't place temp ward
    return false;
  }

  state.hero.ap--;
  addLog(state, `Warded Flesh: ward temporaire de ${wardType} à ${loc.name}.`);
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
    const combo = getWardCombo(loc);
    if (!combo) return ['Pas de combo à ce lieu.'];
    events.push(`${combo.activeName} activé à ${loc.name}!`);
    applyComboActive(state, locationId, combo, presenceBonus, events);
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
  return events;
}

function applyWardActive(state: GameState, locId: LocationId, ward: WardType, presenceBonus: number, events: string[]) {
  const demons = state.demonsAtLocations[locId];
  const powerBonus = state.hero.wardPowerBonus ?? 0;

  switch (ward) {
    case 'fire': {
      // Blaze: 3 + level bonus damage to 1 demon
      if (demons.length > 0) {
        const strongest = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
        const dmg = 3 + presenceBonus + powerBonus;
        strongest.currentStrength -= dmg;
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

function applyComboActive(state: GameState, locId: LocationId, combo: WardCombo, presenceBonus: number, events: string[]) {
  const demons = state.demonsAtLocations[locId];
  const loc = getLocation(state, locId);
  const powerBonus = state.hero.wardPowerBonus ?? 0;

  switch (combo.name) {
    case 'Magma Ward': {
      // Eruption: 4 dmg to strongest + 3 defense
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
    case 'Storm Ward': {
      // Tempest: rearrange up to 3 demons between any locations
      events.push('Tempest: réarrangement de démons disponible.');
      break;
    }
    case 'Infernal Fortress': {
      // Cataclysm: 5 dmg to strongest + immune + redirect all non-locked
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
    case 'Sacred Beacon': {
      // Divine Light: 4 dmg to all + heal 2 + purge str<=3
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
    case 'Tempest Sanctum': {
      // Grand Restoration: heal all 2 pop + rearrange non-boss
      for (const l of state.locations) {
        if (!l.fallen) l.population = Math.min(l.maxPopulation, l.population + 2);
      }
      events.push('Grand Restoration: +2 Pop partout!');
      break;
    }
    case 'Eternal Bastion': {
      // Last Stand: 4 dmg to strongest + immune + heal 3
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
    case 'Storm Nexus': {
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

    // Calculate defense
    let defense = getWardDefense(loc);
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
        loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false }));
        events.push(`${loc.name} est TOMBÉ!`);
        addLog(state, `${loc.name} est tombé!`, true);
      }
    } else {
      events.push(`${loc.name}: wards tiennent! (0 dégâts)`);
    }
  }

  // Check defeat
  const fallenCount = state.locations.filter(l => l.fallen).length;
  if (state.mode === 'quick' && fallenCount >= 2) {
    state.gameOver = true;
    state.victory = false;
    state.defeatReason = `${fallenCount} lieux tombés.`;
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
      // Horde check
      if (loc.fallenNightsAgo >= HORDE_FORMATION_NIGHTS) {
        addLog(state, `HORDE se forme à ${loc.name}! Les démons attaquent un lieu adjacent!`, true);
        // TODO: Horde attacks adjacent
      }
    }
  }

  // Clear demons from living locations
  for (const locId of Object.keys(state.demonsAtLocations) as LocationId[]) {
    const loc = getLocation(state, locId);
    if (!loc.fallen) {
      state.demonsAtLocations[locId] = [];
    }
  }

  // Check victory (Quick Mode — 3 nights)
  if (state.mode === 'quick' && !state.gameOver) {
    const standing = state.locations.filter(l => !l.fallen).length;
    const nightsPlayed = state.turnNumber; // turnNumber increments each day/night cycle

    if (standing < 3) {
      // Too many locations fell
      state.gameOver = true;
      state.victory = false;
      state.defeatReason = `${4 - standing} lieux tombés.`;
    } else if (nightsPlayed >= 3) {
      // Survived 3 nights!
      state.gameOver = true;
      state.victory = true;
      addLog(state, 'L\'aube se lève pour la dernière fois — vous avez survécu 3 nuits!', true);
    } else {
      // Continue to next day — LEVEL UP
      state.nightNumber++;
      state.hero.level++;
      state.hero.wardPowerBonus++;
      state.hero.maxHp += 2;
      state.hero.hp = Math.min(state.hero.hp + 5, state.hero.maxHp); // heal 5 HP
      if (state.hero.id === 'arlen') {
        state.hero.arlenCharge = Math.min((state.hero.arlenCharge ?? 0) + 1, 3);
      }
      if (state.hero.id === 'jardir') {
        // Warriors heal between nights
        for (const w of (state.hero.jardir_warriors ?? [])) w.strength = Math.min(w.strength + 1, 3);
      }
      addLog(state, `Nuit ${nightsPlayed} survécue! Niveau ${state.hero.level} — wards +${state.hero.wardPowerBonus} dégâts, +2 HP max`, true);
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
  const demonsPerWave = DEMONS_PER_WAVE[state.nightNumber] ?? 6;

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
  const charge = state.hero.arlenCharge ?? 0;
  if (charge <= 0) return ['Pas de charge.'];

  const demons = state.demonsAtLocations[state.presenceLocation];
  if (demons.length === 0) return ['Pas de démon à la Présence.'];

  // Deal damage = charge to strongest demon
  const target = demons.reduce((a, b) => a.currentStrength >= b.currentStrength ? a : b);
  target.currentStrength -= charge;

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

  // Move 1 non-locked, non-boss demon from adjacent to Presence
  const adjacentIds = getAdjacentIds(state.presenceLocation);
  for (const adjId of adjacentIds) {
    const demons = state.demonsAtLocations[adjId];
    const idx = demons.findIndex(d => !d.demon.isLocked && !d.demon.isBoss);
    if (idx >= 0) {
      const [demon] = demons.splice(idx, 1);
      state.demonsAtLocations[state.presenceLocation].push(demon);
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
      loc.wards[emptyIdx] = { ward: wardType, isTemporary: true };
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
