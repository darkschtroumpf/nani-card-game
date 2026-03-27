import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface Props {
  hasTrap: boolean;
  small?: boolean;
  isTargetable?: boolean;
  onPress?: () => void;
}

export default function TrapSlot({ hasTrap, small, isTargetable, onPress }: Props) {
  const w = small ? 24 : 48;
  const h = small ? 16 : 32;

  return (
    <TouchableOpacity
      style={[
        styles.slot,
        { width: w, height: h },
        hasTrap && styles.active,
        isTargetable && styles.targetable,
      ]}
      onPress={onPress}
      disabled={!onPress || !isTargetable}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { fontSize: small ? 8 : 12 }]}>
        {hasTrap ? '⚡' : isTargetable ? '+' : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  slot: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.textDark,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  active: {
    borderColor: colors.trap,
    borderStyle: 'solid',
    backgroundColor: 'rgba(239,83,80,0.15)',
  },
  targetable: {
    borderColor: colors.accent,
    borderStyle: 'solid',
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  text: {
    color: colors.trap,
    fontWeight: 'bold',
  },
});
