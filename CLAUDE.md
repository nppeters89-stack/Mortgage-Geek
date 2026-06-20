# Mortgage Geek — CLAUDE.md

## Overview

Single-page React app (Vite) deployed on Vercel. No router library — routing is manual via `window.location.pathname`. The UI is split across `src/pages/` (~25 page components, lazy-loaded) and `src/components/` (~70 components); `src/App.jsx` is a thin (~140-line) router shell that maps the path to a lazy-loaded page. Design tokens live in `src/theme.js`; shared data in `src/data/` and helpers in `src/utils/`.

## Color Palette (`P`)

Rate brand palette (Phase 2 refresh — charcoal/Arrow-red/Rate-cream/grey):

```js
export const P = {
  navy: "#24272A", navyDark: "#131416", navyLight: "#3C3D40",   // dark surfaces (Rate Black family)
  gold: "#CF3338", goldLight: "#F9F1F1", goldMuted: "#AE2A2E",  // Arrow Red — accent/CTA only
  cream: "#F6F5F3", creamDark: "#E0DDD6", creamLight: "#FFFEFB", // backgrounds / panels / cards
  warmGray: "#6E7176", warmGrayLight: "#9A9DA2",                // greys (warmGrayLight is on-dark only)
  white: "#FFFFFF", sage: "#5E6166", sageDark: "#3F5A4F",       // sage retired to grey
  siennaDark: "#6F3A1F",
  text: "#16171A", textLight: "#5E6166",                        // ink + secondary text
  equationDebts: "#9A2B2B", equationIncome: "#2E9D6B",          // scoped to DTIDeepDive only
};
```

Note: token NAMES are legacy (navy/gold/sage) but their VALUES are now Rate's palette — `navy` is charcoal, `gold` is Arrow Red, `sage` is grey. Renaming is deliberately deferred.

Program-specific colors: `PROGRAM_COLORS` holds its own hardcoded hex literals, **decoupled from `P`** — `Conventional` #1B3A4B, `FHA` #8B6914, `VA` #5A7A6E, `USDA` #A0522D. These intentionally retain the pre-refresh navy/gold/sage/sienna so the comparison grids and TN map are unaffected by `P` swaps; recoloring them is a later phase.

## Fonts (`F`)

```js
const F = {
  display: "'Instrument Serif', Georgia, serif",
  body: "'DM Sans', -apple-system, sans-serif",
};
```

## Brand Info

- **Loan Officer:** Nick Peters
- **NMLS#:** 1119524
- **Phone:** (615) 656-0737 (`tel:+16156560737`)
- **SMS body patterns:**
  - `"Hi%2C%20I%20found%20your%20site%20and%20had%20a%20question%20about%20mortgages."`
  - `"Hi%20Nick%2C%20I%20found%20your%20site%20and%20wanted%20to%20connect."`
- **Location:** Nashville, TN — Licensed since 2014

## Routing

Manual path-based routing in `MortgageLandingPage` (the default export):

| Path | Page Component |
|------|---------------|
| `/` | `MainSite` |
| `/calculator` | `CalculatorPage` |
| `/prequal` | `PreQualPage` |
| `/about` | `AboutPage` |
| `/compare` | `ComparePage` |
| `/cash-to-close` | `CashToClosePage` |
| `/install` | `InstallPage` |

Within `MainSite`, sections are rendered in order and linked via `id` attributes: `hero`, `getting-started`, `process`, `types`, `costs`, `profile`, `structure`, `rates`, `checklist`, `next-steps`. Navigation uses `navTarget` state with `{ section, step }` shape, and hash-based deep linking.

## PWA Setup

- `manifest.json` at project root — app name "The Mortgage Geek", standalone display, portrait orientation
- Icons: `/icon-192.png`, `/icon-512.png` (both `any` and `maskable`)
- Shortcuts defined for Calculator, Pre-Qual, Cash to Close
- `WelcomeToast` component shows a one-time toast on first PWA launch (localStorage key `mg_welcomed`)
- `InstallPage` provides platform-specific install instructions; detects iOS-not-Safari to warn about PWA limitations

## Custom Hooks

### `useIsMobile(breakpoint = 820)`
Returns `true` when viewport width <= breakpoint. Listens to `matchMedia` changes.

### `useIsStandalone()`
Returns `true` when running as installed PWA. Checks both W3C `display-mode: standalone` media query and iOS `navigator.standalone`.

## Utilities

- `fmt(n)` — formats number as USD currency with no decimals
- `generateAmortData(principal, annualRate, years)` — produces yearly amortization data for charts

## Key Patterns

- All styling is inline (no CSS modules/Tailwind) using `P` and `F` constants
- Components receive `navTarget` prop for deep-link navigation into specific steps
- Charts use `recharts` (AreaChart)
- Single file architecture — all components colocated in `src/App.jsx`
