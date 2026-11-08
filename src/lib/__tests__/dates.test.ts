import {
  addMonths,
  formatDay,
  formatMonth,
  formatTime,
  fromLocalIso,
  monthRange,
  roundToTenMinutes,
  toLocalIso,
} from '../dates';

describe('toLocalIso / fromLocalIso', () => {
  it('usa hora local, sin zona horaria', () => {
    const d = new Date(2026, 10, 30, 22, 5, 9); // 30 nov 2026, 22:05:09 local
    expect(toLocalIso(d)).toBe('2026-11-30T22:05:09');
  });

  it('ida y vuelta', () => {
    const iso = '2026-01-02T03:04:05';
    expect(toLocalIso(fromLocalIso(iso))).toBe(iso);
  });
});

describe('meses', () => {
  it('addMonths cruza años', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-11', 0)).toBe('2026-11');
  });

  it('monthRange es [inicio, inicio del mes siguiente)', () => {
    expect(monthRange('2026-12')).toEqual({
      start: '2026-12-01T00:00:00',
      end: '2027-01-01T00:00:00',
    });
  });

  it('un gasto del 31 a las 23:59 queda en su mes', () => {
    const { start, end } = monthRange('2026-10');
    const paidAt = '2026-10-31T23:59:00';
    expect(paidAt >= start && paidAt < end).toBe(true);
  });

  it('formatMonth', () => {
    expect(formatMonth('2026-11')).toBe('Noviembre 2026');
  });
});

describe('formatDay', () => {
  const now = new Date(2026, 10, 8, 12, 0); // domingo 8 nov 2026

  it('Hoy / Ayer', () => {
    expect(formatDay('2026-11-08', now)).toBe('Hoy');
    expect(formatDay('2026-11-07', now)).toBe('Ayer');
  });

  it('día de la semana y mes', () => {
    expect(formatDay('2026-11-02', now)).toBe('Lunes 2 de noviembre');
  });

  it('agrega el año si no es el actual', () => {
    expect(formatDay('2025-12-31', now)).toBe('Miércoles 31 de diciembre de 2025');
  });

  it('Ayer funciona al cambiar de mes', () => {
    expect(formatDay('2026-10-31', new Date(2026, 10, 1, 9, 0))).toBe('Ayer');
  });
});

describe('formatos cortos', () => {
  it('formatTime', () => {
    expect(formatTime('2026-11-08T14:05:33')).toBe('14:05');
  });

  it('roundToTenMinutes', () => {
    expect(roundToTenMinutes('2026-11-08T14:07:31')).toBe('2026-11-08T14:00');
    expect(roundToTenMinutes('2026-11-08T14:10:00')).toBe('2026-11-08T14:10');
  });
});
