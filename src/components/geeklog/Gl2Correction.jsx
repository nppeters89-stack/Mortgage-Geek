import { useState, useEffect, useCallback } from "react";
import { T, FF, APP_MAX } from "./gl2Tokens";
import { Wordmark, Eyebrow, Card } from "./Gl2Primitives";
import { CONV_SUBS, APPT_SUBS, CONTENT_SUBS, EVENTS_SUBS, emptyDay, normalizeDay } from "./gl2Model";
import { centralDateKey, addDays, monthDay, TRACKING_EPOCH } from "./gl2Week";
import { fetchWeek, saveDayCorrection } from "../../utils/geeklogApi";

// Geek Log 2.0 correction form: the deliberately out-of-the-way escape hatch for
// backdated edits, opened from Settings. Pick an earlier day this year, set its
// real counts, and save. The server accepts these writes only for in-year dates
// from the tracking epoch through today (never the future), so this cannot
// rewrite arbitrary history and the ordinary tap flow stays locked to the
// current week. No em-dashes.

const GROUPS = [
  { title: "Conversations", subs: CONV_SUBS },
  { title: "Appointments", subs: APPT_SUBS },
  { title: "Content", subs: CONTENT_SUBS },
  { title: "Events", subs: EVENTS_SUBS },
];

const clamp = (n) => Math.max(0, Math.min(999, n));

function StepRow({ label, value, onChange, disabled }) {
  const btn = (off) => ({
    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
    background: "transparent", boxShadow: `inset 0 0 0 1px ${T.line}`,
    color: off ? T.faint : T.cream, cursor: off ? "default" : "pointer",
    fontFamily: FF.body, fontSize: 22, fontWeight: 600, lineHeight: 1, padding: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 46 }}>
      <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 14.5, color: T.dim }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" aria-label={`Decrease ${label}`} disabled={disabled || value <= 0} onClick={() => onChange(clamp(value - 1))} style={btn(disabled || value <= 0)}>−</button>
        <input
          type="text" inputMode="numeric" pattern="[0-9]*" disabled={disabled} value={String(value)}
          onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); onChange(clamp(raw === "" ? 0 : parseInt(raw, 10))); }}
          style={{ width: 54, height: 40, textAlign: "center", fontFamily: FF.body, fontWeight: 700, fontSize: 18, color: value > 0 ? T.greenBright : T.dim, background: T.bg1, border: "none", boxShadow: `inset 0 0 0 1px ${T.line}`, borderRadius: 10, outline: "none", fontVariantNumeric: "tabular-nums" }}
        />
        <button type="button" aria-label={`Increase ${label}`} disabled={disabled} onClick={() => onChange(clamp(value + 1))} style={btn(disabled)}>+</button>
      </div>
    </div>
  );
}

export function CorrectionPanel({ apiKey, onClose, onSaved }) {
  const today = centralDateKey();
  const [date, setDate] = useState(() => {
    const y = addDays(today, -1);
    return y >= TRACKING_EPOCH ? y : today;
  });
  const [day, setDay] = useState(null);       // null = loading
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { ok, msg }

  // Load the chosen day's current counters whenever the date changes, so a save
  // preserves untouched counters (the form shows real current values, not zeros).
  useEffect(() => {
    let cancelled = false;
    setDay(null);
    setStatus(null);
    fetchWeek(apiKey, date)
      .then((res) => {
        if (cancelled) return;
        const d = (res?.days || []).find((x) => x.date === date);
        setDay(normalizeDay(d || {}));
      })
      .catch(() => { if (!cancelled) setDay(emptyDay()); });
    return () => { cancelled = true; };
  }, [apiKey, date]);

  const setCounter = (key, val) => setDay((d) => ({ ...(d || emptyDay()), [key]: val }));

  const save = useCallback(() => {
    if (!day || saving) return;
    setSaving(true);
    setStatus(null);
    saveDayCorrection(apiKey, { date, ...day })
      .then((doc) => {
        setStatus({ ok: true, msg: `Saved ${monthDay(date)}.` });
        onSaved && onSaved({ date, ...(doc || day) });
      })
      .catch((e) => setStatus({ ok: false, msg: e?.message || "Could not save. Try again." }))
      .finally(() => setSaving(false));
  }, [apiKey, date, day, saving, onSaved]);

  const canSave = day !== null && !saving;

  return (
    // Fixed and column-centered (the column flows with the document now; see
    // SettingsPanel). Layers above Settings (50).
    <div style={{ position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: APP_MAX, zIndex: 55, background: `linear-gradient(180deg, ${T.bg0} 0%, ${T.bg1} 78%)`, display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top, 0px)", overflowY: "auto" }}>
      <div style={{ flex: "0 0 auto", padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div onClick={onClose} role="button" aria-label="Back to settings" style={{ width: 34, height: 34, borderRadius: 10, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `inset 0 0 0 1px ${T.line}` }}>
            <div style={{ width: 8, height: 8, borderLeft: `1.6px solid ${T.dim}`, borderBottom: `1.6px solid ${T.dim}`, transform: "rotate(45deg)", marginLeft: -2 }} />
          </div>
          <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: T.cream }}>Correct a past day</div>
        </div>
        <Wordmark height={24} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ padding: "12px 14px", borderRadius: 13, background: "rgba(255,254,251,0.035)", boxShadow: `inset 0 0 0 1px ${T.line}` }}>
          <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 12, color: T.dim, lineHeight: 1.5 }}>Set the real counts for an earlier day this year. Everyday logging still happens on the Today screen. This is only for fixing or backfilling the past.</div>
        </div>

        <Card pad={15}>
          <Eyebrow size={10.5} style={{ marginBottom: 10 }}>Day to correct</Eyebrow>
          <input
            type="date" value={date} min={TRACKING_EPOCH} max={today}
            onChange={(e) => { if (e.target.value) setDate(e.target.value); }}
            style={{ width: "100%", height: 46, fontFamily: FF.body, fontSize: 15, fontWeight: 600, color: T.cream, background: T.bg1, border: "none", boxShadow: `inset 0 0 0 1px ${T.line}`, borderRadius: 12, outline: "none", padding: "0 14px", colorScheme: "dark", WebkitAppearance: "none", boxSizing: "border-box" }}
          />
        </Card>

        {day === null ? (
          <div style={{ fontFamily: FF.body, fontSize: 12.5, color: T.dimmer, padding: "20px 0", textAlign: "center" }}>Loading that day.</div>
        ) : (
          GROUPS.map((g) => (
            <Card key={g.title} pad={15}>
              <Eyebrow size={10.5} style={{ marginBottom: 6 }}>{g.title}</Eyebrow>
              {g.subs.map((s) => (
                <StepRow key={s.key} label={s.label} value={day[s.key] || 0} disabled={saving} onChange={(v) => setCounter(s.key, v)} />
              ))}
            </Card>
          ))
        )}

        {status && (
          <div style={{ fontFamily: FF.body, fontSize: 12.5, fontWeight: 600, color: status.ok ? T.greenBright : T.redLift, textAlign: "center", lineHeight: 1.5 }}>{status.msg}</div>
        )}

        <div
          onClick={canSave ? save : undefined} role="button" aria-label="Save correction"
          style={{ marginTop: 2, height: 54, borderRadius: 14, cursor: canSave ? "pointer" : "default", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", background: T.cream, color: T.bg1, opacity: canSave ? 1 : 0.6 }}
        >
          <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 15.5 }}>{saving ? "Saving" : `Save ${monthDay(date)}`}</div>
        </div>
      </div>
    </div>
  );
}
