import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Botón flotante "+" para registrar un gasto. */
export function AddExpenseButton() {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Nuevo gasto"
      onPress={() => router.push('/expense/new')}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
      ]}>
      <SymbolView
        name={{ ios: 'plus', android: 'add', web: 'add' }}
        size={30}
        tintColor={theme.onTint}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
});
