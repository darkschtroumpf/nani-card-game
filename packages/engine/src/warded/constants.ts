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

export const WARD_TYPES: WardType[] = ['fire', 'stone', 'wind', 'light', 'bone', 'frost', 'impact', 'mind', 'unsight'];

export const WARD_COSTS: Record<WardType, { wood: number; ink: number; food: number }> = {
  fire: { wood: 1, ink: 0, food: 0 },
  stone: { wood: 1, ink: 0, food: 0 },
  wind: { wood: 0, ink: 1, food: 0 },
  light: { wood: 0, ink: 1, food: 0 },
  bone: { wood: 1, ink: 1, food: 0 },
  frost: { wood: 0, ink: 1, food: 0 },
  impact: { wood: 1, ink: 0, food: 0 },
  mind: { wood: 0, ink: 1, food: 1 },
  unsight: { wood: 0, ink: 2, food: 0 },
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
  frost: { leftLinks: 2, rightLinks: 2 },
  impact: { leftLinks: 3, rightLinks: 1 },
  mind:  { leftLinks: 1, rightLinks: 3 },
  unsight: { leftLinks: 1, rightLinks: 1 },
};

// --- Mesh Tier Thresholds ---
// Mesh strength = sum of link connections at a location.
export const MESH_TIERS: { min: number; max: number; tier: MeshTier; label: string }[] = [
  { min: 0, max: 0, tier: 'fragile', label: 'Fragile' },
  { min: 1, max: 2, tier: 'normal', label: 'Normal' },
  { min: 3, max: 4, tier: 'reinforced', label: 'Renforcé' },
  { min: 5, max: 99, tier: 'fortified', label: 'Fortifié' },
];

// --- Chapter Ward Progression (25 chapters, 6 acts + final) ---
// Act 1 (1-4): stone+wind | Act 2 (5-8): +fire | Act 3 (9-12): +light, fire kills
// Act 4 (13-16): +bone, triples | Act 5-6 (17-24): all | Final (25): all
export const CHAPTER_WARD_AVAILABILITY: Record<number, WardType[]> = {
  // Act 1
  1: ['stone', 'wind'], 2: ['stone', 'wind'], 3: ['stone', 'wind'], 4: ['stone', 'wind'],
  // Act 2
  5: ['stone', 'wind', 'fire'], 6: ['stone', 'wind', 'fire'], 7: ['stone', 'wind', 'fire'], 8: ['stone', 'wind', 'fire'],
  // Act 3: + light, frost (all defensive)
  9: ['stone', 'wind', 'fire', 'light', 'frost'], 10: ['stone', 'wind', 'fire', 'light', 'frost'],
  11: ['stone', 'wind', 'fire', 'light', 'frost'], 12: ['stone', 'wind', 'fire', 'light', 'frost'],
  // Act 4: + bone, impact (Anoch Sun — fire becomes lethal, combat wards unlocked)
  13: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact'],
  14: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact'],
  15: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact'],
  16: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact'],
  // Act 5: + mind
  17: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind'],
  18: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind'],
  19: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind'],
  20: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind'],
  // Act 6: + unsight (all 9)
  21: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind', 'unsight'],
  22: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind', 'unsight'],
  23: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind', 'unsight'],
  24: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind', 'unsight'],
  25: ['stone', 'wind', 'fire', 'light', 'frost', 'bone', 'impact', 'mind', 'unsight'],
};
export const CHAPTER_FIRE_CAN_KILL = 13;    // fire deals lethal damage from Act 4 (Anoch Sun)
export const CHAPTER_TRIPLE_COMBOS = 13;    // triple combos unlock at Act 4+

// Ward individual effects
export const WARD_PASSIVES: Record<WardType, string> = {
  fire: 'Deal 1 damage to all demons at this location each wave',
  stone: '+1 defense at this location',
  wind: 'Redirect 1 non-locked, non-Wind demon to adjacent location before combat',
  light: 'Reveal exact demon types targeting this location (Threat Forecast upgrade)',
  bone: 'Heal 1 Population at dawn (if below max)',
  frost: 'Reduce 1 demon strength by 1 each wave',
  impact: 'Knockback 1 non-locked demon to adjacent each wave',
  mind: 'Block 1 direct mind demon damage to hero per wave',
  unsight: '25% chance demons skip this location',
};

