import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, universeColor } from '../theme';
import type { CardDef, CardInstance, Universe } from '../../engine/src/dojo/types';

interface Props {
  card?: CardDef;
  instance?: CardInstance;
  concealed?: boolean;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
  showKiCost?: boolean;
  disabled?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  fighter: '⚔',
  technique: '✦',
  trap: '⚡',
  equipment: '🛡',
  signature: '★',
};

export default function DojoCard({
  card: cardProp, instance, concealed, selected, onPress, small, showKiCost = true, disabled,
}: Props) {
  const card = instance?.card ?? cardProp;
  const isConcealed = concealed ?? instance?.concealed ?? false;

  if (!card && !isConcealed) return null;

  const w = small ? 52 : 72;
  const h = small ? 76 : 104;

  // Concealed card that we DON'T own (opponent) — show "?"
  if (isConcealed && !instance) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || !onPress}
        style={[styles.card, { width: w, height: h }, styles.concealed, selected && styles.selected]}
        activeOpacity={0.7}
      >
        <Text style={styles.concealedText}>?</Text>
      </TouchableOpacity>
    );
  }

  // Concealed card that we OWN — show card info with "hidden" overlay
  if (isConcealed && instance && card) {
    const uColor = universeColor(card.universe as any);
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || !onPress}
        style={[styles.card, { width: w, height: h, borderColor: uColor, opacity: 0.85 }, selected && styles.selected]}
        activeOpacity={0.7}
      >
        <View style={[styles.header, { backgroundColor: uColor }]}>
          <Text style={styles.headerText}>{card.universe.toUpperCase().slice(0, 3)}</Text>
          <Text style={styles.concealedBadge}>CACHE</Text>
        </View>
        <View style={styles.body}>
          <Text style={[styles.typeIcon, { fontSize: small ? 14 : 18 }]}>{TYPE_ICONS[card.type] ?? ''}</Text>
          <Text style={[styles.name, { fontSize: small ? 7 : 9 }]} numberOfLines={2}>{card.name}</Text>
        </View>
        {card.type === 'fighter' && (
          <View style={styles.footer}>
            <Text style={styles.statAtk}>{card.atk}</Text>
            <Text style={styles.statSep}>/</Text>
            <Text style={styles.statHp}>{card.hp}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (!card) return null;

  const uColor = universeColor(card.universe as any);
  const typeIcon = TYPE_ICONS[card.type] ?? '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.card,
        { width: w, height: h, borderColor: uColor },
        selected && styles.selected,
      ]}
      activeOpacity={0.7}
    >
      {/* Header: universe + ki cost */}
      <View style={[styles.header, { backgroundColor: uColor }]}>
        <Text style={styles.headerText} numberOfLines={1}>
          {card.universe.toUpperCase().slice(0, 3)}
        </Text>
        {showKiCost && (
          <Text style={styles.kiCost}>{card.kiCost}</Text>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={[styles.typeIcon, { fontSize: small ? 14 : 18 }]}>{typeIcon}</Text>
        <Text style={[styles.name, { fontSize: small ? 7 : 9 }]} numberOfLines={2}>
          {card.name}
        </Text>
      </View>

      {/* Footer: stats */}
      <View style={styles.footer}>
        {card.type === 'fighter' && (
          <>
            <Text style={styles.statAtk}>{card.atk}</Text>
            <Text style={styles.statSep}>/</Text>
            <Text style={styles.statHp}>{card.hp}</Text>
          </>
        )}
        {card.type === 'equipment' && (
          <Text style={styles.statBonus}>
            {card.atkBonus ? `+${card.atkBonus}` : ''}{card.hpBonus ? ` +${card.hpBonus}♥` : ''}
          </Text>
        )}
        {card.type === 'technique' && (
          <Text style={[styles.effectText, { fontSize: small ? 6 : 7 }]} numberOfLines={1}>
            {card.effect}
          </Text>
        )}
        {card.type === 'signature' && (
          <Text style={styles.sigLabel}>SIG</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: colors.bgLight,
    overflow: 'hidden',
  },
  concealed: {
    borderColor: colors.textDark,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  concealedText: {
    color: colors.textDim,
    fontSize: 28,
    fontWeight: 'bold',
  },
  concealedBadge: {
    color: '#fff',
    fontSize: 6,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  selected: {
    borderColor: colors.accent,
    borderWidth: 3,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  headerText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  kiCost: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    width: 14,
    height: 14,
    textAlign: 'center',
    lineHeight: 14,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  typeIcon: {
    marginBottom: 2,
  },
  name: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    gap: 2,
  },
  statAtk: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statSep: {
    color: colors.textDim,
    fontSize: 10,
  },
  statHp: {
    color: colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statBonus: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: 'bold',
  },
  effectText: {
    color: colors.textDim,
    textAlign: 'center',
  },
  sigLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
