# Tasks: Kredyt z nadpłatami, rekompensatą i konwersją wskaźników

**Input**: Design documents from `specs/002-kredyt-wskazniki-nadplaty/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: W tej funkcji testy domeny są obowiązkowe. Każda historia ma zadania testowe napisane przed implementacją i wykonane jako warunek wejścia do historii.

**Organization**: Zadania są pogrupowane według historii użytkownika, aby każda historia mogła być wdrożona i zweryfikowana niezależnie.

## Format: `[ID] [P?] [Story] Opis`

- **[P]**: zadanie może być wykonane równolegle, ponieważ dotyczy innego pliku i nie zależy od nieukończonych zadań
- **[Story]**: `US1`, `US2`, `US3`, `US4`
- Każde zadanie zawiera dokładną ścieżkę do pliku lub katalogu

## Phase 1: Setup (Shared Infrastructure)

**Cel**: Potwierdzenie punktu startowego i wspólnych założeń bez modyfikacji danych wskaźników.

- [ ] T001 [P] Uruchom bazowe sprawdzenie istniejącego repozytorium według komend z `package.json` i zbierz wynik testów, typecheck i build dla bieżącej gałęzi
- [ ] T002 [P] Przejrzyj i uzupełnij kontrakty domenowe w `src/domena/harmonogram.ts` o wspólne typy dla nadpłat, rekompensaty i konwersji wskaźnika zgodnie z `data-model.md`

**Punkt kontrolny**: Repo jest gotowe do pracy nad nowym zakresem, a wspólne typy są spójne z modelem danych.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Cel**: Wspólna infrastruktura dla wszystkich historii: walidacja, dane wejściowe i kontrakty API.

**⚠️ CRITICAL**: Żadne zadanie użytkownika nie może ruszyć, zanim ten etap będzie zakończony.

- [ ] T003 [P] Zdefiniuj wspólną walidację wejścia w `src/domena/harmonogram.ts` dla `kwotaGr`, `liczbaRat`, `marza`, `pierwszaRata`, `nadplaty` i `konwersja`, z regułami z `spec.md` i `data-model.md`
- [ ] T004 [P] Rozszerz parser query string w `app/api/harmonogram/route.ts` o parametry `nadplaty` i `konwersja` oraz poprawne mapowanie jednostek złotych/groszy i punktów procentowych na ułamki
- [ ] T005 [P] Dodaj wspólne typy odpowiedzi oraz obsługę błędów w `contracts/openapi.yaml` dla nadpłat, rekompensaty i konwersji wskaźnika
- [ ] T006 Ustaw wspólną strategię zaokrąglania i salda końcowego w `src/domena/harmonogram.ts` tak, aby suma części kapitałowych była równa kwocie kredytu i ostatnia rata wyrównująca była jedynym korektorem

**Punkt kontrolny**: Wszystkie wejścia i podstawowe reguły finansowe są zdefiniowane w domenie i w API; można rozpocząć implementację historii P1.

---

## Phase 3: User Story 1 - Wybór trybu nadpłaty (Priority: P1) 🎯 MVP

**Cel**: Doradca może dodać nadpłatę i porównać wariant „obniż ratę” oraz „skróć okres”, z zachowaniem domyślnego `skroc_okres` i danych kontrolnych.

**Independent Test**: Dla kredytu 300 000 zł, 240 rat, 6,66% i nadpłaty 30 000 zł po 1. racie trzeba sprawdzić, że saldo po nadpłacie wynosi 269 399,93 zł, rata po obniżeniu to 2 038,11 zł, a w trybie skrócenia okresu ostatnia rata wyrównująca to 2 200,53 zł.

### Tests for User Story 1

- [ ] T007 [P] [US1] Dodaj test czerwony dla domyślnego trybu nadpłaty i liczb kontrolnych w `tests/nadplaty-obnizenie.test.ts`
- [ ] T008 [P] [US1] Dodaj test czerwony dla trybu `skroc_okres` i ostatniej raty wyrównującej w `tests/nadplaty-skrocenie.test.ts`

### Implementation for User Story 1

- [ ] T009 [US1] Zaimplementuj przeliczanie nadpłaty po racie w `src/domena/harmonogram.ts` z zasadą: odsetki liczone od salda sprzed nadpłaty, saldo po nadpłacie pomniejszone o kwotę nadpłaty
- [ ] T010 [US1] Zaimplementuj wybór trybu nadpłaty w `src/domena/harmonogram.ts` tak, aby `obniz_rate` zachowywał liczbę rat, a `skroc_okres` skracał harmonogram i utrzymywał ratę bez zmian
- [ ] T011 [US1] Dodaj w `app/api/harmonogram/route.ts` walidację `tryb` nadpłaty oraz domyślne przypisanie `skroc_okres`, gdy pole jest puste lub niepodane
- [ ] T012 [US1] Dostosuj JSON odpowiedzi i eksport w `app/page.tsx` tak, aby harmonogram pokazuje wynik dla obu wariantów nadpłaty w jednym widoku i zapisuje je w tabeli
- [ ] T013 [US1] Uruchom scenariusze z `quickstart.md` dla nadpłat i potwierdź zgodność z liczbami kontrolnymi z `spec.md`

**Punkt kontrolny**: Tryb nadpłaty działa niezależnie i jest zgodny z karty; można przejść do historii P2.

---

## Phase 4: User Story 2 - Rekompensata za wcześniejszą spłatę (Priority: P1)

**Cel**: Przedstawienie osobnej rekompensaty z art. 40, naliczanej niezależnie od salda i bez zmniejszania kapitału.

**Independent Test**: Dla nadpłat 50 000 zł w 13. miesiącu (6,00%), 20 000 zł w 40. miesiącu (6,00%) i 10 000 zł w 5. miesiącu (2,00%) musi być zgodność z wartościami: 1 500,00 zł, 0,00 zł i 200,00 zł.

### Tests for User Story 2

- [ ] T014 [P] [US2] Dodaj test czerwony dla granicy 36/37 miesiąca oraz liczb kontrolnych w `tests/nadplaty-rekompensata.test.ts`
- [ ] T015 [P] [US2] Dodaj test czerwony dla niezależnego działania rekompensaty od salda i dla sumy rekompensat w `tests/harmonogram-rekompensata.test.ts`

### Implementation for User Story 2

- [ ] T016 [US2] Zaimplementuj funkcję `rekompensataArt40(kwota, miesiac, stopa)` w `src/domena/harmonogram.ts` zgodnie z regułą `min(3% nadpłaty, kwotaNadplaty * stopaOkresu, odsetki12m)`
- [ ] T017 [US2] Dodaj w `src/domena/harmonogram.ts` osobne pole `rekompensataGr` do wpisu raty i sumę `sumaRekompensatGr` do harmonogramu, bez wpływu na saldo i kapitał
- [ ] T018 [US2] Rozszerz parser `app/api/harmonogram/route.ts` o odczyt i walidację parametrów koniecznych do wyliczenia rekompensaty, bez zmiany kontraktu salda w `contracts/openapi.yaml`
- [ ] T019 [US2] Zaktualizuj tabelę i podsumowanie w `app/page.tsx` tak, aby rekompensata była widoczna jako osobna pozycja w wierszu i na końcu wyniku
- [ ] T020 [US2] Uruchom scenariusze z `quickstart.md` i potwierdź zgodność z przypadkami art. 40 oraz brakiem wpływu na saldo

**Punkt kontrolny**: Rekompensata jest oddzielną pozycją i nie zmienia salda; można przejść do historii P3.

---

## Phase 5: User Story 3 - Konwersja WIBOR na POLSTR ze spreadem korygującym (Priority: P1)

**Cel**: Doradca może wskazać przejście wskaźnika od daty lub od numeru raty i zachować saldo oraz liczbę rat bez zmian.

**Independent Test**: Dla kredytu 300 000 zł, 240 rat, WIBOR 3M 4,55% + marża 2,11 pp, konwersji od 25. raty na POLSTR 3,55% + spread 0,20 pp + marża 2,11 pp, musi działać stopa 5,86%, saldo niewzruszone, rata po konwersji 2 135,68 zł i brak skoku między 24. a 25. ratą.

### Tests for User Story 3

- [ ] T021 [P] [US3] Dodaj test czerwony dla przejścia od raty 24 do 25 i dla ciągłości salda w `tests/harmonogram-konwersja.test.ts`
- [ ] T022 [P] [US3] Dodaj test czerwony dla spreadu 0,20 pp i dla zmiany stopy od pierwszego okresu odsetkowego po dacie konwersji w `tests/harmonogram-zmienne.test.ts`

### Implementation for User Story 3

- [ ] T023 [US3] Zaimplementuj konfigurację konwersji w `src/domena/harmonogram.ts` jako parametr `konwersja` z `data` lub `odRaty`, nowym wskaźnikiem i spreadem
- [ ] T024 [US3] Rozszerz logikę stopy okresu w `src/domena/harmonogram.ts` o regułę: od pierwszego okresu odsetkowego zaczynającego się w dniu konwersji lub później stopa = nowy wskaźnik + spread + marża
- [ ] T025 [US3] Zaimplementuj przeliczenie raty po konwersji na pozostałe raty według salda w dniu konwersji, bez zmiany marży, liczby rat i salda
- [ ] T026 [US3] Dodaj oznaczenie przejścia wskaźnika i daty obowiązywania w `app/page.tsx` oraz odpowiedzi API w `contracts/openapi.yaml`
- [ ] T027 [US3] Uruchom scenariusze z `quickstart.md` dla konwersji WIBOR/POLSTR i potwierdź zgodność z liczbą kontrolną

**Punkt kontrolny**: Konwersja wskaźnika działa bez skoku salda i bez zmiany liczby rat; można przejść do historii P4.

---

## Phase 6: User Story 4 - Prezentacja danych i eksport wyników (Priority: P2)

**Cel**: Doradca widzi pełną tabelę wyliczeń i może ją wyeksportować w formacie do dalszej analizy.

**Independent Test**: Dla obliczonego harmonogramu z nadpłatą, rekompensatą i konwersją trzeba sprawdzić, że tabela zawiera wszystkie kolumny, pierwszą i ostatnią ratę oraz komplet eksportu CSV.

### Tests for User Story 4

- [ ] T028 [P] [US4] Dodaj test integracyjny dla widoku harmonogramu w `tests/smoke.test.ts` i sprawdź kompletność kolumn i sumarycznych wartości
- [ ] T029 [P] [US4] Dodaj test eksportu CSV w `tests/harmonogram-export.test.ts` dla wszystkich rat i nagłówków

### Implementation for User Story 4

- [ ] T030 [US4] Rozbuduj komponent w `app/page.tsx` o formularz parametrów kredytu, konwersji i nadpłat, z walidacją błędów oraz stanem ładowania
- [ ] T031 [US4] Zaimplementuj w `app/page.tsx` prezentację harmonogramu z wierszem dla nadpłaty, rekompensaty i przejścia wskaźnika
- [ ] T032 [US4] Dodaj eksport danych do CSV w `app/page.tsx` z `Blob` i przyciskiem pobierania, z zachowaniem kolejności rat i pełnej zawartości harmonogramu
- [ ] T033 [US4] Uruchom scenariusz end-to-end z `quickstart.md` dla prezentacji i eksportu oraz potwierdź pełny zestaw danych w wynikach

**Punkt kontrolny**: Ekran i eksport działają niezależnie dla pełnego zakresu MVP.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Cel**: Dopracowanie ogólne, dokumentacja i pełna zgodność z wymaganiami wydania.

- [ ] T034 [P] Zwiększ pokrycie testowe i dodaj testy regresyjne dla dat końca miesiąca oraz salda końcowego w `tests/harmonogram-granice.test.ts`
- [ ] T035 [P] Zaktualizuj dokumentację użytkową w `README.md` o regułę nadpłaty po racie, tryby nadpłat, rekompensatę art. 40 i konwersję wskaźników
- [ ] T036 [P] Przejrzyj i uzupełnij `contracts/openapi.yaml` o finalne pola wyjściowe dla rekompensaty i pozycji konwersji zgodnie z wdrożonym harmonogramem
- [ ] T037 Uruchom pełną walidację projektu: `npm test`, `npm run typecheck` i `npm run build` według instrukcji z `AGENTS.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: start natychmiast, bez zależności
- **Phase 2**: zależy od Phase 1; blokuje wszystkie historie użytkownika
- **Phase 3 (US1)**: zależy od Phase 2 i jest MVP
- **Phase 4 (US2)**: zależy od Phase 2 i może być realizowana równolegle z US1, ale wymaga sprawdzenia spójności domeny
- **Phase 5 (US3)**: zależy od Phase 2 i może być realizowana równolegle z US1/US2
- **Phase 6 (US4)**: zależy od US1/US2/US3 i jest ostatnią warstwą prezentacji
- **Phase 7**: zależy od wszystkich historii i jest końcowym dopracowaniem

