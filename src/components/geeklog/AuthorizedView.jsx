// Authorized Geek Log dashboard. Owns the cross-component state
// (closings map, year stats, single shared toast) and composes the
// page header + DotGrid + DailyEntryForm + ClosingsInlineForm +
// ClosingsList. GeekLogPage stays a pure gate; this is everything
// that renders once you're past it.

import { useCallback, useEffect, useMemo, useState } from "react";
import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { fetchAllEntries, fetchClosings, fetchYearStats } from "../../utils/geeklogApi";
import { buildSnapshotData } from "../../utils/snapshotData";
import { DailyEntryForm } from "./DailyEntryForm";
import { DotGrid } from "./DotGrid";
import { ClosingsInlineForm } from "./ClosingsInlineForm";
import { ClosingsList } from "./ClosingsList";
import { SaveToast } from "./SaveToast";
import { SnapshotCard } from "./SnapshotCard";
import { SnapshotExportButton } from "./SnapshotExportButton";
// Imported as a bundled asset so Vite emits a content-hashed URL
// (e.g. /assets/mortgage-geek-logo-a8c4f2.png). The service worker's
// fetch handler caches `/icon-512.png` specifically; hashed asset
// URLs flow through normally without SW interception, which is what
// the mobile PNG export needs.
import snapshotLogoUrl from "../../assets/mortgage-geek-logo.png";

const currentYear = () => new Date().getFullYear();

function todayChicagoISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function todayChicagoHuman() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export function AuthorizedView({ apiKey }) {
  const [closingsByDate, setClosingsByDate] = useState({});
  const [allEntries, setAllEntries] = useState({});
  const [yearStats, setYearStats] = useState(null);
  const [toast, setToast] = useState(null); // { id, message, variant }
  // Logo prefetched once as a data URL so the snapshot export bypasses
  // the service worker (which on iOS Safari can serve a response
  // html-to-image fails to embed via fetch + canvas). Non-blocking:
  // the dashboard renders immediately; the visible preview falls back
  // to the network image until this resolves; the export button's
  // cold-start guard prevents a logo-less PNG.
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  // Dashboard-only DotGrid scaling. Below 640px viewport, swap to a
  // 20/10 layout that totals ~280px wide and clears a 320px viewport
  // with padding. This is a CALL-SITE override only — DotGrid's
  // defaults stay at the snapshot card spec (26/14 → 386px) so G5
  // instantiates the canonical size with no props.
  const isNarrow = useIsMobile(640);
  const dotSize = isNarrow ? 20 : 26;
  const dotGap = isNarrow ? 10 : 14;
  // Preview scale: 0.4 on desktop (1080·0.4 = 432px), 0.28 on narrow
  // (1080·0.28 = 302px) so the preview fits inside a 375px viewport
  // with side padding.
  const previewScale = isNarrow ? 0.28 : 0.4;
  const previewSize = Math.round(1080 * previewScale);

  const showToast = useCallback((payload) => {
    setToast({ id: Date.now(), ...payload });
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [stats, closings, entries] = await Promise.all([
        fetchYearStats(apiKey, currentYear()),
        fetchClosings(apiKey, currentYear()),
        fetchAllEntries(apiKey, currentYear()),
      ]);
      setYearStats(stats);
      setClosingsByDate(closings || {});
      setAllEntries(entries || {});
    } catch (err) {
      showToast({ message: `Refresh failed: ${err.message}`, variant: "error" });
    }
  }, [apiKey, showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Non-blocking logo prefetch via canvas pre-rasterization. Loads
  // the bundled PNG into an <img>, draws it onto an offscreen
  // <canvas>, then re-encodes via canvas.toDataURL("image/png").
  //
  // Earlier attempts (FileReader from fetch / bundled-asset URL /
  // <img>→<div> background swap) all worked on desktop and all
  // failed on iOS Safari — the failure was in html-to-image's
  // <foreignObject> rendering of externally-decoded PNG payloads,
  // not in the URL or the element type. Canvas pre-rasterization
  // produces a fresh, browser-encoded PNG with no metadata chunks
  // and a known-good byte layout, which mobile WebKit's
  // SVG→canvas→PNG pipeline handles reliably.
  //
  // Rendered at the image's natural dimensions so CSS scaling to
  // the 96x96 display size doesn't lose detail.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      try {
        const w = img.naturalWidth || 512;
        const h = img.naturalHeight || 512;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2D context unavailable");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/png");
        if (!cancelled) setLogoDataUrl(dataUrl);
      } catch (err) {
        console.warn("[geeklog] logo canvas encode failed:", err);
      }
    };
    img.onerror = () => {
      console.warn("[geeklog] logo image load failed");
    };
    // Same-origin asset (bundled by Vite at /assets/...). No
    // crossOrigin attribute — same-origin images don't taint the
    // canvas and don't require CORS headers in the response.
    img.src = snapshotLogoUrl;
    return () => { cancelled = true; };
  }, []);

  const closingsCount = yearStats?.closingsCount ?? 0;
  const goalTarget = yearStats?.goal?.target ?? 100;

  const snapshotData = useMemo(
    () => buildSnapshotData({
      entriesByDate: allEntries,
      closingsByDate,
      yearStats,
      today: todayChicagoISO(),
    }),
    [allEntries, closingsByDate, yearStats],
  );

  return (
    <main style={{ minHeight: "100dvh", background: P.cream, color: P.text }}>
      {/* Page header — pinned to today's real-world date in Chicago.
          The DailyEntryForm's selectedDate is independent so Nick can
          scrub to any day without the header lying about "today". */}
      <header style={{
        background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`,
        color: P.cream,
        padding: "calc(32px + env(safe-area-inset-top, 0px)) 24px 32px",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: F.display,
            fontSize: 32,
            fontWeight: 400,
            margin: 0,
            color: P.cream,
            letterSpacing: 0.5,
          }}>
            Geek Log
          </h1>
          <p style={{
            fontFamily: F.body,
            fontSize: 13,
            color: P.cream,
            opacity: 0.7,
            margin: "6px 0 0",
            letterSpacing: 0.3,
          }}>
            {todayChicagoHuman()}
          </p>
        </div>
      </header>

      <div style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "32px 24px 96px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}>
        {/* Year progress — DotGrid in its own card. Uses the snapshot
            card's default dimensions (26px dot, 14px gap, 386px wide)
            so the dashboard preview matches the G5 export pixel-for-
            pixel. */}
        <div style={{
          background: P.white,
          border: `1px solid ${P.creamDark}`,
          borderRadius: 10,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{
              fontFamily: F.body,
              fontSize: 11,
              fontWeight: 700,
              color: P.warmGray,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              margin: 0,
            }}>
              Year Progress
            </h2>
            <p style={{
              fontFamily: F.display,
              fontSize: 28,
              fontWeight: 400,
              color: P.navyDark,
              margin: "4px 0 0",
              lineHeight: 1.2,
            }}>
              {closingsCount} of {goalTarget} customers home
            </p>
          </div>
          <DotGrid
            filled={closingsCount}
            total={goalTarget > 0 ? goalTarget : 100}
            dotSize={dotSize}
            gap={dotGap}
          />
        </div>

        <DailyEntryForm apiKey={apiKey} showToast={showToast} onEntrySaved={refreshAll} />

        <ClosingsInlineForm
          apiKey={apiKey}
          onClosingSaved={refreshAll}
          showToast={showToast}
        />

        <ClosingsList
          apiKey={apiKey}
          closingsByDate={closingsByDate}
          onClosingDeleted={refreshAll}
          showToast={showToast}
        />

        {/* Snapshot preview + download. The visible preview is a
            scaled (transform: scale) copy that fits the dashboard
            column; the export button keeps its own off-screen
            1080×1080 SnapshotCard for clean capture. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{
            fontFamily: F.body,
            fontSize: 11,
            fontWeight: 700,
            color: P.warmGray,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            margin: 0,
          }}>
            Today's Snapshot
          </h2>
          <div style={{
            width: previewSize,
            height: previewSize,
            overflow: "hidden",
            border: `1px solid ${P.creamDark}`,
            borderRadius: 8,
            background: P.cream,
            // Allow the preview to be a flex item that doesn't blow
            // out the column width; centered horizontally.
            alignSelf: "center",
            maxWidth: "100%",
          }}>
            <div style={{
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
              width: 1080,
              height: 1080,
            }}>
              <SnapshotCard data={snapshotData} logoDataUrl={logoDataUrl} />
            </div>
          </div>
          <SnapshotExportButton data={snapshotData} logoDataUrl={logoDataUrl} showToast={showToast} />
        </div>
      </div>

      {toast && (
        <SaveToast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </main>
  );
}
