import { NextResponse } from 'next/server';
import { seriaWskaznika } from '../../../src/dane/wskazniki';
import { policzHarmonogram, type Nadplata, type ParametryKredytu } from '../../../src/domena/harmonogram';

// Route handler jest cienki: parsuje parametry z query string, woła domenę, zwraca JSON.
// Żadnych obliczeń finansowych w tym pliku. Przeliczenie jednostek wejścia
// (złote na grosze, punkty procentowe na ułamek) to część parsowania kontraktu API.

const PRZYKLAD =
  '/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01';

function jestObiektem(wartosc: unknown): wartosc is Record<string, unknown> {
  return typeof wartosc === 'object' && wartosc !== null && !Array.isArray(wartosc);
}

function parsujNadplaty(tekst: string | null, liczbaRat: number): Nadplata[] | string {
  if (tekst === null) return [];

  let wartosc: unknown;
  try {
    wartosc = JSON.parse(tekst);
  } catch {
    return 'nadplaty: poprawna tablica JSON';
  }
  if (!Array.isArray(wartosc)) return 'nadplaty: tablica obiektów';

  const nadplaty: Nadplata[] = [];
  for (const element of wartosc) {
    if (!jestObiektem(element)) return 'nadplaty: każdy element musi być obiektem';
    const miesiac = element.miesiac;
    const kwota = element.kwota;
    const tryb = element.tryb;
    if (typeof miesiac !== 'number' || !Number.isInteger(miesiac) || miesiac < 1 || miesiac > liczbaRat) {
      return 'nadplaty.miesiac: numer raty poza harmonogramem';
    }
    if (typeof kwota !== 'number' || !Number.isFinite(kwota) || kwota <= 0) {
      return 'nadplaty.kwota: dodatnia liczba w złotych';
    }
    if (tryb !== 'obniz_rate' && tryb !== 'skroc_okres') {
      return 'nadplaty.tryb: obniz_rate albo skroc_okres';
    }
    nadplaty.push({ miesiac, kwotaGr: Math.round(kwota * 100), tryb });
  }
  return nadplaty;
}

function parsujParametry(szukane: URLSearchParams): ParametryKredytu | string {
  const kwota = Number(szukane.get('kwota'));
  const liczbaRat = Number(szukane.get('liczbaRat'));
  const marza = Number(szukane.get('marza'));
  const wskaznik = szukane.get('wskaznik');
  const typRat = szukane.get('typRat');
  const pierwszaRata = szukane.get('pierwszaRata') ?? '';
  const nadplatyTekst = szukane.get('nadplaty');

  if (!Number.isFinite(kwota) || kwota <= 0) return 'kwota: liczba dodatnia w złotych, np. 400000';
  if (!Number.isInteger(liczbaRat) || liczbaRat <= 0) return 'liczbaRat: liczba całkowita dodatnia, np. 300';
  if (!Number.isFinite(marza) || marza < 0) return 'marza: punkty procentowe, np. 2.11';
  if (wskaznik !== 'POLSTR_1M' && wskaznik !== 'WIBOR_3M') return 'wskaznik: POLSTR_1M albo WIBOR_3M';
  if (typRat !== 'rowne' && typRat !== 'malejace') return 'typRat: rowne albo malejace';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pierwszaRata)) return 'pierwszaRata: data YYYY-MM-DD';
  const nadplaty = parsujNadplaty(nadplatyTekst, liczbaRat);
  if (typeof nadplaty === 'string') return nadplaty;

  return {
    kwotaGr: Math.round(kwota * 100),
    liczbaRat,
    marza: marza / 100,
    wskaznik,
    typRat,
    pierwszaRata,
    nadplaty,
  };
}

export function GET(request: Request) {
  const parametry = parsujParametry(new URL(request.url).searchParams);
  if (typeof parametry === 'string') {
    return NextResponse.json({ blad: parametry, przyklad: PRZYKLAD }, { status: 400 });
  }

  try {
    const harmonogram = policzHarmonogram(parametry, seriaWskaznika(parametry.wskaznik));
    return NextResponse.json(harmonogram);
  } catch (blad) {
    const komunikat = blad instanceof Error ? blad.message : String(blad);
    if (komunikat.startsWith('nie zaimplementowano')) {
      return NextResponse.json({ blad: komunikat, parametry, przyklad: PRZYKLAD }, { status: 501 });
    }
    return NextResponse.json({ blad: komunikat }, { status: 400 });
  }
}
