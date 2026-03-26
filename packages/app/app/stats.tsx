import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { loadStats, type PlayerStats } from '../services/stats';

export default function StatsScreen() {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    loadStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const duelWinRate = (stats.duelsWon + stats.duelsLost) > 0
    ? Math.round((stats.duelsWon / (stats.duelsWon + stats.duelsLost)) * 100)
    : 0;

  const bluffRate = stats.bluffsAttempted > 0
    ? Math.round((stats.bluffsSuccessful / stats.bluffsAttempted) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Statistiques</Text>

        <View style={styles.row}>
          <StatBox label="Parties" value={stats.gamesPlayed} />
          <StatBox label="Victoires" value={stats.gamesWon} accent />
          <StatBox label="Win rate" value={`${winRate}%`} />
        </View>

        <View style={styles.row}>
          <StatBox label="Duels gagnes" value={stats.duelsWon} />
          <StatBox label="Duels perdus" value={stats.duelsLost} />
          <StatBox label="Duel win%" value={`${duelWinRate}%`} />
        </View>

        <View style={styles.row}>
          <StatBox label="Bluffs tentes" value={stats.bluffsAttempted} />
          <StatBox label="Bluffs reussis" value={stats.bluffsSuccessful} />
          <StatBox label="Bluff%" value={`${bluffRate}%`} />
        </View>

        <View style={styles.row}>
          <StatBox label="Outsider (1v7)" value={stats.outsiderVictories} accent />
          <StatBox
            label="Univers favori"
            value={stats.favoriteUniverse ?? '-'}
          />
        </View>

        {Object.keys(stats.identitiesPlayed).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identites jouees</Text>
            {Object.entries(stats.identitiesPlayed).map(([id, count]) => (
              <View key={id} style={styles.identityRow}>
                <Text style={styles.identityName}>{id}</Text>
                <Text style={styles.identityCount}>
                  {count}x (gagne {stats.identitiesWon[id] ?? 0}x)
                </Text>
              </View>
            ))}
          </View>
        )}

        {stats.gamesPlayed === 0 && (
          <Text style={styles.emptyText}>
            Joue ta premiere partie pour voir tes stats !
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, accent: isAccent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, isAccent && styles.statValueAccent]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  loading: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgLight,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
  },
  statValueAccent: {
    color: colors.accent,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: fonts.sizes.xs,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.bgLight,
    borderRadius: 10,
    padding: 14,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  identityName: {
    color: colors.text,
    fontSize: fonts.sizes.md,
  },
  identityCount: {
    color: colors.textDim,
    fontSize: fonts.sizes.md,
  },
  emptyText: {
    color: colors.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
