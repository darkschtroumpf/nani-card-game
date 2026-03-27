import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
import DojoCard from './DojoCard';
import type { FieldSlot, PublicFieldSlot, CardDef } from '../../engine/src/dojo/types';

interface Props {
  slot: FieldSlot | PublicFieldSlot;
  isOpponent?: boolean;
  isTargetable?: boolean;
  onPress?: () => void;
  small?: boolean;
}

function isPublicSlot(slot: any): slot is PublicFieldSlot {
  return 'hasFighter' in slot;
}

export default function FighterSlotComponent({ slot, isOpponent, isTargetable, onPress, small }: Props) {
  const empty = isPublicSlot(slot) ? !slot.hasFighter : !slot.fighter;

  if (empty) {
    return (
      <TouchableOpacity
        style={[styles.empty, small && styles.emptySmall, isTargetable && styles.targetable]}
        onPress={isTargetable ? onPress : undefined}
        disabled={!isTargetable}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyText}>+</Text>
      </TouchableOpacity>
    );
  }

  if (isPublicSlot(slot)) {
    // Opponent view
    return (
      <TouchableOpacity
        onPress={isTargetable ? onPress : undefined}
        disabled={!isTargetable}
        activeOpacity={0.7}
        style={isTargetable ? styles.targetableWrap : undefined}
      >
        <DojoCard
          card={slot.fighter ?? undefined}
          concealed={slot.concealed}
          small={small}
          showKiCost={false}
        />
        {slot.equipment && (
          <View style={styles.equipBadge} pointerEvents="none">
            <Text style={styles.equipText}>🛡</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Own view (FieldSlot)
  const fighter = slot.fighter!;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={isTargetable ? styles.targetableWrap : undefined}
    >
      <DojoCard
        instance={fighter}
        small={small}
        showKiCost={false}
      />
      {fighter.attachedEquipment && (
        <View style={styles.equipBadge} pointerEvents="none">
          <Text style={styles.equipText}>🛡+{fighter.attachedEquipment.card.atkBonus || fighter.attachedEquipment.card.hpBonus}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  empty: {
    width: 72,
    height: 104,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textDark,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySmall: {
    width: 36,
    height: 50,
  },
  emptyText: {
    color: colors.textDark,
    fontSize: 20,
  },
  targetable: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  targetableWrap: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 2,
  },
  equipBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.equipment,
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  equipText: {
    fontSize: 8,
    color: colors.bg,
    fontWeight: 'bold',
  },
});
