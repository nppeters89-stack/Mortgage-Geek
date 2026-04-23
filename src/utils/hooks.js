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
