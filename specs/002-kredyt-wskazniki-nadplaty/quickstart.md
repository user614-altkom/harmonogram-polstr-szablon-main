# Quickstart: walidacja funkcji

## 1. Wymagania wstępne

- Node.js 22+
- npm
- repozytorium zainstalowane lokalnie

## 2. Uruchomienie testów

```bash
npm test
npm run typecheck
npm run build
```

## 3. Scenariusze validacyjne

### Scenariusz A: tryb nadpłaty

1. Uruchom kredyt 300 000 zł, 240 rat równych, stopa 6,66%.
2. Dodaj nadpłatę 30 000 zł po 1. racie.
3. Sprawdź, że:
   - w trybie `obniz_rate` saldo po nadpłacie wynosi 269 399,93 zł,
   - nowa rata od 2. raty wynosi 2 038,11 zł,
   - w trybie `skroc_okres` rata pozostaje 2 265,07 zł i ostatnia rata wyrównująca ma 2 200,53 zł.

### Scenariusz B: rekompensata art. 40

1. Wykonaj nadpłatę 50 000 zł w 13. miesiącu przy stopie 6,00%.
2. Potwierdź, że rekompensata wynosi 1 500,00 zł.
3. Sprawdź, że saldo nie zmienia się względem wariantu bez rekompensaty.
4. Sprawdź, że nadpłata w 40. miesiącu daje 0,00 zł.

### Scenariusz C: konwersja WIBOR na POLSTR

1. Ustaw kredyt 300 000 zł, 240 rat równych, WIBOR 3M 4,55% + marża 2,11 pp.
2. Wprowadź konwersję od 25. raty na POLSTR 3,55% + spread 0,20 pp + marża 2,11 pp.
3. Sprawdź, że:
   - od 25. raty obowiązuje stopa 5,86%,
   - saldo po 24. racie jest niezmienione,
   - rata po konwersji wynosi 2 135,68 zł,
   - liczba rat pozostaje 240.

### Scenariusz D: eksport i widoczność harmonogramu

1. Oblicz kompletny harmonogram z nadpłatą i konwersją.
2. Zweryfikuj, że tabela zawiera ochrona salda, numer raty, datę, odsetki, kapitał, ratę, rekompensatę i informację o konwersji.
3. Wygeneruj eksport CSV i sprawdź, że zawiera kolumny i liczbie rat oraz że kolejność jest zgodna z harmonogramem.

## 4. Oczekiwane rezultaty

- brak błędów walidacji dla poprawnych wejść,
- zgodność z liczbami kontrolnymi z karty,
- zbiór testów pomaga potwierdzić poprawność matematyki i wymaganą zgodność z prawem.
