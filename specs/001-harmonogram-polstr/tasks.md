---
description: "Zadania implementacyjne kalkulatora harmonogramu spłat POLSTR"
---

# Zadania: Harmonogram spłat POLSTR

**Wejście**: Dokumenty projektowe z `specs/001-harmonogram-polstr/`

**Wymagane dokumenty**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/openapi.yaml`, `quickstart.md`

**Testy**: Testy domeny i danych są obowiązkowe. W każdej historii zadania testowe należy
wykonać przed implementacją i potwierdzić ich oczekiwane niepowodzenie.

**Organizacja**: Zadania są pogrupowane według historii użytkownika. Każda faza kończy się
niezależną walidacją oraz osobnym pull requestem i review przed przejściem dalej.

## Format: `[ID] [P?] [Historia] Opis`

- **[P]**: Zadanie może być realizowane równolegle, ponieważ dotyczy innego pliku i nie
  zależy od nieukończonego zadania.
- **[US1]–[US4]**: Historia użytkownika ze `spec.md`.
- Każde zadanie wskazuje dokładną ścieżkę pliku.
## Faza 1: Przygotowanie

**Cel**: Potwierdzenie działającego punktu startowego bez zmiany zależności.

- [X] T001 Uruchom bazowe `npm test`, `npm run typecheck` i `npm run build`, a wynik odnotuj w opisie PR na podstawie skryptów z `./package.json`

**Punkt kontrolny**: Istniejący szkielet przechodzi trzy bramki jakości; zakończ fazę,
pokaż diff i przeprowadź review przed fazą 2.

---

**Cel**: Ustalenie typów i niezmienników współdzielonych przez wszystkie historie.

**KRYTYCZNE**: Żadna historia użytkownika nie może rozpocząć implementacji przed
ukończeniem tej fazy.

- [X] T002 Zdefiniuj w `src/domena/harmonogram.ts` typy `ParametryKredytu`, `WpisSerii`, `Nadplata`, `Rata` i `Harmonogram` z regułami: `kwotaGr` i `liczbaRat` to dodatnie liczby całkowite; `pierwszaRata` oraz `od` to istniejące daty `YYYY-MM-DD`; wpisy serii są rosnące bez duplikatów; `marza` i `stopa` to skończone liczby nieujemne jako ułamki; `typRat` to `rowne` albo `malejace`; `wskaznik` to `POLSTR_1M` albo `WIBOR_3M`; `nadplaty` domyślnie są pustą listą; `miesiac` jest od 1 do `liczbaRat`; `kwotaGr` nadpłaty jest dodatnią liczbą całkowitą; `tryb` to `obniz_rate` albo `skroc_okres`; `numer` raty rośnie od 1 bez luk; `kapitalGr`, `nadplataGr`, `odsetkiGr`, `rataGr`, `saldoGr` i `sumaOdsetekGr` są nieujemnymi całkowitymi groszami; `rataGr = kapitalGr + odsetkiGr`; `stopaRoczna` jest nieujemnym ułamkiem; lista `raty` ma co najmniej jeden element dla poprawnych parametrów
- [X] T002a Zaktualizuj fixture domeny w `tests/smoke.test.ts`, przekazując wymagane `nadplaty: []` zgodnie z typem `ParametryKredytu`

**Punkt kontrolny**: Kontrakty TypeScript odzwierciedlają `data-model.md`; zakończ fazę,
pokaż diff i przeprowadź review przed fazą 3.

---

## Faza 3: Historia użytkownika 1 - Obliczenie harmonogramu bazowego (Priorytet: P1) MVP

**Test niezależny**: Dla 40 000 000 gr, 300 rat, stałego wskaźnika `0.0355` i marży
`0.0211` pierwsza rata wynosi 249 472 gr z tolerancją 5 gr, ostatnia 249 253 gr, suma
- [X] T004 [P] [US1] Napisz nieprzechodzące testy odrzucenia niedodatniej kwoty i liczby rat, ujemnej albo nieskończonej marży, nieistniejącej daty oraz generowania końców miesięcy w UTC w `tests/harmonogram-walidacja.test.ts`
- [X] T003 [P] [US1] Napisz nieprzechodzące testy liczby kontrolnej, zerowej stopy, raty wyrównującej i sumy kapitału w `tests/harmonogram-rowne.test.ts`

### Implementacja historii 1

- [X] T005 [US1] Zaimplementuj walidację parametrów oraz deterministyczne wyznaczanie miesięcznych dat z ograniczeniem do ostatniego dnia miesiąca w `src/domena/harmonogram.ts`
- [X] T006 [US1] Zaimplementuj raty równe dla stałej serii, odsetki `round(saldo * stopaRoczna / 12)`, jednorazowe zaokrąglanie do grosza i ostatnią ratę wyrównującą w `src/domena/harmonogram.ts`
- [X] T006a [US1] Zaktualizuj `tests/smoke.test.ts`, zastępując oczekiwanie wyjątku `nie zaimplementowano` asercją wyniku działającego `policzHarmonogram` albo usuń ten przestarzały test
- [X] T007 [US1] Zaimplementuj bazowy kontrakt GET: konwersję złotych na grosze i punktów procentowych na ułamek, pobranie serii i przekazanie jej jako argumentu do domeny, wywołanie domeny oraz odpowiedzi 200/400 zgodne z `contracts/openapi.yaml` w `app/api/harmonogram/route.ts`
- [X] T008 [US1] Wykonaj scenariusze liczby kontrolnej i błędów wejścia opisane w `specs/001-harmonogram-polstr/quickstart.md` oraz odnotuj wyniki w opisie PR

**Punkt kontrolny**: Historia 1 działa samodzielnie jako MVP; zakończ fazę, pokaż diff i
przeprowadź review przed rozpoczęciem historii P2.

---

**Cel**: Obsługa rat malejących, zmian POLSTR 1M i WIBOR 3M oraz wartości po końcu serii.


### Testy historii 2

- [X] T009 [P] [US2] Napisz nieprzechodzące testy wyboru ostatniego wpisu `od <= data raty`, użycia ostatniej wartości po końcu serii, błędu przed początkiem serii oraz niezmienności danych w `tests/wskazniki.test.ts`
- [X] T010 [P] [US2] Napisz nieprzechodzące testy rat malejących i zmiany wskaźnika dokładnie w dniu raty, z liczbami kontrolnymi dla kapitału, odsetek i salda w `tests/harmonogram-zmienne.test.ts`

### Implementacja historii 2

- [X] T011 [US2] Zaimplementuj walidację uporządkowania serii i wybór wartości obowiązującej dla daty, bez mutowania importowanych tablic JSON, w `src/dane/wskazniki.ts`
- [X] T012 [US2] Zaimplementuj przeliczanie rat równych przy zmianie stopy oraz raty malejące z częścią kapitałową `round(saldo / pozostaleRaty)` i wyrównaniem ostatniej raty w `src/domena/harmonogram.ts`
- [X] T013 [US2] Wykonaj scenariusze endpointu, zmiany wskaźnika i rat malejących opisane w `specs/001-harmonogram-polstr/quickstart.md` oraz odnotuj wyniki w opisie PR

**Punkt kontrolny**: Oba typy rat i oba wskaźniki są testowalne niezależnie od nadpłat;
zakończ fazę, pokaż diff i przeprowadź review.

## Faza 5: Historia użytkownika 3 - Uwzględnienie nadpłat (Priorytet: P2)

przyszłe raty, a w trybie `skroc_okres` zmniejsza liczbę rat; nadpłata ponad saldo kończy
harmonogram bez wartości ujemnych.

### Testy historii 3

- [X] T014 [P] [US3] Napisz nieprzechodzące testy trybu `obniz_rate`, pustej listy i wielu nadpłat w jednym miesiącu stosowanych w kolejności wejściowej w `tests/nadplaty-obnizenie.test.ts`
- [X] T015 [P] [US3] Napisz nieprzechodzące testy trybu `skroc_okres`, nadpłaty większej od salda, sumy `kapitalGr` równej `kwotaGr` oraz nieujemnego salda w `tests/nadplaty-skrocenie.test.ts`

### Implementacja historii 3

- [X] T016 [US3] Zaimplementuj stosowanie nadpłat po planowanej racie, ograniczenie do salda, `nadplataGr` jako część `kapitalGr`, przeliczenie raty przy zachowaniu terminu i skrócenie liczby okresów w `src/domena/harmonogram.ts`
- [X] T017 [US3] Zaimplementuj parsowanie parametru `nadplaty` jako tablicy JSON, konwersję dodatnich kwot ze złotych na grosze i komunikaty dla niepoprawnego miesiąca, kwoty lub trybu w `app/api/harmonogram/route.ts`
- [X] T018 [US3] Wykonaj oba scenariusze nadpłat i przypadek nadpłaty ponad saldo z `specs/001-harmonogram-polstr/quickstart.md` oraz odnotuj wyniki w opisie PR

---

## Faza 6: Historia użytkownika 4 - Prezentacja i eksport wyniku (Priorytet: P3)

**Cel**: Responsywny formularz, podsumowanie, kompletna tabela oraz eksport CSV w przeglądarce.

**Test niezależny**: Dla gotowej odpowiedzi API ekran pokazuje pierwszą i ostatnią ratę,

- [ ] T019 [US4] Zaimplementuj w `app/page.tsx` komponent `'use client'` z formularzem wszystkich parametrów i nadpłat, `URLSearchParams`, pobieraniem `/api/harmonogram`, stanami ładowania i błędu, podsumowaniem oraz responsywną tabelą bez biblioteki UI
- [ ] T020 [US4] Zaimplementuj w `app/page.tsx` eksport aktualnego wyniku do CSV przez `Blob`, z polskimi nagłówkami, wszystkimi wymaganymi kolumnami i wszystkimi ratami w kolejności harmonogramu
- [ ] T021 [US4] Wykonaj scenariusz prezentacji i CSV na szerokości desktopowej oraz mobilnej z `specs/001-harmonogram-polstr/quickstart.md` i odnotuj zgodność liczby wierszy w opisie PR
**Punkt kontrolny**: Pełny zakres MVP działa end-to-end; zakończ fazę, pokaż diff i
przeprowadź review przed pracami przekrojowymi.

---

- [ ] T022 [P] Dodaj test czasu obliczenia 300 rat poniżej 5 sekund oraz regresje dla dat końca miesiąca i salda końcowego w `tests/harmonogram-granice.test.ts`
- [ ] T023 [P] Zaktualizuj instrukcję uruchomienia, parametry API, przykłady nadpłat i eksport CSV w `./README.md`

a funkcja jest gotowa do wdrożenia i review.

---

## Zależności i kolejność wykonania

### Zależności faz

- **Faza 1** nie ma zależności i zaczyna się natychmiast.
- **Faza 2** zależy od fazy 1 i blokuje wszystkie historie użytkownika.
- **US1 / faza 3** zależy od fundamentu i dostarcza wspólny silnik bazowy oraz endpoint.
- **US2 / faza 4** i **US3 / faza 5** zależą od US1; po ukończeniu US1 mogą być
  realizowane równolegle w osobnych gałęziach, ale obie modyfikują domenę i wymagają
  świadomego scalenia.
- **US4 / faza 6** zależy od kontraktu US1; pełna walidacja formularza wymaga również
  ukończenia US2 i US3.
- **Faza 7** zależy od wszystkich historii wybranych do wydania.

### Graf historii użytkownika

```text
Fundament
   |
  US1
  / \
