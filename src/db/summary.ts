import type { SQLiteDatabase } from 'expo-sqlite';

import { monthRange, type MonthKey } from '@/lib/dates';

import type { Bank } from './types';

export type MonthTotal = { totalCents: number; count: number };

export type CategoryTotal = {
  category_id: number | null; // null = sin categoría
  name: string | null;
  icon: string | null;
  color: string | null;
  total_cents: number;
  count: number;
};

export type BankTotal = { bank: Bank; total_cents: number; count: number };

export async function getMonthTotal(db: SQLiteDatabase, month: MonthKey): Promise<MonthTotal> {
  const { start, end } = monthRange(month);
  const row = await db.getFirstAsync<{ total: number; count: number }>(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total, COUNT(*) AS count
       FROM expenses WHERE paid_at >= ? AND paid_at < ?`,
    start,
    end,
  );
  return { totalCents: row?.total ?? 0, count: row?.count ?? 0 };
}

/** Totales por categoría, de mayor a menor. Incluye "sin categoría" si hay. */
export function getTotalsByCategory(
  db: SQLiteDatabase,
  month: MonthKey,
): Promise<CategoryTotal[]> {
  const { start, end } = monthRange(month);
  return db.getAllAsync<CategoryTotal>(
    `SELECT e.category_id, c.name, c.icon, c.color,
            SUM(e.amount_cents) AS total_cents, COUNT(*) AS count
       FROM expenses e
       LEFT JOIN categories c ON c.id = e.category_id
      WHERE e.paid_at >= ? AND e.paid_at < ?
      GROUP BY e.category_id
      ORDER BY total_cents DESC`,
    start,
    end,
  );
}

export function getTotalsByBank(db: SQLiteDatabase, month: MonthKey): Promise<BankTotal[]> {
  const { start, end } = monthRange(month);
  return db.getAllAsync<BankTotal>(
    `SELECT bank, SUM(amount_cents) AS total_cents, COUNT(*) AS count
       FROM expenses
      WHERE paid_at >= ? AND paid_at < ?
      GROUP BY bank
      ORDER BY total_cents DESC`,
    start,
    end,
  );
}
