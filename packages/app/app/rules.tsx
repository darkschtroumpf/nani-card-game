import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import DominanceChart from '../components/DominanceChart';

export default function RulesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Comment jouer</Text>

        <Section title="But du jeu">
          Sois le dernier survivant ou accomplis ton objectif secret !
        </Section>

        <Section title="A ton tour">
          {'1. Tu pioches 1 carte\n2. Tu choisis une action :\n   - Attaquer un joueur\n   - S\'entrainer (defausse 1, pioche 2)\n   - Espionner (voir 1 carte adverse)'}
        </Section>

        <Section title="Le duel">
          {"L'attaquant pose une carte face cachee et declare un univers (il peut mentir !).\nLe defenseur choisit sa carte en reaction.\nRevelation : l'univers dominant donne +3. Le plus haut total gagne."}
        </Section>

        <Section title="Bonus de victoire">
          {'Shonen : pioche 1 carte\nMagical : +1 Plot Armor\nMecha : +1 Bouclier (max 2)\nIsekai : vole la carte adverse\nSeinen : regarde identite ou 2 cartes'}
        </Section>

        <View style={styles.chartWrapper}>
          <DominanceChart />
        </View>

        <Section title="Cartes speciales">
          {"Le 1 (Outsider) : perd contre tout SAUF le 7 qu'il bat. Si le 1 gagne, l'adversaire revele son identite.\n\nLe 7 (Ultra) : carte la plus forte. Double le bonus d'univers. Mais vulnerable au 1 !"}
        </Section>

        <Section title="Identites secretes">
          {"Protagoniste : etre le dernier survivant\nRival : eliminer le joueur qui te precede\nMentor : proteger un joueur choisi (ou le venger)\nTraitre : eliminer 2+ joueurs et survivre\nComic Relief : gagner sans jamais bluffer\nAntagoniste : infliger des degats a tous"}
        </Section>

        <Section title="Arcs Narratifs">
          {"Toutes les 3 tours, un evenement change les regles temporairement : Tournament Arc (attaque obligatoire), Beach Episode (pas d'attaque), Plot Twist (mains redistribuees), etc."}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    color: colors.accent,
  },
  sectionText: {
    fontSize: fonts.sizes.md,
    color: colors.textDim,
    lineHeight: 22,
  },
  chartWrapper: {
    marginVertical: 4,
  },
});
