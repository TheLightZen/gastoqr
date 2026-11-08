import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, CategoryBadge, CategoryGlyph, EmptyState, SectionTitle } from '@/components/ui';
import { CATEGORY_COLORS, CATEGORY_ICON_KEYS } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import {
  categoryNameExists,
  countExpensesInCategory,
  createCategory,
  deleteCategory,
  getCategory,
  updateCategory,
} from '@/db/categories';
import type { Category } from '@/db/types';
import { useQuery } from '@/hooks/use-query';
import { useTheme } from '@/hooks/use-theme';
import { centsToInput, parseAmountToCents } from '@/lib/money';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const categoryId = Number(id);

  const { data: fetched, loading } = useQuery(
    (db) => (isNew ? Promise.resolve(null) : getCategory(db, categoryId)),
    [id],
  );

  // Congelar los valores iniciales la primera vez que llegan.
  const [initial, setInitial] = useState<Category | null | undefined>(undefined);
  if (initial === undefined && fetched !== undefined) setInitial(fetched);

  if (initial === undefined) return loading ? null : <EmptyState title="Categoría no encontrada" />;
  if (!isNew && initial === null) return <EmptyState title="Categoría no encontrada" />;

  return <CategoryForm category={initial} />;
}

function CategoryForm({ category }: { category: Category | null }) {
  const db = useSQLiteContext();
  const theme = useTheme();

  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICON_KEYS[0]);
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0]);
  const [budgetText, setBudgetText] = useState(
    category?.monthly_budget_cents != null ? centsToInput(category.monthly_budget_cents) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Escribe un nombre');
      return;
    }
    let monthlyBudgetCents: number | null = null;
    if (budgetText.trim()) {
      monthlyBudgetCents = parseAmountToCents(budgetText);
      if (monthlyBudgetCents === null) {
        setError('El presupuesto no es un monto válido');
        return;
      }
    }
    setSaving(true);
    try {
      if (await categoryNameExists(db, trimmed, category?.id)) {
        setError(`Ya existe una categoría llamada "${trimmed}"`);
        return;
      }
      const input = { name: trimmed, icon, color, monthlyBudgetCents };
      if (category) await updateCategory(db, category.id, input);
      else await createCategory(db, input);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!category) return;
    const count = await countExpensesInCategory(db, category.id);
    const detail =
      count > 0
        ? `Sus ${count} ${count === 1 ? 'gasto quedará' : 'gastos quedarán'} como "Sin categoría".`
        : 'No tiene gastos.';
    Alert.alert(`Eliminar "${category.name}"`, detail, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteCategory(db, category.id);
          router.back();
        },
      },
    ]);
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  return (
    <>
      <Stack.Screen options={{ title: category ? 'Editar categoría' : 'Nueva categoría' }} />
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.preview}>
          <CategoryBadge icon={icon} color={color} size={64} />
        </View>

        <SectionTitle>Nombre</SectionTitle>
        <TextInput
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError(null);
          }}
          placeholder="Ej.: Universidad"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="sentences"
          maxLength={30}
          style={inputStyle}
        />

        <SectionTitle>Ícono</SectionTitle>
        <View style={styles.grid}>
          {CATEGORY_ICON_KEYS.map((key) => {
            const selected = key === icon;
            return (
              <Pressable
                key={key}
                accessibilityLabel={key}
                accessibilityState={{ selected }}
                onPress={() => setIcon(key)}
                style={[
                  styles.iconCell,
                  { backgroundColor: selected ? color : theme.backgroundElement },
                ]}>
                <CategoryGlyph icon={key} size={22} color={selected ? '#fff' : theme.text} />
              </Pressable>
            );
          })}
        </View>

        <SectionTitle>Color</SectionTitle>
        <View style={styles.grid}>
          {CATEGORY_COLORS.map((c) => (
            <Pressable
              key={c}
              accessibilityLabel={`Color ${c}`}
              accessibilityState={{ selected: c === color }}
              onPress={() => setColor(c)}
              style={[
                styles.colorCell,
                { backgroundColor: c },
                c === color && { borderWidth: 3, borderColor: theme.text },
              ]}
            />
          ))}
        </View>

        <SectionTitle>Presupuesto mensual (opcional)</SectionTitle>
        <TextInput
          value={budgetText}
          onChangeText={(t) => {
            setBudgetText(t);
            setError(null);
          }}
          placeholder="Ej.: 600"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          style={inputStyle}
        />
        <ThemedText type="small" themeColor="textSecondary">
          Pronto la app te avisará al llegar al 80% y al 100% de este monto.
        </ThemedText>

        {error && (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {error}
          </ThemedText>
        )}

        <Button title={saving ? 'Guardando…' : 'Guardar'} onPress={save} disabled={saving} />
        {category && <Button title="Eliminar categoría" variant="danger" onPress={confirmDelete} />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 4,
    borderRadius: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
