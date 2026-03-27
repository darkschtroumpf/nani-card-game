import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fonts } from '../theme';
import type { LogEntry } from '../../engine/src/dojo/types';

interface Props {
  entries: LogEntry[];
  maxVisible?: number;
}

export default function MessageFeed({ entries, maxVisible = 3 }: Props) {
  const recent = entries.slice(-maxVisible);

  if (recent.length === 0) return null;

  return (
    <View style={styles.container}>
      {recent.map((entry, i) => {
        const isLatest = i === recent.length - 1;
        return (
          <Text
            key={`${entry.turn}-${entry.action}-${i}`}
            style={[
              styles.message,
              isLatest && styles.messageLatest,
              !isLatest && styles.messageOld,
            ]}
            numberOfLines={2}
          >
            {entry.detail}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    paddingVertical: 4,
  },
  message: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  messageLatest: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
  },
  messageOld: {
    opacity: 0.5,
    fontSize: fonts.sizes.xs,
  },
});
