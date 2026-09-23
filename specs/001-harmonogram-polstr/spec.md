# Feature Specification: Harmonogram spłat POLSTR

**Feature Branch**: `001-harmonogram-polstr`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: „Potrzebujemy kalkulatora harmonogramu spłat kredytu hipotecznego, który obsłuży POLSTR 1M i WIBOR 3M, raty równe i malejące oraz nadpłaty. Kalkulator ma prezentować tabelę rat, sumę odsetek i umożliwiać eksport wyników.”

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Obliczenie harmonogramu bazowego (Priority: P1)

Doradca wprowadza kwotę kredytu, liczbę rat, datę pierwszej raty, marżę, wskaźnik
referencyjny i typ rat, aby otrzymać kompletny harmonogram spłat.

**Why this priority**: To podstawowa wartość kalkulatora i warunek oceny zdolności
oraz kosztu kredytu przez doradcę i klienta.

**Independent Test**: Można wprowadzić dane liczby kontrolnej i sprawdzić pierwszą,
ostatnią oraz sumaryczne wartości harmonogramu bez korzystania z pozostałych scenariuszy.

**Acceptance Scenarios**:

1. **Given** kwota 400 000 zł, 300 rat równych, marża 2,11 pp i stały wskaźnik 3,55%,
   **When** doradca oblicza harmonogram, **Then** rata wynosi 2 494,72 zł z tolerancją
   0,05 zł, a ostatnia rata wyrównująca wynosi 2 492,53 zł.
2. **Given** poprawne parametry kredytu, **When** doradca zatwierdza obliczenia,
   **Then** otrzymuje pierwszą i ostatnią ratę, sumę odsetek oraz dla każdej raty numer,
   datę, kapitał, odsetki, ratę i saldo po spłacie.
3. **Given** niepoprawna lub niepełna wartość wejściowa, **When** doradca próbuje
   obliczyć harmonogram, **Then** otrzymuje komunikat wskazujący pole wymagające poprawy
   i nie otrzymuje pozornie poprawnego wyniku.

---

### User Story 2 - Porównanie typów rat i wskaźników (Priority: P2)

Doradca wybiera raty równe albo malejące oraz POLSTR 1M albo WIBOR 3M, aby porównać
wpływ tych wariantów na koszt i przebieg spłaty.

**Why this priority**: Obsługa obu typów rat i obu wskaźników jest wymagana przez zakres
MVP i pozwala dopasować kalkulację do różnych ofert kredytowych.

**Independent Test**: Dla tych samych pozostałych parametrów można wykonać dwa obliczenia,
zmieniając tylko typ raty lub wskaźnik, i porównać sumę odsetek oraz tabelę.

**Acceptance Scenarios**:

1. **Given** poprawne dane kredytu i wybrany typ rat malejących, **When** doradca
   oblicza harmonogram, **Then** część kapitałowa jest zgodna z regułami rat malejących,
   a kolejne raty zmniejszają się zgodnie z naliczonymi odsetkami.
2. **Given** serię POLSTR 1M lub WIBOR 3M z wartościami dla kolejnych okresów,
   **When** doradca oblicza harmonogram, **Then** oprocentowanie każdej raty uwzględnia
   wartość wskaźnika obowiązującą w jej okresie oraz marżę.
3. **Given** zmianę wartości wskaźnika w trakcie spłaty, **When** doradca oblicza
   harmonogram, **Then** rata lub część odsetkowa od właściwego okresu odzwierciedla tę zmianę.

---

### User Story 3 - Uwzględnienie nadpłat (Priority: P2)

Doradca dodaje nadpłatę w wybranym miesiącu i wybiera, czy ma ona obniżyć kolejne raty,
czy skrócić okres spłaty.

**Why this priority**: Nadpłaty są częścią zakresu MVP i wpływają bezpośrednio na koszt
odsetek oraz rekomendację dla klienta.

