# Implementation Plan: Kredyt z nadpłatami, rekompensatą i konwersją wskaźników

**Branch**: `002-kredyt-wskazniki-nadplaty` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-kredyt-wskazniki-nadplaty/spec.md`

## Summary

Plan obejmuje rozszerzenie kalkulatora harmonogramu o trzy powiązane reguły biznesowe: wybór trybu nadpłaty, naliczanie rekompensaty z art. 40 oraz konwersję wskaźnika WIBOR na POLSTR z spreadem korygującym. Rozwiązanie zachowa czystą domenę obliczeń w `src/domena/`, pozostawi HTTP jako cienki kontrakt w `app/api/harmonogram/route.ts` i pozwoli na porównanie wariantów w jednym harmonogramie bez zmiany ogólnej architektury aplikacji.

## Technical Context

**Language/Version**: TypeScript 5.x w trybie strict; Node.js 22+ dla środowiska deweloperskiego i Vercel

**Primary Dependencies**: Next.js App Router, React 19, Tailwind CSS 4, Vitest 4

**Storage**: Statyczne serie danych z plików JSON w `dane/`; brak bazy danych lub trwałego stanu

**Testing**: Vitest dla domeny i danych; testy liczb kontrolnych dla nadpłat, rekompensaty i konwersji wskaźnika

**Target Platform**: Przeglądarki desktopowe i mobilne; aplikacja hostowana na Vercel

**Project Type**: Aplikacja webowa z Next.js i route handlerem JSON

**Performance Goals**: Harmonogram do 240–300 rat obliczany natychmiast, bez zauważalnej zwłoki w UI

**Constraints**: Brak nowych zależności; kwoty w groszach; zaokrąglanie w jednym miejscu; API musi pozostawać cienkie; eksport CSV po stronie klienta

**Scale/Scope**: Jedna aplikacja, jeden ekran, jeden endpoint, trzy dodatkowe reguły finansowe, bez historii użytkownika i logowania

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Czysta domena obliczeń**: PASS. Cała logika nadpłat, rekompensaty i konwersji wskaźnika pozostanie w `src/domena/` oraz w modelach typu `Rata`, `Nadplata` i `KonwersjaWskaznika`.
- **Jawna reprezentacja finansowa**: PASS. Kwoty pozostaną w groszach, stopy jako ułamki roczne, a ostatnia rata wyrównująca będzie jednym miejscem zaokrąglania.
- **Test-first dla domeny**: PASS. Każda zmiana logiki obliczeń będzie zabezpieczona testem z liczbą kontrolną z karty, w tym przypadkami granicznymi dla 36. miesiąca oraz przejścia wskaźnika.
- **Kontrolowane źródło wskaźników**: PASS. Serie WIBOR i POLSTR będą nadal czytane z `dane/*.json` za pośrednictwem `src/dane/wskazniki.ts`.
- **Minimalna architektura**: PASS. Nie dodajemy nowych paczek; używamy istniejącego Next.js, React, Tailwind i Vitest.
- **Zakres MVP**: PASS. Zakres obejmuje tryb nadpłaty, rekompensatę art. 40, konwersję wskaźnika i pełen harmonogram; nie rozszerzamy poza te trzy elementy.
- **Bramki wydania**: PASS. Przed gotowością zostaną wykonane `npm test`, `npm run typecheck` i `npm run build`.

**Ponowna ocena po fazie 1**: PASS. Plan zachowuje czystą domenę, zgodność z konstytucją oraz minimalną architekturę bez nadużywania I/O.

## Project Structure

### Documentation (this feature)

```text
specs/002-kredyt-wskazniki-nadplaty/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md             # powstanie w /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── api/harmonogram/route.ts
├── globals.css
├── layout.tsx
└── page.tsx

src/
├── dane/
│   └── wskazniki.ts
└── domena/
    ├── harmonogram.ts
    └── (nowe typy/obliczenia dla nadpłat, konwersji i rekompensaty)

tests/
├── harmonogram-rowne.test.ts
├── harmonogram-zmienne.test.ts
├── nadplaty-obnizenie.test.ts
├── nadplaty-skrocenie.test.ts
├── harmonogram-walidacja.test.ts
├── wskazniki.test.ts
└── nowe testy dla art. 40 i konwersji wskaźnika
```

**Structure Decision**: Jedna aplikacja Next.js z istniejącym szkieletem. Moduł domeny rozbuduje się o funkcje obliczeniowe dla trybu nadpłaty, rekompensaty i przejścia wskaźnika; `route.ts` pozostanie cienki; ekran będzie pobierał dane z API i prezentował wyniki w tabeli oraz CSV.

## Complexity Tracking

Brak naruszeń konstytucji wymagających uzasadnienia.
