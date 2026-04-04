// ============================================================
// The Warded Man: Sharak Ka — Type Definitions
// ============================================================

// --- Locations ---

export type LocationId = 'desert_spear' | 'cutters_hollow' | 'lakton' | 'miln';
export type MapPosition = 'north' | 'west' | 'east' | 'south';

export type TerrainType = 'plains' | 'forest' | 'lake' | 'mountain' | 'desert' | 'underground';

export interface Location {
  id: LocationId;
  name: string;
  position: MapPosition;
  terrain: TerrainType;
  population: number;
  maxPopulation: number;
  primaryResource: ResourceType;
  secondaryFoodTurn: 'odd' | 'even' | null; // produces 1 Food on these turns
  wards: WardSlot[]; // up to 3 ward slots
  fallen: boolean;
  fallenNightsAgo: number; // for Horde tracking
  stockpile: ResourceStockpile;
}

export interface WardSlot {
  ward: WardType | null;
  isTemporary: boolean; // removed at dawn
  durability: number;   // 3 = fresh, 0 = broken. Decreases each night.
  xp: number;           // activations count. At 3 → enhanced.
  enhanced: boolean;    // enhanced wards deal +1 damage and have bonus effects
}

// --- Resources ---

export type ResourceType = 'wood' | 'ink' | 'food';

export interface ResourceStockpile {
  wood: number;
  ink: number;
  food: number;
}

// --- Wards ---

export type WardType = 'fire' | 'stone' | 'wind' | 'light' | 'bone';

// --- Ward Links (chain mechanic) ---

export interface WardLinkProfile {
  leftLinks: number;   // connection strength on left side (incoming)
  rightLinks: number;  // connection strength on right side (outgoing)
}

export type MeshTier = 'fragile' | 'normal' | 'reinforced' | 'fortified';

export interface LinkConnection {
  leftSlot: number;
  rightSlot: number;
  leftWard: WardType;
  rightWard: WardType;
  strength: number;  // min(left.rightLinks, right.leftLinks)
}

export interface MeshAnalysis {
  connections: LinkConnection[];
  meshStrength: number;  // sum of all connection strengths
  tier: MeshTier;
}

export interface WardCombo {
  name: string;
  wards: [WardType, WardType];  // ORDER MATTERS: [left, right]
  minBondStrength: number;       // minimum link strength required
  passiveEffect: string;
  activeEffect: string;
  activeName: string;
  unlockedAtChapter: number;     // progressive unlock
}

export interface TripleWardCombo {
  name: string;
  wards: [WardType, WardType, WardType];  // all 3 in order
  minTotalMesh: number;                    // minimum total mesh strength
  passiveEffect: string;
  activeEffect: string;
  activeName: string;
  unlockedAtChapter: number;
}

// --- Demons ---

export type DemonType = 'wood' | 'rock' | 'wind' | 'water' | 'flame' | 'mind';

export interface DemonCard {
  type: DemonType;
  strength: number;
  targetLocation: LocationId;
  isLocked: boolean; // can't be redirected
  isBoss: boolean;
  isPrinceUpgraded: boolean;
}

export interface DemonAtLocation {
  demon: DemonCard;
  currentStrength: number; // after Swarm, Prince, damage
  swarmed: boolean;
  revealed: boolean; // Light ward passive reveals demon type to player
}

// --- Heroes ---

export type HeroId = 'arlen' | 'arlen_young' | 'jardir' | 'jardir_young' | 'rojer' | 'rojer_young' | 'leesha' | 'leesha_young';

export interface Hero {
  id: HeroId;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  ap: number;
  level: number;          // increases each night survived
  wardPowerBonus: number; // +X damage on all ward actives
  // Hero-specific state
  arlenCharge?: number;
  jardir_warriors?: { locationId: LocationId; strength: number }[];
  rojer_songs?: [SongType | null, SongType | null, SongType | null];
  leesha_consumables?: Consumable[];
}

export type SongType = 'lullaby' | 'frenzy' | 'the_call' | 'dissipation';