### User Story Dependencies

- **US1 (P1)**: brak zależności na poziomie biznesowym po Phase 2
- **US2 (P1)**: zależność techniczna od wspólnej domeny, może być realizowana równolegle z US1
- **US3 (P1)**: zależność techniczna od wspólnej domeny, może być realizowana równolegle z US1/US2
- **US4 (P2)**: zależy od pełnej sprawności logiki domenowej i kontraktu klasy API

### Parallel Opportunities

- `T001` i `T002` mogą być wykonane równolegle w Phase 1
- `T003`, `T004`, `T005`, `T006` mogą być wykonane równolegle w Phase 2
- W każdej historii testy są równoległe pomiędzy sobą; po nich następuje implementacja
- Układ `US1`, `US2`, `US3` może być prowadzony równolegle po zakończeniu fundamentu, o ile wszyscy pracują na tym samym modelu domenowym i pilnują kompatybilności typów

---

## Parallel Example: User Story 1

```text
Równolegle: T007 `tests/nadplaty-obnizenie.test.ts`
Równolegle: T008 `tests/nadplaty-skrocenie.test.ts`
Następnie: T009 → T010 → T011 → T012 → T013
```

## Parallel Example: User Story 2

```text
Równolegle: T014 `tests/nadplaty-rekompensata.test.ts`
Równolegle: T015 `tests/harmonogram-rekompensata.test.ts`
Następnie: T016 → T017 → T018 → T019 → T020
```

