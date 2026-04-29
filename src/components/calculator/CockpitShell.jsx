// src/components/calculator/CockpitShell.jsx
//
// Desktop-only frame: 340px sticky inputs rail on the left, flex canvas on
// the right. Mobile/tablet renders nothing — `CalculatorPage` only mounts
// this when `useIsCockpit()` returns true.
//
// The rail content is wrapped in an auto-scaling container that measures
// its natural height and applies a `transform: scale(N)` so the entire rail
// fits in the viewport without ever scrolling. Scale is capped at 1, so
// short rails render at design size; tall ones shrink proportionally.
//
// Engineering standards: named export only, P from theme for the divider
// color, no other theme dependencies.

import React, { useRef, useState, useLayoutEffect } from 'react';
import { P } from '../../theme';

const RAIL_WIDTH = 340;
const COCKPIT_GAP = 32;
// Top + bottom safety so the scaled rail never butts up against the very
// edge of the viewport. ~16px above + 16px below.
const VIEWPORT_SAFETY = 32;

/**
 * Props
 *  - rail:   ReactNode — the inputs column (sticky)
 *  - canvas: ReactNode — the right-side stack (rate strip + cards + detail panel + insight)
 */
export function CockpitShell({ rail, canvas }) {
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Compute scale on mount, on rail content size changes, and on viewport
  // resize. We deliberately do NOT recompute on scroll — we use
  // `window.innerHeight` (not the aside's current top offset) so the scale
  // stays stable while the user scrolls. The sticky aside fits within the
  // viewport regardless of where the page is scrolled to.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const compute = () => {
      const naturalHeight = content.scrollHeight;
      if (naturalHeight <= 0) return;
      const available = window.innerHeight - VIEWPORT_SAFETY;
      const next = Math.min(1, available / naturalHeight);
      // Guard against degenerate values during teardown / hidden tabs.
      if (Number.isFinite(next) && next > 0) setScale(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(content);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

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
          alignSelf: 'flex-start',
          position: 'sticky',
          top: 0,
          // Cap the aside at the viewport so that when content is scaled
          // down, the empty layout tail (transforms don't change layout
          // size) is clipped. overflow:hidden takes care of the bottom
          // tail visually.
          maxHeight: '100vh',
          overflow: 'hidden',
          paddingTop: 16,
          paddingBottom: 16,
          borderRight: `1px solid ${P.creamDark}`,
          paddingRight: COCKPIT_GAP / 2,
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: RAIL_WIDTH,
            transform: `scale(${scale})`,
            // Top-center origin keeps the content anchored to the top of
            // the rail and horizontally centered in its column when scaled
            // below 1, so empty space splits evenly between the left edge
            // and the right border.
            transformOrigin: 'top center',
            transition: 'transform 0.18s ease-out',
          }}
        >
          {rail}
        </div>
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