export interface Consumable {
  type: 'healing_potion' | 'firespit' | 'forbiddance_circle' | 'hora_lantern';
  name: string;
}

// --- Talent Tree ---

export type TalentId = string; // e.g. 'arlen_young_t1'

export interface TalentDefinition {
  id: TalentId;
  heroId: HeroId;
  name: string;
  description: string;
  cost: number; // stars required
  tier: 1 | 2 | 3;
  effect: {
    type: 'ap_bonus' | 'hp_bonus' | 'ward_power' | 'extra_activation' | 'resource_bonus' | 'heal_dawn';
    value: number;
  };
}

// --- Game State ---

export type GamePhase = 'day' | 'night';
export type DayAction = 'gather' | 'craft' | 'fortify' | 'quest' | 'hero_ability';
export type NightStep = 'surge' | 'presence_move' | 'wave_start' | 'demon_spawn' | 'activate_wards' | 'resolve_passives' | 'resolve_actives' | 'hero_wave_ability' | 'resolve_damage' | 'wave_end';

export interface GameState {
  // Core
  phase: GamePhase;
  nightNumber: number; // 1-12 in campaign, 4 in Quick Midnight
  waveNumber: number; // 1-3 per night
  turnNumber: number; // day count (odd/even for food production)

  // Map
  locations: Location[];
  adjacency: Record<LocationId, LocationId[]>;

  // Hero
  hero: Hero;
  presenceLocation: LocationId;

  // Night state
  currentSurge: DemonSurgeType | null;
  demonsAtLocations: Record<LocationId, DemonAtLocation[]>;
  activationsRemaining: number;
  activationsUsedAt: LocationId[]; // track which locations activated this wave
  heroWaveAbilityUsed: boolean;
  presenceMoveUsed: boolean; // 1 per night

  // Resources
  wardReserves: WardType[]; // crafted but not yet placed

  // Campaign
  mode: 'quick' | 'campaign';
  chapter: number;
  campaignModifiers?: {
    extraDemonsPerWave: number;
    demonStrengthBonus: number;
    forcedSurge?: DemonSurgeType;
    apModifier: number;
  };
  campaignFlags?: Record<string, boolean | number>;

  // Ward progression (chain mechanic)
  availableWards: WardType[];
  maxComboSize: 2 | 3;
  fireCanKill: boolean;

  // Talent effects (applied from campaign save)
  talentEffects: {
    extraActivations: number;
    resourceBonus: number;
    healDawn: number;
  };

  // Ward usage tracking (for adaptive demons)
  wardUsageStats: Record<WardType, number>;

  // Victory condition
  maxNights: number;          // survive this many nights to win
  minStandingLocations: number; // minimum non-fallen locations

  // Game over
  gameOver: boolean;
  victory: boolean;
  defeatReason: string | null;

  // Log
  log: LogEntry[];
}

export interface LogEntry {
  phase: string;
  message: string;
  important: boolean;
}

// --- Demon Surges ---

export type DemonSurgeType =
  | 'blood_moon'        // all demons +1 str
  | 'rising_tide'       // +1 Water Demon per wave
  | 'warding_blight'    // ward passives disabled
  | 'swarming_dark'     // +2 demon cards per wave (campaign only)
  | 'demon_frenzy'      // fallen location demons attack adjacent (campaign only)
  | 'coreling_prince'   // 1 random demon/wave +2 str (campaign only)
  | 'mist_shroud'       // 2 demon cards swap targets per wave
  | 'night_of_courage'; // no effect (lucky break)

// --- Threat Forecast ---

export type ThreatLevel = 'low' | 'medium' | 'high' | 'extreme';

// --- Score / Stars ---

export interface ChapterScore {
  stars: 1 | 2 | 3;
  noLocationFell: boolean;
  heroHealthy: boolean; // HP > 50% at end
}

// --- Quick Mode Difficulty ---

export type Difficulty = 'new_moon' | 'waning' | 'midnight' | 'endless';
