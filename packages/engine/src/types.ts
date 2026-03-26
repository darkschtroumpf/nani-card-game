// ============================================================
// NANI?! — Game Engine Types
// ============================================================

// --- Universes ---

export type Universe = 'shonen' | 'magical' | 'mecha' | 'isekai' | 'seinen';

// --- Cards ---

export interface Card {
  id: string;           // unique identifier (e.g. "shonen-7", "magical-3-b")
  universe: Universe;
  value: number;        // 1-7
}

// --- Identities ---

export type IdentityType =
  | 'protagoniste'
  | 'rival'
  | 'mentor'
  | 'traitre'
  | 'comic_relief'
  | 'antagoniste';

export interface Identity {
  type: IdentityType;
  /** For Mentor: the chosen player to protect */
  protectedPlayerId?: string;
}

// --- Players ---

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  plotArmor: number;        // starts at 4
  shields: number;          // max 2
  identity: Identity;
  identityRevealed: boolean;
  eliminated: boolean;
  isBot: boolean;

  // Tracking for identity objectives
  hasBluffed: boolean;              // for Comic Relief
  damagedPlayerIds: Set<string>;    // for Antagoniste
  eliminatedPlayerIds: string[];    // for Traitre
}

// --- Actions ---

export interface AttackAction {
  type: 'attack';
  targetId: string;
  cardIndex: number;
  declaredUniverse: Universe;
}

export interface DefendAction {
  type: 'defend';
  cardIndex: number;
}

export interface TrainAction {
  type: 'train';
  discardIndex: number;
}

export interface SpyAction {
  type: 'spy';
  targetId: string;
}

export interface ClaimVictoryAction {
  type: 'claim_victory';
}

export type Action =
  | AttackAction
  | DefendAction
  | TrainAction
  | SpyAction
  | ClaimVictoryAction;

// --- Duel ---

export interface DuelResult {
  attackerId: string;
  defenderId: string;
  winnerId: string | null;    // null if tie
  loserId: string | null;
  attackerCard: Card;
  defenderCard: Card;
  attackerTotal: number;
  defenderTotal: number;
  dominanceBonus: 'attacker' | 'defender' | 'none';
  outsiderVictory: boolean;   // 1 beat 7
  tie: boolean;
  bonusApplied: UniverseBonus;
}

export interface UniverseBonus {
  type: Universe;
  doubled: boolean;   // was it a 7?
  description: string;
}

// --- Arc Narratifs ---

export type ArcType =
  | 'tournament'
  | 'beach_episode'
  | 'trahison'
  | 'final_boss'
  | 'flashback'
  | 'filler'
  | 'power_up'
  | 'plot_twist';

export interface ArcEvent {
  type: ArcType;
  name: string;
  description: string;
}

// --- Turn phases ---

export type TurnPhase =
  | 'opening'         // active player draws
  | 'action_choice'   // active player chooses: attack, train, or spy
  | 'duel_declare'    // attacker has declared, waiting for defender
  | 'duel_response'   // defender choosing card
  | 'resolution'      // duel resolves
  | 'ending';         // check victory, elimination, next turn

// --- Game State ---

export interface GameState {
  players: Player[];
  deck: Card[];
  discard: Card[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  turnNumber: number;
  turnsWithoutAttack: number;     // anti-stagnation counter

  // Duel state
  pendingDuel: PendingDuel | null;

  // Arcs
  arcDeck: ArcEvent[];
  currentArc: ArcEvent | null;
  nextArcInTurns: number;         // countdown to next arc (every 3 turns)

  // Final Boss state
  finalBossHp: number | null;

  // Game over
  winner: string | null;
  gameOver: boolean;

  // Log
  log: GameLogEntry[];
}

export interface PendingDuel {
  attackerId: string;
  defenderId: string;
  attackerCardIndex: number;
  declaredUniverse: Universe;
}

// --- Game Log ---

export interface GameLogEntry {
  turnNumber: number;
  playerId: string;
  action: string;
  details: string;
}

// --- Game Config ---

export interface GameConfig {
  playerCount: number;
  botCount: number;
  playerNames: string[];
}

// --- Filtered state (what a player can see) ---

export interface PublicPlayerInfo {
  id: string;
  name: string;
  cardCount: number;       // how many cards (but not which)
  plotArmor: number;
  shields: number;
  identityRevealed: boolean;
  identityType: IdentityType | null;  // only if revealed
  eliminated: boolean;
  isBot: boolean;
}

export interface PlayerView {
  myPlayer: Player;
  otherPlayers: PublicPlayerInfo[];
  deckCount: number;
  discard: Card[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  turnNumber: number;
  pendingDuel: PendingDuel | null;
  currentArc: ArcEvent | null;
  finalBossHp: number | null;
  winner: string | null;
  gameOver: boolean;
  log: GameLogEntry[];
}
