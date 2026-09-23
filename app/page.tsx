'use client';

import { useState, type FormEvent } from 'react';

type TrybNadplaty = 'obniz_rate' | 'skroc_okres';
type TypRat = 'rowne' | 'malejace';
type Wskaznik = 'POLSTR_1M' | 'WIBOR_3M';

interface NadplataFormularza {
  id: number;
  miesiac: string;
  kwota: string;
  tryb: TrybNadplaty;
}

interface Rata {
  numer: number;
  data: string;
  kapitalGr: number;
  nadplataGr: number;
  odsetkiGr: number;
  rataGr: number;
  saldoGr: number;
  stopaRoczna: number;
}

interface Harmonogram {
  raty: Rata[];
  sumaOdsetekGr: number;
}

interface Formularz {
  kwota: string;
  liczbaRat: string;
  pierwszaRata: string;
  marza: string;
  wskaznik: Wskaznik;
  typRat: TypRat;
  nadplaty: NadplataFormularza[];
}

const poczatkowyFormularz: Formularz = {
  kwota: '400000',
  liczbaRat: '300',
  pierwszaRata: '2026-10-01',
  marza: '2.11',
  wskaznik: 'POLSTR_1M',
  typRat: 'rowne',
  nadplaty: [],
};

function jestObiektem(wartosc: unknown): wartosc is Record<string, unknown> {
  return typeof wartosc === 'object' && wartosc !== null;
}

function jestHarmonogramem(wartosc: unknown): wartosc is Harmonogram {
  if (!jestObiektem(wartosc) || !Array.isArray(wartosc.raty)) return false;
  return typeof wartosc.sumaOdsetekGr === 'number';
}

function formatujKwote(kwotaGr: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(kwotaGr / 100);
}

function formatujStope(stopaRoczna: number): string {
  return `${(stopaRoczna * 100).toFixed(2).replace('.', ',')}%`;
}

function csvKomorka(wartosc: string | number): string {
  return `"${String(wartosc).replaceAll('"', '""')}"`;
}

