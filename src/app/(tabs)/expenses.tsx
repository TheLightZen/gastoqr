import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddExpenseButton } from '@/components/add-expense-button';
import { ExpenseRow } from '@/components/expense-row';
import { MonthSelector } from '@/components/month-selector';
import { FilterBar } from '@/components/pickers';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { listCategories } from '@/db/categories';
import { listExpenses } from '@/db/expenses';
import type { Bank, ExpenseListItem } from '@/db/types';
import { useQuery } from '@/hooks/use-query';
import { useTheme } from '@/hooks/use-theme';
import { currentMonthKey, dayKeyOf, formatDay } from '@/lib/dates';
import { formatCents } from '@/lib/money';

type DaySection = { day: string; totalCents: number; data: ExpenseListItem[] };

function groupByDay(expenses: ExpenseListItem[]): DaySection[] {
  const sections: DaySection[] = [];
  for (const e of expenses) {
    const day = dayKeyOf(e.paid_at);
    let section = sections[sections.length - 1];
    if (!section || section.day !== day) {
      section = { day, totalCents: 0, data: [] };
      sections.push(section);
    }
    section.data.push(e);
    section.totalCents += e.amount_cents;
  }
  return sections;
}

export default function ExpensesScreen() {
  const theme = useTheme();
  const [month, setMonth] = useState(currentMonthKey());
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [bank, setBank] = useState<Bank | undefined>(undefined);

  const { data: categories = [] } = useQuery(listCategories);
  const { data: expenses = [], loading } = useQuery(
    (db) => listExpenses(db, { month, categoryId, bank }),
    [month, categoryId, bank],
  );

  const sections = groupByDay(expenses);
  const totalCents = expenses.reduce((sum, e) => sum + e.amount_cents, 0);
  const hasFilters = categoryId !== undefined || bank !== undefined;

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.padded}>
              <ThemedText type="subtitle">Gastos</ThemedText>
              <MonthSelector month={month} onChange={setMonth} />
            </View>
            <FilterBar
              categories={categories}
              categoryId={categoryId}
              onCategoryChange={setCategoryId}
              bank={bank}
              onBankChange={setBank}
            />
            {expenses.length > 0 && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.padded}>
                {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'} · Total{' '}
                {formatCents(totalCents)}
              </ThemedText>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, styles.padded]}>
            <ThemedText type="smallBold">{formatDay(section.day)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatCents(section.totalCents)}
            </ThemedText>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.padded}>
            <ExpenseRow expense={item} />
          </View>
        )}
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState
              title={hasFilters ? 'No hay gastos con estos filtros' : 'No hay gastos este mes'}
              hint={hasFilters ? undefined : 'Toca + para registrar uno'}
            />
          )
        }
      />
      <AddExpenseButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six + Spacing.five,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  padded: {
    paddingHorizontal: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
});
