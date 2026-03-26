import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import {
  subscribeToGamePlayers,
  subscribeToGame,
  setGameStatus,
  getPlayerId,
} from '../services/supabase';

interface PlayerInfo {
  player_id: string;
  nickname: string | null;
  seat_index: number;
  connected: boolean;
}

export default function RoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    gameId: string;
    code: string;
    isHost: string;
    botCount: string;
    difficulty: string;
  }>();

  const gameId = params.gameId!;
  const roomCode = params.code!;
  const isHost = params.isHost === 'true';
  const botCount = parseInt(params.botCount ?? '0', 10);
  const difficulty = params.difficulty ?? 'medium';

  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [starting, setStarting] = useState(false);

  // Subscribe to player list
  useEffect(() => {
    const channel = subscribeToGamePlayers(gameId, (data) => {
      setPlayers(data);
    });

    return () => { channel.unsubscribe(); };
  }, [gameId]);

  // Subscribe to game status changes (for guests)
  useEffect(() => {
    if (isHost) return;

    const channel = subscribeToGame(gameId, (game) => {
      if (game.status === 'playing') {
        router.replace(
          `/game?mode=online&gameId=${gameId}&isHost=false&difficulty=${difficulty}`,
        );
      }
    });

    return () => { channel.unsubscribe(); };
  }, [gameId, isHost]);

  const humanCount = players.length;
  const canStart = isHost && humanCount >= 2 && !starting;

  const startGame = useCallback(async () => {
    setStarting(true);
    try {
      await setGameStatus(gameId, 'playing');
      router.replace(
        `/game?mode=online&gameId=${gameId}&isHost=true&botCount=${botCount}&difficulty=${difficulty}`,
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
      setStarting(false);
    }
  }, [gameId, botCount, difficulty]);

  const shareCode = async () => {
    try {
      await Share.share({ message: `Rejoins ma partie NANI?! Code: ${roomCode}` });
    } catch {}
  };

  const myId = getPlayerId();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Salle d'attente</Text>

      {/* Room code */}
      <TouchableOpacity style={styles.codeBox} onPress={shareCode}>
        <Text style={styles.codeLabel}>Code de la salle</Text>
        <Text style={styles.codeText}>{roomCode}</Text>
        <Text style={styles.codeTap}>Appuie pour partager</Text>
      </TouchableOpacity>

      {/* Player list */}
      <View style={styles.playerSection}>
        <Text style={styles.sectionTitle}>
          Joueurs ({humanCount}{botCount > 0 ? ` + ${botCount} bots` : ''})
        </Text>
        {players.map((p) => (
          <View key={p.player_id} style={styles.playerRow}>
            <Text style={styles.playerEmoji}>
              {p.player_id === myId ? '👤' : '🎮'}
            </Text>
            <Text style={styles.playerName}>
              {p.nickname || `Joueur ${p.seat_index + 1}`}
              {p.player_id === myId ? ' (toi)' : ''}
            </Text>
            {p.seat_index === 0 && (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>HOST</Text>
              </View>
            )}
          </View>
        ))}
        {botCount > 0 && Array.from({ length: botCount }).map((_, i) => (
          <View key={`bot-${i}`} style={styles.playerRow}>
            <Text style={styles.playerEmoji}>🤖</Text>
            <Text style={[styles.playerName, { color: colors.textDim }]}>
              Bot {i + 1} ({difficulty})
            </Text>
          </View>
        ))}
      </View>

      {/* Action */}
      <View style={styles.bottom}>
        {isHost ? (
          <>
            {humanCount < 2 && (
              <Text style={styles.waitingText}>
                En attente d'au moins 1 autre joueur...
              </Text>
            )}
            <TouchableOpacity
              style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
              onPress={startGame}
              disabled={!canStart}
            >
              <Text style={styles.startBtnText}>
                {starting ? 'Lancement...' : 'Lancer la partie'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.waitingText}>
            En attente du host...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  codeBox: {
    backgroundColor: colors.bgLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: 24,
  },
  codeLabel: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    marginBottom: 4,
  },
  codeText: {
    color: colors.accent,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  codeTap: {
    color: colors.textDim,
    fontSize: fonts.sizes.xs,
    marginTop: 6,
  },
  playerSection: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgLight,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  playerEmoji: {
    fontSize: 20,
  },
  playerName: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
    flex: 1,
  },
  hostBadge: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hostBadgeText: {
    color: colors.bg,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  bottom: {
    gap: 12,
    paddingTop: 16,
  },
  waitingText: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtnDisabled: {
    opacity: 0.5,
  },
  startBtnText: {
    color: colors.text,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
});
