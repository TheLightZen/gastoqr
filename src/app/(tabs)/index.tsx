import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AddExpenseButton } from '@/components/add-expense-button';
import { BarBreakdown } from '@/components/bar-breakdown';
import { ExpenseRow } from '@/components/expense-row';
import { TabScreen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card, EmptyState, SectionTitle } from '@/components/ui';
import { UNCATEGORIZED_COLOR } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { listRecentExpenses } from '@/db/expenses';
import { getMonthTotal, getTotalsByCategory } from '@/db/summary';
import { useQuery } from '@/hooks/use-query';
import { useTheme } from '@/hooks/use-theme';
import { currentMonthKey, formatMonth } from '@/lib/dates';
import { formatCents } from '@/lib/money';

export default function HomeScreen() {
  const theme = useTheme();
  const month = currentMonthKey();

  const { data: total } = useQuery((db) => getMonthTotal(db, month), [month]);
  const { data: byCategory = [] } = useQuery((db) => getTotalsByCategory(db, month), [month]);
  const { data: recent = [] } = useQuery((db) => listRecentExpenses(db, 5));

  const top = byCategory.slice(0, 3).map((c) => ({
    key: String(c.category_id),
    label: c.name ?? 'Sin categoría',
    totalCents: c.total_cents,
    color: c.color ?? UNCATEGORIZED_COLOR,
    icon: c.icon,
  }));

  return (
    <TabScreen title="GastoQR" overlay={<AddExpenseButton />}>
      <Card style={styles.totalCard}>
        <ThemedText type="small" themeColor="textSecondary">
          Gastado en {formatMonth(month).toLowerCase()}
        </ThemedText>
        <ThemedText style={styles.total}>{formatCents(total?.totalCents ?? 0)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {total?.count ?? 0} {total?.count === 1 ? 'gasto' : 'gastos'}
        </ThemedText>
      </Card>

      {top.length > 0 && (
        <>
          <SectionTitle>Top categorías</SectionTitle>
          <Card>
            <BarBreakdown items={top} totalCents={total?.totalCents ?? 0} />
          </Card>
        </>
      )}

      <SectionTitle
        right={
          recent.length > 0 && (
            <Link href="/expenses">
              <ThemedText type="small" style={{ color: theme.tint }}>
                Ver todos
              </ThemedText>
            </Link>
          )
        }>
        Últimos gastos
      </SectionTitle>
      {recent.length === 0 ? (
        <EmptyState title="Todavía no registraste gastos" hint="Toca + para agregar el primero" />
      ) : (
        <View>
          {recent.map((e) => (
            <ExpenseRow key={e.id} expense={e} showDay />
          ))}
        </View>
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    gap: Spacing.one,
    paddingVertical: Spacing.four,
  },
  total: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
});
