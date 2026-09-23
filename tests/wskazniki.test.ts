import { describe, expect, it } from 'vitest';
import { stopaWskaznika } from '../src/dane/wskazniki';
import type { WpisSerii } from '../src/domena/harmonogram';

describe('wybór wartości wskaźnika', () => {
  const seria: WpisSerii[] = [
    { od: '2026-01-01', stopa: 0.01 },
    { od: '2026-04-01', stopa: 0.02 },
  ];

  it('wybiera ostatni wpis od daty raty włącznie', () => {
    expect(stopaWskaznika(seria, '2026-04-01')).toBe(0.02);
    expect(stopaWskaznika(seria, '2026-03-31')).toBe(0.01);
  });

  it('używa ostatniej wartości po końcu serii', () => {
    expect(stopaWskaznika(seria, '2027-01-01')).toBe(0.02);
  });

  it('odrzuca datę przed początkiem serii', () => {
    expect(() => stopaWskaznika(seria, '2025-12-31')).toThrow('przed początkiem');
  });

  it('nie mutuje wejściowej serii', () => {
    const kopia = seria.map((wpis) => ({ ...wpis }));

    stopaWskaznika(seria, '2026-04-01');

    expect(seria).toEqual(kopia);
  });
});