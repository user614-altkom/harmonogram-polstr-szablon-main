# Feature Specification: Kredyt z nadpłatami, rekompensatą i konwersją wskaźników

**Feature Branch**: `002-kredyt-wskazniki-nadplaty`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Na bazie dodatkowych wymagań przygotuj nową specyfikację. Wymagania obejmują: wybór trybu nadpłaty (skrócenie okresu albo obniżenie raty), wyświetlanie rekompensaty z art. 40 przy nadpłacie, konwersję WIBOR na POLSTR ze spreadem korygującym od zadanej daty lub raty, bez zmiany salda i liczby rat, z zachowaniem prawnej reguły rozliczenia i liczby kontrolnej z kartą."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Porównanie wariantów nadpłaty (Priority: P1)

Doradca może dodać nadpłatę do istniejącego harmonogramu i porównać dwa warianty rozliczenia: skrócenie okresu albo obniżenie raty. W przypadku obniżenia raty rata jest przeliczana po nadpłacie na pozostałe raty przy zachowaniu niezmienionej liczby rat, natomiast przy skróceniu okresu rata pozostaje bez zmian, a harmonogram kończy się wcześniej.

**Why this priority**: To podstawowy wybór dostępny klientowi po nadpłacie i zgodność z prawem do wyboru sposobu rozliczenia w umowie hipotecznej.

**Independent Test**: Można wprowadzić ten sam kredyt i nadpłatę, sprawdzić saldo po nadpłacie oraz drugi i ostatni wpis harmonogramu dla obu trybów i potwierdzić, że suma spłaconego kapitału odpowiada kwocie kredytu.

**Acceptance Scenarios**:

1. **Given** kredyt 300 000 zł, 240 rat równych, stopa 6,66% i nadpłatę 30 000 zł po pierwszej racie, **When** doradca wybiera tryb „obniż ratę”, **Then** saldo po nadpłacie wynosi 269 399,93 zł, liczba rat pozostaje 240, a nowa rata od drugiej raty wynosi 2 038,11 zł.
2. **Given** ten sam kredyt i nadpłatę, **When** doradca wybiera tryb „skróć okres”, **Then** rata pozostaje 2 265,07 zł, harmonogram kończy się wcześniej i ostatnia rata wyrównująca ma kwotę 2 200,53 zł.
3. **Given** brak jawnie określonego trybu nadpłaty, **When** doradca zapisuje nadpłatę, **Then** system przyjmuje domyślny tryb „skróć okres” bez potrzeby dodatkowego wyboru użytkownika.

---

### User Story 2 - Pokazanie rekompensaty za wcześniejszą spłatę (Priority: P1)

Doradca i klient widzą osobną pozycję w harmonogramie i w podsumowaniu dla rekompensaty z tytułu wcześniejszej spłaty. Rekompensata jest naliczana niezależnie od salda i nie zmniejsza kwoty kredytu ani salda po nadpłacie.

**Why this priority**: Przepisy art. 40 mogą wpłynąć na realny koszt nadpłaty i wymagają przejrzystego, niebudzącego wątpliwości rozliczenia.

**Independent Test**: Wystarczy sprawdzić trzy przypadki nadpłat z tabeli karty, w tym limit 36. miesiąca, i potwierdzić, że w harmonogramie pojawia się rekompensata jako osobna pozycja, a saldo pozostaje identyczne jak w wariancie bez rekompensaty.

**Acceptance Scenarios**:

1. **Given** nadpłata w 13. miesiącu w wysokości 50 000 zł przy stopie 6,00%, **When** system liczy rekompensatę, **Then** kwota rekompensaty wynosi 1 500,00 zł i jest widoczna w wierszu harmonogramu oraz sumie rekompensat.
2. **Given** nadpłata w 40. miesiącu przy tej samej stopie, **When** system sprawdza regułę ograniczeń art. 40, **Then** rekompensata wynosi 0,00 zł, ponieważ nadpłata nastąpiła po 36. miesiącu.
3. **Given** nadpłata w 5. miesiącu przy stopie 2,00% w wysokości 10 000 zł, **When** system liczy rekompensatę, **Then** kwota jest równa min(3%, kwota × stopa okresu) i wynosi 200,00 zł.

---

### User Story 3 - Konwersja wskaźnika z WIBOR na POLSTR (Priority: P1)

Doradca może wskazać od której raty lub daty obowiązuje nowy wskaźnik, dodać własną serię danych i spread korygujący. Od pierwszego okresu odsetkowego rozpoczynającego się w dniu konwersji lub później stopa jest liczbą = nowy wskaźnik + spread + marża, bez zmiany salda i liczby rat.

**Why this priority**: To kluczowa operacja dla kredytów istniejących, które mają ulec przeliczeniu w związku z przejściem z WIBOR na POLSTR.

**Independent Test**: Dla kredytu 300 000 zł i konwersji od 25. raty można porównać ratę przed i po konwersji, sprawdzić ciągłość salda pomiędzy ratą 24 i 25 oraz zweryfikować zmianę sumy odsetek po konwersji.

