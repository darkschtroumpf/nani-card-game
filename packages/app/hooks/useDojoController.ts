import { useState, useCallback, useRef } from 'react';
import type {
  DojoGameState, DojoPlayerView, Universe, CardInstance,
  Archetype, TurnPhase, CombatState,
} from '../../engine/src/dojo/types';
import {
  createDojoGame, processKiPhase, processDojoBuy, processDojoMeditate,
  deployFighter, setTrap, equipCard, initiateCombat, defenderChooseBlocker,
  defenderPlayTechnique, callNani, resolveCombat,
  processEndPhase, getDojoPlayerView, activateSignature,
  defenderHasTrap, defenderTriggerTrap, defenderSkipTrap,
} from '../../engine/src/dojo/game';
import {
  botDecideDojoPhase, botDecideDeployPhase, botDecideCombat,
  botDecideDefense, botChooseBlocker, botDecideTrap, createBotMemory,
} from '../../engine/src/dojo/bot';
import { generateDraftPool, botAutoDraft } from '../../engine/src/dojo/cards';
import type { CardDef } from '../../engine/src/dojo/types';
import type { BotMemory } from '../../engine/src/dojo/bot';
import type { CombatStep } from '../components/CombatScene';
import { tapFeedback, playCardFeedback, impactFeedback, warningFeedback, successFeedback, errorFeedback } from '../services/feedback';

// ============================================================
// Types
// ============================================================

export interface DojoGameConfig {
  playerName: string;
  playerArchetype: Archetype;
  botCount: number;
  botArchetypes?: Archetype[];
}

export interface DojoGameController {
  view: DojoPlayerView | null;
  combatStep: CombatStep | null;
  combatEvents: string[];
  events: string[];
  isMyTurn: boolean;
  turnPhase: TurnPhase | null;
  gameStarted: boolean;

  startGame: (config: DojoGameConfig) => void;

  // Dojo phase
  dojoBuy: (slotIndex: number) => void;
  dojoMeditate: () => void;
  dojoSkip: () => void;

  // Deploy phase
  doDeployFighter: (handIndex: number, fieldSlot: number, concealed: boolean) => void;
  doSetTrap: (handIndex: number, trapSlot: number) => void;
  doEquip: (handIndex: number, fieldSlot: number, concealed: boolean) => void;
  doActivateSignature: (handIndex: number) => void;
  endDeploy: () => void;

  // Combat phase
  selectAttack: (attackerSlot: number, defenderId: string, defenderSlot: number | null, declaredUniverse: Universe) => void;
  skipCombat: () => void;

  // Defense
  chooseBlocker: (slot: number) => void;
  triggerTrap: () => void;
  skipTrap: () => void;
  doCallNani: () => void;
  passDefense: () => void;

  // Combat UI
  advanceCombat: () => void;

  // Bot visibility
  botBubbles: Record<string, { message: string; type: 'action' | 'reaction' | 'nani' } | null>;

  // Draft
  draftPool: CardDef[] | null;
  draftSelected: number[];
  isDrafting: boolean;
  toggleDraftCard: (index: number) => void;
  confirmDraft: () => void;
}

// ============================================================
// Hook
// ============================================================

const DEFAULT_BOT_ARCHETYPES: Archetype[] = [
  'magical_ward', 'mecha_fortress', 'isekai_thief', 'seinen_assassin',
];

