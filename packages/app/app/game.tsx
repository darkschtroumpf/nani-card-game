import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import AnimatedCard from '../components/AnimatedCard';
import OpponentCard from '../components/OpponentCard';
import DuelSteps from '../components/DuelSteps';
import Tutorial, { TOTAL_TUTORIAL_STEPS } from '../components/Tutorial';
import { tapFeedback, playCardFeedback, impactFeedback, warningFeedback } from '../services/feedback';
import { recordGameEnd } from '../services/stats';
import DominanceChart from '../components/DominanceChart';
import UniversePicker from '../components/UniversePicker';
import GameLog from '../components/GameLog';
import IdentityReveal from '../components/IdentityReveal';
import type { Universe } from '../../engine/src/types';
import type { BotDifficulty } from '../../engine/src/ai/bot';
import { useGameController } from '../hooks/useGameController';
import { useOnlineHostController } from '../hooks/useOnlineHostController';
import { useOnlineGuestController } from '../hooks/useOnlineGuestController';
import type { GameController } from '../hooks/useGameController';

// --- Mode-specific wrappers (each calls exactly one hook) ---

function SoloGame({ params, children }: { params: any; children: (ctrl: GameController) => React.ReactNode }) {
  const ctrl = useGameController();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const botCount = parseInt(params.botCount ?? '3', 10);
    const playerCount = botCount + 1;
    const botNames = ['Goku-bot', 'Sailor-bot', 'Eva-bot', 'Kirito-bot', 'Light-bot'];

    ctrl.startGame({
      playerCount,
      botCount,
      playerNames: [params.playerName ?? 'Joueur', ...botNames.slice(0, botCount)],
      difficulty: (params.difficulty as BotDifficulty) ?? 'medium',
    });
  }, []);

  return <>{children(ctrl)}</>;
}

function OnlineHostGame({ params, children }: { params: any; children: (ctrl: GameController) => React.ReactNode }) {
  const ctrl = useOnlineHostController({
    gameId: params.gameId ?? '',
    botCount: parseInt(params.botCount ?? '0', 10),
    difficulty: (params.difficulty as BotDifficulty) ?? 'medium',
  });
  return <>{children(ctrl)}</>;
}

function OnlineGuestGame({ params, children }: { params: any; children: (ctrl: GameController) => React.ReactNode }) {
  const ctrl = useOnlineGuestController({
    gameId: params.gameId ?? '',
  });
  return <>{children(ctrl)}</>;
}

// --- Main screen ---

export default function GameScreen() {
  const params = useLocalSearchParams<{
    mode: string;
    playerName: string;
    botCount: string;
    difficulty: string;
    gameId: string;
    isHost: string;
  }>();

  const isOnline = params.mode === 'online';
  const isHost = params.isHost === 'true';

  const Wrapper = isOnline
    ? (isHost ? OnlineHostGame : OnlineGuestGame)
    : SoloGame;

  return (
    <Wrapper params={params}>
      {(ctrl) => <GameUI ctrl={ctrl} isOnline={isOnline} />}
    </Wrapper>
  );
}

type ActionMode =
  | 'idle'
  | 'attack_pick_card'
  | 'attack_pick_universe'
  | 'attack_pick_target'
  | 'train_pick'
  | 'spy_pick';

