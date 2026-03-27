import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { ensureAuth } from '../services/supabase';

export default function RootLayout() {
  useEffect(() => {
    ensureAuth().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="lobby" options={{ title: 'Lobby' }} />
        <Stack.Screen name="room" options={{ title: 'Salle d\'attente' }} />
        <Stack.Screen name="deckbuilder" options={{ title: 'Deck Builder' }} />
        <Stack.Screen
          name="game"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="rules" options={{ title: 'Regles' }} />
        <Stack.Screen name="stats" options={{ title: 'Statistiques' }} />
        <Stack.Screen name="result" options={{ title: 'Resultat', headerBackVisible: false }} />
      </Stack>
    </>
  );
}
