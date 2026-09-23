# Implementation Plan: Harmonogram spłat POLSTR

**Branch**: `001-harmonogram-polstr` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-harmonogram-polstr/spec.md`

## Summary

Kalkulator przyjmuje parametry kredytu hipotecznego, wybór POLSTR 1M albo WIBOR 3M,
typ rat oraz nadpłaty, po czym zwraca kompletny miesięczny harmonogram i umożliwia jego
prezentację oraz eksport CSV. Obliczenia powstaną jako czyste funkcje TypeScript operujące
na całkowitych groszach, serie wskaźników zostaną dostarczone do domeny przez `src/dane/`,
a cienki route handler App Router udostępni wynik klientowi React.

## Technical Context

**Language/Version**: TypeScript 5.9 w trybie strict, Node.js 22 lub nowszy

**Primary Dependencies**: Next.js 16.3.6 App Router, React 19.2.8, Tailwind CSS 4

**Storage**: Statyczne pliki JSON w `dane/`; brak bazy danych i trwałego stanu użytkownika

**Testing**: Vitest 4.1.11 dla domeny i modułu danych; TypeScript oraz produkcyjny build

**Target Platform**: Współczesne przeglądarki desktopowe i mobilne; Vercel/Node.js dla API

**Project Type**: Aplikacja internetowa Next.js z route handlerem JSON

**Performance Goals**: Pełny harmonogram do 300 rat wyświetlony w czasie poniżej 5 sekund

**Constraints**: Brak nowych zależności i I/O w domenie; kwoty w całkowitych groszach;
jedno miejsce zaokrąglania; GET z query string; CSV generowany w przeglądarce

**Scale/Scope**: Jeden ekran, jeden endpoint, dwie serie wskaźników, dwa typy rat i dwa
tryby nadpłat; bez kont, historii i integracji z zewnętrznym źródłem danych

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Czysta domena obliczeń**: PASS. Cała matematyka, walidacja reguł finansowych i budowa
  rat pozostają w `src/domena/`; API jedynie konwertuje kontrakt wejściowy.
- **Jawna reprezentacja finansowa**: PASS. Kontrakt domeny używa groszy jako liczb
  całkowitych, stóp jako ułamków, a każda kwota jest zaokrąglana raz do grosza.
- **Test-first dla domeny**: PASS. Plan przewiduje testy liczb kontrolnych i przypadków
  granicznych przed implementacją każdego zachowania domenowego.
- **Kontrolowane źródło wskaźników**: PASS. JSON jest importowany wyłącznie przez
  `src/dane/wskazniki.ts`, a domena otrzymuje serię jako argument.
- **Minimalna architektura**: PASS. Pozostają Next.js App Router, React, Tailwind i Vitest,
  bez nowej biblioteki UI ani zależności wykonawczej.
- **Zakres MVP**: PASS. Projekt obejmuje oba wskaźniki, oba typy rat, oba tryby nadpłat,
  tabelę oraz eksport CSV po stronie klienta.
- **Bramki wydania**: PASS na etapie projektu. Implementacja musi przejść `npm test`,
  `npm run typecheck` i `npm run build` przed zgłoszeniem gotowości.

**Ponowna ocena po fazie 1**: PASS. Model danych i kontrakt zachowują czystą domenę,
całkowite grosze oraz cienką warstwę HTTP. Nie wprowadzono odstępstw od konstytucji.

## Project Structure

### Documentation (this feature)

```text
specs/001-harmonogram-polstr/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md             # Powstanie dopiero w /speckit-tasks
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
    └── harmonogram.ts

tests/
└── *.test.ts

dane/
├── polstr-1m.json
└── wibor-3m.json
```

**Structure Decision**: Jedna aplikacja Next.js zgodna z istniejącym szkieletem. Moduł
danych odpowiada za import JSON, domena za wszystkie obliczenia, route handler za kontrakt
HTTP, a komponent klienta za formularz, prezentację i eksport.

## Complexity Tracking

Brak naruszeń wymagających uzasadnienia.
