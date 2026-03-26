import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import ArchetypeSelector from '../components/ArchetypeSelector';
import type { Archetype } from '../../engine/src/dojo/types';
import { ensureAuth, createGameRoom, joinGameRoom } from '../services/supabase';
import { setNickname } from '../services/player';

export default function LobbyScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: 'solo' | 'online' }>();
  const [playerName, setPlayerName] = useState('');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [botCount, setBotCount] = useState(4);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const canStart = archetype !== null;

  const startSoloGame = () => {
    if (!archetype) return;
    const name = playerName.trim() || 'Joueur';
    router.push(
      `/game?mode=solo&playerName=${name}&botCount=${botCount}&archetype=${archetype}`,
    );
  };

  const createOnlineGame = async () => {
    if (!archetype) return;
    setLoading(true);
    try {
      await ensureAuth();
      const nickname = playerName.trim() || 'Joueur';
      await setNickname(nickname);
      const game = await createGameRoom(6, botCount, 'medium', nickname);
      router.push(`/room?gameId=${game.id}&code=${game.code}&isHost=true&botCount=${botCount}&archetype=${archetype}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const joinOnlineGame = async () => {
    if (roomCode.length < 4) return;
    setLoading(true);
    try {
      await ensureAuth();
      const nickname = playerName.trim() || 'Joueur';
      await setNickname(nickname);
      const game = await joinGameRoom(roomCode, nickname);
      router.push(`/room?gameId=${game.id}&code=${game.code}&isHost=false&archetype=${archetype ?? 'shonen_blitz'}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {mode === 'solo' ? 'Partie Solo' : 'Partie en ligne'}
        </Text>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Ton nom</Text>
          <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Joueur"
            placeholderTextColor={colors.textDark}
          />
        </View>

        {/* Archetype selection */}
        <ArchetypeSelector selected={archetype} onSelect={setArchetype} />

        {/* Bot count (solo) */}
        {mode === 'solo' && (
          <View style={styles.field}>
            <Text style={styles.label}>Nombre de bots : {botCount}</Text>
            <View style={styles.row}>
              {[2, 3, 4].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.chip, botCount === n && styles.chipActive]}
                  onPress={() => setBotCount(n)}
                >
                  <Text style={[styles.chipText, botCount === n && styles.chipTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Start button */}
        {mode === 'solo' && (
          <TouchableOpacity
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
            onPress={startSoloGame}
            disabled={!canStart}
          >
            <Text style={styles.startBtnText}>Lancer la partie</Text>
          </TouchableOpacity>
        )}

        {mode === 'online' && (
          <>
            <TouchableOpacity
              style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
              onPress={createOnlineGame}
              disabled={!canStart || loading}
            >
              {loading ? <ActivityIndicator color={colors.text} /> :
                <Text style={styles.startBtnText}>Creer une partie</Text>}
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Rejoindre une partie</Text>
              <TextInput
                style={styles.input}
                value={roomCode}
                onChangeText={setRoomCode}
                placeholder="Code de la salle"
                placeholderTextColor={colors.textDark}
                autoCapitalize="characters"
                maxLength={6}
              />
              <TouchableOpacity
                style={[styles.startBtn, styles.joinBtn]}
                onPress={joinOnlineGame}
                disabled={roomCode.length < 4 || loading}
              >
                <Text style={styles.startBtnText}>Rejoindre</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: fonts.sizes.xxl, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { color: colors.textDim, fontSize: fonts.sizes.md, marginBottom: 8 },
  input: { backgroundColor: colors.bgLight, color: colors.text, borderRadius: 8, padding: 14, fontSize: fonts.sizes.lg, borderWidth: 1, borderColor: colors.textDark },
  row: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.bgLight, alignItems: 'center', borderWidth: 1, borderColor: colors.textDark },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textDim, fontSize: fonts.sizes.md, fontWeight: '600' },
  chipTextActive: { color: colors.text },
  startBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: 'bold' },
  joinBtn: { backgroundColor: colors.secondary, marginTop: 12 },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.textDark },
  separatorText: { color: colors.textDim, marginHorizontal: 12 },
});
