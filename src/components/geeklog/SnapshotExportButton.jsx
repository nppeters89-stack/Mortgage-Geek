// Download-PNG button + html-to-image plumbing. Renders an extra
// off-screen 1080×1080 SnapshotCard whose ref is the capture target,
// so the visible preview can scale freely without affecting export
// quality. Font embedding goes through getFontEmbedCSS() per the May
// 20 spike validation.

import { useRef, useState } from "react";
import { toPng, getFontEmbedCSS } from "html-to-image";
import { P, F } from "../../theme";
import { SnapshotCard } from "./SnapshotCard";

export function SnapshotExportButton({ data, showToast }) {
  const hiddenRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    const node = hiddenRef.current;
    if (!node) {
      showToast?.({ message: "Export node not ready", variant: "error" });
      return;
    }
    setIsExporting(true);
    try {
      // Wait for any pending layout, then for web fonts to be loaded —
      // otherwise the first export after a cold load can fall back to
      // system fonts.
      await new Promise((r) => requestAnimationFrame(() => r()));
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const fontEmbedCSS = await getFontEmbedCSS(node);
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: P.cream,
        fontEmbedCSS,
        width: 1080,
        height: 1080,
        canvasWidth: 1080,
        canvasHeight: 1080,
      });
      const link = document.createElement("a");
      link.download = `geeklog-${data.dateISO}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Snapshot export failed:", err);
      showToast?.({ message: `Export failed: ${err.message || err}`, variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        style={{
          fontFamily: F.body,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 0.3,
          padding: "14px 28px",
          minHeight: 48,
          background: isExporting ? P.warmGrayLight : P.navy,
          color: P.cream,
          border: "none",
          borderRadius: 8,
          cursor: isExporting ? "wait" : "pointer",
          transition: "background 0.15s ease",
          width: "100%",
        }}
      >
        {isExporting ? "Generating…" : "Download PNG"}
      </button>

      {/* Hidden full-size capture target. position:absolute + far
          off-screen so it's in the DOM (for html-to-image to read
          computed styles and serialize correctly) without ever being
          visible to the user. pointer-events:none avoids accidental
          interaction; aria-hidden keeps it out of the a11y tree. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -100000,
          top: 0,
          width: 1080,
          height: 1080,
          pointerEvents: "none",
        }}
      >
        <div ref={hiddenRef}>
          <SnapshotCard data={data} />
        </div>
      </div>
    </>
  );
}
