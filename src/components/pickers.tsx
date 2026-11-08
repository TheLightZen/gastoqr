import { ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { BANK_LABELS, BANKS, type Bank, type Category } from '@/db/types';

import { Chip } from './ui';

type CategoryPickerProps = {
  categories: Category[];
  value: number | null;
  onChange: (id: number | null) => void;
};

/** Botones de categoría. Tocar la seleccionada la deselecciona. */
export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <View style={styles.wrap}>
      {categories.map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          icon={c.icon}
          color={c.color}
          selected={value === c.id}
          onPress={() => onChange(value === c.id ? null : c.id)}
        />
      ))}
    </View>
  );
}

type BankPickerProps = { value: Bank; onChange: (bank: Bank) => void };

export function BankPicker({ value, onChange }: BankPickerProps) {
  return (
    <View style={styles.wrap}>
      {BANKS.map((b) => (
        <Chip key={b} label={BANK_LABELS[b]} selected={value === b} onPress={() => onChange(b)} />
      ))}
    </View>
  );
}

type FilterBarProps = {
  categories: Category[];
  categoryId: number | undefined;
  onCategoryChange: (id: number | undefined) => void;
  bank: Bank | undefined;
  onBankChange: (bank: Bank | undefined) => void;
};

/** Filtros horizontales de la lista de gastos. */
export function FilterBar({
  categories,
  categoryId,
  onCategoryChange,
  bank,
  onBankChange,
}: FilterBarProps) {
  return (
    <View style={styles.filters}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip label="Todas" selected={categoryId === undefined} onPress={() => onCategoryChange(undefined)} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            icon={c.icon}
            color={c.color}
            selected={categoryId === c.id}
            onPress={() => onCategoryChange(categoryId === c.id ? undefined : c.id)}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip label="Todos los bancos" selected={bank === undefined} onPress={() => onBankChange(undefined)} />
        {BANKS.map((b) => (
          <Chip
            key={b}
            label={BANK_LABELS[b]}
            selected={bank === b}
            onPress={() => onBankChange(bank === b ? undefined : b)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  filters: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
