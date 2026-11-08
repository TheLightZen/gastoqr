import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { listCategoriesByUsage } from '@/db/categories';
import type { ExpenseInput } from '@/db/expenses';
import type { Bank, Source } from '@/db/types';
import { useQuery } from '@/hooks/use-query';
import { useTheme } from '@/hooks/use-theme';
import { fromLocalIso, toLocalIso } from '@/lib/dates';
import { centsToInput, parseAmountToCents } from '@/lib/money';

import { DateField } from './date-field';
import { BankPicker, CategoryPicker } from './pickers';
import { ThemedText } from './themed-text';
import { Button, SectionTitle } from './ui';

export type ExpenseFormValues = {
  amountCents: number | null;
  categoryId: number | null;
  bank: Bank;
  paidAt: string;
  recipient: string | null;
  note: string | null;
};

type Props = {
  initial: ExpenseFormValues;
  source: Source;
  autoFocusAmount?: boolean;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  onDelete?: () => void;
};

/**
 * Formulario de gasto (nuevo y editar). Pensado para 3 toques:
 * escribir el monto → tocar una categoría → Guardar. El resto es opcional.
 */
export function ExpenseForm({ initial, source, autoFocusAmount, submitLabel, onSubmit, onDelete }: Props) {
  const theme = useTheme();
  const { data: categories = [] } = useQuery(listCategoriesByUsage);

  const [amountText, setAmountText] = useState(
    initial.amountCents ? centsToInput(initial.amountCents) : '',
  );
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [bank, setBank] = useState<Bank>(initial.bank);
  const [paidAt, setPaidAt] = useState(() => fromLocalIso(initial.paidAt));
  const [recipient, setRecipient] = useState(initial.recipient ?? '');
  const [note, setNote] = useState(initial.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const amountCents = parseAmountToCents(amountText);
    if (amountCents === null) {
      setError('Ingresa un monto válido, por ejemplo 25,50');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        amountCents,
        categoryId,
        bank,
        paidAt: toLocalIso(paidAt),
        recipient,
        note,
        source,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el gasto');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.backgroundElement },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.flex, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.amountRow}>
          <ThemedText style={[styles.currency, { color: theme.textSecondary }]}>Bs</ThemedText>
          <TextInput
            accessibilityLabel="Monto"
            value={amountText}
            onChangeText={(t) => {
              setAmountText(t);
              if (error) setError(null);
            }}
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            autoFocus={autoFocusAmount}
            style={[styles.amountInput, { color: theme.text }]}
          />
        </View>
        {error && (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {error}
          </ThemedText>
        )}

        <SectionTitle>Categoría</SectionTitle>
        <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />

        <Button title={saving ? 'Guardando…' : submitLabel} onPress={handleSubmit} disabled={saving} />

        <SectionTitle>Banco</SectionTitle>
        <BankPicker value={bank} onChange={setBank} />

        <SectionTitle>Fecha</SectionTitle>
        <DateField value={paidAt} onChange={setPaidAt} />

        <SectionTitle>Destinatario (opcional)</SectionTitle>
        <TextInput
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Ej.: Pensión Doña María"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
          style={inputStyle}
        />

        <SectionTitle>Nota (opcional)</SectionTitle>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ej.: almuerzo con el grupo"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />

        {onDelete && (
          <Button title="Eliminar gasto" variant="danger" onPress={onDelete} style={styles.delete} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  currency: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 600,
  },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: 700,
    paddingVertical: Spacing.two,
    fontVariant: ['tabular-nums'],
  },
  input: {
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 4,
    borderRadius: 12,
  },
  delete: {
    marginTop: Spacing.four,
  },
});
