import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@nani_stats';

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  duelsWon: number;
  duelsLost: number;
  bluffsAttempted: number;
  bluffsSuccessful: number;
  outsiderVictories: number;
  identitiesPlayed: Record<string, number>;
  identitiesWon: Record<string, number>;
  favoriteUniverse: string | null;
  universePlayed: Record<string, number>;
}

function defaultStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    duelsWon: 0,
    duelsLost: 0,
    bluffsAttempted: 0,
    bluffsSuccessful: 0,
    outsiderVictories: 0,
    identitiesPlayed: {},
    identitiesWon: {},
    favoriteUniverse: null,
    universePlayed: {},
  };
}

export async function loadStats(): Promise<PlayerStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (raw) return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {}
  return defaultStats();
}

export async function saveStats(stats: PlayerStats): Promise<void> {
  // Compute favorite universe
  let maxPlayed = 0;
  let fav: string | null = null;
  for (const [u, count] of Object.entries(stats.universePlayed)) {
    if (count > maxPlayed) {
      maxPlayed = count;
      fav = u;
    }
  }
  stats.favoriteUniverse = fav;

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function recordGameEnd(
  won: boolean,
  identityType: string,
): Promise<void> {
  const stats = await loadStats();
  stats.gamesPlayed++;
  if (won) stats.gamesWon++;
  stats.identitiesPlayed[identityType] = (stats.identitiesPlayed[identityType] ?? 0) + 1;
  if (won) {
    stats.identitiesWon[identityType] = (stats.identitiesWon[identityType] ?? 0) + 1;
  }
  await saveStats(stats);
}

export async function recordDuel(
  won: boolean,
  bluffed: boolean,
  bluffSucceeded: boolean,
  outsider: boolean,
  universe: string,
): Promise<void> {
  const stats = await loadStats();
  if (won) stats.duelsWon++;
  else stats.duelsLost++;
  if (bluffed) {
    stats.bluffsAttempted++;
    if (bluffSucceeded) stats.bluffsSuccessful++;
  }
  if (outsider) stats.outsiderVictories++;
  stats.universePlayed[universe] = (stats.universePlayed[universe] ?? 0) + 1;
  await saveStats(stats);
}

export async function resetStats(): Promise<void> {
  await AsyncStorage.removeItem(STATS_KEY);
}
