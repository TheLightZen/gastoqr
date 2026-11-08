import type { SQLiteDatabase } from 'expo-sqlite';

import { monthRange, toLocalIso, type MonthKey } from '@/lib/dates';
import { buildDedupKey } from '@/lib/dedup';
import { emptyToNull, normalizeRecipient } from '@/lib/normalize';

import type { Bank, Expense, ExpenseListItem, Source } from './types';

export type ExpenseInput = {
  amountCents: number;
  paidAt: string; // hora local 'YYYY-MM-DDTHH:mm:ss'
  recipient: string | null;
  categoryId: number | null;
  bank: Bank;
  source: Source;
  transactionRef?: string | null;
  note?: string | null;
  rawText?: string | null;
};

export type ExpenseFilters = {
  month: MonthKey;
  categoryId?: number | null; // undefined = todas
  bank?: Bank | null; // undefined/null = todos
};

const LIST_SELECT = `
  SELECT e.*,
         c.name  AS category_name,
         c.icon  AS category_icon,
         c.color AS category_color
    FROM expenses e
    LEFT JOIN categories c ON c.id = e.category_id`;

/** Calcula los campos derivados (normalizado y clave de duplicado). */
function derivedFields(input: ExpenseInput) {
  const recipient = emptyToNull(input.recipient);
  const recipientNormalized = normalizeRecipient(recipient);
  const transactionRef = emptyToNull(input.transactionRef);
  return {
    recipient,
    recipientNormalized,
    transactionRef,
    note: emptyToNull(input.note),
    dedupKey: buildDedupKey({
      bank: input.bank,
      transactionRef,
      amountCents: input.amountCents,
      recipientNormalized,
      paidAt: input.paidAt,
    }),
  };
}

export async function insertExpense(db: SQLiteDatabase, input: ExpenseInput): Promise<number> {
  const d = derivedFields(input);
  const result = await db.runAsync(
    `INSERT INTO expenses
       (amount_cents, currency, paid_at, recipient, recipient_normalized, category_id,
        bank, source, transaction_ref, note, raw_text, dedup_key, created_at)
     VALUES (?, 'BOB', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.amountCents,
    input.paidAt,
    d.recipient,
    d.recipientNormalized,
    input.categoryId,
    input.bank,
    input.source,
    d.transactionRef,
    d.note,
    input.rawText ?? null,
    d.dedupKey,
    toLocalIso(new Date()),
  );
  return result.lastInsertRowId;
}

/** Actualiza los campos editables. `source` y `raw_text` no cambian al editar. */
export async function updateExpense(
  db: SQLiteDatabase,
  id: number,
  input: ExpenseInput,
): Promise<void> {
  const d = derivedFields(input);
  await db.runAsync(
    `UPDATE expenses
        SET amount_cents = ?, paid_at = ?, recipient = ?, recipient_normalized = ?,
            category_id = ?, bank = ?, transaction_ref = ?, note = ?, dedup_key = ?
      WHERE id = ?`,
    input.amountCents,
    input.paidAt,
    d.recipient,
    d.recipientNormalized,
    input.categoryId,
    input.bank,
    d.transactionRef,
    d.note,
    d.dedupKey,
    id,
  );
}

export async function deleteExpense(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}

export function getExpense(db: SQLiteDatabase, id: number): Promise<Expense | null> {
  return db.getFirstAsync<Expense>('SELECT * FROM expenses WHERE id = ?', id);
}

export function listExpenses(
  db: SQLiteDatabase,
  filters: ExpenseFilters,
): Promise<ExpenseListItem[]> {
  const { start, end } = monthRange(filters.month);
  const where = ['e.paid_at >= ?', 'e.paid_at < ?'];
  const params: (string | number)[] = [start, end];

  if (filters.categoryId !== undefined) {
    if (filters.categoryId === null) {
      where.push('e.category_id IS NULL');
    } else {
      where.push('e.category_id = ?');
      params.push(filters.categoryId);
    }
  }
  if (filters.bank) {
    where.push('e.bank = ?');
    params.push(filters.bank);
  }

  return db.getAllAsync<ExpenseListItem>(
    `${LIST_SELECT} WHERE ${where.join(' AND ')} ORDER BY e.paid_at DESC, e.id DESC`,
    params,
  );
}

export function listRecentExpenses(db: SQLiteDatabase, limit: number): Promise<ExpenseListItem[]> {
  return db.getAllAsync<ExpenseListItem>(
    `${LIST_SELECT} ORDER BY e.paid_at DESC, e.id DESC LIMIT ?`,
    limit,
  );
}

/** Banco del último gasto creado, para preseleccionarlo. */
export async function getLastUsedBank(db: SQLiteDatabase): Promise<Bank | null> {
  const row = await db.getFirstAsync<{ bank: Bank }>(
    'SELECT bank FROM expenses ORDER BY created_at DESC, id DESC LIMIT 1',
  );
  return row?.bank ?? null;
}
