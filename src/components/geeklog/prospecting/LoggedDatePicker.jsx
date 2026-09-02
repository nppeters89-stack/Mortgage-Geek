import { useState } from "react";
import { T, FF } from "../gl2Tokens";

// "Logged on" date for the touch composers: defaults to today, allows any past
// date so a touch that happened off-app lands on its real day and the due
// clocks and urgency gradient read from the actual date.

// Local calendar day as YYYY-MM-DD (the value shape input[type=date] speaks).
export const todayLocalISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Timestamp for a chosen logged-on day: now when it is today (keeps the exact
// moment), noon local for a past day so the touch sits safely inside that
// calendar day in every derivation regardless of timezone math.
export function tsForLoggedDate(dateStr) {
  if (!dateStr || dateStr === todayLocalISO()) return Date.now();
  const t = new Date(`${dateStr}T12:00:00`).getTime();
  return Number.isFinite(t) ? Math.min(t, Date.now()) : Date.now();
}

export function LoggedDatePicker({ value, onChange }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FF.body, fontSize: 11.5, color: T.dim }}>
      Logged on
      <input type="date" value={value} max={todayLocalISO()}
        onChange={(e) => onChange(e.target.value || todayLocalISO())}
        style={{ background: T.bg0, color: value === todayLocalISO() ? T.dim : T.cream, border: `1px solid ${T.line}`, borderRadius: 8, padding: "5px 8px", fontFamily: FF.body, fontSize: 12.5, colorScheme: "dark" }} />
    </label>
  );
}

// Confirm dialog for the one-tap reply bubbles: today pre-filled, click the
// date to backdate, one tap to log. The detail composer's own button already
// rides its Logged on picker; this brings the same ability to the card and
// row bubbles without giving up the quick path.
export function ReplyDateDialog({ name, onSave, onClose }) {
  const [loggedOn, setLoggedOn] = useState(() => todayLocalISO());
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 14, padding: "16px 18px", fontFamily: FF.body }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.greenBright }}>They replied</div>
        <div style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: T.cream }}>{name}</div>
        <div style={{ marginTop: 12 }}><LoggedDatePicker value={loggedOn} onChange={setLoggedOn} /></div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${T.line}`, background: "none", color: T.dim, fontFamily: FF.body, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={() => { onSave(tsForLoggedDate(loggedOn)); onClose(); }}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            Log reply
          </button>
        </div>
      </div>
    </div>
  );
}
