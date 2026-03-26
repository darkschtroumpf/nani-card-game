import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';
import type { Universe } from '../../engine/src/types';

const UNIVERSES: { key: Universe; label: string }[] = [
  { key: 'shonen', label: 'Shonen' },
  { key: 'magical', label: 'Magical' },
  { key: 'mecha', label: 'Mecha' },
  { key: 'isekai', label: 'Isekai' },
  { key: 'seinen', label: 'Seinen' },
];

interface UniversePickerProps {
  selected: Universe | null;
  onSelect: (universe: Universe) => void;
  label?: string;
}

export default function UniversePicker({ selected, onSelect, label }: UniversePickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {UNIVERSES.map((u) => (
          <TouchableOpacity
            key={u.key}
            style={[
              styles.chip,
              { borderColor: colors[u.key] },
              selected === u.key && { backgroundColor: colors[u.key] },
            ]}
            onPress={() => onSelect(u.key)}
          >
            <Text
              style={[
                styles.chipText,
                selected === u.key && styles.chipTextActive,
              ]}
            >
              {u.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.text,
  },
});
