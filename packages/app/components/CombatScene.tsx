import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, universeColor } from '../theme';
import DojoCard from './DojoCard';
import NaniButton from './NaniButton';
import type { CardDef, Universe } from '../../engine/src/dojo/types';

export type CombatStep = 'declaration' | 'defense' | 'nani_call' | 'reveal' | 'resolution';

interface Props {
  step: CombatStep;
  attackerName: string;
  defenderName: string;
  attackerFighter?: CardDef;
  defenderFighter?: CardDef;
  declaredUniverse: Universe;
  attackerConcealed: boolean;
  naniCalled: boolean;
  naniResult?: 'correct' | 'wrong' | null;
  events: string[];
  isDefender: boolean;
  canCallNani: boolean;
  onContinue: () => void;
  onNaniCall?: () => void;
  onPassDefense?: () => void;
}

export default function CombatScene({
  step, attackerName, defenderName, attackerFighter, defenderFighter,
  declaredUniverse, attackerConcealed, naniCalled, naniResult,
  events, isDefender, canCallNani, onContinue, onNaniCall, onPassDefense,
}: Props) {
  const uColor = universeColor(declaredUniverse as any);

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        {/* Step 1: Declaration */}
        {step === 'declaration' && (
          <>
            <Text style={styles.title}>Combat!</Text>
            <Text style={styles.subtitle}>{attackerName} attaque {defenderName}</Text>
            <View style={styles.vsRow}>
              <View style={styles.fighterCol}>
                {attackerConcealed ? (
                  <DojoCard concealed />
                ) : (
                  <DojoCard card={attackerFighter} />
                )}
                <Text style={styles.playerLabel}>{attackerName}</Text>
              </View>
              <Text style={styles.vs}>VS</Text>
              <View style={styles.fighterCol}>
                {defenderFighter ? (
                  <DojoCard card={defenderFighter} />
                ) : (
                  <Text style={styles.directText}>Attaque directe!</Text>
                )}
                <Text style={styles.playerLabel}>{defenderName}</Text>
              </View>
            </View>
            <View style={[styles.declareBadge, { backgroundColor: uColor }]}>
              <Text style={styles.declareText}>Declare: {declaredUniverse.toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 2: Defense */}
        {step === 'defense' && isDefender && (
          <>
            <Text style={styles.title}>Tu es attaque!</Text>
            <Text style={styles.subtitle}>{attackerName} t'attaque en declarant {declaredUniverse}</Text>
            <TouchableOpacity style={styles.passBtn} onPress={onPassDefense}>
              <Text style={styles.passBtnText}>Pas de technique</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'defense' && !isDefender && (
          <>
            <Text style={styles.title}>Defense</Text>
            <Text style={styles.subtitle}>{defenderName} decide sa defense...</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3: NANI call */}
        {step === 'nani_call' && (
          <>
            {isDefender && attackerConcealed && canCallNani ? (
              <>
                <Text style={styles.title}>Le fighter est cache!</Text>
                <Text style={styles.subtitle}>Tu peux appeler son bluff...</Text>
                <NaniButton onPress={() => onNaniCall?.()} />
                <TouchableOpacity style={styles.passBtn} onPress={onContinue}>
                  <Text style={styles.passBtnText}>Laisser passer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>NANI?!</Text>
                {naniCalled ? (
                  <Text style={styles.naniShout}>NANI?!</Text>
                ) : (
                  <Text style={styles.subtitle}>Pas d'appel NANI?! — le combat continue.</Text>
                )}
                <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
                  <Text style={styles.continueBtnText}>Continuer</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* Step 4: Reveal */}
        {step === 'reveal' && (
          <>
            <Text style={styles.title}>Revelation!</Text>
            {naniResult === 'correct' && (
              <Text style={styles.naniCorrect}>NANI?! CORRECT! C'etait un bluff!</Text>
            )}
            {naniResult === 'wrong' && (
              <Text style={styles.naniWrong}>NANI?! RATÉ! Il disait vrai! -3 LP</Text>
            )}
            <View style={styles.vsRow}>
              <View style={styles.fighterCol}>
                <DojoCard card={attackerFighter} />
                <Text style={styles.playerLabel}>{attackerName}</Text>
              </View>
              <Text style={styles.vs}>VS</Text>
              <View style={styles.fighterCol}>
                {defenderFighter ? (
                  <DojoCard card={defenderFighter} />
                ) : (
                  <Text style={styles.directText}>LP</Text>
                )}
                <Text style={styles.playerLabel}>{defenderName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 5: Resolution */}
        {step === 'resolution' && (
          <>
            <Text style={styles.title}>Resolution</Text>
            {events.length > 0 ? events.map((e, i) => (
              <Text key={i} style={styles.eventText}>{e}</Text>
            )) : (
              <Text style={styles.eventText}>Le combat se termine.</Text>
            )}
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>OK</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    color: colors.primary,
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fighterCol: {
    alignItems: 'center',
    gap: 6,
  },
  vs: {
    color: colors.accent,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  playerLabel: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
  },
  directText: {
    color: colors.danger,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  declareBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  declareText: {
    color: '#fff',
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 4,
  },
  continueBtnText: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
  passBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textDim,
    marginTop: 4,
  },
  passBtnText: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
  },
  naniShout: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  naniCorrect: {
    color: colors.success,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  naniWrong: {
    color: colors.danger,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
});
