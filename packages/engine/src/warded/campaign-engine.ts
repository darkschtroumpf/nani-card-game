// ============================================================
// Campaign Engine — creates games from chapter data, applies effects
// ============================================================

import type { GameState, LocationId, WardType } from './types';
import type { ChapterDefinition, CampaignEffect, CampaignModifiers, CampaignSaveState } from './campaign-types';
import { createGame, processDawn } from './game';
import { LOCATIONS, CHAPTER_WARD_AVAILABILITY, CHAPTER_FIRE_CAN_KILL, CHAPTER_TRIPLE_COMBOS, WARD_TYPES, TALENTS } from './constants';

/** Create a game state from a chapter definition */
export function createCampaignGame(chapter: ChapterDefinition, save?: CampaignSaveState): GameState {
  const state = createGame(chapter.heroId, 'campaign', 'midnight');

  // Override night count
  state.nightNumber = chapter.startingNightNumber;
  state.maxNights = chapter.nightCount;

  // Apply location overrides
  if (chapter.locationOverrides) {
    for (const [locId, override] of Object.entries(chapter.locationOverrides)) {
      const loc = state.locations.find(l => l.id === locId);
      if (!loc) continue;
      if (override.name) loc.name = override.name;
      if (override.terrain) loc.terrain = override.terrain;
      if (override.startPop !== undefined) {
        loc.population = override.startPop;
        loc.maxPopulation = override.startPop;
      }
    }
  }

  // Hide locations (mark as fallen with 0 pop, won't appear on map)
  if (chapter.hiddenLocations) {
    for (const locId of chapter.hiddenLocations) {
      const loc = state.locations.find(l => l.id === locId);
      if (loc) {
        loc.fallen = true;
        loc.population = 0;
        loc.maxPopulation = 0;
      }
    }
  }

  // Victory conditions — calculated AFTER hiding locations
  // Campaign is more lenient: only lose if ALL locations fall
  state.minStandingLocations = 1;

  // Starting presence
  state.presenceLocation = chapter.startingPresence;

  // Clear default wards, place chapter-specific ones
  for (const loc of state.locations) {
    loc.wards = loc.wards.map(() => ({ ward: null, isTemporary: false, durability: 0, xp: 0, enhanced: false }));
  }
  for (const pw of chapter.preplacedWards) {
    const loc = state.locations.find(l => l.id === pw.locationId);
    if (loc) {
      const emptySlot = loc.wards.findIndex(ws => !ws.ward);
      if (emptySlot >= 0) loc.wards[emptySlot] = { ward: pw.ward, isTemporary: false, durability: 3, xp: 0, enhanced: false };
    }
  }

  // Apply save progression
  if (save) {
    const heroLevel = save.heroLevels[chapter.heroId] ?? 1;
    const heroMaxHp = save.heroMaxHp[chapter.heroId] ?? 10;
    state.hero.level = heroLevel;
    state.hero.maxHp = heroMaxHp;
    state.hero.hp = heroMaxHp;
    state.hero.wardPowerBonus = save.wardPowerBonus ?? 0;
  }

  // Initialize campaign modifiers
  state.campaignModifiers = {
    extraDemonsPerWave: 0,
    demonStrengthBonus: 0,
    apModifier: 0,
  };

  // Ward chain progression — unlock wards based on chapter
  const chapterNum = chapter.id;
  state.availableWards = chapter.availableWards ??
    CHAPTER_WARD_AVAILABILITY[Math.min(chapterNum, 6)] ?? [...WARD_TYPES];
  state.maxComboSize = chapterNum >= CHAPTER_TRIPLE_COMBOS ? 3 : 2;
  state.fireCanKill = chapter.fireCanKill ?? (chapterNum >= CHAPTER_FIRE_CAN_KILL);

  // Apply unlocked talents for this hero
  if (save?.unlockedTalents) {
    const heroTalents = TALENTS.filter(t => t.heroId === chapter.heroId && save.unlockedTalents.includes(t.id));
    for (const talent of heroTalents) {
      switch (talent.effect.type) {
        case 'ap_bonus': state.hero.ap += talent.effect.value; break;
        case 'hp_bonus':
          state.hero.maxHp += talent.effect.value;
          state.hero.hp += talent.effect.value;
          break;
        case 'ward_power': state.hero.wardPowerBonus += talent.effect.value; break;
        case 'heal_dawn': state.talentEffects.healDawn += talent.effect.value; break;
        case 'extra_activation': state.talentEffects.extraActivations += talent.effect.value; break;
        case 'resource_bonus': state.talentEffects.resourceBonus += talent.effect.value; break;
      }
    }
  }

  // Re-distribute resources
  processDawn(state);

  return state;
}

