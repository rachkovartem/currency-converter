# Changelog

All notable changes to this project are documented here.  
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) · Versioning: [SemVer](https://semver.org/)

---

## [1.2.0] — 2026-05-03

### Added
- **Recent currencies** — History button now shows the last 10 currencies added via the picker (stored in localStorage)
- **Focus Mode** — new Display Settings toggle; hides header, footer and sidebar UI leaving only currency tiles; Recent + Settings buttons float at the bottom flanking the swap pill
- **Compact density for grid tiles** — `CurrencyGridTile` now respects the density setting (compact: padding 8px, minHeight 90px, font 18px)
- Add Currency button visible in Focus Mode

### Changed
- Default density changed from **Compact** to **Standard** (comfortable); new Compact is narrower (padY 5px, font 14–18px)
- Top padding in header reduced from 52px to 16px
- Content area top padding now matches side padding (`clamp(6px, 3vw, 12px)` on all three sides)

### Fixed
- **Rounding drift on row swap** — `handleSwap` now stores up to 8 decimal places instead of truncating to display precision, eliminating ±1 unit drift in neighbouring rows
- **Clear-on-focus** — focusing an input now selects all text so the first keystroke replaces the old value (both list and grid layouts)
- **Show Flags off** — `FlagAvatar` now returns `null` when `showFlag=false` instead of rendering an empty chip circle

---

## [1.1.2] — 2026-05-03

### Fixed
- Keyboard detection: reverted flaky `focusin + visualViewport` approach

---

## [1.1.1] — 2026-05-03

### Fixed
- Keyboard detection via combined `focusin` + `visualViewport` baseline (reverted in 1.1.2)
- E2E AC-2 test now writes to cookie instead of localStorage

---

## [1.1.0] — 2026-05-03

### Added
- PWA offline support via Workbox service worker
- Real ECB rate timestamp displayed in header
- Network status indicator (Live / Offline pill)

### Removed
- Sparkline charts (replaced by cleaner header status)

---

## [1.0.7] — 2026-05-03

### Changed
- SSR store provider pattern: per-request isolated store via `ConverterStoreContext`

---

## [1.0.6] — 2026-05-03

### Added
- Cookie-based state persistence for personalised SSR

### Fixed
- Render full UI on server; prevent build-time API call

---

## [1.0.5] — 2026-05-03

### Added
- DOM-based element collapse logic in list rows
- Drag-and-drop rewrite
- Decimal formatting improvements

---

## [1.0.4] — 2026-05-03

### Added
- RUB and 15 additional currencies (full API coverage, 160 total)
- Dynamic DOM-based element collapse + decimal formatting improvements
- Minimal padding + dynamic input expansion for large numbers

---

## [1.0.3] — 2026-05-03

### Added
- PWA splash screens and install screenshots

### Fixed
- Icons regenerated from higher-res source with sharpening

---

## [1.0.2] — 2026-05-03

### Added
- Favicon, PWA icons, OG/Twitter SEO images

### Fixed
- 320px layout: clamp all fixed sizes, truncate currency name
- Border/shadow on outer wrapper to fix corner artifact
- Remove nested `borderRadius` causing delete-layer bleed

---

## [1.0.1] — 2026-05-03

### Fixed
- Card border/shadow corner artefacts

---

## [1.0.0] — 2026-05-03

### Added
- Initial release: currency converter PWA with ExchangeRate-API, CI/CD pipeline
- 144 currencies, mobile responsiveness down to 320px
