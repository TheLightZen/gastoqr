import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { DATABASE_NAME, migrateDbIfNeeded } from '@/db/migrations';

SplashScreen.preventAutoHideAsync();

/** Se monta recién cuando la BD está lista (SQLiteProvider espera a onInit). */
function HideSplash() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        onInit={migrateDbIfNeeded}>
        <HideSplash />
        <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Inicio' }} />
          <Stack.Screen name="expense/new" options={{ presentation: 'modal', title: 'Nuevo gasto' }} />
          <Stack.Screen name="expense/[id]" options={{ title: 'Editar gasto' }} />
          <Stack.Screen name="categories/index" options={{ title: 'Categorías' }} />
          <Stack.Screen name="categories/[id]" options={{ title: 'Categoría' }} />
        </Stack>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
