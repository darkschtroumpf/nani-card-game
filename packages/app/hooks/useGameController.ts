import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  GameState,
  GameConfig,
  Action,
  PlayerView,
  DuelResult,
  Universe,
  Card,
} from '../../engine/src/types';
import { createGame, processOpening, applyAction, getPlayerView } from '../../engine/src/game';
import { resolveDuel } from '../../engine/src/duel';
import { computeBotAction } from '../../engine/src/ai/bot';
import type { BotDifficulty } from '../../engine/src/ai/bot';

export interface GameController {
  view: PlayerView | null;
  duelResult: DuelResult | null;
  duelPhase: 'none' | 'declared' | 'responding' | 'revealed';
  events: string[];
  isMyTurn: boolean;
  waitingForDefense: boolean;

  startGame: (config: GameConfig & { difficulty: BotDifficulty }) => void;
  playAttack: (cardIndex: number, declaredUniverse: Universe, targetId: string) => void;
  playDefend: (cardIndex: number) => void;
  playTrain: (discardIndex: number) => void;
  playSpy: (targetId: string) => void;
  claimVictory: () => void;
  dismissDuel: () => void;
  spiedCard: Card | null;
}

export function useGameController(): GameController {
  const [state, setState] = useState<GameState | null>(null);
  const [view, setView] = useState<PlayerView | null>(null);
  const [duelResult, setDuelResult] = useState<DuelResult | null>(null);
  const [duelPhase, setDuelPhase] = useState<'none' | 'declared' | 'responding' | 'revealed'>('none');
  const [events, setEvents] = useState<string[]>([]);
  const [spiedCard, setSpiedCard] = useState<Card | null>(null);
  const difficultyRef = useRef<BotDifficulty>('medium');
  const humanPlayerId = 'player-0';

  const updateView = useCallback((s: GameState) => {
    setView(getPlayerView(s, humanPlayerId));
  }, []);

  const addEvents = useCallback((newEvents: string[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  // Check if it's a bot's turn and play automatically
  const processBotTurns = useCallback(
    (s: GameState) => {
      const runBot = () => {
        if (s.gameOver) return;

        const current = s.players[s.currentPlayerIndex];
        if (!current || current.id === humanPlayerId || current.eliminated) return;

        // Opening phase for bot
        if (s.turnPhase === 'opening') {
          const openEvents = processOpening(s);
          addEvents(openEvents);
        }

        // Bot choosing action
        if (s.turnPhase === 'action_choice' && current.isBot) {
          const action = computeBotAction(s, current.id, difficultyRef.current);
          const actionEvents = applyAction(s, action, current.id);
          addEvents(actionEvents);

          // If bot attacked, it created a pending duel
          if (action.type === 'attack' && s.pendingDuel) {
            const defender = s.players.find((p) => p.id === s.pendingDuel!.defenderId);
            if (defender?.isBot) {
              // Bot vs bot: auto-defend
              const defenseAction = computeBotAction(s, defender.id, difficultyRef.current);
              const defEvents = applyAction(s, defenseAction, defender.id);
              addEvents(defEvents);
            } else if (defender?.id === humanPlayerId) {
              // Bot attacks human: human needs to defend
              setState({ ...s });
              updateView(s);
              return; // Wait for human defense
            }
          }

          setState({ ...s });
          updateView(s);

          // Continue to next bot if needed
          if (!s.gameOver && s.players[s.currentPlayerIndex]?.isBot) {
            setTimeout(() => runBot(), 800);
          }
          return;
        }

        // Bot defending (duel_response)
        if (s.turnPhase === 'duel_response' && current.isBot) {
          // This case is handled inline above
        }
      };

      setTimeout(() => runBot(), 600);
    },
    [addEvents, updateView],
  );

  const startGame = useCallback(
    (config: GameConfig & { difficulty: BotDifficulty }) => {
      difficultyRef.current = config.difficulty;
      const newState = createGame(config);
      setState(newState);
      setEvents([]);
      setDuelResult(null);
      setDuelPhase('none');

      // Process opening for first player
      const openEvents = processOpening(newState);
      addEvents(openEvents);
      setState({ ...newState });
      updateView(newState);

      // If first player is bot, process
      if (newState.players[newState.currentPlayerIndex]?.isBot) {
        processBotTurns(newState);
      }
    },
    [addEvents, updateView, processBotTurns],
  );

  const playAttack = useCallback(
    (cardIndex: number, declaredUniverse: Universe, targetId: string) => {
      if (!state) return;
      const actionEvents = applyAction(
        state,
        { type: 'attack', cardIndex, declaredUniverse, targetId },
        humanPlayerId,
      );
      addEvents(actionEvents);
      setDuelPhase('declared');

      // Bot defender auto-responds
      if (state.pendingDuel) {
        const defender = state.players.find((p) => p.id === state.pendingDuel!.defenderId);
        if (defender?.isBot) {
          setTimeout(() => {
            const defAction = computeBotAction(state, defender.id, difficultyRef.current);
            const defEvents = applyAction(state, defAction, defender.id);
            addEvents(defEvents);
            setDuelPhase('revealed');

            // Find the duel result from the log
            setState({ ...state });
            updateView(state);

            // Process next turns after delay
            setTimeout(() => {
              setDuelPhase('none');
              if (!state.gameOver) {
                // Process opening for next player
                if (state.turnPhase === 'opening') {
                  const openEvents = processOpening(state);
                  addEvents(openEvents);
                }
                setState({ ...state });
                updateView(state);
                if (state.players[state.currentPlayerIndex]?.isBot) {
                  processBotTurns(state);
                }
              }
            }, 2000);
          }, 800);
        }
      }

      setState({ ...state });
      updateView(state);
    },
    [state, addEvents, updateView, processBotTurns],
  );

  const playDefend = useCallback(
    (cardIndex: number) => {
      if (!state) return;
      const defEvents = applyAction(state, { type: 'defend', cardIndex }, humanPlayerId);
      addEvents(defEvents);
      setDuelPhase('revealed');

      setState({ ...state });
      updateView(state);

      // After duel reveal, continue game
      setTimeout(() => {
        setDuelPhase('none');
        if (!state.gameOver) {
          if (state.turnPhase === 'opening') {
            const openEvents = processOpening(state);
            addEvents(openEvents);
          }
          setState({ ...state });
          updateView(state);
          if (state.players[state.currentPlayerIndex]?.isBot) {
            processBotTurns(state);
          }
        }
      }, 2000);
    },
    [state, addEvents, updateView, processBotTurns],
  );

  const playTrain = useCallback(
    (discardIndex: number) => {
      if (!state) return;
      const trainEvents = applyAction(state, { type: 'train', discardIndex }, humanPlayerId);
      addEvents(trainEvents);

      setState({ ...state });
      updateView(state);

      // Continue
      if (!state.gameOver) {
        if (state.turnPhase === 'opening') {
          const openEvents = processOpening(state);
          addEvents(openEvents);
        }
        setState({ ...state });
        updateView(state);
        if (state.players[state.currentPlayerIndex]?.isBot) {
          processBotTurns(state);
        }
      }
    },
    [state, addEvents, updateView, processBotTurns],
  );

  const playSpy = useCallback(
    (targetId: string) => {
      if (!state) return;
      const target = state.players.find((p) => p.id === targetId);
      if (target && target.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * target.hand.length);
        setSpiedCard(target.hand[randomIndex]);
      }

      const spyEvents = applyAction(state, { type: 'spy', targetId }, humanPlayerId);
      addEvents(spyEvents);

      setState({ ...state });
      updateView(state);

      // Continue after spy
      if (!state.gameOver) {
        if (state.turnPhase === 'opening') {
          const openEvents = processOpening(state);
          addEvents(openEvents);
        }
        setState({ ...state });
        updateView(state);
        if (state.players[state.currentPlayerIndex]?.isBot) {
          processBotTurns(state);
        }
      }
    },
    [state, addEvents, updateView, processBotTurns],
  );

  const claimVictory = useCallback(() => {
    if (!state) return;
    const claimEvents = applyAction(state, { type: 'claim_victory' }, humanPlayerId);
    addEvents(claimEvents);
    setState({ ...state });
    updateView(state);
  }, [state, addEvents, updateView]);

  const dismissDuel = useCallback(() => {
    setDuelPhase('none');
    setSpiedCard(null);
  }, []);

  const isMyTurn = view?.myPlayer.id === state?.players[state.currentPlayerIndex]?.id;
  const waitingForDefense =
    state?.turnPhase === 'duel_response' &&
    state?.pendingDuel?.defenderId === humanPlayerId;

  return {
    view,
    duelResult,
    duelPhase,
    events,
    isMyTurn: isMyTurn ?? false,
    waitingForDefense,
    startGame,
    playAttack,
    playDefend,
    playTrain,
    playSpy,
    claimVictory,
    dismissDuel,
    spiedCard,
  };
}
