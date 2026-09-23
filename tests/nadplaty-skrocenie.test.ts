import { describe, expect, it } from 'vitest';
import { policzHarmonogram, type ParametryKredytu, type WpisSerii } from '../src/domena/harmonogram';

const seria: WpisSerii[] = [{ od: '2026-10-01', stopa: 0 }];

function parametry(kwotaGr: number, liczbaRat: number, nadplaty: ParametryKredytu['nadplaty']): ParametryKredytu {
  return {
    kwotaGr,
    liczbaRat,
    marza: 0,
    typRat: 'rowne',
    wskaznik: 'POLSTR_1M',
    pierwszaRata: '2026-10-01',
    nadplaty,
  };
}

describe('nadpłaty skracające okres', () => {
  it('kończy harmonogram wcześniej', () => {
    const harmonogram = policzHarmonogram(
      parametry(1_000_000, 6, [{ miesiac: 1, kwotaGr: 300_000, tryb: 'skroc_okres' }]),
      seria,
    );

    expect(harmonogram.raty.length).toBeLessThan(6);
    expect(harmonogram.raty.at(-1)?.saldoGr).toBe(0);
  });

  it('ogranicza nadpłatę większą od salda i nie tworzy wartości ujemnych', () => {
    const harmonogram = policzHarmonogram(
      parametry(100, 3, [{ miesiac: 1, kwotaGr: 1_000, tryb: 'skroc_okres' }]),
      seria,
    );

    expect(harmonogram.raty).toHaveLength(1);
    expect(harmonogram.raty[0]?.nadplataGr).toBe(67);
    expect(harmonogram.raty.every((rata) => rata.saldoGr >= 0 && rata.rataGr >= 0)).toBe(true);
  });

  it('zachowuje sumę kapitału równą kwocie kredytu', () => {
    const harmonogram = policzHarmonogram(
      parametry(1_000_000, 6, [{ miesiac: 2, kwotaGr: 100_000, tryb: 'skroc_okres' }]),
      seria,
    );

    expect(harmonogram.raty.reduce((suma, rata) => suma + rata.kapitalGr, 0)).toBe(1_000_000);
  });
});