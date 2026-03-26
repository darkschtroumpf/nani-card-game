import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';
import type { IdentityType } from '../../engine/src/types';

const IDENTITY_INFO: Record<
  IdentityType,
  { name: string; emoji: string; objective: string; tip: string }
> = {
  protagoniste: {
    name: 'Le Protagoniste',
    emoji: '⭐',
    objective: 'Sois le dernier survivant !',
    tip: 'Joue prudemment et elimine les autres un par un.',
  },
  rival: {
    name: 'Le Rival',
    emoji: '⚔️',
    objective: 'Elimine le joueur qui te precede dans l\'ordre de jeu.',
    tip: 'Concentre tes attaques sur ta cible. Les autres ne comptent pas.',
  },
  mentor: {
    name: 'Le Mentor',
    emoji: '🛡️',
    objective: 'Le joueur que tu proteges doit survivre (ou venge-le).',
    tip: 'Protege ton allie en attaquant ceux qui le menacent.',
  },
  traitre: {
    name: 'Le Traitre',
    emoji: '🗡️',
    objective: 'Elimine 2+ joueurs ET survis.',
    tip: 'Sois agressif mais ne te fais pas eliminer trop tot.',
  },
  comic_relief: {
    name: 'Le Comic Relief',
    emoji: '😂',
    objective: 'Gagne sans JAMAIS bluffer.',
    tip: 'Dis toujours la verite sur ton univers. Mode difficile !',
  },
  antagoniste: {
    name: 'L\'Antagoniste',
    emoji: '👹',
    objective: 'Inflige des degats a TOUS les autres joueurs.',
    tip: 'Repartis tes attaques. N\'oublie personne.',
  },
};

interface IdentityRevealProps {
  identityType: IdentityType;
  protectedPlayerName?: string;
  targetPlayerName?: string;
  onContinue: () => void;
}

export default function IdentityReveal({
  identityType,
  protectedPlayerName,
  targetPlayerName,
  onContinue,
}: IdentityRevealProps) {
  const info = IDENTITY_INFO[identityType];

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.emoji}>{info.emoji}</Text>
        <Text style={styles.title}>Ton identite secrete</Text>
        <Text style={styles.name}>{info.name}</Text>

        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveLabel}>OBJECTIF</Text>
          <Text style={styles.objectiveText}>{info.objective}</Text>
          {identityType === 'mentor' && protectedPlayerName && (
            <Text style={styles.targetText}>
              Tu proteges : {protectedPlayerName}
            </Text>
          )}
          {identityType === 'rival' && targetPlayerName && (
            <Text style={styles.targetText}>
              Ta cible : {targetPlayerName}
            </Text>
          )}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipLabel}>CONSEIL</Text>
          <Text style={styles.tipText}>{info.tip}</Text>
        </View>

        <Text style={styles.secretReminder}>
          Garde ton identite secrete ! Les autres joueurs ne doivent pas la connaitre.
        </Text>

        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>C'est parti !</Text>
        </TouchableOpacity>
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
    padding: 20,
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.bgLight,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  name: {
    color: colors.accent,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  objectiveBox: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 14,
    width: '100%',
    marginBottom: 12,
  },
  objectiveLabel: {
    color: colors.primary,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  objectiveText: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    lineHeight: 20,
  },
  targetText: {
    color: colors.accent,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    marginTop: 6,
  },
  tipBox: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 14,
    width: '100%',
    marginBottom: 16,
  },
  tipLabel: {
    color: colors.seinen,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  tipText: {
    color: colors.textDim,
    fontSize: fonts.sizes.sm,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  secretReminder: {
    color: colors.textDark,
    fontSize: fonts.sizes.xs,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
  },
});
