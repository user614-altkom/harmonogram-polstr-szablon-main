/** Moduł domenowy kalkulatora harmonogramu spłat: czyste funkcje, bez React i bez I/O. */

export interface ParametryKredytu {
  /** Kwota kredytu w groszach (liczba całkowita). */
  kwotaGr: number;
  liczbaRat: number;
  /** Marża banku jako ułamek, np. 0.0211 dla 2,11 pp. */
  marza: number;
  typRat: 'rowne' | 'malejace';
  wskaznik: 'POLSTR_1M' | 'WIBOR_3M';
  /** Data pierwszej raty w formacie YYYY-MM-DD. */
  pierwszaRata: string;
  nadplaty: Nadplata[];
}

export interface WpisSerii {
  /** Dzień, od którego obowiązuje wartość, YYYY-MM-DD. */
  od: string;
  /** Stopa jako nieujemny ułamek roczny. */
  stopa: number;
}

export interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb: 'obniz_rate' | 'skroc_okres';
}

export interface Rata {
  numer: number;
  data: string;
  kapitalGr: number;
  nadplataGr: number;
  odsetkiGr: number;
  rataGr: number;
  saldoGr: number;
  stopaRoczna: number;
}

export interface Harmonogram {
  raty: Rata[];
  sumaOdsetekGr: number;
}

function zaokraglijGrosze(kwota: number): number {
  return Math.round(kwota);
}

function utworzDate(data: string): Date | null {
  const dopasowanie = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (dopasowanie === null) return null;

  const rok = Number(dopasowanie[1]);
  const miesiac = Number(dopasowanie[2]);
  const dzien = Number(dopasowanie[3]);
  const wynik = new Date(0);
  wynik.setUTCFullYear(rok, miesiac - 1, dzien);
  wynik.setUTCHours(0, 0, 0, 0);

  if (
    wynik.getUTCFullYear() !== rok ||
    wynik.getUTCMonth() !== miesiac - 1 ||
    wynik.getUTCDate() !== dzien
  ) {
    return null;
  }

  return wynik;
}

function formatujDate(data: Date): string {
  const rok = data.getUTCFullYear().toString().padStart(4, '0');
  const miesiac = (data.getUTCMonth() + 1).toString().padStart(2, '0');
  const dzien = data.getUTCDate().toString().padStart(2, '0');
  return `${rok}-${miesiac}-${dzien}`;
}

function dataRaty(pierwszaRata: Date, przesuniecieMiesiecy: number): string {
  const rok = pierwszaRata.getUTCFullYear();
  const miesiac = pierwszaRata.getUTCMonth();
  const dzien = pierwszaRata.getUTCDate();
  const pierwszyDzienMiesiaca = new Date(0);
  pierwszyDzienMiesiaca.setUTCFullYear(rok, miesiac + przesuniecieMiesiecy, 1);
  pierwszyDzienMiesiaca.setUTCHours(0, 0, 0, 0);

  const ostatniDzienMiesiaca = new Date(0);
  ostatniDzienMiesiaca.setUTCFullYear(
    pierwszyDzienMiesiaca.getUTCFullYear(),
    pierwszyDzienMiesiaca.getUTCMonth() + 1,
    0,
  );
  ostatniDzienMiesiaca.setUTCHours(0, 0, 0, 0);

  pierwszyDzienMiesiaca.setUTCDate(
    Math.min(dzien, ostatniDzienMiesiaca.getUTCDate()),
  );
  return formatujDate(pierwszyDzienMiesiaca);
}

