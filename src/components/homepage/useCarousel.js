import { useEffect, useRef, useState, useCallback } from "react";

// Carousel mechanics shared by the Learning Hub's two card rails (Your Toolkit
// and Guides). Extracted from GuidesCarousel so both behave identically:
// responsive per-view, autoplay that stops permanently on first interaction,
// wrap-around stepping, and the derived track geometry.
//
// Layout only lives here; each section owns its own markup and palette.
//
// Client-only: perView is measured after mount, so nothing touches window
// during the (Node) render pass and the prerendered HTML is the first slide.

export const CAROUSEL_GAP = 24;

// Thresholds are tuned to the Learning Hub's content column, not the raw
// viewport: the 280px sidebar keeps it at ~960-990px, so 3-up uses a 940 cutoff
// rather than 1000, which the column never clears.
function perViewFor(width) {
  return width < 640 ? 1 : width < 940 ? 2 : 3;
}

export function useCarousel({ count, autoplay = true, intervalMs = 5000 }) {
  const rootRef = useRef(null);
  const perViewRef = useRef(3);
  const timerRef = useRef(null);
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const [autoplayOn, setAutoplayOn] = useState(autoplay);

  const step = useCallback((delta) => {
    setIndex((prev) => {
      const max = Math.max(0, count - perViewRef.current);
      let idx = prev + delta;
      if (idx > max) idx = 0;
      if (idx < 0) idx = max;
      return idx;
    });
  }, [count]);

  const jump = useCallback((i) => {
    const max = Math.max(0, count - perViewRef.current);
    setIndex(Math.min(Math.max(0, i), max));
  }, [count]);

  const stopAutoplay = useCallback(() => {
    setAutoplayOn(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    const measure = () => {
      const w = rootRef.current?.clientWidth || window.innerWidth;
      const pv = perViewFor(w);
      if (pv !== perViewRef.current) { perViewRef.current = pv; setPerView(pv); setIndex(0); }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Advance on an interval. Skipped for reduced-motion users, cleared on unmount
  // and on any manual interaction.
  useEffect(() => {
    if (!autoplayOn) return undefined;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    timerRef.current = setInterval(() => step(1), intervalMs);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [autoplayOn, step, intervalMs]);

  const maxIndex = Math.max(0, count - perView);

  return {
    rootRef,
    index,
    perView,
    maxIndex,
    next: () => { stopAutoplay(); step(1); },
    prev: () => { stopAutoplay(); step(-1); },
    goTo: (i) => { stopAutoplay(); jump(i); },
    cardBasis: `calc((100% - ${CAROUSEL_GAP * (perView - 1)}px) / ${perView})`,
    trackTransform: `translateX(calc(-${index * (100 / perView)}% - ${index * (CAROUSEL_GAP / perView)}px))`,
    dots: Array.from({ length: maxIndex + 1 }, (_, i) => i),
  };
}
