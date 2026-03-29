// ============================================================
// The Warded Man: Sharak Ka — Constants & Data
// ============================================================

import type {
  LocationId, MapPosition, WardType, WardCombo, DemonType,
  DemonSurgeType, ResourceType, HeroId, SongType, Consumable,
} from './types';

// --- Map ---

export const LOCATIONS: { id: LocationId; name: string; position: MapPosition; primaryResource: ResourceType; secondaryFoodTurn: 'odd' | 'even' | null; startPop: number }[] = [
  { id: 'desert_spear', name: 'Desert Spear', position: 'north', primaryResource: 'ink', secondaryFoodTurn: null, startPop: 5 },
  { id: 'cutters_hollow', name: "Cutter's Hollow", position: 'west', primaryResource: 'wood', secondaryFoodTurn: 'odd', startPop: 5 },
  { id: 'lakton', name: 'Lakton', position: 'east', primaryResource: 'food', secondaryFoodTurn: null, startPop: 4 },
  { id: 'miln', name: 'Fort Miln', position: 'south', primaryResource: 'ink', secondaryFoodTurn: 'even', startPop: 5 },
];

export const ADJACENCY: Record<LocationId, LocationId[]> = {
  desert_spear: ['cutters_hollow', 'lakton'],
  cutters_hollow: ['desert_spear', 'miln'],
  lakton: ['desert_spear', 'miln'],
  miln: ['cutters_hollow', 'lakton'],
};

// --- Wards ---

export const WARD_TYPES: WardType[] = ['fire', 'stone', 'wind', 'light', 'bone'];

export const WARD_COSTS: Record<WardType, { wood: number; ink: number; food: number }> = {
  fire: { wood: 2, ink: 0, food: 0 },
  stone: { wood: 2, ink: 0, food: 0 },
  wind: { wood: 0, ink: 2, food: 0 },
  light: { wood: 0, ink: 2, food: 0 },
  bone: { wood: 1, ink: 1, food: 0 },
};

// Ward individual effects
export const WARD_PASSIVES: Record<WardType, string> = {
  fire: 'Deal 1 damage to all demons at this location each wave',
  stone: '+2 ward defense at this location',
  wind: 'Redirect 1 non-locked, non-Wind demon to adjacent location before combat',
  light: 'Reveal exact demon types targeting this location (Threat Forecast upgrade)',
  bone: 'Heal 1 Population at dawn (if below max)',
};

export const WARD_ACTIVES: Record<WardType, { name: string; effect: string }> = {
  fire: { name: 'Blaze', effect: 'Deal 3 damage to 1 demon at this location' },
  stone: { name: 'Bulwark', effect: 'This location takes 0 demon damage this wave' },
  wind: { name: 'Gale', effect: 'Redirect up to 3 non-locked, non-boss, non-Wind demons' },
  light: { name: 'Flare', effect: 'Deal 1 damage to all demons here + rearrange 1 non-locked demon' },
  bone: { name: 'Mend', effect: 'Heal 2 Population at this location (up to max)' },
};

