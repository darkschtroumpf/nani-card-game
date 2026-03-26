// ============================================================
// NANI?! Dojo — Card Database
// ============================================================

import type { CardDef, Universe, Archetype } from './types';

// --- Fighters ---

function fighter(id: string, name: string, universe: Universe, kiCost: number, atk: number, hp: number): CardDef {
  return { id, name, type: 'fighter', universe, kiCost, atk, hp };
}

function technique(id: string, name: string, universe: Universe, kiCost: number, effect: string, effectType: CardDef['effectType']): CardDef {
  return { id, name, type: 'technique', universe, kiCost, effect, effectType };
}

function trap(id: string, name: string, universe: Universe, effect: string, effectType: CardDef['effectType']): CardDef {
  return { id, name, type: 'trap', universe, kiCost: 1, effect, effectType };
}

function equipment(id: string, name: string, universe: Universe, kiCost: number, atkBonus: number, hpBonus: number): CardDef {
  return { id, name, type: 'equipment', universe, kiCost, atkBonus, hpBonus };
}

function signature(id: string, name: string, universe: Universe, kiCost: number, focusCost: number, effect: string, effectType: CardDef['effectType']): CardDef {
  return { id, name, type: 'signature', universe, kiCost, focusCost, effect, effectType };
}

// ---- Card Pool ----

export const ALL_FIGHTERS: CardDef[] = [
  // Varied HP (3-5 range), varied ATK — balanced stat budgets per tier
  // Shonen: ATK-heavy, moderate HP
  fighter('sh-f1', 'Apprenti Ninja', 'shonen', 1, 3, 3),
  fighter('sh-f2', 'Duelliste Fougueux', 'shonen', 2, 5, 3),
  fighter('sh-f3', 'Rival Eternel', 'shonen', 3, 6, 4),
  fighter('sh-f4', 'Heros Legendaire', 'shonen', 4, 7, 5),

  // Magical: balanced
  fighter('mg-f1', 'Familier Lunaire', 'magical', 1, 2, 4),
  fighter('mg-f2', 'Sorciere Etoilee', 'magical', 2, 4, 4),
  fighter('mg-f3', 'Gardienne Celeste', 'magical', 3, 5, 5),
  fighter('mg-f4', 'Deesse de Lumiere', 'magical', 4, 6, 5),

  // Mecha: HP-leaning, low ATK
  fighter('mc-f1', 'Drone Eclaireur', 'mecha', 1, 2, 4),
  fighter('mc-f2', 'Pilote Recrue', 'mecha', 2, 3, 5),
  fighter('mc-f3', 'Mecha Gardien', 'mecha', 3, 4, 5),
  fighter('mc-f4', 'Titan Supreme', 'mecha', 4, 5, 5),

  // Isekai: versatile
  fighter('is-f1', 'Voyageur Perdu', 'isekai', 1, 2, 4),
  fighter('is-f2', 'Invocateur Sombre', 'isekai', 2, 4, 4),
  fighter('is-f3', 'Champion Reincarne', 'isekai', 3, 5, 4),
  fighter('is-f4', 'Roi Demon', 'isekai', 4, 6, 5),

  // Seinen: glass cannon
  fighter('sn-f1', 'Enqueteur Discret', 'seinen', 1, 3, 3),
  fighter('sn-f2', 'Mercenaire Froid', 'seinen', 2, 5, 3),
  fighter('sn-f3', 'Tueur Fantome', 'seinen', 3, 7, 3),
  fighter('sn-f4', 'Stratege Absolu', 'seinen', 4, 9, 3),
];

export const ALL_TECHNIQUES: CardDef[] = [
  technique('sh-t1', 'Coup de Poing Final', 'shonen', 1, '+3 ATK ce combat', 'buff_atk'),
  technique('sh-t2', 'Deuxieme Souffle', 'shonen', 2, 'Pioche 2 cartes', 'draw'),
  technique('mg-t1', 'Soin Stellaire', 'magical', 1, '+3 LP', 'heal'),
  technique('mg-t2', 'Bouclier Prismatique', 'magical', 2, 'Annule une technique', 'negate'),
  technique('mc-t1', 'Surcharge Reacteur', 'mecha', 1, '+2 ATK, +2 HP ce combat', 'buff_atk'),
  technique('mc-t2', 'Champ de Force', 'mecha', 2, 'Bloque 4 degats', 'shield'),
  technique('is-t1', 'Portail Dimensionnel', 'isekai', 1, '+3 ATK ce combat', 'buff_atk'),
  technique('is-t2', 'Vol de Ki', 'isekai', 2, 'Vole 2 Ki', 'steal_ki'),
  technique('sn-t1', 'Frappe Fatale', 'seinen', 1, '3 degats directs LP', 'direct_damage'),
  technique('sn-t2', 'Analyse Tactique', 'seinen', 2, 'Revele un fighter cache', 'peek'),
];

