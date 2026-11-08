import type { SQLiteDatabase } from 'expo-sqlite';

import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { toLocalIso } from '@/lib/dates';

export const DATABASE_NAME = 'gastoqr.db';

/**
 * Cada migración lleva la BD de la versión (índice) a la versión (índice + 1).
 * Nunca modificar una migración ya publicada: agregar una nueva al final.
 */
const MIGRATIONS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  // v1: esquema inicial + categorías por defecto
  async (db) => {
    await db.execAsync(`
      CREATE TABLE categories (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        name                 TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        icon                 TEXT    NOT NULL,
        color                TEXT    NOT NULL,
        monthly_budget_cents INTEGER CHECK (monthly_budget_cents IS NULL OR monthly_budget_cents >= 0),
        created_at           TEXT    NOT NULL
      );

      CREATE TABLE expenses (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        amount_cents         INTEGER NOT NULL CHECK (amount_cents > 0),
        currency             TEXT    NOT NULL DEFAULT 'BOB',
        paid_at              TEXT    NOT NULL,
        recipient            TEXT,
        recipient_normalized TEXT,
        category_id          INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        bank                 TEXT    NOT NULL CHECK (bank IN ('BCP','BNB','BMSC','OTHER','CASH')),
        source               TEXT    NOT NULL CHECK (source IN ('manual','image','share','notification')),
        transaction_ref      TEXT,
        note                 TEXT,
        raw_text             TEXT,
        dedup_key            TEXT    NOT NULL,
        created_at           TEXT    NOT NULL
      );
      CREATE INDEX idx_expenses_paid_at  ON expenses(paid_at);
      CREATE INDEX idx_expenses_category ON expenses(category_id);
      CREATE INDEX idx_expenses_dedup    ON expenses(dedup_key);

      CREATE TABLE recipient_rules (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_normalized TEXT    NOT NULL UNIQUE,
        category_id          INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        times_used           INTEGER NOT NULL DEFAULT 0
      );
    `);

    const now = toLocalIso(new Date());
    for (const c of DEFAULT_CATEGORIES) {
      await db.runAsync(
        'INSERT INTO categories (name, icon, color, created_at) VALUES (?, ?, ?, ?)',
        c.name,
        c.icon,
        c.color,
        now,
      );
    }
  },
];

/** Se ejecuta en `SQLiteProvider.onInit`, antes de mostrar la app. */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Estos PRAGMA son por conexión: se aplican en cada arranque.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  while (version < MIGRATIONS.length) {
    const migration = MIGRATIONS[version];
    const next = version + 1;
    await db.withTransactionAsync(async () => {
      await migration(db);
      // PRAGMA no acepta parámetros; `next` es un entero controlado por nosotros.
      await db.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}
