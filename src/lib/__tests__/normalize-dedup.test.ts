import { buildDedupKey } from '../dedup';
import { emptyToNull, normalizeRecipient } from '../normalize';

describe('normalizeRecipient', () => {
  it('minúsculas, sin tildes ni espacios extra', () => {
    expect(normalizeRecipient('  Pensión  DOÑA María ')).toBe('pension dona maria');
  });

  it('vacío → null', () => {
    expect(normalizeRecipient('   ')).toBeNull();
    expect(normalizeRecipient(null)).toBeNull();
    expect(normalizeRecipient(undefined)).toBeNull();
  });
});

describe('emptyToNull', () => {
  it('recorta y convierte vacío en null', () => {
    expect(emptyToNull('  hola ')).toBe('hola');
    expect(emptyToNull('   ')).toBeNull();
    expect(emptyToNull(null)).toBeNull();
  });
});

describe('buildDedupKey', () => {
  const base = {
    bank: 'BCP',
    transactionRef: null,
    amountCents: 2550,
    recipientNormalized: 'pension dona maria',
    paidAt: '2026-11-08T13:04:00',
  };

  it('usa banco + ref cuando hay nro. de transacción', () => {
    expect(buildDedupKey({ ...base, transactionRef: ' ABC123 ' })).toBe('BCP|ref|abc123');
  });

  it('sin ref: banco + monto + destinatario + bloque de 10 min', () => {
    expect(buildDedupKey(base)).toBe('BCP|2550|pension dona maria|2026-11-08T13:00');
  });

  it('el mismo pago unos minutos después tiene la misma clave', () => {
    expect(buildDedupKey({ ...base, paidAt: '2026-11-08T13:09:59' })).toBe(buildDedupKey(base));
  });

  it('otro monto u otro banco cambia la clave', () => {
    expect(buildDedupKey({ ...base, amountCents: 2551 })).not.toBe(buildDedupKey(base));
    expect(buildDedupKey({ ...base, bank: 'BNB' })).not.toBe(buildDedupKey(base));
  });
});
