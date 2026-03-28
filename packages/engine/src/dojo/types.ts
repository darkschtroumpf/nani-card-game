// ============================================================
// NANI?! Dojo — Type Definitions
// ============================================================

export type Universe = 'shonen' | 'magical' | 'mecha' | 'isekai' | 'seinen';

export const UNIVERSES: Universe[] = ['shonen', 'magical', 'mecha', 'isekai', 'seinen'];

// Dominance cycle: shonen > magical > mecha > isekai > seinen > shonen
export const DOMINANCE: Record<Universe, Universe> = {
  shonen: 'magical',
  magical: 'mecha',
  mecha: 'isekai',
  isekai: 'seinen',
  seinen: 'shonen',
};

export function dominates(a: Universe, b: Universe): boolean {
  return DOMINANCE[a] === b;
}

// --- Card Types ---

export type CardType = 'fighter' | 'technique' | 'trap' | 'equipment' | 'signature';

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  universe: Universe;
  kiCost: number;
  // Fighter stats
  atk?: number;
  hp?: number;
  // Effect description
  effect?: string;
  effectType?: EffectType;
  // Equipment bonus
  atkBonus?: number;
  hpBonus?: number;
  // Signature focus cost
  focusCost?: number;
}

export type EffectType =
  | 'damage'          // deal X damage to a fighter
  | 'heal'            // heal X LP
  | 'draw'            // draw X cards
  | 'buff_atk'        // +X ATK to a fighter this turn
  | 'buff_hp'         // +X HP to a fighter
  | 'destroy'         // destroy a fighter
  | 'shield'          // prevent next X damage
  | 'return_hand'     // return a fighter to hand
  | 'steal_ki'        // steal X ki from opponent
  | 'peek'            // look at opponent's concealed fighter
  | 'negate'          // negate a technique
  | 'direct_damage'   // damage directly to LP
  | 'mass_damage'     // damage to all opponent fighters
  | 'revive';         // return a fighter from discard

// --- Card Instance (in game) ---

export interface CardInstance {
  card: CardDef;
  instanceId: string;    // unique per game instance
  concealed: boolean;    // face-down on field
  fromDojo: boolean;     // was this acquired from the Dojo? (public info)
  attachedEquipment?: CardInstance;
  summonedThisTurn: boolean;  // can't attack the turn it was deployed (summoning sickness)
}

// --- Field ---

export interface FieldSlot {
  fighter: CardInstance | null;
}

export interface TrapSlot {
  card: CardInstance | null;  // could be a real trap or any card used as bluff
  turnsSet: number;           // removed after 3 turns
}

// --- Player ---

export interface DojoPlayer {
  id: string;
  name: string;
  archetype: Archetype;
  lp: number;
  ki: number;
  maxKi: number;
  focus: number;

  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];

  field: [FieldSlot, FieldSlot, FieldSlot];   // 3 fighter slots
  traps: [TrapSlot, TrapSlot];                 // 2 trap slots

  // Tracking
  dojoPicksVisible: string[];  // card IDs bought from Dojo (visible to all)
  totalDamageDealt: number;
  totalDamageReceived: number;
  bluffsAttempted: number;
  bluffsCaught: number;
  bluffsSuccessful: number;
  naniCalls: number;
  naniCallsCorrect: number;
  fightersPlayed: number;
  fightersLost: number;
  turnsAlive: number;
  turnsSinceLastAttack: number;
}

export type Archetype = 'shonen_blitz' | 'magical_ward' | 'mecha_fortress' | 'isekai_thief' | 'seinen_assassin';

// --- Dojo (shared market) ---

export interface DojoMarket {
  cards: (CardInstance | null)[];  // 3 visible slots
  supply: CardInstance[];           // remaining cards
}

// --- Game State ---

export type TurnPhase =
  | 'ki'
  | 'dojo'
  | 'deploy'
  | 'combat_select'       // choose attacker and target
  | 'combat_declare'      // declare universe
  | 'combat_response'     // defender responds (block/trap/technique)
  | 'combat_nani'         // defender can call NANI?!
  | 'combat_resolve'      // resolve damage
  | 'end'
  | 'arc';

export interface CombatState {
  attackerId: string;
  defenderId: string;
  attackerSlot: number;
  defenderSlot: number | null;  // null = direct attack
  declaredUniverse: Universe;
  isBluff: boolean;              // hidden: did attacker lie?
  defenderTechniqueUsed: CardInstance | null;
  attackerTechniqueUsed: CardInstance | null;
  naniCalled: boolean;
  trapTriggered: boolean;   // whether defender chose to trigger trap
  trapSkipped: boolean;     // whether defender chose to skip trap
}

export interface DojoGameState {
  players: DojoPlayer[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  turnNumber: number;
  dojo: DojoMarket;
  combat: CombatState | null;
  arcDeck: ArcEvent[];
  currentArc: ArcEvent | null;
  gameOver: boolean;
  winnerId: string | null;
  winCondition: 'lp' | 'multiverse' | 'deckout' | null;
  log: LogEntry[];
}

export interface ArcEvent {
  name: string;
  description: string;
  effect: 'tournament' | 'beach' | 'power_up' | 'plot_twist' | 'betrayal';
}

export interface LogEntry {
  turn: number;
  playerId: string;
  action: string;
  detail: string;
}

// --- Player View (what a bot sees) ---

export interface OpponentView {
  id: string;
  name: string;
  archetype: Archetype | null;  // hidden from human players, visible to bots
  lp: number;
  ki: number;
  maxKi: number;
  focus: number;
  handSize: number;
  drawPileSize: number;
  discardPileSize: number;
  field: [PublicFieldSlot, PublicFieldSlot, PublicFieldSlot];
  traps: [boolean, boolean];  // true = something is set, false = empty
  dojoPicksVisible: string[];
}

export interface PublicFieldSlot {
  hasFighter: boolean;
  concealed: boolean;
  fighter: CardDef | null;    // null if concealed
  equipment: CardDef | null;  // null if concealed equipment or none
}

export interface DojoPlayerView {
  me: DojoPlayer;              // full info about myself
  opponents: OpponentView[];
  dojo: DojoMarket;            // dojo cards are visible
  turnPhase: TurnPhase;
  turnNumber: number;
  currentPlayerIndex: number;
  combat: PublicCombatState | null;
  currentArc: ArcEvent | null;
  log: LogEntry[];
}

export interface PublicCombatState {
  attackerId: string;
  defenderId: string;
  attackerSlot: number;
  defenderSlot: number | null;
  declaredUniverse: Universe;
  // isBluff is HIDDEN
  defenderTechniqueUsed: CardDef | null;
  attackerTechniqueUsed: CardDef | null;
  naniCalled: boolean;
}

// --- Bot Feedback ---

export interface BotFeedback {
  botName: string;
  archetype: Archetype;
  gamesPlayed: number;
  gamesWon: number;
  avgGameLength: number;
  likes: string[];
  dislikes: string[];
  suggestions: string[];
  stats: {
    avgLP: number;
    avgKiSpent: number;
    avgFocusSpent: number;
    avgDojoPicksPerGame: number;
    avgBluffsPerGame: number;
    bluffSuccessRate: number;
    naniCallAccuracy: number;
    avgDamageDealt: number;
    avgDamageReceived: number;
    avgTurnsAlive: number;
    favoriteCardIds: string[];
    leastFavoriteCardIds: string[];
  };
}