**Acceptance Scenarios**:

1. **Given** kredyt 300 000 zł, 240 rat równych, WIBOR 3M 4,55% + marża 2,11 pp i konwersja od 25. raty na POLSTR 3,55% + spread 0,20 pp + marża 2,11 pp, **When** system oblicza harmonogram, **Then** stopa zmienia się z 6,66% na 5,86% od 25. raty, saldo po 24. racie pozostaje bez zmian, a rata po konwersji wynosi 2 135,68 zł.
2. **Given** konwersja następuje pomiędzy ratami, **When** obliczany jest harmonogram, **Then** saldo nie ma skoku między ostatnią ratą przed konwersją a pierwszą ratą po konwersji i liczba rat pozostaje 240.
3. **Given** zmienia się tylko wskaźnik i spread, **When** system przelicza poszczególne okresy odsetkowe, **Then** marża i saldo pozostają bez zmian, a zmieniają się jedynie odsetki i wynikająca z nich rata lub ostatnia rata wyrównująca.

---

### User Story 4 - Prezentacja danych i eksport wyników (Priority: P2)

Doradca otrzymuje czytelny harmonogram z wierszami opisującymi nadpłaty, rekompensatę i wskaźnik obowiązujący od konkretnej raty. Wynik może być zaprezentowany klientowi oraz wyeksportowany do narzędzia dalszej analizy.

**Why this priority**: Użytkownik musi widzieć pełny obraz kosztu kredytu, nie tylko wynik bazowy, aby podjąć decyzję o dalszym postępowaniu.

**Independent Test**: Dla gotowego harmonogramu można sprawdzić, że każdy wiersz zawiera dane wymagane w specyfikacji, w tym kolumnę z wskaźnikiem / przejściem i osobną pozycję dla rekompensaty w razie nadpłaty.

**Acceptance Scenarios**:

1. **Given** obliczony harmonogram, **When** doradca przegląda wynik, **Then** widzi pierwszą i ostatnią ratę, salda po kolejnych ratach, sumę odsetek oraz pełną tabelę z kolumnami dotyczącymi kapitału, odsetek, raty i ewentualnych korekt.
2. **Given** harmonogram z nadpłatami i konwersją wskaźnika, **When** doradca wykonuje eksport, **Then** plik zawiera wszystkie kwoty, daty i informacje o trybie nadpłaty oraz konwersji w tej samej kolejności co w harmonogramie.

### Edge Cases

- Wartość wskaźnika po ostatnim wpisie serii pozostaje ostatnią znaną wartością.
- Konwersja wskaźnika obowiązuje od pierwszego okresu odsetkowego rozpoczynającego się w dniu konwersji albo później, bez przesunięcia wstecz.
- Nadpłata po racie miesiąca ma wpływ na saldo po naliczeniu i spłacie tej raty, a następny okres liczy się od salda po nadpłacie.
- Jeżeli tryb nadpłaty nie jest określony, system przyjmuje „skróć okres” jako domyślny wariant.
- Rekompensata nie zmniejsza salda kredytu ani kwoty nadpłaty i jest naliczana oddzielnie jako opłata dodatkowa.
- Ostatnia rata wyrównująca dostosowuje różnicę wynikającą z zaokrągleń do grosza, tak aby suma części kapitałowych była równa kwocie kredytu.
- Harmonogram nie może kończyć się saldem ujemnym ani ratą niższą od zera.
- Dla przypadku z brakiem nadpłat wynik jest równoważny z harmonogramem bazowym.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST pozwalać doradcy na wprowadzenie kwoty kredytu, liczby rat, marży, daty pierwszej raty, typu rat oraz wskaźnika bazowego.
- **FR-002**: System MUST umożliwiać wybór trybu nadpłaty: „skróć okres” albo „obniż ratę”, przy czym brak wyboru MUST oznaczać domyślnie „skróć okres”.
- **FR-003**: System MUST przy każdej nadpłacie uwzględniać wpływ wybranego trybu na dalszy harmonogram i liczbę rat albo wysokość raty.
- **FR-004**: System MUST obliczać saldo po nadpłacie według reguły: nadpłata jest księgowana po spłacie raty danego miesiąca, a odsetki są naliczane od salda sprzed nadpłaty.
- **FR-005**: System MUST zwracać suma spłaconego kapitału równą kwocie kredytu w obu trybach nadpłaty po uwzględnieniu rat i ewentualnych nadpłat.
- **FR-006**: System MUST wyliczać rekompensatę z art. 40 jako minimum z trzech wartości: 3% kwoty nadpłaty, kwota nadpłaty × stopa okresu, w którym nadpłata nastąpiła, oraz odsetki naliczone od tej kwoty w okresie roku od spłaty.
- **FR-007**: System MUST naliczać rekompensatę tylko dla nadpłat w miesiącach 1–36 oraz 0 zł w miesiącach od 37. wzwyż.
- **FR-008**: System MUST pokazywać rekompensatę jako osobną pozycję w wierszu harmonogramu oraz w podsumowaniu, nie pomniejszając salda ani sumy kapitału.
- **FR-009**: System MUST umożliwiać wybór nowego wskaźnika, daty lub numeru raty konwersji oraz wartości spreadu korygującego.
- **FR-010**: System MUST stosować nową stopę od pierwszego okresu odsetkowego rozpoczynającego się w dniu konwersji lub później, przy zachowaniu marży, salda i liczby rat bez zmian.
- **FR-011**: System MUST liczyć ratę po konwersji na pozostałe raty od salda w dniu konwersji, przy czym rata malejąca zachowuje część kapitałową i zmienia jedynie odsetki.
- **FR-012**: System MUST wskazywać, od którego wiersza lub daty obowiązuje nowy wskaźnik w harmonogramie.
- **FR-013**: System MUST prezentować pełną tabelę harmonogramu z numerem raty, datą, kapitałem, odsetkami, ratą, saldem po spłacie, trybem nadpłaty i ewentualną rekompensatą lub konwersją.
- **FR-014**: System MUST obsługiwać eksport pełnego harmonogramu do formatu umożliwiającego dalszą analizę i przekazanie klientowi.
- **FR-015**: System MUST odrzucać niekompletne, niepoprawne lub niespójne dane wejściowe z komunikatem wskazującym przyczynę błędu.
- **FR-016**: System MUST gwarantować, że suma części kapitałowych po zaokrągleniu jest równa kwocie kredytu, a saldo końcowe wynosi zero.

