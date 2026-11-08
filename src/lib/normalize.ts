/**
 * Normaliza un destinatario para poder compararlo:
 * "  Pensión  DOÑA María " → "pension dona maria".
 * Devuelve null si queda vacío.
 */
export function normalizeRecipient(recipient: string | null | undefined): string | null {
  if (!recipient) return null;
  const normalized = recipient
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return normalized === '' ? null : normalized;
}

/** Recorta y convierte "" en null (para campos de texto opcionales). */
export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
