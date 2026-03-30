import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warded, wardedFonts } from '../theme-warded';
import DialogueOverlay from '../components/warded/DialogueOverlay';
import { CHAPTERS } from '../../engine/src/warded/campaign-data';
import { createNewSave } from '../../engine/src/warded/campaign-engine';
import type { ChapterDefinition, CampaignSaveState } from '../../engine/src/warded/campaign-types';

const BG_NIGHT = require('../assets/images/bg_night.png');

const HERO_IMAGES: Record<string, any> = {
  arlen: require('../assets/images/hero_arlen.png'),
  arlen_young: require('../assets/images/hero_arlen_young.png'),
  jardir: require('../assets/images/hero_jardir.png'),
  rojer: require('../assets/images/hero_rojer.png'),
  leesha: require('../assets/images/hero_leesha.png'),
};

const CHAPTER_HERO_PORTRAITS: Record<number, string> = {
  1: 'arlen_young',
};

const SAVE_KEY = '@warded_campaign_save';

type Phase = 'loading' | 'chapter_select' | 'intro';

export default function CampaignScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [save, setSave] = useState<CampaignSaveState | null>(null);
  const [currentChapter, setCurrentChapter] = useState<ChapterDefinition | null>(null);

  useEffect(() => { loadSave(); }, []);

  const loadSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVE_KEY);
      setSave(raw ? JSON.parse(raw) : createNewSave());
    } catch {
      setSave(createNewSave());
    }
    setPhase('chapter_select');
  };

  const startChapter = useCallback((chapter: ChapterDefinition) => {
    setCurrentChapter(chapter);
    setPhase('intro');
  }, []);

  const handleIntroComplete = useCallback(() => {
    if (!currentChapter) return;
    // Navigate to warded screen with campaign chapter param
    router.push(`/warded?chapter=${currentChapter.id}`);
  }, [currentChapter, router]);

  // Loading
  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  // Intro dialogue
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

  // Chapter Select
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.25 }}>
        <View style={styles.bgOverlay} />
      </ImageBackground>
      <ScrollView contentContainerStyle={styles.selectContainer}>
        <Text style={styles.title}>CAMPAGNE</Text>
        <Text style={styles.sub}>The Demon's Cycle</Text>

        {CHAPTERS.map(chapter => {
          const isCompleted = save?.completedChapters.includes(chapter.id);
          const isUnlocked = chapter.id <= (save?.currentChapter ?? 1);
          return (
            <TouchableOpacity
              key={chapter.id}
              style={[styles.card, !isUnlocked && styles.cardLocked]}
              disabled={!isUnlocked}
              onPress={() => startChapter(chapter)}
            >
              <View style={styles.cardHeader}>
                <Image source={HERO_IMAGES[CHAPTER_HERO_PORTRAITS[chapter.id] ?? chapter.heroId]} style={styles.cardAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardNum}>Chapitre {chapter.id}</Text>
                  <Text style={styles.cardTitle}>{chapter.title}</Text>
                  <Text style={styles.cardSub}>{chapter.subtitle}</Text>
                </View>
                {isCompleted && <Text style={styles.check}>✓</Text>}
                {!isUnlocked && <Text style={styles.lock}>🔒</Text>}
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
  selectContainer: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40, gap: 16, alignItems: 'center' },
  title: { color: warded.accent, fontSize: 28, fontWeight: 'bold', letterSpacing: 4, textShadowColor: warded.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  sub: { color: warded.textDim, fontSize: wardedFonts.md, marginBottom: 12 },
  card: { width: '100%', backgroundColor: warded.bgCard, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: warded.border },
  cardLocked: { opacity: 0.4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: warded.accent },
  cardNum: { color: warded.accent, fontSize: wardedFonts.xs, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { color: warded.text, fontSize: wardedFonts.lg, fontWeight: 'bold' },
  cardSub: { color: warded.textDim, fontSize: wardedFonts.sm, marginTop: 2 },
  check: { color: warded.success, fontSize: 24 },
  lock: { fontSize: 20 },
  backBtn: { marginTop: 12, paddingVertical: 10 },
  backText: { color: warded.textDim, fontSize: wardedFonts.md },
});
