import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

interface PlayerHUDProps {
  name: string;
  plotArmor: number;
  shields: number;
  cardCount: number;
  isCurrentPlayer?: boolean;
  eliminated?: boolean;
  identityRevealed?: boolean;
  identityType?: string | null;
}

export default function PlayerHUD({
  name,
  plotArmor,
  shields,
  cardCount,
  isCurrentPlayer,
  eliminated,
  identityRevealed,
  identityType,
}: PlayerHUDProps) {
  return (
    <View style={[styles.container, isCurrentPlayer && styles.current, eliminated && styles.eliminated]}>
      <Text style={[styles.name, eliminated && styles.textEliminated]} numberOfLines={1}>
        {name}
        {eliminated ? ' (K.O.)' : ''}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>PA</Text>
          <Text style={[styles.statValue, plotArmor <= 1 && styles.danger]}>
            {plotArmor}
          </Text>
        </View>

        {shields > 0 && (
          <View style={styles.stat}>
            <Text style={[styles.statIcon, { color: colors.shield }]}>B</Text>
            <Text style={styles.statValue}>{shields}</Text>
          </View>
        )}

        <View style={styles.stat}>
          <Text style={styles.statIcon}>C</Text>
          <Text style={styles.statValue}>{cardCount}</Text>
        </View>
      </View>

      {identityRevealed && identityType && (
        <Text style={styles.identity}>{identityType}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    borderRadius: 8,
    padding: 8,
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  current: {
    borderColor: colors.accent,
  },
  eliminated: {
    opacity: 0.4,
  },
  name: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textEliminated: {
    textDecorationLine: 'line-through',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    color: colors.plotArmor,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  statValue: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  danger: {
    color: colors.danger,
  },
  identity: {
    color: colors.warning,
    fontSize: fonts.sizes.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
