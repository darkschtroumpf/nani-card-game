import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';
import Card from './Card';
import BotReaction, { getBotReaction, type ReactionType } from './BotReaction';
import type { Card as CardType, DuelResult, Universe } from '../../engine/src/types';
import { UNIVERSE_NAMES } from '../../engine/src/constants';

export type DuelStep =
  | 'your_card'       // You played your card (face down)
  | 'your_declare'    // You declared a universe
  | 'bot_reacts'      // Bot reacts to your declaration
  | 'bot_plays'       // Bot plays their card (face down)
  | 'reveal'          // Both cards flip
  | 'explain'         // Detailed explanation
  | 'result'          // Final result + bonus
  | 'defending_intro' // You're being attacked
  | 'defending_pick'; // Pick your defense card

interface DuelStepsProps {
  step: DuelStep;
  attackerName: string;
  defenderName: string;
  isPlayerAttacking: boolean;
  playerCard?: CardType;
  opponentCard?: CardType;
  declaredUniverse?: Universe;
  botReaction?: string;
  botReactionType?: ReactionType;
  result?: DuelResult;
  onContinue?: () => void;
  continueLabel?: string;
}

export default function DuelSteps({
  step,
  attackerName,
  defenderName,
  isPlayerAttacking,
  playerCard,
  opponentCard,
  declaredUniverse,
  botReaction,
  botReactionType,
  result,
  onContinue,
  continueLabel,
}: DuelStepsProps) {
  return (
    <View style={styles.container}>
      {/* Step: You played your card */}
      {step === 'your_card' && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>Tu joues ta carte...</Text>
          <Card card={playerCard} faceDown />
          <Text style={styles.hint}>Ta carte est posee face cachee.</Text>
        </View>
      )}

      {/* Step: You declared */}
      {step === 'your_declare' && declaredUniverse && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>Tu declares :</Text>
          <Text style={[styles.declaration, { color: colors[declaredUniverse] }]}>
            "{UNIVERSE_NAMES[declaredUniverse]}"
          </Text>
          {playerCard && declaredUniverse !== playerCard.universe && (
            <Text style={styles.bluffIndicator}>
              (C'est un bluff ! Ta vraie carte est {UNIVERSE_NAMES[playerCard.universe]})
            </Text>
          )}
        </View>
      )}

      {/* Step: Bot reacts */}
      {step === 'bot_reacts' && botReaction && botReactionType && (
        <View style={styles.content}>
          <BotReaction
            botName={isPlayerAttacking ? defenderName : attackerName}
            reaction={botReaction}
            type={botReactionType}
          />
        </View>
      )}

      {/* Step: Bot plays */}
      {step === 'bot_plays' && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>
            {isPlayerAttacking ? defenderName : attackerName} joue une carte...
          </Text>
          <Card faceDown />
        </View>
      )}

      {/* Step: Being attacked intro */}
      {step === 'defending_intro' && declaredUniverse && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>{attackerName} t'attaque !</Text>
          <Text style={styles.declaration}>
            Il declare : "{UNIVERSE_NAMES[declaredUniverse]}"
          </Text>
          {botReaction && botReactionType && (
            <BotReaction
              botName={attackerName}
              reaction={botReaction}
              type={botReactionType}
            />
          )}
          <Text style={styles.hint}>Choisis une carte pour te defendre !</Text>
        </View>
      )}

      {/* Step: Reveal */}
      {step === 'reveal' && (
        <View style={styles.content}>
          <Text style={styles.stepTitle}>REVELATION !</Text>
          <View style={styles.versus}>
            <View style={styles.side}>
              <Text style={styles.playerLabel}>{attackerName}</Text>
              <Card card={isPlayerAttacking ? playerCard : opponentCard} />
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.side}>
              <Text style={styles.playerLabel}>{defenderName}</Text>
              <Card card={isPlayerAttacking ? opponentCard : playerCard} />
            </View>
          </View>
        </View>
      )}

      {/* Step: Explain */}
      {step === 'explain' && result && (
        <View style={styles.content}>
          <View style={styles.versus}>
            <View style={styles.side}>
              <Text style={styles.playerLabel}>{attackerName}</Text>
              <Card card={result.attackerCard} small />
              <Text style={styles.totalValue}>{result.attackerTotal}</Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.side}>
              <Text style={styles.playerLabel}>{defenderName}</Text>
              <Card card={result.defenderCard} small />
              <Text style={styles.totalValue}>{result.defenderTotal}</Text>
            </View>
          </View>

          {result.dominanceBonus !== 'none' && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                {result.dominanceBonus === 'attacker'
                  ? `${UNIVERSE_NAMES[result.attackerCard.universe]} domine ${UNIVERSE_NAMES[result.defenderCard.universe]}`
                  : `${UNIVERSE_NAMES[result.defenderCard.universe]} domine ${UNIVERSE_NAMES[result.attackerCard.universe]}`}
                {' '}(+3)
              </Text>
            </View>
          )}

          {result.outsiderVictory && (
            <View style={[styles.explanationBox, { borderColor: colors.accent }]}>
              <Text style={[styles.explanationText, { color: colors.accent }]}>
                L'Outsider (1) bat l'Ultra (7) !
              </Text>
            </View>
          )}

          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              {result.attackerTotal} vs {result.defenderTotal}
              {result.tie
                ? ' = Egalite !'
                : result.outsiderVictory
                  ? ''
                  : ` → ${result.winnerId === result.attackerId ? attackerName : defenderName} gagne !`}
            </Text>
          </View>
        </View>
      )}

      {/* Step: Result */}
      {step === 'result' && result && (
        <View style={styles.content}>
          {result.tie ? (
            <Text style={styles.resultTie}>EGALITE</Text>
          ) : (
            <>
              <Text style={styles.resultTitle}>
                {result.winnerId === result.attackerId ? attackerName : defenderName} GAGNE !
              </Text>
              <View style={styles.resultDetails}>
                <Text style={styles.resultLine}>
                  {result.loserId === result.attackerId ? attackerName : defenderName} perd 1 Plot Armor
                </Text>
                {result.bonusApplied.description ? (
                  <Text style={[styles.resultLine, { color: colors.accent }]}>
                    Bonus : {result.bonusApplied.description}
                  </Text>
                ) : null}
                {result.outsiderVictory && (
                  <Text style={[styles.resultLine, { color: colors.warning }]}>
                    Identite adverse revelee !
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      )}

      {/* Continue button */}
      {onContinue && (
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueText}>{continueLabel ?? 'Continuer'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  stepTitle: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  hint: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  declaration: {
    color: colors.accent,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  bluffIndicator: {
    color: colors.danger,
    fontSize: fonts.sizes.sm,
    fontStyle: 'italic',
    marginTop: 4,
  },
  versus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 8,
  },
  side: {
    alignItems: 'center',
    gap: 4,
  },
  playerLabel: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
  },
  vs: {
    color: colors.primary,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  totalValue: {
    color: colors.accent,
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
  },
  explanationBox: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.textDark,
  },
  explanationText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
  resultTitle: {
    color: colors.success,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultTie: {
    color: colors.textDim,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  resultDetails: {
    gap: 4,
    alignItems: 'center',
  },
  resultLine: {
    color: colors.text,
    fontSize: fonts.sizes.md,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  continueText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
});