**Independent Test**: Można obliczyć harmonogram z jedną nadpłatą w każdym trybie i
sprawdzić zmianę salda, rat lub liczby okresów niezależnie od wyboru wskaźnika.

**Acceptance Scenarios**:

1. **Given** nadpłatę w trybie „obniż ratę”, **When** nadpłata przypada w określonym
   miesiącu, **Then** saldo po tym miesiącu maleje o kwotę nadpłaty, a przyszłe raty
   zostają ponownie wyliczone przy zachowaniu zaplanowanego terminu końcowego.
2. **Given** nadpłatę w trybie „skróć okres”, **When** nadpłata przypada w określonym
   miesiącu, **Then** saldo po tym miesiącu maleje, a harmonogram kończy się wcześniej
   po spłacie całego kapitału.
3. **Given** nadpłatę większą niż bieżące saldo, **When** doradca zatwierdza obliczenia,
   **Then** wynik nie zawiera ujemnego salda, a harmonogram kończy się na całkowitej
   spłacie kapitału.

---

### User Story 4 - Prezentacja i eksport wyniku (Priority: P3)

Doradca przegląda wynik w czytelnej tabeli i eksportuje go, aby przekazać wyliczenia
klientowi lub użyć ich w dalszej analizie.

**Why this priority**: Wynik musi być zrozumiały i możliwy do wykorzystania poza
kalkulatorem, ale prezentacja zależy od poprawnego obliczenia harmonogramu.

**Independent Test**: Dla gotowego harmonogramu można sprawdzić kompletność tabeli,
wartości podsumowania i zawartość wyeksportowanego pliku.

**Acceptance Scenarios**:

1. **Given** obliczony harmonogram, **When** doradca przegląda wynik, **Then** widzi
   pierwszą i ostatnią ratę, sumę odsetek oraz tabelę z wszystkimi wymaganymi kolumnami.
2. **Given** obliczony harmonogram, **When** doradca wybiera eksport, **Then** otrzymuje
   plik CSV zawierający nagłówki i wszystkie raty w kolejności harmonogramu.

### Edge Cases

- Wartość wskaźnika po ostatnim wpisie serii pozostaje ostatnią znaną wartością.
- Data pierwszej raty musi być prawidłową datą w formacie YYYY-MM-DD.
- Liczba rat i kwota kredytu muszą być dodatnie, a marża nie może być nieokreślona.
- Kwota nadpłaty musi być dodatnia i przypisana do istniejącego miesiąca harmonogramu.
- Zaokrąglenie do grosza nie może powodować, że suma części kapitałowych różni się od
  kwoty kredytu; ostatnia rata wyrównuje tę różnicę.
- Harmonogram nie może zawierać ujemnego salda ani ujemnej raty.
- Dla pustej listy nadpłat obliczenie musi działać tak samo jak dla kredytu bez nadpłat.
- Dla zmiany wskaźnika w dniu raty nowa wartość obowiązuje od właściwego okresu,
  bez naliczania odsetek składanych w ramach miesiąca.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST przyjmować kwotę kredytu, liczbę rat, datę pierwszej raty,
  marżę, wskaźnik referencyjny i typ rat.
- **FR-002**: System MUST umożliwiać wybór POLSTR 1M albo WIBOR 3M oraz rat równych
  albo malejących.
- **FR-003**: System MUST obliczać oprocentowanie okresu jako wartość wskaźnika powiększoną
  o marżę.
- **FR-004**: System MUST stosować wartość wskaźnika obowiązującą w dniu danego okresu,
  a po końcu dostępnej serii używać ostatniej znanej wartości.
- **FR-005**: System MUST naliczać odsetki proste za okres według salda i stopy rocznej
  podzielonej przez 12, bez kapitalizacji w ramach miesiąca.
- **FR-006**: System MUST zaokrąglać kwoty do grosza i wyrównywać ostatnią ratę tak,
  aby suma części kapitałowych była równa kwocie kredytu.
