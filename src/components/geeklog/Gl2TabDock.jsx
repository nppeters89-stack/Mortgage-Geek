import { useState, useEffect, useRef } from "react";
import { T } from "./gl2Tokens";
import { useIsMobile } from "../../utils/hooks";

// Auto-hiding dock for the Geek Log TabBar, ported from the main site's
// MobileToolbar so the two PWAs feel the same: content runs to the bottom of the
// screen, and a downswipe brings the navigation back.
//
// Same methodology as MobileToolbar. The bar is translated down by `offset`
// (barH = fully hidden, 0 = fully shown), driven by a rAF-throttled scroll
// listener that accumulates the scroll delta: scrolling down pushes it away,
// scrolling up (the downswipe) pulls it back. Near the top and near the bottom it
// is forced hidden, and it ignores pointer events while hidden so taps fall
// through to the content underneath.
//
// Two deliberate differences from the main site, both forced by Geek Log's shell:
//
//   1. The main site scrolls the window. Geek Log is a fixed app shell with an
//      inner scrolling div, so the listener attaches to that element and reads
//      scrollTop/scrollHeight/clientHeight instead of the window equivalents.
//   2. MobileToolbar renders nothing on desktop, because the main site still has
//      its own nav there. The TabBar IS Geek Log's only navigation, so on desktop
//      it stays exactly as it was: a static flex child, always visible.
//
// It also stays visible when the content is too short to scroll, which the main
// site never needs (its pages are long and end in a footer). Without that, a
// short tab would hide the bar with no way to scroll it back.
const NEAR_TOP = 100;
const NEAR_BOTTOM = 150;
const SCROLLABLE_MIN = 40;

export function Gl2TabDock({ scrollRef, resetKey, children }) {
  const isMobile = useIsMobile();
  const barRef = useRef(null);
  const [barH, setBarH] = useState(0);
  const [offset, setOffset] = useState(0);
  const offRef = useRef(0);
  const lastY = useRef(0);

  // Measure the bar rather than hardcoding a height: the TabBar grows with the
  // safe-area inset, which differs per device.
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

    // A tab whose content does not scroll can never reveal the bar again, so it
    // starts shown there and hidden everywhere else (matching the main site,
    // which starts hidden at the top of a long page).
    const settle = () => {
      const scrollable = el.scrollHeight - el.clientHeight > SCROLLABLE_MIN;
      lastY.current = el.scrollTop;
      apply(scrollable ? barH : 0);
    };
    settle();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = el.scrollTop;
        const delta = y - lastY.current;
        const nearBottom = el.clientHeight + y >= el.scrollHeight - NEAR_BOTTOM;
        const next = y < NEAR_TOP || nearBottom
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
    <div
      style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40,
        overflow: "hidden",
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <div
        ref={barRef}
        style={{
          transform: `translateY(${offset}px)`,
          willChange: "transform",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: `1px solid ${T.line}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
