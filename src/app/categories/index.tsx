import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, CategoryBadge } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { listCategories } from '@/db/categories';
import { useQuery } from '@/hooks/use-query';
import { useTheme } from '@/hooks/use-theme';
import { formatCents } from '@/lib/money';

export default function CategoriesScreen() {
  const theme = useTheme();
  const { data: categories = [] } = useQuery(listCategories);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      {categories.map((c) => (
        <Pressable
          key={c.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/categories/[id]', params: { id: c.id } })}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <CategoryBadge icon={c.icon} color={c.color} />
          <View style={styles.rowText}>
            <ThemedText>{c.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {c.monthly_budget_cents !== null
                ? `Presupuesto: ${formatCents(c.monthly_budget_cents)} al mes`
                : 'Sin presupuesto'}
            </ThemedText>
          </View>
        </Pressable>
      ))}

      <Button
        title="Nueva categoría"
        variant="secondary"
        onPress={() => router.push({ pathname: '/categories/[id]', params: { id: 'new' } })}
        style={styles.add}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  add: {
    marginTop: Spacing.three,
  },
});