- **FR-007**: System MUST umożliwiać dodanie listy nadpłat z miesiącem, kwotą i trybem
  „obniż ratę” albo „skróć okres”.
- **FR-008**: System MUST ponownie obliczać saldo i dalszy harmonogram po każdej nadpłacie
  zgodnie z wybranym trybem.
- **FR-009**: System MUST zwracać numer, datę, część kapitałową, część odsetkową, ratę
  i saldo po spłacie dla każdej raty oraz sumę odsetek za cały okres.
- **FR-010**: System MUST prezentować pierwszą i ostatnią ratę, sumę odsetek i kompletną
  tabelę harmonogramu.
- **FR-011**: System MUST umożliwiać eksport kompletnego harmonogramu do pliku CSV.
- **FR-012**: System MUST odrzucać brakujące, niepoprawne lub niespójne dane wejściowe
  z komunikatem wskazującym przyczynę.
- **FR-013**: System MUST gwarantować, że saldo po spłacie nie jest ujemne, a harmonogram
  kończy się po całkowitej spłacie kapitału.

### Key Entities *(include if feature involves data)*

- **Parametry kredytu**: kwota, liczba rat, data pierwszej raty, marża, wskaźnik,
  typ rat i lista nadpłat.
- **Seria wskaźnika**: identyfikator wskaźnika oraz uporządkowane wartości obowiązujące
  od określonych dat.
- **Nadpłata**: miesiąc harmonogramu, kwota i wybrany sposób wpływu na dalszą spłatę.
- **Rata**: numer, data, część kapitałowa, część odsetkowa, łączna kwota i saldo po spłacie.
- **Harmonogram**: uporządkowana lista rat oraz suma odsetek za cały okres.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Doradca może otrzymać kompletny harmonogram dla poprawnych danych w czasie
  nie dłuższym niż 5 sekund.
- **SC-002**: Dla danych liczby kontrolnej wynik raty równej wynosi 2 494,72 zł
  z tolerancją 0,05 zł, a ostatnia rata wyrównująca wynosi 2 492,53 zł.
- **SC-003**: Dla każdego poprawnego harmonogramu suma części kapitałowych po zaokrągleniu
  jest równa kwocie kredytu z dokładnością do 1 grosza, a saldo końcowe wynosi 0.
- **SC-004**: Wszystkie pięć przypadków minimalnego zestawu testów z BRIEF.md daje wynik
  zgodny z regułami biznesowymi: rata równa, rata malejąca, zmiana wskaźnika, oba tryby
  nadpłaty oraz suma kapitału.
- **SC-005**: Doradca może znaleźć pierwszą ratę, ostatnią ratę i sumę odsetek bez
  przeliczania danych ręcznie.
- **SC-006**: Eksport zawiera 100% rat i wszystkie wymagane kolumny w tej samej kolejności
  co wynik prezentowany doradcy.

## Assumptions

- Kalkulator jest przeznaczony dla doradców bankowych i użytkowników analizujących
  przykładowe oferty; nie zastępuje wiążącego wyliczenia banku.
- Wartości wskaźników dostarczone dla MVP są przykładowymi seriami i nie są pobierane
  z zewnętrznego źródła w trakcie obliczeń.
- Wartość wskaźnika dla okresu jest używana wprost z serii; składanie dziennych stawek
  POLSTR wstecz za okres odsetkowy pozostaje poza zakresem MVP.
- Marża jest podawana w punktach procentowych, a wartości wskaźnika w formie ułamka
  dziesiętnego zgodnie z danymi wejściowymi.
- Nadpłaty przypadają na miesięczne okresy harmonogramu i są stosowane po naliczeniu
  oraz spłacie raty za wskazany okres.
- Jedna lista parametrów opisuje jedno obliczenie; zapisywanie historii, logowanie,
  uwierzytelnianie i obsługa wielu użytkowników są poza zakresem MVP.
- Interfejs ma działać na komputerze doradcy oraz na ekranie mobilnym bez utraty
  wymaganych danych tabeli.