export default function Strona() {
  const [formularz, ustawFormularz] = useState<Formularz>(poczatkowyFormularz);
  const [harmonogram, ustawHarmonogram] = useState<Harmonogram | null>(null);
  const [blad, ustawBlad] = useState('');
  const [ladowanie, ustawLadowanie] = useState(false);

  async function oblicz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ustawLadowanie(true);
    ustawBlad('');
    const parametry = new URLSearchParams({
      kwota: formularz.kwota,
      liczbaRat: formularz.liczbaRat,
      pierwszaRata: formularz.pierwszaRata,
      marza: formularz.marza,
      wskaznik: formularz.wskaznik,
      typRat: formularz.typRat,
      nadplaty: JSON.stringify(formularz.nadplaty.map(({ miesiac, kwota, tryb }) => ({ miesiac: Number(miesiac), kwota: Number(kwota), tryb }))),
    });

    try {
      const odpowiedz = await fetch(`/api/harmonogram?${parametry.toString()}`);
      const dane: unknown = await odpowiedz.json();
      if (!odpowiedz.ok || !jestHarmonogramem(dane)) {
        const komunikat = jestObiektem(dane) && typeof dane.blad === 'string' ? dane.blad : 'Nie udało się obliczyć harmonogramu.';
        throw new Error(komunikat);
      }
      ustawHarmonogram(dane);
    } catch (error) {
      ustawHarmonogram(null);
      ustawBlad(error instanceof Error ? error.message : 'Nie udało się połączyć z API.');
    } finally {
      ustawLadowanie(false);
    }
  }

  function dodajNadplate() {
    const noweId = formularz.nadplaty.reduce((najwieksze, nadplata) => Math.max(najwieksze, nadplata.id), 0) + 1;
    ustawFormularz((poprzedni) => ({ ...poprzedni, nadplaty: [...poprzedni.nadplaty, { id: noweId, miesiac: '12', kwota: '10000', tryb: 'obniz_rate' }] }));
  }

  function usunNadplate(id: number) {
    ustawFormularz((poprzedni) => ({ ...poprzedni, nadplaty: poprzedni.nadplaty.filter((nadplata) => nadplata.id !== id) }));
  }

  function eksportujCsv() {
    if (harmonogram === null) return;
    const naglowek = ['Numer', 'Data', 'Kapitał (gr)', 'Nadpłata (gr)', 'Odsetki (gr)', 'Rata (gr)', 'Saldo (gr)', 'Stopa roczna'];
    const wiersze = harmonogram.raty.map((rata) => [rata.numer, rata.data, rata.kapitalGr, rata.nadplataGr, rata.odsetkiGr, rata.rataGr, rata.saldoGr, formatujStope(rata.stopaRoczna)]);
    const csv = [naglowek, ...wiersze].map((wiersz) => wiersz.map(csvKomorka).join(';')).join('\r\n');
    const plik = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const adres = URL.createObjectURL(plik);
    const odnośnik = document.createElement('a');
    odnośnik.href = adres;
    odnośnik.download = 'harmonogram-splat.csv';
    odnośnik.click();
    URL.revokeObjectURL(adres);
  }

  const pierwszaRata = harmonogram?.raty[0];
  const ostatniaRata = harmonogram?.raty.at(-1);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-stone-300 pb-7 md:flex-row md:items-end">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Kalkulator kosztu kredytu</p><h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">Harmonogram spłat</h1><p className="mt-3 max-w-xl text-base leading-7 text-stone-600">Porównaj wpływ wskaźnika, typu rat i nadpłat na drogę do spłaty.</p></div>
          <div className="rounded-full border border-stone-300 bg-white/70 px-4 py-2 text-sm text-stone-600">POLSTR 1M / WIBOR 3M</div>
        </header>
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <form onSubmit={oblicz} className="rounded-2xl border border-stone-300 bg-stone-950 p-6 text-stone-100 shadow-xl shadow-stone-900/10">
            <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Parametry</p><h2 className="mt-2 font-serif text-2xl">Nowe obliczenie</h2></div>
            <div className="space-y-5">
              <label className="block text-sm text-stone-300">Kwota kredytu (zł)<input className="pole mt-2" type="number" min="0.01" step="0.01" value={formularz.kwota} onChange={(event) => ustawFormularz({ ...formularz, kwota: event.target.value })} required /></label>
              <label className="block text-sm text-stone-300">Liczba rat<input className="pole mt-2" type="number" min="1" step="1" value={formularz.liczbaRat} onChange={(event) => ustawFormularz({ ...formularz, liczbaRat: event.target.value })} required /></label>
              <label className="block text-sm text-stone-300">Pierwsza rata<input className="pole mt-2" type="date" value={formularz.pierwszaRata} onChange={(event) => ustawFormularz({ ...formularz, pierwszaRata: event.target.value })} required /></label>
              <label className="block text-sm text-stone-300">Marża (punkty procentowe)<input className="pole mt-2" type="number" min="0" step="0.01" value={formularz.marza} onChange={(event) => ustawFormularz({ ...formularz, marza: event.target.value })} required /></label>
              <div><span className="text-sm text-stone-300">Wskaźnik</span><div className="mt-2 grid grid-cols-2 gap-2">{(['POLSTR_1M', 'WIBOR_3M'] as const).map((wskaznik) => <button key={wskaznik} type="button" className={`tryb ${formularz.wskaznik === wskaznik ? 'tryb-aktywny' : ''}`} onClick={() => ustawFormularz({ ...formularz, wskaznik })}>{wskaznik.replace('_', ' ')}</button>)}</div></div>
              <div><span className="text-sm text-stone-300">Typ rat</span><div className="mt-2 grid grid-cols-2 gap-2">{([['rowne', 'Równe'], ['malejace', 'Malejące']] as const).map(([typ, etykieta]) => <button key={typ} type="button" className={`tryb ${formularz.typRat === typ ? 'tryb-aktywny' : ''}`} onClick={() => ustawFormularz({ ...formularz, typRat: typ })}>{etykieta}</button>)}</div></div>
              <div className="border-t border-stone-800 pt-5"><div className="flex items-center justify-between"><span className="text-sm text-stone-300">Nadpłaty</span><button type="button" className="text-sm font-semibold text-lime-300 hover:text-lime-200" onClick={dodajNadplate}>+ Dodaj</button></div><div className="mt-3 space-y-3">{formularz.nadplaty.map((nadplata) => <div key={nadplata.id} className="rounded-xl border border-stone-800 bg-stone-900 p-3"><div className="grid grid-cols-2 gap-2"><input aria-label="Miesiąc nadpłaty" className="pole pole-male" type="number" min="1" step="1" value={nadplata.miesiac} onChange={(event) => ustawFormularz({ ...formularz, nadplaty: formularz.nadplaty.map((element) => element.id === nadplata.id ? { ...element, miesiac: event.target.value } : element) })} /><input aria-label="Kwota nadpłaty w złotych" className="pole pole-male" type="number" min="0.01" step="0.01" value={nadplata.kwota} onChange={(event) => ustawFormularz({ ...formularz, nadplaty: formularz.nadplaty.map((element) => element.id === nadplata.id ? { ...element, kwota: event.target.value } : element) })} /></div><div className="mt-2 flex items-center justify-between gap-2"><select aria-label="Tryb nadpłaty" className="pole pole-male" value={nadplata.tryb} onChange={(event) => ustawFormularz({ ...formularz, nadplaty: formularz.nadplaty.map((element) => element.id === nadplata.id ? { ...element, tryb: event.target.value as TrybNadplaty } : element) })}><option value="obniz_rate">Obniż ratę</option><option value="skroc_okres">Skróć okres</option></select><button type="button" aria-label="Usuń nadpłatę" className="px-2 text-stone-400 hover:text-red-300" onClick={() => usunNadplate(nadplata.id)}>Usuń</button></div></div>)}{formularz.nadplaty.length === 0 && <p className="text-xs leading-5 text-stone-500">Brak nadpłat. Możesz dodać je po wybraniu miesiąca.</p>}</div></div>
            </div>
            <button type="submit" disabled={ladowanie} className="mt-7 w-full rounded-xl bg-lime-300 px-4 py-3 font-bold text-stone-950 transition hover:bg-lime-200 disabled:cursor-wait disabled:opacity-60">{ladowanie ? 'Liczenie...' : 'Policz harmonogram'}</button>
          </form>
          <section aria-live="polite" className="min-w-0">
            {blad && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{blad}</div>}
            {harmonogram === null && !blad && <div className="flex min-h-[520px] flex-col justify-between rounded-2xl border border-stone-300 bg-white/70 p-8"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Wynik obliczenia</p><h2 className="mt-3 max-w-lg font-serif text-4xl leading-tight text-stone-900">Liczby, które pomagają podjąć decyzję.</h2></div><p className="max-w-md text-sm leading-6 text-stone-600">Uzupełnij parametry i uruchom obliczenie. Wynik pojawi się tutaj wraz z pełną tabelą rat.</p></div>}
            {harmonogram && <><div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Wynik obliczenia</p><h2 className="mt-2 font-serif text-3xl text-stone-900">Plan spłaty</h2></div><button type="button" onClick={eksportujCsv} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-900">Eksportuj CSV</button></div><div className="mb-6 grid gap-3 sm:grid-cols-3"><div className="metryka"><span>Pierwsza rata</span><strong>{pierwszaRata ? formatujKwote(pierwszaRata.rataGr) : '-'}</strong></div><div className="metryka"><span>Ostatnia rata</span><strong>{ostatniaRata ? formatujKwote(ostatniaRata.rataGr) : '-'}</strong></div><div className="metryka metryka-akcent"><span>Suma odsetek</span><strong>{formatujKwote(harmonogram.sumaOdsetekGr)}</strong></div></div><div className="overflow-hidden rounded-2xl border border-stone-300 bg-white"><div className="max-h-[620px] overflow-auto"><table className="min-w-[850px] w-full border-collapse text-left text-sm"><thead className="sticky top-0 bg-stone-900 text-xs uppercase tracking-wider text-stone-300"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Data</th><th className="px-4 py-3 text-right">Kapitał</th><th className="px-4 py-3 text-right">Nadpłata</th><th className="px-4 py-3 text-right">Odsetki</th><th className="px-4 py-3 text-right">Rata</th><th className="px-4 py-3 text-right">Saldo</th></tr></thead><tbody>{harmonogram.raty.map((rata) => <tr key={rata.numer} className="border-t border-stone-200 text-stone-700 odd:bg-stone-50/70"><td className="px-4 py-3 font-semibold text-stone-900">{rata.numer}</td><td className="px-4 py-3">{rata.data}</td><td className="px-4 py-3 text-right">{formatujKwote(rata.kapitalGr)}</td><td className="px-4 py-3 text-right text-emerald-700">{formatujKwote(rata.nadplataGr)}</td><td className="px-4 py-3 text-right">{formatujKwote(rata.odsetkiGr)}</td><td className="px-4 py-3 text-right font-semibold">{formatujKwote(rata.rataGr)}</td><td className="px-4 py-3 text-right">{formatujKwote(rata.saldoGr)}</td></tr>)}</tbody></table></div></div></>}
          </section>
        </div>
      </div>
    </main>
  );
}
