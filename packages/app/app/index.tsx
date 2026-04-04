import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { warded, wardedFonts } from '../theme-warded';
import { useAudio } from '../hooks/useAudio';

const BG_NIGHT = require('../assets/images/bg_night.png');

export default function HomeScreen() {
  const router = useRouter();
  const audio = useAudio();
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => { audio.playMusic('menu'); }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <ImageBackground source={BG_NIGHT} style={styles.container} imageStyle={{ opacity: 0.25 }}>
      <View style={styles.titleContainer}>
        <Animated.Text style={[styles.title, { opacity: glowAnim }]}>THE DEMON'S</Animated.Text>
        <Text style={styles.subtitle}>CYCLE</Text>
        <Text style={styles.tagline}>La nuit tombe. Les wards sont ton seul espoir.</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/warded')}
        >
          <Text style={styles.buttonText}>⚡ Jouer</Text>
          <Text style={styles.buttonDesc}>Mode rapide — choisis ton hero</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: warded.wardFire }]}
          onPress={() => router.replace('/campaign')}
        >
          <Text style={styles.buttonText}>📖 Campagne</Text>
          <Text style={styles.buttonDesc}>12 chapitres — L'histoire de The Warded Man</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: '#9b30ff' }]}
          onPress={() => router.replace('/warded?mode=endless')}
        >
          <Text style={styles.buttonText}>♾ Survie</Text>
          <Text style={styles.buttonDesc}>Mode infini — Combien de nuits survivras-tu ?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: warded.textDim }]}
          onPress={() => router.push('/codex')}
        >
          <Text style={styles.buttonText}>📚 Codex</Text>
          <Text style={styles.buttonDesc}>Runes, Demons, Combos — tout savoir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: warded.textDark }]}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.buttonText}>⚙ Paramètres</Text>
          <Text style={styles.buttonDesc}>Réinitialiser, crédits</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>v3.0.0 — The Demon's Cycle</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: warded.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  titleContainer: { alignItems: 'center', marginBottom: 60 },
  title: { fontSize: 36, fontWeight: 'bold', color: warded.accent, letterSpacing: 6 },
  subtitle: { fontSize: 48, fontWeight: 'bold', color: warded.wardFire, letterSpacing: 8, marginTop: -4 },
  tagline: { fontSize: wardedFonts.md, color: warded.textDim, marginTop: 12 },
  menu: { width: '100%', maxWidth: 320, gap: 16 },
  button: { backgroundColor: warded.bgCard, paddingVertical: 18, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: warded.accent },
  buttonSecondary: { borderColor: warded.textDark },
  buttonText: { color: warded.text, fontSize: wardedFonts.xl, fontWeight: 'bold' },
  buttonDesc: { color: warded.textDim, fontSize: wardedFonts.sm, marginTop: 4 },
  buttonDisabled: { borderColor: warded.textDark, opacity: 0.4 },
  buttonTextDisabled: { color: warded.textDark, fontSize: wardedFonts.xl, fontWeight: 'bold' as const },
  version: { position: 'absolute' as const, bottom: 20, color: warded.textDark, fontSize: wardedFonts.xs },
});
