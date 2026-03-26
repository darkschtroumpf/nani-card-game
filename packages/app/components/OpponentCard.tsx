import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';

const BOT_AVATARS: Record<string, { emoji: string; color: string }> = {
  'Goku-bot': { emoji: '🔥', color: colors.shonen },
  'Sailor-bot': { emoji: '✨', color: colors.magical },
  'Eva-bot': { emoji: '🤖', color: colors.mecha },
  'Kirito-bot': { emoji: '⚡', color: colors.isekai },
  'Light-bot': { emoji: '🌑', color: colors.seinen },
};

interface OpponentCardProps {
  name: string;
  plotArmor: number;
  cardCount: number;
  shields: number;
  isCurrentTurn: boolean;
  eliminated: boolean;
  identityRevealed: boolean;
  identityType: string | null;
  onPress?: () => void;
  selectable?: boolean;
}

export default function OpponentCard({
  name,
  plotArmor,
  cardCount,
  shields,
  isCurrentTurn,
  eliminated,
  identityRevealed,
  identityType,
  onPress,
  selectable,
}: OpponentCardProps) {
  const avatar = BOT_AVATARS[name] ?? { emoji: '👤', color: colors.textDim };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentTurn && styles.activeBorder,
        eliminated && styles.eliminated,
        selectable && styles.selectable,
      ]}
      onPress={onPress}
      disabled={!selectable || eliminated}
      activeOpacity={selectable ? 0.7 : 1}
    >
      <View style={[styles.avatar, { borderColor: avatar.color }]}>
        <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
      </View>

      <Text style={[styles.name, eliminated && styles.nameEliminated]} numberOfLines={1}>
        {name}
      </Text>

      <View style={styles.statsRow}>
        <Text style={[styles.stat, plotArmor <= 1 && styles.statDanger]}>
          PA {plotArmor}
        </Text>
        {shields > 0 && (
          <Text style={styles.statShield}>B{shields}</Text>
        )}
        <Text style={styles.statCards}>{cardCount}c</Text>
      </View>

      {identityRevealed && identityType && (
        <Text style={styles.identity}>{identityType}</Text>
      )}
      {eliminated && <Text style={styles.koText}>K.O.</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    width: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeBorder: {
    borderColor: colors.accent,
  },
  eliminated: {
    opacity: 0.35,
  },
  selectable: {
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  name: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  nameEliminated: {
    textDecorationLine: 'line-through',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  stat: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  statDanger: {
    color: colors.danger,
  },
  statShield: {
    color: colors.shield,
    fontSize: 10,
    fontWeight: '600',
  },
  statCards: {
    color: colors.textDim,
    fontSize: 10,
  },
  identity: {
    color: colors.warning,
    fontSize: 8,
    marginTop: 2,
    fontStyle: 'italic',
  },
  koText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
