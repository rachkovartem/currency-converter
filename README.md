# Currency Converter

A mobile-first PWA currency converter built with Next.js 16, React 19 and Zustand.  
Live rates via [Frankfurter / ECB](https://www.frankfurter.app/). Works offline.

## Features

- **160+ currencies** with emoji flags
- **List & Grid layouts** with drag-and-drop reordering
- **Compact / Standard density** modes
- **Focus Mode** — hides all UI chrome, leaves only the currency tiles
- **Recent currencies** — last 10 picks stored in localStorage
- **Favourites** section with rate sparklines
- **PWA** — installable, offline-capable via service worker
- **SSR personalisation** — cookie-persisted state renders correctly on the server
- **Dark glassmorphism** UI

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, inline styles, framer-motion |
| State | Zustand 5 (cookie-persisted) |
| Icons | lucide-react |
| Rates API | Frankfurter (ECB, daily) |
| Tests | Vitest + Testing Library (unit) · Playwright (E2E) |
| PWA | Workbox (service worker) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

```bash
npm test           # vitest unit + integration tests
npm run test:watch # watch mode
npx playwright test # E2E tests (requires running dev server)
npm run build      # production build
npm run lint       # ESLint
```

## Project structure

```
src/
  app/              # Next.js App Router (layout, page, offline)
  components/       # UI components
    ui/             # Primitives (BottomSheet, FlagAvatar, Glass, Segmented)
  hooks/            # useReorder, useSwipeToDelete, useRates
  lib/              # rates, currencies, types, cookie-storage, local-storage
  store/            # Zustand converter store
  __tests__/        # Vitest test suites
e2e/                # Playwright E2E specs
```

## Versioning

[Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR** — breaking changes or full redesign
- **MINOR** — new features (backward-compatible)
- **PATCH** — bug fixes and small improvements

See [CHANGELOG.md](./CHANGELOG.md) for release history.
