import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

const MATCHUPS = [
  { attacker: 'Shonen', beats: 'Seinen, Magical', color: colors.shonen },
  { attacker: 'Seinen', beats: 'Magical, Isekai', color: colors.seinen },
  { attacker: 'Magical', beats: 'Isekai, Mecha', color: colors.magical },
  { attacker: 'Isekai', beats: 'Mecha, Shonen', color: colors.isekai },
  { attacker: 'Mecha', beats: 'Shonen, Seinen', color: colors.mecha },
];

export default function DominanceChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cycle de dominance (+3)</Text>
      {MATCHUPS.map((m) => (
        <View key={m.attacker} style={styles.row}>
          <Text style={[styles.universe, { color: m.color }]}>{m.attacker}</Text>
          <Text style={styles.arrow}> &gt; </Text>
          <Text style={styles.beats}>{m.beats}</Text>
        </View>
      ))}
      <View style={styles.reminder}>
        <Text style={styles.reminderText}>1 bat 7 | Le 7 double le bonus</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    borderRadius: 8,
    padding: 12,
  },
  title: {
    color: colors.accent,
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  universe: {
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
    width: 60,
  },
  arrow: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
  },
  beats: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
  },
  reminder: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.textDark,
    paddingTop: 4,
  },
  reminderText: {
    color: colors.warning,
    fontSize: fonts.sizes.xs,
    textAlign: 'center',
  },
});
