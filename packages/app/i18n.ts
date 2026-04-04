/**
 * Centralized translation strings for The Demon's Cycle.
 * All user-facing text should come from here.
 * Currently French-only; add 'en' key for English support.
 */

const translations = {
  fr: {
    // Menu
    menu_play: 'Jouer',
    menu_play_desc: 'Mode rapide — choisis ton héro',
    menu_campaign: 'Campagne',
    menu_campaign_desc: '12 chapitres — L\'histoire de The Warded Man',
    menu_survival: 'Survie',
    menu_survival_desc: 'Mode infini — Combien de nuits survivras-tu ?',
    menu_codex: 'Codex',
    menu_codex_desc: 'Runes, Démons, Combos — tout savoir',

    // Game phases
    phase_day: 'JOUR',
    phase_night: 'NUIT',
    phase_wave: 'Vague',

    // Actions
    action_craft: 'Crafter un Ward',
    action_gather: 'Récolte',
    action_fortify: 'Fortifier',
    action_repair: 'Réparer',
    action_remove: 'Retirer',
    action_swap: 'Intervertir',
    action_activate: 'Activer',

    // Night steps
    step_placement: 'Placement',
    step_demons: 'Démons',
    step_defend: 'Défendre',
    step_damage: 'Dégâts',

    // Night hints
    hint_placement: 'Tape un lieu pour positionner ton héro',
    hint_demons: 'Les démons approchent...',
    hint_defend: 'Tape un lieu wardé pour activer ses défenses !',
    hint_damage: 'Appuie sur "Résoudre" pour voir les dégâts',

    // Game over
    victory_title: "L'AUBE SE LÈVE",
    defeat_title: 'LA NUIT GAGNE',
    victory_sub: 'a protégé les cités!',
    defeat_sub: 'Les ténèbres recouvrent Ala.',

    // Stats
    stat_nights: 'Nuits survécues',
    stat_wards: 'Wards fabriquées',
    stat_activations: 'Activations',
    stat_demons_killed: 'Démons tués',

    // Resources
    resource_wood: 'Bois',
    resource_ink: 'Encre',
    resource_food: 'Nourriture',

    // Wards
    ward_fire: 'Feu',
    ward_stone: 'Pierre',
    ward_wind: 'Vent',
    ward_light: 'Lumière',
    ward_bone: 'Os',

    // Demons
    demon_flame: 'Flamme',
    demon_wood: 'Bois',
    demon_wind: 'Vent',
    demon_water: 'Eau',
    demon_rock: 'Roche',
    demon_mind: 'Esprit',

    // Mesh tiers
    mesh_fragile: 'Fragile: wards se dégradent vite !',
    mesh_normal: 'Intervertis les runes pour améliorer les liens',
    mesh_reinforced: 'Renforcé: durabilité préservée',
    mesh_fortified: 'Fortifié: bonus défense + dégâts',

    // UI
    back: '← Retour',
    skip: 'Passer ▸▸',
    continue: 'Continuer',
    confirm_remove: 'Confirmer ?',
    new_record: 'Nouveau record !',
    record: 'Record',
    nights: 'nuits',

    // Difficulty
    diff_easy: 'Facile',
    diff_normal: 'Normal',
    diff_hard: 'Difficile',
    diff_easy_sub: '2 nuits',
    diff_normal_sub: '3 nuits',
    diff_hard_sub: '4 nuits',

    // Campaign
    campaign_title: 'CAMPAGNE',
    campaign_sub: 'Choisis ton destin',
    talents_title: 'Talents',
    stars_available: 'étoiles disponibles',

    // Positioning
    banner_position: 'TAPE UN LIEU pour positionner ton héro avant le combat',
    banner_mist_walk: 'MIST WALK — Tape un lieu pour te téléporter',
    banner_cancel: 'Annuler',
  },
};

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.fr;

let currentLocale: Locale = 'fr';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function t(key: TranslationKey): string {
  return translations[currentLocale]?.[key] ?? translations.fr[key] ?? key;
}

export default translations;
