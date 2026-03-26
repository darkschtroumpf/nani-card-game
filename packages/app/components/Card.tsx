import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';
import type { Card as CardType, Universe } from '../../engine/src/types';

const UNIVERSE_SYMBOLS: Record<Universe, string> = {
  shonen: 'S',
  magical: 'M',
  mecha: 'T',
  isekai: 'I',
  seinen: 'D',
};

const UNIVERSE_LABELS: Record<Universe, string> = {
  shonen: 'SHONEN',
  magical: 'MAGICAL',
  mecha: 'MECHA',
  isekai: 'ISEKAI',
  seinen: 'SEINEN',
};

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export default function Card({ card, faceDown, selected, onPress, small }: CardProps) {
  const size = small ? styles.cardSmall : styles.card;
  const universeColor = card ? colors[card.universe] : colors.textDark;

  if (faceDown || !card) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[size, styles.cardBack, selected && styles.selected]}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <Text style={styles.cardBackText}>?</Text>
      </TouchableOpacity>
    );
  }

  const isSpecial = card.value === 1 || card.value === 7;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        size,
        styles.cardFace,
        { borderColor: universeColor },
        selected && styles.selected,
      ]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.universeLabel, { color: universeColor }]}>
        {UNIVERSE_LABELS[card.universe]}
      </Text>
      <Text
        style={[
          small ? styles.valueSmall : styles.value,
          { color: universeColor },
          isSpecial && styles.valueSpecial,
        ]}
      >
        {card.value}
      </Text>
      {card.value === 1 && (
        <Text style={styles.specialLabel}>OUTSIDER</Text>
      )}
      {card.value === 7 && (
        <Text style={[styles.specialLabel, { color: colors.accent }]}>ULTRA</Text>
      )}
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
    marginHorizontal: 3,
  },
  cardSmall: {
    width: 50,
    height: 72,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  cardFace: {
    backgroundColor: colors.bgLight,
    borderWidth: 2,
  },
  cardBack: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.textDark,
  },
  cardBackText: {
    fontSize: fonts.sizes.xxl,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  selected: {
    borderColor: colors.accent,
    borderWidth: 3,
    transform: [{ translateY: -8 }],
  },
  universeLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    position: 'absolute',
    top: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  valueSmall: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  valueSpecial: {
    textShadowColor: 'rgba(255,215,0,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  specialLabel: {
    position: 'absolute',
    bottom: 4,
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.textDim,
    letterSpacing: 1,
  },
});
