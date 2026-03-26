import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, universeColor } from '../theme';
import type { Archetype } from '../../engine/src/dojo/types';

interface Props {
  selected: Archetype | null;
  onSelect: (a: Archetype) => void;
}

const ARCHETYPES: { id: Archetype; name: string; desc: string; sig: string; emoji: string }[] = [
  { id: 'shonen_blitz', name: 'Shonen Blitz', desc: 'Agressif, burst damage', sig: 'BANKAI!', emoji: '🔥' },
  { id: 'magical_ward', name: 'Magical Ward', desc: 'Equilibre, soin', sig: 'Constellation', emoji: '✨' },
  { id: 'mecha_fortress', name: 'Mecha Fortress', desc: 'Defensif, tanky', sig: 'Eva Sync', emoji: '🤖' },
  { id: 'isekai_thief', name: 'Isekai Thief', desc: 'Versatile, disruption', sig: 'Respawn', emoji: '🌀' },
  { id: 'seinen_assassin', name: 'Seinen Assassin', desc: 'Glass cannon, bluff', sig: 'Death Note', emoji: '🗡' },
];

export default function ArchetypeSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choisis ton archetype</Text>
      {ARCHETYPES.map((a) => {
        const active = selected === a.id;
        const uColor = universeColor(a.id.split('_')[0] as any);
        return (
          <TouchableOpacity
            key={a.id}
            style={[styles.option, active && { borderColor: uColor, backgroundColor: `${uColor}22` }]}
            onPress={() => onSelect(a.id)}
          >
            <Text style={styles.emoji}>{a.emoji}</Text>
            <View style={styles.textCol}>
              <Text style={[styles.name, active && { color: uColor }]}>{a.name}</Text>
              <Text style={styles.desc}>{a.desc}</Text>
            </View>
            <Text style={styles.sig}>{a.sig}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgLight,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 24,
  },
  textCol: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  desc: {
    color: colors.textDim,
    fontSize: fonts.sizes.xs,
  },
  sig: {
    color: colors.accent,
    fontSize: fonts.sizes.xs,
    fontWeight: '600',
  },
});
