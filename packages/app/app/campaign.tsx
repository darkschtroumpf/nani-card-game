import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warded, wardedFonts } from '../theme-warded';
import { useAudio } from '../hooks/useAudio';
import DialogueOverlay from '../components/warded/DialogueOverlay';
import { CHAPTERS } from '../../engine/src/warded/campaign-data';
import { createNewSave, getTotalStars, getSpentStars, migrateSave, isChapterUnlocked } from '../../engine/src/warded/campaign-engine';
import { TALENTS } from '../../engine/src/warded/constants';
import type { ChapterDefinition, CampaignSaveState } from '../../engine/src/warded/campaign-types';
import type { HeroId, TalentDefinition } from '../../engine/src/warded/types';

const BG_NIGHT = require('../assets/images/bg_night.png');
const MAP_THESA = require('../assets/images/map_thesa.png');

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

const CHARACTER_INFO: Record<string, { name: string; color: string }> = {
  arlen_young: { name: 'Arlen Bales', color: '#FFD740' },
  arlen: { name: 'Arlen — Le Messager', color: '#FFD740' },
  leesha_young: { name: 'Leesha Paper', color: '#69F0AE' },
  leesha: { name: 'Leesha — Herboriste', color: '#69F0AE' },
  jardir_young: { name: 'Ahmann Jardir', color: '#FF5252' },
  rojer_young: { name: 'Rojer Inn', color: '#7C4DFF' },
};

// Group chapters by character (chapter IDs)
const CHARACTER_CHAPTERS: Record<string, number[]> = {
  arlen_young: [1, 5, 9, 11, 12],
  leesha_young: [2, 6, 10],
  jardir_young: [3, 7],
  rojer_young: [4, 8],
};

const SAVE_KEY = '@warded_campaign_save';

type Phase = 'loading' | 'character_select' | 'intro';

