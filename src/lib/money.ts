/**
 * Dinero siempre en centavos como entero (2550 = Bs 25,50).
 * Nunca se usan números con decimales para montos: todo el parseo es sobre strings.
 */

const MAX_CENTS = 99_999_999_99; // Bs 99.999.999,99

/**
 * Convierte lo que escribe el usuario a centavos.
 * Acepta "25", "25,5", "25,50", "25.50", "1.234,50", "1,234.50", "Bs 25,50".
 * Devuelve null si el texto no es un monto válido o es 0.
 */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.replace(/bs\.?|bob/gi, '').replace(/\s/g, '');
  if (!/^[\d.,]+$/.test(cleaned)) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let integerPart: string;
  let fractionPart = '';

  if (lastComma !== -1 && lastDot !== -1) {
    // Ambos separadores: el último es el decimal, el otro es de miles.
    const decimalIndex = Math.max(lastComma, lastDot);
    integerPart = cleaned.slice(0, decimalIndex).replace(/[.,]/g, '');
    fractionPart = cleaned.slice(decimalIndex + 1);
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? ',' : '.';
    const parts = cleaned.split(sep);
    const last = parts[parts.length - 1];
    if (parts.length === 2 && last.length <= 2) {
      // "25,5" / "25.50" → decimal
      integerPart = parts[0];
      fractionPart = last;
    } else if (parts.slice(1).every((p) => p.length === 3)) {
      // "1.234" / "1,234,567" → miles
      integerPart = parts.join('');
    } else {
      return null;
    }
  } else {
    integerPart = cleaned;
  }

  if (/[.,]/.test(fractionPart) || fractionPart.length > 2) return null;
  if (integerPart === '' && fractionPart === '') return null;

  const cents =
    Number(integerPart || '0') * 100 + Number(fractionPart.padEnd(2, '0') || '0');
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_CENTS) return null;
  return cents;
}

function groupThousands(integer: number): string {
  return String(integer).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 123450 → "1.234,50" (formato boliviano: punto para miles, coma para decimales). */
export function formatCentsPlain(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.trunc(cents));
  const integer = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, '0');
  return `${sign}${groupThousands(integer)},${fraction}`;
}

/** 123450 → "Bs 1.234,50" */
export function formatCents(cents: number): string {
  return `Bs ${formatCentsPlain(cents)}`;
}

/** Valor para precargar un campo editable: 2550 → "25,50", 2500 → "25". */
export function centsToInput(cents: number): string {
  const integer = Math.floor(cents / 100);
  const fraction = cents % 100;
  return fraction === 0 ? String(integer) : `${integer},${String(fraction).padStart(2, '0')}`;
}
