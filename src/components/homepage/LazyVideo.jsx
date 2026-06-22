import { useState } from "react";
import { P, F } from "../../theme";

// Click-to-play facade: no video bytes load before the click (the <video> is
// not mounted until then), and no poster-image file is needed — the facade is a
// colored panel matching the module surface, showing the module name + a play
// button. On click it swaps in a user-initiated <video> (sound OK).
//
// Facade panel colors by surface (the disc + label read against each).
const FACADE = {
  red:      { panel: `linear-gradient(135deg, ${P.goldMuted} 0%, ${P.gold} 100%)`, label: "#FFFFFF", tri: P.gold },
  charcoal: { panel: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navyLight} 100%)`, label: "rgba(255,255,255,0.92)", tri: P.gold },
  cream:    { panel: P.creamDark, label: P.navy, tri: P.gold },
};

export function LazyVideo({ videoUrl, aspect = "1 / 1", surface = "charcoal", label = "video" }) {
  const [playing, setPlaying] = useState(false);
  const f = FACADE[surface] || FACADE.charcoal;

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: aspect, borderRadius: 12, overflow: "hidden", background: "#000" }}>
      {playing ? (
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          preload="none"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#000" }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${label}`}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
            border: "none", padding: 24, margin: 0,
            background: f.panel,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 66, height: 66, borderRadius: "50%",
              background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 18px rgba(0,0,0,0.32)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={f.tri} style={{ marginLeft: 4 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span style={{ fontFamily: F.display, fontSize: 18, color: f.label, letterSpacing: 0.2, textAlign: "center", lineHeight: 1.2 }}>
            {label}
          </span>
        </button>
      )}
    </div>
  );
}
