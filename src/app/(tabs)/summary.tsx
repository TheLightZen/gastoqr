import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { BarBreakdown } from '@/components/bar-breakdown';
import { MonthSelector } from '@/components/month-selector';
import { TabScreen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card, EmptyState, SectionTitle } from '@/components/ui';
import { CATEGORY_COLORS, UNCATEGORIZED_COLOR } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { getMonthTotal, getTotalsByBank, getTotalsByCategory } from '@/db/summary';
import { BANK_LABELS } from '@/db/types';
import { useQuery } from '@/hooks/use-query';
import { useTheme } from '@/hooks/use-theme';
import { addMonths, currentMonthKey, monthName } from '@/lib/dates';
import { formatCents } from '@/lib/money';

const BANK_COLORS = {
  BCP: '#0055A5',
  BNB: '#00A859',
  BMSC: '#E30613',
  OTHER: CATEGORY_COLORS[9],
  CASH: CATEGORY_COLORS[3],
} as const;

export default function SummaryScreen() {
  const theme = useTheme();
  const [month, setMonth] = useState(currentMonthKey());
  const previous = addMonths(month, -1);

  const { data: total } = useQuery((db) => getMonthTotal(db, month), [month]);
  const { data: prevTotal } = useQuery((db) => getMonthTotal(db, previous), [previous]);
  const { data: byCategory = [] } = useQuery((db) => getTotalsByCategory(db, month), [month]);
  const { data: byBank = [] } = useQuery((db) => getTotalsByBank(db, month), [month]);

  const totalCents = total?.totalCents ?? 0;
  const prevCents = prevTotal?.totalCents ?? 0;
  const diff = totalCents - prevCents;

  let comparison: string;
  let comparisonColor: string = theme.textSecondary;
  if (prevCents === 0) {
    comparison = `Sin gastos en ${monthName(previous)} para comparar`;
  } else if (diff === 0) {
    comparison = `Igual que en ${monthName(previous)}`;
  } else {
    const pct = Math.round((Math.abs(diff) / prevCents) * 100);
    comparison = `${diff > 0 ? '▲' : '▼'} ${formatCents(Math.abs(diff))} (${pct}%) ${
      diff > 0 ? 'más' : 'menos'
    } que en ${monthName(previous)}`;
    comparisonColor = diff > 0 ? theme.danger : theme.success;
  }

  return (
    <TabScreen title="Resumen">
      <MonthSelector month={month} onChange={setMonth} />

      <Card style={styles.totalCard}>
        <ThemedText type="small" themeColor="textSecondary">
          Total del mes · {total?.count ?? 0} {total?.count === 1 ? 'gasto' : 'gastos'}
        </ThemedText>
        <ThemedText style={styles.total}>{formatCents(totalCents)}</ThemedText>
        <ThemedText type="small" style={{ color: comparisonColor }}>
          {comparison}
        </ThemedText>
      </Card>

      {totalCents === 0 ? (
        <EmptyState title="No hay gastos en este mes" />
      ) : (
        <>
          <SectionTitle>Por categoría</SectionTitle>
          <Card>
            <BarBreakdown
              totalCents={totalCents}
              items={byCategory.map((c) => ({
                key: String(c.category_id),
                label: c.name ?? 'Sin categoría',
                totalCents: c.total_cents,
                color: c.color ?? UNCATEGORIZED_COLOR,
                icon: c.icon,
              }))}
            />
          </Card>

          <SectionTitle>Por banco</SectionTitle>
          <Card>
            <BarBreakdown
              totalCents={totalCents}
              items={byBank.map((b) => ({
                key: b.bank,
                label: BANK_LABELS[b.bank],
                totalCents: b.total_cents,
                color: BANK_COLORS[b.bank],
              }))}
            />
          </Card>
        </>
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
