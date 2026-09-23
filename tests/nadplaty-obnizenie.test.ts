import { describe, expect, it } from 'vitest';
import { policzHarmonogram, type ParametryKredytu, type WpisSerii } from '../src/domena/harmonogram';

const seria: WpisSerii[] = [{ od: '2026-10-01', stopa: 0 }];

function parametry(nadplaty: ParametryKredytu['nadplaty'] = []): ParametryKredytu {
  return {
    kwotaGr: 1_000_000,
    liczbaRat: 4,
    marza: 0,
    typRat: 'rowne',
    wskaznik: 'POLSTR_1M',
    pierwszaRata: '2026-10-01',
    nadplaty,
  };
}

describe('nadpłaty obniżające ratę', () => {
  it('pusta lista zachowuje bazowy harmonogram', () => {
    const harmonogram = policzHarmonogram(parametry(), seria);

    expect(harmonogram.raty).toHaveLength(4);
    expect(harmonogram.raty[0]?.rataGr).toBe(250_000);
  });

  it('obniża przyszłe raty i zachowuje pierwotny termin', () => {
    const harmonogram = policzHarmonogram(
      parametry([{ miesiac: 1, kwotaGr: 100_000, tryb: 'obniz_rate' }]),
      seria,
    );

    expect(harmonogram.raty).toHaveLength(4);
    expect(harmonogram.raty[0]?.nadplataGr).toBe(100_000);
    expect(harmonogram.raty[1]?.rataGr).toBeLessThan(250_000);
    expect(harmonogram.raty.at(-1)?.saldoGr).toBe(0);
  });

  it('stosuje wiele nadpłat w jednym miesiącu w kolejności wejściowej', () => {
    const harmonogram = policzHarmonogram(
      parametry([
        { miesiac: 1, kwotaGr: 100_000, tryb: 'obniz_rate' },
        { miesiac: 1, kwotaGr: 50_000, tryb: 'obniz_rate' },
      ]),
      seria,
    );

    expect(harmonogram.raty[0]?.nadplataGr).toBe(150_000);
    expect(harmonogram.raty.reduce((suma, rata) => suma + rata.kapitalGr, 0)).toBe(1_000_000);
  });
});