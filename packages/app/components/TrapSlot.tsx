import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface Props {
  hasTrap: boolean;
  small?: boolean;
}

export default function TrapSlot({ hasTrap, small }: Props) {
  const w = small ? 24 : 36;
  const h = small ? 16 : 24;

  return (
    <View style={[styles.slot, { width: w, height: h }, hasTrap && styles.active]}>
      <Text style={[styles.text, { fontSize: small ? 8 : 11 }]}>
        {hasTrap ? '⚡' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    borderRadius: 4,
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
  text: {
    color: colors.trap,
  },
});
