import { roundToTenMinutes } from './dates';

export type DedupInput = {
  bank: string;
  transactionRef: string | null;
  amountCents: number;
  recipientNormalized: string | null;
  paidAt: string; // hora local 'YYYY-MM-DDTHH:mm:ss'
};

/**
 * Clave para detectar el mismo pago registrado dos veces (docs/mvp.md §9):
 * - con nro. de transacción: banco + ref
 * - sin él: banco + monto + destinatario normalizado + fecha redondeada a 10 min
 */
export function buildDedupKey(input: DedupInput): string {
  const ref = input.transactionRef?.trim().toLowerCase();
  if (ref) return `${input.bank}|ref|${ref}`;
  return [
    input.bank,
    input.amountCents,
    input.recipientNormalized ?? '',
    roundToTenMinutes(input.paidAt),
  ].join('|');
}