US2 US3
  \ /
  US4
```

### Kolejność wewnątrz historii

1. Napisz zadania testowe i potwierdź, że zawodzą z oczekiwanego powodu.
2. Zaimplementuj typy i czyste funkcje domenowe.
3. Połącz zachowanie z modułem danych i cienkim route handlerem.
4. Uruchom test niezależny historii.
5. Zatrzymaj się, pokaż diff, przeprowadź review i dopiero potem przejdź dalej.

## Przykłady pracy równoległej

### Historia 1

```text
Równolegle: T003 `tests/harmonogram-rowne.test.ts`
Równolegle: T004 `tests/harmonogram-walidacja.test.ts`
Następnie: T005 → T006 → T007 → T008
```

### Historia 2

```text
Równolegle: T009 `tests/wskazniki.test.ts`
Równolegle: T010 `tests/harmonogram-zmienne.test.ts`
Następnie: T011 i T012 → T013
```

### Historia 3

```text
Równolegle: T014 `tests/nadplaty-obnizenie.test.ts`
Równolegle: T015 `tests/nadplaty-skrocenie.test.ts`
Następnie: T016 → T017 → T018
```

### Historia 4

```text
Sekwencyjnie: T019 → T020 → T021, ponieważ zadania modyfikują `app/page.tsx`
```

## Strategia implementacji

### Najpierw MVP

1. Ukończ fazy 1 i 2.
2. Ukończ US1 w fazie 3.
3. Zatrzymaj się i zweryfikuj liczbę kontrolną, błędy wejścia oraz endpoint.
4. Wydaj albo zademonstruj bazowy harmonogram przed rozszerzaniem zakresu.
2. US2: oba typy rat i oba wskaźniki.
4. US4: ekran i eksport CSV.
5. Dopracowanie: regresje, dokumentacja i pełna bramka wydania.

### Zespół równoległy

Po ukończeniu US1 jedna osoba może realizować US2, a druga US3. Historia US4 może zacząć
budowę widoku na stabilnym kontrakcie US1, lecz pełny formularz scala się dopiero po
ukończeniu obu historii P2.

## Uwagi wykonawcze

- Nie dodawaj zależności ani nie edytuj plików w `dane/`.
- Domena w `src/domena/` pozostaje bez React, I/O i zależności od czasu systemowego.
- Route handler wyłącznie parsuje wejście, pobiera serię, wywołuje domenę i zwraca JSON.
- Zadania oznaczone `[P]` dotyczą różnych plików; konflikty przy scalaniu zmian domeny
  z US2 i US3 należy rozwiązać po przejściu testów obu historii.
- Każda faza ma osobny PR, review i komplet właściwych dla niej bramek jakości.