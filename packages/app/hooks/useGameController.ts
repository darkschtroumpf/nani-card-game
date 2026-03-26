import { useState, useCallback, useRef } from 'react';
import type {
  GameState,
  GameConfig,
  PlayerView,
  DuelResult,
  Universe,
  Card,
} from '../../engine/src/types';
import { createGame, processOpening, applyAction, getPlayerView } from '../../engine/src/game';
import { resolveDuel } from '../../engine/src/duel';
import { computeBotAction } from '../../engine/src/ai/bot';
import type { BotDifficulty } from '../../engine/src/ai/bot';
import { dominates } from '../../engine/src/constants';
import type { DuelStep } from '../components/DuelSteps';
import type { ReactionType } from '../components/BotReaction';
import { getBotReaction } from '../components/BotReaction';

export interface DuelState {
  step: DuelStep;
  attackerName: string;
  defenderName: string;
  isPlayerAttacking: boolean;
  playerCard?: Card;
  opponentCard?: Card;
  declaredUniverse?: Universe;
  botReaction?: string;
  botReactionType?: ReactionType;
  result?: DuelResult;
}

export interface GameController {
  view: PlayerView | null;
  duelState: DuelState | null;
  events: string[];
  isMyTurn: boolean;
  isDefending: boolean;
  showIdentity: boolean;
  spiedCard: Card | null;
  gameStarted: boolean;

  startGame: (config: GameConfig & { difficulty: BotDifficulty }) => void;
  dismissIdentity: () => void;
  playAttack: (cardIndex: number, declaredUniverse: Universe, targetId: string) => void;
  playDefend: (cardIndex: number) => void;
  playTrain: (discardIndex: number) => void;
  playSpy: (targetId: string) => void;
  claimVictory: () => void;
  advanceDuel: () => void;
  dismissSpy: () => void;
}

