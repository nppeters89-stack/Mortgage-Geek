// Fixed-position confirmation toast. Stateless from the parent's
// perspective: parent renders <SaveToast key={someUniqueId} ... /> to
// fire one, and listens to onDismiss to clear its own state. Internal
// visible state drives a 200ms opacity transition so the toast doesn't
// pop in or vanish abruptly.

import { useEffect, useState } from "react";
import { P, F } from "../../theme";

const VISIBLE_MS = 2800;
const FADE_MS = 200;

export function SaveToast({ message, variant = "success", onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const startFadeOut = setTimeout(() => setVisible(false), VISIBLE_MS);
    const finalDismiss = setTimeout(onDismiss, VISIBLE_MS + FADE_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(startFadeOut);
      clearTimeout(finalDismiss);
    };
  }, [onDismiss]);

  const isSuccess = variant === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        background: isSuccess ? P.navy : P.warmGray,
        color: P.cream,
        borderLeft: isSuccess ? `3px solid ${P.gold}` : "none",
        padding: "16px 24px",
        borderRadius: 8,
        fontFamily: F.body,
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: 0.2,
        maxWidth: "calc(100vw - 32px)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}
