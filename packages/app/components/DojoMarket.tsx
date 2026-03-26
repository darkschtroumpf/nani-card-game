import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import DojoCard from './DojoCard';
import type { CardInstance } from '../../engine/src/dojo/types';

interface Props {
  dojoCards: (CardInstance | null)[];
  onBuy: (slotIndex: number) => void;
  onMeditate: () => void;
  onSkip: () => void;
  playerKi: number;
  disabled: boolean;
}

export default function DojoMarket({ dojoCards, onBuy, onMeditate, onSkip, playerKi, disabled }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dojo — Marche</Text>

      {/* Cards */}
      <View style={styles.cardsRow}>
        {dojoCards.map((card, i) => (
          <View key={i} style={styles.cardSlot}>
            {card ? (
              <TouchableOpacity
                onPress={() => !disabled && card.card.kiCost <= playerKi && onBuy(i)}
                disabled={disabled || card.card.kiCost > playerKi}
                activeOpacity={0.7}
              >
                <DojoCard card={card.card} />
                {card.card.kiCost > playerKi && (
                  <View style={styles.cantAfford}>
                    <Text style={styles.cantAffordText}>⚡</Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.emptySlot}>
                <Text style={styles.emptyText}>Vide</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.meditateBtn]}
          onPress={onMeditate}
          disabled={disabled}
        >
          <Text style={styles.actionText}>Mediter</Text>
          <Text style={styles.actionDesc}>+2 Focus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.skipBtn]}
          onPress={onSkip}
          disabled={disabled}
        >
          <Text style={styles.actionText}>Passer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    color: colors.accent,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  cardSlot: {
    alignItems: 'center',
  },
  emptySlot: {
    width: 72,
    height: 104,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textDark,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textDark,
    fontSize: fonts.sizes.sm,
  },
  cantAfford: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantAffordText: {
    fontSize: 24,
    opacity: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  meditateBtn: {
    backgroundColor: colors.secondary,
  },
  skipBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  actionText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  actionDesc: {
    color: colors.textDim,
    fontSize: fonts.sizes.xs,
  },
});
