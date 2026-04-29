// src/components/calculator/CockpitShell.jsx
//
// Desktop-only frame: 340px sticky inputs rail on the left, flex canvas on
// the right. Mobile/tablet renders nothing — `CalculatorPage` only mounts
// this when `useIsCockpit()` returns true.
//
// This is layout primitive only — it doesn't know anything about
// calculator state. The page passes pre-rendered `rail` and `canvas`
// elements as children, and Cockpit positions them.
//
// Engineering standards: named export only, P from theme for the divider
// color, no other theme dependencies.
//
// Note on root element: this component is intentionally a `<div>`, not a
// `<main>`. CalculatorPage.jsx already renders an outer `<main>` — only
// one `<main>` per document is the spec. The inner `aside` and inner
// `section` (formerly `<main>`) become semantic landmarks for the rail
// and canvas.

import React from 'react';
import { P } from '../../theme';

const RAIL_WIDTH = 340;
const COCKPIT_GAP = 32;

/**
 * Props
 *  - rail:   ReactNode — the inputs column (sticky)
 *  - canvas: ReactNode — the right-side stack (rate strip + cards + detail panel + insight)
 */
export function CockpitShell({ rail, canvas }) {
  return (
    <div
      className="calc-cockpit-shell"
      style={{
        display: 'flex',
        gap: COCKPIT_GAP,
        maxWidth: 1320,
        margin: '0 auto',
        padding: '24px 24px 64px',
        alignItems: 'flex-start',
      }}
    >
      <aside
        className="calc-cockpit-rail"
        aria-label="Loan inputs"
        style={{
          width: RAIL_WIDTH,
          flexShrink: 0,
          // sticky requires alignSelf: flex-start within a flex parent.
          // Without it the aside stretches to canvas height and "sticky"
          // has nothing to stick within.
          alignSelf: 'flex-start',
          position: 'sticky',
          top: 0,
          maxHeight: '100vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          paddingTop: 16,
          paddingBottom: 24,
          // Subtle right-side rule to separate the rail from the canvas.
          // Implemented as a border so it scrolls with the page bg.
          borderRight: `1px solid ${P.creamDark}`,
          paddingRight: COCKPIT_GAP / 2,
        }}
      >
        {rail}
      </aside>

      <section
        className="calc-cockpit-canvas"
        aria-label="Loan results"
        style={{
          flex: 1,
          minWidth: 0, // critical: lets the flex child shrink below content's intrinsic width
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          paddingTop: 16,
        }}
      >
        {canvas}
      </section>
    </div>
  );
}
