import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts } from '../theme';
import type { GameLogEntry } from '../../engine/src/types';

interface GameLogProps {
  entries: GameLogEntry[];
  maxHeight?: number;
}

export default function GameLog({ entries, maxHeight = 120 }: GameLogProps) {
  return (
    <View style={[styles.container, { maxHeight }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {entries.slice(-10).map((entry, i) => (
          <Text key={i} style={styles.entry}>
            <Text style={styles.turn}>T{entry.turnNumber}</Text>{' '}
            {entry.details}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    borderRadius: 8,
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 2,
  },
  entry: {
    color: colors.textDim,
    fontSize: fonts.sizes.xs,
    lineHeight: 16,
  },
  turn: {
    color: colors.accent,
    fontWeight: 'bold',
  },
});
