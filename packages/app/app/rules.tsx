import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: string }) {
  return <Text style={styles.text}>{children}</Text>;
}

export default function RulesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>NANI?! Dojo</Text>
        <Text style={styles.subtitle}>Regles du jeu</Text>

        <Section title="Objectif">
          <P>Reduis les LP de tes adversaires a 0, ou controle 3 univers differents sur ton terrain (Convergence Multiverse).</P>
        </Section>

        <Section title="Ressources">
          <P>LP (50) — Tes points de vie. A 0 tu es elimine.</P>
          <P>Ki (2-7) — Energie pour jouer des cartes. +1 max par tour, se recharge chaque tour.</P>
          <P>Focus (0+) — Ressource speciale pour les Signatures. Gagne +1 en gagnant un duel, +2 en meditant.</P>
        </Section>

        <Section title="Types de cartes">
          <P>Fighter (cout 1-4 Ki) — ATK/HP. Deploie sur le terrain (max 3). Peut etre pose face cachee (-1 Ki).</P>
          <P>Technique (cout 1-2 Ki) — Effet instantane. Jouable en reaction pendant un combat.</P>
          <P>Piege (cout 1 Ki) — Pose face cachee. Se declenche quand tu es attaque. N'importe quelle carte peut etre posee comme faux piege!</P>
          <P>Equipement (cout 1-2 Ki) — Buff permanent sur un fighter. Detruit avec le fighter.</P>
          <P>Signature (cout Ki + Focus) — Ultra puissant, 1 par deck. Unique a chaque archetype.</P>
        </Section>

        <Section title="Dominance">
          <P>Shonen &gt; Magical &gt; Mecha &gt; Isekai &gt; Seinen &gt; Shonen</P>
          <P>Bonus dominance: +3 ATK quand ton univers domine celui de l'adversaire.</P>
        </Section>

        <Section title="Tour de jeu">
          <P>1. Ki — +1 max Ki, recharge, pioche 1 carte.</P>
          <P>2. Dojo — Achete une carte au marche, medite (+2 Focus), ou passe.</P>
          <P>3. Deploy — Deploie fighters, pose pieges, equipe, active ta Signature.</P>
          <P>4. Combat — Attaque un adversaire (1 attaque max).</P>
          <P>5. Fin — Defausse a 7 cartes, check victoire.</P>
        </Section>

        <Section title="Combat">
          <P>Choisis un attaquant et une cible. Declare un univers (tu peux mentir si ton fighter est cache!).</P>
          <P>Le defenseur peut jouer une technique ou appeler NANI?!</P>
          <P>NANI?! — Si l'attaquant bluffait: son fighter est detruit! Sinon: le defenseur perd 3 LP.</P>
          <P>Les deux fighters infligent leurs degats simultanement. Les degats en exces vont aux LP.</P>
        </Section>

        <Section title="Le Dojo (marche)">
          <P>3 cartes visibles en permanence. Tout le monde voit ce que tu achetes (mais pas ton Deck Sensei secret!).</P>
          <P>C'est le coeur du deckbuilding: adapte ta strategie en cours de partie.</P>
        </Section>

        <Section title="5 couches de bluff">
          <P>1. Ton Deck Sensei est secret — personne ne connait ta base.</P>
          <P>2. Fighters caches — deployes face cachee pour la surprise.</P>
          <P>3. Declaration d'univers — tu peux mentir!</P>
          <P>4. Faux pieges — pose n'importe quelle carte comme piege.</P>
          <P>5. Le Dojo — ce que tu achetes ne revele pas tout.</P>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: fonts.sizes.title, fontWeight: 'bold', color: colors.primary, textAlign: 'center' },
  subtitle: { fontSize: fonts.sizes.lg, color: colors.textDim, textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: fonts.sizes.lg, fontWeight: 'bold', color: colors.accent, marginBottom: 8 },
  text: { color: colors.text, fontSize: fonts.sizes.md, lineHeight: 22, marginBottom: 4 },
});
