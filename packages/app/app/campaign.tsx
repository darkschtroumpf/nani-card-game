import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warded, wardedFonts } from '../theme-warded';
import { useWardedGame } from '../hooks/useWardedGame';
import DialogueOverlay from '../components/warded/DialogueOverlay';
import { CHAPTERS } from '../../engine/src/warded/campaign-data';
import { createCampaignGame, applyCampaignEffects, createNewSave, updateSaveAfterChapter } from '../../engine/src/warded/campaign-engine';
import type { ChapterDefinition, CampaignSaveState, DayEvent } from '../../engine/src/warded/campaign-types';
import type { HeroId } from '../../engine/src/warded/types';

const BG_NIGHT = require('../assets/images/bg_night.png');

const HERO_IMAGES: Record<string, any> = {
  arlen: require('../assets/images/hero_arlen.png'),
  jardir: require('../assets/images/hero_jardir.png'),
  rojer: require('../assets/images/hero_rojer.png'),
  leesha: require('../assets/images/hero_leesha.png'),
};

type CampaignPhase = 'loading' | 'chapter_select' | 'intro' | 'day_event' | 'gameplay' | 'victory' | 'defeat';

const SAVE_KEY = '@warded_campaign_save';

export default function CampaignScreen() {
  const router = useRouter();
  const ctrl = useWardedGame();
  const { state } = ctrl;

  const [phase, setPhase] = useState<CampaignPhase>('loading');
  const [save, setSave] = useState<CampaignSaveState | null>(null);
  const [currentChapter, setCurrentChapter] = useState<ChapterDefinition | null>(null);
  const [dayEventProcessed, setDayEventProcessed] = useState<Record<number, boolean>>({});
  const [currentDayEvent, setCurrentDayEvent] = useState<DayEvent | null>(null);
  const [effectMessages, setEffectMessages] = useState<string[]>([]);
  const [showEffects, setShowEffects] = useState(false);

  // Load save on mount
  useEffect(() => {
    loadSave();
  }, []);

  const loadSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVE_KEY);
      const loaded = raw ? JSON.parse(raw) as CampaignSaveState : createNewSave();
      setSave(loaded);
      setPhase('chapter_select');
    } catch {
      setSave(createNewSave());
      setPhase('chapter_select');
    }
  };

  const saveCampaign = async (newSave: CampaignSaveState) => {
    setSave(newSave);
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(newSave));
  };

  // Start a chapter
  const startChapter = useCallback((chapter: ChapterDefinition) => {
    setCurrentChapter(chapter);
    setDayEventProcessed({});
    setPhase('intro');
  }, []);

  // After intro dialogue
  const handleIntroComplete = useCallback(() => {
    if (!currentChapter || !save) return;
    // Create the game
    const gameState = createCampaignGame(currentChapter, save);
    // Manually init the game via the hook
    ctrl.startGame(currentChapter.heroId, 'midnight');
    // We need to apply the campaign game state — but the hook creates its own.
    // Workaround: use startGame then check for day events
    setPhase('gameplay');
    checkDayEvent(1);
  }, [currentChapter, save, ctrl]);

  // Check if a day event should fire
  const checkDayEvent = useCallback((dayNum: number) => {
    if (!currentChapter) return;
    if (dayEventProcessed[dayNum]) return;
    const event = currentChapter.dayEvents.find(e => e.dayNumber === dayNum);
    if (event) {
      setCurrentDayEvent(event);
      setPhase('day_event');
    }
  }, [currentChapter, dayEventProcessed]);

  // Handle day event choice
  const handleDayEventChoice = useCallback((choiceId: string) => {
    if (!currentDayEvent || !state || !currentChapter || !save) return;

    // Find the choice
    for (const node of currentDayEvent.dialogueNodes) {
      const choice = node.choices?.find(c => c.id === choiceId);
      if (choice) {
        // Apply effects to game state
        const messages = applyCampaignEffects(state, choice.effects);
        setEffectMessages(messages);
        setShowEffects(true);

        // Record choice
        const newSave = { ...save, choiceHistory: { ...save.choiceHistory, [currentDayEvent.dayNumber + '_' + node.id]: choiceId } };
        saveCampaign(newSave);

        // Mark day event as done
        setDayEventProcessed(prev => ({ ...prev, [currentDayEvent.dayNumber]: true }));

        // Show effects briefly, then return to gameplay
        setTimeout(() => {
          setShowEffects(false);
          setCurrentDayEvent(null);
          setPhase('gameplay');
        }, 2500);
        return;
      }
    }
  }, [currentDayEvent, state, currentChapter, save]);

  // Monitor game state for victory/defeat and day transitions
  useEffect(() => {
    if (!state || !currentChapter || phase !== 'gameplay') return;

    if (state.gameOver) {
      if (state.victory) {
        // Save progression
        if (save) {
          const newSave = updateSaveAfterChapter(save, state, currentChapter.id);
          saveCampaign(newSave);
        }
        setPhase('victory');
      } else {
        setPhase('defeat');
      }
      return;
    }

    // Check for day events when day phase starts
    if (state.phase === 'day') {
      checkDayEvent(state.turnNumber);
    }
  }, [state?.gameOver, state?.phase, state?.turnNumber, phase]);

  // --- RENDER ---

  // Loading
  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  // Chapter Select
  if (phase === 'chapter_select') {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.25 }}>
          <View style={styles.bgOverlay} />
        </ImageBackground>
        <ScrollView contentContainerStyle={styles.chapterSelectContainer}>
          <Text style={styles.campaignTitle}>CAMPAGNE</Text>
          <Text style={styles.campaignSub}>The Demon's Cycle</Text>

          {CHAPTERS.map(chapter => {
            const isCompleted = save?.completedChapters.includes(chapter.id);
            const isUnlocked = chapter.id <= (save?.currentChapter ?? 1);
            return (
              <TouchableOpacity
                key={chapter.id}
                style={[styles.chapterCard, !isUnlocked && styles.chapterLocked]}
                disabled={!isUnlocked}
                onPress={() => startChapter(chapter)}
              >
                <View style={styles.chapterHeader}>
                  <Image source={HERO_IMAGES[chapter.heroId]} style={styles.chapterHeroImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chapterNum}>Chapitre {chapter.id}</Text>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterSub}>{chapter.subtitle}</Text>
                  </View>
                  {isCompleted && <Text style={styles.chapterCheck}>✓</Text>}
                  {!isUnlocked && <Text style={styles.chapterLock}>🔒</Text>}
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Intro dialogue
  if (phase === 'intro' && currentChapter) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.3 }}>
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

  // Day event dialogue
  if (phase === 'day_event' && currentDayEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.3 }}>
          <View style={styles.bgOverlay} />
        </ImageBackground>
        {showEffects ? (
          <View style={styles.effectsOverlay}>
            <Text style={styles.effectsTitle}>Conséquences</Text>
            {effectMessages.map((m, i) => (
              <Text key={i} style={styles.effectLine}>{m}</Text>
            ))}
          </View>
        ) : (
          <DialogueOverlay
            nodes={currentDayEvent.dialogueNodes}
            onChoice={handleDayEventChoice}
            onComplete={() => {
              setCurrentDayEvent(null);
              setPhase('gameplay');
              setDayEventProcessed(prev => ({ ...prev, [currentDayEvent.dayNumber]: true }));
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  // Victory dialogue
  if (phase === 'victory' && currentChapter) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.3 }}>
          <View style={styles.bgOverlay} />
        </ImageBackground>
        <DialogueOverlay
          nodes={currentChapter.victoryDialogue}
          onChoice={() => {}}
          onComplete={() => setPhase('chapter_select')}
        />
      </SafeAreaView>
    );
  }

  // Defeat dialogue
  if (phase === 'defeat' && currentChapter) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.3 }}>
          <View style={styles.bgOverlay} />
        </ImageBackground>
        <DialogueOverlay
          nodes={currentChapter.defeatDialogue}
          onChoice={() => {}}
          onComplete={() => setPhase('chapter_select')}
        />
      </SafeAreaView>
    );
  }

  // Gameplay — redirect to warded screen with campaign context
  // For now, render a message + button to go to game
  if (phase === 'gameplay') {
    // The game is running via ctrl — render the actual game screen inline
    // We redirect to /warded with campaign mode active
    // Simpler: just show button to go play
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.3 }}>
          <View style={styles.bgOverlay} />
        </ImageBackground>
        <View style={styles.gameplayBridge}>
          <Text style={styles.gameplayTitle}>
            {currentChapter ? `Chapitre ${currentChapter.id} — Jour ${state?.turnNumber ?? 1}` : 'Campagne'}
          </Text>
          {effectMessages.length > 0 && (
            <View style={styles.effectsBanner}>
              {effectMessages.map((m, i) => (
                <Text key={i} style={styles.effectBannerLine}>• {m}</Text>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => router.push('/warded')}
          >
            <Text style={styles.playBtnText}>Jouer ce jour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  loadingText: { color: warded.text, fontSize: wardedFonts.xl, textAlign: 'center', marginTop: 100 },

  // Chapter Select
  chapterSelectContainer: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40, gap: 16, alignItems: 'center' },
  campaignTitle: {
    color: warded.accent, fontSize: 28, fontWeight: 'bold', letterSpacing: 4,
    textShadowColor: warded.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  campaignSub: { color: warded.textDim, fontSize: wardedFonts.md, marginBottom: 12 },
  chapterCard: {
    width: '100%', backgroundColor: warded.bgCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: warded.border,
  },
  chapterLocked: { opacity: 0.4 },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chapterHeroImg: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: warded.accent },
  chapterNum: { color: warded.accent, fontSize: wardedFonts.xs, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  chapterTitle: { color: warded.text, fontSize: wardedFonts.lg, fontWeight: 'bold' },
  chapterSub: { color: warded.textDim, fontSize: wardedFonts.sm, marginTop: 2 },
  chapterCheck: { color: warded.success, fontSize: 24 },
  chapterLock: { fontSize: 20 },
  backBtn: { marginTop: 12, paddingVertical: 10 },
  backBtnText: { color: warded.textDim, fontSize: wardedFonts.md },

  // Effects overlay
  effectsOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 30,
  },
  effectsTitle: { color: warded.accent, fontSize: wardedFonts.xl, fontWeight: 'bold' },
  effectLine: { color: warded.text, fontSize: wardedFonts.md, textAlign: 'center' },

  // Gameplay bridge
  gameplayBridge: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 30,
  },
  gameplayTitle: { color: warded.accent, fontSize: wardedFonts.xl, fontWeight: 'bold', textAlign: 'center' },
  effectsBanner: {
    backgroundColor: warded.bgCard, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: warded.accent + '40',
    width: '100%', gap: 4,
  },
  effectBannerLine: { color: warded.warning, fontSize: wardedFonts.sm },
  playBtn: {
    backgroundColor: warded.accent + '20', borderWidth: 2, borderColor: warded.accent,
    borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40,
  },
  playBtnText: { color: warded.accent, fontSize: wardedFonts.lg, fontWeight: 'bold' },
});