export const ALL_TRAPS: CardDef[] = [
  trap('sh-tr1', 'Contre-Attaque', 'shonen', 'Reflete 3 degats a attaquant', 'damage'),
  trap('mg-tr1', 'Miroir Magique', 'magical', 'Annule attaque et soigne 2 LP', 'heal'),
  trap('mc-tr1', 'Mine Electrique', 'mecha', '4 degats au fighter attaquant', 'damage'),
  trap('is-tr1', 'Piege Dimensionnel', 'isekai', '3 degats au fighter attaquant', 'damage'),
  trap('sn-tr1', 'Embuscade', 'seinen', 'Detruit le fighter attaquant si ATK <= 3', 'destroy'),
];

export const ALL_EQUIPMENT: CardDef[] = [
  equipment('sh-eq1', 'Bandeau du Heros', 'shonen', 1, 2, 0),
  equipment('mg-eq1', 'Baguette Enchantee', 'magical', 1, 1, 1),
  equipment('mc-eq1', 'Armure Renforcee', 'mecha', 2, 0, 2),
  equipment('is-eq1', 'Cape du Voyageur', 'isekai', 1, 1, 1),
  equipment('sn-eq1', 'Lame Empoisonnee', 'seinen', 1, 3, 0),
];

export const ALL_SIGNATURES: CardDef[] = [
  signature('sh-sig', 'BANKAI!', 'shonen', 3, 2, 'Tous tes fighters +4 ATK ce tour', 'buff_atk'),
  signature('mg-sig', 'Constellation Celeste', 'magical', 3, 4, 'Soigne tous fighters full HP + 4 LP', 'heal'),
  signature('mc-sig', 'Synchronisation Eva', 'mecha', 4, 4, 'Un fighter +4 HP', 'shield'),
  signature('is-sig', 'Respawn', 'isekai', 3, 3, 'Ressuscite un fighter depuis la defausse', 'revive'),
  signature('sn-sig', 'Death Note', 'seinen', 2, 3, 'Detruit un fighter ennemi (ignore HP)', 'destroy'),
];

export const ALL_CARDS: CardDef[] = [
  ...ALL_FIGHTERS,
  ...ALL_TECHNIQUES,
  ...ALL_TRAPS,
  ...ALL_EQUIPMENT,
  ...ALL_SIGNATURES,
];

// --- Sensei Deck Templates (10 cards each, max 2 universes, 1 signature) ---

export const SENSEI_DECKS: Record<Archetype, string[]> = {
  shonen_blitz: [
    'sh-sig',     // Bankai!
    'sh-f1',      // Apprenti Ninja (early board)
    'sh-f2', 'sh-f2', // 2x Duelliste Fougueux
    'sh-f3',      // Rival Eternel
    'sh-f4',      // Heros Legendaire
    'sh-t1', 'sh-t1', // 2x Coup de Poing Final
    'sh-t2',      // Deuxieme Souffle
    'sh-eq1',     // Bandeau du Heros
  ],
  magical_ward: [
    'mg-sig',     // Constellation Celeste
    'mg-f1', 'mg-f1', // 2x Familier Lunaire (cheap board presence)
    'mg-f2', 'mg-f2', // 2x Sorciere Etoilee
    'mg-f3',      // Gardienne Celeste
    'mg-t1',      // Soin Stellaire
    'mg-t2',      // Bouclier Prismatique
    'mg-tr1',     // Miroir Magique
    'mg-eq1',     // Baguette Enchantee
  ],
  mecha_fortress: [
    'mc-sig',     // Synchronisation Eva
    'mc-f1',      // Drone Eclaireur
    'mc-f2', 'mc-f2', // 2x Pilote Recrue
    'mc-f3',      // Mecha Gardien
    'mc-t1',      // Surcharge Reacteur
    'mc-t2',      // Champ de Force
    'mc-tr1',     // Mine Electrique
    'mc-eq1',     // Armure Renforcee
    'mg-f1',      // Familier Lunaire (splash)
  ],
  isekai_thief: [
    'is-sig',     // Respawn
    'is-f1', 'is-f1', // 2x Voyageur Perdu
    'is-f2', 'is-f2', // 2x Invocateur Sombre
    'is-f3',      // Champion Reincarne
    'is-t1',      // 1x Portail Dimensionnel (nerfed from 2x)
    'is-t2',      // Vol de Ki
    'is-tr1',     // Piege Dimensionnel
    'is-eq1',     // Cape du Voyageur
  ],
  seinen_assassin: [
    'sn-sig',     // Death Note
    'sn-f1', 'sn-f1', // 2x Enqueteur Discret
    'sn-f2', 'sn-f2', // 2x Mercenaire Froid (more board presence)
    'sn-f3',      // Tueur Fantome
    'sn-t1', 'sn-t1', // 2x Frappe Fatale
    'sn-tr1',     // Embuscade
    'sn-eq1',     // Lame Empoisonnee
  ],
};

// --- Shared Dojo Supply (cards available for purchase) ---

export function createDojoSupply(): CardDef[] {
  const supply: CardDef[] = [];
  // 2 copies of each fighter, technique, equipment; 1 of each trap
  for (const f of ALL_FIGHTERS) { supply.push(f, f); }
  for (const t of ALL_TECHNIQUES) { supply.push(t, t); }
  for (const e of ALL_EQUIPMENT) { supply.push(e, e); }
  for (const tr of ALL_TRAPS) { supply.push(tr); }
  return supply;
}
