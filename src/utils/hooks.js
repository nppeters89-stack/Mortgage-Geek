import { useState, useEffect } from "react";

// Media query hook — returns true when viewport is ≤820px (matches the
// mobile breakpoint used throughout the CSS). Used to swap layouts between
// side-by-side (desktop) and accordion (mobile) without DOM gymnastics.
export function useIsMobile(breakpoint = 820) {
  // SSR-safe default (false); the real viewport value is read after mount so no
  // window access happens during the (Node) render pass. Breakpoint unchanged.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

// Detect whether the app is being viewed as an installed PWA (standalone mode).
// Checks both the W3C display-mode media query (Android/Desktop) and Apple's
// legacy navigator.standalone property (iOS Safari). Used to hide the
// "Install App" sidebar entry when the user is already in the installed app.
export function useIsStandalone() {
  // SSR-safe default (false); the real standalone check runs after mount.
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const compute = () => mq.matches || window.navigator.standalone === true;
    const handler = () => setIsStandalone(compute());
    setIsStandalone(compute());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isStandalone;
}

// Calculator cockpit gate — true at ≥1100px viewports. Used by CalculatorPage
// to swap between the legacy stacked layout (mobile/tablet) and the cockpit
// rail+canvas layout (desktop). Below 1100px the rail+canvas split squeezes
// the canvas to ~760px and the compact-cards row breaks, so the cockpit is
// strictly desktop-only.
export function useIsCockpit() {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    const update = () => setIs(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return is;
}

// Pie chart sizing — 280px at desktop-wide (≥1280px), 240px in the mid
// cockpit range (1100–1279px), 200px below (when DetailPanel renders on
// tablet, though the cockpit currently mounts only at ≥1100px). Returning a
// number lets the caller pass it as the chart's `diameter` prop without
// needing its own media-query hook.
export function usePieDiameter() {
  const [d, setD] = useState(240);
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1280px)');
    const cockpit = window.matchMedia('(min-width: 1100px)');
    const update = () => {
      if (wide.matches) setD(280);
      else if (cockpit.matches) setD(240);
      else setD(200);
    };
    update();
    wide.addEventListener('change', update);
    cockpit.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      cockpit.removeEventListener('change', update);
    };
  }, []);
  return d;
}

// Geek Charts draw-animation gate — true when the click-to-draw sequence
// should be skipped and the charts should render fully drawn on load.
//
// Only prefers-reduced-motion opts out. A 4-second self-drawing line is
// exactly the motion that setting asks us not to run, and it is a deliberate
// user choice rather than an assumption about their device.
//
// Screen size deliberately does NOT gate this. An earlier version skipped the
// animation at ≤700px on the theory that an empty-until-tapped chart reads as
// broken on a phone, but the charts ship with a labelled draw button, so
// there is always something visible telling you what to tap. Phones get the
// animation.
//
// Starts true so the server render and the first client paint agree on the
// fully-drawn markup, then re-evaluates on mount. Getting this backwards
// would hydrate a prerendered page into an empty chart.
export function useStaticCharts() {
  const [staticCharts, setStaticCharts] = useState(true);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setStaticCharts(reduced.matches);
    update();
    reduced.addEventListener('change', update);
    return () => reduced.removeEventListener('change', update);
  }, []);
  return staticCharts;
}

// True when the device has a real hovering pointer (a mouse or trackpad).
// Used only to word the chart hints correctly: "hover" is meaningless on a
// touchscreen, where the same read-out is driven by dragging a finger.
export function useHasHover() {
  const [hasHover, setHasHover] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    const update = () => setHasHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return hasHover;
}
