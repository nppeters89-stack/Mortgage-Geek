import { useState } from "react";
import { P, F } from "../../theme";

// Poster + play-button facade. The <video> element is not mounted until the
// user clicks, so nothing downloads on page load (preload="none" + lazy mount).
// No autoplay with sound on load — playback only starts on the user's click.
// Approved clips are square (1080x1080); default aspect is 1:1.
export function LazyVideo({ videoUrl, poster, label = "video", aspect = "1 / 1" }) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(videoUrl);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: aspect, borderRadius: 12, overflow: "hidden", background: P.navyDark }}>
      {playing && hasVideo ? (
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
          onClick={() => hasVideo && setPlaying(true)}
          aria-label={hasVideo ? `Play video: ${label}` : `Video coming soon: ${label}`}
          aria-disabled={!hasVideo}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", padding: 0, margin: 0,
            background: P.navyDark,
            cursor: hasVideo ? "pointer" : "default",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {poster && (
            <img src={poster} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          {/* Play glyph in a translucent disc (decorative; the button has the label). */}
          <span
            aria-hidden="true"
            style={{
              position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 64, height: 64, borderRadius: "50%",
              background: hasVideo ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.18)",
              boxShadow: hasVideo ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={hasVideo ? P.gold : "rgba(255,255,255,0.5)"} style={{ marginLeft: 3 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {!hasVideo && (
            <span style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", fontFamily: F.body, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: "rgba(255,255,255,0.6)" }}>
              Video coming soon
            </span>
          )}
        </button>
      )}
    </div>
  );
}
