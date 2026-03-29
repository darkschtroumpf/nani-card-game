import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { warded, wardedFonts, wardColor, WARD_SYMBOLS } from '../theme-warded';
import { useWardedGame } from '../hooks/useWardedGame';
import WorldMap from '../components/warded/WorldMap';
import LocationDetail from '../components/warded/LocationDetail';
import type { LocationId, WardType } from '../../engine/src/warded/types';
import { WARD_TYPES, WARD_COSTS } from '../../engine/src/warded/constants';

// FIX 4: Short effect descriptions for ward craft cards (French)
const WARD_EFFECTS: Record<string, string> = {
  fire: '1 dmg a tous les demons',
  stone: '+2 defense du lieu',
  wind: 'redirige 1 demon',
  light: 'revele les demons',
  bone: '+1 pop a l\'aube',
};

// FIX 4: Cost display helper
function wardCostLabel(w: WardType): string {
  const c = WARD_COSTS[w];
  const parts: string[] = [];
  if (c.wood > 0) parts.push(`${c.wood} Bois`);
  if (c.ink > 0) parts.push(`${c.ink} Encre`);
  if (c.food > 0) parts.push(`${c.food} Nourriture`);
  return parts.join(' ');
}

// FIX 5: Night phase steps
const NIGHT_STEPS = ['Position', 'Vague', 'Activation', 'Degats'] as const;

function getNightStepIndex(waveNumber: number, activationsRemaining: number, totalActivations: number): number {
  if (waveNumber === 0) return 0;
  if (activationsRemaining === totalActivations) return 1; // wave just started, passives resolving
  if (activationsRemaining > 0) return 2;
  return 3;
}

