import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { colors, fonts, universeColor } from '../theme';
import ResourceBar from './ResourceBar';
import BotBubble from './BotBubble';
import type { OpponentView, Archetype } from '../../engine/src/dojo/types';

interface Props {
  opponent: OpponentView;
  isCurrentTurn: boolean;
  isTargetable: boolean;
  onPress?: () => void;
  bubbleMessage?: string | null;
  bubbleType?: 'action' | 'reaction' | 'nani';
}

const ARCHETYPE_EMOJI: Record<Archetype, string> = {
  shonen_blitz: '🔥',
  magical_ward: '✨',
  mecha_fortress: '🤖',
  isekai_thief: '🌀',
  seinen_assassin: '🗡',
};

const ARCHETYPE_SHORT: Record<Archetype, string> = {
  shonen_blitz: 'SHO',
  magical_ward: 'MAG',
  mecha_fortress: 'MEC',
  isekai_thief: 'ISE',
  seinen_assassin: 'SEI',
};

export default function OpponentHUD({ opponent, isCurrentTurn, isTargetable, onPress, bubbleMessage, bubbleType }: Props) {
  const dead = opponent.lp <= 0;
  const uColor = universeColor(opponent.archetype.split('_')[0] as any);
  const borderColor = isCurrentTurn ? colors.accent : isTargetable ? colors.warning : uColor + '40';

  // Pulse animation for current turn
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isCurrentTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCurrentTurn]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[styles.container, { borderColor }, dead && styles.dead]}
        onPress={isTargetable ? onPress : undefined}
        disabled={!isTargetable || dead}
        activeOpacity={0.7}
      >
        {/* Bubble */}
        <BotBubble message={bubbleMessage ?? null} type={bubbleType} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{ARCHETYPE_EMOJI[opponent.archetype]}</Text>
          <View style={styles.nameCol}>
            <Text style={styles.name} numberOfLines={1}>{opponent.name}</Text>
            <Text style={[styles.archLabel, { color: uColor }]}>{ARCHETYPE_SHORT[opponent.archetype]}</Text>
          </View>
          <Text style={styles.handCount}>🃏{opponent.handSize}</Text>
        </View>

        {/* LP bar */}
        <View style={styles.lpRow}>
          <View style={styles.lpBarBg}>
            <View style={[styles.lpBarFill, {
              width: `${Math.max(0, Math.min(100, (opponent.lp / 50) * 100))}%`,
              backgroundColor: opponent.lp > 25 ? colors.success : opponent.lp > 10 ? colors.warning : colors.danger,
            }]} />
          </View>
          <Text style={styles.lpText}>{opponent.lp}</Text>
        </View>

        {/* Resources row */}
        <View style={styles.resRow}>
          <Text style={styles.resText}>⚡{opponent.ki}/{opponent.maxKi}</Text>
          <Text style={styles.resText}>✦{opponent.focus}</Text>
        </View>

        {/* Mini board */}
        <View style={styles.boardRow}>
          {opponent.field.map((slot, i) => (
            <View key={i} style={[
              styles.miniSlot,
              slot.hasFighter && styles.miniSlotFilled,
              slot.hasFighter && slot.concealed && styles.miniSlotConcealed,
            ]}>
              {slot.hasFighter && (
                <Text style={styles.miniSlotText}>
                  {slot.concealed ? '?' : (slot.fighter?.atk ?? '')}
                </Text>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    borderRadius: 14,
    padding: 10,
    width: 175,
    borderWidth: 2,
    gap: 5,
  },
  dead: {
    opacity: 0.35,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 20,
  },
  nameCol: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  archLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  handCount: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
  },

  // LP bar
  lpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lpBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  lpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  lpText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'right',
  },

  // Resources
  resRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '600',
  },

  // Mini board
  boardRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  miniSlot: {
    width: 28,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSlotFilled: {
    backgroundColor: 'rgba(33,150,243,0.25)',
    borderColor: colors.fighter,
  },
  miniSlotConcealed: {
    backgroundColor: 'rgba(120,144,156,0.25)',
    borderColor: colors.seinen,
  },
  miniSlotText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  miniDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.textDark,
    marginHorizontal: 3,
  },
  miniTrap: {
    width: 18,
    height: 18,
    borderRadius: 3,
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
    fontSize: 9,
  },
});
