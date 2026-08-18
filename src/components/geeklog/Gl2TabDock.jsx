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

// Geometry readout for diagnosing bottom-of-screen gaps on a real device, where
// there are no dev tools. Off unless the URL carries ?dockprobe=1, so it costs
// nothing in normal use. Reports which box stops short of the viewport bottom:
// if dockBottom equals innerHeight the bar is flush and any band is elsewhere; if
// scrollBottom is short, the column is not reaching the bottom.
function Probe({ scrollRef, dockRef }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const read = () => {
      const ih = Math.round(window.innerHeight);
      const vv = window.visualViewport ? Math.round(window.visualViewport.height) : 0;
      const de = Math.round(document.documentElement.clientHeight);
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;bottom:0;height:env(safe-area-inset-bottom,0px);";
      document.body.appendChild(probe);
      const inset = Math.round(probe.getBoundingClientRect().height);
      probe.remove();
      const dock = dockRef.current?.getBoundingClientRect();
      const scroll = scrollRef?.current?.getBoundingClientRect();
      const mainEl = document.querySelector("main")?.getBoundingClientRect();
      const col = scrollRef?.current?.parentElement?.getBoundingClientRect();
      const gap = (r) => (r ? Math.round(ih - r.bottom) : "-");
      setText([
        `innerH ${ih}  visualVP ${vv}  docEl ${de}`,
        `safeBottom ${inset}  standalone ${window.navigator.standalone === true ? "y" : "n"}`,
        `main   bottom ${mainEl ? Math.round(mainEl.bottom) : "-"}  gap ${gap(mainEl)}`,
        `column bottom ${col ? Math.round(col.bottom) : "-"}  gap ${gap(col)}`,
        `scroll bottom ${scroll ? Math.round(scroll.bottom) : "-"}  gap ${gap(scroll)}`,
        `dock   bottom ${dock ? Math.round(dock.bottom) : "-"}  gap ${gap(dock)}`,
      ].join("\n"));
    };
    read();
    const t = setInterval(read, 500);
    window.addEventListener("resize", read);
    return () => { clearInterval(t); window.removeEventListener("resize", read); };
  }, [scrollRef, dockRef]);

  return (
    <pre style={{
      // Sits mid-screen on purpose: the bottom-left corner is the exact area
      // being diagnosed and must stay unobstructed in a screenshot.
      position: "fixed", left: 6, top: "38%", zIndex: 9999, margin: 0,
      background: "rgba(0,0,0,0.82)", color: "#63E6A0", font: "11px/1.35 ui-monospace, monospace",
      padding: "6px 8px", borderRadius: 6, pointerEvents: "none", whiteSpace: "pre",
    }}>{text}</pre>
  );
}

export function Gl2TabDock({ scrollRef, resetKey, children }) {
  const isMobile = useIsMobile();
  const barRef = useRef(null);
  const dockRef = useRef(null);
  // TEMPORARY, and on unconditionally on purpose. It was behind ?dockprobe=1,
  // which is unusable: an installed PWA has no address bar to type it into.
  // Remove this and the Probe component as soon as the bottom band is diagnosed.
  const probeOn = true;
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
    // The clip box gets an explicit height once measured. Leaving it to size
    // itself from a transformed child left a stray band painted at the bottom of
    // the screen on iOS. No backdrop-filter either: the TabBar's own background
    // is already 92% opaque, so the blur bought nothing and was the other half of
    // that artifact.
    // Fixed to the VIEWPORT, exactly like the main site's MobileToolbar, not
    // absolute inside the column. The column is height:100% of a fixed <main>,
    // which on iOS standalone resolves to the small viewport and stops short of
    // the bottom safe-area inset. Anchoring the bar there left a dead strip of
    // roughly bar height below it. Centered and capped to the app column so it
    // still lines up on desktop.
    <>
    {probeOn && <Probe scrollRef={scrollRef} dockRef={dockRef} />}
    <div
      ref={dockRef}
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: APP_MAX, zIndex: 40,
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
    </>
  );
}
