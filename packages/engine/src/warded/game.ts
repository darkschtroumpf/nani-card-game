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
  HORDE_FORMATION_NIGHTS, SONGS,
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
  const w1 = loc.wards[0].ward;
  const w2 = loc.wards[1].ward;
  if (!w1 || !w2) return null;
  return WARD_COMBOS.find(c =>
    (c.wards[0] === w1 && c.wards[1] === w2) ||
    (c.wards[0] === w2 && c.wards[1] === w1)
  ) ?? null;
}

function wardedLocationCount(state: GameState): number {
  return state.locations.filter(l => !l.fallen && (l.wards[0].ward || l.wards[1].ward)).length;
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
    wards: [{ ward: null, isTemporary: false }, { ward: null, isTemporary: false }] as [WardSlot, WardSlot],
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
    for (let i = 0; i < 2; i++) {
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

  // Reset Arlen charge
  if (state.hero.id === 'arlen') {
    state.hero.arlenCharge = 1;
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

    // Wind demons are special (group of 3 with str 1 each)
    if (demonDef.type === 'wind') {
      for (let w = 0; w < 3; w++) {
        const windDemon: DemonCard = {
          type: 'wind',
          strength: 1 + (state.currentSurge === 'blood_moon' ? 1 : 0),
          targetLocation: target,
          isLocked: false,
          isBoss: false,
          isPrinceUpgraded: false,
        };
        state.demonsAtLocations[target].push({ demon: windDemon, currentStrength: windDemon.strength, swarmed: false });
      }
      continue; // wind counts as 1 card but spawns 3 demons
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

  switch (demonType) {
    case 'wood':
      // Target least ward defense
      return living.reduce((a, b) => {
        const aDef = getWardDefense(a);
        const bDef = getWardDefense(b);
        return aDef <= bDef ? a : b;
      }).id;
    case 'rock':
      return living.reduce((a, b) => a.population >= b.population ? a : b).id;
    case 'water':
      // 60% Lakton, 40% Desert Spear
      if (Math.random() < 0.6) {
        const lakton = getLocation(state, 'lakton');
        if (!lakton.fallen) return 'lakton';
      }
      const ds = getLocation(state, 'desert_spear');
      if (!ds.fallen) return 'desert_spear';
      return living[Math.floor(Math.random() * living.length)].id;
    case 'mind':
      return state.presenceLocation;
    default:
      return living[Math.floor(Math.random() * living.length)].id;
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
  if (!loc.wards[0].ward && !loc.wards[1].ward) return ['Pas de ward ici.'];

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
    // Activate individual ward
    const ward = loc.wards[0].ward ?? loc.wards[1].ward;
    if (!ward) return ['Pas de ward.'];
    events.push(`${ward} activé à ${loc.name}!`);
    applyWardActive(state, locationId, ward, presenceBonus, events);
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
    // ... other combos would be implemented similarly
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
    if ((loc as any)._bulwarkActive) {
      events.push(`${loc.name}: Bulwark — aucun dégât!`);
      delete (loc as any)._bulwarkActive;
      delete (loc as any)._comboDefense;
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

    // Total demon strength
    const totalStr = demons.reduce((sum, d) => sum + Math.max(0, d.currentStrength), 0);
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
        loc.wards = [{ ward: null, isTemporary: false }, { ward: null, isTemporary: false }];
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
        state.hero.arlenCharge = Math.min((state.hero.arlenCharge ?? 0) + 1, 3); // start next night with more charge
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
