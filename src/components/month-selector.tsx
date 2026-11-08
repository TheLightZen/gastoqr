import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addMonths, currentMonthKey, formatMonth, type MonthKey } from '@/lib/dates';

import { ThemedText } from './themed-text';

type Props = { month: MonthKey; onChange: (month: MonthKey) => void };

export function MonthSelector({ month, onChange }: Props) {
  const theme = useTheme();
  const isCurrent = month >= currentMonthKey();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Mes anterior"
        hitSlop={12}
        onPress={() => onChange(addMonths(month, -1))}
        style={({ pressed }) => pressed && styles.pressed}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={24}
          tintColor={theme.tint}
        />
      </Pressable>
      <ThemedText type="smallBold" style={styles.label}>
        {formatMonth(month)}
      </ThemedText>
      <Pressable
        accessibilityLabel="Mes siguiente"
        hitSlop={12}
        disabled={isCurrent}
        onPress={() => onChange(addMonths(month, 1))}
        style={({ pressed }) => [isCurrent && styles.disabled, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={24}
          tintColor={theme.tint}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  label: {
    fontSize: 17,
  },
  pressed: {
    opacity: 0.5,
  },
  disabled: {
    opacity: 0.25,
  },
});
