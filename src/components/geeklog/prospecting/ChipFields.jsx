import { T, FF } from "../gl2Tokens";
import { OBJECTIONS, LENDER_SITUATION, NEEDS } from "./chips";

// The structured block shared by the post-call log and the pipeline touch
// form: lender situation (single-select), needs (multi), the hook line, and
// objections for this call (multi, never prefilled). Chips wrap on narrow
// screens. Parents own the state and decide what writes where: contact fields
// persist only when changed, objections ride the call or touch record.

const rowLabel = { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim, fontFamily: FF.body };

function Chip({ on, label, onClick }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      style={{ border: `1px solid ${on ? T.greenWashLine : T.line}`, background: on ? T.greenWash : "none", color: on ? T.greenBright : T.dim, borderRadius: 999, padding: "6px 11px", fontFamily: FF.body, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
      {label}
    </button>
  );
}

export function ChipRow({ label, options, value, onChange, multi = false }) {
  const isOn = (id) => (multi ? (value || []).includes(id) : value === id);
  const toggle = (id) => {
    if (multi) {
      const cur = value || [];
      onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    } else {
      onChange(value === id ? "" : id);
    }
  };
  return (
    <div>
      <div style={rowLabel}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {options.map((o) => <Chip key={o.id} on={isOn(o.id)} label={o.label} onClick={() => toggle(o.id)} />)}
      </div>
    </div>
  );
}

export function ChipFields({ lender, setLender, needs, setNeeds, hook, setHook, objections, setObjections }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 14 }}>
      <ChipRow label="Lender situation" options={LENDER_SITUATION} value={lender} onChange={setLender} />
      <ChipRow label="Needs" options={NEEDS} value={needs} onChange={setNeeds} multi />
      <div>
        <div style={rowLabel}>Hook</div>
        <input type="text" value={hook} onChange={(e) => setHook(e.target.value.slice(0, 300))}
          placeholder="one line you can text them later"
          style={{ width: "100%", marginTop: 6, boxSizing: "border-box", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px", fontFamily: FF.body, fontSize: 14 }} />
      </div>
      <ChipRow label="Objections (this call)" options={OBJECTIONS} value={objections} onChange={setObjections} multi />
    </div>
  );
}
