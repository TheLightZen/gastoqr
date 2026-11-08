import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { UNCATEGORIZED_COLOR } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { BANK_LABELS, type ExpenseListItem } from '@/db/types';
import { formatDay, formatTime } from '@/lib/dates';
import { formatCents } from '@/lib/money';

import { ThemedText } from './themed-text';
import { CategoryBadge } from './ui';

type Props = {
  expense: ExpenseListItem;
  /** Mostrar el día además de la hora (cuando la lista no está agrupada por día). */
  showDay?: boolean;
};

export function ExpenseRow({ expense, showDay }: Props) {
  const title = expense.recipient ?? expense.category_name ?? 'Sin categoría';
  const when = showDay
    ? `${formatDay(expense.paid_at.slice(0, 10))} · ${formatTime(expense.paid_at)}`
    : formatTime(expense.paid_at);
  const details = [when, BANK_LABELS[expense.bank], expense.note].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/expense/[id]', params: { id: expense.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <CategoryBadge
        icon={expense.category_icon}
        color={expense.category_color ?? UNCATEGORIZED_COLOR}
      />
      <View style={styles.middle}>
        <ThemedText numberOfLines={1}>{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {details}
        </ThemedText>
      </View>
      <ThemedText style={styles.amount}>{formatCents(expense.amount_cents)}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
  middle: {
    flex: 1,
  },
  amount: {
    fontWeight: 600,
    fontVariant: ['tabular-nums'],
  },
});
