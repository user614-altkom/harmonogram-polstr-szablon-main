# Badania i decyzje projektowe

## 1. Tryb nadpłaty i domyślne zachowanie

**Decyzja**: Nadpłata ma pola `miesiac`, `kwotaGr` i `tryb`, a `tryb` przyjmuje wartości `obniz_rate` albo `skroc_okres`. Jeżeli pole nie jest podane, system przyjmuje `skroc_okres` i traktuje to jako domyślny wariant zgodnie z wymaganiem.

**Uzasadnienie**: Zgodność z umową i wymaganiem biznesowym: klient ma prawo wybrać wariant, a brak wyboru musi zachować obecne zachowanie systemu.

**Alternatywy rozważone**: Wymaganie jawnego pola było konieczne, bo bez niego nie da się rozróżnić między wariantami; domyślne `skroc_okres` odrzucono jako niezgodne z wymaganiem, gdyby użytkownik miał wyraźnie wybierać wariant.

## 2. Księgowanie nadpłaty po racie miesiąca

**Decyzja**: Nadpłata jest rozliczana po spłacie bieżącej raty w danym miesiącu; odsetki w tym okresie liczą się od salda sprzed nadpłaty, natomiast saldo po nadpłacie jest pomniejszane o kwotę nadpłaty. W dalszym harmonogramie wynik wyliczany jest na podstawie salda po nadpłacie.

**Uzasadnienie**: To reguła wymieniona w dodatkowych wymaganiach i kluczowe dla spójności z kartą kontrolną. W praktyce każda nadpłata zmienia podstawę dalszych obliczeń od następnego okresu.

**Alternatywy rozważone**: Księgowanie nadpłaty „przed odsetkami” odrzucono, bo łamałoby definicję salda po racie i powodowało rozbieżności z liczbami kontrolnymi.

## 3. Rekompensata art. 40

**Decyzja**: Rekompensata będzie liczone jako `min(3% * kwotaNadplaty, kwotaNadplaty * stopaOkresu, odsetkiZaRokOdKwoty)` i przyjmie wartość 0 dla nadpłat w miesiącach 37+; ma być oddzielna od salda, nie pomniejsza kapitału ani kwoty nadpłaty.

**Uzasadnienie**: Jest to dokładna implementacja zasady ograniczeń art. 40 oraz warunek akceptacji z karty. Rekompensata ma być osobną pozycją w wierszu i podsumowaniu, a nie redukcją salda.

**Alternatywy rozważone**: Wprowadzenie rekompensaty do samej salda odrzucono, bo niszczy zapisanie „czytelnego kosztu wcześniejszej spłaty” jako odrębnej opłaty i łamie warunki akceptacji.

## 4. Konwersja wskaźnika WIBOR na POLSTR

**Decyzja**: Wprowadza się parametry konwersji: data lub numer raty przejścia, nowy wskaźnik, spread korygujący oraz opcjonalnie własna seria danych. Od pierwszego okresu odsetkowego, który zaczyna się w dniu konwersji lub później, stopa = nowy wskaźnik + spread + marża. Saldo, marża i liczba rat pozostają bez zmian; rata po konwersji jest przeliczana na pozostałe raty od salda dnia konwersji.

**Uzasadnienie**: Takie rozwiązanie spełnia wymagania prawne i techniczne, a przy konwersji od raty 25 zachowuje ciągłość salda między 24. a 25. ratą i nie powoduje „skoku”.

**Alternatywy rozważone**: Przeliczanie od następnej raty bez uwzględnienia daty konwersji odrzucono, bo wymagałoby niezgodności z opisanym „okresem odsetkowym od daty konwersji”.

## 5. Przechowywanie i zaokrąglanie stóp i kwot

**Decyzja**: W domenie wszystkie kwoty będą przechowywane w całkowitych groszach, a stopy jako ułamki roczne. Obliczenia zaokrąglane do grosza będą wykonywane w jednym miejscu: przy przypisywaniu wartości do pola raty lub do salda w danym okresie.

**Uzasadnienie**: Zachowuje zgodność z konstytucją i gwarantuje, że suma części kapitałowych po zaokrągleniu odpowiada kwocie kredytu.

**Alternatywy rozważone**: Zaokrąglanie na bieżąco przy każdej operacji odrzucono, bo prowadzi do rozbieżności i trudniejszego testowania.

## 6. Wzajemne relacje danych i kontrakt API

**Decyzja**: Domena dostanie jawne obiekty: `Kredyt`, `Nadplata`, `Rekompensata`, `KonwersjaWskaznika`, `Rata`, `Harmonogram`. Route handler będzie parsować query string, przekonwertuje złote na grosze, a JSON z `nadplaty` lub `konwersja` będzie walidowany zgodnie z regułami domeny.

**Uzasadnienie**: Pozwala utrzymać czytelny kontrakt wejściowy i testowalność bez I/O w domenie.

**Alternatywy rozważone**: Rozszerzanie `ParametryKredytu` o kilka niezależnych paramów bez modelu domenowego odrzucono, bo utrudnia testy i kontrolę poprawności.