export function useGameController(): GameController {
  const [state, setState] = useState<GameState | null>(null);
  const [view, setView] = useState<PlayerView | null>(null);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [spiedCard, setSpiedCard] = useState<Card | null>(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const difficultyRef = useRef<BotDifficulty>('medium');
  const stateRef = useRef<GameState | null>(null);
  const duelStepsQueue = useRef<DuelStep[]>([]);
  const duelDataRef = useRef<Partial<DuelState>>({});
  const humanPlayerId = 'player-0';

  const syncView = useCallback((s: GameState) => {
    stateRef.current = s;
    setState({ ...s });
    setView(getPlayerView(s, humanPlayerId));
  }, []);

  const addEvents = useCallback((newEvents: string[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  // Process all bot turns until it's the human's turn or game is over
  const processBotTurns = useCallback((s: GameState) => {
    const runNext = () => {
      if (s.gameOver) { syncView(s); return; }

      const current = s.players[s.currentPlayerIndex];
      if (!current || !current.isBot || current.eliminated) {
        syncView(s);
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

        // If bot attacked and defender is human
        if (action.type === 'attack' && s.pendingDuel && s.pendingDuel.defenderId === humanPlayerId) {
          // Show duel with human as defender
          const attacker = s.players.find(p => p.id === s.pendingDuel!.attackerId)!;
          const declaredU = s.pendingDuel!.declaredUniverse;

          const reactionType: ReactionType = 'confident';
          duelDataRef.current = {
            attackerName: attacker.name,
            defenderName: 'Toi',
            isPlayerAttacking: false,
            declaredUniverse: declaredU,
            botReaction: getBotReaction(reactionType),
            botReactionType: reactionType,
          };
          duelStepsQueue.current = ['defending_intro'];
          setDuelState({
            step: 'defending_intro',
            ...duelDataRef.current,
          } as DuelState);
          syncView(s);
          return;
        }

        // Bot attacked another bot
        if (action.type === 'attack' && s.pendingDuel) {
          const defender = s.players.find(p => p.id === s.pendingDuel!.defenderId);
          if (defender?.isBot) {
            const defAction = computeBotAction(s, defender.id, difficultyRef.current);
            const defEv = applyAction(s, defAction, defender.id);
            addEvents(defEv);
          }
        }

        syncView(s);

        // Continue to next turn
        if (!s.gameOver) {
          setTimeout(() => {
            if (s.turnPhase === 'opening') {
              const ev = processOpening(s);
              addEvents(ev);
            }
            runNext();
          }, 400);
        }
        return;
      }

      syncView(s);
    };

    setTimeout(runNext, 300);
  }, [syncView, addEvents]);

  const startGame = useCallback((config: GameConfig & { difficulty: BotDifficulty }) => {
    difficultyRef.current = config.difficulty;
    const newState = createGame(config);

    // Set mentor's protected player if needed
    const humanPlayer = newState.players[0];
    if (humanPlayer.identity.type === 'mentor') {
      // Choose the first non-eliminated bot
      const target = newState.players.find(p => p.id !== humanPlayerId);
      if (target) humanPlayer.identity.protectedPlayerId = target.id;
    }

    stateRef.current = newState;
    setEvents([]);
    setDuelState(null);
    setSpiedCard(null);
    setShowIdentity(true);
    setGameStarted(true);

    // Process opening for first player
    const openEvents = processOpening(newState);
    addEvents(openEvents);
    syncView(newState);

    // Don't start bot turns yet — wait for identity dismiss
  }, [addEvents, syncView]);

  const dismissIdentity = useCallback(() => {
    setShowIdentity(false);
    const s = stateRef.current;
    if (s && s.players[s.currentPlayerIndex]?.isBot) {
      processBotTurns(s);
    }
  }, [processBotTurns]);

  const playAttack = useCallback((cardIndex: number, declaredUniverse: Universe, targetId: string) => {
    const s = stateRef.current;
    if (!s) return;

    const player = s.players.find(p => p.id === humanPlayerId)!;
    const playerCard = player.hand[cardIndex];
    const target = s.players.find(p => p.id === targetId)!;

    const ev = applyAction(s, { type: 'attack', cardIndex, declaredUniverse, targetId }, humanPlayerId);
    addEvents(ev);

    // Determine bot's defense reaction
    const isBluff = declaredUniverse !== playerCard.universe;
    const defAction = computeBotAction(s, target.id, difficultyRef.current);
    const defCard = target.hand[defAction.type === 'defend' ? defAction.cardIndex : 0];

    // Determine reaction type
    let reactionType: ReactionType;
    const botCounters = dominates(defCard.universe, declaredUniverse);
    if (botCounters && defCard.value >= 5) reactionType = 'confident';
    else if (botCounters) reactionType = 'doubt';
    else if (defCard.value <= 2) reactionType = 'scared';
    else reactionType = Math.random() > 0.5 ? 'believe' : 'doubt';

    // Set up duel steps
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

    setDuelState({
      step: 'your_card',
      ...duelDataRef.current,
    } as DuelState);

    // Pre-compute the duel result but don't apply yet
    // We'll apply when reaching 'reveal'
    const defEv = applyAction(s, defAction, target.id);
    addEvents(defEv);

    // Find the result from state log
    duelDataRef.current.opponentCard = defCard;

    syncView(s);
  }, [addEvents, syncView]);

  const advanceDuel = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;

    const queue = duelStepsQueue.current;

    if (queue.length > 0) {
      // We're going through pre-set steps
      queue.shift(); // remove current
    }

    const data = duelDataRef.current;
    const currentDuel = duelState;

    // Determine next step
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
      // Duel is over
      setDuelState(null);
      duelStepsQueue.current = [];
      duelDataRef.current = {};

      // Continue game
      if (!s.gameOver) {
        if (s.turnPhase === 'opening') {
          const ev = processOpening(s);
          addEvents(ev);
        }
        syncView(s);
        if (s.players[s.currentPlayerIndex]?.isBot) {
          processBotTurns(s);
        }
      } else {
        syncView(s);
      }
      return;
    }

    if (nextStep) {
      // Build result for reveal/explain/result steps
      let result = data.result;
      if ((nextStep === 'reveal' || nextStep === 'explain' || nextStep === 'result') && !result) {
        // Find from log - we already applied the duel, find the result
        // We need to reconstruct it from the cards
        if (data.playerCard && data.opponentCard) {
          const atkCard = data.isPlayerAttacking ? data.playerCard : data.opponentCard;
          const defCard = data.isPlayerAttacking ? data.opponentCard : data.playerCard;
          const atkId = data.isPlayerAttacking ? humanPlayerId : s.players.find(p => p.name === data.attackerName)?.id ?? '';
          const defId = data.isPlayerAttacking ? s.players.find(p => p.name === data.defenderName)?.id ?? '' : humanPlayerId;
          result = resolveDuel(atkCard, defCard, atkId, defId);
          duelDataRef.current.result = result;

          // Compute win/lose reaction
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
  }, [duelState, addEvents, syncView, processBotTurns]);

  const playDefend = useCallback((cardIndex: number) => {
    const s = stateRef.current;
    if (!s) return;

    const player = s.players.find(p => p.id === humanPlayerId)!;
    const defCard = player.hand[cardIndex];

    duelDataRef.current.playerCard = defCard;

    // Get attacker's card
    if (s.pendingDuel) {
      const attacker = s.players.find(p => p.id === s.pendingDuel!.attackerId)!;
      const atkCard = attacker.hand[s.pendingDuel!.attackerCardIndex];
      duelDataRef.current.opponentCard = atkCard;
    }

    const ev = applyAction(s, { type: 'defend', cardIndex }, humanPlayerId);
    addEvents(ev);

    // Set up reveal steps
    duelStepsQueue.current = ['reveal'];
    setDuelState({
      step: 'reveal',
      ...duelDataRef.current,
    } as DuelState);

    syncView(s);
  }, [addEvents, syncView]);

  const playTrain = useCallback((discardIndex: number) => {
    const s = stateRef.current;
    if (!s) return;

    const ev = applyAction(s, { type: 'train', discardIndex }, humanPlayerId);
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
      }
    }
  }, [addEvents, syncView, processBotTurns]);

  const playSpy = useCallback((targetId: string) => {
    const s = stateRef.current;
    if (!s) return;

    const target = s.players.find(p => p.id === targetId);
    if (target && target.hand.length > 0) {
      const idx = Math.floor(Math.random() * target.hand.length);
      setSpiedCard(target.hand[idx]);
    }

    const ev = applyAction(s, { type: 'spy', targetId }, humanPlayerId);
    addEvents(ev);
    syncView(s);
  }, [addEvents, syncView]);

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
      }
    }
  }, [addEvents, syncView, processBotTurns]);

  const claimVictory = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const ev = applyAction(s, { type: 'claim_victory' }, humanPlayerId);
    addEvents(ev);
    syncView(s);
  }, [addEvents, syncView]);

  const isMyTurn = view !== null && !view.gameOver &&
    view.myPlayer.id === stateRef.current?.players[stateRef.current.currentPlayerIndex]?.id;
  const isDefending = stateRef.current?.turnPhase === 'duel_response' &&
    stateRef.current?.pendingDuel?.defenderId === humanPlayerId;

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
