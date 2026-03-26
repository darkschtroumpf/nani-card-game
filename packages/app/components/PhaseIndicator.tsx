import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import type { TurnPhase } from '../../engine/src/dojo/types';

interface Props {
  phase: TurnPhase;
  turnNumber: number;
}

const PHASES: { key: string; label: string; phases: TurnPhase[] }[] = [
  { key: 'ki', label: 'Ki', phases: ['ki'] },
  { key: 'dojo', label: 'Dojo', phases: ['dojo'] },
  { key: 'deploy', label: 'Deploy', phases: ['deploy'] },
  { key: 'combat', label: 'Combat', phases: ['combat_select', 'combat_declare', 'combat_response', 'combat_nani', 'combat_resolve'] },
  { key: 'end', label: 'Fin', phases: ['end', 'arc'] },
];

export default function PhaseIndicator({ phase, turnNumber }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.turn}>T{turnNumber}</Text>
      <View style={styles.phases}>
        {PHASES.map((p, i) => {
          const active = p.phases.includes(phase);
          const past = PHASES.findIndex(pp => pp.phases.includes(phase)) > i;
          return (
            <View key={p.key} style={styles.phaseItem}>
              {i > 0 && <View style={[styles.connector, (active || past) && styles.connectorActive]} />}
              <View style={[styles.dot, active && styles.dotActive, past && styles.dotPast]} />
              <Text style={[styles.phaseLabel, active && styles.phaseLabelActive]}>
                {p.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgLight,
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 6,
    gap: 10,
  },
  turn: {
    color: colors.accent,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  phases: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  connector: {
    width: 12,
    height: 2,
    backgroundColor: colors.textDark,
    marginRight: 2,
  },
  connectorActive: {
    backgroundColor: colors.accent,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textDark,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotPast: {
    backgroundColor: colors.success,
  },
  phaseLabel: {
    color: colors.textDark,
    fontSize: 9,
    fontWeight: '600',
  },
  phaseLabelActive: {
    color: colors.accent,
  },
});
