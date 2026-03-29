import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { warded, wardedFonts } from '../theme-warded';

const BG_NIGHT = require('../assets/images/bg_night.png');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={BG_NIGHT} style={styles.container} imageStyle={{ opacity: 0.25 }}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>THE DEMON'S</Text>
        <Text style={styles.subtitle}>CYCLE</Text>
        <Text style={styles.tagline}>Protège. Résiste. Survie.</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/warded')}
        >
          <Text style={styles.buttonText}>Jouer</Text>
          <Text style={styles.buttonDesc}>Mode rapide — Arlen Bales</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/warded')}
        >
          <Text style={styles.buttonText}>Campagne</Text>
          <Text style={styles.buttonDesc}>Bientot disponible</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>v2.2.0 — The Demon's Cycle</Text>
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
  version: { position: 'absolute', bottom: 20, color: warded.textDark, fontSize: wardedFonts.xs },
});
