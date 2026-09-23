<!--
Sync Impact Report
- Version change: scaffold -> 1.0.0
- Modified principles: none; scaffold principles replaced with project-specific principles
- Added sections: Constraints, Development Workflow
- Removed sections: none
- Follow-up TODOs: determine the original ratification date
-->

# Harmonogram na POLSTR Constitution

## Core Principles

### I. Czysta domena obliczeń
Logika harmonogramu MUST znajdować się w czystych funkcjach TypeScript w `src/domena/`.
Moduły domenowe MUST nie importować React, wykonywać I/O ani zależeć od czasu systemowego.
Route handler i ekran MUST delegować obliczenia do domeny, aby reguły finansowe były testowalne
niezależnie od frameworka.

### II. Jawna reprezentacja finansowa
Kwoty MUST być reprezentowane w groszach jako liczby całkowite albo zaokrąglane w jednym,
jawnie wskazanym miejscu. Oprocentowanie MUST być przechowywane i przeliczane z jasno
określoną konwencją jednostek. Rata wyrównująca MUST zapewnić, że suma części kapitałowych
po zaokrągleniu równa się kwocie kredytu.

### III. Test-first dla domeny
Każda zmiana logiki obliczeń MUST mieć test w `tests/`, napisany przed implementacją lub
razem z nią w cyklu czerwony-zielony-refaktoryzacja. Testy MUST obejmować liczby kontrolne
oraz przypadki graniczne istotne dla zmiennych stóp, typów rat i nadpłat.

### IV. Dane wskaźników z kontrolowanym źródłem
Serie POLSTR i WIBOR MUST być wczytywane z plików JSON w `dane/` przez moduł
`src/dane/`. Kod aplikacji MUST traktować ostatnią znaną wartość jako obowiązującą po
końcu serii, a zmianę częstotliwości wskaźnika MUST respektować zgodnie z wymaganiami
MVP. Pliki w `dane/` MUST nie być zmieniane bez wyraźnego zakresu zadania.

### V. Minimalna i sprawdzalna architektura
Projekt MUST używać Next.js App Router, TypeScript strict, Tailwind i Vitest bez nowych
zależności, chyba że ich potrzeba zostanie uzasadniona i zaakceptowana. Route handler
`app/api/harmonogram/route.ts` MUST wyłącznie parsować parametry, wywoływać domenę i zwracać
JSON. Interfejs MUST pobierać dane z tego API, a złożoność wykraczająca poza MVP MUST być
odłożona do osobnego zakresu.

## Constraints

MVP MUST obsługiwać raty równe i malejące, POLSTR 1M i WIBOR 3M, zmianę wskaźnika,
nadpłaty w trybie obniżenia raty i skrócenia okresu oraz eksport CSV po stronie przeglądarki.
Odsetki za okres MUST być liczone jako saldo razy stopa roczna podzielona przez 12,
z zaokrągleniem do grosza zgodnie z przyjętą regułą. Ekran MUST pozostać komponentem
React bez biblioteki UI, a produkcyjny build MUST działać na Vercel z repozytorium Git.

## Development Workflow

Prace MUST być prowadzone fazami określonymi w `tasks.md`, a każda faza MUST mieć osobny
pull request i review przed scaleniem. Przed zgłoszeniem gotowości MUST przejść `npm test`,
`npm run typecheck` i `npm run build`. Zmiany domeny MUST zawierać test z liczbą kontrolną
z `BRIEF.md`; niespełnienie bramki jakości blokuje wdrożenie.

## Governance

Konstytucja jest nadrzędna wobec lokalnych praktyk, a sprzeczne ustalenia MUST zostać
wyjaśnione przed implementacją. Zmiana konstytucji MUST opisać wpływ w raporcie zmian,
zwiększyć wersję zgodnie z SemVer i przejść ten sam przegląd co zmiana kodu.

Wersja MAJOR oznacza usunięcie lub redefinicję obowiązującej zasady. Wersja MINOR oznacza
nową zasadę albo istotne rozszerzenie zakresu. Wersja PATCH oznacza doprecyzowanie,
poprawkę językową lub zmianę bez wpływu na obowiązki. Każdy pull request MUST sprawdzić
zgodność z konstytucją, a odstępstwo MUST mieć uzasadnienie w opisie i zakres ograniczony
do niezbędnego minimum.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): data pierwotnego przyjęcia nie jest znana | **Last Amended**: 2026-09-23
