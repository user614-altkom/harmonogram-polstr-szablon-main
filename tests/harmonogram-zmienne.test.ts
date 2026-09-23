import { describe, expect, it } from 'vitest';
import { policzHarmonogram, type ParametryKredytu, type WpisSerii } from '../src/domena/harmonogram';

function parametry(uzupelnienie: Partial<ParametryKredytu> = {}): ParametryKredytu {
  return {
    kwotaGr: 120_000,
    liczbaRat: 3,
    marza: 0,
    typRat: 'malejace',
    wskaznik: 'POLSTR_1M',
    pierwszaRata: '2026-10-01',
    nadplaty: [],
    ...uzupelnienie,
  };
}

describe('raty malejace i zmiana wskaźnika', () => {
  it('dzieli kapitał malejąco i stosuje nową stopę w dniu raty', () => {
    const seria: WpisSerii[] = [
      { od: '2026-10-01', stopa: 0.12 },
      { od: '2026-11-01', stopa: 0.36 },
    ];

    const harmonogram = policzHarmonogram(parametry(), seria);

    expect(harmonogram.raty.map((rata) => rata.kapitalGr)).toEqual([40_000, 40_000, 40_000]);
    expect(harmonogram.raty.map((rata) => rata.odsetkiGr)).toEqual([1_200, 2_400, 1_200]);
    expect(harmonogram.raty.map((rata) => rata.saldoGr)).toEqual([80_000, 40_000, 0]);
    expect(harmonogram.raty.map((rata) => rata.stopaRoczna)).toEqual([0.12, 0.36, 0.36]);
  });
});