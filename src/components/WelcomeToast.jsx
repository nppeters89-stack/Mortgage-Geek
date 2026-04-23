import { useState, useEffect } from "react";
import { P, F } from "../theme";
import { useIsStandalone } from "../utils/hooks";

// One-time welcome toast shown to newly-installed PWA users on their first
// launch from the home screen. Uses a localStorage flag to ensure it only
// appears once per installation. Auto-dismisses after 6 seconds; also
// dismissible via the × button for users who tap it quickly.
export function WelcomeToast() {
  const isStandalone = useIsStandalone();
  const STORAGE_KEY = "mg_welcomed_pwa";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isStandalone) return;
    let welcomed = false;
    try { welcomed = localStorage.getItem(STORAGE_KEY) === "1"; } catch {}
    if (welcomed) return;
    // Small delay so it doesn't flash the moment the app opens — feels more intentional
    const showTimer = setTimeout(() => setVisible(true), 600);
    const hideTimer = setTimeout(() => setVisible(false), 6600);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [isStandalone]);

  if (!visible) return null;
  return (
    <div role="status" style={{
      position: "fixed", left: 16, right: 16, bottom: `calc(20px + env(safe-area-inset-bottom, 0px))`,
      maxWidth: 480, margin: "0 auto", zIndex: 300,
      background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`,
      color: "#fff", borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 12px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
      border: `1px solid ${P.gold}40`,
      animation: "mg-toast-in 0.4s ease-out",
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>🎉</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontFamily: F.display, fontSize: 15, color: P.goldLight, display: "block", lineHeight: 1.2 }}>You're installed!</strong>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>The Mortgage Geek is now on your home screen. Welcome.</span>
      </div>
      <button onClick={() => setVisible(false)} aria-label="Dismiss" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  );
}
