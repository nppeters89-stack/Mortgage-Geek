import { useState, useEffect } from "react";

// Media query hook — returns true when viewport is ≤820px (matches the
// mobile breakpoint used throughout the CSS). Used to swap layouts between
// side-by-side (desktop) and accordion (mobile) without DOM gymnastics.
export function useIsMobile(breakpoint = 820) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
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
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    const mqStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = window.navigator.standalone === true;
    return mqStandalone || iosStandalone;
  });
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = (e) => setIsStandalone(e.matches || window.navigator.standalone === true);
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
