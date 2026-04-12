# Mortgage Geek — CLAUDE.md

## Overview

Single-page React app (Vite) deployed on Vercel. All UI lives in one large file: `src/App.jsx` (~4700 lines). No router library — routing is manual via `window.location.pathname`.

## Color Palette (`P`)

```js
const P = {
  navy: "#1B3A4B", navyDark: "#0F2530", navyLight: "#2C5468",
  gold: "#B8860B", goldLight: "#D4A843", goldMuted: "#8B6914",
  cream: "#FAF7F2", creamDark: "#F0EBE3",
  warmGray: "#6B6358", warmGrayLight: "#9B9488",
  white: "#FFFFFF", sage: "#5A7A6E",
  text: "#2C2825", textLight: "#5C5650",
};
```

Program-specific colors: `PROGRAM_COLORS` maps `Conventional` (navy), `FHA` (goldMuted), `VA` (sage).

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
