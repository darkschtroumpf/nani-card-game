import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { warded } from '../theme-warded';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: warded.bg },
          headerTintColor: warded.text,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: warded.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="warded" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="campaign" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
