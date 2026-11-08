import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCents } from '@/lib/money';

import { ThemedText } from './themed-text';
import { CategoryGlyph } from './ui';

export type BreakdownItem = {
  key: string;
  label: string;
  totalCents: number;
  color: string;
  icon?: string | null;
};

type Props = { items: BreakdownItem[]; totalCents: number };

/** Barras horizontales: etiqueta, monto, % del total. Hechas con Views. */
export function BarBreakdown({ items, totalCents }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const ratio = totalCents > 0 ? item.totalCents / totalCents : 0;
        return (
          <View key={item.key} style={styles.item}>
            <View style={styles.header}>
              {item.icon !== undefined && (
                <CategoryGlyph icon={item.icon} size={16} color={item.color} />
              )}
              <ThemedText type="small" style={styles.label} numberOfLines={1}>
                {item.label}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {Math.round(ratio * 100)}%
              </ThemedText>
              <ThemedText type="smallBold" style={styles.amount}>
                {formatCents(item.totalCents)}
              </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.max(ratio * 100, 1)}%`, backgroundColor: item.color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  item: {
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    flex: 1,
  },
  amount: {
    minWidth: 90,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
