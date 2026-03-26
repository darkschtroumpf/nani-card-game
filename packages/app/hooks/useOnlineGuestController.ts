import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  PlayerView,
  Universe,
  Card,
  GameState,
  DuelResult,
} from '../../engine/src/types';
import { getPlayerView } from '../../engine/src/game';
import { resolveDuel } from '../../engine/src/duel';
import type { DuelStep } from '../components/DuelSteps';
import type { ReactionType } from '../components/BotReaction';
import { getBotReaction } from '../components/BotReaction';
import type { GameController, DuelState } from './useGameController';
import { deserializeGameState } from '../services/serialization';
import {
  subscribeToGame,
  submitAction,
  getPlayerId,
  getGameState,
  sendHeartbeat,
} from '../services/supabase';

interface OnlineGuestOptions {
  gameId: string;
}

export function useOnlineGuestController(options: OnlineGuestOptions): GameController {
  const { gameId } = options;
  const myId = getPlayerId();

  const [view, setView] = useState<PlayerView | null>(null);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [spiedCard, setSpiedCard] = useState<Card | null>(null);
  const [showIdentity, setShowIdentity] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const prevStateRef = useRef<GameState | null>(null);
  const duelStepsQueue = useRef<DuelStep[]>([]);
  const duelDataRef = useRef<Partial<DuelState>>({});

  const addEvents = useCallback((newEvents: string[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  // Process incoming game state from host
  const processStateUpdate = useCallback((raw: any) => {
    if (!raw?.state) return;

    const state = deserializeGameState(raw.state);
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    const myView = getPlayerView(state, myId);
    setView(myView);

    if (!gameStarted) {
      setGameStarted(true);
      setShowIdentity(true);
    }

    // Detect state transitions for duel animations
    if (prev && !duelState) {
      // Detect new duel where we are the defender
      if (
        state.turnPhase === 'duel_response' &&
        state.pendingDuel?.defenderId === myId &&
        prev.turnPhase !== 'duel_response'
      ) {
        const attacker = state.players.find(p => p.id === state.pendingDuel!.attackerId);
        if (attacker) {
          duelDataRef.current = {
            attackerName: attacker.name,
            defenderName: 'Toi',
            isPlayerAttacking: false,
            declaredUniverse: state.pendingDuel!.declaredUniverse,
            botReaction: getBotReaction('confident'),
            botReactionType: 'confident',
          };
          duelStepsQueue.current = ['defending_intro'];
          setDuelState({ step: 'defending_intro', ...duelDataRef.current } as DuelState);
        }
      }
    }

    // Sync log
    if (state.log.length > (prev?.log.length ?? 0)) {
      const newEntries = state.log.slice(prev?.log.length ?? 0);
      addEvents(newEntries.map(e => e.details));
    }
  }, [myId, gameStarted, duelState, addEvents]);

  // Subscribe to game state updates
  useEffect(() => {
    // Fetch initial state
    getGameState(gameId).then(processStateUpdate).catch(() => {});

    const channel = subscribeToGame(gameId, processStateUpdate);
    return () => { channel.unsubscribe(); };
  }, [gameId, processStateUpdate]);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(() => sendHeartbeat(gameId), 15000);
    return () => clearInterval(interval);
  }, [gameId]);

  const dismissIdentity = useCallback(() => {
    setShowIdentity(false);
  }, []);

  // --- Actions: send to host via Supabase ---

  const playAttack = useCallback(async (cardIndex: number, declaredUniverse: Universe, targetId: string) => {
    await submitAction(gameId, {
      type: 'attack',
      cardIndex,
      declaredUniverse,
      targetId,
    });
  }, [gameId]);

  const playDefend = useCallback(async (cardIndex: number) => {
    setDuelState(null);
    duelStepsQueue.current = [];
    duelDataRef.current = {};

    await submitAction(gameId, {
      type: 'defend',
      cardIndex,
    });
  }, [gameId]);

  const playTrain = useCallback(async (discardIndex: number) => {
    await submitAction(gameId, {
      type: 'train',
      discardIndex,
    });
  }, [gameId]);

  const playSpy = useCallback(async (targetId: string) => {
    await submitAction(gameId, {
      type: 'spy',
      targetId,
    });
  }, [gameId]);

  const claimVictory = useCallback(async () => {
    await submitAction(gameId, {
      type: 'claim_victory',
    });
  }, [gameId]);

  const advanceDuel = useCallback(() => {
    // Guest duel is simpler — just dismiss the defending_intro
    setDuelState(null);
    duelStepsQueue.current = [];
    duelDataRef.current = {};
  }, []);

  const dismissSpy = useCallback(() => {
    setSpiedCard(null);
  }, []);

  // For guest, startGame is a no-op (host starts)
  const startGame = useCallback(() => {}, []);

  const isMyTurn = view !== null && !view.gameOver &&
    view.myPlayer.id === prevStateRef.current?.players[prevStateRef.current.currentPlayerIndex]?.id &&
    prevStateRef.current?.turnPhase === 'action_choice';
  const isDefending = prevStateRef.current?.turnPhase === 'duel_response' &&
    prevStateRef.current?.pendingDuel?.defenderId === myId;

  return {
    view,
    duelState,
    events,
    isMyTurn: isMyTurn && !duelState,
    isDefending: isDefending && duelState?.step === 'defending_intro',
    showIdentity,
    spiedCard,
    gameStarted,
    startGame,
    dismissIdentity,
    playAttack,
    playDefend,
    playTrain,
    playSpy,
    claimVictory,
    advanceDuel,
    dismissSpy,
  };
}
