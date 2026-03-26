import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';

const TUTORIAL_STEPS = [
  {
    title: 'Bienvenue dans NANI?! 🎴',
    text: 'Un jeu de bluff et de deduction dans un multivers anime.',
    position: 'center' as const,
  },
  {
    title: 'Tes cartes',
    text: 'Ta main est en bas. Chaque carte a un univers (couleur) et une valeur (chiffre). Les hautes valeurs sont plus fortes.',
    position: 'bottom' as const,
  },
  {
    title: 'Les 3 actions',
    text: 'A ton tour tu peux :\n- Attaquer : joue une carte contre un adversaire\n- S\'entrainer : defausse 1 carte, pioche 2\n- Espionner : regarde 1 carte d\'un adversaire',
    position: 'center' as const,
  },
  {
    title: 'Le bluff ! 🎭',
    text: 'Quand tu attaques, tu DECLARES un univers. Tu peux mentir ! Si tu dis "Shonen" mais que ta carte est Isekai, l\'adversaire choisira mal sa defense.',
    position: 'center' as const,
  },
  {
    title: 'La dominance (+3)',
    text: 'Chaque univers en domine 2 autres et perd contre 2 autres. Le dominant recoit +3 a sa valeur. Utilise le bouton "?" pour voir le cycle.',
    position: 'center' as const,
  },
  {
    title: 'Cartes speciales',
    text: 'Le 1 (Outsider) : perd contre tout SAUF le 7 qu\'il bat !\nLe 7 (Ultra) : la plus forte, mais double le bonus.',
    position: 'center' as const,
  },
  {
    title: 'Ton objectif secret',
    text: 'Tu as une identite secrete avec un objectif. Remplis-le pour une victoire immediate ! Mais garde-le secret...',
    position: 'center' as const,
  },
  {
    title: 'C\'est parti !',
    text: 'Tu sais tout. Bonne chance et n\'oublie pas : tout le monde ment dans NANI?!',
    position: 'center' as const,
  },
];

interface TutorialProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

export default function Tutorial({ step, onNext, onSkip }: TutorialProps) {
  if (step >= TUTORIAL_STEPS.length) return null;

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, positionStyle(current.position)]}>
        <Text style={styles.stepCounter}>
          {step + 1} / {TUTORIAL_STEPS.length}
        </Text>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.text}>{current.text}</Text>

        <View style={styles.buttons}>
          {!isLast && (
            <TouchableOpacity onPress={onSkip}>
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextText}>{isLast ? 'Jouer !' : 'Suivant'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const TOTAL_TUTORIAL_STEPS = TUTORIAL_STEPS.length;

function positionStyle(pos: 'center' | 'bottom' | 'top') {
  switch (pos) {
    case 'bottom': return { marginTop: 'auto' as const, marginBottom: 140 };
    case 'top': return { marginTop: 100, marginBottom: 'auto' as const };
    default: return {};
  }
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 200,
  },
  card: {
    backgroundColor: colors.bgLight,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stepCounter: {
    color: colors.textDark,
    fontSize: fonts.sizes.xs,
    textAlign: 'right',
    marginBottom: 8,
  },
  title: {
    color: colors.accent,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    lineHeight: 22,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  nextText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
});
