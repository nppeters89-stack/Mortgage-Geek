// Authorized Geek Log dashboard. Owns the cross-component state
// (closings map, year stats, single shared toast) and composes the
// page header + DotGrid + DailyEntryForm + ClosingsInlineForm +
// ClosingsList. GeekLogPage stays a pure gate; this is everything
// that renders once you're past it.

import { useCallback, useEffect, useState } from "react";
import { P, F } from "../../theme";
import { fetchClosings, fetchYearStats } from "../../utils/geeklogApi";
import { DailyEntryForm } from "./DailyEntryForm";
import { DotGrid } from "./DotGrid";
import { ClosingsInlineForm } from "./ClosingsInlineForm";
import { ClosingsList } from "./ClosingsList";
import { SaveToast } from "./SaveToast";

const currentYear = () => new Date().getFullYear();

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
  const [yearStats, setYearStats] = useState(null);
  const [toast, setToast] = useState(null); // { id, message, variant }

  const showToast = useCallback((payload) => {
    setToast({ id: Date.now(), ...payload });
  }, []);

  const refreshClosings = useCallback(async () => {
    try {
      const [stats, closings] = await Promise.all([
        fetchYearStats(apiKey, currentYear()),
        fetchClosings(apiKey, currentYear()),
      ]);
      setYearStats(stats);
      setClosingsByDate(closings || {});
    } catch (err) {
      showToast({ message: `Refresh failed: ${err.message}`, variant: "error" });
    }
  }, [apiKey, showToast]);

  useEffect(() => {
    refreshClosings();
  }, [refreshClosings]);

  const closingsCount = yearStats?.closingsCount ?? 0;
  const goalTarget = yearStats?.goal?.target ?? 100;

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
          {/* Allow horizontal scroll on very narrow viewports so the
              386px grid stays at its canonical size — shrinking the
              dots on mobile would mean the dashboard preview no longer
              matches the G5 export. */}
          <div style={{ overflowX: "auto", maxWidth: "100%", padding: "4px 0" }}>
            <DotGrid filled={closingsCount} total={goalTarget > 0 ? goalTarget : 100} />
          </div>
        </div>

        <DailyEntryForm apiKey={apiKey} showToast={showToast} />

        <ClosingsInlineForm
          apiKey={apiKey}
          onClosingSaved={refreshClosings}
          showToast={showToast}
        />

        <ClosingsList
          apiKey={apiKey}
          closingsByDate={closingsByDate}
          onClosingDeleted={refreshClosings}
          showToast={showToast}
        />
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
