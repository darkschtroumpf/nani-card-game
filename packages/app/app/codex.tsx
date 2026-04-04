import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { warded, wardedFonts, wardColor, demonColor, WARD_SYMBOLS, DEMON_SYMBOLS } from '../theme-warded';
import { WARD_COSTS, WARD_COMBOS, TRIPLE_WARD_COMBOS, DEMON_TYPES, WARD_LINK_PROFILES } from '../../engine/src/warded/constants';
import type { WardType, DemonType } from '../../engine/src/warded/types';

const BG_NIGHT = require('../assets/images/bg_night.png');

const WARD_IMAGES: Record<string, any> = {
  fire: require('../assets/images/ward_fire.png'),
  stone: require('../assets/images/ward_stone.png'),
  wind: require('../assets/images/ward_wind.png'),
  light: require('../assets/images/ward_light.png'),
  bone: require('../assets/images/ward_bone.png'),
};

const DEMON_IMAGES: Record<string, any> = {
  flame: require('../assets/images/demon_flame.png'),
  wood: require('../assets/images/demon_wood.png'),
  wind: require('../assets/images/demon_wind.png'),
  water: require('../assets/images/demon_water.png'),
  rock: require('../assets/images/demon_rock.png'),
  mind: require('../assets/images/demon_mind.png'),
};

const WARD_NAMES: Record<WardType, string> = {
  fire: 'Feu', stone: 'Pierre', wind: 'Vent', light: 'Lumière', bone: 'Os',
};

const DEMON_NAMES: Record<DemonType, string> = {
  flame: 'Flamme', wood: 'Bois', wind: 'Vent', water: 'Eau', rock: 'Roche', mind: 'Esprit',
};

const WARD_PASSIVES_FR: Record<WardType, string> = {
  fire: 'Inflige 1 dégât à tous les démons de ce lieu chaque vague',
  stone: '+2 défense à ce lieu',
  wind: 'Redirige 1 démon non-verrouillé vers un lieu adjacent avant le combat',
  light: 'Révèle les types exacts de démons ciblant ce lieu',
  bone: "Soigne 1 population à l'aube (si en dessous du max)",
};

const WARD_ACTIVES_FR: Record<WardType, { name: string; effect: string }> = {
  fire: { name: 'Brasier', effect: 'Inflige 3 dégâts à 1 démon' },
  stone: { name: 'Rempart', effect: '0 dégâts de démons cette vague' },
  wind: { name: 'Bourrasque', effect: "Redirige jusqu'à 3 démons non-verrouillés" },
  light: { name: 'Éclat', effect: '1 dégât à tous + réarrange 1 démon' },
  bone: { name: 'Soin', effect: 'Soigne 2 population (max)' },
};

type Tab = 'wards' | 'demons' | 'combos';

