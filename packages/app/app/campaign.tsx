import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warded, wardedFonts } from '../theme-warded';
import DialogueOverlay from '../components/warded/DialogueOverlay';
import { CHAPTERS } from '../../engine/src/warded/campaign-data';
import { createNewSave } from '../../engine/src/warded/campaign-engine';
import type { ChapterDefinition, CampaignSaveState } from '../../engine/src/warded/campaign-types';
import type { HeroId } from '../../engine/src/warded/types';

const BG_NIGHT = require('../assets/images/bg_night.png');

const HERO_IMAGES: Record<string, any> = {
  arlen: require('../assets/images/hero_arlen.png'),
  arlen_young: require('../assets/images/hero_arlen_young.png'),
  jardir: require('../assets/images/hero_jardir.png'),
  rojer: require('../assets/images/hero_rojer.png'),
  leesha: require('../assets/images/hero_leesha.png'),
};

// Map young heroId to display portrait
const HERO_DISPLAY_PORTRAIT: Record<string, string> = {
  arlen_young: 'arlen_young',
  leesha_young: 'leesha',
  jardir_young: 'jardir',
  rojer_young: 'rojer',
};

const CHARACTER_INFO: Record<string, { name: string; color: string; subtitle: string }> = {
  arlen_young: { name: 'Arlen Bales', color: '#FFD740', subtitle: "Un garçon de 11 ans qui refuse d'avoir peur" },
  leesha_young: { name: 'Leesha Paper', color: '#69F0AE', subtitle: "Apprentie herboriste, elle apprend à soigner" },
  jardir_young: { name: 'Ahmann Jardir', color: '#FF5252', subtitle: "Recrue nie'Sharum, sa première nuit dans le Maze" },
  rojer_young: { name: 'Rojer Inn', color: '#7C4DFF', subtitle: "Apprenti jongleur, il découvre un don étrange" },
};

const SAVE_KEY = '@warded_campaign_save';

type Phase = 'loading' | 'character_select' | 'intro';

export default function CampaignScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [save, setSave] = useState<CampaignSaveState | null>(null);
  const [currentChapter, setCurrentChapter] = useState<ChapterDefinition | null>(null);

  useEffect(() => { loadSave(); }, []);

  // Block Android back button (only allow explicit back via UI)
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  const loadSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVE_KEY);
      setSave(raw ? JSON.parse(raw) : createNewSave());
    } catch {
      setSave(createNewSave());
    }
    setPhase('character_select');
  };

  const startChapter = useCallback((chapter: ChapterDefinition) => {
    setCurrentChapter(chapter);
    setPhase('intro');
  }, []);

  const handleIntroComplete = useCallback(() => {
    if (!currentChapter) return;
    router.replace(`/warded?chapter=${currentChapter.id}`);
  }, [currentChapter, router]);

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (phase === 'intro' && currentChapter) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.15 }}>
          <View style={styles.bgOverlay} />
        </ImageBackground>
        <DialogueOverlay
          nodes={currentChapter.introDialogue}
          onChoice={() => {}}
          onComplete={handleIntroComplete}
        />
      </SafeAreaView>
    );
  }

  // Character selection — group chapters by hero
  const heroIds = ['arlen_young', 'leesha_young', 'jardir_young', 'rojer_young'];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.25 }}>
        <View style={styles.bgOverlay} />
      </ImageBackground>
      <ScrollView contentContainerStyle={styles.selectContainer}>
        <Text style={styles.title}>CAMPAGNE</Text>
        <Text style={styles.sub}>Choisis ton destin</Text>

        {heroIds.map(heroKey => {
          const info = CHARACTER_INFO[heroKey];
          const chapter = CHAPTERS.find(c => c.heroId === heroKey);
          if (!chapter || !info) return null;
          const isCompleted = save?.completedChapters.includes(chapter.id);

          return (
            <TouchableOpacity
              key={heroKey}
              style={[styles.card, { borderColor: info.color + '60' }]}
              onPress={() => startChapter(chapter)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Image source={HERO_IMAGES[HERO_DISPLAY_PORTRAIT[heroKey] ?? heroKey]} style={[styles.cardAvatar, { borderColor: info.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardName, { color: info.color }]}>{info.name}</Text>
                  <Text style={styles.cardSub}>{info.subtitle}</Text>
                  <Text style={styles.cardChapter}>{chapter.title}</Text>
                </View>
                {isCompleted && <Text style={styles.check}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  loadingText: { color: warded.text, fontSize: wardedFonts.xl, textAlign: 'center', marginTop: 100 },
  selectContainer: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40, gap: 14, alignItems: 'center' },
  title: {
    color: warded.accent, fontSize: 28, fontWeight: 'bold', letterSpacing: 4,
    textShadowColor: warded.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  sub: { color: warded.textDim, fontSize: wardedFonts.md, marginBottom: 8 },
  card: {
    width: '100%', backgroundColor: warded.bgCard, borderRadius: 14, padding: 14,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2 },
  cardName: { fontSize: wardedFonts.lg, fontWeight: 'bold' },
  cardSub: { color: warded.textDim, fontSize: wardedFonts.xs, marginTop: 1 },
  cardChapter: { color: warded.text, fontSize: wardedFonts.sm, marginTop: 4, fontStyle: 'italic' },
  check: { color: warded.success, fontSize: 24 },
  backBtn: { marginTop: 16, paddingVertical: 10 },
  backText: { color: warded.textDim, fontSize: wardedFonts.md },
});