export default function WardedGameScreen() {
  const router = useRouter();
  const ctrl = useWardedGame();
  const { state, events, forecast } = ctrl;
  const [selectedLocation, setSelectedLocation] = useState<LocationId | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showNightTransition, setShowNightTransition] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      ctrl.startGame('arlen', 'midnight');
    }
  }, []);

  if (!state) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const isDay = state.phase === 'day';
  const isNight = state.phase === 'night';
  const selectedLoc = selectedLocation ? state.locations.find(l => l.id === selectedLocation) : null;

  // Game over
  if (state.gameOver) {
    return (
      <SafeAreaView style={[styles.container, state.victory ? styles.victoryBg : styles.defeatBg]}>
        <View style={styles.gameOverBox}>
          <Text style={styles.gameOverEmoji}>{state.victory ? '🌅' : '💀'}</Text>
          <Text style={styles.gameOverTitle}>{state.victory ? "L'AUBE SE LEVE" : 'LA NUIT GAGNE'}</Text>
          <Text style={styles.gameOverSub}>
            {state.victory
              ? `${state.hero.name} a protégé les cités!`
              : state.defeatReason ?? 'Les ténèbres recouvrent Ala.'}
          </Text>
          <TouchableOpacity style={styles.menuBtn} onPress={() => router.replace('/')}>
            <Text style={styles.menuBtnText}>Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // FIX 1: Wrapped endDay to show transition overlay
  const handleEndDay = () => {
    setShowNightTransition(true);
    setTimeout(() => {
      setShowNightTransition(false);
      ctrl.endDay();
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDay ? warded.dayBg : warded.nightBg }]}>
      {/* FIX 1: Night transition overlay */}
      {showNightTransition && (
        <View style={styles.transitionOverlay}>
          <Text style={styles.transitionEmoji}>🌙</Text>
          <Text style={styles.transitionText}>LA NUIT TOMBE</Text>
          <Text style={styles.transitionSub}>Les demons surgissent de la terre...</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heroName}>⚔ {state.hero.name}</Text>
          <Text style={styles.heroTitle}>{state.hero.title}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.phaseText}>{isDay ? '☀ JOUR' : '🌙 NUIT'}</Text>
          {isDay && <Text style={styles.apText}>AP: {state.hero.ap}</Text>}
          {isNight && <Text style={styles.waveText}>Vague {state.waveNumber}/3</Text>}
        </View>
      </View>

      {/* Hero stats */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>HP</Text>
          <Text style={[styles.statValue, { color: state.hero.hp > 5 ? warded.success : warded.danger }]}>
            {state.hero.hp}/{state.hero.maxHp}
          </Text>
        </View>
        {state.hero.arlenCharge !== undefined && (
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>Charge</Text>
            <Text style={[styles.statValue, { color: warded.accent }]}>{state.hero.arlenCharge}</Text>
          </View>
        )}
        {isNight && (
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>Activations</Text>
            <Text style={[styles.statValue, { color: warded.wardLight }]}>{state.activationsRemaining}</Text>
          </View>
        )}
        {state.currentSurge && state.currentSurge !== 'night_of_courage' && (
          <View style={[styles.statChip, { borderColor: warded.danger }]}>
            <Text style={[styles.statLabel, { color: warded.danger }]}>Surge</Text>
            <Text style={[styles.statValue, { color: warded.danger, fontSize: wardedFonts.xs }]}>
              {state.currentSurge.replace(/_/g, ' ')}
            </Text>
          </View>
        )}
      </View>

      {/* Map */}
      <WorldMap
        locations={state.locations}
        presenceLocation={state.presenceLocation}
        demonsAtLocations={state.demonsAtLocations}
        selectedLocation={selectedLocation}
        onLocationPress={setSelectedLocation}
        isNight={isNight}
        forecast={isDay && forecast ? forecast : undefined}
      />

      {/* Location detail (if selected) */}
      {selectedLoc && (
        <ScrollView style={styles.detailScroll}>
          <LocationDetail
            location={selectedLoc}
            demons={state.demonsAtLocations[selectedLoc.id] ?? []}
            isPresence={state.presenceLocation === selectedLoc.id}
            isNight={isNight}
            onClose={() => setSelectedLocation(null)}
            onGather={isDay && state.hero.ap > 0 ? () => { ctrl.doGather(selectedLoc.id); } : undefined}
            canGather={isDay && state.hero.ap > 0}
            onFortify={isDay && state.hero.ap > 0 && state.wardReserves.length > 0
              ? (w: WardType) => { ctrl.doFortify(w, selectedLoc.id); }
              : undefined}
            canFortify={isDay && state.hero.ap > 0 && state.wardReserves.length > 0 && selectedLoc.wards.some(w => !w.ward)}
            availableWardReserves={state.wardReserves}
            onActivateWard={isNight && state.activationsRemaining > 0 && (selectedLoc.wards[0].ward || selectedLoc.wards[1].ward)
              ? (useCombo) => { ctrl.doActivateWard(selectedLoc.id, useCombo); }
              : undefined}
            canActivate={isNight && state.activationsRemaining > 0}
          />
        </ScrollView>
      )}

      {/* FIX 5: Night phase step indicator */}
      {isNight && !selectedLoc && (
        <View style={styles.nightStepsBar}>
          {NIGHT_STEPS.map((step, i) => {
            const totalAct = state.locations.filter(l => !l.fallen && (l.wards[0].ward || l.wards[1].ward)).length;
            const currentStep = getNightStepIndex(state.waveNumber, state.activationsRemaining, totalAct);
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <View key={step} style={styles.nightStepItem}>
                <View style={[
                  styles.nightStepDot,
                  isActive && styles.nightStepDotActive,
                  isDone && styles.nightStepDotDone,
                ]} />
                <Text style={[
                  styles.nightStepLabel,
                  isActive && styles.nightStepLabelActive,
                  isDone && styles.nightStepLabelDone,
                ]}>{step}</Text>
                {i < NIGHT_STEPS.length - 1 && <View style={styles.nightStepConnector} />}
              </View>
            );
          })}
        </View>
      )}

      {/* No location selected — show action bar */}
      {!selectedLoc && (
        <View style={styles.actionBar}>
          {/* Day: craft wards — FIX 4: show effect + cost */}
          {isDay && state.hero.ap > 0 && (
            <View style={styles.actionSection}>
              <Text style={styles.actionLabel}>Crafter un Ward (1 AP)</Text>
              <View style={styles.wardCraftRow}>
                {WARD_TYPES.map(w => {
                  const cost = WARD_COSTS[w];
                  const canAfford = state.locations.some(l => !l.fallen &&
                    l.stockpile.wood >= cost.wood && l.stockpile.ink >= cost.ink);
                  return (
                    <TouchableOpacity
                      key={w}
                      style={[styles.wardCraftBtn, !canAfford && styles.btnDisabled, { borderColor: wardColor(w) }]}
                      disabled={!canAfford}
                      onPress={() => {
                        const fromLoc = state.locations.find(l => !l.fallen &&
                          l.stockpile.wood >= cost.wood && l.stockpile.ink >= cost.ink);
                        if (fromLoc) ctrl.doCraft(w, fromLoc.id);
                      }}
                    >
                      <Text style={[styles.wardCraftIcon, { color: wardColor(w) }]}>{WARD_SYMBOLS[w]}</Text>
                      <Text style={styles.wardCraftName}>{w}</Text>
                      <Text style={styles.wardCraftEffect}>{WARD_EFFECTS[w]}</Text>
                      <Text style={styles.wardCraftCost}>{wardCostLabel(w as WardType)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Ward reserves */}
          {isDay && state.wardReserves.length > 0 && (
            <Text style={styles.reserveText}>
              Réserves: {state.wardReserves.map(w => `${WARD_SYMBOLS[w]} ${w}`).join(', ')} — Sélectionne un lieu pour placer
            </Text>
          )}

          {/* Arlen: Warded Flesh (place temp ward) */}
          {isDay && state.hero.id === 'arlen' && state.hero.ap > 0 && selectedLocation && (
            <View style={styles.actionSection}>
              <Text style={styles.actionLabel}>⚔ Warded Flesh (1 AP) — Ward temp à {selectedLocation}</Text>
              <View style={styles.wardCraftRow}>
                {WARD_TYPES.map(w => {
                  const loc = state.locations.find(l => l.id === selectedLocation);
                  const hasSlot = loc && loc.wards.some(ws => !ws.ward);
                  return (
                    <TouchableOpacity
                      key={w}
                      style={[styles.wardCraftBtn, !hasSlot && styles.btnDisabled, { borderColor: wardColor(w) }]}
                      disabled={!hasSlot}
                      onPress={() => { if (selectedLocation) ctrl.doWardedFlesh(w, selectedLocation); }}
                    >
                      <Text style={[styles.wardCraftIcon, { color: wardColor(w) }]}>{WARD_SYMBOLS[w]}</Text>
                      <Text style={styles.wardCraftName}>temp</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Day: end day button */}
          {isDay && (
            <TouchableOpacity style={[styles.phaseBtn, { backgroundColor: warded.nightBg, borderColor: warded.wardLight }]} onPress={handleEndDay}>
              <Text style={[styles.phaseBtnText, { color: warded.wardLight }]}>🌙 Tomber de la nuit</Text>
            </TouchableOpacity>
          )}

          {/* Night: wave controls */}
          {isNight && state.waveNumber === 0 && (
            <View style={styles.nightActions}>
              <Text style={styles.nightLabel}>Positionne ta Présence, puis lance la vague.</Text>
              <TouchableOpacity style={styles.phaseBtn} onPress={ctrl.doStartWave}>
                <Text style={styles.phaseBtnText}>Lancer Vague 1</Text>
              </TouchableOpacity>
            </View>
          )}

          {isNight && state.waveNumber > 0 && state.activationsRemaining > 0 && (
            <View style={styles.nightActions}>
              <Text style={styles.nightLabel}>Sélectionne un lieu pour activer ses wards ({state.activationsRemaining} restantes)</Text>
              {state.hero.id === 'arlen' && !state.heroWaveAbilityUsed && (state.hero.arlenCharge ?? 0) > 0 && (
                <TouchableOpacity style={[styles.phaseBtn, { backgroundColor: warded.accent + '30', borderColor: warded.accent }]} onPress={ctrl.doWardedFist}>
                  <Text style={[styles.phaseBtnText, { color: warded.accent }]}>⚔ Warded Fist ({state.hero.arlenCharge} dmg)</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isNight && state.waveNumber > 0 && state.activationsRemaining === 0 && !state.heroWaveAbilityUsed && state.hero.id === 'arlen' && (state.hero.arlenCharge ?? 0) > 0 && (
            <View style={styles.nightActions}>
              <TouchableOpacity style={[styles.phaseBtn, { borderColor: warded.accent }]} onPress={ctrl.doWardedFist}>
                <Text style={[styles.phaseBtnText, { color: warded.accent }]}>⚔ Warded Fist ({state.hero.arlenCharge} dmg)</Text>
              </TouchableOpacity>
            </View>
          )}

          {isNight && state.waveNumber > 0 && state.activationsRemaining === 0 && (
            <View style={styles.nightActions}>
              <TouchableOpacity style={[styles.phaseBtn, { backgroundColor: warded.danger + '20', borderColor: warded.danger }]} onPress={() => {
                ctrl.doResolveDamage();
                setTimeout(() => {
                  const s = ctrl.state;
                  if (s && !s.gameOver && s.waveNumber < 3) {
                    ctrl.doStartWave();
                  } else if (s && !s.gameOver && s.waveNumber >= 3) {
                    ctrl.doEndWave();
                  }
                }, 2000);
              }}>
                <Text style={styles.phaseBtnText}>⚡ Résoudre les dégâts (Vague {state.waveNumber}/3)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Event log */}
      {events.length > 0 && (
        <View style={styles.eventLog}>
          {events.slice(-3).map((e, i) => (
            <Text key={i} style={[styles.eventText, i === events.slice(-3).length - 1 && styles.eventLatest]}>
              {e}
            </Text>
          ))}
        </View>
      )}

      {/* FIX 3: Forecast row removed — threat levels now shown as colored borders on map nodes */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: warded.bg },
  loadingText: { color: warded.text, fontSize: wardedFonts.xl, textAlign: 'center', marginTop: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8 },
  heroName: { color: warded.accent, fontSize: wardedFonts.lg, fontWeight: 'bold' },
  heroTitle: { color: warded.textDim, fontSize: wardedFonts.xs },
  headerRight: { alignItems: 'flex-end' },
  phaseText: { color: warded.text, fontSize: wardedFonts.md, fontWeight: 'bold' },
  apText: { color: warded.wardLight, fontSize: wardedFonts.sm, fontWeight: 'bold' },
  waveText: { color: warded.danger, fontSize: wardedFonts.sm, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, marginBottom: 4 },
  statChip: { backgroundColor: warded.bgCard, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: warded.border, alignItems: 'center' },
  statLabel: { color: warded.textDim, fontSize: 8, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: wardedFonts.md, fontWeight: 'bold' },

  detailScroll: { flex: 1, paddingHorizontal: 14 },

  actionBar: { paddingHorizontal: 14, gap: 8, paddingBottom: 8 },
  actionSection: { gap: 6 },
  actionLabel: { color: warded.textDim, fontSize: wardedFonts.xs, fontWeight: '600', textTransform: 'uppercase' },

  wardCraftRow: { flexDirection: 'row', gap: 6 },
  wardCraftBtn: { flex: 1, backgroundColor: warded.bgCard, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', borderWidth: 1, gap: 2 },
  btnDisabled: { opacity: 0.3 },
  wardCraftIcon: { fontSize: 18 },
  wardCraftName: { color: warded.text, fontSize: 8, fontWeight: '600', textTransform: 'uppercase' },
  wardCraftEffect: { color: warded.textDim, fontSize: 7, textAlign: 'center' },
  wardCraftCost: { color: warded.warning, fontSize: 7, fontWeight: '600', textAlign: 'center' },

  reserveText: { color: warded.accent, fontSize: wardedFonts.xs, textAlign: 'center', fontStyle: 'italic' },

  phaseBtn: { backgroundColor: warded.bgCard, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: warded.border },
  phaseBtnText: { color: warded.text, fontSize: wardedFonts.md, fontWeight: 'bold' },

  nightActions: { gap: 8 },
  nightLabel: { color: warded.textDim, fontSize: wardedFonts.sm, textAlign: 'center' },

  eventLog: { paddingHorizontal: 14, paddingVertical: 6 },
  eventText: { color: warded.textDim, fontSize: wardedFonts.xs },
  eventLatest: { color: warded.text, fontWeight: '600' },

  // FIX 1: Night transition overlay
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    gap: 12,
  },
  transitionEmoji: { fontSize: 64 },
  transitionText: { color: warded.text, fontSize: wardedFonts.xxl, fontWeight: 'bold', letterSpacing: 4 },
  transitionSub: { color: warded.textDim, fontSize: wardedFonts.md },

  // FIX 5: Night step indicator
  nightStepsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 0,
  },
  nightStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nightStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: warded.bgLight,
    borderWidth: 1,
    borderColor: warded.border,
  },
  nightStepDotActive: {
    backgroundColor: warded.accent,
    borderColor: warded.accent,
  },
  nightStepDotDone: {
    backgroundColor: warded.success,
    borderColor: warded.success,
  },
  nightStepLabel: {
    color: warded.textDark,
    fontSize: 9,
    fontWeight: '600',
  },
  nightStepLabelActive: {
    color: warded.accent,
    fontWeight: 'bold',
  },
  nightStepLabelDone: {
    color: warded.success,
  },
  nightStepConnector: {
    width: 12,
    height: 2,
    backgroundColor: warded.border,
    marginHorizontal: 2,
  },

  gameOverBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 20 },
  victoryBg: { backgroundColor: '#0a1a0a' },
  defeatBg: { backgroundColor: '#1a0a0a' },
  gameOverEmoji: { fontSize: 64 },
  gameOverTitle: { fontSize: wardedFonts.title, fontWeight: 'bold', color: warded.accent, textAlign: 'center' },
  gameOverSub: { fontSize: wardedFonts.md, color: warded.textDim, textAlign: 'center' },
  menuBtn: { backgroundColor: warded.accent + '30', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, borderWidth: 1, borderColor: warded.accent },
  menuBtnText: { color: warded.accent, fontSize: wardedFonts.lg, fontWeight: 'bold' },
});