// Ward combos (2 wards at same location)
export const WARD_COMBOS: WardCombo[] = [
  { name: 'Magma Ward', wards: ['fire', 'stone'], passiveEffect: 'Fire passive deals +1 damage (total 2)', activeEffect: '4 damage to strongest demon + 3 defense this wave', activeName: 'Eruption' },
  { name: 'Inferno Ward', wards: ['fire', 'wind'], passiveEffect: 'Fire passive affects adjacent location too', activeEffect: '2 damage to all demons at this + adjacent locations', activeName: 'Firestorm' },
  { name: 'Beacon Ward', wards: ['fire', 'light'], passiveEffect: 'Demons killed by Fire give +1 resource to stockpile', activeEffect: 'Deal 3 damage + reveal all concealed info at this location', activeName: 'Sunburst' },
  { name: 'Pyre Ward', wards: ['fire', 'bone'], passiveEffect: 'Destroyed demons heal 1 Pop', activeEffect: '3 damage to all demons, heal 1 Pop per kill', activeName: 'Cremation' },
  { name: 'Fortress Ward', wards: ['stone', 'wind'], passiveEffect: '+3 defense (total 5 with Stone)', activeEffect: 'Immune this wave + pull 1 demon from each adjacent', activeName: 'Rampart' },
  { name: 'Haven Ward', wards: ['stone', 'bone'], passiveEffect: 'Heal 1 Pop per wave (not just dawn)', activeEffect: 'Heal 3 Pop + immune to demon damage this wave', activeName: 'Sanctuary' },
  { name: 'Storm Ward', wards: ['wind', 'light'], passiveEffect: 'Preview next wave demon cards', activeEffect: 'Rearrange up to 3 non-locked, non-boss demons between any locations', activeName: 'Tempest' },
  { name: 'Renewal Ward', wards: ['wind', 'bone'], passiveEffect: 'Heal 1 Pop when a demon is redirected away', activeEffect: 'Heal all locations 1 Pop + redirect 2 demons', activeName: 'Restoration' },
  { name: 'Consecration Ward', wards: ['light', 'bone'], passiveEffect: 'Hero heals 1 HP per wave at this location', activeEffect: 'Purge all str<=2 demons at this location', activeName: 'Purification' },
  { name: 'Revelation Ward', wards: ['stone', 'light'], passiveEffect: '+2 defense + reveal attacker types', activeEffect: '2 defense + deal 2 damage to all revealed demons', activeName: 'Judgement' },
];

// --- Demons ---

export const DEMON_TYPES: {
  type: DemonType;
  baseStrength: number;
  targeting: string;
  special: string;
  isLocked: boolean;
  isBoss: boolean;
  introducedChapter: number;
}[] = [
  { type: 'flame', baseStrength: 1, targeting: 'random', special: 'Destroys 1 resource at target on hit', isLocked: false, isBoss: false, introducedChapter: 1 },
  { type: 'wood', baseStrength: 2, targeting: 'least_defense', special: 'Takes double damage from Fire wards', isLocked: false, isBoss: false, introducedChapter: 1 },
  { type: 'wind', baseStrength: 1, targeting: 'random', special: 'Group of 3. Cannot be redirected by Wind wards. Counts as 3 for Swarm.', isLocked: false, isBoss: false, introducedChapter: 3 },
  { type: 'water', baseStrength: 3, targeting: 'lakton_or_desert_spear', special: 'Ward defense halved. Location-locked.', isLocked: true, isBoss: false, introducedChapter: 3 },
  { type: 'rock', baseStrength: 4, targeting: 'highest_population', special: 'Ignores 1 point of ward defense', isLocked: false, isBoss: false, introducedChapter: 4 },
  { type: 'mind', baseStrength: 5, targeting: 'hero_presence', special: 'Deals 2 direct damage to hero HP. Boss — immune to redirection.', isLocked: false, isBoss: true, introducedChapter: 7 },
];

// Demons per wave by night number
export const DEMONS_PER_WAVE: Record<number, number> = {
  1: 3, 2: 4, 3: 5, 4: 6, 5: 6, 6: 7, 7: 7, 8: 8, 9: 8, 10: 9, 11: 10, 12: 12,
};

// --- Demon Surges ---

export const QUICK_MODE_SURGES: DemonSurgeType[] = [
  'blood_moon', 'rising_tide', 'warding_blight', 'mist_shroud', 'night_of_courage',
];

export const CAMPAIGN_SURGES: DemonSurgeType[] = [
  'blood_moon', 'rising_tide', 'warding_blight', 'swarming_dark',
  'demon_frenzy', 'coreling_prince', 'mist_shroud', 'night_of_courage',
];

// --- Heroes ---

