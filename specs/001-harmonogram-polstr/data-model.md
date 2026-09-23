# Model danych

Wszystkie kwoty wewnętrzne i wynikowe są całkowitymi liczbami groszy. Stopy są ułamkami
dziesiętnymi, na przykład `0.0211` oznacza 2,11 punktu procentowego.

## Parametry kredytu

| Pole | Typ | Reguły |
|---|---|---|
| `kwotaGr` | `number` | Dodatnia liczba całkowita |
| `liczbaRat` | `number` | Dodatnia liczba całkowita |
| `pierwszaRata` | `string` | Istniejąca data `YYYY-MM-DD` |
| `marza` | `number` | Skończona liczba nieujemna, jako ułamek |
| `typRat` | enum | `rowne` albo `malejace` |
| `wskaznik` | enum | `POLSTR_1M` albo `WIBOR_3M` |
| `nadplaty` | `Nadplata[]` | Domyślnie pusta lista |

Parametry odnoszą się do jednej serii wskaźnika i tworzą dokładnie jeden harmonogram.

## Wpis serii wskaźnika

| Pole | Typ | Reguły |
|---|---|---|
| `od` | `string` | Istniejąca data `YYYY-MM-DD`; wpisy rosnąco i bez duplikatów |
| `stopa` | `number` | Skończona liczba nieujemna, jako ułamek roczny |

Wpis obowiązuje od `od` włącznie do dnia poprzedzającego następny wpis. Ostatni wpis
obowiązuje bezterminowo. Seria nie jest mutowana przez domenę.

## Nadpłata

| Pole | Typ | Reguły |
|---|---|---|
| `miesiac` | `number` | Numer raty od 1 do `liczbaRat` |
| `kwotaGr` | `number` | Dodatnia liczba całkowita |
| `tryb` | enum | `obniz_rate` albo `skroc_okres` |

Wiele nadpłat w jednym miesiącu jest stosowanych w kolejności wejściowej i nie może
obniżyć salda poniżej zera. Kwota efektywna ostatniej nadpłaty może zostać ograniczona
do salda pozostałego po racie i wcześniejszych nadpłatach.

## Rata

| Pole | Typ | Reguły |
|---|---|---|
| `numer` | `number` | Kolejny numer od 1, bez luk |
| `data` | `string` | Istniejąca data `YYYY-MM-DD` |
| `kapitalGr` | `number` | Planowany kapitał razem z efektywną nadpłatą |
| `nadplataGr` | `number` | Część `kapitalGr` wynikająca z nadpłat |
| `odsetkiGr` | `number` | `round(saldoPrzed * (wskaznik + marza) / 12)` |
| `rataGr` | `number` | `kapitalGr + odsetkiGr` |
| `saldoGr` | `number` | Saldo po całej spłacie okresu, nieujemne |
| `stopaRoczna` | `number` | Wskaźnik okresu plus marża, jako ułamek |

Rata jest niezmienna po utworzeniu. Ostatnia rata ma `saldoGr = 0`. Dla całego
harmonogramu suma `kapitalGr` jest równa `kwotaGr`.

## Harmonogram

| Pole | Typ | Reguły |
|---|---|---|
| `raty` | `Rata[]` | Co najmniej jedna rata dla poprawnych parametrów |
| `sumaOdsetekGr` | `number` | Suma `odsetkiGr` wszystkich rat |

### Przejścia stanu obliczenia

1. `niezwalidowane` → `gotowe`: parametry i seria przechodzą walidację.
2. `gotowe` → `naliczony okres`: wybór stopy, odsetki i planowany kapitał.
3. `naliczony okres` → `po nadpłacie`: zastosowanie nadpłat i zmiana planu rat.
4. `po nadpłacie` → `gotowe`: saldo dodatnie, przejście do kolejnego miesiąca.
5. `naliczony okres` albo `po nadpłacie` → `spłacone`: saldo wynosi zero.

Obliczenie kończy się wyłącznie stanem `spłacone`; przekroczenie maksymalnej liczby rat
bez spłaty jest błędem domenowym.