import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>NANI?!</Text>
        <Text style={styles.subtitle}>Le Grand Clash des Univers</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/lobby?mode=solo')}
        >
          <Text style={styles.buttonText}>Solo vs Bots</Text>
          <Text style={styles.buttonDesc}>Affronte des IA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOnline]}
          onPress={() => router.push('/lobby?mode=online')}
        >
          <Text style={styles.buttonText}>En ligne</Text>
          <Text style={styles.buttonDesc}>Joue avec des amis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/rules')}
        >
          <Text style={styles.buttonText}>Regles</Text>
          <Text style={styles.buttonDesc}>Comment jouer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: fonts.sizes.lg,
    color: colors.textDim,
    marginTop: 8,
  },
  menu: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonOnline: {
    backgroundColor: colors.secondary,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  buttonText: {
    color: colors.text,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  buttonDesc: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    marginTop: 4,
  },
  version: {
    position: 'absolute',
    bottom: 20,
    color: colors.textDark,
    fontSize: fonts.sizes.xs,
  },
});