export function useDojoController(): DojoGameController {
  const [view, setView] = useState<DojoPlayerView | null>(null);
  const [combatStep, setCombatStep] = useState<CombatStep | null>(null);
  const [combatEvents, setCombatEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [botBubbles, setBotBubbles] = useState<Record<string, { message: string; type: 'action' | 'reaction' | 'nani' } | null>>({});
  const [draftPool, setDraftPool] = useState<CardDef[] | null>(null);
  const [draftSelected, setDraftSelected] = useState<number[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const configRef = useRef<DojoGameConfig | null>(null);

  const stateRef = useRef<DojoGameState | null>(null);
  const myIdRef = useRef<string>('p0');
  const memoriesRef = useRef<BotMemory[]>([]);
  const processingRef = useRef(false);

  // --- Helpers ---

  const syncView = useCallback((s: DojoGameState) => {
    stateRef.current = s;
    setView(getDojoPlayerView(s, myIdRef.current));
  }, []);

  const addEvents = useCallback((newEvents: string[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const showBotBubble = useCallback((botId: string, message: string, type: 'action' | 'reaction' | 'nani' = 'action') => {
    setBotBubbles(prev => ({ ...prev, [botId]: { message, type } }));
    setTimeout(() => {
      setBotBubbles(prev => ({ ...prev, [botId]: null }));
    }, type === 'nani' ? 1500 : 1000);
  }, []);

  // --- Bot Turn Processing ---

  const processBotTurns = useCallback(async (s: DojoGameState) => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (!s.gameOver) {
      const current = s.players[s.currentPlayerIndex];
      if (!current || current.lp <= 0) {
        processEndPhase(s);
        syncView(s);
        continue;
      }

      // If it's human's turn, auto-process Ki phase then stop
      if (current.id === myIdRef.current) {
        if (s.turnPhase === 'ki') {
          processKiPhase(s);
        }
        syncView(s);
        break;
      }

      const playerIdx = s.currentPlayerIndex;
      const memory = memoriesRef.current[playerIdx] ?? createBotMemory();
      const botView = getDojoPlayerView(s, current.id);

      // Process bot phases — slower delays so player can follow
      if (s.turnPhase === 'ki') {
        processKiPhase(s);
        syncView(s);
        await delay(400);
      }

      if (s.turnPhase === 'dojo') {
        const decision = botDecideDojoPhase(botView, memory);
        if (decision.action === 'buy') {
          processDojoBuy(s, decision.params.slotIndex);
          showBotBubble(current.id, 'Interessant!');
        } else if (decision.action === 'meditate') {
          processDojoMeditate(s);
          showBotBubble(current.id, 'Focus...');
        } else {
          showBotBubble(current.id, '...');
        }
        s.turnPhase = 'deploy';
        syncView(s);
        await delay(800);
      }

      if (s.turnPhase === 'deploy') {
        const freshView = getDojoPlayerView(s, current.id);
        const decisions = botDecideDeployPhase(freshView, memory);
        if (decisions.length > 0) showBotBubble(current.id, 'En garde!');
        for (const d of decisions) {
          if (d.action === 'deploy_fighter') {
            const idx = Math.min(d.params.handIndex, current.hand.length - 1);
            if (idx >= 0) deployFighter(s, idx, d.params.fieldSlot, d.params.concealed);
          } else if (d.action === 'set_trap') {
            const idx = Math.min(d.params.handIndex, current.hand.length - 1);
            if (idx >= 0) setTrap(s, idx, d.params.trapSlot);
          } else if (d.action === 'equip') {
            const idx = Math.min(d.params.handIndex, current.hand.length - 1);
            if (idx >= 0) equipCard(s, idx, d.params.fieldSlot, d.params.concealed);
          } else if (d.action === 'signature') {
            const sigIdx = current.hand.findIndex(c => c.card.type === 'signature');
            if (sigIdx >= 0) activateSignature(s, sigIdx);
          }
        }
        s.turnPhase = 'combat_select';
        syncView(s);
        await delay(700);
      }

      if (s.turnPhase === 'combat_select') {
        const freshView = getDojoPlayerView(s, current.id);
        const combatDecision = botDecideCombat(freshView, memory);
        if (combatDecision) {
          const { attackerSlot, defenderId, defenderSlot, declaredUniverse } = combatDecision.params;
          const success = initiateCombat(s, attackerSlot, defenderId, defenderSlot, declaredUniverse);

          if (success) {
            showBotBubble(current.id, 'YAAAH!', 'action');
            syncView(s);
            await delay(1000);

            // Check if defender is human
            const defender = s.players.find(p => p.id === s.combat?.defenderId);
            if (defender?.id === myIdRef.current) {
              // Human is defender — show combat UI and wait for blocker choice + defense
              s.turnPhase = 'combat_response';
              setCombatStep('declaration');
              setCombatEvents([]);
              syncView(s);
              processingRef.current = false;
              return;
            }

            // Bot defender: choose blocker first (Mode B)
            if (defender && s.combat) {
              const defView = getDojoPlayerView(s, defender.id);
              const defIdx = s.players.indexOf(defender);
              const defMemory = memoriesRef.current[defIdx] ?? createBotMemory();

              // Bot chooses which fighter blocks
              const hasFighters = defender.field.some(sl => sl.fighter);
              if (hasFighters) {
                const blockerSlot = botChooseBlocker(defView, defMemory);
                defenderChooseBlocker(s, blockerSlot);
                showBotBubble(defender.id, 'Je bloque!', 'reaction');
                syncView(s);
                await delay(600);
              }

              // Bot decides trap
              if (botDecideTrap(defView)) {
                defenderTriggerTrap(s);
                showBotBubble(defender.id, 'Piege!', 'reaction');
                await delay(600);
              }

              const defDecision = botDecideDefense(defView, defMemory);

              if (defDecision.action === 'call_nani') {
                showBotBubble(defender.id, 'NANI?!', 'nani');
                callNani(s);
              } else if (defDecision.action === 'play_technique') {
                const techIdx = defender.hand.findIndex(c =>
                  c.card.type === 'technique' &&
                  ['shield', 'negate', 'return_hand', 'heal'].includes(c.card.effectType ?? '')
                );
                if (techIdx >= 0) defenderPlayTechnique(s, techIdx);
              }

              const combatEvts = resolveCombat(s);
              addEvents(combatEvts);
              syncView(s);
              await delay(900);
            }
          }
        }
        s.turnPhase = 'end';
      }

      if (s.turnPhase === 'end') {
        processEndPhase(s);
        syncView(s);
        await delay(200);
      }
    }

    syncView(s);
    processingRef.current = false;
  }, [syncView, addEvents]);

  // --- Start Game (with Draft) ---

  const startGame = useCallback((config: DojoGameConfig) => {
    configRef.current = config;

    // Generate draft pool for the human player
    const pool = generateDraftPool(config.playerArchetype);
    setDraftPool(pool);
    setDraftSelected([]);
    setIsDrafting(true);
  }, []);

  const toggleDraftCard = useCallback((index: number) => {
    setDraftSelected(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 10) return prev; // max 10
      return [...prev, index];
    });
  }, []);

  const confirmDraft = useCallback(() => {
    const config = configRef.current;
    if (!config || !draftPool || draftSelected.length !== 10) return;

    const playerDeck = draftSelected.map(i => draftPool[i]);

    const botArchetypes = config.botArchetypes ??
      DEFAULT_BOT_ARCHETYPES.slice(0, config.botCount);
    const botNames = ['Sakura', 'Rei', 'Subaru', 'Light'];

    const playerConfigs = [
      { name: config.playerName, archetype: config.playerArchetype, draftedCards: playerDeck },
      ...botArchetypes.map((a, i) => {
        const botPool = generateDraftPool(a);
        const botDeck = botAutoDraft(botPool, a);
        return { name: botNames[i] || `Bot ${i + 1}`, archetype: a, draftedCards: botDeck };
      }),
    ];

    memoriesRef.current = playerConfigs.map(() => createBotMemory());
    const newState = createDojoGame(playerConfigs);
    myIdRef.current = 'p0';

    stateRef.current = newState;
    setEvents([]);
    setCombatStep(null);
    setCombatEvents([]);
    setDraftPool(null);
    setIsDrafting(false);
    setGameStarted(true);

    processKiPhase(newState);
    syncView(newState);

    if (newState.players[0].id !== myIdRef.current) {
      processBotTurns(newState);
    }
  }, [draftPool, draftSelected, syncView, processBotTurns]);

  // --- Dojo Phase Actions ---

  const dojoBuy = useCallback((slotIndex: number) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'dojo') return;
    processDojoBuy(s, slotIndex);
    s.turnPhase = 'deploy';
    playCardFeedback();
    syncView(s);
    // No auto-skip: always let player see deploy phase
  }, [syncView]);

  const dojoMeditate = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'dojo') return;
    processDojoMeditate(s);
    s.turnPhase = 'deploy';
    syncView(s);
  }, [syncView]);

  const dojoSkip = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'dojo') return;
    s.turnPhase = 'deploy';
    syncView(s);
  }, [syncView]);

  // --- Deploy Phase: auto-skip when nothing is possible ---

  const canDoAnythingInDeploy = useCallback((s: DojoGameState): boolean => {
    const me = s.players.find(p => p.id === myIdRef.current);
    if (!me || me.hand.length === 0) return false;

    const hasEmptySlot = me.field.some(sl => !sl.fighter);
    const hasFighterInHand = me.hand.some(c => c.card.type === 'fighter' && c.card.kiCost <= me.ki);
    const canDeploy = hasEmptySlot && hasFighterInHand;

    const hasEmptyTrap = me.traps.some(t => !t.card);
    const canTrap = hasEmptyTrap && me.ki >= 1 && me.hand.length > 0;

    const hasEquip = me.hand.some(c => c.card.type === 'equipment' && c.card.kiCost <= me.ki);
    const hasFighterToEquip = me.field.some(sl => sl.fighter && !sl.fighter.attachedEquipment);
    const canEquip = hasEquip && hasFighterToEquip;

    const sig = me.hand.find(c => c.card.type === 'signature');
    const canSig = sig && me.ki >= sig.card.kiCost && me.focus >= (sig.card.focusCost ?? 0);

    return canDeploy || canTrap || canEquip || !!canSig;
  }, []);

  const autoSkipDeployIfNeeded = useCallback((s: DojoGameState) => {
    if (s.turnPhase === 'deploy' && s.players[s.currentPlayerIndex]?.id === myIdRef.current) {
      if (!canDoAnythingInDeploy(s)) {
        s.turnPhase = 'combat_select';
        syncView(s);
      }
    }
  }, [canDoAnythingInDeploy, syncView]);

  // --- Deploy Phase Actions ---

  const doDeployFighter = useCallback((handIndex: number, fieldSlot: number, concealed: boolean) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    deployFighter(s, handIndex, fieldSlot, concealed);
    syncView(s);
  }, [syncView]);

  const doSetTrap = useCallback((handIndex: number, trapSlot: number) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    setTrap(s, handIndex, trapSlot);
    syncView(s);
  }, [syncView]);

  const doEquip = useCallback((handIndex: number, fieldSlot: number, concealed: boolean) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    equipCard(s, handIndex, fieldSlot, concealed);
    syncView(s);
  }, [syncView]);

  const doActivateSignature = useCallback((handIndex: number) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    const evts = activateSignature(s, handIndex);
    addEvents(evts);
    successFeedback();
    syncView(s);
  }, [syncView, addEvents]);

  const skipToEnd = useCallback((s: DojoGameState) => {
    s.turnPhase = 'end';
    processEndPhase(s);
    syncView(s);
    if (!s.gameOver) {
      const next = s.players[s.currentPlayerIndex];
      if (next?.id === myIdRef.current) {
        if (s.turnPhase === 'ki') processKiPhase(s);
        syncView(s);
      } else {
        processBotTurns(s);
      }
    }
  }, [syncView, processBotTurns]);

  const endDeploy = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;

    const me = s.players.find(p => p.id === myIdRef.current);
    const hasReadyFighters = me?.field.some(sl => sl.fighter && !sl.fighter.summonedThisTurn);

    if (!hasReadyFighters) {
      // No fighters can attack — skip combat entirely
      skipToEnd(s);
      return;
    }

    s.turnPhase = 'combat_select';
    syncView(s);
  }, [syncView, skipToEnd]);

  // --- Combat Phase Actions ---

  const selectAttack = useCallback((
    attackerSlot: number, defenderId: string,
    defenderSlot: number | null, declaredUniverse: Universe
  ) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'combat_select') return;
    const success = initiateCombat(s, attackerSlot, defenderId, defenderSlot, declaredUniverse);
    if (success) {
      setCombatStep('declaration');
      setCombatEvents([]);
      s.turnPhase = 'combat_declare';
    }
    syncView(s);
  }, [syncView]);

  const skipCombat = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    s.turnPhase = 'end';
    processEndPhase(s);
    syncView(s);

    if (!s.gameOver) {
      const next = s.players[s.currentPlayerIndex];
      if (next?.id === myIdRef.current) {
        // Our turn again — process ki phase
        if (s.turnPhase === 'ki') processKiPhase(s);
        syncView(s);
      } else {
        processBotTurns(s);
      }
    }
  }, [syncView, processBotTurns]);

  // --- Defense Actions ---

  const proceedAfterBlocker = useCallback((s: DojoGameState) => {
    // Check if defender has a trap to trigger
    if (defenderHasTrap(s)) {
      setCombatStep('trap_choice' as CombatStep);
      syncView(s);
      return;
    }
    // Check if NANI is possible
    const atkFighter = s.players.find(p => p.id === s.combat!.attackerId)?.field[s.combat!.attackerSlot]?.fighter;
    const isConcealed = atkFighter?.concealed ?? false;
    if (isConcealed) {
      setCombatStep('nani_call');
      syncView(s);
    } else {
      setCombatStep('reveal');
      const evts = resolveCombat(s);
      setCombatEvents(evts);
      syncView(s);
    }
  }, [syncView]);

  const chooseBlocker = useCallback((slot: number) => {
    const s = stateRef.current;
    if (!s || !s.combat) return;
    defenderChooseBlocker(s, slot);
    tapFeedback();
    proceedAfterBlocker(s);
  }, [proceedAfterBlocker]);

  const triggerTrap = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.combat) return;
    defenderTriggerTrap(s);
    impactFeedback();
    // Continue to resolve
    setCombatStep('reveal');
    const evts = resolveCombat(s);
    setCombatEvents(evts);
    syncView(s);
  }, [syncView]);

  const skipTrap = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.combat) return;
    defenderSkipTrap(s);
    setCombatStep('reveal');
    const evts = resolveCombat(s);
    setCombatEvents(evts);
    syncView(s);
  }, [syncView]);

  const doCallNani = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.combat) return;
    callNani(s);
    impactFeedback();
    setCombatStep('reveal');
    const evts = resolveCombat(s);
    setCombatEvents(evts);
    syncView(s);
  }, [syncView]);

  const passDefense = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.combat) return;
    // Skip to reveal
    setCombatStep('reveal');
    const evts = resolveCombat(s);
    setCombatEvents(evts);
    syncView(s);
  }, [syncView]);

  // --- Combat UI Advancement ---

  const advanceCombat = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;

    if (combatStep === 'declaration') {
      const defender = s.players.find(p => p.id === s.combat?.defenderId);

      if (defender?.id === myIdRef.current) {
        // Human is defender — does defender have fighters to choose from?
        const defFighters = defender.field.filter(sl => sl.fighter);
        if (defFighters.length > 1) {
          setCombatStep('choose_blocker');
        } else if (defFighters.length === 1) {
          // Auto-choose the only fighter
          const slot = defender.field.findIndex(sl => sl.fighter);
          defenderChooseBlocker(s, slot);
          proceedAfterBlocker(s);
        } else {
          // No fighters — direct attack, go to resolve
          setCombatStep('reveal');
          const evts = resolveCombat(s);
          setCombatEvents(evts);
          syncView(s);
        }
      } else {
        // Bot defender — already handled in processBotTurns, skip to resolve
        setCombatStep('reveal');
        const evts = resolveCombat(s);
        setCombatEvents(evts);
        syncView(s);
      }
      return;
    }

    if (combatStep === 'nani_call') {
      setCombatStep('reveal');
      const evts = resolveCombat(s);
      setCombatEvents(evts);
      syncView(s);
      return;
    }

    if (combatStep === 'reveal') {
      setCombatStep('resolution');
      return;
    }

    if (combatStep === 'resolution') {
      // Combat over
      setCombatStep(null);
      setCombatEvents([]);

      s.turnPhase = 'end';
      processEndPhase(s);
      syncView(s);

      if (!s.gameOver) {
        const next = s.players[s.currentPlayerIndex];
        if (next?.id === myIdRef.current) {
          if (s.turnPhase === 'ki') processKiPhase(s);
          syncView(s);
        } else {
          processBotTurns(s);
        }
      }
      return;
    }
  }, [combatStep, syncView, processBotTurns]);

  // --- Computed ---

  const isMyTurn = view !== null && !view.me.lp !== undefined &&
    stateRef.current?.players[stateRef.current.currentPlayerIndex]?.id === myIdRef.current;
  const turnPhase = stateRef.current?.turnPhase ?? null;

  return {
    view,
    combatStep,
    combatEvents,
    events,
    isMyTurn: isMyTurn && !combatStep,
    turnPhase,
    gameStarted,
    startGame,
    dojoBuy,
    dojoMeditate,
    dojoSkip,
    doDeployFighter,
    doSetTrap,
    doEquip,
    doActivateSignature,
    endDeploy,
    selectAttack,
    skipCombat,
    doCallNani,
    passDefense,
    chooseBlocker,
    triggerTrap,
    skipTrap,
    advanceCombat,
    botBubbles,
    draftPool,
    draftSelected,
    isDrafting,
    toggleDraftCard,
    confirmDraft,
  };
}
