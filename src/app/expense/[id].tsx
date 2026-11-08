import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ExpenseForm } from '@/components/expense-form';
import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui';
import { deleteExpense, getExpense, updateExpense } from '@/db/expenses';
import type { Expense } from '@/db/types';
import { useQuery } from '@/hooks/use-query';
import { formatCents } from '@/lib/money';

export default function EditExpenseScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const { data: fetched, loading } = useQuery((d) => getExpense(d, expenseId), [expenseId]);

  // Congelamos el gasto la primera vez que llega: el formulario usa estos valores
  // iniciales y no debe reiniciarse si la BD cambia mientras se edita.
  const [expense, setExpense] = useState<Expense | null | undefined>(undefined);
  if (expense === undefined && fetched !== undefined) setExpense(fetched);

  if (expense === undefined) return loading ? null : <NotFound />;
  if (expense === null) return <NotFound />;

  const confirmDelete = () => {
    Alert.alert('Eliminar gasto', `¿Eliminar este gasto de ${formatCents(expense.amount_cents)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(db, expense.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ExpenseForm
      source={expense.source}
      submitLabel="Guardar cambios"
      initial={{
        amountCents: expense.amount_cents,
        categoryId: expense.category_id,
        bank: expense.bank,
        paidAt: expense.paid_at,
        recipient: expense.recipient,
        note: expense.note,
      }}
      onSubmit={async (input) => {
        await updateExpense(db, expense.id, {
          ...input,
          transactionRef: expense.transaction_ref,
          rawText: expense.raw_text,
        });
        router.back();
      }}
      onDelete={confirmDelete}
    />
  );
}

function NotFound() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <EmptyState title="Este gasto ya no existe" />
    </ThemedView>
  );
}
