import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  DojoGameState, DojoPlayerView, Universe, Archetype, TurnPhase,
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
import type { DojoGameController, DojoGameConfig } from './useDojoController';
import { serializeDojoState } from '../services/serialization';
import {
  updateGameState, setGameStatus, subscribeToActions,
  markActionProcessed, getGamePlayers, getPlayerId, sendHeartbeat,
} from '../services/supabase';

interface HostOptions {
  gameId: string;
  botCount: number;
  playerArchetype: Archetype;
}

const DEFAULT_BOT_ARCHETYPES: Archetype[] = [
  'magical_ward', 'mecha_fortress', 'isekai_thief', 'seinen_assassin',
];

export function useDojoOnlineHost(options: HostOptions): DojoGameController {
  const { gameId, botCount, playerArchetype } = options;
  const myId = getPlayerId();

  const [view, setView] = useState<DojoPlayerView | null>(null);
  const [combatStep, setCombatStep] = useState<CombatStep | null>(null);
  const [combatEvents, setCombatEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const stateRef = useRef<DojoGameState | null>(null);
  const myPlayerIdRef = useRef<string>('p0');
  const memoriesRef = useRef<BotMemory[]>([]);
  const processingRef = useRef(false);

  const syncView = useCallback((s: DojoGameState) => {
    stateRef.current = s;
    setView(getDojoPlayerView(s, myPlayerIdRef.current));
  }, []);

  const addEvents = useCallback((newEvents: string[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  const broadcastState = useCallback(async (s: DojoGameState) => {
    try {
      await updateGameState(gameId, serializeDojoState(s));
    } catch (e) {
      console.warn('Broadcast failed:', e);
    }
  }, [gameId]);

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Bot turn processing (same as solo but with broadcasts)
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

      if (!current.isBot && current.id !== myPlayerIdRef.current) {
        // Remote human player's turn — broadcast and wait
        syncView(s);
        await broadcastState(s);
        processingRef.current = false;
        return;
      }

      if (current.id === myPlayerIdRef.current) {
        syncView(s);
        await broadcastState(s);
        break;
      }

      const playerIdx = s.currentPlayerIndex;
      const memory = memoriesRef.current[playerIdx] ?? createBotMemory();
      const botView = getDojoPlayerView(s, current.id);

      if (s.turnPhase === 'ki') { processKiPhase(s); syncView(s); await delay(200); }

      if (s.turnPhase === 'dojo') {
        const d = botDecideDojoPhase(botView, memory);
        if (d.action === 'buy') processDojoBuy(s, d.params.slotIndex);
        else if (d.action === 'meditate') processDojoMeditate(s);
        s.turnPhase = 'deploy';
        syncView(s); await delay(300);
      }

      if (s.turnPhase === 'deploy') {
        const freshView = getDojoPlayerView(s, current.id);
        const decisions = botDecideDeployPhase(freshView, memory);
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
        syncView(s); await delay(300);
      }

      if (s.turnPhase === 'combat_select') {
        const freshView = getDojoPlayerView(s, current.id);
        const combatDecision = botDecideCombat(freshView, memory);
        if (combatDecision) {
          const { attackerSlot, defenderId, defenderSlot, declaredUniverse } = combatDecision.params;
          initiateCombat(s, attackerSlot, defenderId, defenderSlot, declaredUniverse);
          syncView(s); await delay(400);

          const defender = s.players.find(p => p.id === s.combat?.defenderId);
          if (defender && !defender.isBot && defender.id !== myPlayerIdRef.current) {
            // Remote human defender — broadcast and wait
            s.turnPhase = 'combat_response';
            syncView(s);
            await broadcastState(s);
            processingRef.current = false;
            return;
          }

          if (defender?.id === myPlayerIdRef.current) {
            // Host is defender
            s.turnPhase = 'combat_response';
            setCombatStep('declaration');
            setCombatEvents([]);
            syncView(s);
            processingRef.current = false;
            return;
          }

          // Bot defender
          if (defender && s.combat) {
            const defView = getDojoPlayerView(s, defender.id);
            const defIdx = s.players.indexOf(defender);
            const defMemory = memoriesRef.current[defIdx] ?? createBotMemory();
            const defDecision = botDecideDefense(defView, defMemory);
            if (defDecision.action === 'call_nani') callNani(s);
            else if (defDecision.action === 'play_technique') {
              const techIdx = defender.hand.findIndex(c =>
                c.card.type === 'technique' && ['shield', 'negate', 'return_hand', 'heal'].includes(c.card.effectType ?? '')
              );
              if (techIdx >= 0) defenderPlayTechnique(s, techIdx);
            }
            const evts = resolveCombat(s);
            addEvents(evts);
            syncView(s); await delay(400);
          }
        }
        s.turnPhase = 'end';
      }

      if (s.turnPhase === 'end') {
        processEndPhase(s);
        syncView(s); await delay(200);
      }
    }

    syncView(s);
    await broadcastState(s);
    if (s.gameOver) setGameStatus(gameId, 'finished').catch(() => {});
    processingRef.current = false;
  }, [syncView, addEvents, broadcastState, gameId]);

  // Start game
  const startGame = useCallback(async () => {
    const gamePlayers = await getGamePlayers(gameId);
    const humans = gamePlayers.sort((a: any, b: any) => a.seat_index - b.seat_index);
    const botArchetypes = DEFAULT_BOT_ARCHETYPES.slice(0, botCount);
    const botNames = ['Sakura-bot', 'Rei-bot', 'Subaru-bot', 'Light-bot'];

    const configs: { name: string; archetype: Archetype }[] = [];
    const playerIdMap: Record<string, string> = {};

    for (const h of humans) {
      const archIdx = configs.length;
      configs.push({ name: h.nickname || `Joueur ${h.seat_index + 1}`, archetype: playerArchetype });
      playerIdMap[`p${archIdx}`] = h.player_id;
      if (h.player_id === myId) myPlayerIdRef.current = `p${archIdx}`;
    }
    for (let i = 0; i < botCount; i++) {
      configs.push({ name: botNames[i] || `Bot ${i + 1}`, archetype: botArchetypes[i] });
    }

    memoriesRef.current = configs.map(() => createBotMemory());
    const newState = createDojoGame(configs);

    stateRef.current = newState;
    setEvents([]);
    setCombatStep(null);
    setGameStarted(true);

    processKiPhase(newState);
    syncView(newState);
    await broadcastState(newState);

    if (newState.players[0].id !== myPlayerIdRef.current) {
      processBotTurns(newState);
    }
  }, [gameId, botCount, playerArchetype, myId, syncView, broadcastState, processBotTurns]);

  // Auto-start
  useEffect(() => { startGame(); }, []);

  // Listen for remote actions
  useEffect(() => {
    const channel = subscribeToActions(gameId, (actionRow: any) => {
      const s = stateRef.current;
      if (!s || s.gameOver) return;
      if (actionRow.player_id === myId) return;

      const action = actionRow.action;
      // Apply remote action based on type
      if (action.type === 'dojo_buy') processDojoBuy(s, action.slotIndex);
      else if (action.type === 'dojo_meditate') processDojoMeditate(s);
      else if (action.type === 'dojo_skip') { /* nothing */ }
      else if (action.type === 'deploy_fighter') deployFighter(s, action.handIndex, action.fieldSlot, action.concealed);
      else if (action.type === 'set_trap') setTrap(s, action.handIndex, action.trapSlot);
      else if (action.type === 'equip') equipCard(s, action.handIndex, action.fieldSlot, action.concealed);
      else if (action.type === 'activate_signature') activateSignature(s, action.handIndex);
      else if (action.type === 'end_deploy') s.turnPhase = 'combat_select';
      else if (action.type === 'select_attack') initiateCombat(s, action.attackerSlot, action.defenderId, action.defenderSlot, action.declaredUniverse);
      else if (action.type === 'skip_combat') { s.turnPhase = 'end'; processEndPhase(s); }
      else if (action.type === 'call_nani') { callNani(s); const evts = resolveCombat(s); addEvents(evts); }
      else if (action.type === 'pass_defense') { const evts = resolveCombat(s); addEvents(evts); }

      markActionProcessed(actionRow.id).catch(() => {});
      syncView(s);

      // Continue processing
      const current = s.players[s.currentPlayerIndex];
      if (current?.isBot || (s.turnPhase === 'end')) {
        processBotTurns(s);
      } else {
        broadcastState(s);
      }
    });
    return () => { channel.unsubscribe(); };
  }, [gameId, myId, syncView, addEvents, broadcastState, processBotTurns]);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(() => sendHeartbeat(gameId), 15000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Player actions (same as solo + broadcast)
  const dojoBuy = useCallback((slotIndex: number) => {
    const s = stateRef.current; if (!s) return;
    processDojoBuy(s, slotIndex); s.turnPhase = 'deploy';
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const dojoMeditate = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    processDojoMeditate(s); s.turnPhase = 'deploy';
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const dojoSkip = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    s.turnPhase = 'deploy';
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const doDeployFighter = useCallback((handIndex: number, fieldSlot: number, concealed: boolean) => {
    const s = stateRef.current; if (!s) return;
    deployFighter(s, handIndex, fieldSlot, concealed);
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const doSetTrap = useCallback((handIndex: number, trapSlot: number) => {
    const s = stateRef.current; if (!s) return;
    setTrap(s, handIndex, trapSlot);
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const doEquip = useCallback((handIndex: number, fieldSlot: number, concealed: boolean) => {
    const s = stateRef.current; if (!s) return;
    equipCard(s, handIndex, fieldSlot, concealed);
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const doActivateSignature = useCallback((handIndex: number) => {
    const s = stateRef.current; if (!s) return;
    const evts = activateSignature(s, handIndex);
    addEvents(evts); syncView(s); broadcastState(s);
  }, [syncView, addEvents, broadcastState]);

  const endDeploy = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    s.turnPhase = 'combat_select';
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const selectAttack = useCallback((attackerSlot: number, defenderId: string, defenderSlot: number | null, declaredUniverse: Universe) => {
    const s = stateRef.current; if (!s) return;
    initiateCombat(s, attackerSlot, defenderId, defenderSlot, declaredUniverse);
    setCombatStep('declaration'); setCombatEvents([]);
    s.turnPhase = 'combat_declare';
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const skipCombat = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    s.turnPhase = 'end'; processEndPhase(s);
    syncView(s); broadcastState(s);
    if (!s.gameOver && s.players[s.currentPlayerIndex]?.id !== myPlayerIdRef.current) {
      processBotTurns(s);
    }
  }, [syncView, broadcastState, processBotTurns]);

  const doCallNani = useCallback(() => {
    const s = stateRef.current; if (!s || !s.combat) return;
    callNani(s); setCombatStep('reveal');
    const evts = resolveCombat(s); setCombatEvents(evts);
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const passDefense = useCallback(() => {
    const s = stateRef.current; if (!s || !s.combat) return;
    setCombatStep('reveal');
    const evts = resolveCombat(s); setCombatEvents(evts);
    syncView(s); broadcastState(s);
  }, [syncView, broadcastState]);

  const advanceCombat = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    if (combatStep === 'declaration') {
      const defender = s.players.find(p => p.id === s.combat?.defenderId);
      if (defender?.id === myPlayerIdRef.current) { setCombatStep('nani_call'); }
      else { setCombatStep('reveal'); const evts = resolveCombat(s); setCombatEvents(evts); syncView(s); broadcastState(s); }
      return;
    }
    if (combatStep === 'nani_call') {
      setCombatStep('reveal');
      const evts = resolveCombat(s); setCombatEvents(evts); syncView(s); broadcastState(s);
      return;
    }
    if (combatStep === 'reveal') { setCombatStep('resolution'); return; }
    if (combatStep === 'resolution') {
      setCombatStep(null); setCombatEvents([]);
      s.turnPhase = 'end'; processEndPhase(s); syncView(s); broadcastState(s);
      if (!s.gameOver && s.players[s.currentPlayerIndex]?.id !== myPlayerIdRef.current) {
        processBotTurns(s);
      }
    }
  }, [combatStep, syncView, broadcastState, processBotTurns]);

  const isMyTurn = view !== null &&
    stateRef.current?.players[stateRef.current.currentPlayerIndex]?.id === myPlayerIdRef.current;

  return {
    view, combatStep, combatEvents, events,
    isMyTurn: isMyTurn && !combatStep,
    turnPhase: stateRef.current?.turnPhase ?? null,
    gameStarted,
    startGame, dojoBuy, dojoMeditate, dojoSkip,
    doDeployFighter, doSetTrap, doEquip, doActivateSignature, endDeploy,
    selectAttack, skipCombat, doCallNani, passDefense, advanceCombat,
  };
}
