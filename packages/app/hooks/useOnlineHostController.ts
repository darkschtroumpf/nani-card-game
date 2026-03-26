import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  GameState,
  PlayerView,
  Universe,
  Card,
  Action,
  DuelResult,
} from '../../engine/src/types';
import { createGame, processOpening, applyAction, getPlayerView } from '../../engine/src/game';
import { resolveDuel } from '../../engine/src/duel';
import { computeBotAction } from '../../engine/src/ai/bot';
import type { BotDifficulty } from '../../engine/src/ai/bot';
import { dominates } from '../../engine/src/constants';
import type { DuelStep } from '../components/DuelSteps';
import type { ReactionType } from '../components/BotReaction';
import { getBotReaction } from '../components/BotReaction';
import type { GameController, DuelState } from './useGameController';
import { serializeGameState } from '../services/serialization';
import {
  updateGameState,
  setGameStatus,
  subscribeToActions,
  markActionProcessed,
  getGamePlayers,
  getPlayerId,
  sendHeartbeat,
} from '../services/supabase';

interface OnlineHostOptions {
  gameId: string;
  botCount: number;
  difficulty: BotDifficulty;
}

export function useOnlineHostController(options: OnlineHostOptions): GameController {
  const { gameId, botCount, difficulty } = options;
  const myId = getPlayerId();

  const [view, setView] = useState<PlayerView | null>(null);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [spiedCard, setSpiedCard] = useState<Card | null>(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const stateRef = useRef<GameState | null>(null);
  const difficultyRef = useRef<BotDifficulty>(difficulty);
  const duelStepsQueue = useRef<DuelStep[]>([]);
  const duelDataRef = useRef<Partial<DuelState>>({});
  const broadcastPending = useRef(false);

  const syncView = useCallback((s: GameState) => {
    stateRef.current = s;
    setView(getPlayerView(s, myId));
  }, [myId]);

  const addEvents = useCallback((newEvents: string[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  // Broadcast state to Supabase (debounced - only when a human needs to act)
  const broadcastState = useCallback(async (s: GameState) => {
    try {
      await updateGameState(gameId, serializeGameState(s));
    } catch (e) {
      console.warn('Failed to broadcast state:', e);
    }
  }, [gameId]);

  const broadcastIfNeeded = useCallback((s: GameState) => {
    const current = s.players[s.currentPlayerIndex];
    const needsBroadcast =
      s.gameOver ||
      !current?.isBot ||
      (s.turnPhase === 'duel_response' && s.pendingDuel &&
        !s.players.find(p => p.id === s.pendingDuel!.defenderId)?.isBot);

    if (needsBroadcast) {
      broadcastState(s);
    } else {
      broadcastPending.current = true;
    }
  }, [broadcastState]);

  // Process bot turns until a human needs to act
  const processBotTurns = useCallback((s: GameState) => {
    const runNext = () => {
      if (s.gameOver) {
        syncView(s);
        broadcastState(s);
        setGameStatus(gameId, 'finished').catch(() => {});
        return;
      }

      const current = s.players[s.currentPlayerIndex];
      if (!current || !current.isBot || current.eliminated) {
        syncView(s);
        broadcastIfNeeded(s);
        return;
      }

      // Opening for bot
      if (s.turnPhase === 'opening') {
        const ev = processOpening(s);
        addEvents(ev);
      }

      if (s.turnPhase === 'action_choice' && current.isBot) {
        const action = computeBotAction(s, current.id, difficultyRef.current);
        const ev = applyAction(s, action, current.id);
        addEvents(ev);

        // Bot attacked a human defender?
        if (action.type === 'attack' && s.pendingDuel) {
          const defender = s.players.find(p => p.id === s.pendingDuel!.defenderId);

          if (defender && !defender.isBot && defender.id === myId) {
            // Host is defender — show duel UI
            const attacker = s.players.find(p => p.id === s.pendingDuel!.attackerId)!;
            duelDataRef.current = {
              attackerName: attacker.name,
              defenderName: 'Toi',
              isPlayerAttacking: false,
              declaredUniverse: s.pendingDuel!.declaredUniverse,
              botReaction: getBotReaction('confident'),
              botReactionType: 'confident',
            };
            duelStepsQueue.current = ['defending_intro'];
            setDuelState({ step: 'defending_intro', ...duelDataRef.current } as DuelState);
            syncView(s);
            broadcastState(s); // broadcast so guests see the duel
            return;
          }

          if (defender && !defender.isBot) {
            // Remote human defender — broadcast and wait for their action
            syncView(s);
            broadcastState(s);
            return;
          }

          // Bot vs bot
          if (defender?.isBot) {
            const defAction = computeBotAction(s, defender.id, difficultyRef.current);
            const defEv = applyAction(s, defAction, defender.id);
            addEvents(defEv);
          }
        }

        syncView(s);

        if (!s.gameOver) {
          setTimeout(() => {
            if (s.turnPhase === 'opening') {
              const ev = processOpening(s);
              addEvents(ev);
            }
            runNext();
          }, 400);
        } else {
          broadcastState(s);
          setGameStatus(gameId, 'finished').catch(() => {});
        }
        return;
      }

      syncView(s);
      broadcastIfNeeded(s);
    };

    setTimeout(runNext, 300);
  }, [syncView, addEvents, broadcastState, broadcastIfNeeded, gameId, myId]);

  // Start the game
  const startGame = useCallback(async () => {
    difficultyRef.current = difficulty;

    // Fetch the player list from Supabase
    const gamePlayers = await getGamePlayers(gameId);
    const humanPlayers = gamePlayers.sort((a: any, b: any) => a.seat_index - b.seat_index);
    const humanCount = humanPlayers.length;
    const totalPlayers = humanCount + botCount;

    const botNames = ['Goku-bot', 'Sailor-bot', 'Eva-bot', 'Kirito-bot', 'Light-bot'];
    const playerIds: string[] = [];
    const playerNames: string[] = [];
    const botFlags: boolean[] = [];

    for (const hp of humanPlayers) {
      playerIds.push(hp.player_id);
      playerNames.push(hp.nickname || `Joueur ${hp.seat_index + 1}`);
      botFlags.push(false);
    }
    for (let i = 0; i < botCount; i++) {
      playerIds.push(`bot-${i}`);
      playerNames.push(botNames[i] || `Bot ${i + 1}`);
      botFlags.push(true);
    }

    const newState = createGame({
      playerCount: totalPlayers,
      botCount,
      playerNames,
      playerIds,
      botFlags,
    });

    // Set mentor's protected player
    const myPlayer = newState.players.find(p => p.id === myId);
    if (myPlayer?.identity.type === 'mentor') {
      const target = newState.players.find(p => p.id !== myId);
      if (target) myPlayer.identity.protectedPlayerId = target.id;
    }

    stateRef.current = newState;
    setEvents([]);
    setDuelState(null);
    setSpiedCard(null);
    setShowIdentity(true);
    setGameStarted(true);

    const openEvents = processOpening(newState);
    addEvents(openEvents);
    syncView(newState);

    // Broadcast initial state
    await broadcastState(newState);
  }, [gameId, botCount, difficulty, myId, addEvents, syncView, broadcastState]);

  // Auto-start on mount
  useEffect(() => {
    startGame();
  }, []);

  // Listen for remote player actions
  useEffect(() => {
    const channel = subscribeToActions(gameId, (actionRow: any) => {
      const s = stateRef.current;
      if (!s || s.gameOver) return;
      if (actionRow.player_id === myId) return; // ignore own actions

      const action: Action = actionRow.action;
      const playerId: string = actionRow.player_id;

      // Validate it's this player's turn (or they're the defender)
      const currentPlayer = s.players[s.currentPlayerIndex];
      const isDefender = s.turnPhase === 'duel_response' &&
        s.pendingDuel?.defenderId === playerId;
      const isCurrentPlayer = currentPlayer?.id === playerId;

      if (!isCurrentPlayer && !isDefender) {
        markActionProcessed(actionRow.id).catch(() => {});
        return;
      }

      const ev = applyAction(s, action, playerId);
      addEvents(ev);
      markActionProcessed(actionRow.id).catch(() => {});

      syncView(s);

      // After remote action, check if we need to process bot turns or duel
      if (s.turnPhase === 'duel_response' && s.pendingDuel) {
        const defender = s.players.find(p => p.id === s.pendingDuel!.defenderId);
        if (defender?.isBot) {
          const defAction = computeBotAction(s, defender.id, difficultyRef.current);
          const defEv = applyAction(s, defAction, defender.id);
          addEvents(defEv);
          syncView(s);
        }
        broadcastState(s);
      } else if (s.turnPhase === 'opening' || s.turnPhase === 'action_choice') {
        if (s.turnPhase === 'opening') {
          const openEv = processOpening(s);
          addEvents(openEv);
          syncView(s);
        }
        const current = s.players[s.currentPlayerIndex];
        if (current?.isBot) {
          processBotTurns(s);
        } else {
          broadcastState(s);
        }
      } else {
        broadcastState(s);
      }
    });

    return () => { channel.unsubscribe(); };
  }, [gameId, myId, addEvents, syncView, broadcastState, processBotTurns]);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(() => sendHeartbeat(gameId), 15000);
    return () => clearInterval(interval);
  }, [gameId]);

  const dismissIdentity = useCallback(() => {
    setShowIdentity(false);
    const s = stateRef.current;
    if (s && s.players[s.currentPlayerIndex]?.isBot) {
      processBotTurns(s);
    }
  }, [processBotTurns]);

  // --- Player actions (same as solo but with broadcast) ---

  const playAttack = useCallback((cardIndex: number, declaredUniverse: Universe, targetId: string) => {
    const s = stateRef.current;
    if (!s) return;

    const player = s.players.find(p => p.id === myId)!;
    const playerCard = player.hand[cardIndex];
    const target = s.players.find(p => p.id === targetId)!;

    const ev = applyAction(s, { type: 'attack', cardIndex, declaredUniverse, targetId }, myId);
    addEvents(ev);

    if (target.isBot) {
      // Bot defender — show duel animation
      const defAction = computeBotAction(s, target.id, difficultyRef.current);
      const defCard = target.hand[defAction.type === 'defend' ? defAction.cardIndex : 0];

      let reactionType: ReactionType;
      const botCounters = dominates(defCard.universe, declaredUniverse);
      if (botCounters && defCard.value >= 5) reactionType = 'confident';
      else if (botCounters) reactionType = 'doubt';
      else if (defCard.value <= 2) reactionType = 'scared';
      else reactionType = Math.random() > 0.5 ? 'believe' : 'doubt';

      duelDataRef.current = {
        attackerName: 'Toi',
        defenderName: target.name,
        isPlayerAttacking: true,
        playerCard,
        declaredUniverse,
        botReaction: getBotReaction(reactionType),
        botReactionType: reactionType,
      };
      duelStepsQueue.current = ['your_card', 'your_declare', 'bot_reacts', 'bot_plays'];
      setDuelState({ step: 'your_card', ...duelDataRef.current } as DuelState);

      const defEv = applyAction(s, defAction, target.id);
      addEvents(defEv);
      duelDataRef.current.opponentCard = defCard;

      syncView(s);
      broadcastState(s);
    } else {
      // Human defender — broadcast and wait
      syncView(s);
      broadcastState(s);
    }
  }, [myId, addEvents, syncView, broadcastState]);

  const playDefend = useCallback((cardIndex: number) => {
    const s = stateRef.current;
    if (!s) return;

    const player = s.players.find(p => p.id === myId)!;
    const defCard = player.hand[cardIndex];
    duelDataRef.current.playerCard = defCard;

    if (s.pendingDuel) {
      const attacker = s.players.find(p => p.id === s.pendingDuel!.attackerId)!;
      const atkCard = attacker.hand[s.pendingDuel!.attackerCardIndex];
      duelDataRef.current.opponentCard = atkCard;
    }

    const ev = applyAction(s, { type: 'defend', cardIndex }, myId);
    addEvents(ev);

    duelStepsQueue.current = ['reveal'];
    setDuelState({ step: 'reveal', ...duelDataRef.current } as DuelState);

    syncView(s);
    broadcastState(s);
  }, [myId, addEvents, syncView, broadcastState]);

  const advanceDuel = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;

    const queue = duelStepsQueue.current;
    if (queue.length > 0) queue.shift();

    const data = duelDataRef.current;
    const currentDuel = duelState;
    let nextStep: DuelStep | null = null;

    if (queue.length > 0) {
      nextStep = queue[0];
    } else if (currentDuel?.step === 'bot_plays' || currentDuel?.step === 'your_card') {
      nextStep = 'reveal';
    } else if (currentDuel?.step === 'reveal') {
      nextStep = 'explain';
    } else if (currentDuel?.step === 'explain') {
      nextStep = 'result';
    } else if (currentDuel?.step === 'result') {
      setDuelState(null);
      duelStepsQueue.current = [];
      duelDataRef.current = {};

      if (!s.gameOver) {
        if (s.turnPhase === 'opening') {
          const ev = processOpening(s);
          addEvents(ev);
        }
        syncView(s);
        if (s.players[s.currentPlayerIndex]?.isBot) {
          processBotTurns(s);
        } else {
          broadcastState(s);
        }
      } else {
        syncView(s);
        broadcastState(s);
        setGameStatus(gameId, 'finished').catch(() => {});
      }
      return;
    }

    if (nextStep) {
      let result = data.result;
      if ((nextStep === 'reveal' || nextStep === 'explain' || nextStep === 'result') && !result) {
        if (data.playerCard && data.opponentCard) {
          const atkCard = data.isPlayerAttacking ? data.playerCard : data.opponentCard;
          const defCard = data.isPlayerAttacking ? data.opponentCard : data.playerCard;
          const atkId = data.isPlayerAttacking ? myId : s.players.find(p => p.name === data.attackerName)?.id ?? '';
          const defId = data.isPlayerAttacking ? s.players.find(p => p.name === data.defenderName)?.id ?? '' : myId;
          result = resolveDuel(atkCard, defCard, atkId, defId);
          duelDataRef.current.result = result;

          if (result.winnerId) {
            const botId = data.isPlayerAttacking ? defId : atkId;
            const botWon = result.winnerId === botId;
            const newReaction = result.outsiderVictory ? 'outsider' : (botWon ? 'win' : 'lose');
            data.botReaction = getBotReaction(newReaction as ReactionType);
            data.botReactionType = newReaction as ReactionType;
          }
        }
      }

      setDuelState({
        step: nextStep,
        attackerName: data.attackerName ?? '',
        defenderName: data.defenderName ?? '',
        isPlayerAttacking: data.isPlayerAttacking ?? true,
        playerCard: data.playerCard,
        opponentCard: data.opponentCard,
        declaredUniverse: data.declaredUniverse,
        botReaction: data.botReaction,
        botReactionType: data.botReactionType,
        result,
      });
    }
  }, [duelState, myId, addEvents, syncView, processBotTurns, broadcastState, gameId]);

  const playTrain = useCallback((discardIndex: number) => {
    const s = stateRef.current;
    if (!s) return;

    const ev = applyAction(s, { type: 'train', discardIndex }, myId);
    addEvents(ev);
    syncView(s);

    if (!s.gameOver) {
      if (s.turnPhase === 'opening') {
        const openEv = processOpening(s);
        addEvents(openEv);
      }
      syncView(s);
      if (s.players[s.currentPlayerIndex]?.isBot) {
        processBotTurns(s);
      } else {
        broadcastState(s);
      }
    } else {
      broadcastState(s);
    }
  }, [myId, addEvents, syncView, processBotTurns, broadcastState]);

  const playSpy = useCallback((targetId: string) => {
    const s = stateRef.current;
    if (!s) return;

    const target = s.players.find(p => p.id === targetId);
    if (target && target.hand.length > 0) {
      const idx = Math.floor(Math.random() * target.hand.length);
      setSpiedCard(target.hand[idx]);
    }

    const ev = applyAction(s, { type: 'spy', targetId }, myId);
    addEvents(ev);
    syncView(s);
  }, [myId, addEvents, syncView]);

  const dismissSpy = useCallback(() => {
    setSpiedCard(null);
    const s = stateRef.current;
    if (!s) return;

    if (!s.gameOver) {
      if (s.turnPhase === 'opening') {
        const ev = processOpening(s);
        addEvents(ev);
      }
      syncView(s);
      if (s.players[s.currentPlayerIndex]?.isBot) {
        processBotTurns(s);
      } else {
        broadcastState(s);
      }
    }
  }, [addEvents, syncView, processBotTurns, broadcastState]);

  const claimVictory = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const ev = applyAction(s, { type: 'claim_victory' }, myId);
    addEvents(ev);
    syncView(s);
    broadcastState(s);
    if (s.gameOver) {
      setGameStatus(gameId, 'finished').catch(() => {});
    }
  }, [myId, addEvents, syncView, broadcastState, gameId]);

  const isMyTurn = view !== null && !view.gameOver &&
    view.myPlayer.id === stateRef.current?.players[stateRef.current.currentPlayerIndex]?.id;
  const isDefending = stateRef.current?.turnPhase === 'duel_response' &&
    stateRef.current?.pendingDuel?.defenderId === myId;

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
