import { useState, useEffect, useRef } from "react";
import { T, APP_MAX } from "./gl2Tokens";
import { useIsMobile } from "../../utils/hooks";

// Auto-hiding dock for the Geek Log TabBar — a MobileToolbar clone, listening to
// WINDOW scroll, because the Geek Log shell now scrolls the document exactly like
// the main site's pages do.
//
// That structural match is the fix for the iOS-standalone dead band at the bottom
// of the screen. The old shell was position:fixed with an inner scrolling div, so
// the document itself could never scroll; iOS standalone can cold-launch with a
// stale, letterboxed viewport, and on a page with zero document scroll range
// WebKit never corrects it, leaving a permanent unpainted strip below the layout
// viewport. (The probe run confirmed every box in the page ended flush at
// innerHeight while the screen showed a band below — the shortfall was between
// the layout viewport and the physical screen, which no fixed-shell element can
// reach.) A body-scrolling document both triggers the viewport correction and
// paints flowing content plus the root canvas across the whole webview, which is
// why the main site never shows the band.
//
// Behavior, per earlier direction: starts VISIBLE (including at the top of a
// tab), hides as you scroll down, reveals on a downswipe at 2x rate, and stays
// out of the way near the bottom of a list. Desktop never auto-hides: the TabBar
// is the app's only navigation.
const NEAR_BOTTOM = 150;
const ZONE_SHARE = 0.25;
const SCROLLABLE_MIN = 40;

// Pinned shown at the very top: the app opens there and the tabs should be
// waiting. This also covers iOS rubber-band overscroll, whose spring back to the
// top otherwise reads as a downward delta and hides the bar while the user is
// sitting at the top of a tab.
const TOP_PIN = 2;

// Upward movement reveals at twice the rate it hides — the bar is what the
// downswipe is reaching for.
const REVEAL_GAIN = 2;

export function Gl2TabDock({ resetKey, maxWidth = APP_MAX, children }) {
  const isMobile = useIsMobile();
  const barRef = useRef(null);
  const [barH, setBarH] = useState(0);
  const [offset, setOffset] = useState(0);
  const offRef = useRef(0);
  const lastY = useRef(0);

  // Measure the bar rather than hardcoding a height: it grows with the
  // safe-area inset, which differs per device (and changes if iOS corrects the
  // viewport after launch — the ResizeObserver picks that up).
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setBarH(el.offsetHeight || 0);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const apply = (next) => {
      offRef.current = next;
      setOffset(next);
    };

    if (!isMobile || !barH) {
      apply(0);
      return;
    }

    // Starts shown; a tab opens where the tabs should be visible.
    lastY.current = window.scrollY;
    apply(0);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

        // A page too short to scroll can never reveal the bar again — keep it.
        // And at (or bounced past) the very top, the bar is always shown.
        if (range <= SCROLLABLE_MIN || y <= TOP_PIN) {
          lastY.current = y;
          apply(0);
          ticking = false;
          return;
        }

        // The near-bottom zone is capped to a share of the actual scrollable
        // distance: the main site's flat 150px assumes a long page and would
        // swallow a short tab's whole range.
        const botZone = Math.min(NEAR_BOTTOM, range * ZONE_SHARE);
        const rawDelta = y - lastY.current;
        const delta = rawDelta < 0 ? rawDelta * REVEAL_GAIN : rawDelta;
        const next = y >= range - botZone
          ? barH
          : Math.max(0, Math.min(barH, offRef.current + delta));

        lastY.current = y;
        apply(next);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, barH, resetKey]);

  const hidden = barH > 0 && offset >= barH;

  return (
    // Fixed to the viewport exactly like the main site's MobileToolbar, centered
    // and capped to the app column so it lines up on desktop. The clip box has
    // no height of its own — it wraps the bar, so the bar's bottom edge IS the
    // viewport bottom.
    <div
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth, zIndex: 40,
        overflow: "hidden",
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <div
        ref={barRef}
        style={{
          transform: `translateY(${offset}px)`,
          willChange: "transform",
          borderTop: `1px solid ${T.line}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
