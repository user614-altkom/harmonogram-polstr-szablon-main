import { describe, expect, it } from 'vitest';
import { policzHarmonogram, type ParametryKredytu, type WpisSerii } from '../src/domena/harmonogram';

const stalaSeria: WpisSerii[] = [{ od: '2026-10-01', stopa: 0.0355 }];

function parametry(uzupelnienie: Partial<ParametryKredytu> = {}): ParametryKredytu {
  return {
    kwotaGr: 4_000_000_0,
    liczbaRat: 300,
    marza: 0.0211,
    typRat: 'rowne',
    wskaznik: 'POLSTR_1M',
    pierwszaRata: '2026-10-01',
    nadplaty: [],
    ...uzupelnienie,
  };
}

describe('raty rowne', () => {
  it('spelnia liczbe kontrolna i sume kapitalu', () => {
    const harmonogram = policzHarmonogram(parametry(), stalaSeria);

    expect(harmonogram.raty[0]?.rataGr).toBeCloseTo(249_472, -1);
    expect(harmonogram.raty.at(-1)?.rataGr).toBe(249_253);
    expect(harmonogram.raty.at(-1)?.saldoGr).toBe(0);
    expect(harmonogram.raty.reduce((suma, rata) => suma + rata.kapitalGr, 0)).toBe(40_000_000);
  });

  it('dziala dla zerowej stopy', () => {
    const harmonogram = policzHarmonogram(
      parametry({ kwotaGr: 1_200_000, liczbaRat: 12, marza: 0 }),
      [{ od: '2026-10-01', stopa: 0 }],
    );

    expect(harmonogram.raty.every((rata) => rata.odsetkiGr === 0)).toBe(true);
    expect(harmonogram.raty.at(-1)?.saldoGr).toBe(0);
  });

  it('wyrownuje ostatnia rate po zaokragleniu kapitalu', () => {
    const harmonogram = policzHarmonogram(
      parametry({ kwotaGr: 100, liczbaRat: 3, marza: 0 }),
      [{ od: '2026-10-01', stopa: 0 }],
    );

    expect(harmonogram.raty.map((rata) => rata.kapitalGr)).toEqual([33, 33, 34]);
    expect(harmonogram.raty.at(-1)?.saldoGr).toBe(0);
  });
});