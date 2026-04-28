// Design tokens — colors, fonts, program colors, and the global CSS reset/utilities.
// When updating brand colors or typography, update here — every component will reflect the change.

export const P = {
  navy: "#1B3A4B", navyDark: "#0F2530", navyLight: "#2C5468",
  gold: "#B8860B", goldLight: "#D4A843", goldMuted: "#8B6914",
  cream: "#FAF7F2", creamDark: "#F0EBE3",
  warmGray: "#6B6358", warmGrayLight: "#6F6860",
  white: "#FFFFFF", sage: "#5A7A6E", sageDark: "#3F5A4F",
  text: "#2C2825", textLight: "#5C5650",
};

// Single source of truth for program colors — used in calculator, prequal, and comparison
export const PROGRAM_COLORS = {
  Conventional: "#1B3A4B", // navy
  FHA: "#8B6914",          // goldMuted (darker for better white text contrast)
  VA: "#5A7A6E",           // sage
  USDA: "#A0522D",         // sienna — distinct from navy/gold/sage, evokes earth/rural
};

export const F = {
  display: "'Instrument Serif', Georgia, serif",
  body: "'DM Sans', -apple-system, sans-serif",
};

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #FAF7F2; overscroll-behavior-y: none; }
  body { background: #FAF7F2; margin: 0; min-height: 100vh; min-height: 100dvh; overscroll-behavior-y: none; }
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
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: #0F2530; z-index: 150; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom, 0px); }
  .sidebar-overlay { display: none; }
  .mobile-bar { display: none; }
  .mobile-bar-inner { padding: 0 20px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
  .hamburger { background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; }

  .nav-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px; border: none; border-radius: 8px; background: transparent; color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-align: left; margin-bottom: 2px; }
  .nav-btn:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
  .nav-btn-active { background: rgba(255,255,255,0.08) !important; color: #fff !important; }

  .content-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }

  .tab-btn { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 20px; border-radius: 8px; border: 1px solid #F0EBE3; background: #fff; color: #6F6860; cursor: pointer; transition: all 0.15s; }
  .tab-btn:hover { border-color: #1B3A4B; color: #1B3A4B; }
  .tab-btn-active { background: #1B3A4B !important; color: #fff !important; border-color: #1B3A4B !important; }

  .process-grid { display: flex; gap: 24px; flex-wrap: wrap; }
  .process-steps { flex: 0 0 280px; display: flex; flex-direction: column; gap: 4px; min-width: 240px; }
  .process-step { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border: none; border-radius: 10px; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #6B6358; cursor: pointer; text-align: left; transition: all 0.15s; }
  .process-step:hover { background: rgba(255,255,255,0.6); }
  .process-step-active { background: #fff !important; color: #2C2825 !important; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
  .process-num { font-family: 'Instrument Serif', serif; font-size: 20px; color: #6F6860; min-width: 28px; line-height: 1.3; }
  .process-num-active { color: #B8860B !important; }
  .process-detail { flex: 1; background: #fff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.04); min-width: 300px; }

  .costs-cat-head { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border: none; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #1B3A4B; cursor: pointer; transition: all 0.15s; border-radius: 12px; }
  .costs-cat-head:hover { background: #FAF7F2; }
  .costs-cat-head-active { background: #1B3A4B !important; color: #fff !important; border-radius: 12px 12px 0 0; }

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
    html, body { background: #0F2530 !important; }
    body { overflow-x: hidden; overscroll-behavior: none; -webkit-overflow-scrolling: touch; }
    section[id], [id^="costs-cat-"], #costs-trid { scroll-margin-top: calc(64px + env(safe-area-inset-top, 0px)); }
    .sidebar { transform: translateZ(0); padding-top: calc(56px + env(safe-area-inset-top, 0px)); padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); z-index: 100; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; top: 0; left: 0; width: 280px; height: 100vh; height: 100dvh; bottom: auto; }
    .sidebar::before { content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0F2530; z-index: -1; }
    .sidebar-open { transform: none; }
    .sidebar-dragging { transition: none !important; }
    .sidebar-overlay { display: none; }
    .sidebar-overlay-visible { display: none; }
    .mobile-bar { display: block !important; position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: #0F2530; border-bottom: 1px solid rgba(255,255,255,0.06); padding-top: env(safe-area-inset-top, 0px); transition: transform 0.3s ease; will-change: transform; }
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
    .main-content { margin-left: 0 !important; --side-offset: 0px; padding-top: calc(56px + env(safe-area-inset-top, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px); transition: transform 0.3s ease, border-radius 0.3s ease; position: relative; z-index: 130; background: #FAF7F2; min-height: 100dvh; will-change: transform; touch-action: pan-y; }
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
`;
