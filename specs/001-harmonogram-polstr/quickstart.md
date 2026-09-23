# Quickstart walidacji

## Wymagania

- Node.js 22 lub nowszy
- Zależności zainstalowane poleceniem `npm install`
- Gałąź `001-harmonogram-polstr`

Kontrakt endpointu opisuje [contracts/openapi.yaml](contracts/openapi.yaml), a znaczenie pól
i niezmienniki opisuje [data-model.md](data-model.md).

## Bramka automatyczna

Z katalogu głównego repozytorium uruchom kolejno:

```powershell
npm test
npm run typecheck
npm run build
```

Oczekiwany wynik: wszystkie testy przechodzą, TypeScript nie zgłasza błędów, a Next.js
kończy produkcyjny build kodem 0.

## Uruchomienie lokalne

```powershell
npm run dev
```

Otwórz `http://localhost:3000`. Formularz powinien być dostępny bez logowania, również
przy szerokości ekranu mobilnego.

## Scenariusz 1: liczba kontrolna rat równych

W teście domeny podaj serię stałą `0.0355`, kwotę 40 000 000 gr, 300 rat, marżę
`0.0211` i raty równe. Nie używaj w tym scenariuszu pliku POLSTR, który zawiera inną
wartość.

Oczekiwany wynik:

- pierwsza rata: 249 472 gr z tolerancją 5 gr,
- ostatnia rata: 249 253 gr,
- saldo ostatniej raty: 0,
- suma części kapitałowych: 40 000 000 gr.

## Scenariusz 2: endpoint i zmiana wskaźnika

Po uruchomieniu aplikacji wywołaj:

```text
http://localhost:3000/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01
```

Oczekiwany wynik: status 200, `raty` zawiera kolejne miesiące, `sumaOdsetekGr` jest
nieujemna, ostatnie `saldoGr` wynosi 0, a po końcu serii używana jest stopa z ostatniego
wpisu. Osobny test ze sztuczną serią dwóch wartości powinien wykazać zmianę odsetek od
raty przypadającej w dniu wejścia drugiej wartości.

## Scenariusz 3: raty malejące

W formularzu wybierz raty malejące przy pozostałych poprawnych danych.

Oczekiwany wynik: pierwsza rata jest wyższa od późniejszych rat przy stałej stopie,
części kapitałowe spłacają pełną kwotę, a saldo nigdy nie jest ujemne.

## Scenariusz 4: oba tryby nadpłat

Wykonaj dwa obliczenia z tą samą nadpłatą, raz jako `obniz_rate`, a raz jako
`skroc_okres`. Przykładowa wartość parametru przed kodowaniem URL:

```json
[{"miesiac":12,"kwota":10000,"tryb":"obniz_rate"}]
```

Oczekiwany wynik: w obu wariantach `nadplataGr` raty 12 wynosi 1 000 000 gr albo mniej,
jeżeli saldo było niższe. Tryb obniżenia zachowuje planowaną liczbę rat i zmniejsza
późniejsze raty, a tryb skrócenia kończy harmonogram wcześniej. Saldo końcowe wynosi 0.

## Scenariusz 5: walidacja błędów

Wywołaj endpoint bez `kwota`, z datą `2026-02-31` oraz z nadpłatą o ujemnej kwocie.
Każdy przypadek powinien zwrócić status 400 oraz JSON z polem `blad`, które wskazuje
niepoprawne pole. Żaden przypadek nie może zwrócić harmonogramu.

## Scenariusz 6: prezentacja i CSV

Po poprawnym obliczeniu sprawdź pierwszą ratę, ostatnią ratę, sumę odsetek i wszystkie
kolumny tabeli. Uruchom eksport CSV i otwórz plik.

Oczekiwany wynik: CSV ma nagłówek oraz dokładnie tyle wierszy danych, ile elementów ma
`raty`; kolejność i wartości odpowiadają tabeli na ekranie.