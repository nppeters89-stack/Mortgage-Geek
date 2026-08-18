import { T } from "../gl2Tokens";

// A short confetti burst for an SOI promotion, ported from the cockpit preview.
// Pure DOM + the Web Animations API, no dependency. The pieces are appended to
// document.body (so they are never clipped by the app's overflow:hidden column)
// and remove themselves when their animation ends. Skipped under reduced motion.
const COLORS = [T.redLift, T.green, T.amber, T.cream, T.cold];

export function fireConfetti() {
  if (typeof document === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 44; i++) {
    const p = document.createElement("div");
    Object.assign(p.style, {
      position: "fixed", width: "9px", height: "9px", zIndex: 70, pointerEvents: "none",
      borderRadius: "2px", background: COLORS[i % COLORS.length],
      left: `${45 + Math.random() * 10}vw`, top: "-12px",
    });
    document.body.appendChild(p);
    const dx = (Math.random() - 0.5) * 60;
    const rot = Math.random() * 720 - 360;
    const dur = 900 + Math.random() * 700;
    p.animate(
      [
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${dx}vw, 105vh) rotate(${rot}deg)`, opacity: 0.9 },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" }
    );
    setTimeout(() => p.remove(), dur);
  }
}