export default function CampaignScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [save, setSave] = useState<CampaignSaveState | null>(null);
  const [showTalents, setShowTalents] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<ChapterDefinition | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterDefinition | null>(null);
  const audio = useAudio();

  // Start music immediately
  useEffect(() => { audio.playMusic('menu'); }, []);

  useEffect(() => { loadSave(); }, []);

  // Block Android back button (only allow explicit back via UI)
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  const loadSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVE_KEY);
      const parsed = raw ? migrateSave(JSON.parse(raw)) : createNewSave();
      setSave(parsed);
    } catch {
      setSave(createNewSave());
    }
    setPhase('character_select');
  };

  const audioRef = useRef(audio);
  audioRef.current = audio;

  const startChapter = useCallback((chapter: ChapterDefinition) => {
    setCurrentChapter(chapter);
    setPhase('intro');
    // Fire-and-forget — don't block UI on audio
    setTimeout(() => audioRef.current.playMusic('vn_dramatic'), 50);
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

  // Find next chapter to play
  const nextChapter = CHAPTERS.find(c => save && !save.completedChapters.includes(c.id) && isChapterUnlocked(c, save, CHAPTERS));

  const ACT_NAMES: Record<number, string> = {
    1: 'Acte I — Origines', 2: 'Acte II — Croissance', 3: 'Acte III — Tournants',
    4: 'Acte IV — La Quête', 5: 'Acte V — Transformation', 6: 'Acte VI — Convergence', 0: 'Final',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Parchment map background */}
      <Image source={MAP_THESA} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' }} />

      {/* Top bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 }}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={{ color: warded.text, fontSize: wardedFonts.md }}>← Retour</Text>
        </TouchableOpacity>
        <Text style={{ color: warded.accent, fontSize: wardedFonts.lg, fontWeight: 'bold', letterSpacing: 2 }}>CAMPAGNE</Text>
        <TouchableOpacity onPress={async () => {
          const fresh = createNewSave();
          setSave(fresh);
          await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
        }}>
          <Text style={{ color: warded.textDim, fontSize: wardedFonts.sm }}>Recommencer</Text>
        </TouchableOpacity>
      </View>

      {/* Chapter list overlay — scrollable */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120, paddingTop: 8 }}>
        {[1, 2, 3, 4, 5, 6, 0].map(actNum => {
          const actChapters = CHAPTERS.filter(c => c.act === actNum);
          if (actChapters.length === 0) return null;
          const actCompleted = actChapters.every(c => save?.completedChapters.includes(c.id));
          const actProgress = actChapters.filter(c => save?.completedChapters.includes(c.id)).length;

          return (
            <View key={`act-${actNum}`} style={{ marginBottom: 8 }}>
              <Text style={{ color: actCompleted ? warded.success : warded.accent, fontSize: wardedFonts.sm, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 }}>
                {ACT_NAMES[actNum]} {actCompleted ? '✓' : `(${actProgress}/${actChapters.length})`}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {actChapters.map(chapter => {
                  const isCompleted = save?.completedChapters.includes(chapter.id);
                  const unlocked = save ? isChapterUnlocked(chapter, save, CHAPTERS) : chapter.act === 1;
                  const isNext = nextChapter?.id === chapter.id;
                  const info = CHARACTER_INFO[chapter.heroId] ?? { name: chapter.heroId, color: warded.accent };
                  const stars = save?.chapterStars?.[chapter.id] ?? 0;
                  return (
                    <TouchableOpacity
                      key={chapter.id}
                      disabled={!unlocked}
                      onPress={() => setSelectedChapter(chapter)}
                      style={{
                        width: '48%', backgroundColor: 'rgba(10,10,20,0.85)', borderRadius: 10, padding: 8,
                        borderWidth: isNext ? 2 : 1,
                        borderColor: isNext ? warded.accent : isCompleted ? info.color + '60' : unlocked ? warded.border : 'rgba(50,50,60,0.4)',
                        opacity: unlocked ? 1 : 0.4,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Image source={HERO_IMAGES[HERO_DISPLAY_PORTRAIT[chapter.heroId] ?? chapter.heroId]} style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: info.color }} />
                        <Text style={{ color: info.color, fontSize: wardedFonts.xs, fontWeight: 'bold', flex: 1 }} numberOfLines={1}>{chapter.title}</Text>
                      </View>
                      <Text style={{ color: warded.textDim, fontSize: 9, marginTop: 2 }} numberOfLines={1}>{chapter.subtitle}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                        {isCompleted ? <Text style={{ fontSize: 10 }}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text> : null}
                        {isNext && <Text style={{ color: warded.accent, fontSize: 9, fontWeight: 'bold' }}>SUIVANT</Text>}
                        {!unlocked && <Text style={{ fontSize: 10 }}>🔒</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Continue button — fixed at bottom */}
      {nextChapter && !selectedChapter && (
        <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
          <TouchableOpacity
            style={{ backgroundColor: 'rgba(10,10,20,0.9)', borderWidth: 2, borderColor: warded.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            onPress={() => startChapter(nextChapter)}
          >
            <Text style={{ color: warded.accent, fontSize: wardedFonts.lg, fontWeight: 'bold' }}>▶ Continuer — {nextChapter.title}</Text>
            <Text style={{ color: warded.textDim, fontSize: wardedFonts.xs }}>{nextChapter.subtitle}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chapter detail overlay */}
      {selectedChapter && (() => {
        const isCompleted = save?.completedChapters.includes(selectedChapter.id);
        const unlocked = save ? isChapterUnlocked(selectedChapter, save, CHAPTERS) : selectedChapter.act === 1;
        const info = CHARACTER_INFO[selectedChapter.heroId] ?? { name: selectedChapter.heroId, color: warded.accent };
        const stars = save?.chapterStars?.[selectedChapter.id] ?? 0;
        return (
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10,10,20,0.95)', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 2, borderTopColor: info.color + '60', padding: 20 }}>
            <TouchableOpacity onPress={() => setSelectedChapter(null)} style={{ position: 'absolute', top: 12, right: 16 }}>
              <Text style={{ color: warded.textDim, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Image source={HERO_IMAGES[HERO_DISPLAY_PORTRAIT[selectedChapter.heroId] ?? selectedChapter.heroId]} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: info.color }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: info.color, fontSize: wardedFonts.lg, fontWeight: 'bold' }}>{selectedChapter.title}</Text>
                <Text style={{ color: warded.textDim, fontSize: wardedFonts.sm }}>{selectedChapter.subtitle}</Text>
              </View>
            </View>
            {isCompleted && <Text style={{ fontSize: 20, marginBottom: 8 }}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>}
            <Text style={{ color: warded.textDim, fontSize: wardedFonts.xs, marginBottom: 12 }}>
              {selectedChapter.nightCount} nuits — {(selectedChapter.availableWards ?? []).join(', ') || 'pierre, vent'}
            </Text>
            <TouchableOpacity
              disabled={!unlocked}
              style={{ backgroundColor: unlocked ? info.color + '20' : 'transparent', borderWidth: 1, borderColor: unlocked ? info.color : warded.textDark, borderRadius: 12, paddingVertical: 12, alignItems: 'center', opacity: unlocked ? 1 : 0.4 }}
              onPress={() => { setSelectedChapter(null); startChapter(selectedChapter); }}
            >
              <Text style={{ color: unlocked ? info.color : warded.textDark, fontSize: wardedFonts.md, fontWeight: 'bold' }}>
                {isCompleted ? '🔄 Rejouer' : unlocked ? '▶ Lancer' : '🔒 Verrouillé'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })()}

        {/* Talent button moved out of scroll — see floating button below */}

      {/* Floating talent button (top-right, below header) */}
      {save && getTotalStars(save) > 0 && !showTalents && (
        <TouchableOpacity
          style={{ position: 'absolute', top: 56, right: 12, backgroundColor: 'rgba(10,10,20,0.9)', borderWidth: 2, borderColor: '#9b30ff', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          onPress={() => setShowTalents(true)}
        >
          <Text style={{ fontSize: 16 }}>🌟</Text>
          <Text style={{ color: '#9b30ff', fontSize: wardedFonts.sm, fontWeight: 'bold' }}>★ {getTotalStars(save) - getSpentStars(save)}</Text>
        </TouchableOpacity>
      )}

      {/* Talent overlay (full screen) */}
      {showTalents && save && (() => {
        const totalStars = getTotalStars(save);
        const spentStars = getSpentStars(save);
        const available = totalStars - spentStars;
        return (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 100 }}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#9b30ff60' }}>
                <Text style={{ color: '#9b30ff', fontSize: wardedFonts.xl, fontWeight: 'bold', letterSpacing: 2 }}>🌟 TALENTS</Text>
                <TouchableOpacity onPress={() => setShowTalents(false)}>
                  <Text style={{ color: warded.text, fontSize: 22 }}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: warded.textDim, fontSize: wardedFonts.sm, textAlign: 'center', paddingVertical: 8 }}>
                ★ {available} étoiles disponibles ({totalStars} total)
              </Text>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
                {['arlen_young', 'leesha_young', 'jardir_young', 'rojer_young'].map((heroKey: string) => {
                  const info = CHARACTER_INFO[heroKey];
                  const heroTalents = TALENTS.filter(t => t.heroId === heroKey);
                  if (heroTalents.length === 0) return null;
                  return (
                    <View key={`talent-${heroKey}`} style={{ marginTop: 12, padding: 10, backgroundColor: 'rgba(20,20,30,0.8)', borderRadius: 10, borderWidth: 1, borderColor: info.color + '40' }}>
                      <Text style={{ color: info.color, fontSize: wardedFonts.md, fontWeight: 'bold', marginBottom: 6 }}>{info.name}</Text>
                      {heroTalents.map(talent => {
                        const isUnlocked = save.unlockedTalents?.includes(talent.id);
                        const canAfford = available >= talent.cost;
                        const prevTierUnlocked = talent.tier === 1 || heroTalents.some(t => t.tier === talent.tier - 1 && save.unlockedTalents?.includes(t.id));
                        return (
                          <TouchableOpacity
                            key={talent.id}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, opacity: isUnlocked ? 1 : prevTierUnlocked && canAfford ? 1 : 0.4 }}
                            disabled={isUnlocked || !canAfford || !prevTierUnlocked}
                            onPress={async () => {
                              const updated = { ...save, unlockedTalents: [...(save.unlockedTalents ?? []), talent.id] };
                              setSave(updated);
                              await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(updated));
                            }}
                          >
                            <Text style={{ color: isUnlocked ? '#4CAF50' : warded.textDim, fontSize: wardedFonts.xs, width: 24 }}>
                              {isUnlocked ? '✓' : `T${talent.tier}`}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: isUnlocked ? warded.text : warded.textDim, fontSize: wardedFonts.sm, fontWeight: '600' }}>{talent.name}</Text>
                              <Text style={{ color: warded.textDim, fontSize: wardedFonts.xs }}>{talent.description}</Text>
                            </View>
                            {!isUnlocked && <Text style={{ color: warded.textDim, fontSize: wardedFonts.xs }}>★{talent.cost}</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </ScrollView>
            </SafeAreaView>
          </View>
        );
      })()}
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
  chapterRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: warded.border, marginTop: 6 },
  chapterNum: { color: warded.accent, fontSize: wardedFonts.xs, fontWeight: 'bold', width: 30 },
  chapterAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, marginRight: 8 },
  cardChapter: { color: warded.text, fontSize: wardedFonts.sm, fontWeight: '600' },
  check: { color: warded.success, fontSize: 24 },
  backBtn: { marginTop: 16, paddingVertical: 10 },
  backText: { color: warded.textDim, fontSize: wardedFonts.md },
});
