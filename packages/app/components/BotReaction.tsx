import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import type { Universe } from '../../engine/src/types';

const REACTION_BELIEVE: string[] = [
  'Hmm, ok je te crois...',
  'Si tu le dis...',
  'Mouais, pourquoi pas.',
  'D\'accord, je joue en consequence.',
  'Je vais te contrer !',
];

const REACTION_DOUBT: string[] = [
  'Tu bluffes, j\'en suis sur !',
  'Ca sent le piege...',
  'Je ne te crois pas du tout.',
  'Menteur ! Je vais te demasquer.',
  'Nice try, mais non.',
];

const REACTION_SCARED: string[] = [
  'Oh non, pas moi...',
  'Pourquoi tu m\'attaques ?!',
  'Je suis mal...',
  'Aie aie aie...',
];

const REACTION_CONFIDENT: string[] = [
  'Viens, je t\'attends !',
  'Tu vas regretter.',
  'Ma carte va te detruire.',
  'Facile.',
  'Tu n\'as aucune chance.',
];

const REACTION_WIN: string[] = [
  'Trop facile !',
  'Je t\'avais prevenu.',
  'GG, next.',
  'Ecrase !',
];

const REACTION_LOSE: string[] = [
  'NANI?! Impossible !',
  'Comment ?!',
  'Tu m\'as eu...',
  'Arg, bien joue.',
  'Je m\'en remettrai.',
];

const REACTION_OUTSIDER: string[] = [
  'LE 1 CONTRE LE 7 ?! NANI?!',
  'L\'Outsider a frappe !',
  'Impossible... le plus faible a gagne !',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type ReactionType =
  | 'believe'
  | 'doubt'
  | 'scared'
  | 'confident'
  | 'win'
  | 'lose'
  | 'outsider';

export function getBotReaction(type: ReactionType): string {
  switch (type) {
    case 'believe':
      return pickRandom(REACTION_BELIEVE);
    case 'doubt':
      return pickRandom(REACTION_DOUBT);
    case 'scared':
      return pickRandom(REACTION_SCARED);
    case 'confident':
      return pickRandom(REACTION_CONFIDENT);
    case 'win':
      return pickRandom(REACTION_WIN);
    case 'lose':
      return pickRandom(REACTION_LOSE);
    case 'outsider':
      return pickRandom(REACTION_OUTSIDER);
  }
}

/** Determine reaction type based on context */
export function computeDefenderReaction(
  declaredUniverse: Universe,
  defenderCardUniverse: Universe,
  defenderCardValue: number,
): ReactionType {
  // Does the defender think they can counter?
  const { dominates } = require('../../engine/src/constants');
  const counters = dominates(defenderCardUniverse, declaredUniverse);

  if (counters && defenderCardValue >= 5) return 'confident';
  if (counters) return 'doubt';
  if (defenderCardValue <= 2) return 'scared';
  return Math.random() > 0.5 ? 'believe' : 'doubt';
}

interface BotReactionProps {
  botName: string;
  reaction: string;
  type: ReactionType;
}

export default function BotReaction({ botName, reaction, type }: BotReactionProps) {
  const bubbleColor =
    type === 'win' || type === 'confident'
      ? colors.success
      : type === 'lose' || type === 'scared'
        ? colors.danger
        : type === 'outsider'
          ? colors.accent
          : colors.bgCard;

  return (
    <View style={styles.container}>
      <Text style={styles.botName}>{botName}</Text>
      <View style={[styles.bubble, { borderColor: bubbleColor }]}>
        <Text style={styles.reactionText}>{reaction}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  botName: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bubble: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: 260,
  },
  reactionText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
