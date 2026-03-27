import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  DojoGameState, DojoPlayerView, Universe, TurnPhase,
} from '../../engine/src/dojo/types';
import { getDojoPlayerView } from '../../engine/src/dojo/game';
import type { CombatStep } from '../components/CombatScene';
import type { DojoGameController } from './useDojoController';
import { deserializeDojoState } from '../services/serialization';
import {
  subscribeToGame, submitAction, getPlayerId, getGameState, sendHeartbeat,
} from '../services/supabase';

interface GuestOptions {
  gameId: string;
}

export function useDojoOnlineGuest(options: GuestOptions): DojoGameController {
  const { gameId } = options;
  const myId = getPlayerId();

  const [view, setView] = useState<DojoPlayerView | null>(null);
  const [combatStep, setCombatStep] = useState<CombatStep | null>(null);
  const [combatEvents, setCombatEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const prevStateRef = useRef<DojoGameState | null>(null);
  const myPlayerIdRef = useRef<string>('p0');

  const processStateUpdate = useCallback((raw: any) => {
    if (!raw?.state) return;
    const state = deserializeDojoState(raw.state);
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    // Find my player ID in the state
    const myPlayer = state.players.find((_p: any, i: number) => {
      // Match by checking game_players mapping (simplified: assume order)
      return !_p.isBot && _p.id === myPlayerIdRef.current;
    });

    // On first state, determine my player ID
    if (!prev && !gameStarted) {
      // Try to find non-bot player that isn't the host (p0)
      for (const p of state.players) {
        if (!p.isBot) {
          myPlayerIdRef.current = p.id; // simplified, works for 2-player
        }
      }
      setGameStarted(true);
    }

    const myView = getDojoPlayerView(state, myPlayerIdRef.current);
    setView(myView);

    // Detect combat where we're defender
    if (prev && !combatStep) {
      if (
        state.turnPhase === 'combat_response' &&
        state.combat?.defenderId === myPlayerIdRef.current &&
        prev.turnPhase !== 'combat_response'
      ) {
        setCombatStep('declaration');
        setCombatEvents([]);
      }
    }

    // Sync log
    if (state.log.length > (prev?.log.length ?? 0)) {
      const newEntries = state.log.slice(prev?.log.length ?? 0);
      setEvents((e) => [...e, ...newEntries.map((l: any) => l.detail)]);
    }
  }, [gameStarted, combatStep]);

  // Subscribe to state
  useEffect(() => {
    getGameState(gameId).then(processStateUpdate).catch(() => {});
    const channel = subscribeToGame(gameId, processStateUpdate);
    return () => { channel.unsubscribe(); };
  }, [gameId, processStateUpdate]);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(() => sendHeartbeat(gameId), 15000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Actions: send to host via Supabase
  const dojoBuy = useCallback(async (slotIndex: number) => {
    await submitAction(gameId, { type: 'dojo_buy', slotIndex });
  }, [gameId]);

  const dojoMeditate = useCallback(async () => {
    await submitAction(gameId, { type: 'dojo_meditate' });
  }, [gameId]);

  const dojoSkip = useCallback(async () => {
    await submitAction(gameId, { type: 'dojo_skip' });
  }, [gameId]);

  const doDeployFighter = useCallback(async (handIndex: number, fieldSlot: number, concealed: boolean) => {
    await submitAction(gameId, { type: 'deploy_fighter', handIndex, fieldSlot, concealed });
  }, [gameId]);

  const doSetTrap = useCallback(async (handIndex: number, trapSlot: number) => {
    await submitAction(gameId, { type: 'set_trap', handIndex, trapSlot });
  }, [gameId]);

  const doEquip = useCallback(async (handIndex: number, fieldSlot: number, concealed: boolean) => {
    await submitAction(gameId, { type: 'equip', handIndex, fieldSlot, concealed });
  }, [gameId]);

  const doActivateSignature = useCallback(async (handIndex: number) => {
    await submitAction(gameId, { type: 'activate_signature', handIndex });
  }, [gameId]);

  const endDeploy = useCallback(async () => {
    await submitAction(gameId, { type: 'end_deploy' });
  }, [gameId]);

  const selectAttack = useCallback(async (attackerSlot: number, defenderId: string, defenderSlot: number | null, declaredUniverse: Universe) => {
    await submitAction(gameId, { type: 'select_attack', attackerSlot, defenderId, defenderSlot, declaredUniverse });
  }, [gameId]);

  const skipCombat = useCallback(async () => {
    await submitAction(gameId, { type: 'skip_combat' });
  }, [gameId]);

  const doCallNani = useCallback(async () => {
    setCombatStep(null); setCombatEvents([]);
    await submitAction(gameId, { type: 'call_nani' });
  }, [gameId]);

  const passDefense = useCallback(async () => {
    setCombatStep(null); setCombatEvents([]);
    await submitAction(gameId, { type: 'pass_defense' });
  }, [gameId]);

  const advanceCombat = useCallback(() => {
    setCombatStep(null); setCombatEvents([]);
  }, []);

  const startGame = useCallback(() => {}, []);

  const isMyTurn = view !== null &&
    prevStateRef.current?.players[prevStateRef.current.currentPlayerIndex]?.id === myPlayerIdRef.current;

  return {
    view, combatStep, combatEvents, events,
    isMyTurn: isMyTurn && !combatStep,
    turnPhase: prevStateRef.current?.turnPhase ?? null,
    gameStarted,
    startGame, dojoBuy, dojoMeditate, dojoSkip,
    doDeployFighter, doSetTrap, doEquip, doActivateSignature, endDeploy,
    selectAttack, skipCombat, doCallNani, passDefense, advanceCombat,
  };
}
