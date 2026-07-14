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
import { GeekLogCobrand } from "./GeekLogCobrand";

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
  // Dashboard-only DotGrid scaling. Below 640px viewport, swap to a
  // 20/10 layout that totals ~280px wide and clears a 320px viewport
  // with padding. This is a CALL-SITE override only — DotGrid's
  // defaults stay at the snapshot card spec (26/14 → 386px) so G5
  // instantiates the canonical size with no props.
  const isNarrow = useIsMobile(640);
  const dotSize = isNarrow ? 20 : 26;
  const dotGap = isNarrow ? 10 : 14;
  // 4:5 portrait preview scale. Pick values that fit comfortably
  // alongside the other dashboard cards.
  //   Desktop (>= 640px): scale 0.32 → 346w × 432h
  //   Narrow  (<  640px): scale 0.22 → 238w × 297h (fits 327px content
  //                       inside a 375px viewport with 24px padding)
  const previewScale = isNarrow ? 0.22 : 0.32;
  const previewWidth = Math.round(1080 * previewScale);
  const previewHeight = Math.round(1350 * previewScale);

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
          <div style={{ display: "flex" }}>
            <GeekLogCobrand markH={30} />
          </div>
          <p style={{
            fontFamily: F.body,
            fontSize: 13,
            color: P.cream,
            opacity: 0.7,
            margin: "14px 0 0",
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
            width: previewWidth,
            height: previewHeight,
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
              height: 1350,
            }}>
              <SnapshotCard data={snapshotData} />
            </div>
          </div>
          <SnapshotExportButton data={snapshotData} showToast={showToast} />
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
