import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  lp: number;
  maxLp?: number;
  ki: number;
  maxKi: number;
  focus: number;
  compact?: boolean;
}

export default function ResourceBar({ lp, maxLp = 50, ki, maxKi, focus, compact }: Props) {
  const lpPct = Math.max(0, Math.min(100, (lp / maxLp) * 100));
  const lpColor = lpPct > 50 ? colors.success : lpPct > 25 ? colors.warning : colors.danger;

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <Text style={[styles.compactText, { color: lpColor }]}>♥{lp}</Text>
        <Text style={[styles.compactText, { color: colors.ki }]}>⚡{ki}</Text>
        <Text style={[styles.compactText, { color: colors.focus }]}>✦{focus}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* LP bar */}
      <View style={styles.lpRow}>
        <Text style={styles.label}>♥</Text>
        <View style={styles.lpBar}>
          <View style={[styles.lpFill, { width: `${lpPct}%`, backgroundColor: lpColor }]} />
        </View>
        <Text style={[styles.lpText, { color: lpColor }]}>{lp}/{maxLp}</Text>
      </View>

      {/* Ki pips + Focus */}
      <View style={styles.bottomRow}>
        <View style={styles.kiRow}>
          <Text style={styles.label}>⚡</Text>
          {Array.from({ length: maxKi }).map((_, i) => (
            <View
              key={i}
              style={[styles.kiPip, i < ki ? styles.kiPipFilled : styles.kiPipEmpty]}
            />
          ))}
          <Text style={styles.kiText}>{ki}/{maxKi}</Text>
        </View>
        <View style={styles.focusRow}>
          <Text style={styles.label}>✦</Text>
          <Text style={styles.focusText}>{focus}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 6,
  },
  compactText: {
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  lpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
  },
  lpBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  lpFill: {
    height: '100%',
    borderRadius: 5,
  },
  lpText: {
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
    width: 45,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  kiPip: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  kiPipFilled: {
    backgroundColor: colors.ki,
  },
  kiPipEmpty: {
    backgroundColor: 'rgba(66,165,245,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(66,165,245,0.4)',
  },
  kiText: {
    color: colors.ki,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  focusText: {
    color: colors.focus,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
});