/** Apply campaign effects to the game state */
export function applyCampaignEffects(state: GameState, effects: CampaignEffect[]): string[] {
  const messages: string[] = [];

  for (const effect of effects) {
    switch (effect.type) {
      case 'modify_population': {
        const loc = state.locations.find(l => l.id === effect.locationId);
        if (loc) {
          loc.population = Math.max(0, loc.population + effect.delta);
          loc.maxPopulation = Math.max(loc.maxPopulation, loc.population);
          messages.push(`${loc.name}: ${effect.delta > 0 ? '+' : ''}${effect.delta} population`);
        }
        break;
      }
      case 'add_resources': {
        const loc = state.locations.find(l => l.id === effect.locationId);
        if (loc) {
          loc.stockpile[effect.resource] = Math.min(6, loc.stockpile[effect.resource] + effect.amount);
          messages.push(`${loc.name}: +${effect.amount} ${effect.resource}`);
        }
        break;
      }
      case 'extra_demons': {
        if (state.campaignModifiers) {
          state.campaignModifiers.extraDemonsPerWave += effect.count;
          messages.push(`+${effect.count} démon(s) par vague cette nuit`);
        }
        break;
      }
      case 'demon_strength_bonus': {
        if (state.campaignModifiers) {
          state.campaignModifiers.demonStrengthBonus += effect.bonus;
          messages.push(`Démons +${effect.bonus} force`);
        }
        break;
      }
      case 'bonus_ward': {
        const loc = state.locations.find(l => l.id === effect.locationId);
        if (loc) {
          const emptySlot = loc.wards.findIndex(ws => !ws.ward);
          if (emptySlot >= 0) {
            loc.wards[emptySlot] = { ward: effect.wardType, isTemporary: false, durability: 3, xp: 0, enhanced: false };
            messages.push(`Ward de ${effect.wardType} placé à ${loc.name}`);
          }
        }
        break;
      }
      case 'bonus_reserve_ward': {
        state.wardReserves.push(effect.wardType);
        messages.push(`Ward de ${effect.wardType} ajouté en réserve`);
        break;
      }
      case 'hero_hp_change': {
        state.hero.hp = Math.max(1, Math.min(state.hero.maxHp, state.hero.hp + effect.delta));
        messages.push(`${effect.delta > 0 ? '+' : ''}${effect.delta} HP héros`);
        break;
      }
      case 'hero_ap_change': {
        if (state.campaignModifiers) {
          state.campaignModifiers.apModifier += effect.delta;
          state.hero.ap = Math.max(0, state.hero.ap + effect.delta);
          messages.push(`${effect.delta > 0 ? '+' : ''}${effect.delta} AP`);
        }
        break;
      }
      case 'force_surge': {
        if (state.campaignModifiers) {
          state.campaignModifiers.forcedSurge = effect.surge;
          messages.push(`Surge forcé: ${effect.surge}`);
        }
        break;
      }
      case 'set_flag': {
        // Flags stored on state for campaign tracking
        if (!state.campaignFlags) state.campaignFlags = {};
        state.campaignFlags[effect.flag] = effect.value;
        break;
      }
    }
  }

  return messages;
}

/** Create initial save state */
export function createNewSave(): CampaignSaveState {
  return {
    currentChapter: 1,
    completedChapters: [],
    chapterStars: {},
    unlockedTalents: [],
    flags: {},
    choiceHistory: {},
    heroLevels: { arlen: 1, arlen_young: 1, jardir: 1, jardir_young: 1, rojer: 1, rojer_young: 1, leesha: 1, leesha_young: 1 },
    heroMaxHp: { arlen: 10, arlen_young: 8, jardir: 10, jardir_young: 9, rojer: 10, rojer_young: 7, leesha: 10, leesha_young: 8 },
    wardPowerBonus: 0,
  };
}

/** Calculate total stars earned across all chapters */
export function getTotalStars(save: CampaignSaveState): number {
  return Object.values(save.chapterStars ?? {}).reduce((sum, s) => sum + s, 0);
}

/** Calculate stars spent on talents */
export function getSpentStars(save: CampaignSaveState): number {
  return (save.unlockedTalents ?? []).reduce((sum, tid) => {
    const talent = TALENTS.find(t => t.id === tid);
    return sum + (talent?.cost ?? 0);
  }, 0);
}

/** Update save after completing a chapter */
export function updateSaveAfterChapter(save: CampaignSaveState, state: GameState, chapterId: number, stars?: 1 | 2 | 3): CampaignSaveState {
  const existingStars = save.chapterStars?.[chapterId] ?? 0;
  return {
    ...save,
    currentChapter: chapterId + 1,
    completedChapters: [...save.completedChapters, chapterId],
    chapterStars: { ...(save.chapterStars ?? {}), [chapterId]: Math.max(existingStars, stars ?? 1) as 1 | 2 | 3 },
    heroLevels: { ...save.heroLevels, [state.hero.id]: state.hero.level },
    heroMaxHp: { ...save.heroMaxHp, [state.hero.id]: state.hero.maxHp },
    wardPowerBonus: state.hero.wardPowerBonus,
  };
}
