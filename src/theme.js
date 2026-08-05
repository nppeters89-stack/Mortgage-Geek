// Design tokens — colors, fonts, program colors, and the global CSS reset/utilities.
// When updating brand colors or typography, update here — every component will reflect the change.

export const P = {
  navy: "#24272A", navyDark: "#131416", navyLight: "#3C3D40",
  gold: "#CF3338", goldLight: "#E66A6E", goldMuted: "#AE2A2E",
  goldDeep: "#6E1A1E", // deep maroon end of the Arrow Red ramp (rich gradients on dark/red surfaces)
  goldReverse: "#E2575B", // Arrow Red lifted for dark surfaces (reverse "Geek" wordmark / cream-mark window)
  cream: "#F6F5F3", creamDark: "#E0DDD6", creamLight: "#FFFEFB",
  warmGray: "#6E7176", warmGrayLight: "#9A9DA2",
  white: "#FFFFFF", sage: "#5E6166", sageDark: "#3F5A4F",
  text: "#16171A", textLight: "#5E6166",
  // Semantic status colors (meaning-carrying) — harmonized to the Rate palette,
  // AA on cream, distinct from brand red (#CF3338). Tints derive from these via
  // withAlpha() at call sites so the system has one source of truth.
  success: "#3F5A4F", // eligible / pass / savings (same value as sageDark)
  caution: "#9C5811", // conditional / review / "you pay" — burnt amber, 5.05:1
  danger:  "#B0322B", // ineligible / fail / error — distinct from brand red
  successLight: "#7FB89B", // on-dark variant of success (~6.6:1 on navy)
  dangerLight:  "#E8918C", // on-dark variant of danger (~6.3:1 on navy)
  // Equation-only palette — scoped to DTIDeepDive's stacked-fraction render.
  // Housing uses prog.color; these apply to debts and income only.
  equationDebts: "#9A2B2B",
  equationIncome: "#2E7D5B",
};

// Single source of truth for program colors — used in calculator, prequal, and comparison
export const PROGRAM_COLORS = {
  Conventional: "#295994", // Rate Blue
  FHA: "#896619",          // Rate Gold, darkened for AA (white text 5.28:1, on-cream 4.84:1)
  VA: "#5E2224",           // Rate Burgundy
  USDA: "#226257",         // Rate Green
};

// Data-visualization colors for Geek Charts (dark charcoal canvas). Explicit
// hexes chosen by visual role, independent of the P chrome palette and
// PROGRAM_COLORS. Gold and cream pass 3:1 as graphical objects on the dark
// surface; accent is the Lifted Red already used for red-on-dark elsewhere.
export const CHART_COLORS = {
  gold: "#E8C05A",                  // gold data series on dark charcoal
  line: "#FFFEFB",                  // neutral data series on dark (cream)
  accent: "#E2575B",                // emphasis annotations on dark (Lifted Red)
  grid: "rgba(255,254,251,0.07)",   // gridlines on dark
  axis: "rgba(255,254,251,0.20)",   // axis lines / ticks on dark
  mortgage: "#F0605F",              // 30-year mortgage rate line (4.67:1 on P.navy)
  trend: "#F0A93B",                 // long-run trend / moving-average line (7.45:1 on P.navy)
  income: "#3B9EFF",                // income data series (5.39:1 on P.navy)
  sp500: "#3B9EFF",                 // equity-market data series on dark charcoal (same hex as income; distinct role)
  reinvest: "#5FBF8F",              // reinvest-mode data series and accents on dark charcoal (5.09:1 on P.navy)
};

// Heat-gradient stops for the first-time-homebuyer-age line (FthbAgeChart, shown
// on both the FTHB-age and price-to-income pages). The stroke warms left to
// right across the series — cool slate in the 1980s, amber through the 2000s,
// hot red at 2025 — so the post-2020 breakout reads as heat, not a neutral line.
// The fill reuses these, fading from red at the line to nothing at the baseline.
// Scoped here (not in the component) per the no-hardcoded-hex rule; mapped by
// visual role, never by name.
export const FTHB_HEAT = {
  slate:   "#4b6a86", // 1981, cool slate — stroke offset 0, fill baseline
  amber:   "#c99a3f", // ~2003, amber — stroke offset 0.50
  orange:  "#e8663c", // ~2015, orange — stroke offset 0.78, draw tracer
  red:     "#ff3b30", // 2025, hot red — stroke offset 1, fill top, record marker
  fillMid: "#c9663c", // fill midpoint tint (offset 0.55)
};

