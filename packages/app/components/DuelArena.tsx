import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { colors, fonts } from '../theme';
import type { Card as CardType, DuelResult } from '../../engine/src/types';

interface DuelArenaProps {
  attackerName: string;
  defenderName: string;
  attackerCard?: CardType;
  defenderCard?: CardType;
  declaredUniverse?: string;
  result?: DuelResult | null;
  phase: 'waiting' | 'declared' | 'responding' | 'revealed';
}

export default function DuelArena({
  attackerName,
  defenderName,
  attackerCard,
  defenderCard,
  declaredUniverse,
  result,
  phase,
}: DuelArenaProps) {
  const showResult = phase === 'revealed' && result;

  return (
    <View style={styles.container}>
      <Text style={styles.vsText}>DUEL</Text>

      <View style={styles.arena}>
        {/* Attacker side */}
        <View style={styles.side}>
          <Text style={styles.playerName}>{attackerName}</Text>
          <Card
            card={phase === 'revealed' ? attackerCard : undefined}
            faceDown={phase !== 'revealed'}
          />
          {declaredUniverse && phase !== 'revealed' && (
            <Text style={styles.declared}>"{declaredUniverse}"</Text>
          )}
          {showResult && (
            <Text style={styles.total}>{result!.attackerTotal}</Text>
          )}
        </View>

        {/* VS */}
        <View style={styles.vsContainer}>
          <Text style={styles.vs}>VS</Text>
          {showResult && result!.dominanceBonus !== 'none' && (
            <Text style={styles.dominance}>+3 {result!.dominanceBonus}</Text>
          )}
        </View>

        {/* Defender side */}
        <View style={styles.side}>
          <Text style={styles.playerName}>{defenderName}</Text>
          <Card
            card={phase === 'revealed' ? defenderCard : undefined}
            faceDown={phase !== 'revealed'}
          />
          {showResult && (
            <Text style={styles.total}>{result!.defenderTotal}</Text>
          )}
        </View>
      </View>

      {/* Result */}
      {showResult && (
        <View style={styles.resultContainer}>
          {result!.tie ? (
            <Text style={styles.resultTie}>Egalite !</Text>
          ) : result!.outsiderVictory ? (
            <Text style={styles.resultOutsider}>L'Outsider triomphe !</Text>
          ) : (
            <Text style={styles.resultWin}>
              {result!.winnerId === result!.attackerId ? attackerName : defenderName} gagne !
            </Text>
          )}
          {result!.bonusApplied.description && !result!.tie && (
            <Text style={styles.bonusText}>{result!.bonusApplied.description}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    marginVertical: 8,
  },
  vsText: {
    color: colors.primary,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 8,
  },
  arena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  side: {
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
  },
  declared: {
    color: colors.warning,
    fontSize: fonts.sizes.sm,
    fontStyle: 'italic',
  },
  total: {
    color: colors.accent,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  vsContainer: {
    alignItems: 'center',
  },
  vs: {
    color: colors.textDim,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  dominance: {
    color: colors.warning,
    fontSize: fonts.sizes.xs,
  },
  resultContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  resultWin: {
    color: colors.success,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  resultTie: {
    color: colors.textDim,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  resultOutsider: {
    color: colors.accent,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  bonusText: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    marginTop: 4,
  },
});
