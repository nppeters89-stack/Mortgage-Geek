import { useState, useEffect, useRef } from "react";
import { T, APP_MAX } from "./gl2Tokens";
import { useIsMobile } from "../../utils/hooks";

// Auto-hiding dock for the Geek Log TabBar, ported from the main site's
// MobileToolbar so the two PWAs feel the same: content runs to the bottom of the
// screen, and a downswipe brings the navigation back.
//
// Same methodology as MobileToolbar. The bar is translated down by `offset`
// (barH = fully hidden, 0 = fully shown), driven by a rAF-throttled scroll
// listener that accumulates the scroll delta: scrolling down pushes it away,
// scrolling up (the downswipe) pulls it back. It ignores pointer events while
// hidden so taps fall through to the content underneath.
//
// Three deliberate differences from the main site:
//
//   1. The main site scrolls the window. Geek Log is a fixed app shell with an
//      inner scrolling div, so the listener attaches to that element and reads
//      scrollTop/scrollHeight/clientHeight instead of the window equivalents.
//   2. MobileToolbar renders nothing on desktop, because the main site still has
//      its own nav there. The TabBar IS Geek Log's only navigation, so on desktop
//      it stays exactly as it was: a static flex child, always visible.
//   3. No hiding at the top of a tab, and the near-bottom threshold scales with
//      the scrollable distance. See the constants below.
//
// The main site force-hides the toolbar near the top of a page. Geek Log does
// NOT: the top of a tab is where the tabs are most useful, so the bar stays put
// there and only the scroll gesture moves it.
//
// The near-bottom rule is kept, so the end of a list is never covered. Its
// threshold is capped to a share of the actual scrollable distance: the main
// site's flat 150px assumes a long marketing page, and on a tab that only
// scrolls a couple hundred pixels it would swallow the whole range.
const NEAR_BOTTOM = 150;
const ZONE_SHARE = 0.25;

// Upward movement reveals at twice the rate it hides. The bar is what you are
// reaching for when you swipe down, so it should not take a full bar-height of
// travel to arrive.
const REVEAL_GAIN = 2;

export function Gl2TabDock({ scrollRef, resetKey, children }) {
  const isMobile = useIsMobile();
  const barRef = useRef(null);
  const [barH, setBarH] = useState(0);
  const [offset, setOffset] = useState(0);
  const offRef = useRef(0);
  const lastY = useRef(0);

  // Measure the bar rather than hardcoding a height: the TabBar grows with the
  // safe-area inset, which differs per device. Re-runs on isMobile because the
  // two branches below render different nodes, and the ref would otherwise stay
  // pointed at the unmounted one.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setBarH(el.offsetHeight || 0);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!isMobile || !el || !barH) {
      offRef.current = 0;
      setOffset(0);
      return;
    }

    const apply = (next) => {
      offRef.current = next;
      setOffset(next);
    };

    // Always starts shown. A tab opens at the top, and that is precisely where
    // the tabs should be visible.
    const settle = () => {
      lastY.current = el.scrollTop;
      apply(0);
    };
    settle();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = el.scrollTop;
        const range = Math.max(1, el.scrollHeight - el.clientHeight);
        const botZone = Math.min(NEAR_BOTTOM, range * ZONE_SHARE);

        const rawDelta = y - lastY.current;
        const delta = rawDelta < 0 ? rawDelta * REVEAL_GAIN : rawDelta;
        const nearBottom = y >= range - botZone;
        const next = nearBottom
          ? barH
          : Math.max(0, Math.min(barH, offRef.current + delta));

        lastY.current = y;
        apply(next);
        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile, barH, scrollRef, resetKey]);

  // Desktop keeps the original static layout: a flex child that occupies space.
  if (!isMobile) return <div ref={barRef}>{children}</div>;

  const hidden = barH > 0 && offset >= barH;

  return (
    // Fixed to the viewport like MobileToolbar, centered and capped to the app
    // column so it still lines up on desktop.
    //
    // The clip box deliberately has NO height: it wraps the bar, so the bar's
    // bottom edge is the box's bottom edge is the viewport bottom. An earlier
    // version pinned the height to the measured barH, which left the bar sitting
    // at the top of a slightly-too-tall box with transparent space beneath it.
    // Content showed through that space and read as a dead bar across the bottom
    // of every tab. barH is still measured, but only to know how far to translate.
    <div
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: APP_MAX, zIndex: 40,
        // No explicit height. The clip box wraps the bar, so the bar's bottom IS
        // the box's bottom is the viewport bottom, with no dependence on barH
        // being measured exactly right. Pinning the height and letting the bar sit
        // at the top of it is what left a strip of transparent space underneath,
        // showing content through and reading as a dead bar at the bottom.
        // barH is still used, but only as the distance to translate.
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
