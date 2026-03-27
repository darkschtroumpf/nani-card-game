import { View, StyleSheet } from 'react-native';
import FighterSlot from './FighterSlot';
import TrapSlot from './TrapSlot';
import type { FieldSlot, PublicFieldSlot, TrapSlot as TrapSlotType } from '../../engine/src/dojo/types';

interface Props {
  field: (FieldSlot | PublicFieldSlot)[];
  traps: (TrapSlotType | boolean)[];
  isOpponent?: boolean;
  targetableSlots?: number[];
  targetableTrapSlots?: number[];
  onSlotPress?: (slot: number) => void;
  onTrapSlotPress?: (slot: number) => void;
  small?: boolean;
}

export default function FieldView({
  field, traps, isOpponent, targetableSlots, targetableTrapSlots,
  onSlotPress, onTrapSlotPress, small,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Traps row */}
      <View style={styles.trapRow}>
        {traps.map((trap, i) => {
          const hasTrap = typeof trap === 'boolean' ? trap : trap.card !== null;
          const isTargetable = targetableTrapSlots?.includes(i) ?? false;
          return (
            <TrapSlot
              key={`trap-${i}`}
              hasTrap={hasTrap}
              small={small}
              isTargetable={isTargetable}
              onPress={isTargetable ? () => onTrapSlotPress?.(i) : undefined}
            />
          );
        })}
      </View>

      {/* Fighters row */}
      <View style={styles.fighterRow}>
        {field.map((slot, i) => (
          <FighterSlot
            key={`fighter-${i}`}
            slot={slot}
            isOpponent={isOpponent}
            isTargetable={targetableSlots?.includes(i)}
            onPress={() => onSlotPress?.(i)}
            small={small}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  trapRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  fighterRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
});
