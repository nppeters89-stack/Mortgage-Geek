import { useState, useEffect } from "react";
import { P, F } from "../theme";

export function CalcInput({ label, value, onChange, prefix, suffix, step = 1, min = 0, max = 99999999, comma }) {
  const isEmpty = value === "" || value === null || value === undefined;
  const fmtComma = (v) => (v === "" || v === null || v === undefined) ? "" : comma ? Number(v).toLocaleString("en-US") : String(v);
  const [localVal, setLocalVal] = useState(fmtComma(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setLocalVal(fmtComma(value)); }, [value, focused]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setLocalVal(raw);
    if (raw === "") { onChange(0); return; }
    const cleaned = comma ? raw.replace(/,/g, "") : raw;
    const v = parseFloat(cleaned);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  };

  const handleFocus = () => {
    setFocused(true);
    setLocalVal(isEmpty ? "" : String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    if (localVal === "" && isEmpty) { setLocalVal(""); return; }
    const cleaned = comma ? localVal.replace(/,/g, "") : localVal;
    const v = parseFloat(cleaned);
    if (isNaN(v) || v < min) { onChange(min); setLocalVal(fmtComma(min)); }
    else if (v > max) { onChange(max); setLocalVal(fmtComma(max)); }
    else { onChange(v); setLocalVal(fmtComma(v)); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: P.warmGrayLight }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${P.creamDark}`, borderRadius: 8, overflow: "hidden", background: P.cream }}>
        {prefix && <span style={{ padding: "9px 0 9px 12px", fontSize: 14, fontWeight: 600, color: P.warmGray }}>{prefix}</span>}
        <input type={comma ? "text" : "number"} inputMode="decimal" value={localVal} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} step={step}
          style={{ flex: 1, border: "none", background: "transparent", padding: "9px 12px", fontSize: 15, fontFamily: F.body, fontWeight: 600, color: P.text, outline: "none", width: "100%" }} />
        {suffix && <span style={{ padding: "9px 12px 9px 0", fontSize: 14, fontWeight: 600, color: P.warmGray }}>{suffix}</span>}
      </div>
    </div>
  );
}
