import polstr1m from '../../dane/polstr-1m.json';
import wibor3m from '../../dane/wibor-3m.json';
import type { ParametryKredytu, WpisSerii } from '../domena/harmonogram';

const SERIE: Record<ParametryKredytu['wskaznik'], WpisSerii[]> = {
  POLSTR_1M: polstr1m.wartosci,
  WIBOR_3M: wibor3m.wartosci,
};

/** Seria wartości wskaźnika z dane/*.json, uporządkowana rosnąco po dacie. */
export function seriaWskaznika(wskaznik: ParametryKredytu['wskaznik']): WpisSerii[] {
  return SERIE[wskaznik].map((wpis) => ({ ...wpis }));
}

function poprawnaData(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const obiektDaty = new Date(`${data}T00:00:00Z`);
  return !Number.isNaN(obiektDaty.valueOf()) && obiektDaty.toISOString().slice(0, 10) === data;
}

export function stopaWskaznika(seria: WpisSerii[], data: string): number {
  if (!poprawnaData(data)) throw new Error('data: istniejąca data YYYY-MM-DD');
  const pierwszyWpis = seria[0];
  if (pierwszyWpis === undefined) throw new Error('seria: wymagana jest co najmniej jedna wartość');
  if (!poprawnaData(pierwszyWpis.od) || data < pierwszyWpis.od) {
    throw new Error('data jest przed początkiem serii');
  }

  let poprzedniaData: string | undefined;
  let wybranaStopa: number | undefined;
  for (const wpis of seria) {
    if (!poprawnaData(wpis.od)) throw new Error('seria: niepoprawna data');
    if (!Number.isFinite(wpis.stopa) || wpis.stopa < 0) {
      throw new Error('seria: stopa musi być skończona i nieujemna');
    }
    if (poprzedniaData !== undefined && wpis.od <= poprzedniaData) {
      throw new Error('seria: wpisy muszą być rosnące bez duplikatów');
    }
    poprzedniaData = wpis.od;
    if (wpis.od > data) break;
    wybranaStopa = wpis.stopa;
  }

  if (wybranaStopa === undefined) throw new Error('seria: brak wartości dla daty');
  return wybranaStopa;
}