// Position-driven color scale for the price-to-income ratio line (PriceToIncomeChart,
// lower panel). Color tracks distance from the 3.52x crossover, not the year: above
// the average the line warms and deepens to oxblood (homes harder than normal), below
// it cools to violet (cheaper than normal), washing out to near-white at the average.
// strokeStops run top→bottom of the plot (offset 0 = 5.5x, offset 1 = 2x); the two
// stops that straddle the crossover are injected at runtime at avgOffset ± 0.001 so
// the break lands exactly on 3.52x at any viewport height. fillStops feed the split
// area fill (red above the average, blue below), with per-stop opacity set in the
// component. Scoped here per the no-hardcoded-hex rule; mapped by visual result.
export const PTI_SCALE = {
  strokeStops: [
    { off: 0,    c: "#6e0704" }, // 5.5x, near-oxblood (top of plot)
    { off: 0.15, c: "#a3120f" },
    { off: 0.24, c: "#c8201a" }, // ~4.67x, the 2022 peak
    { off: 0.34, c: "#ec4a34" },
    { off: 0.45, c: "#f2955f" },
    // crossover pair (pale warm / pale blue) injected at avgOffset ± 0.001
    { off: 0.66, c: "#63aade" },
    { off: 0.76, c: "#2a6ac0" },
    { off: 0.86, c: "#2a3cb0" },
    { off: 0.93, c: "#4a1f9e" },
    { off: 1,    c: "#5f1275" }, // 2x, violet (bottom of plot)
  ],
  crossWarm: "#fbd8c0", // pale warm, just above 3.52x
  crossBlue: "#d2e8f8", // pale blue, just below 3.52x
  fillStops: {
    redTop:  "#ff3b30", // fill opacity 0.60 at the top
    redAvg:  "#ff3b30", // fill opacity 0.08 just above the average
    blueAvg: "#3d7ea6", // fill opacity 0.08 just below the average
    blueBot: "#3b47b8", // fill opacity 0.45 at the bottom (2x)
  },
};

// Threshold color split for the mortgage-payment-burden line (PaymentBurdenChart,
// shown on the payment-burden and price-to-income pages). Unlike the year-based
// or depth-shaded ramps, this encodes only WHICH SIDE of the 23.7% long-run
// average a year sits on: red above (worse than average to be paying a mortgage),
// cool blue below (better). Each side stays near-uniform so the break — a hard
// stop at the average, injected at avgOffset ± 0.001 in the component — reads as
// a clean line crossing, not a distance ramp. Scoped here per no-hardcoded-hex.
export const BURDEN_HEAT = {
  worst: "#ff3b30", // 45%, worst — stroke offset 0; "worse than average" chip
  warm:  "#ff5a4a", // just above the 23.7% average
  cool:  "#5fa8d3", // just below the 23.7% average; "better than average" chip
  best:  "#4b7ea0", // 0%, best — stroke offset 1
};

// Calculator mode segmented control (design handoff: "Mode Toggle Explorations",
// option 2b·i, the spring-slide). Scoped like HOME/DEEP_DIVES so the rest of the
// palette is untouched; the coral accent and near-black track are specific to
// this control. Values are the handoff's, verbatim. Colors live here per the
// no-hardcoded-hex rule.
export const CALC_MODE = {
  track:         "#121315",              // control container (just under P.navyDark)
  border:        "#2e2f32",              // container hairline
  thumb:         "#e8737b",              // coral sliding thumb, focus ring
  thumbShadow:   "rgba(232,115,123,0.28)", // thumb drop shadow
  ring:          "rgba(232,115,123,0.55)", // payment-mode field focus ring
  labelActive:   "#1b1c1e",              // active label (on the coral thumb)
  labelInactive: "#9a9895",              // inactive label
};