function GameUI({ ctrl, isOnline }: { ctrl: GameController; isOnline: boolean }) {
  const router = useRouter();
  const [actionMode, setActionMode] = useState<ActionMode>('idle');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!isOnline);

  const { view } = ctrl;

  // Record stats on game over — MUST be before any conditional return
  useEffect(() => {
    if (view?.gameOver && view.winner) {
      const won = view.winner === view.myPlayer.id;
      recordGameEnd(won, view.myPlayer.identity.type);
    }
  }, [view?.gameOver]);

  // Loading
  if (!view) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>
          {isOnline ? 'Connexion...' : 'Chargement...'}
        </Text>
      </SafeAreaView>
    );
  }

  // Identity reveal overlay
  if (ctrl.showIdentity) {
    const rivalTarget = view.myPlayer.identity.type === 'rival'
      ? view.otherPlayers[view.otherPlayers.length - 1]?.name
      : undefined;
    const mentorTarget = view.myPlayer.identity.type === 'mentor'
      ? view.otherPlayers[0]?.name
      : undefined;

    return (
      <SafeAreaView style={styles.container}>
        <IdentityReveal
          identityType={view.myPlayer.identity.type}
          targetPlayerName={rivalTarget}
          protectedPlayerName={mentorTarget}
          onContinue={ctrl.dismissIdentity}
        />
      </SafeAreaView>
    );
  }

  // Game over
  if (view.gameOver) {
    const winnerIsMe = view.winner === view.myPlayer.id;
    const winnerName = winnerIsMe
      ? view.myPlayer.name
      : view.otherPlayers.find(p => p.id === view.winner)?.name ?? '???';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameOverBox}>
          <Text style={styles.gameOverEmoji}>{winnerIsMe ? '🏆' : '💀'}</Text>
          <Text style={styles.gameOverTitle}>
            {winnerIsMe ? 'VICTOIRE !' : 'DEFAITE'}
          </Text>
          <Text style={styles.gameOverWinner}>{winnerName} gagne !</Text>
          <Text style={styles.gameOverIdentity}>
            Ton identite : {view.myPlayer.identity.type}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/')}>
            <Text style={styles.primaryBtnText}>Retour au menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Spied card overlay
  if (ctrl.spiedCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.spyOverlay}>
          <Text style={styles.spyTitle}>Carte espionnee :</Text>
          <AnimatedCard card={ctrl.spiedCard} flipIn delay={300} />
          <TouchableOpacity style={styles.primaryBtn} onPress={ctrl.dismissSpy}>
            <Text style={styles.primaryBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Card press handler
  const onCardPress = (index: number) => {
    tapFeedback();
    if (actionMode === 'attack_pick_card') {
      setSelectedCardIndex(index);
      setActionMode('attack_pick_universe');
    } else if (actionMode === 'train_pick') {
      playCardFeedback();
      ctrl.playTrain(index);
      setActionMode('idle');
    } else if (ctrl.isDefending) {
      playCardFeedback();
      ctrl.playDefend(index);
    }
  };

  const onUniverseSelect = (u: Universe) => {
    tapFeedback();
    setSelectedUniverse(u);
    setActionMode('attack_pick_target');
  };

  const onTargetPress = (targetId: string) => {
    if (actionMode === 'attack_pick_target' && selectedCardIndex !== null && selectedUniverse) {
      impactFeedback();
      ctrl.playAttack(selectedCardIndex, selectedUniverse, targetId);
      setActionMode('idle');
      setSelectedCardIndex(null);
      setSelectedUniverse(null);
    } else if (actionMode === 'spy_pick') {
      tapFeedback();
      ctrl.playSpy(targetId);
      setActionMode('idle');
    }
  };

  const cancelAction = () => {
    setActionMode('idle');
    setSelectedCardIndex(null);
    setSelectedUniverse(null);
  };

  // Status message
  const getStatusMessage = (): string => {
    if (ctrl.duelState) {
      switch (ctrl.duelState.step) {
        case 'defending_intro': return 'Tu es attaque ! Choisis une carte.';
        default: return '';
      }
    }
    if (ctrl.isDefending) return 'Tu es attaque ! Choisis une carte.';
    if (!ctrl.isMyTurn) return isOnline ? 'En attente des autres joueurs...' : 'En attente...';
    switch (actionMode) {
      case 'idle': return 'Ton tour ! Que veux-tu faire ?';
      case 'attack_pick_card': return 'Choisis une carte a jouer.';
      case 'attack_pick_universe': return 'Declare un univers (tu peux bluffer !)';
      case 'attack_pick_target': return 'Choisis ta cible.';
      case 'train_pick': return 'Choisis une carte a defausser.';
      case 'spy_pick': return 'Choisis un joueur a espionner.';
    }
  };

  const showTargetSelection = actionMode === 'attack_pick_target' || actionMode === 'spy_pick';
  const isInDuel = ctrl.duelState !== null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Turn bar */}
      <View style={styles.turnBar}>
        <Text style={styles.turnText}>
          Tour {view.turnNumber} — {ctrl.isMyTurn ? 'Ton tour !' : 'En attente...'}
        </Text>
        <Text style={styles.deckText}>Pioche: {view.deckCount}</Text>
      </View>

      {/* Opponents */}
      <ScrollView
        horizontal
        style={styles.opponentsScroll}
        contentContainerStyle={styles.opponentsContent}
        showsHorizontalScrollIndicator={false}
      >
        {view.otherPlayers.map((p) => (
          <OpponentCard
            key={p.id}
            name={p.name}
            plotArmor={p.plotArmor}
            cardCount={p.cardCount}
            shields={p.shields}
            isCurrentTurn={view.currentPlayerIndex === parseInt(p.id.split('-')[1]) || false}
            eliminated={p.eliminated}
            identityRevealed={p.identityRevealed}
            identityType={p.identityType}
            selectable={showTargetSelection && !p.eliminated}
            onPress={() => onTargetPress(p.id)}
          />
        ))}
      </ScrollView>

      {/* Main area */}
      <View style={styles.mainArea}>
        {/* Duel step-by-step display */}
        {isInDuel && ctrl.duelState && ctrl.duelState.step !== 'defending_intro' && (
          <DuelSteps
            step={ctrl.duelState.step}
            attackerName={ctrl.duelState.attackerName}
            defenderName={ctrl.duelState.defenderName}
            isPlayerAttacking={ctrl.duelState.isPlayerAttacking}
            playerCard={ctrl.duelState.playerCard}
            opponentCard={ctrl.duelState.opponentCard}
            declaredUniverse={ctrl.duelState.declaredUniverse}
            botReaction={ctrl.duelState.botReaction}
            botReactionType={ctrl.duelState.botReactionType}
            result={ctrl.duelState.result}
            onContinue={ctrl.advanceDuel}
            continueLabel={ctrl.duelState.step === 'result' ? 'OK' : 'Continuer'}
          />
        )}

        {/* Arc notification */}
        {!isInDuel && view.currentArc && (
          <View style={styles.arcBanner}>
            <Text style={styles.arcName}>{view.currentArc.name}</Text>
            <Text style={styles.arcDesc}>{view.currentArc.description}</Text>
          </View>
        )}

        {/* Status message */}
        {!isInDuel && (
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
        )}

        {/* Universe picker */}
        {actionMode === 'attack_pick_universe' && (
          <UniversePicker
            selected={selectedUniverse}
            onSelect={onUniverseSelect}
            label="Declare ton univers"
          />
        )}

        {/* Action buttons */}
        {ctrl.isMyTurn && actionMode === 'idle' && !isInDuel && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => setActionMode('attack_pick_card')}
            >
              <Text style={styles.actionBtnLabel}>Attaquer</Text>
              <Text style={styles.actionBtnDesc}>Choisis une carte et une cible</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtnHalf, { backgroundColor: colors.secondary }]}
                onPress={() => setActionMode('train_pick')}
              >
                <Text style={styles.actionBtnLabel}>S'entrainer</Text>
                <Text style={styles.actionBtnDesc}>-1 carte, +2</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtnHalf, { backgroundColor: colors.seinen }]}
                onPress={() => setActionMode('spy_pick')}
              >
                <Text style={styles.actionBtnLabel}>Espionner</Text>
                <Text style={styles.actionBtnDesc}>Voir 1 carte</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Cancel */}
        {actionMode !== 'idle' && !isInDuel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelAction}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        )}

        {/* Game log */}
        {!isInDuel && <GameLog entries={view.log} />}
      </View>

      {/* Identity bar */}
      <View style={styles.identityBar}>
        <Text style={styles.identityText}>
          {view.myPlayer.identity.type} | PA: {view.myPlayer.plotArmor}
          {view.myPlayer.shields > 0 ? ` | B: ${view.myPlayer.shields}` : ''}
        </Text>
        <TouchableOpacity onPress={() => setShowChart(true)}>
          <Text style={styles.helpButton}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Player hand */}
      <ScrollView
        horizontal
        style={styles.handScroll}
        contentContainerStyle={styles.handContent}
        showsHorizontalScrollIndicator={false}
      >
        {view.myPlayer.hand.map((card, i) => (
          <AnimatedCard
            key={card.id}
            card={card}
            selected={selectedCardIndex === i}
            onPress={() => onCardPress(i)}
          />
        ))}
      </ScrollView>

      {/* Defending: show instruction */}
      {(ctrl.isDefending || ctrl.duelState?.step === 'defending_intro') && (
        <View style={styles.defendBanner}>
          <Text style={styles.defendText}>
            Choisis une carte pour te defendre !
          </Text>
        </View>
      )}

      {/* Tutorial overlay */}
      {showTutorial && tutorialStep < TOTAL_TUTORIAL_STEPS && (
        <Tutorial
          step={tutorialStep}
          onNext={() => {
            if (tutorialStep >= TOTAL_TUTORIAL_STEPS - 1) {
              setShowTutorial(false);
            } else {
              setTutorialStep(tutorialStep + 1);
            }
          }}
          onSkip={() => setShowTutorial(false)}
        />
      )}

      {/* Dominance chart modal */}
      <Modal visible={showChart} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowChart(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <DominanceChart />
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowChart(false)}>
              <Text style={styles.primaryBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingText: {
    color: colors.text,
    fontSize: fonts.sizes.xl,
    textAlign: 'center',
    marginTop: 100,
  },

  // Turn bar
  turnBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgLight,
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  turnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  deckText: {
    color: colors.textDim,
    fontSize: 12,
  },

  // Opponents
  opponentsScroll: {
    maxHeight: 100,
    marginTop: 8,
  },
  opponentsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },

  // Main area
  mainArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  arcBanner: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  arcName: {
    color: colors.accent,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  arcDesc: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    marginTop: 2,
  },
  statusText: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 4,
  },

  // Action buttons
  actionButtons: {
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnHalf: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionBtnDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.danger,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },

  // Identity bar
  identityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  identityText: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  helpButton: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
    backgroundColor: colors.bgLight,
    borderRadius: 15,
    overflow: 'hidden',
  },

  // Hand
  handScroll: {
    maxHeight: 110,
    marginBottom: 8,
  },
  handContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },

  // Defend banner
  defendBanner: {
    backgroundColor: colors.danger,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  defendText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },

  // Spy overlay
  spyOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  spyTitle: {
    color: colors.text,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },

  // Game over
  gameOverBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  gameOverEmoji: {
    fontSize: 64,
  },
  gameOverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent,
  },
  gameOverWinner: {
    fontSize: fonts.sizes.xl,
    color: colors.text,
  },
  gameOverIdentity: {
    fontSize: fonts.sizes.md,
    color: colors.textDim,
  },

  // Shared
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 8,
  },
  primaryBtnText: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 350,
    gap: 12,
    alignItems: 'center',
  },
});
