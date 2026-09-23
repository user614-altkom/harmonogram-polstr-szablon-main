# Model danych

## 1. Encje główne

### Kredyt

**Opis**: podstawowy kontrakt wejściowy dla jednego obliczenia harmonogramu.

**Pola**:
- `kwotaGr: number` — kwota kredytu wyrażona w groszach
- `liczbaRat: number` — liczba okresów spłaty
- `marza: number` — marża jako ułamek roczny, np. 0.0211
- `typRat: 'rowne' | 'malejace'` — rodzaj rat
- `wskaznikBazowy: 'POLSTR_1M' | 'WIBOR_3M'` — seria bazowa
- `pierwszaRata: string` — data pierwszej raty w formacie `YYYY-MM-DD`
- `nadplaty: Nadplata[]` — listy nadpłat w harmonogramie
- `konwersja?: KonwersjaWskaznika` — przejście na nowy wskaźnik

**Reguły walidacji**:
- kwota i liczba rat muszą być dodatnie
- marża musi być liczbą nieujemną
- data pierwszej raty musi być poprawną datą
- lista nadpłat musi zawierać poprawne numery rat i kwoty

### Nadplata

**Opis**: pojedyncza nadpłata wobec istniejącego harmonogramu.

**Pola**:
- `miesiac: number` — numer raty, do której odnosi się nadpłata
- `kwotaGr: number` — kwota nadpłaty w groszach
- `tryb: 'obniz_rate' | 'skroc_okres'` — sposób rozliczenia nadpłaty

**Reguły walidacji**:
- miesiąc musi należeć do zakresu 1..liczbaRat
- kwota musi być dodatnia
- tryb musi być zdefiniowany; przy braku danych przyjmuje się `skroc_okres`

### Rekompensata

**Opis**: odrębna opłata za wcześniejszą spłatę, nie zmniejszająca salda.

**Pola**:
- `kwotaGr: number` — obliczona rekompensata
- `nadplataMiesiac: number` — numer raty, w której nadpłata miała miejsce
- `stopaOkresu: number` — stopa obowiązująca w okresie nadpłaty
- `czyWobecArt40: boolean` — czy nadpłata jest w okresie objętym ograniczeniem

**Reguły walidacji**:
- obliczana tylko dla nadpłat w miesiącach 1–36
- ma wartość 0 od 37. miesiąca
- nie wpływa na saldo i kapitał

### KonwersjaWskaznika

**Opis**: konwersja z jednego wskaźnika na drugi z uwzględnieniem spreadu korygującego.

**Pola**:
- `odRaty: number` — numer raty, od której zaczyna obowiązywać nowy wskaźnik
- `lubData: string` — alternatywnie data konwersji w formacie `YYYY-MM-DD`
- `nowyWskaznik: 'POLSTR_1M' | 'WIBOR_3M'` — wskaźnik docelowy
- `spread: number` — spread korygujący jako ułamek roczny
- `seria: WpisSerii[]` — własna seria wartości po konwersji

**Reguły walidacji**:
- spread jest liczbą nieujemną
- konwersja nie zmienia salda, marży ani liczby rat
- stawka po konwersji działa od pierwszego okresu odsetkowego zaczynającego się w dniu lub po dacie przejścia

### Rata

**Opis**: pojedynczy wpis w harmonogramie.

**Pola**:
- `numer: number`
- `data: string`
- `kapitalGr: number`
- `odsetkiGr: number`
- `rataGr: number`
- `saldoGr: number`
- `stopaRoczna: number`
- `nadplataGr: number`
- `rekompensataGr: number`
- `wskaznikPoKonwersji?: boolean`

**Reguły walidacji**:
- rata nie może wystąpić z ujemnym saldem
- suma części kapitałowych po zaokrągleniu musi odpowiadać kwocie kredytu
- ostatnia rata wyrównuje pozostałą różnicę

### Harmonogram

**Opis**: pełna lista rat i sumaryczne informacje dla całego kredytu.

**Pola**:
- `raty: Rata[]`
- `sumaOdsetekGr: number`
- `sumaRekompensatGr: number`
- `saldoKoncoweGr: number`

**Reguły walidacji**:
- pełny harmonogram musi obejmować wszystkie raty
- saldo końcowe musi wynosić zero po wyrównaniu ostatniej raty
- nadpłaty i rekompensata widoczne są jako odrębne pozycje w wierszach i podsumowaniu

## 2. Relacje

- `Kredyt` posiada wiele `Nadplata`.
- `Kredyt` może mieć zero lub jedną `KonwersjaWskaznika`.
- `Harmonogram` składa się z wielu `Rata`.
- `Rata` może odnosić się do jednej `Nadplata` lub `Rekompensata` w danym miesiącu.
- `KonwersjaWskaznika` wpływa na `stopaRoczna` dla rat po przejściu, ale nie zmienia kapitału ani liczby rat.

## 3. Zasady biznesowe do wdrożenia

- Nadpłata może zmienić wysokość raty (`obniz_rate`) lub skrócić okres (`skroc_okres`).
- W trybie `obniz_rate` liczba rat pozostaje niezmieniona.
- W trybie `skroc_okres` rata pozostaje bez zmian, a harmonogram kończy się wcześniej.
- Rekompensata nie zmniejsza salda i nie zmienia kapitału.
- Konwersja jest wyraźnie oznaczona w harmonogramie jako zmiana wskaźnika od konkretnej raty lub daty.
