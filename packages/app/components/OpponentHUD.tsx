import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, universeColor } from '../theme';
import ResourceBar from './ResourceBar';
import type { OpponentView, Archetype } from '../../engine/src/dojo/types';

interface Props {
  opponent: OpponentView;
  isCurrentTurn: boolean;
  isTargetable: boolean;
  onPress?: () => void;
}

const ARCHETYPE_EMOJI: Record<Archetype, string> = {
  shonen_blitz: '🔥',
  magical_ward: '✨',
  mecha_fortress: '🤖',
  isekai_thief: '🌀',
  seinen_assassin: '🗡',
};

export default function OpponentHUD({ opponent, isCurrentTurn, isTargetable, onPress }: Props) {
  const dead = opponent.lp <= 0;
  const borderColor = isCurrentTurn ? colors.accent : isTargetable ? colors.warning : 'transparent';

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor }, dead && styles.dead]}
      onPress={isTargetable ? onPress : undefined}
      disabled={!isTargetable || dead}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{ARCHETYPE_EMOJI[opponent.archetype]}</Text>
        <Text style={styles.name} numberOfLines={1}>{opponent.name}</Text>
        <Text style={styles.handCount}>🃏{opponent.handSize}</Text>
      </View>

      {/* Resources */}
      <ResourceBar
        lp={opponent.lp}
        ki={opponent.ki}
        maxKi={opponent.maxKi}
        focus={opponent.focus}
        compact
      />

      {/* Mini board */}
      <View style={styles.boardRow}>
        {opponent.field.map((slot, i) => (
          <View key={i} style={[styles.miniSlot, slot.hasFighter && styles.miniSlotFilled]}>
            {slot.hasFighter && (
              <Text style={styles.miniSlotText}>{slot.concealed ? '?' : (slot.fighter?.atk ?? '')}</Text>
            )}
          </View>
        ))}
        <View style={styles.miniDivider} />
        {opponent.traps.map((t, i) => (
          <View key={`t${i}`} style={[styles.miniTrap, t && styles.miniTrapActive]}>
            {t && <Text style={styles.miniTrapText}>⚡</Text>}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    padding: 10,
    width: 170,
    borderWidth: 2,
    gap: 6,
  },
  dead: {
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 18,
  },
  name: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    flex: 1,
  },
  handCount: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
  },
  boardRow: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  miniSlot: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSlotFilled: {
    backgroundColor: 'rgba(33,150,243,0.3)',
    borderColor: colors.fighter,
  },
  miniSlotText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  miniDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.textDark,
    marginHorizontal: 2,
  },
  miniTrap: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniTrapActive: {
    borderColor: colors.trap,
    backgroundColor: 'rgba(239,83,80,0.2)',
  },
  miniTrapText: {
    fontSize: 7,
  },
});