export const WARD_ACTIVES: Record<WardType, { name: string; effect: string }> = {
  fire: { name: 'Blaze', effect: 'Deal 3 damage to 1 demon at this location' },
  stone: { name: 'Bulwark', effect: 'This location takes 0 demon damage this wave' },
  wind: { name: 'Gale', effect: 'Redirect up to 3 non-locked, non-boss, non-Wind demons' },
  light: { name: 'Flare', effect: 'Deal 1 damage to all demons here + rearrange 1 non-locked demon' },
  bone: { name: 'Mend', effect: 'Heal 2 Population at this location (up to max)' },
  frost: { name: 'Gel', effect: 'Freeze 1 demon (cannot attack this wave)' },
  impact: { name: 'Fracas', effect: '2 damage to 1 demon + knockback to adjacent' },
  mind: { name: 'Volonté', effect: 'Stun 1 mind demon for this wave' },
  unsight: { name: 'Invisibilité', effect: 'This location is not targeted this wave' },
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
    passiveEffect: '+4 défense totale', activeEffect: '+5 défense cette vague + attire 1 démon de chaque lieu adjacent', activeName: 'Rempart' },
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
    passiveEffect: 'Soigne 1 Pop par vague (pas seulement à l\'aube)', activeEffect: 'Soigne 3 Pop + +4 défense cette vague', activeName: 'Refuge' },

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

  // Frost combos (Act 3+)
  { name: 'Brume', wards: ['wind', 'frost'], minBondStrength: 2, unlockedAtChapter: 9,
    passiveEffect: 'Réduit force de tous les démons de -1', activeEffect: 'Gèle 2 démons', activeName: 'Blizzard' },
  { name: 'Permafrost', wards: ['stone', 'frost'], minBondStrength: 2, unlockedAtChapter: 9,
    passiveEffect: '+2 défense + -1 force démons', activeEffect: '+3 défense + gèle le plus fort', activeName: 'Glacier' },
  { name: 'Aurore', wards: ['light', 'frost'], minBondStrength: 2, unlockedAtChapter: 9,
    passiveEffect: 'Révèle + ralentit 1 démon', activeEffect: 'Révèle tout + gèle tous str≤2', activeName: 'Aube Glaciale' },

  // Impact combos (Act 4+)
  { name: 'Séisme', wards: ['stone', 'impact'], minBondStrength: 2, unlockedAtChapter: 13,
    passiveEffect: '+2 défense + repousse 1 démon', activeEffect: '3 dégâts à tous + repousse non-boss', activeName: 'Tremblement' },
  { name: 'Éruption', wards: ['fire', 'impact'], minBondStrength: 1, unlockedAtChapter: 13,
    passiveEffect: 'Feu +2 dégâts', activeEffect: '4 dégâts au plus fort + repousse', activeName: 'Éruption Volcanique' },

  // Mind combos (Act 5+)
  { name: 'Sérénité', wards: ['light', 'mind'], minBondStrength: 2, unlockedAtChapter: 17,
    passiveEffect: 'Protège héros de 2 dégâts mind demon', activeEffect: 'Étourdit tous les mind demons', activeName: 'Paix Intérieure' },
  { name: 'Résonance', wards: ['bone', 'mind'], minBondStrength: 1, unlockedAtChapter: 17,
    passiveEffect: 'Soigne 1 HP héros par vague', activeEffect: 'Absorbe la force d\'1 mind demon (+2 HP)', activeName: 'Absorption' },
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
    ap: 4, hp: 6,
    passive: 'Témérité: Arlen est jeune et faible, mais courageux. Il peut attirer les démons pour protéger les autres.',
    signatureName: 'Leurre',
    signatureEffect: 'Attire 1 démon non-boss d\'un lieu adjacent vers la Présence. Peut être utilisé 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Cri de défi: Attire 1 démon supplémentaire vers la Présence, réduisant la pression sur les autres lieux.',
  },
  {
    id: 'arlen', name: 'Arlen Bales', title: 'The Warded Man',
    ap: 6, hp: 9,
    passive: 'Warded Flesh: Starts each night at Ward Charge 1. Gains +1 Charge per demon killed at Presence. Gains +1 Charge when taking overflow damage.',
    signatureName: 'Mist Walk',
    signatureEffect: 'At Ward Charge 5: teleport Presence to any location. Charge resets to 0.',
    signatureCost: {},
    waveAbility: 'Warded Fist: Deal damage equal to Ward Charge to 1 demon at Presence location. Does not consume Charge.',
  },
  {
    id: 'jardir_young', name: 'Jardir (nie\'Sharum)', title: 'Recrue du Maze',
    ap: 5, hp: 6,
    passive: 'Entraînement: Jardir est un jeune guerrier du Maze. Il sait se battre à la lance mais n\'a pas encore de troupes.',
    signatureName: 'Coup de Lance',
    signatureEffect: 'Inflige 2 dégâts à 1 démon à la Présence. Utilisable 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Coup de Lance: 2 dégâts au démon le plus fort à la Présence.',
  },
  {
    id: 'jardir', name: 'Ahmann Jardir', title: 'Shar\'Dama Ka',
    ap: 5, hp: 7,
    passive: 'Sharum Commander: Deploy warrior tokens (str 2) at any location during Day (1 AP each). Warriors fight demons automatically during Night.',
    signatureName: 'Crown of Kaji',
    signatureEffect: 'All warriors gain +2 strength this night. Deployed warriors persist until destroyed.',
    signatureCost: { ap: 2 },
    waveAbility: 'Rally: One warrior at Presence heals to full and gains +1 str this wave.',
  },
  {
    id: 'rojer_young', name: 'Rojer (apprenti)', title: 'Apprenti Jongleur',
    ap: 3, hp: 6,
    passive: 'Instinct musical: Rojer découvre que sa musique affecte les démons. Un pouvoir encore incontrôlé.',
    signatureName: 'Mélodie Instinctive',
    signatureEffect: 'Réduit la force d\'1 démon à la Présence de 2. Utilisable 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Mélodie Instinctive: -2 force au démon le plus fort à la Présence.',
  },
  {
    id: 'rojer', name: 'Rojer Inn', title: 'The Fiddle Wizard',
    ap: 5, hp: 8,
    passive: 'Song Weaver: During Day, spend 1 AP to Rehearse (set all 3 wave songs at once). Songs play automatically during Night. 3 different songs = Harmony bonus (+1 ward activation in Wave 3).',
    signatureName: 'Symphony of the Damned',
    signatureEffect: 'All songs affect ALL locations this night (not just Presence + adjacent).',
    signatureCost: { ap: 2 },
    waveAbility: 'Minor Charm: Move 1 non-locked, non-boss demon from an adjacent location to Presence.',
  },
  {
    id: 'leesha_young', name: 'Leesha (apprentie)', title: 'Apprentie Herboriste',
    ap: 4, hp: 7,
    passive: 'Apprentie de Bruna: Leesha apprend les bases des herbes et des wards. Elle peut soigner mais pas encore crafter de potions.',
    signatureName: 'Cataplasme',
    signatureEffect: 'Soigne 2 Population à un lieu. Utilisable 1 fois par vague.',
    signatureCost: {},
    waveAbility: 'Cataplasme: +2 Pop au lieu le plus endommagé à la Présence.',
  },
  {
    id: 'leesha', name: 'Leesha Paper', title: 'Herb Gatherer',
    ap: 6, hp: 9,
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

// --- Talent Tree ---

import type { TalentDefinition } from './types';

export const TALENTS: TalentDefinition[] = [
  // Arlen Young
  { id: 'arlen_young_t1', heroId: 'arlen_young', name: 'Endurance', description: '+1 AP par jour', cost: 2, tier: 1,
    effect: { type: 'ap_bonus', value: 1 } },
  { id: 'arlen_young_t2', heroId: 'arlen_young', name: 'Courage', description: '+1 activation par nuit', cost: 4, tier: 2,
    effect: { type: 'extra_activation', value: 1 } },
  { id: 'arlen_young_t3', heroId: 'arlen_young', name: 'Volonte', description: '+1 degats wards', cost: 6, tier: 3,
    effect: { type: 'ward_power', value: 1 } },

  // Leesha Young
  { id: 'leesha_young_t1', heroId: 'leesha_young', name: 'Herboriste', description: 'Soigne 1 HP a l\'aube', cost: 2, tier: 1,
    effect: { type: 'heal_dawn', value: 1 } },
  { id: 'leesha_young_t2', heroId: 'leesha_young', name: 'Science', description: '+1 AP par jour', cost: 4, tier: 2,
    effect: { type: 'ap_bonus', value: 1 } },
  { id: 'leesha_young_t3', heroId: 'leesha_young', name: 'Maitrise', description: '+1 degats wards', cost: 6, tier: 3,
    effect: { type: 'ward_power', value: 1 } },

  // Jardir Young
  { id: 'jardir_young_t1', heroId: 'jardir_young', name: 'Discipline', description: '+2 HP max', cost: 2, tier: 1,
    effect: { type: 'hp_bonus', value: 2 } },
  { id: 'jardir_young_t2', heroId: 'jardir_young', name: 'Tactique', description: '+1 activation par nuit', cost: 4, tier: 2,
    effect: { type: 'extra_activation', value: 1 } },
  { id: 'jardir_young_t3', heroId: 'jardir_young', name: 'Foi', description: '+1 degats wards', cost: 6, tier: 3,
    effect: { type: 'ward_power', value: 1 } },

  // Rojer Young
  { id: 'rojer_young_t1', heroId: 'rojer_young', name: 'Agilite', description: '+1 ressource au gather', cost: 2, tier: 1,
    effect: { type: 'resource_bonus', value: 1 } },
  { id: 'rojer_young_t2', heroId: 'rojer_young', name: 'Harmonie', description: '+1 AP par jour', cost: 4, tier: 2,
    effect: { type: 'ap_bonus', value: 1 } },
  { id: 'rojer_young_t3', heroId: 'rojer_young', name: 'Virtuosite', description: '+1 degats wards', cost: 6, tier: 3,
    effect: { type: 'ward_power', value: 1 } },
];
