// ============================================================
// Campaign Types — The Demon's Cycle
// ============================================================

import type { LocationId, TerrainType, WardType, DemonSurgeType, ResourceType, HeroId } from './types';

// --- Dialogue ---

export interface DialogueLine {
  speaker: string;        // 'arlen' | 'jeph' | 'silvy' | 'ragen' | 'narrator' | etc.
  text: string;
  emotion?: 'neutral' | 'scared' | 'angry' | 'determined' | 'sad' | 'hopeful';
}

export interface DialogueChoice {
  id: string;
  label: string;
  hint: string;           // short preview of consequence
  effects: CampaignEffect[];
}

export interface DialogueNode {
  id: string;
  background?: string;      // key into scene images (e.g. 'village_sunset')
  lines: DialogueLine[];
  choices?: DialogueChoice[];
  nextNodeId?: string;
}

// --- Effects ---

export type CampaignEffect =
  | { type: 'modify_population'; locationId: LocationId; delta: number }
  | { type: 'add_resources'; locationId: LocationId; resource: ResourceType; amount: number }
  | { type: 'extra_demons'; count: number }
  | { type: 'demon_strength_bonus'; bonus: number }
  | { type: 'bonus_ward'; wardType: WardType; locationId: LocationId }
  | { type: 'bonus_reserve_ward'; wardType: WardType }
  | { type: 'hero_hp_change'; delta: number }
  | { type: 'hero_ap_change'; delta: number }
  | { type: 'force_surge'; surge: DemonSurgeType }
  | { type: 'set_flag'; flag: string; value: boolean | number };

// --- Day Event ---

export interface DayEvent {
  dayNumber: number;      // 1, 2, 3
  condition?: { flag: string; value: boolean | number }; // only show if flag matches
  dialogueNodes: DialogueNode[];
}

// --- Chapter Definition ---

export interface ChapterDefinition {
  id: number;
  title: string;
  subtitle: string;
  heroId: HeroId;
  nightCount: number;
  startingNightNumber: number;
  locationOverrides?: Partial<Record<LocationId, { name: string; startPop?: number; terrain?: TerrainType }>>;
  startingPresence: LocationId;
  hiddenLocations?: LocationId[];  // locations disabled for this chapter (marked fallen)
  preplacedWards: { locationId: LocationId; ward: WardType }[];
  // Ward chain progression
  availableWards?: WardType[];      // wards the player can craft this chapter
  fireCanKill?: boolean;            // can fire wards destroy demons? (default false)
  maxComboSize?: 2 | 3;             // 2 = dual combos only, 3 = triple combos unlocked
  introDialogue: DialogueNode[];
  dayEvents: DayEvent[];
  victoryDialogue: DialogueNode[];
  defeatDialogue: DialogueNode[];
}

// --- Campaign Modifiers (applied to GameState) ---

export interface CampaignModifiers {
  extraDemonsPerWave: number;
  demonStrengthBonus: number;
  forcedSurge?: DemonSurgeType;
  apModifier: number;
}

// --- Save State ---

export interface CampaignSaveState {
  currentChapter: number;
  completedChapters: number[];
  chapterStars: Record<number, 1 | 2 | 3>;
  flags: Record<string, boolean | number>;
  choiceHistory: Record<string, string>;
  heroLevels: Record<HeroId, number>;
  heroMaxHp: Record<HeroId, number>;
  wardPowerBonus: number;
}
