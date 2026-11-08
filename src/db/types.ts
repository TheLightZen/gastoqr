export const BANKS = ['BCP', 'BNB', 'BMSC', 'OTHER', 'CASH'] as const;
export type Bank = (typeof BANKS)[number];

export const BANK_LABELS: Record<Bank, string> = {
  BCP: 'BCP',
  BNB: 'BNB',
  BMSC: 'Mercantil',
  OTHER: 'Otro banco',
  CASH: 'Efectivo',
};

export const SOURCES = ['manual', 'image', 'share', 'notification'] as const;
export type Source = (typeof SOURCES)[number];

export type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
  monthly_budget_cents: number | null;
  created_at: string;
};

export type Expense = {
  id: number;
  amount_cents: number;
  currency: string;
  paid_at: string;
  recipient: string | null;
  recipient_normalized: string | null;
  category_id: number | null;
  bank: Bank;
  source: Source;
  transaction_ref: string | null;
  note: string | null;
  raw_text: string | null;
  dedup_key: string;
  created_at: string;
};

/** Gasto con los datos de su categoría (LEFT JOIN), para mostrar en listas. */
export type ExpenseListItem = Expense & {
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
};
