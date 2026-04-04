// ============================================================
// The Warded Man: Sharak Ka — Constants & Data
// ============================================================

import type {
  LocationId, MapPosition, TerrainType, WardType, WardCombo, TripleWardCombo, DemonType,
  DemonSurgeType, ResourceType, HeroId, SongType, Consumable,
  WardLinkProfile, MeshTier,
} from './types';

// --- Map ---

export const LOCATIONS: { id: LocationId; name: string; position: MapPosition; terrain: TerrainType; primaryResource: ResourceType; secondaryFoodTurn: 'odd' | 'even' | null; startPop: number }[] = [
  { id: 'desert_spear', name: 'Desert Spear', position: 'north', terrain: 'desert', primaryResource: 'ink', secondaryFoodTurn: null, startPop: 6 },
  { id: 'cutters_hollow', name: "Cutter's Hollow", position: 'west', terrain: 'forest', primaryResource: 'wood', secondaryFoodTurn: 'odd', startPop: 6 },
  { id: 'lakton', name: 'Lakton', position: 'east', terrain: 'lake', primaryResource: 'food', secondaryFoodTurn: null, startPop: 5 },
  { id: 'miln', name: 'Fort Miln', position: 'south', terrain: 'mountain', primaryResource: 'ink', secondaryFoodTurn: 'even', startPop: 6 },
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

// --- Ward Link Profiles (chain mechanic) ---
// Each ward has asymmetric connection values: left (incoming) and right (outgoing).
// Connection strength between adjacent wards = min(left_ward.rightLinks, right_ward.leftLinks).
// Thematic logic:
//   Stone: solid both sides (2/2)
//   Wind:  weak entry, strong exit — wind flows through (1/3)
//   Fire:  absorbs energy in, burns output (3/1)
//   Light: balanced radiance (2/2)
//   Bone:  fragile organic connections (1/1)

export const WARD_LINK_PROFILES: Record<WardType, WardLinkProfile> = {
  stone: { leftLinks: 2, rightLinks: 2 },
  wind:  { leftLinks: 1, rightLinks: 3 },
  fire:  { leftLinks: 3, rightLinks: 1 },
  light: { leftLinks: 2, rightLinks: 2 },
  bone:  { leftLinks: 1, rightLinks: 1 },
};

// --- Mesh Tier Thresholds ---
// Mesh strength = sum of link connections at a location.
export const MESH_TIERS: { min: number; max: number; tier: MeshTier; label: string }[] = [
  { min: 0, max: 0, tier: 'fragile', label: 'Fragile' },
  { min: 1, max: 2, tier: 'normal', label: 'Normal' },
  { min: 3, max: 4, tier: 'reinforced', label: 'Renforcé' },
  { min: 5, max: 99, tier: 'fortified', label: 'Fortifié' },
];

// --- Chapter Ward Progression ---
export const CHAPTER_WARD_AVAILABILITY: Record<number, WardType[]> = {
  1: ['stone', 'wind'],
  2: ['stone', 'wind'],
  3: ['stone', 'wind', 'fire'],
  4: ['stone', 'wind', 'fire', 'light'],
  5: ['stone', 'wind', 'fire', 'light'],
  6: ['stone', 'wind', 'fire', 'light', 'bone'],
};
export const CHAPTER_FIRE_CAN_KILL = 4;     // fire deals lethal damage from chapter 4+
export const CHAPTER_TRIPLE_COMBOS = 8;     // triple combos unlock at chapter 8+

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

// --- Ward Combos (directional — order matters!) ---
// Combo triggers when wards[0] is LEFT of wards[1] with bond >= minBondStrength.
// Bond = min(left_ward.rightLinks, right_ward.leftLinks).
// Reference: Wind→Fire=3, Wind→Stone=2, Stone→Fire=2, Stone↔Light=2,
//            Light→Fire=2, Wind→Light=2, Fire→anything=1, Bone→anything=1

export const WARD_COMBOS: WardCombo[] = [
  // Wind combos (strong outgoing R=3)
  { name: 'Inferno', wards: ['wind', 'fire'], minBondStrength: 2, unlockedAtChapter: 3,
    passiveEffect: 'Feu touche aussi le lieu adjacent', activeEffect: '2 dégâts à tous les démons ici + lieux adjacents', activeName: 'Tempête de Feu' },
  { name: 'Forteresse', wards: ['wind', 'stone'], minBondStrength: 2, unlockedAtChapter: 1,
    passiveEffect: '+3 défense totale', activeEffect: 'Immunité cette vague + attire 1 démon de chaque lieu adjacent', activeName: 'Rempart' },
  { name: 'Tempête', wards: ['wind', 'light'], minBondStrength: 2, unlockedAtChapter: 4,
    passiveEffect: 'Prévisualise les démons de la prochaine vague', activeEffect: 'Redistribue jusqu\'à 3 démons non-verrouillés entre lieux', activeName: 'Ouragan' },
  { name: 'Renouveau', wards: ['wind', 'bone'], minBondStrength: 1, unlockedAtChapter: 6,
    passiveEffect: 'Soigne 1 Pop quand un démon est redirigé', activeEffect: 'Soigne 1 Pop partout + redirige 2 démons', activeName: 'Restauration' },

  // Stone combos (solid both sides L=2/R=2)
  { name: 'Magma', wards: ['stone', 'fire'], minBondStrength: 2, unlockedAtChapter: 3,
    passiveEffect: 'Passif Feu +1 dégât (total 2)', activeEffect: '4 dégâts au plus fort + 3 défense cette vague', activeName: 'Éruption' },
  { name: 'Sentinelle', wards: ['stone', 'light'], minBondStrength: 2, unlockedAtChapter: 4,
    passiveEffect: '+2 défense + révèle les types d\'attaquants', activeEffect: '2 défense + 2 dégâts à tous les démons révélés', activeName: 'Jugement' },
  { name: 'Sanctuaire', wards: ['stone', 'bone'], minBondStrength: 1, unlockedAtChapter: 6,
    passiveEffect: 'Soigne 1 Pop par vague (pas seulement à l\'aube)', activeEffect: 'Soigne 3 Pop + immunité cette vague', activeName: 'Refuge' },

  // Light combos (balanced L=2/R=2)
  { name: 'Phare', wards: ['light', 'fire'], minBondStrength: 2, unlockedAtChapter: 4,
    passiveEffect: 'Démons tués par Feu donnent +1 ressource', activeEffect: '3 dégâts + révèle tout à cette location', activeName: 'Éclat Solaire' },
  { name: 'Révélation', wards: ['light', 'stone'], minBondStrength: 2, unlockedAtChapter: 4,
    passiveEffect: '+2 défense + révèle les types', activeEffect: '2 défense + 2 dégâts aux démons révélés', activeName: 'Illumination' },
  { name: 'Consécration', wards: ['light', 'bone'], minBondStrength: 1, unlockedAtChapter: 6,
    passiveEffect: 'Héros soigne 1 HP par vague ici', activeEffect: 'Purge tous les démons str≤2 ici', activeName: 'Purification' },

  // Bone combos (fragile L=1/R=1 — only 1-bond combos)
  { name: 'Bûcher', wards: ['bone', 'fire'], minBondStrength: 1, unlockedAtChapter: 6,
    passiveEffect: 'Démons détruits soignent 1 Pop', activeEffect: '3 dégâts à tous, soigne 1 Pop par kill', activeName: 'Crémation' },

  // Reverse combos (weaker — Fire/Bone on left have low rightLinks)
  { name: 'Déviation', wards: ['stone', 'wind'], minBondStrength: 1, unlockedAtChapter: 1,
    passiveEffect: 'Redirige +1 démon supplémentaire', activeEffect: 'Redirige jusqu\'à 3 démons non-verrouillés', activeName: 'Bourrasque' },
  { name: 'Soufflet', wards: ['fire', 'wind'], minBondStrength: 1, unlockedAtChapter: 3,
    passiveEffect: 'Feu +2 dégâts mais redirect Vent désactivé', activeEffect: '4 dégâts au plus fort (pas de redirect)', activeName: 'Brasier' },
  { name: 'Forge', wards: ['fire', 'stone'], minBondStrength: 1, unlockedAtChapter: 3,
    passiveEffect: 'Passif Feu amélioré (+1 dégât)', activeEffect: '3 dégâts + 2 défense cette vague', activeName: 'Forge' },
];

// --- Triple Ward Combos (3 wards in specific order, chapter 8+) ---
export const TRIPLE_WARD_COMBOS: TripleWardCombo[] = [
  { name: 'Cataclysme', wards: ['wind', 'stone', 'fire'], minTotalMesh: 4, unlockedAtChapter: 8,
    passiveEffect: '2 dégâts à tous, +3 défense, redirect 2', activeEffect: '5 dégâts au plus fort + immunité + redirect tous non-verrouillés', activeName: 'Cataclysme' },
  { name: 'Lumière Divine', wards: ['light', 'fire', 'bone'], minTotalMesh: 3, unlockedAtChapter: 8,
    passiveEffect: '2 dégâts, révèle tout, soigne 1 pop', activeEffect: '4 dégâts à tous, soigne 2 pop, purge str≤3', activeName: 'Lumière Divine' },
  { name: 'Grand Sanctuaire', wards: ['wind', 'light', 'bone'], minTotalMesh: 3, unlockedAtChapter: 8,
    passiveEffect: 'Redirect 2, soigne 1 pop/vague, prévisualise', activeEffect: 'Redistribue tous les non-boss + soigne 2 pop partout', activeName: 'Grande Restauration' },
  { name: 'Bastion Éternel', wards: ['stone', 'fire', 'bone'], minTotalMesh: 3, unlockedAtChapter: 8,
    passiveEffect: '2 dégâts, +3 défense, soigne 1', activeEffect: '4 dégâts au plus fort, immunité, soigne 3 pop', activeName: 'Dernier Rempart' },
  { name: 'Nexus', wards: ['wind', 'fire', 'light'], minTotalMesh: 4, unlockedAtChapter: 8,
    passiveEffect: '1 dégât à tous + adjacent, redirect 1, révèle', activeEffect: '3 dégâts à tous les démons ici + tous lieux adjacents', activeName: 'Apocalypse' },
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
  { type: 'flame', baseStrength: 3, targeting: 'random', special: 'Destroys 1 resource at target on hit', isLocked: false, isBoss: false, introducedChapter: 1 },
  { type: 'wood', baseStrength: 4, targeting: 'least_defense', special: 'Takes double damage from Fire wards', isLocked: false, isBoss: false, introducedChapter: 1 },
  { type: 'wind', baseStrength: 1, targeting: 'random', special: 'Group of 2. Cannot be redirected by Wind wards.', isLocked: false, isBoss: false, introducedChapter: 2 },
  { type: 'water', baseStrength: 3, targeting: 'lakton_or_desert_spear', special: 'Ward defense halved. Location-locked.', isLocked: true, isBoss: false, introducedChapter: 3 },
  { type: 'rock', baseStrength: 4, targeting: 'highest_population', special: 'Ignores 1 point of ward defense', isLocked: false, isBoss: false, introducedChapter: 4 },
  { type: 'mind', baseStrength: 5, targeting: 'hero_presence', special: 'Deals 2 direct damage to hero HP. Boss — immune to redirection.', isLocked: false, isBoss: true, introducedChapter: 7 },
];

// Demons per wave by night number
// Reduced demon counts for better balance (was: 3,4,5,6...)
export const DEMONS_PER_WAVE: Record<number, number> = {
  1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 5, 7: 5, 8: 6, 9: 6, 10: 7, 11: 8, 12: 9,
};

// Terrain → demon type affinity (which demons are attracted to which terrain)
// Based on The Warded Man lore:
// Flame demons: everywhere (common), Wood demons: forests, Wind demons: plains/desert
// Water demons: lakes/rivers, Rock demons: mountains/underground, Mind demons: follow hero
export const TERRAIN_DEMON_AFFINITY: Record<TerrainType, { primary: DemonType[]; secondary: DemonType[] }> = {
  plains:      { primary: ['flame', 'wind'],  secondary: ['wood'] },
  forest:      { primary: ['wood', 'flame'],  secondary: ['wind'] },
  lake:        { primary: ['water', 'flame'], secondary: ['wind'] },
  mountain:    { primary: ['rock', 'flame'],  secondary: ['wind'] },
  desert:      { primary: ['flame', 'wind'],  secondary: ['rock'] },
  underground: { primary: ['rock', 'flame'],  secondary: ['wind'] },
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
    id: 'arlen_young', name: 'Arlen (jeune)', title: 'Le Garçon de Tibbet\'s Brook',
    ap: 4, hp: 8,
    passive: 'Témérité: Arlen est jeune et faible, mais courageux. Il peut attirer les démons pour protéger les autres.',
    signatureName: 'Leurre',
    signatureEffect: 'Attire 1 démon non-boss d\'un lieu adjacent vers la Présence. Peut être utilisé 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Cri de défi: Attire 1 démon supplémentaire vers la Présence, réduisant la pression sur les autres lieux.',
  },
  {
    id: 'arlen', name: 'Arlen Bales', title: 'The Warded Man',
    ap: 6, hp: 10,
    passive: 'Warded Flesh: Starts each night at Ward Charge 1. Gains +1 Charge per demon killed at Presence. Gains +1 Charge when taking overflow damage.',
    signatureName: 'Mist Walk',
    signatureEffect: 'At Ward Charge 5: teleport Presence to any location. Charge resets to 0.',
    signatureCost: {},
    waveAbility: 'Warded Fist: Deal damage equal to Ward Charge to 1 demon at Presence location. Does not consume Charge.',
  },
  {
    id: 'jardir_young', name: 'Jardir (nie\'Sharum)', title: 'Recrue du Maze',
    ap: 5, hp: 9,
    passive: 'Entraînement: Jardir est un jeune guerrier du Maze. Il sait se battre à la lance mais n\'a pas encore de troupes.',
    signatureName: 'Coup de Lance',
    signatureEffect: 'Inflige 2 dégâts à 1 démon à la Présence. Utilisable 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Coup de Lance: 2 dégâts au démon le plus fort à la Présence.',
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
    id: 'rojer_young', name: 'Rojer (apprenti)', title: 'Apprenti Jongleur',
    ap: 3, hp: 7,
    passive: 'Instinct musical: Rojer découvre que sa musique affecte les démons. Un pouvoir encore incontrôlé.',
    signatureName: 'Mélodie Instinctive',
    signatureEffect: 'Réduit la force d\'1 démon à la Présence de 2. Utilisable 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Mélodie Instinctive: -2 force au démon le plus fort à la Présence.',
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
    id: 'leesha_young', name: 'Leesha (apprentie)', title: 'Apprentie Herboriste',
    ap: 4, hp: 8,
    passive: 'Apprentie de Bruna: Leesha apprend les bases des herbes et des wards. Elle peut soigner mais pas encore crafter de potions.',
    signatureName: 'Cataplasme',
    signatureEffect: 'Soigne 2 Population à un lieu. Utilisable 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Cataplasme: +2 Pop au lieu le plus endommagé à la Présence.',
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
  { locationId: 'lakton', ward: 'stone' },
];

// --- Starting resources (Quick Mode) ---

export const QUICK_MODE_STARTING_RESOURCES = 9; // distributed by player

// --- Campaign chapters ---

export const CAMPAIGN_CHAPTERS = 12;

// --- Random Day Events ---

export const RANDOM_DAY_EVENTS: {
  id: string;
  title: string;
  description: string;
  scene: string; // background image key
  choices: {
    label: string;
    hint: string;
    effects: { type: string; [key: string]: any }[];
  }[];
}[] = [
  {
    id: 'merchant', title: 'Marchand Itinérant',
    description: 'Un marchand voyageur arrive avec des fournitures de ward rares.',
    scene: 'merchant',
    choices: [
      { label: 'Acheter de l\'encre rare', hint: '+3 Encre au lieu principal', effects: [{ type: 'add_resources', locationId: 'cutters_hollow', resource: 'ink', amount: 3 }] },
      { label: 'Acheter du bois traité', hint: '+3 Bois au lieu principal', effects: [{ type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 3 }] },
    ],
  },
  {
    id: 'storm', title: 'Tempête',
    description: 'Une tempête violente frappe le village. Les wards sont mis à rude épreuve.',
    scene: 'storm',
    choices: [
      { label: 'Renforcer les wards en urgence', hint: '-1 AP mais aucun ward ne perd de durabilité cette nuit', effects: [{ type: 'hero_ap_change', delta: -1 }, { type: 'set_flag', flag: 'storm_protected', value: true }] },
      { label: 'Laisser faire', hint: 'Tous les wards -1 durabilité', effects: [{ type: 'set_flag', flag: 'storm_damage', value: true }] },
    ],
  },
  {
    id: 'volunteer', title: 'Villageois Courageux',
    description: 'Un villageois se porte volontaire pour aider aux défenses.',
    scene: 'village_sunset',
    choices: [
      { label: 'Accepter son aide', hint: '+1 AP aujourd\'hui', effects: [{ type: 'hero_ap_change', delta: 1 }] },
      { label: 'L\'envoyer protéger les enfants', hint: '+2 Population au lieu le plus faible', effects: [{ type: 'modify_population', locationId: 'miln', delta: 2 }] },
    ],
  },
  {
    id: 'discovery', title: 'Découverte',
    description: 'En réparant un ward, tu découvres un ancien symbole caché sous la surface.',
    scene: 'ward_book',
    choices: [
      { label: 'Étudier le symbole', hint: '+1 Ward en réserve (aléatoire)', effects: [{ type: 'bonus_reserve_ward', wardType: 'fire' }] },
      { label: 'Le laisser tranquille', hint: '+2 HP (repos)', effects: [{ type: 'hero_hp_change', delta: 2 }] },
    ],
  },
];

// --- Swarm threshold ---

export const SWARM_THRESHOLD = 3; // 3+ demons = +1 str each

// --- Horde formation ---

export const HORDE_FORMATION_NIGHTS = 3; // fallen location forms horde after 3 nights
