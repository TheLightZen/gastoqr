import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ExpenseForm } from '@/components/expense-form';
import { getLastUsedBank, insertExpense } from '@/db/expenses';
import { useQuery } from '@/hooks/use-query';
import { toLocalIso } from '@/lib/dates';

export default function NewExpenseScreen() {
  const db = useSQLiteContext();
  const { data: lastBank, loading } = useQuery(getLastUsedBank);

  // Esperar el último banco usado para preseleccionarlo.
  if (loading && lastBank === undefined) return null;

  return (
    <ExpenseForm
      source="manual"
      autoFocusAmount
      submitLabel="Guardar"
      initial={{
        amountCents: null,
        categoryId: null,
        bank: lastBank ?? 'OTHER',
        paidAt: toLocalIso(new Date()),
        recipient: null,
        note: null,
      }}
      onSubmit={async (input) => {
        await insertExpense(db, input);
        router.back();
      }}
    />
  );
}
