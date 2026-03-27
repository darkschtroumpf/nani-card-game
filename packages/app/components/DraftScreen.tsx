import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import DojoCard from './DojoCard';
import type { CardDef } from '../../engine/src/dojo/types';

interface Props {
  pool: CardDef[];
  selected: number[];
  onToggle: (index: number) => void;
  onConfirm: () => void;
}

export default function DraftScreen({ pool, selected, onToggle, onConfirm }: Props) {
  const canConfirm = selected.length === 10;
  const remaining = 10 - selected.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensei Draft</Text>
      <Text style={styles.subtitle}>
        Choisis {remaining > 0 ? `encore ${remaining} carte${remaining > 1 ? 's' : ''}` : 'Pret!'}
        {' '}({selected.length}/10)
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(selected.length / 10) * 100}%` }]} />
      </View>

      {/* Cards grid */}
      <ScrollView contentContainerStyle={styles.cardsGrid} showsVerticalScrollIndicator={false}>
        {pool.map((card, i) => {
          const isSelected = selected.includes(i);
          return (
            <TouchableOpacity
              key={`${card.id}-${i}`}
              onPress={() => onToggle(i)}
              style={[
                styles.cardWrapper,
                isSelected && styles.cardSelected,
                !isSelected && selected.length >= 10 && styles.cardDisabled,
              ]}
              activeOpacity={0.7}
            >
              <DojoCard card={card} selected={isSelected} />
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>{selected.indexOf(i) + 1}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Confirm button */}
      <TouchableOpacity
        style={[styles.confirmBtn, !canConfirm && styles.confirmDisabled]}
        onPress={onConfirm}
        disabled={!canConfirm}
      >
        <Text style={styles.confirmText}>
          {canConfirm ? 'Confirmer le deck' : `Selectionne ${remaining} carte${remaining > 1 ? 's' : ''}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
    paddingTop: 8,
  },
  title: {
    color: colors.accent,
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  cardWrapper: {
    borderRadius: 10,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  cardDisabled: {
    opacity: 0.4,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
});
