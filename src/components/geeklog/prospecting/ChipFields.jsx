import { useState, useRef, useEffect } from "react";
import { T, FF } from "../gl2Tokens";
import { OBJECTIONS, LENDER_SITUATION, NEEDS } from "./chips";

// The structured block shared by the post-call log and the pipeline touch
// form: lender situation (single-select), needs (multi) and objections for
// this call (multi, never prefilled). These read as dropdowns rather than a
// wall of chips, so the card stays quiet until Nick opens a field. Parents own
// the state and decide what writes where: contact fields persist only when
// changed, objections ride the call or touch record.
//
// ChipRow below is the original chip control, still used by the lead pipeline.

const rowLabel = { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim, fontFamily: FF.body };
const control = { width: "100%", boxSizing: "border-box", marginTop: 6, background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "11px 12px", fontFamily: FF.body, fontSize: 14.5, textAlign: "left" };

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

// Single-select: a native picker, so the phone gets its own wheel and the
// desktop gets the OS menu. Empty string is the unset state.
export function SelectRow({ label, options, value, onChange, placeholder = "Not set" }) {
  return (
    <div>
      <div style={rowLabel}>{label}</div>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{ ...control, color: value ? T.cream : T.dim, cursor: "pointer" }}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

// Multi-select: a collapsed summary row that opens a checkbox list. A native
// <select multiple> would need cmd-click on desktop and stays open on a phone,
// which is the busyness we are removing.
export function MultiSelectRow({ label, options, value, onChange, placeholder = "Nothing selected" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const selected = value || [];

  // Close on an outside click or Escape. Bound only while open.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const labelFor = (id) => (options.find((o) => o.id === id) || {}).label || id;
  const summary = selected.length === 0 ? placeholder
    : selected.length === 1 ? labelFor(selected[0])
      : `${labelFor(selected[0])}, +${selected.length - 1} more`;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={rowLabel}>{label}</div>
      <button type="button" onClick={() => setOpen((o) => !o)}
        aria-expanded={open} aria-haspopup="listbox" aria-label={label}
        style={{ ...control, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: selected.length ? T.cream : T.dim }}>
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summary}</span>
        <span aria-hidden="true" style={{ flex: "none", fontSize: 11, color: T.dim, transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {open && (
        <div role="listbox" aria-multiselectable="true"
          style={{ position: "absolute", zIndex: 20, left: 0, right: 0, marginTop: 4, background: T.bg0, border: `1px solid ${T.line}`, borderRadius: 10, padding: 4, boxShadow: "0 10px 24px rgba(0,0,0,0.4)" }}>
          {options.map((o) => {
            const on = selected.includes(o.id);
            return (
              <button key={o.id} type="button" role="option" aria-selected={on} onClick={() => toggle(o.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: on ? T.greenWash : "none", border: "none", borderRadius: 8, padding: "9px 10px", cursor: "pointer", fontFamily: FF.body, fontSize: 14, color: on ? T.greenBright : T.dim, textAlign: "left" }}>
                <span aria-hidden="true" style={{ flex: "none", width: 15, height: 15, borderRadius: 4, border: `1px solid ${on ? T.greenWashLine : T.line}`, background: on ? T.green : "transparent", color: T.bg1, fontSize: 11, fontWeight: 900, lineHeight: "13px", textAlign: "center" }}>{on ? "✓" : ""}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChipFields({ lender, setLender, needs, setNeeds, objections, setObjections }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 14 }}>
      <SelectRow label="Lender situation" options={LENDER_SITUATION} value={lender} onChange={setLender} />
      <MultiSelectRow label="Needs" options={NEEDS} value={needs} onChange={setNeeds} />
      <MultiSelectRow label="Objections (this call)" options={OBJECTIONS} value={objections} onChange={setObjections} />
    </div>
  );
}
