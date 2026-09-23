import { describe, expect, it } from 'vitest';
import { policzHarmonogram, type ParametryKredytu, type WpisSerii } from '../src/domena/harmonogram';

const seria: WpisSerii[] = [{ od: '2026-10-01', stopa: 0.0355 }];

function parametry(uzupelnienie: Partial<ParametryKredytu> = {}): ParametryKredytu {
  return {
    kwotaGr: 4_000_000_0,
    liczbaRat: 12,
    marza: 0.0211,
    typRat: 'rowne',
    wskaznik: 'POLSTR_1M',
    pierwszaRata: '2026-10-01',
    nadplaty: [],
    ...uzupelnienie,
  };
}

describe('walidacja parametrów harmonogramu', () => {
  it.each([
    ['kwota', { kwotaGr: 0 }],
    ['liczba rat', { liczbaRat: 0 }],
    ['marza ujemna', { marza: -0.01 }],
    ['marza nieskonczona', { marza: Number.POSITIVE_INFINITY }],
    ['data nieistniejaca', { pierwszaRata: '2026-02-31' }],
  ])('odrzuca %s', (_opis, zmiana) => {
    expect(() => policzHarmonogram(parametry(zmiana), seria)).toThrow();
  });

  it('wyznacza daty rat na koncu miesiaca w UTC', () => {
    const harmonogram = policzHarmonogram(
      parametry({ liczbaRat: 4, pierwszaRata: '2026-01-31' }),
      [{ od: '2026-01-01', stopa: 0.0355 }],
    );

    expect(harmonogram.raty.map((rata) => rata.data)).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });
});