import type { SQLiteDatabase } from 'expo-sqlite';

import { toLocalIso } from '@/lib/dates';

import type { Category } from './types';

export type CategoryInput = {
  name: string;
  icon: string;
  color: string;
  monthlyBudgetCents: number | null;
};

/** Todas las categorías, por orden de creación (las por defecto primero). */
export function listCategories(db: SQLiteDatabase): Promise<Category[]> {
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY id');
}

/**
 * Categorías ordenadas por uso en los últimos 60 días, para que las más usadas
 * aparezcan primero al registrar un gasto.
 */
export function listCategoriesByUsage(db: SQLiteDatabase): Promise<Category[]> {
  const since = new Date();
  since.setDate(since.getDate() - 60);
  return db.getAllAsync<Category>(
    `SELECT c.*
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.paid_at >= ?
      GROUP BY c.id
      ORDER BY COUNT(e.id) DESC, c.id`,
    toLocalIso(since),
  );
}

export function getCategory(db: SQLiteDatabase, id: number): Promise<Category | null> {
  return db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', id);
}

export async function categoryNameExists(
  db: SQLiteDatabase,
  name: string,
  exceptId?: number,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND id != ?',
    name.trim(),
    exceptId ?? -1,
  );
  return row !== null;
}

export async function createCategory(db: SQLiteDatabase, input: CategoryInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO categories (name, icon, color, monthly_budget_cents, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    input.name.trim(),
    input.icon,
    input.color,
    input.monthlyBudgetCents,
    toLocalIso(new Date()),
  );
  return result.lastInsertRowId;
}

export async function updateCategory(
  db: SQLiteDatabase,
  id: number,
  input: CategoryInput,
): Promise<void> {
  await db.runAsync(
    `UPDATE categories SET name = ?, icon = ?, color = ?, monthly_budget_cents = ? WHERE id = ?`,
    input.name.trim(),
    input.icon,
    input.color,
    input.monthlyBudgetCents,
    id,
  );
}

/** Los gastos de la categoría quedan "Sin categoría" (ON DELETE SET NULL). */
export async function deleteCategory(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM categories WHERE id = ?', id);
}

export async function countExpensesInCategory(db: SQLiteDatabase, id: number): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM expenses WHERE category_id = ?',
    id,
  );
  return row?.n ?? 0;
}
