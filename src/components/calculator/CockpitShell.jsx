// src/components/calculator/CockpitShell.jsx
//
// Desktop-only frame: 340px scaling rail on the left (always fully visible,
// never scrolls) + flex canvas on the right (independently scrollable).
// Mobile/tablet renders nothing — `CalculatorPage` only mounts this when
// `useIsCockpit()` returns true.
//
// Layout model: the shell itself is `position: sticky; height: 100vh` so
// that once the user scrolls past the page header above it, it pins to
// the top of the viewport and fills the screen. Inside the shell the rail
// occupies its full height with overflow:hidden, while the canvas owns
// the page's vertical scroll via overflow-y:auto.
//
// The rail's content is wrapped in an auto-scaling div that measures the
// natural content height and applies `transform: scale(N)` so the entire
// rail is visible top-to-bottom regardless of viewport height. Scale caps
// at 1, so short rails render at design size; tall rails shrink.
//
// Engineering standards: named export only, P from theme for the divider
// color, no other theme dependencies.

import React, { useRef, useState, useLayoutEffect } from 'react';
import { P } from '../../theme';

const RAIL_WIDTH = 340;
const COCKPIT_GAP = 32;

/**
 * Props
 *  - rail:   ReactNode — the inputs column (fixed, scaled to fit)
 *  - canvas: ReactNode — the right-side stack (scrollable)
 */
export function CockpitShell({ rail, canvas }) {
  const contentRef = useRef(null);
  const asideRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Compute scale on mount, on rail content size changes, and on aside /
  // viewport resize. The rail's available height is the aside's computed
  // content area (clientHeight minus its top/bottom padding). The
  // canvas's scroll position has no effect on this calculation, so the
  // rail stays visually stable as the user scrolls the canvas.
  useLayoutEffect(() => {
    const content = contentRef.current;
    const aside = asideRef.current;
    if (!content || !aside) return;

    const compute = () => {
      const naturalHeight = content.scrollHeight;
      if (naturalHeight <= 0) return;
      const styles = window.getComputedStyle(aside);
      const padTop = parseFloat(styles.paddingTop) || 0;
      const padBot = parseFloat(styles.paddingBottom) || 0;
      // clientHeight includes padding; subtract to get content-area height.
      const available = aside.clientHeight - padTop - padBot;
      if (available <= 0) return;
      const next = Math.min(1, available / naturalHeight);
      if (Number.isFinite(next) && next > 0) setScale(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(content);
    ro.observe(aside);
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
        // Sticky + 100vh so the shell pins to the top of the viewport
        // once the page header above scrolls out, then fills the screen.
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        // Inner layout: rail + canvas, side by side.
        display: 'flex',
        gap: COCKPIT_GAP,
        maxWidth: 1320,
        margin: '0 auto',
        padding: '0 24px',
      }}
    >
      <aside
        ref={asideRef}
        className="calc-cockpit-rail"
        aria-label="Loan inputs"
        style={{
          width: RAIL_WIDTH,
          flexShrink: 0,
          // Fill the shell's full height; never scroll.
          height: '100%',
          overflow: 'hidden',
          paddingTop: 16,
          paddingBottom: 16,
          borderRight: `1px solid ${P.creamDark}`,
          paddingRight: COCKPIT_GAP / 2,
          boxSizing: 'border-box',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: RAIL_WIDTH,
            transform: `scale(${scale})`,
            // Top-center origin: content stays anchored at the top of the
            // rail and centered horizontally in its column when scaled
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
          // Canvas owns the cockpit's vertical scroll. Page scroll handles
          // the area above the cockpit (e.g. the calculator page header);
          // once the shell is pinned, further scrolling happens here.
          height: '100%',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          paddingTop: 24,
          paddingBottom: 48,
        }}
      >
        {canvas}
      </section>
    </div>
  );
}
