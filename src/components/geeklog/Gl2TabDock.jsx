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
// The main site's fixed thresholds (100px from the top, 150px from the bottom)
// assume a long marketing page. Geek Log tabs scroll a few hundred pixels, where
// those two zones overlap and cover the entire range, leaving no band in which
// the bar can ever be revealed. So they are capped to a share of the actual
// scrollable distance, which keeps the same feel on long content and still
// leaves a working middle band on short content.
const NEAR_TOP = 100;
const NEAR_BOTTOM = 150;
const ZONE_SHARE = 0.25;
const SCROLLABLE_MIN = 40;

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
        const range = Math.max(1, el.scrollHeight - el.clientHeight);
        const topZone = Math.min(NEAR_TOP, range * ZONE_SHARE);
        const botZone = Math.min(NEAR_BOTTOM, range * ZONE_SHARE);

        const rawDelta = y - lastY.current;
        const delta = rawDelta < 0 ? rawDelta * REVEAL_GAIN : rawDelta;
        const nearBottom = y >= range - botZone;
        const next = y < topZone || nearBottom
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
    // The clip box gets an explicit height once measured. Leaving it to size
    // itself from a transformed child left a stray band painted at the bottom of
    // the screen on iOS. No backdrop-filter either: the TabBar's own background
    // is already 92% opaque, so the blur bought nothing and was the other half of
    // that artifact.
    <div
      style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40,
        height: barH || undefined,
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
