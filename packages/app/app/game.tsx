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
import Card from '../components/Card';
import PlayerHUD from '../components/PlayerHUD';
import DuelArena from '../components/DuelArena';
import DominanceChart from '../components/DominanceChart';
import UniversePicker from '../components/UniversePicker';
import GameLog from '../components/GameLog';
import { useGameController } from '../hooks/useGameController';
import type { Universe, Card as CardType } from '../../engine/src/types';
import type { BotDifficulty } from '../../engine/src/ai/bot';

type ActionMode = 'idle' | 'attack_select_card' | 'attack_select_universe' | 'attack_select_target' | 'train_select' | 'spy_select' | 'defending';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode: string;
    playerName: string;
    botCount: string;
    difficulty: string;
  }>();

  const controller = useGameController();
  const [actionMode, setActionMode] = useState<ActionMode>('idle');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [showChart, setShowChart] = useState(false);

  // Start game on mount
  useEffect(() => {
    const botCount = parseInt(params.botCount ?? '3', 10);
    const playerCount = botCount + 1;
    const botNames = ['Goku-bot', 'Sailor-bot', 'Eva-bot', 'Kirito-bot', 'Light-bot'];

    controller.startGame({
      playerCount,
      botCount,
      playerNames: [params.playerName ?? 'Joueur', ...botNames.slice(0, botCount)],
      difficulty: (params.difficulty as BotDifficulty) ?? 'medium',
    });
  }, []);

  const { view } = controller;
  if (!view) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  // Game over
  if (view.gameOver) {
    const winnerName =
      view.winner === view.myPlayer.id
        ? view.myPlayer.name
        : view.otherPlayers.find((p) => p.id === view.winner)?.name ?? 'Inconnu';
    const isWinner = view.winner === view.myPlayer.id;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>
            {isWinner ? 'VICTOIRE !' : 'DEFAITE'}
          </Text>
          <Text style={styles.gameOverName}>{winnerName} gagne !</Text>
          <Text style={styles.gameOverIdentity}>
            Ton identite : {view.myPlayer.identity.type}
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.actionButtonText}>Retour au menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPlayerId = view.myPlayer.id === 'player-0'
    ? `player-${view.currentPlayerIndex}`
    : undefined;
  const isMyTurn = controller.isMyTurn;
  const isDefending = controller.waitingForDefense;

  // Handle card selection for attack
  const onCardPress = (index: number) => {
    if (actionMode === 'attack_select_card') {
      setSelectedCardIndex(index);
      setActionMode('attack_select_universe');
    } else if (actionMode === 'train_select') {
      controller.playTrain(index);
      setActionMode('idle');
    } else if (actionMode === 'defending' || isDefending) {
      controller.playDefend(index);
      setActionMode('idle');
    }
  };

  const onUniverseSelect = (universe: Universe) => {
    setSelectedUniverse(universe);
    setActionMode('attack_select_target');
  };

  const onTargetSelect = (targetId: string) => {
    if (selectedCardIndex !== null && selectedUniverse) {
      controller.playAttack(selectedCardIndex, selectedUniverse, targetId);
      setActionMode('idle');
      setSelectedCardIndex(null);
      setSelectedUniverse(null);
    }
  };

  const onSpyTarget = (targetId: string) => {
    controller.playSpy(targetId);
    setActionMode('idle');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top: Other players */}
      <ScrollView horizontal style={styles.opponentsRow} showsHorizontalScrollIndicator={false}>
        {view.otherPlayers.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => {
              if (actionMode === 'attack_select_target') onTargetSelect(p.id);
              else if (actionMode === 'spy_select') onSpyTarget(p.id);
            }}
            disabled={
              p.eliminated ||
              (actionMode !== 'attack_select_target' && actionMode !== 'spy_select')
            }
          >
            <PlayerHUD
              name={p.name}
              plotArmor={p.plotArmor}
              shields={p.shields}
              cardCount={p.cardCount}
              isCurrentPlayer={view.currentPlayerIndex === parseInt(p.id.split('-')[1])}
              eliminated={p.eliminated}
              identityRevealed={p.identityRevealed}
              identityType={p.identityType}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Middle: Game area */}
      <View style={styles.middle}>
        {/* Arc notification */}
        {view.currentArc && (
          <View style={styles.arcBanner}>
            <Text style={styles.arcName}>{view.currentArc.name}</Text>
            <Text style={styles.arcDesc}>{view.currentArc.description}</Text>
          </View>
        )}

        {/* Duel display */}
        {controller.duelPhase !== 'none' && view.pendingDuel && (
          <DuelArena
            attackerName={
              view.pendingDuel.attackerId === view.myPlayer.id
                ? view.myPlayer.name
                : view.otherPlayers.find((p) => p.id === view.pendingDuel!.attackerId)?.name ?? '?'
            }
            defenderName={
              view.pendingDuel.defenderId === view.myPlayer.id
                ? view.myPlayer.name
                : view.otherPlayers.find((p) => p.id === view.pendingDuel!.defenderId)?.name ?? '?'
            }
            declaredUniverse={view.pendingDuel.declaredUniverse}
            result={controller.duelResult}
            phase={
              controller.duelPhase === 'declared'
                ? 'declared'
                : controller.duelPhase === 'responding'
                  ? 'responding'
                  : 'revealed'
            }
          />
        )}

        {/* Status message */}
        <Text style={styles.statusText}>
          {isDefending
            ? 'Tu es attaque ! Choisis une carte pour te defendre.'
            : isMyTurn && actionMode === 'idle'
              ? 'Ton tour ! Choisis une action.'
              : actionMode === 'attack_select_card'
                ? 'Choisis une carte a jouer.'
                : actionMode === 'attack_select_universe'
                  ? 'Declare un univers (bluff possible !)'
                  : actionMode === 'attack_select_target'
                    ? 'Choisis ta cible.'
                    : actionMode === 'train_select'
                      ? 'Choisis une carte a defausser.'
                      : actionMode === 'spy_select'
                        ? 'Choisis un joueur a espionner.'
                        : 'En attente...'}
        </Text>

        {/* Universe picker for attack declaration */}
        {actionMode === 'attack_select_universe' && (
          <UniversePicker
            selected={selectedUniverse}
            onSelect={onUniverseSelect}
            label="Declare ton univers"
          />
        )}

        {/* Spied card display */}
        {controller.spiedCard && (
          <View style={styles.spiedContainer}>
            <Text style={styles.spiedText}>Carte espionnee :</Text>
            <Card card={controller.spiedCard} />
            <TouchableOpacity onPress={controller.dismissDuel}>
              <Text style={styles.dismissText}>OK</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game log */}
        <GameLog entries={view.log} />
      </View>

      {/* Bottom: My hand + actions */}
      <View style={styles.bottom}>
        {/* Identity reminder */}
        <View style={styles.identityBar}>
          <Text style={styles.identityText}>
            {view.myPlayer.identity.type} | PA: {view.myPlayer.plotArmor}
            {view.myPlayer.shields > 0 ? ` | B: ${view.myPlayer.shields}` : ''}
          </Text>
          <TouchableOpacity onPress={() => setShowChart(!showChart)}>
            <Text style={styles.chartToggle}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Hand */}
        <ScrollView horizontal style={styles.handRow} contentContainerStyle={styles.handContent}>
          {view.myPlayer.hand.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              selected={selectedCardIndex === i}
              onPress={() => onCardPress(i)}
            />
          ))}
        </ScrollView>

        {/* Action buttons */}
        {(isMyTurn && actionMode === 'idle') && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setActionMode('attack_select_card')}
            >
              <Text style={styles.actionButtonText}>Attaquer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => setActionMode('train_select')}
            >
              <Text style={styles.actionButtonText}>S'entrainer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.seinen }]}
              onPress={() => setActionMode('spy_select')}
            >
              <Text style={styles.actionButtonText}>Espionner</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel button */}
        {actionMode !== 'idle' && !isDefending && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setActionMode('idle');
              setSelectedCardIndex(null);
              setSelectedUniverse(null);
            }}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dominance chart modal */}
      <Modal visible={showChart} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowChart(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <DominanceChart />
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
  opponentsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 80,
  },
  middle: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  arcBanner: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 10,
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
  },
  statusText: {
    color: colors.accent,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  spiedContainer: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgLight,
    padding: 16,
    borderRadius: 8,
  },
  spiedText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
  },
  dismissText: {
    color: colors.accent,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  bottom: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  identityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  identityText: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
  },
  chartToggle: {
    color: colors.accent,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 16,
    backgroundColor: colors.bgLight,
  },
  handRow: {
    maxHeight: 110,
  },
  handContent: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.danger,
    fontSize: fonts.sizes.md,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  gameOverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent,
  },
  gameOverName: {
    fontSize: fonts.sizes.xl,
    color: colors.text,
  },
  gameOverIdentity: {
    fontSize: fonts.sizes.md,
    color: colors.textDim,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 350,
  },
});
