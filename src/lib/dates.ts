/**
 * Las fechas se guardan en hora local de Bolivia (UTC−4, sin horario de verano)
 * con el formato 'YYYY-MM-DDTHH:mm:ss', sin zona horaria. Así el mes de un gasto
 * es simplemente substr(paid_at, 1, 7) y se puede comparar como texto.
 */

export type MonthKey = string; // 'YYYY-MM'
export type DayKey = string; // 'YYYY-MM-DD'

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const pad = (n: number) => String(n).padStart(2, '0');
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Date → 'YYYY-MM-DDTHH:mm:ss' en hora local. */
export function toLocalIso(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/** 'YYYY-MM-DDTHH:mm:ss' (hora local) → Date. */
export function fromLocalIso(iso: string): Date {
  const [datePart, timePart = '00:00:00'] = iso.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [h = 0, mi = 0, s = 0] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, h, mi, s);
}

export function monthKeyOf(date: Date): MonthKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function currentMonthKey(): MonthKey {
  return monthKeyOf(new Date());
}

export function addMonths(month: MonthKey, delta: number): MonthKey {
  const [y, m] = month.split('-').map(Number);
  return monthKeyOf(new Date(y, m - 1 + delta, 1));
}

/** Rango [start, end) para filtrar con `paid_at >= start AND paid_at < end`. */
export function monthRange(month: MonthKey): { start: string; end: string } {
  return { start: `${month}-01T00:00:00`, end: `${addMonths(month, 1)}-01T00:00:00` };
}

/** '2026-11' → 'Noviembre 2026' */
export function formatMonth(month: MonthKey): string {
  const [y, m] = month.split('-').map(Number);
  return `${capitalize(MONTHS[m - 1])} ${y}`;
}

/** '2026-11' → 'noviembre' */
export function monthName(month: MonthKey): string {
  return MONTHS[Number(month.split('-')[1]) - 1];
}

export function dayKeyOf(iso: string): DayKey {
  return iso.slice(0, 10);
}

/** 'Hoy', 'Ayer' o 'Lunes 3 de noviembre' (con año si no es el actual). */
export function formatDay(day: DayKey, now: Date = new Date()): string {
  const today = toLocalIso(now).slice(0, 10);
  const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterday = toLocalIso(yesterdayDate).slice(0, 10);
  if (day === today) return 'Hoy';
  if (day === yesterday) return 'Ayer';
  const date = fromLocalIso(day);
  const base = `${capitalize(WEEKDAYS[date.getDay()])} ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear() ? base : `${base} de ${date.getFullYear()}`;
}

/** '2026-11-08T14:05:00' → '14:05' */
export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

/** '2026-11-08T14:07:31' → '2026-11-08T14:00' (bloques de 10 minutos, para duplicados). */
export function roundToTenMinutes(iso: string): string {
  return `${iso.slice(0, 15)}0`;
}
