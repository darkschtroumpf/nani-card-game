import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

type BotDifficulty = 'easy' | 'medium' | 'hard';

export default function LobbyScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: 'solo' | 'online' }>();
  const [playerName, setPlayerName] = useState('');
  const [botCount, setBotCount] = useState(3);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [roomCode, setRoomCode] = useState('');

  const startSoloGame = () => {
    const name = playerName.trim() || 'Joueur';
    router.push(
      `/game?mode=solo&playerName=${name}&botCount=${botCount}&difficulty=${difficulty}`,
    );
  };

  const joinOnlineGame = () => {
    // TODO: Supabase integration
    router.push(`/game?mode=online&roomCode=${roomCode}&playerName=${playerName.trim() || 'Joueur'}`);
  };

  const createOnlineGame = () => {
    // TODO: Supabase integration
    router.push(`/game?mode=online&host=true&playerName=${playerName.trim() || 'Joueur'}&botCount=${botCount}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {mode === 'solo' ? 'Partie Solo' : 'Partie en ligne'}
      </Text>

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

      {mode === 'solo' && (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre de bots : {botCount}</Text>
            <View style={styles.row}>
              {[2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.chip, botCount === n && styles.chipActive]}
                  onPress={() => setBotCount(n)}
                >
                  <Text style={[styles.chipText, botCount === n && styles.chipTextActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Difficulte</Text>
            <View style={styles.row}>
              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, difficulty === d && styles.chipActive]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>
                    {d === 'easy' ? 'Facile' : d === 'medium' ? 'Moyen' : 'Difficile'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startSoloGame}>
            <Text style={styles.startButtonText}>Lancer la partie</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === 'online' && (
        <>
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
              style={[styles.startButton, styles.buttonSecondary]}
              onPress={joinOnlineGame}
              disabled={roomCode.length < 4}
            >
              <Text style={styles.startButtonText}>Rejoindre</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.startButton} onPress={createOnlineGame}>
            <Text style={styles.startButtonText}>Creer une partie</Text>
          </TouchableOpacity>
        </>
      )}
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
    marginBottom: 30,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bgLight,
    color: colors.text,
    borderRadius: 8,
    padding: 14,
    fontSize: fonts.sizes.lg,
    borderWidth: 1,
    borderColor: colors.textDark,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.bgLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textDark,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.text,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    marginTop: 12,
  },
  startButtonText: {
    color: colors.text,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textDark,
  },
  separatorText: {
    color: colors.textDim,
    marginHorizontal: 12,
  },
});
