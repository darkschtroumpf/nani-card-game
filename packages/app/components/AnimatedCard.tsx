import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';
import type { Card as CardType, Universe } from '../../engine/src/types';

const UNIVERSE_LABELS: Record<Universe, string> = {
  shonen: 'SHONEN',
  magical: 'MAGICAL',
  mecha: 'MECHA',
  isekai: 'ISEKAI',
  seinen: 'SEINEN',
};

interface AnimatedCardProps {
  card?: CardType;
  faceDown?: boolean;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
  flipIn?: boolean;      // animate flip from back to front
  shake?: boolean;        // shake animation (damage)
  glow?: boolean;         // glow effect (win)
  delay?: number;         // delay before animation starts
}

export default function AnimatedCard({
  card,
  faceDown,
  selected,
  onPress,
  small,
  flipIn,
  shake,
  glow,
  delay = 0,
}: AnimatedCardProps) {
  const flipProgress = useSharedValue(faceDown || flipIn ? 0 : 1);
  const shakeX = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (flipIn) {
      flipProgress.value = 0;
      setTimeout(() => {
        flipProgress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      }, delay);
    }
  }, [flipIn, delay]);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake]);

  useEffect(() => {
    if (glow) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 }),
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 400 }),
      );
    }
  }, [glow]);

  useEffect(() => {
    if (selected) {
      scaleValue.value = withSpring(1.08);
    } else {
      scaleValue.value = withSpring(1);
    }
  }, [selected]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: scaleValue.value },
      { perspective: 800 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
    opacity: flipProgress.value > 0.5 ? 1 : 0,
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: scaleValue.value },
      { perspective: 800 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: flipProgress.value < 0.5 ? 1 : 0,
    backfaceVisibility: 'hidden' as const,
    position: 'absolute' as const,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const size = small ? styles.cardSmall : styles.card;
  const universeColor = card ? colors[card.universe] : colors.textDim;
  const isSpecial = card && (card.value === 1 || card.value === 7);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      style={[size, selected && styles.selectedOffset]}
    >
      {/* Glow overlay */}
      {glow && (
        <Animated.View style={[styles.glowOverlay, glowStyle, { borderColor: colors.accent }]} />
      )}

      {/* Front face */}
      <Animated.View
        style={[
          size,
          styles.cardFace,
          { borderColor: selected ? colors.accent : universeColor },
          selected && styles.selectedBorder,
          frontStyle,
        ]}
      >
        {card && (
          <>
            <Text style={[styles.universeLabel, { color: universeColor }]}>
              {UNIVERSE_LABELS[card.universe]}
            </Text>
            <Text style={[small ? styles.valueSmall : styles.value, { color: universeColor }]}>
              {card.value}
            </Text>
            {card.value === 1 && <Text style={styles.specialLabel}>OUTSIDER</Text>}
            {card.value === 7 && (
              <Text style={[styles.specialLabel, { color: colors.accent }]}>ULTRA</Text>
            )}
          </>
        )}
      </Animated.View>

      {/* Back face */}
      <Animated.View style={[size, styles.cardBack, backStyle]}>
        <Text style={styles.cardBackText}>?</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 70,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSmall: {
    width: 50,
    height: 72,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFace: {
    backgroundColor: colors.bgLight,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackText: {
    fontSize: 28,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  selectedOffset: {
    transform: [{ translateY: -10 }],
  },
  selectedBorder: {
    borderWidth: 3,
  },
  universeLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    letterSpacing: 1,
    position: 'absolute',
    top: 5,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  valueSmall: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  specialLabel: {
    position: 'absolute',
    bottom: 5,
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.textDim,
    letterSpacing: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.accent,
  },
});