## Parallel Example: User Story 3

```text
Równolegle: T021 `tests/harmonogram-konwersja.test.ts`
Równolegle: T022 `tests/harmonogram-zmienne.test.ts`
Następnie: T023 → T024 → T025 → T026 → T027
```

## Parallel Example: User Story 4

```text
Równolegle: T028 `tests/smoke.test.ts`
Równolegle: T029 `tests/harmonogram-export.test.ts`
Następnie: T030 → T031 → T032 → T033
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Ukończ Phase 1 i Phase 2
2. Ukończ US1 w Phase 3
3. Zatrzymaj się i zweryfikuj wyniki kontrolne oraz kontrakt API
4. Jeśli US1 przechodzi, przejdź do US2 i US3 lub do prezentacji MVP

### Incremental Delivery

1. Phase 1 + Phase 2 => fundament
2. US1 => tryby nadpłaty i dane kontrolne
3. US2 => rekompensata art. 40
4. US3 => konwersja wskaźnika
5. US4 => ekran i eksport
6. Phase 7 => dokumentacja, regresje i finalna walidacja

### Parallel Team Strategy

- Po zakończeniu fundamentu jedna osoba może robić US1, druga US2, trzecia US3.
- US4 powinna zacząć się po stabilnym kontrakcie API i po tym, gdy logika domeny jest już potwierdzona testami.

---

## Notes

- Każde zadanie ma identyfikator, nazwę typu `Txxx`, oraz `[P]` dla zadań równoległych.
- Każda historia ma testy oraz implementację, aby można było ją przeprowadzić niezależnie.
- Wymagane jest zachowanie zgodności z `AGENTS.md` oraz z konstytucją: domena bez I/O, w `src/domena/`, nie dodajemy nowych zależności, a `app/api/harmonogram/route.ts` pozostaje cienki.
- Nie edytujemy katalogu `dane/` bez wyraźnej decyzji i nie dodajemy zależności bez uzasadnienia.
- Każda faza powinna mieć osobny PR i review przed przejściem dalej.
