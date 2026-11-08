import { centsToInput, formatCents, formatCentsPlain, parseAmountToCents } from '../money';

describe('parseAmountToCents', () => {
  it.each([
    ['25', 2500],
    ['25,5', 2550],
    ['25,50', 2550],
    ['25.50', 2550],
    ['0,99', 99],
    [',5', 50],
    ['25,', 2500],
    ['1.234', 123400],
    ['1.234,50', 123450],
    ['1,234.50', 123450],
    ['1.234.567,89', 123456789],
    ['Bs 25,50', 2550],
    ['Bs. 1.000', 100000],
    ['BOB 12', 1200],
    ['  7 ', 700],
  ])('"%s" → %i', (input, expected) => {
    expect(parseAmountToCents(input)).toBe(expected);
  });

  it.each(['', '0', '0,00', 'abc', '12a', '1,2,3', '25,555,1', '1.2345', '-5', '25,50,'])(
    'rechaza "%s"',
    (input) => {
      expect(parseAmountToCents(input)).toBeNull();
    },
  );

  it('no tiene errores de punto flotante', () => {
    // 0.1 + 0.2 !== 0.3 en coma flotante; aquí todo es entero
    expect(parseAmountToCents('0,29')).toBe(29);
    expect(parseAmountToCents('1,15')).toBe(115);
    expect(parseAmountToCents('4,35')).toBe(435);
  });
});

describe('formatCents', () => {
  it.each([
    [0, 'Bs 0,00'],
    [5, 'Bs 0,05'],
    [2550, 'Bs 25,50'],
    [100000, 'Bs 1.000,00'],
    [123456789, 'Bs 1.234.567,89'],
  ])('%i → "%s"', (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });

  it('formatea negativos (diferencias)', () => {
    expect(formatCentsPlain(-2550)).toBe('-25,50');
  });
});

describe('centsToInput', () => {
  it('omite ",00" y vuelve a parsear igual', () => {
    expect(centsToInput(2500)).toBe('25');
    expect(centsToInput(2550)).toBe('25,50');
    expect(centsToInput(2505)).toBe('25,05');
    for (const cents of [1, 99, 2500, 2550, 123456]) {
      expect(parseAmountToCents(centsToInput(cents))).toBe(cents);
    }
  });
});
