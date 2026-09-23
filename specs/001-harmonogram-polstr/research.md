# Badania i decyzje projektowe

## Reprezentacja kwot i stóp

**Decyzja**: Warstwa HTTP przyjmuje kwotę w złotych i marżę w punktach procentowych,
po czym konwertuje je odpowiednio na całkowite grosze i ułamek dziesiętny. Domena operuje
wyłącznie na całkowitych groszach. `Math.round` jest stosowany do każdej obliczonej kwoty
dokładnie przy jej utrwaleniu w racie.

**Uzasadnienie**: Zapobiega kumulacji błędów zmiennoprzecinkowych w saldzie i spełnia
liczbę kontrolną oraz konstytucję.

**Rozważone alternatywy**: Kwoty w złotych jako `number` odrzucono z powodu niejawnej
precyzji. Bibliotekę dziesiętną odrzucono, ponieważ grosze wystarczają i nie wolno dodawać
zależności bez akceptacji.

## Dobór wartości wskaźnika

**Decyzja**: Dla daty raty wybierany jest ostatni wpis, którego `od` nie jest późniejsze
niż data raty. Po końcu serii obowiązuje ostatnia wartość. Data wcześniejsza niż pierwszy
wpis serii jest błędem walidacji.

**Uzasadnienie**: Realizuje semantykę zakresów dat opisaną w plikach JSON i nie tworzy
wartości, których źródło nie dostarcza. Kwartalny charakter WIBOR 3M wynika z dat wpisów,
więc domena nie potrzebuje osobnej reguły kalendarzowej.

**Rozważone alternatywy**: Użycie pierwszej wartości przed początkiem serii odrzucono jako
nieuzasadnioną ekstrapolację. Indeksowanie wyłącznie numerem miesiąca odrzucono, bo pomija
daty obowiązywania.

## Daty miesięcznych rat

**Decyzja**: Data wejściowa musi istnieć w kalendarzu i mieć format `YYYY-MM-DD`. Kolejne
raty przypadają w tym samym dniu kolejnych miesięcy, a gdy dzień nie istnieje, w ostatnim
dniu miesiąca. Obliczenia dat używają jawnych składowych UTC, bez czasu lokalnego.

**Uzasadnienie**: Reguła jest deterministyczna dla końca miesiąca i niezależna od strefy
czasowej serwera lub przeglądarki.

**Rozważone alternatywy**: Automatyczna normalizacja daty przez konstruktor `Date`
odrzucona, ponieważ `2026-02-31` nie może stać się pozornie poprawnym marcem.

## Raty równe przy zmiennej stopie

**Decyzja**: Rata annuitetowa jest obliczana z bieżącego salda, miesięcznej stopy i liczby
pozostałych okresów. Jest przeliczana, gdy zmienia się wartość wskaźnika albo nadpłata
w trybie „obniż ratę” zmienia saldo. Przy zerowej stopie kapitał dzieli się równo.

**Uzasadnienie**: Zachowuje planowany termin końcowy, a od okresu zmiany wskaźnika
odzwierciedla nową stopę. Ostatnia rata przejmuje pozostały kapitał i wyrównuje saldo.

**Rozważone alternatywy**: Jedna rata wyliczona na cały okres odrzucona, bo ignoruje
zmianę wskaźnika. Przeliczanie codziennych stóp POLSTR jest poza zakresem MVP.

## Raty malejące

**Decyzja**: Planowana część kapitałowa jest równa bieżącemu saldu podzielonemu przez
pozostałą liczbę rat i zaokrąglona do grosza; ostatnia rata pobiera całe saldo. Zmiana
wskaźnika wpływa wyłącznie na odsetki.

**Uzasadnienie**: Daje malejące raty i gwarantuje spłatę całego kapitału mimo zaokrągleń.

**Rozważone alternatywy**: Stała część kapitałowa zaokrąglona raz na początku wymagałaby
osobnego śledzenia reszty; bieżące wyliczenie prowadzi do tego samego celu prościej.

## Nadpłaty i skrócenie okresu

**Decyzja**: Nadpłata jest stosowana po odsetkach i planowanej części kapitałowej w danym
okresie, ograniczona do pozostałego salda. Pole `kapitalGr` obejmuje łączną redukcję salda,
a `nadplataGr` wskazuje jej nadprogramową część. Dlatego `rataGr = kapitalGr + odsetkiGr`.
W trybie „obniż ratę” pozostaje pierwotny termin. W trybie „skróć okres” dla rat równych
wybierana jest najmniejsza liczba okresów, dla której rata nie przekracza raty planowanej
przed nadpłatą; dla rat malejących zachowywana jest planowana część kapitałowa. Późniejsza
zmiana stopy przelicza ratę według już skróconej liczby pozostałych okresów.

**Uzasadnienie**: Oba tryby dają obserwowalnie różne wyniki, saldo nigdy nie jest ujemne,
a suma `kapitalGr` pozostaje równa kwocie kredytu.

**Rozważone alternatywy**: Traktowanie nadpłaty poza ratą odrzucono, bo łamałoby wymaganą
sumę części kapitałowych. Pozostawienie niezmiennej liczby okresów w trybie skrócenia
odrzucono, bo obniżałoby ratę zamiast skracać harmonogram.

## Kontrakt HTTP i walidacja

**Decyzja**: `GET /api/harmonogram` korzysta z `NextRequest.nextUrl.searchParams` i zwraca
JSON przez `NextResponse.json`, zgodnie z dokumentacją Next.js 16. Lista nadpłat jest
przekazywana jako zakodowany JSON w pojedynczym parametrze `nadplaty`. Błędy kontraktu
zwracają status 400 i pole `blad` wskazujące przyczynę.

**Uzasadnienie**: Zachowuje wymagany GET i cienki route handler, a JSON jednoznacznie
reprezentuje listę obiektów bez dodatkowej zależności parsera.

**Rozważone alternatywy**: POST odrzucono jako sprzeczny z BRIEF.md. Kilka pozycyjnych
parametrów na każdą nadpłatę odrzucono jako trudniejsze do walidacji i rozbudowy.

## Interfejs i eksport CSV

**Decyzja**: `app/page.tsx` pozostaje komponentem klienta, buduje query przez
`URLSearchParams`, pobiera JSON przez `fetch` i generuje CSV z aktualnego wyniku za pomocą
`Blob` oraz tymczasowego odnośnika do pobrania. CSV zawiera polskie nagłówki i kwoty
dziesiętne w jednoznacznie ustalonym formacie pliku.

**Uzasadnienie**: Eksport nie wymaga endpointu, stanu serwerowego ani biblioteki UI.

**Rozważone alternatywy**: Generowanie CSV na serwerze odrzucono jako zbędne I/O.

## Testowanie i wydanie

**Decyzja**: Testy Vitest obejmą liczbę kontrolną, raty malejące, zmianę wskaźnika, oba
tryby nadpłat, sumę kapitału, walidację oraz końce miesięcy. Bramki wydania to kolejno
`npm test`, `npm run typecheck` i `npm run build`.

**Uzasadnienie**: Pokrywa mierzalne kryteria specyfikacji oraz obowiązki konstytucji.

**Rozważone alternatywy**: Testy komponentu i route handlera nie są częścią bieżącej
konwencji repozytorium; kontrakt HTTP będzie weryfikowany scenariuszem quickstart.