function zwalidujParametry(parametry: ParametryKredytu, seria: WpisSerii[]): Date {
  if (!Number.isInteger(parametry.kwotaGr) || parametry.kwotaGr <= 0) {
    throw new Error('kwotaGr: dodatnia liczba całkowita');
  }
  if (!Number.isInteger(parametry.liczbaRat) || parametry.liczbaRat <= 0) {
    throw new Error('liczbaRat: dodatnia liczba całkowita');
  }
  if (!Number.isFinite(parametry.marza) || parametry.marza < 0) {
    throw new Error('marza: skończona liczba nieujemna');
  }
  if (parametry.nadplaty.length > 0) {
    throw new Error('nadplaty: obsługa nadpłat będzie dostępna w Fazie 5');
  }

  const pierwszaRata = utworzDate(parametry.pierwszaRata);
  if (pierwszaRata === null) {
    throw new Error('pierwszaRata: istniejąca data YYYY-MM-DD');
  }
  if (seria.length === 0) {
    throw new Error('seria: wymagana jest co najmniej jedna wartość');
  }
  const pierwszyWpis = seria[0];
  if (pierwszyWpis === undefined) {
    throw new Error('seria: wymagana jest co najmniej jedna wartość');
  }

  let poprzedniaData: string | undefined;
  for (const wpis of seria) {
    if (utworzDate(wpis.od) === null) throw new Error('seria: niepoprawna data');
    if (!Number.isFinite(wpis.stopa) || wpis.stopa < 0) {
      throw new Error('seria: stopa musi być skończona i nieujemna');
    }
    if (poprzedniaData !== undefined && wpis.od <= poprzedniaData) {
      throw new Error('seria: wpisy muszą być rosnące bez duplikatów');
    }
    poprzedniaData = wpis.od;
  }
  if (pierwszaRata.toISOString().slice(0, 10) < pierwszyWpis.od) {
    throw new Error('seria: brak wartości dla daty pierwszej raty');
  }

  return pierwszaRata;
}

function stopaDlaDaty(seria: WpisSerii[], data: string): number {
  const pierwszyWpis = seria[0];
  if (pierwszyWpis === undefined) throw new Error('seria: wymagana jest co najmniej jedna wartość');
  let wybrana = pierwszyWpis.stopa;
  for (const wpis of seria) {
    if (wpis.od > data) break;
    wybrana = wpis.stopa;
  }
  return wybrana;
}

function rataRowna(saldoGr: number, stopaRoczna: number, pozostaleRaty: number): number {
  const stopaMiesieczna = stopaRoczna / 12;
  if (stopaMiesieczna === 0) return zaokraglijGrosze(saldoGr / pozostaleRaty);
  const wspolczynnik = stopaMiesieczna / (1 - (1 + stopaMiesieczna) ** -pozostaleRaty);
  return zaokraglijGrosze(saldoGr * wspolczynnik);
}

export function policzHarmonogram(parametry: ParametryKredytu, seria: WpisSerii[] = []): Harmonogram {
  const pierwszaRata = zwalidujParametry(parametry, seria);
  let saldoGr = parametry.kwotaGr;
  const raty: Rata[] = [];
  let poprzedniaStopa: number | undefined;
  let planowanaRataGr: number | undefined;

  for (let numer = 1; numer <= parametry.liczbaRat; numer += 1) {
    const data = dataRaty(pierwszaRata, numer - 1);
    const stopaRoczna = stopaDlaDaty(seria, data) + parametry.marza;
    const odsetkiGr = zaokraglijGrosze((saldoGr * stopaRoczna) / 12);
    if (parametry.typRat === 'rowne' && (planowanaRataGr === undefined || poprzedniaStopa !== stopaRoczna)) {
      planowanaRataGr = rataRowna(saldoGr, stopaRoczna, parametry.liczbaRat - numer + 1);
    }
    poprzedniaStopa = stopaRoczna;
    const pozostaleRaty = parametry.liczbaRat - numer + 1;
    const kapitalGr = parametry.typRat === 'malejace'
      ? (numer === parametry.liczbaRat ? saldoGr : Math.min(saldoGr, zaokraglijGrosze(saldoGr / pozostaleRaty)))
      : (numer === parametry.liczbaRat ? saldoGr : Math.min(saldoGr, Math.max(0, (planowanaRataGr ?? 0) - odsetkiGr)));
    const rataGr = kapitalGr + odsetkiGr;
    saldoGr -= kapitalGr;
    raty.push({ numer, data, kapitalGr, nadplataGr: 0, odsetkiGr, rataGr, saldoGr, stopaRoczna });
    if (saldoGr === 0) break;
  }

  return {
    raty,
    sumaOdsetekGr: raty.reduce((suma, rata) => suma + rata.odsetkiGr, 0),
  };
}
