import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface Props {
  connected: boolean;
}

export default function ConnectionStatus({ connected }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, connected ? styles.dotGreen : styles.dotRed]} />
      <Text style={[styles.text, !connected && styles.textRed]}>
        {connected ? 'En ligne' : 'Deconnecte'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: '#4caf50',
  },
  dotRed: {
    backgroundColor: colors.danger,
  },
  text: {
    color: colors.textDim,
    fontSize: 10,
  },
  textRed: {
    color: colors.danger,
  },
});