export const F = {
  // Rate's web typeface, now site-wide for congruence with the editorial
  // homepage. display/body/sans all resolve to Figtree; the only exceptions are
  // the locked wordmark glyphs (MORTGAGE = DM Sans 700, GEEK = Archivo 800).
  display: "'Figtree', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Figtree', -apple-system, BlinkMacSystemFont, sans-serif",
  sans: "'Figtree', -apple-system, BlinkMacSystemFont, sans-serif",
};

// Editorial-homepage palette (design handoff). Kept separate from P so the rest
// of the site's tokens are untouched; values that match existing P tokens are
// noted. Colors live here (not in components) per the no-hardcoded-hex rule.
export const HOME = {
  red: "#CF3338",          // = P.gold (Arrow Red, primary)
  redHover: "#B82A2F",
  redGradFrom: "#D6373C",
  redGradTo: "#B82A2F",
  brightRed: "#FF5A5F",    // eyebrows on dark, "+" in stats
  star: "#FBBC04",         // Google review star gold
  ink: "#16171A",          // = P.text
  darkStage: "#181A1C",
  charcoal: "#202225",
  cream: "#F6F5F3",        // = P.cream
  warmWhite: "#FFFEFB",    // = P.creamLight
  white: "#FFFFFF",
  textSecondary: "#5E6166",
  textMuted: "#82858A",
  textMuted2: "#9A9DA2",
  textOnDark: "#C9CBCE",
  stepBodyDark: "#B9B9B7",   // Second Opinion step body on dark (AA on darkStage)
  finePrintDark: "#8F8F8D",  // Second Opinion fine print on dark (AA on darkStage)
  footerMuted: "#6E7176",
  borderLight: "#E0DDD6",  // = P.creamDark
  borderCard: "#E4E5E7",
  borderHairline: "#EFEEE9",
  rowDivider: "#E5E2DB",   // loan-products row hairline
  lockupDivLight: "#C7C4BC",
  lockupDivDark: "#4A4B4E",
  darkDivider: "#2A2C2F",
  dotInactive: "#D8D5CE",
  // Red-card text tints (light text/fine print on the red PowerBid card)
  redTint1: "#FBE3E4",
  redTint2: "#FBD2D3",
  redTint3: "#FBC9CB",
  redTint4: "#F4B9BB",
};

