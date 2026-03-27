import { useState, useCallback, useRef } from 'react';
import type {
  DojoGameState, DojoPlayerView, Universe, CardInstance,
  Archetype, TurnPhase, CombatState,
} from '../../engine/src/dojo/types';
import {
  createDojoGame, processKiPhase, processDojoBuy, processDojoMeditate,
  deployFighter, setTrap, equipCard, initiateCombat,
  defenderPlayTechnique, callNani, resolveCombat,
  processEndPhase, getDojoPlayerView, activateSignature,
} from '../../engine/src/dojo/game';
import {
  botDecideDojoPhase, botDecideDeployPhase, botDecideCombat,
  botDecideDefense, createBotMemory,
} from '../../engine/src/dojo/bot';
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
  doCallNani: () => void;
  passDefense: () => void;

  // Combat UI
  advanceCombat: () => void;

  // Bot visibility
  botBubbles: Record<string, { message: string; type: 'action' | 'reaction' | 'nani' } | null>;
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

      // Process bot phases
      if (s.turnPhase === 'ki') {
        processKiPhase(s);
        syncView(s);
        await delay(200);
      }

      if (s.turnPhase === 'dojo') {
        const decision = botDecideDojoPhase(botView, memory);
        if (decision.action === 'buy') {
          processDojoBuy(s, decision.params.slotIndex);
          showBotBubble(current.id, 'Interessant!');
        } else if (decision.action === 'meditate') {
          processDojoMeditate(s);
          showBotBubble(current.id, 'Focus...');
        }
        s.turnPhase = 'deploy';
        syncView(s);
        await delay(500);
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
        await delay(300);
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
            await delay(600);

            // Check if defender is human
            const defender = s.players.find(p => p.id === s.combat?.defenderId);
            if (defender?.id === myIdRef.current) {
              // Human is defender — show combat UI and wait
              s.turnPhase = 'combat_response';
              setCombatStep('declaration');
              setCombatEvents([]);
              syncView(s);
              processingRef.current = false;
              return; // Stop processing, wait for human defense
            }

            // Bot defender
            if (defender && s.combat) {
              const defView = getDojoPlayerView(s, defender.id);
              const defIdx = s.players.indexOf(defender);
              const defMemory = memoriesRef.current[defIdx] ?? createBotMemory();
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
              await delay(400);
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

  // --- Start Game ---

  const startGame = useCallback((config: DojoGameConfig) => {
    const botArchetypes = config.botArchetypes ??
      DEFAULT_BOT_ARCHETYPES.slice(0, config.botCount);
    const botNames = ['Sakura', 'Rei', 'Subaru', 'Light'];

    const playerConfigs = [
      { name: config.playerName, archetype: config.playerArchetype },
      ...botArchetypes.map((a, i) => ({ name: botNames[i] || `Bot ${i + 1}`, archetype: a })),
    ];

    memoriesRef.current = playerConfigs.map(() => createBotMemory());
    const newState = createDojoGame(playerConfigs);
    myIdRef.current = 'p0';

    stateRef.current = newState;
    setEvents([]);
    setCombatStep(null);
    setCombatEvents([]);
    setGameStarted(true);

    // Process opening ki phase for player
    processKiPhase(newState);
    syncView(newState);

    // If first player is a bot (shouldn't happen since p0 is human), process
    if (newState.players[0].id !== myIdRef.current) {
      processBotTurns(newState);
    }
  }, [syncView, processBotTurns]);

  // --- Dojo Phase Actions ---

  const dojoBuy = useCallback((slotIndex: number) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'dojo') return;
    processDojoBuy(s, slotIndex);
    s.turnPhase = 'deploy';
    playCardFeedback();
    syncView(s);
    setTimeout(() => { if (stateRef.current) autoSkipDeployIfNeeded(stateRef.current); }, 100);
  }, [syncView, autoSkipDeployIfNeeded]);

  const dojoMeditate = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'dojo') return;
    processDojoMeditate(s);
    s.turnPhase = 'deploy';
    syncView(s);
    setTimeout(() => { if (stateRef.current) autoSkipDeployIfNeeded(stateRef.current); }, 100);
  }, [syncView, autoSkipDeployIfNeeded]);

  const dojoSkip = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'dojo') return;
    s.turnPhase = 'deploy';
    syncView(s);
    setTimeout(() => { if (stateRef.current) autoSkipDeployIfNeeded(stateRef.current); }, 100);
  }, [syncView, autoSkipDeployIfNeeded]);

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
    // Auto-skip if nothing left
    setTimeout(() => { if (stateRef.current) autoSkipDeployIfNeeded(stateRef.current); }, 100);
  }, [syncView, autoSkipDeployIfNeeded]);

  const doSetTrap = useCallback((handIndex: number, trapSlot: number) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    setTrap(s, handIndex, trapSlot);
    syncView(s);
    setTimeout(() => { if (stateRef.current) autoSkipDeployIfNeeded(stateRef.current); }, 100);
  }, [syncView, autoSkipDeployIfNeeded]);

  const doEquip = useCallback((handIndex: number, fieldSlot: number, concealed: boolean) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    equipCard(s, handIndex, fieldSlot, concealed);
    syncView(s);
    setTimeout(() => { if (stateRef.current) autoSkipDeployIfNeeded(stateRef.current); }, 100);
  }, [syncView, autoSkipDeployIfNeeded]);

  const doActivateSignature = useCallback((handIndex: number) => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    const evts = activateSignature(s, handIndex);
    addEvents(evts);
    successFeedback();
    syncView(s);
    setTimeout(() => { if (stateRef.current) autoSkipDeployIfNeeded(stateRef.current); }, 100);
  }, [syncView, addEvents, autoSkipDeployIfNeeded]);

  const endDeploy = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.turnPhase !== 'deploy') return;
    s.turnPhase = 'combat_select';
    syncView(s);
  }, [syncView]);

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
      // Check if human is defender
      const defender = s.players.find(p => p.id === s.combat?.defenderId);
      if (defender?.id === myIdRef.current) {
        setCombatStep('nani_call');
      } else {
        // Bot handles defense, go to reveal
        setCombatStep('reveal');
        const evts = resolveCombat(s);
        setCombatEvents(evts);
        syncView(s);
      }
      return;
    }

    if (combatStep === 'nani_call') {
      // Player chose to let it pass
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
    advanceCombat,
    botBubbles,
  };
}
