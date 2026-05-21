// Daily entry form for the Geek Log. Composed of:
//   - native <input type="date"> picker
//   - four NumberStepperInputs (one per metric)
//   - 80-char headline textarea with live counter
//   - Save button
//
// On mount and on every selectedDate change, fetches the entry for
// that date and populates the form. Save POSTs to /api/geeklog/entry
// and updates lastSavedAt for the quiet "Last saved" line.
//
// Toast surfacing is owned by the parent (AuthorizedView). This
// component calls the passed-in showToast({message, variant}) for
// both success and error feedback so the page only renders one toast
// at a time.

import { useEffect, useId, useState } from "react";
import { P, F } from "../../theme";
import { fetchEntry, saveEntry } from "../../utils/geeklogApi";
import { NumberStepperInput } from "./NumberStepperInput";

const HEADLINE_MAX = 80;
const HEADLINE_WARN = 70;

// "YYYY-MM-DD" in America/Chicago for "today" — Nick's local calendar.
function todayChicagoISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// 1747776000000 → "14:32" (24-hour, Chicago)
function timeHHMM(ms) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

const EMPTY_METRICS = { applications: 0, prospecting: 0, appointments: 0, contentShipped: 0 };

export function DailyEntryForm({ apiKey, showToast, onEntrySaved }) {
  const [selectedDate, setSelectedDate] = useState(todayChicagoISO);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [headline, setHeadline] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const headlineId = useId();
  const dateId = useId();

  // Fetch the entry for selectedDate. Resets to zeros if no record exists.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchEntry(apiKey, selectedDate)
      .then((rec) => {
        if (cancelled) return;
        if (rec) {
          setMetrics({
            applications: rec.applications ?? 0,
            prospecting: rec.prospecting ?? 0,
            appointments: rec.appointments ?? 0,
            contentShipped: rec.contentShipped ?? 0,
          });
          setHeadline(rec.headline ?? "");
          setLastSavedAt(rec.updatedAt ?? null);
        } else {
          setMetrics(EMPTY_METRICS);
          setHeadline("");
          setLastSavedAt(null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        showToast?.({ message: `Load failed: ${err.message}`, variant: "error" });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [apiKey, selectedDate, showToast]);

  const setMetric = (field) => (n) => setMetrics((prev) => ({ ...prev, [field]: n }));

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const saved = await saveEntry(apiKey, {
        date: selectedDate,
        applications: metrics.applications,
        prospecting: metrics.prospecting,
        appointments: metrics.appointments,
        contentShipped: metrics.contentShipped,
        headline,
      });
      setLastSavedAt(saved.updatedAt ?? Date.now());
      showToast?.({ message: "Entry saved", variant: "success" });
      onEntrySaved?.();
    } catch (err) {
      showToast?.({ message: `Save failed: ${err.message}`, variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const formDisabled = isLoading || isSaving;
  const headlineLen = headline.length;
  const headlineColor =
    headlineLen >= HEADLINE_MAX ? P.warmGrayLight :
    headlineLen >= HEADLINE_WARN ? P.gold :
    P.warmGray;

  return (
    <section style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}>
      {/* Date picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          htmlFor={dateId}
          style={{
            fontFamily: F.body,
            fontSize: 11,
            fontWeight: 700,
            color: P.warmGray,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          Date
        </label>
        <input
          id={dateId}
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          disabled={formDisabled}
          style={{
            fontFamily: F.body,
            fontSize: 16,
            padding: "12px 14px",
            minHeight: 44,
            background: P.white,
            color: P.navyDark,
            border: `1px solid ${P.creamDark}`,
            borderRadius: 8,
            outline: "none",
          }}
        />
      </div>

      {/* Metrics — 2-col on desktop, 1-col on narrow */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 12,
      }}>
        <NumberStepperInput
          label="Applications"
          value={metrics.applications}
          onChange={setMetric("applications")}
          disabled={formDisabled}
        />
        <NumberStepperInput
          label="Prospecting"
          value={metrics.prospecting}
          onChange={setMetric("prospecting")}
          disabled={formDisabled}
        />
        <NumberStepperInput
          label="Appointments"
          value={metrics.appointments}
          onChange={setMetric("appointments")}
          disabled={formDisabled}
        />
        <NumberStepperInput
          label="Content"
          value={metrics.contentShipped}
          onChange={setMetric("contentShipped")}
          disabled={formDisabled}
        />
      </div>

      {/* Headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          htmlFor={headlineId}
          style={{
            fontFamily: F.body,
            fontSize: 11,
            fontWeight: 700,
            color: P.warmGray,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          Headline <span style={{ fontWeight: 400, color: P.warmGrayLight, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <textarea
          id={headlineId}
          value={headline}
          onChange={(e) => setHeadline(e.target.value.slice(0, HEADLINE_MAX))}
          disabled={formDisabled}
          rows={2}
          maxLength={HEADLINE_MAX}
          placeholder="Day 141. 23 families home, 77 to go."
          style={{
            fontFamily: F.body,
            fontSize: 15,
            lineHeight: 1.5,
            padding: "12px 14px",
            background: P.white,
            color: P.navyDark,
            border: `1px solid ${P.creamDark}`,
            borderRadius: 8,
            outline: "none",
            resize: "vertical",
            minHeight: 60,
          }}
        />
        <span style={{
          fontFamily: F.body,
          fontSize: 12,
          color: headlineColor,
          alignSelf: "flex-end",
          fontVariantNumeric: "tabular-nums",
        }}>
          {headlineLen} / {HEADLINE_MAX}
        </span>
      </div>

      {/* Save */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={formDisabled}
          style={{
            fontFamily: F.body,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 0.3,
            padding: "14px 28px",
            minHeight: 48,
            background: formDisabled ? P.warmGrayLight : P.navy,
            color: P.cream,
            border: "none",
            borderRadius: 8,
            cursor: formDisabled ? "not-allowed" : "pointer",
            transition: "background 0.15s ease",
          }}
        >
          {isSaving ? "Saving…" : "Save Entry"}
        </button>
        {lastSavedAt && (
          <span style={{
            fontFamily: F.body,
            fontSize: 12,
            color: P.warmGrayLight,
            textAlign: "center",
            letterSpacing: 0.3,
          }}>
            Last saved: {timeHHMM(lastSavedAt)}
          </span>
        )}
      </div>
    </section>
  );
}
