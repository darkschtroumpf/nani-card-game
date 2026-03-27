import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    title: 'Bienvenue au Dojo!',
    text: 'NANI?! Dojo est un jeu de cartes ou bluff et strategie se melangent. Ton objectif: reduire les LP de tes adversaires a 0!',
  },
  {
    title: 'Ton Deck Sensei',
    text: 'Tu commences avec 10 cartes secretes — personne ne sait ce que tu as! Ton archetype definit ton style de jeu.',
  },
  {
    title: 'Le Dojo (marche)',
    text: 'Chaque tour, 3 cartes sont au Dojo. Achete pour ameliorer ton deck, ou Medite pour gagner du Focus.',
  },
  {
    title: 'Deploie tes Fighters',
    text: 'Pose des fighters sur le terrain (max 3). Tu peux les poser FACE CACHEE pour moins de Ki — et surprendre tes adversaires!',
  },
  {
    title: 'Le Combat',
    text: 'Attaque avec un fighter en declarant un univers. Si ton fighter est cache, tu peux MENTIR sur son univers!',
  },
  {
    title: 'NANI?!',
    text: 'Quand un adversaire attaque avec un fighter cache, tu peux crier NANI?! pour appeler son bluff. Si tu as raison, son fighter est detruit! Sinon, tu perds 3 LP.',
  },
  {
    title: 'Les Pieges',
    text: 'Pose n\'importe quelle carte comme piege face cachee. Vrai piege ou bluff? Tes adversaires ne savent jamais!',
  },
  {
    title: 'Les Signatures',
    text: 'Chaque archetype a une carte Signature ultra-puissante. Accumule du Focus pour l\'activer au bon moment!',
  },
  {
    title: 'Bonne chance!',
    text: 'Bluff, deckbuild, domine. Que le meilleur gagne!',
  },
];

export const DOJO_TUTORIAL_STEPS = STEPS.length;

export default function DojoTutorial({ step, onNext, onSkip }: Props) {
  if (step >= STEPS.length) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.stepCount}>{step + 1}/{STEPS.length}</Text>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.text}>{s.text}</Text>
        <View style={styles.buttons}>
          {!isLast && (
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
              <Text style={styles.skipText}>Passer le tuto</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextText}>{isLast ? 'Jouer!' : 'Suivant'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 150,
  },
  card: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: colors.bgLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  stepCount: {
    color: colors.textDim,
    fontSize: fonts.sizes.xs,
  },
  title: {
    color: colors.accent,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  nextText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
});