// /deep-dives index redesign palette (design handoff; this page ships LIGHT).
// Scoped like HOME so the rest of the site's tokens are untouched; values that
// match an existing P token are noted. Colors live here (not in components) per
// the no-hardcoded-hex rule, and are mapped by visual result, never by name.
export const DEEP_DIVES = {
  pageBg: "#F6F5F3",        // = P.cream
  surface: "#FFFFFF",       // = P.white (featured + library card surfaces)
  inset: "#EFEDEA",         // search field + emoji tile (sunken)
  divider: "#E4E2DE",       // hairline / card border
  dividerStrong: "#CBC9C4", // stronger border (inputs / Topics button)
  hoverLift: "#FAF8F5",     // featured / card hover background
  text: "#16171A",          // = P.text (primary text / titles)
  body: "#3A3D40",          // featured description / body
  muted: "#6F6D69",         // tagline / secondary
  dim: "#6F6D69",           // meta / verified date. Darkened from the spec's #8A8884
                            // (~3.5:1 on white) to clear WCAG AA 4.5:1 for this small
                            // text; AA is the handoff's hard requirement. Hierarchy
                            // vs the tagline now comes from size/weight, not color.
  accent: "#CF3338",        // = P.gold (Arrow Red: Read, badge fill, focus ring, active)
  badgeText: "#F6F5F3",     // = P.cream (LATEST pill text = deepest bg color)
  tintBg: "#FCEBEB",        // active Topics button fill / selected option bg
  tintBorder: "#E79A9C",    // active Topics button border
  tintText: "#B02A2E",      // active Topics / selected option text
  tintDim: "#CF8B8D",       // selected-option count text
  menuHover: "#F6F5F3",     // = P.cream (popover row hover)
};

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Figtree:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  ::selection { background: #CF3338; color: #fff; }
  html { background: #F6F5F3; overscroll-behavior-y: none; }
  body { background: #F6F5F3; margin: 0; min-height: 100vh; min-height: 100dvh; overscroll-behavior-y: none; }
  #root { min-height: 100vh; min-height: 100dvh; }
  html { scroll-behavior: auto; }

  /* PWA safe-area handling: adds padding equal to iOS status bar height when
     running as an installed home-screen app with black-translucent status bar.
     Adds 0 in regular browsers, ~47px on modern iPhones in standalone mode.
     Also makes tool page headers sticky on scroll. */
  .pwa-safe-top { padding-top: calc(20px + env(safe-area-inset-top, 0px)) !important; position: sticky; top: 0; z-index: 100; }
  @media (max-width: 900px) { .pwa-safe-top { position: fixed !important; top: 0; left: 0; right: 0; z-index: 200; }
    .tool-page-content { padding-top: calc(100px + env(safe-area-inset-top, 0px)) !important; } }
  .pwa-safe-top-sidebar { padding-top: calc(32px + env(safe-area-inset-top, 0px)) !important; }
  body { padding-bottom: 0; }

  /* Hide Call/Text button labels on narrow screens — keeps the tool page headers
     from wrapping to two rows. Icons remain as universal glyphs. */
  @media (max-width: 520px) {
    .btn-label-mobile-hide { display: none; }
  }

  /* Hero swimlane is desktop-only; mobile uses the JourneyOverviewMobile card. */
  @media (max-width: 820px) {
    .hero-journey-track { display: none !important; }
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }

  .main-content { flex: 1; margin-left: 280px; min-width: 0; --side-offset: 280px; }
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: #131416; z-index: 150; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom, 0px); }
  .sidebar-overlay { display: none; }
  .mobile-bar { display: none; }
  .mobile-bar-inner { padding: 0 20px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
  .hamburger { background: none; border: none; color: #24272A; font-size: 22px; cursor: pointer; }

  .nav-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px; border: none; border-radius: 8px; background: transparent; color: rgba(255,255,255,0.5); font-family: 'Figtree', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-align: left; margin-bottom: 2px; }
  .nav-btn:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
  .nav-btn-active { background: rgba(255,255,255,0.08) !important; color: #fff !important; }

  .content-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }

  .tab-btn { font-family: 'Figtree', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 20px; border-radius: 8px; border: 1px solid #E0DDD6; background: #fff; color: #9A9DA2; cursor: pointer; transition: all 0.15s; }
  .tab-btn:hover { border-color: #24272A; color: #24272A; }
  .tab-btn-active { background: #24272A !important; color: #fff !important; border-color: #24272A !important; }

  .process-grid { display: flex; gap: 24px; flex-wrap: wrap; }
  .process-steps { flex: 0 0 280px; display: flex; flex-direction: column; gap: 4px; min-width: 240px; }
  .process-step { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border: none; border-radius: 10px; background: transparent; font-family: 'Figtree', sans-serif; font-size: 13px; color: #6E7176; cursor: pointer; text-align: left; transition: all 0.15s; }
  .process-step:hover { background: rgba(255,255,255,0.6); }
  .process-step-active { background: #fff !important; color: #16171A !important; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
  .process-num { font-family: 'Figtree', sans-serif; font-weight: 700; font-size: 20px; color: #9A9DA2; min-width: 28px; line-height: 1.3; }
  .process-num-active { color: #CF3338 !important; }
  .process-detail { flex: 1; background: #fff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.04); min-width: 300px; }

  .costs-cat-head { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border: none; background: #fff; font-family: 'Figtree', sans-serif; font-size: 15px; font-weight: 600; color: #24272A; cursor: pointer; transition: all 0.15s; border-radius: 12px; }
  .costs-cat-head:hover { background: #F6F5F3; }
  .costs-cat-head-active { background: #24272A !important; color: #fff !important; border-radius: 12px 12px 0 0; }

  .calc-grid { max-width: 880px; display: flex; gap: 28px; flex-wrap: wrap; }
  .calc-grid > *:first-child { flex: 1 1 300px; }
  .calc-grid > *:last-child { flex: 1 1 360px; }

  section[id], [id^="costs-cat-"], #costs-trid { scroll-margin-top: calc(16px + env(safe-area-inset-top, 0px)); }

  /* When sidebar is open, freeze document scroll via overflow:hidden.
     touch-action:none prevents iOS touch-scroll from driving the root
     scroller. We intentionally DO NOT set height:100% here — doing so
     reflows html/body and causes iOS to visually jump the viewport back
     to the top of the page while locked. overflow:hidden alone locks
     scrolling while preserving the current scroll position. */
  html.sidebar-locked,
  html.sidebar-locked body { overflow: hidden !important; touch-action: none !important; }

  /* App root: inherit html/body background (cream on desktop, navy on mobile).
     Prevents a flash of cream showing behind the sidebar during fast swipes. */
  .app-root { background: transparent; }

  @media (max-width: 900px) {
    html, body { background: #131416 !important; }
    body { overflow-x: hidden; overscroll-behavior: none; -webkit-overflow-scrolling: touch; }
    section[id], [id^="costs-cat-"], #costs-trid { scroll-margin-top: calc(64px + env(safe-area-inset-top, 0px)); }
    .sidebar { transform: translateZ(0); padding-top: calc(56px + env(safe-area-inset-top, 0px)); padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); z-index: 100; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; top: 0; left: 0; width: 280px; height: 100vh; height: 100dvh; bottom: auto; }
    .sidebar::before { content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #131416; z-index: -1; }
    .sidebar-open { transform: none; }
    .sidebar-dragging { transition: none !important; }
    .sidebar-overlay { display: none; }
    .sidebar-overlay-visible { display: none; }
    .mobile-bar { display: block !important; position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: #FFFFFF; border-bottom: 1px solid #E0DDD6; padding-top: env(safe-area-inset-top, 0px); transition: transform 0.3s ease; will-change: transform; }
    .mobile-bar-open { transform: translateX(280px); }
    /* will-change: transform is permanent on mobile so the compositor layer
       exists BEFORE the sidebar-open transition starts. On iOS, applying
       will-change at the same frame as a transform change caused the element
       to snap to end-state before the layer was ready, making main-content
       arrive ahead of the (already composited) .mobile-bar.

       touch-action: pan-y blocks iOS from interpreting horizontal drags as
       a native pan/back-swipe gesture on main-content. Without this, iOS
       was compounding its own horizontal gesture with our JS translateX,
       causing main-content to drag much further right than the finger and
       snap back on release. The header is position:fixed so iOS native
       gestures don't affect it — hence it was the only element that moved
       correctly before this fix. */
    .main-content { margin-left: 0 !important; --side-offset: 0px; padding-top: calc(56px + env(safe-area-inset-top, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px); transition: transform 0.3s ease, border-radius 0.3s ease; position: relative; z-index: 130; background: #F6F5F3; min-height: 100dvh; will-change: transform; touch-action: pan-y; }
    .main-content::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); opacity: var(--sidebar-dim, 0); pointer-events: none; transition: opacity 0.3s ease; z-index: 9999; }
    .main-content-open { transform: translateX(280px); border-radius: 16px 0 0 0; overflow: hidden; box-shadow: -4px 0 24px rgba(0,0,0,0.15); --sidebar-dim: 1; }
    .main-content-open::after { pointer-events: auto; }
    .process-grid { flex-direction: column; }
    .process-steps { flex: 1 1 auto; }
    /* Mobile accordion: detail panel renders inline below its active step button
       instead of as a sibling column. Reduce padding for tighter mobile fit. */
    .process-steps .process-detail { margin: 4px 0 12px; padding: 24px 20px; }
    .calc-grid { flex-direction: column; }
    .calc-grid > *:first-child, .calc-grid > *:last-child { flex: 1 1 auto; }
  }
  @media (max-width: 600px) {
    section { padding-left: 20px !important; padding-right: 20px !important; }
  }

  @media (max-width: 900px) {
    .section-shell {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }
    .section-shell > aside {
      position: static !important;
    }
  }

  /* Full-bleed section: extends background to .main-content edges (viewport edge
     on mobile, just inside the sidebar on desktop) while keeping inner content
     positioned exactly where it would be without the bleed. Uses --side-offset
     set on .main-content so the math accounts for the 280px sidebar on desktop. */
  .section-bleed {
    margin-left: calc(var(--side-offset, 0px) / 2 + 50% - 50vw);
    margin-right: calc(var(--side-offset, 0px) / 2 + 50% - 50vw);
    padding-left: calc(50vw - 50% - var(--side-offset, 0px) / 2 + 40px) !important;
    padding-right: calc(50vw - 50% - var(--side-offset, 0px) / 2 + 40px) !important;
  }
  @media (max-width: 600px) {
    .section-bleed {
      padding-left: calc(50vw - 50% - var(--side-offset, 0px) / 2 + 20px) !important;
      padding-right: calc(50vw - 50% - var(--side-offset, 0px) / 2 + 20px) !important;
    }
  }

  @keyframes mg-toast-in {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes rate-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.9; }
  }

  /* Co-brand header lock-up: on narrow phones the tool/deep-dive headers also
     carry Call/Text/back controls, so drop the Rate mark + divider there and
     fall back to the MG lock-up. The full co-brand shows from 600px up. */
  @media (max-width: 600px) {
    .cobrand-rate { display: none !important; }
  }

  /* ── Refreshed Mortgage Geek lock-up system (Lockup Implementation Spec) ──
     All proportions derive from one var, --mg-h (the monogram height). Set it
     per placement; everything else scales. MORTGAGE = DM Sans 700, GEEK =
     Archivo 800 true Arrow Red. The translateY optically centers the wordmark
     on the monogram (GEEK's descender space drops the geometric center ~5%). */
  .mg-lockup { display: inline-flex; align-items: center; gap: calc(var(--mg-h) * 0.24); }
  .mg-lockup__mark { height: var(--mg-h); width: auto; display: block; }
  .mg-lockup__words { display: flex; flex-direction: column; line-height: 1; transform: translateY(calc(var(--mg-h) * 0.05)); }
  .mg-lockup__top { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: calc(var(--mg-h) * 0.24); letter-spacing: 0.24em; text-transform: uppercase; }
  .mg-lockup__geek { font-family: 'Archivo', sans-serif; font-weight: 800; font-size: calc(var(--mg-h) * 0.60); letter-spacing: -0.01em; text-transform: uppercase; color: #CF3338; margin-top: calc(var(--mg-h) * 0.05); }

  .mg-cobrand { display: inline-flex; align-items: center; gap: calc(var(--mg-h) * 0.39); }
  .mg-cobrand__rate { height: calc(var(--mg-h) * 0.61); width: auto; display: block; }
  .mg-cobrand__divider { width: 1px; height: var(--mg-h); }

  .mg--light .mg-lockup__top { color: #16171A; }
  .mg--light .mg-cobrand__divider { background: #C7C4BC; }
  .mg--dark .mg-lockup__top { color: #E8E6E1; }
  .mg--dark .mg-cobrand__divider { background: #4A4B4E; }

  /* "Pay it off faster" toggle (animation handoff 4a). Idle: Ravenswood Gray
     (#24272A = P.navy) with a white sheen sweeping every 3s while the payoff
     panel is collapsed. Open (.is-open, driven by the panel's own state): takes
     the loan-program color (--program-color, set inline per card), sheen off,
     arrow rotated to point down. Sheen is disabled for reduced-motion users. */
  .pay-faster { position: relative; overflow: hidden; display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 15px; border: 1px solid #33363a; border-radius: 10px; background: #24272A; color: #f4f4f2; font: 600 14.5px/1 inherit; cursor: pointer; transition: background .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease; }
  .pay-faster > * { position: relative; z-index: 1; }
  .pay-faster .bolt { color: #ef8f3c; }
  .pay-faster .arrow { margin-left: auto; color: #b6b8bb; transition: transform .2s ease, color .15s ease; }
  .pay-faster::after { content: ""; position: absolute; top: 0; left: 0; width: 34%; height: 100%; z-index: 0; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent); animation: pay-faster-sheen 3s ease-in-out infinite; }
  @keyframes pay-faster-sheen {
    0%   { transform: translateX(-140%) skewX(-18deg); }
    100% { transform: translateX(340%)  skewX(-18deg); }
  }
  .pay-faster.is-open { background: var(--program-color, #24272A); border-color: var(--program-color, #24272A); color: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
  .pay-faster.is-open::after { animation: none; content: none; }
  .pay-faster.is-open .bolt { color: #fff; }
  .pay-faster.is-open .arrow { color: #fff; transform: rotate(90deg); }
  @media (prefers-reduced-motion: reduce) { .pay-faster::after { animation: none; } }
`;
