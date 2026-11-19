import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack(): React.JSX.Element | null {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loading]);

  if (loading) return null;

  return (
  <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
      animation: 'slide_from_right',
    }}
  >
    {/* Telas disponíveis sem autenticação */}
    <Stack.Protected guard={user === null}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="login" />
    </Stack.Protected>

    {/* Telas disponíveis com autenticação */}
    <Stack.Protected guard={user !== null}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="nova-verificacao" />
      <Stack.Screen
        name="analisando"
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="resultado"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="simulador" />
      <Stack.Screen name="artigo/[id]" />
      <Stack.Screen name="ajustes/[id]" />
    </Stack.Protected>
  </Stack>
);
}

export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootStack />
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
