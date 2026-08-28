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