### Key Entities *(include if feature involves data)*

- **Kredyt**: kwota główna, liczba rat, marża, typ rat, data pierwszej raty i wskaźnik bazowy.
- **Nadpłata**: kwota, miesiąc harmonogramu, tryb rozliczenia i wpływ na dalsze raty lub długość okresu.
- **Rekompensata**: oddzielna opłata obliczana zgodnie z art. 40, przypisana do konkretnej nadpłaty i widoczna w harmonogramie.
- **Konwersja wskaźnika**: data lub numer raty zmiany wskaźnika, nowy wskaźnik, spread i okres obowiązywania nowej stopy.
- **Rata**: numer, data, część kapitałowa, odsetki, łączna kwota, saldo po spłacie, ewentualne oznaczenie konwersji i nadpłaty.
- **Harmonogram**: uporządkowana lista rat z uwzględnieniem nadpłat, rekompensat i zmiany wskaźnika.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Doradca może obliczyć harmonogram z nadpłatą, rekompensatą i konwersją wskaźnika w czasie nieprzekraczającym 5 sekund dla standardowego kredytu hipotecznego.
- **SC-002**: Wartości kontrolne z karty są zgodne: rata przed nadpłatą 2 265,07 zł, saldo po nadpłacie 269 399,93 zł, nowa rata po obniżeniu 2 038,11 zł, a w wariancie skrócenia okresu ostatnia rata wyrównująca 2 200,53 zł.
- **SC-003**: Dla każdego poprawnego harmonogramu suma części kapitałowych po zaokrągleniu jest równa kwocie kredytu, a saldo końcowe wynosi zero z dokładnością do 1 grosza.
- **SC-004**: Rekompensata jest wyliczana zgodnie z regułami art. 40 dla nadpłat w okresach 1–36 i wynosi 0 zł po 36. miesiącu, przy czym nie wpływa na saldo kredytu.
- **SC-005**: Konwersja WIBOR na POLSTR jest przejrzysta dla użytkownika, a od raty 25 obowiązuje nowa stopa 5,86% przy zachowaniu salda bez skoku i niezmienionej liczby rat.
- **SC-006**: Harmonogram i eksport zawierają 100% zapisanych rat, w tym informacje o konwersji wskaźnika, nadpłacie i rekompensacie.
- **SC-007**: Użytkownik może porównać oba tryby nadpłaty oraz wpływ konwersji wskaźnika bez ręcznego przeliczania wyników.

## Assumptions

- Wspólny zakres funkcjonalny obejmuje trzy zmiany: wybór trybu nadpłaty, rekompensatę z art. 40 i konwersję WIBOR na POLSTR ze spreadem korygującym.
- Nadpłata jest księgowana po ratę miesiąca i wpływa na dalszy harmonogram od następnego okresu, a odsetki w danym miesiącu nadal liczą się od salda sprzed nadpłaty.
- Konwersja wskaźnika jest dokonywana na istniejącym kredycie bez zmiany jego salda, marży i liczby rat.
- Spread korygujący jest wartością konfiguracji wejściowej, a w testach przyjmuje się ilustracyjnie 0,20 pp zgodnie z wymaganiami.
- Wersja MVP wykorzystuje serie wskaźników dostarczone jako dane wejściowe i nie pobiera ich z zewnętrznego źródła w czasie obliczeń.
- Rekompensata jest odrębną opłatą dodatkową i nie jest traktowana jako część kapitału ani jako obniżenie salda kredytu.
- Kalkulator ma charakter narzędzia doradcy i wspiera porównanie opcji klienta, a nie zastępuje wiążącej decyzji banku lub instytucji finansowej.
