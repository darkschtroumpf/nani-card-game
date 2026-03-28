import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import type { CardDef, CardInstance } from '../../engine/src/dojo/types';

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

// Colors by CARD TYPE (same color for all cards of a type)
const TYPE_COLORS: Record<string, string> = {
  fighter: '#2563eb',    // blue
  technique: '#9333ea',  // purple
  trap: '#dc2626',       // red
  equipment: '#d97706',  // amber
  signature: '#f59e0b',  // gold
};

const TYPE_BG: Record<string, string> = {
  fighter: '#1e3a5f',
  technique: '#2d1b4e',
  trap: '#4a1010',
  equipment: '#3d2800',
  signature: '#3d2e00',
};

const TYPE_LABELS: Record<string, string> = {
  fighter: 'FIGHTER',
  technique: 'TECHNIQUE',
  trap: 'PIEGE',
  equipment: 'EQUIP',
  signature: 'SIGNATURE',
};

// Symbols by UNIVERSE (visual identity)
const UNIVERSE_SYMBOLS: Record<string, string> = {
  shonen: '🔥',
  magical: '✨',
  mecha: '⚙',
  isekai: '🌀',
  seinen: '🗡',
};

export default function DojoCard({
  card: cardProp, instance, concealed, selected, onPress, small, showKiCost = true, disabled,
}: Props) {
  const card = instance?.card ?? cardProp;
  const isConcealed = concealed ?? instance?.concealed ?? false;

  if (!card && !isConcealed) return null;

  const w = small ? 56 : 76;
  const h = small ? 82 : 112;

  // Concealed card (opponent) — show "?"
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

  if (!card) return null;

  const typeColor = TYPE_COLORS[card.type] ?? colors.textDim;
  const typeBg = TYPE_BG[card.type] ?? colors.bgLight;
  const uSymbol = UNIVERSE_SYMBOLS[card.universe] ?? '?';
  const isOwned = !!instance;

  // Concealed card (own) — show info with CACHE badge
  if (isConcealed && isOwned) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || !onPress}
        style={[styles.card, { width: w, height: h, borderColor: typeColor, backgroundColor: typeBg, opacity: 0.8 }, selected && styles.selected]}
        activeOpacity={0.7}
      >
        <View style={[styles.header, { backgroundColor: typeColor }]}>
          <Text style={styles.uSymbol}>{uSymbol}</Text>
          <Text style={styles.cacheBadge}>CACHE</Text>
        </View>
        <View style={styles.body}>
          <Text style={[styles.name, { fontSize: small ? 8 : 10 }]} numberOfLines={2}>{card.name}</Text>
        </View>
        {card.type === 'fighter' && (
          <View style={[styles.footer, { backgroundColor: typeColor + '40' }]}>
            <Text style={styles.statAtk}>{card.atk}</Text>
            <Text style={styles.statSep}>/</Text>
            <Text style={styles.statHp}>{card.hp}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.card,
        { width: w, height: h, borderColor: typeColor, backgroundColor: typeBg },
        selected && styles.selected,
      ]}
      activeOpacity={0.7}
    >
      {/* Header: type color + universe symbol + ki cost */}
      <View style={[styles.header, { backgroundColor: typeColor }]}>
        <Text style={styles.uSymbol}>{uSymbol}</Text>
        <Text style={styles.typeLabel}>{TYPE_LABELS[card.type] ?? ''}</Text>
        {showKiCost && (
          <View style={styles.kiBox}>
            <Text style={styles.kiCost}>{card.kiCost}</Text>
          </View>
        )}
      </View>

      {/* Body: name */}
      <View style={styles.body}>
        <Text style={[styles.name, { fontSize: small ? 8 : 10 }]} numberOfLines={2}>
          {card.name}
        </Text>
      </View>

      {/* Footer: stats */}
      <View style={[styles.footer, { backgroundColor: typeColor + '40' }]}>
        {card.type === 'fighter' && (
          <View style={styles.statsRow}>
            <Text style={styles.statAtk}>⚔{card.atk}</Text>
            <Text style={styles.statHp}>♥{card.hp}</Text>
          </View>
        )}
        {card.type === 'equipment' && (
          <Text style={styles.statBonus}>
            {card.atkBonus ? `⚔+${card.atkBonus}` : ''}{card.hpBonus ? ` ♥+${card.hpBonus}` : ''}
          </Text>
        )}
        {card.type === 'technique' && (
          <Text style={[styles.effectText, { fontSize: small ? 7 : 8 }]} numberOfLines={2}>
            {card.effect}
          </Text>
        )}
        {card.type === 'trap' && (
          <Text style={[styles.effectText, { fontSize: small ? 7 : 8 }]} numberOfLines={2}>
            {card.effect}
          </Text>
        )}
        {card.type === 'signature' && (
          <Text style={[styles.effectText, { fontSize: small ? 6 : 7, color: colors.accent }]} numberOfLines={2}>
            {card.effect}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 2,
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
  cacheBadge: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
    paddingHorizontal: 4,
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
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 3,
  },
  uSymbol: {
    fontSize: 11,
  },
  typeLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 7,
    fontWeight: 'bold',
    flex: 1,
  },
  kiBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 7,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kiCost: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  name: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 4,
    minHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statAtk: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: 'bold',
  },
  statSep: {
    color: colors.textDim,
    fontSize: 10,
  },
  statHp: {
    color: colors.success,
    fontSize: 13,
    fontWeight: 'bold',
  },
  statBonus: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: 'bold',
  },
  effectText: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 11,
  },
});
