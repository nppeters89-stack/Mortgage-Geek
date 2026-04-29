import { useState, useEffect, useId } from "react";
import { P, F } from "../theme";

export function RateInput({ label, rate, setRate, color, marketRate }) {
  const fmtRate = (r) => Number(r).toFixed(3);
  const [localVal, setLocalVal] = useState(fmtRate(rate));
  const [focused, setFocused] = useState(false);
  const inputId = useId();
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

  // Slider window — fixed ±2.5% around the auto-populated market rate.
  // Manual entry can still go anywhere in [0, 15]; if `rate` falls outside
  // the slider window the thumb pins to the nearest edge but the input
  // continues to display the actual value.
  const hasMarket = typeof marketRate === "number" && marketRate > 0;
  const sliderMin = hasMarket ? Math.max(0, marketRate - 2.5) : 0;
  const sliderMax = hasMarket ? Math.min(15, marketRate + 2.5) : 15;
  const sliderValue = Math.max(sliderMin, Math.min(sliderMax, rate));
  const handleSlider = (e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setRate(v);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 14px", borderRadius: 8, background: P.cream, border: `1px solid ${P.creamDark}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: color, flex: 1 }}>{label}</label>
        <input
          id={inputId}
          type="number" inputMode="decimal" value={localVal} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
          step={0.125}
          style={{ border: "none", background: "transparent", fontSize: 16, fontFamily: F.body, fontWeight: 700, color: P.text, outline: "none", textAlign: "right", width: 64 }}
        />
        <span style={{ fontSize: 14, fontWeight: 600, color: P.warmGray }}>%</span>
      </div>
      {hasMarket && (
        <input
          type="range"
          aria-label={`${label} rate slider`}
          min={sliderMin}
          max={sliderMax}
          step={0.125}
          value={sliderValue}
          onChange={handleSlider}
          style={{ width: "100%", accentColor: color, margin: 0 }}
        />
      )}
    </div>
  );
}
