import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warded, wardedFonts } from '../theme-warded';

export default function SettingsScreen() {
  const router = useRouter();
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Confirmer la réinitialisation',
      'Cela supprimera ta sauvegarde de campagne et ton meilleur score en survie. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@warded_campaign_save');
            await AsyncStorage.removeItem('@warded_endless_highscore');
            setResetDone(true);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sauvegarde</Text>
          <TouchableOpacity
            style={[styles.button, resetDone && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={resetDone}
          >
            <Text style={[styles.buttonText, resetDone && { color: warded.textDark }]}>
              {resetDone ? 'Réinitialisé !' : 'Réinitialiser la campagne'}
            </Text>
            <Text style={styles.buttonHint}>
              Supprime la progression de campagne et le score de survie
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <View style={styles.creditsBox}>
            <Text style={styles.creditsTitle}>The Demon's Cycle</Text>
            <Text style={styles.creditsText}>
              Base sur The Warded Man de Peter V. Brett.
            </Text>
            <Text style={styles.creditsText}>
              Developpe avec React Native + Expo.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: warded.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: warded.border,
  },
  backButton: {
    paddingRight: 16,
  },
  backText: {
    color: warded.accent,
    fontSize: wardedFonts.lg,
  },
  title: {
    color: warded.text,
    fontSize: wardedFonts.xl,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: warded.accent,
    fontSize: wardedFonts.lg,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: warded.bgCard,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: warded.danger,
  },
  buttonDisabled: {
    borderColor: warded.textDark,
    opacity: 0.6,
  },
  buttonText: {
    color: warded.danger,
    fontSize: wardedFonts.lg,
    fontWeight: 'bold',
  },
  buttonHint: {
    color: warded.textDim,
    fontSize: wardedFonts.sm,
    marginTop: 4,
  },
  creditsBox: {
    backgroundColor: warded.bgCard,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: warded.border,
    gap: 8,
  },
  creditsTitle: {
    color: warded.wardFire,
    fontSize: wardedFonts.xl,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  creditsText: {
    color: warded.textDim,
    fontSize: wardedFonts.md,
    lineHeight: 22,
  },
});
