import { useRef, useState } from "react";
import { P } from "../../theme";

// Click-to-play with a cover frame taken from the video itself (no separate
// poster file). The <video> loads metadata only (preload="metadata") and seeks
// to the requested frame for the cover:
//   coverFrame "first" -> the opening frame
//   coverFrame "last"  -> the closing frame (seek to ~duration)
// On click it restarts from 0, unmutes, and plays with controls (user-initiated).
//
// Note: iOS Safari may not paint a <video> frame until interaction; there the
// cover falls back to a black panel with the play button until tapped. Desktop
// and Android render the seeked frame.
export function LazyVideo({ videoUrl, aspect = "1 / 1", label = "video", coverFrame = "first" }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);

  const onLoadedMetadata = (e) => {
    if (playing) return;
    const v = e.currentTarget;
    try {
      if (coverFrame === "last" && Number.isFinite(v.duration) && v.duration > 0) {
        v.currentTime = Math.max(0, v.duration - 0.05);
      } else {
        v.currentTime = 0.05;
      }
    } catch { /* seeking unsupported; first frame stays */ }
  };

  const start = () => {
    const v = ref.current;
    setPlaying(true);
    if (v) {
      v.muted = false;
      try { v.currentTime = 0; } catch { /* noop */ }
      const p = v.play && v.play();
      if (p && p.catch) p.catch(() => {});
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: aspect, borderRadius: 12, overflow: "hidden", background: "#000" }}>
      <video
        ref={ref}
        src={videoUrl}
        muted
        playsInline
        preload="metadata"
        controls={playing}
        onLoadedMetadata={onLoadedMetadata}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#000" }}
      />
      {!playing && (
        <button
          type="button"
          onClick={start}
          aria-label={`Play video: ${label}`}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", padding: 0, margin: 0, cursor: "pointer",
            background: "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.22) 100%)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 66, height: 66, borderRadius: "50%", background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 18px rgba(0,0,0,0.35)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={P.gold} style={{ marginLeft: 4 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
