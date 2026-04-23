import { useState, useEffect } from "react";
import { P, F } from "../theme";

export function RateInput({ label, rate, setRate, color }) {
  const fmtRate = (r) => Number(r).toFixed(3);
  const [localVal, setLocalVal] = useState(fmtRate(rate));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setLocalVal(fmtRate(rate)); }, [rate, focused]);
  const handleChange = (e) => {
    setLocalVal(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 15) setRate(v);
  };
  const handleFocus = () => { setFocused(true); };
  const handleBlur = () => {
    setFocused(false);
    const v = parseFloat(localVal);
    if (isNaN(v) || v < 0) { setRate(0); setLocalVal(fmtRate(0)); }
    else if (v > 15) { setRate(15); setLocalVal(fmtRate(15)); }
    else { setRate(v); setLocalVal(fmtRate(v)); }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: P.cream, border: `1px solid ${P.creamDark}` }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: color, flex: 1 }}>{label}</span>
      <input
        type="number" inputMode="decimal" value={localVal} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
        step={0.125}
        style={{ border: "none", background: "transparent", fontSize: 16, fontFamily: F.body, fontWeight: 700, color: P.text, outline: "none", textAlign: "right", width: 64 }}
      />
      <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray }}>%</span>
    </div>
  );
}