export default function CodexScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('wards');

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={BG_NIGHT} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.15 }}>
        <View style={styles.bgOverlay} />
      </ImageBackground>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CODEX</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabs}>
        {(['wards', 'demons', 'combos'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'wards' ? 'Runes' : t === 'demons' ? 'Demons' : 'Combos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'wards' && (
          <>
            {(['fire', 'stone', 'wind', 'light', 'bone'] as WardType[]).map(w => {
              const cost = WARD_COSTS[w];
              const passive = WARD_PASSIVES_FR[w];
              const active = WARD_ACTIVES_FR[w];
              const link = WARD_LINK_PROFILES[w];
              return (
                <View key={w} style={[styles.card, { borderColor: wardColor(w) + '60' }]}>
                  <View style={styles.cardRow}>
                    <Image source={WARD_IMAGES[w]} style={styles.cardImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: wardColor(w) }]}>
                        {WARD_SYMBOLS[w]} {WARD_NAMES[w]}
                      </Text>
                      <Text style={styles.cardCost}>
                        {cost.wood > 0 ? `${cost.wood} Bois ` : ''}{cost.ink > 0 ? `${cost.ink} Encre ` : ''}{cost.food > 0 ? `${cost.food} Nourriture` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardSection}>
                    <Text style={styles.labelPassive}>Passif</Text>
                    <Text style={styles.cardDesc}>{passive}</Text>
                  </View>
                  <View style={styles.cardSection}>
                    <Text style={styles.labelActive}>Actif — {active.name}</Text>
                    <Text style={styles.cardDesc}>{active.effect}</Text>
                  </View>
                  <View style={styles.cardSection}>
                    <Text style={styles.labelLink}>Liens: G={link.leftLinks} D={link.rightLinks}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === 'demons' && (
          <>
            {DEMON_TYPES.map(d => (
              <View key={d.type} style={[styles.card, { borderColor: demonColor(d.type) + '60' }]}>
                <View style={styles.cardRow}>
                  <Image source={DEMON_IMAGES[d.type]} style={styles.cardImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: demonColor(d.type) }]}>
                      {DEMON_SYMBOLS[d.type]} {DEMON_NAMES[d.type]}
                    </Text>
                    <Text style={styles.cardCost}>Force: {d.baseStrength} | Ciblage: {d.targeting}</Text>
                  </View>
                </View>
                <View style={styles.cardSection}>
                  <Text style={styles.cardDesc}>{d.special}</Text>
                </View>
                {d.isLocked && <Text style={styles.badge}>Verrouillé (non-redirigeable)</Text>}
                {d.isBoss && <Text style={styles.badge}>Boss (immunisé à la redirection)</Text>}
              </View>
            ))}
          </>
        )}

        {tab === 'combos' && (
          <>
            <Text style={styles.sectionTitle}>Combos doubles</Text>
            {WARD_COMBOS.map((c, i) => (
              <View key={i} style={[styles.card, { borderColor: warded.accent + '40' }]}>
                <Text style={[styles.cardTitle, { color: warded.accent }]}>{c.name}</Text>
                <Text style={styles.comboWards}>
                  {WARD_SYMBOLS[c.wards[0]]} {WARD_NAMES[c.wards[0]]} → {WARD_SYMBOLS[c.wards[1]]} {WARD_NAMES[c.wards[1]]}
                </Text>
                <Text style={styles.comboBond}>Lien minimum: {c.minBondStrength}</Text>
                <View style={styles.cardSection}>
                  <Text style={styles.labelPassive}>Passif</Text>
                  <Text style={styles.cardDesc}>{c.passiveEffect}</Text>
                </View>
                <View style={styles.cardSection}>
                  <Text style={styles.labelActive}>Actif — {c.activeName}</Text>
                  <Text style={styles.cardDesc}>{c.activeEffect}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Combos triples (Ch.8+)</Text>
            {TRIPLE_WARD_COMBOS.map((c, i) => (
              <View key={i} style={[styles.card, { borderColor: '#9b30ff40' }]}>
                <Text style={[styles.cardTitle, { color: '#9b30ff' }]}>{c.name}</Text>
                <Text style={styles.comboWards}>
                  {WARD_SYMBOLS[c.wards[0]]} → {WARD_SYMBOLS[c.wards[1]]} → {WARD_SYMBOLS[c.wards[2]]}
                </Text>
                <Text style={styles.comboBond}>Maillage minimum: {c.minTotalMesh}</Text>
                <View style={styles.cardSection}>
                  <Text style={styles.labelPassive}>Passif</Text>
                  <Text style={styles.cardDesc}>{c.passiveEffect}</Text>
                </View>
                <View style={styles.cardSection}>
                  <Text style={styles.labelActive}>Actif — {c.activeName}</Text>
                  <Text style={styles.cardDesc}>{c.activeEffect}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: warded.bg },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { color: warded.textDim, fontSize: wardedFonts.md },
  title: { color: warded.accent, fontSize: wardedFonts.xl, fontWeight: 'bold', letterSpacing: 3 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: warded.border },
  tabActive: { borderColor: warded.accent, backgroundColor: warded.accent + '15' },
  tabText: { color: warded.textDim, fontSize: wardedFonts.sm, fontWeight: 'bold' },
  tabTextActive: { color: warded.accent },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  card: { backgroundColor: warded.bgCard, borderRadius: 12, padding: 12, borderWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardImg: { width: 48, height: 48, borderRadius: 8 },
  cardTitle: { fontSize: wardedFonts.lg, fontWeight: 'bold' },
  cardCost: { color: warded.textDim, fontSize: wardedFonts.xs, marginTop: 2 },
  cardSection: { marginTop: 6 },
  cardDesc: { color: warded.text, fontSize: wardedFonts.sm, lineHeight: 18 },
  labelPassive: { color: '#4CAF50', fontSize: wardedFonts.xs, fontWeight: 'bold', marginBottom: 2 },
  labelActive: { color: '#FF9800', fontSize: wardedFonts.xs, fontWeight: 'bold', marginBottom: 2 },
  labelLink: { color: warded.textDim, fontSize: wardedFonts.xs },
  badge: { color: '#FF5252', fontSize: wardedFonts.xs, fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { color: warded.text, fontSize: wardedFonts.lg, fontWeight: 'bold', marginBottom: 4 },
  comboWards: { color: warded.textDim, fontSize: wardedFonts.sm, marginTop: 2 },
  comboBond: { color: warded.textDim, fontSize: wardedFonts.xs, marginTop: 2 },
});
