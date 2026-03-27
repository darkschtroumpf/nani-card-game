import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, universeColor } from '../theme';
import DojoCard from '../components/DojoCard';
import type { Archetype, CardDef } from '../../engine/src/dojo/types';
import { SENSEI_DECKS, ALL_CARDS, ALL_SIGNATURES } from '../../engine/src/dojo/cards';

const ARCHETYPES: { id: Archetype; name: string; emoji: string; sig: string }[] = [
  { id: 'shonen_blitz', name: 'Shonen Blitz', emoji: '🔥', sig: 'BANKAI!' },
  { id: 'magical_ward', name: 'Magical Ward', emoji: '✨', sig: 'Constellation Celeste' },
  { id: 'mecha_fortress', name: 'Mecha Fortress', emoji: '🤖', sig: 'Synchronisation Eva' },
  { id: 'isekai_thief', name: 'Isekai Thief', emoji: '🌀', sig: 'Respawn' },
  { id: 'seinen_assassin', name: 'Seinen Assassin', emoji: '🗡', sig: 'Death Note' },
];

export default function DeckBuilderScreen() {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('shonen_blitz');

  const deckCardIds = SENSEI_DECKS[selectedArchetype];
  const deckCards: CardDef[] = deckCardIds.map(id => ALL_CARDS.find(c => c.id === id)!).filter(Boolean);

  const fighters = deckCards.filter(c => c.type === 'fighter');
  const techniques = deckCards.filter(c => c.type === 'technique');
  const traps = deckCards.filter(c => c.type === 'trap');
  const equipment = deckCards.filter(c => c.type === 'equipment');
  const signatures = deckCards.filter(c => c.type === 'signature');

  const arch = ARCHETYPES.find(a => a.id === selectedArchetype)!;
  const uColor = universeColor(selectedArchetype.split('_')[0] as any);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Deck Builder</Text>

        {/* Archetype tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabRow}>
            {ARCHETYPES.map(a => (
              <TouchableOpacity
                key={a.id}
                style={[
                  styles.tab,
                  selectedArchetype === a.id && { backgroundColor: universeColor(a.id.split('_')[0] as any) },
                ]}
                onPress={() => setSelectedArchetype(a.id)}
              >
                <Text style={styles.tabEmoji}>{a.emoji}</Text>
                <Text style={[styles.tabText, selectedArchetype === a.id && styles.tabTextActive]}>
                  {a.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Deck header */}
        <View style={[styles.deckHeader, { borderLeftColor: uColor }]}>
          <Text style={styles.deckName}>{arch.emoji} {arch.name}</Text>
          <Text style={styles.deckSig}>Signature: {arch.sig}</Text>
          <Text style={styles.deckCount}>{deckCardIds.length} cartes</Text>
        </View>

        {/* Signatures */}
        {signatures.length > 0 && (
          <CardSection title="Signature" cards={signatures} />
        )}

        {/* Fighters */}
        {fighters.length > 0 && (
          <CardSection title={`Fighters (${fighters.length})`} cards={fighters} />
        )}

        {/* Techniques */}
        {techniques.length > 0 && (
          <CardSection title={`Techniques (${techniques.length})`} cards={techniques} />
        )}

        {/* Traps */}
        {traps.length > 0 && (
          <CardSection title={`Pieges (${traps.length})`} cards={traps} />
        )}

        {/* Equipment */}
        {equipment.length > 0 && (
          <CardSection title={`Equipements (${equipment.length})`} cards={equipment} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CardSection({ title, cards }: { title: string; cards: CardDef[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cardsRow}>
        {cards.map((card, i) => (
          <View key={`${card.id}-${i}`} style={styles.cardWrap}>
            <DojoCard card={card} />
            <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: fonts.sizes.xxl, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 16 },

  tabScroll: { marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.bgLight },
  tabEmoji: { fontSize: 16 },
  tabText: { color: colors.textDim, fontSize: fonts.sizes.sm, fontWeight: '600' },
  tabTextActive: { color: colors.text },

  deckHeader: { backgroundColor: colors.bgLight, borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, gap: 4 },
  deckName: { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: 'bold' },
  deckSig: { color: colors.accent, fontSize: fonts.sizes.md },
  deckCount: { color: colors.textDim, fontSize: fonts.sizes.sm },

  section: { marginBottom: 20 },
  sectionTitle: { color: colors.textDim, fontSize: fonts.sizes.md, fontWeight: '600', marginBottom: 8 },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardWrap: { alignItems: 'center', gap: 4 },
  cardName: { color: colors.textDim, fontSize: 8, width: 72, textAlign: 'center' },
});