export const HEROES: {
  id: HeroId;
  name: string;
  title: string;
  ap: number;
  hp: number;
  passive: string;
  signatureName: string;
  signatureEffect: string;
  signatureCost: { ki?: number; focus?: number; ap?: number };
  waveAbility: string;
}[] = [
  {
    id: 'arlen', name: 'Arlen Bales', title: 'The Warded Man',
    ap: 5, hp: 10,
    passive: 'Warded Flesh: Starts each night at Ward Charge 1. Gains +1 Charge per demon killed at Presence. Gains +1 Charge when taking overflow damage.',
    signatureName: 'Mist Walk',
    signatureEffect: 'At Ward Charge 5: teleport Presence to any location. Charge resets to 0.',
    signatureCost: {},
    waveAbility: 'Warded Fist: Deal damage equal to Ward Charge to 1 demon at Presence location. Does not consume Charge.',
  },
  {
    id: 'jardir', name: 'Ahmann Jardir', title: 'Shar\'Dama Ka',
    ap: 5, hp: 10,
    passive: 'Sharum Commander: Deploy warrior tokens (str 2) at any location during Day (1 AP each). Warriors fight demons automatically during Night.',
    signatureName: 'Crown of Kaji',
    signatureEffect: 'All warriors gain +2 strength this night. Deployed warriors persist until destroyed.',
    signatureCost: { ap: 2 },
    waveAbility: 'Rally: One warrior at Presence heals to full and gains +1 str this wave.',
  },
  {
    id: 'rojer', name: 'Rojer Inn', title: 'The Fiddle Wizard',
    ap: 5, hp: 10,
    passive: 'Song Weaver: During Day, spend 1 AP to Rehearse (set all 3 wave songs at once). Songs play automatically during Night. 3 different songs = Harmony bonus (+1 ward activation in Wave 3).',
    signatureName: 'Symphony of the Damned',
    signatureEffect: 'All songs affect ALL locations this night (not just Presence + adjacent).',
    signatureCost: { ap: 2 },
    waveAbility: 'Minor Charm: Move 1 non-locked, non-boss demon from an adjacent location to Presence.',
  },
  {
    id: 'leesha', name: 'Leesha Paper', title: 'Herb Gatherer',
    ap: 6, hp: 10,
    passive: 'Hora Craft: When a demon is killed at any location, gain 1 Ink to any stockpile (once per wave). Triage: Use 1 consumable for free each wave during Night.',
    signatureName: 'Greater Ward Circle',
    signatureEffect: 'Place a temporary ward of any type at every location (1 night only). Does not use slots.',
    signatureCost: { ap: 3 },
    waveAbility: 'Triage: Use 1 consumable from inventory without spending an activation.',
  },
];

// --- Songs (Rojer) ---

export const SONGS: { type: SongType; name: string; effect: string }[] = [
  { type: 'lullaby', name: 'Lullaby', effect: 'All demons at Presence skip their attack this wave' },
  { type: 'frenzy', name: 'Frenzy', effect: 'Demons at Presence attack each other (each deals 1 damage to another)' },
  { type: 'the_call', name: 'The Call', effect: 'Move up to 2 non-locked demons from adjacent locations to Presence' },
  { type: 'dissipation', name: 'Dissipation', effect: 'Remove up to 2 demons with str<=2 at Presence location only' },
];

// --- Consumables (Leesha) ---

export const CONSUMABLE_RECIPES: { type: Consumable['type']; name: string; cost: { wood: number; ink: number; food: number }; effect: string }[] = [
  { type: 'healing_potion', name: 'Healing Potion', cost: { wood: 0, ink: 0, food: 1 }, effect: 'Heal 3 Pop at any location or 3 Hero HP' },
  { type: 'firespit', name: 'Firespit', cost: { wood: 1, ink: 0, food: 0 }, effect: 'Deal 3 damage to 1 demon at any location' },
  { type: 'forbiddance_circle', name: 'Forbiddance Circle', cost: { wood: 0, ink: 1, food: 0 }, effect: '1 location takes 0 demon damage this wave (2 waves at Presence)' },
  { type: 'hora_lantern', name: 'Hora Lantern', cost: { wood: 1, ink: 1, food: 0 }, effect: 'Reveal all demon cards for this wave before activations' },
];

// --- Quick Mode pre-placed wards ---

export const QUICK_MODE_STARTING_WARDS: { locationId: LocationId; ward: WardType }[] = [
  { locationId: 'cutters_hollow', ward: 'fire' },
  { locationId: 'miln', ward: 'wind' },
];

// --- Starting resources (Quick Mode) ---

export const QUICK_MODE_STARTING_RESOURCES = 9; // distributed by player

// --- Campaign chapters ---

export const CAMPAIGN_CHAPTERS = 12;

// --- Swarm threshold ---

export const SWARM_THRESHOLD = 3; // 3+ demons = +1 str each

// --- Horde formation ---

export const HORDE_FORMATION_NIGHTS = 3; // fallen location forms horde after 3 nights
