import { useEffect, useRef } from "react";
import { P } from "../../theme";
import { withAlpha } from "../../utils/format";

// Ambient idle motion for the "6 steps to your keys" journey card. Shared by the
// desktop track (HeroJourneyTrack) and the mobile list (JourneyOverviewMobile)
// so the two layouts stay in step.
//
// This is a continuous loop, not an entrance animation: nothing here reveals or
// moves content, so layout, markup, color, and copy are untouched. The red is
// the existing accent token (P.gold, #CF3338) rather than a literal, which keeps
// it inside the palette and satisfies the no-hardcoded-hex rule.
//
// Every loop is disabled under prefers-reduced-motion, and the decorative
// traveler and shimmer are removed outright there rather than merely stopped.

export const JOURNEY_MOTION_CSS = `
  @keyframes mgRing {
    0%   { box-shadow: 0 0 0 0 ${withAlpha(P.gold, 0.5)}; }
    100% { box-shadow: 0 0 0 14px ${withAlpha(P.gold, 0)}; }
  }
  @keyframes mgHeartbeat {
    0%, 100% { transform: scale(1); }
    12% { transform: scale(1.07); }
    24% { transform: scale(1); }
    36% { transform: scale(1.05); }
    48% { transform: scale(1); }
  }
  @keyframes mgTravel {
    0%   { left: 7%;  opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { left: 88%; opacity: 0; }
  }
  @keyframes mgShimmer {
    0%   { transform: translateY(-130%) rotate(8deg); }
    100% { transform: translateY(320%) rotate(8deg); }
  }

  .mg-journey-ring { animation: mgRing 3s infinite; }
  .mg-journey-beat { animation: mgHeartbeat 3.2s 1s infinite; }
  .mg-journey-traveler { animation: mgTravel 4.5s linear infinite; }
  .mg-journey-shimmer { animation: mgShimmer 5s ease-in-out infinite; }

  .mg-journey-dot { transition: transform .2s; }
  .mg-journey-dot:hover { transform: scale(1.15); }

  /* Toggled by useIdleMotion when the card leaves the viewport. */
  .mg-journey-paused .mg-journey-ring,
  .mg-journey-paused .mg-journey-beat,
  .mg-journey-paused .mg-journey-traveler,
  .mg-journey-paused .mg-journey-shimmer { animation-play-state: paused; }

  @media (prefers-reduced-motion: reduce) {
    .mg-journey-ring,
    .mg-journey-beat { animation: none; }
    .mg-journey-traveler,
    .mg-journey-shimmer { animation: none; display: none; }
    .mg-journey-dot { transition: none; }
    .mg-journey-dot:hover { transform: none; }
  }
`;

// Pauses the loops while the card is off-screen. Returns a ref for the card
// root. SSR-safe: the observer is only wired after mount, and the paused class
// is additive, so the prerendered markup is unchanged.
export function useIdleMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      ([entry]) => { el.classList.toggle("mg-journey-paused", !entry.isIntersecting); },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// Staggered ring delay: 0.5s, then 0.6s apart per step.
export const ringDelay = (i) => `${0.5 + i * 0.6}s`;
