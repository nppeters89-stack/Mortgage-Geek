// Hybrid type-or-tap integer input. Used for the four daily-entry
// metrics (applications / prospecting / appointments / content).
// Number display uses Instrument Serif to echo the snapshot card
// aesthetic that lands in G5.

import { useId } from "react";
import { P, F } from "../../theme";

export function NumberStepperInput({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  disabled = false,
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const atMin = value <= min;
  const atMax = value >= max;

  const clamp = (n) => Math.max(min, Math.min(max, n));

  const handleType = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") {
      onChange(0);
      return;
    }
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) onChange(clamp(n));
  };

  const handleBlur = (e) => {
    if (e.target.value === "") onChange(0);
  };

  const dec = () => onChange(clamp(value - 1));
  const inc = () => onChange(clamp(value + 1));

  const stepperBtnStyle = (off) => ({
    width: 44,
    height: 44,
    borderRadius: 8,
    background: P.cream,
    border: `1px solid ${P.creamDark}`,
    color: off ? P.warmGrayLight : P.navy,
    cursor: off ? "not-allowed" : "pointer",
    fontFamily: F.body,
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1,
    flexShrink: 0,
    padding: 0,
  });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: 16,
      background: P.white,
      border: `1px solid ${P.creamDark}`,
      borderRadius: 10,
    }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: F.body,
          fontSize: 11,
          fontWeight: 700,
          color: P.warmGray,
          textTransform: "uppercase",
          letterSpacing: 1.5,
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={dec}
          disabled={disabled || atMin}
          aria-label={`Decrease ${label.toLowerCase()}`}
          style={stepperBtnStyle(disabled || atMin)}
        >
          −
        </button>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={String(value)}
          onChange={handleType}
          onBlur={handleBlur}
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            fontFamily: F.display,
            fontSize: 28,
            fontWeight: 400,
            color: P.navyDark,
            background: P.cream,
            border: `1px solid ${P.creamDark}`,
            borderRadius: 8,
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            outline: "none",
            opacity: disabled ? 0.6 : 1,
            padding: "0 8px",
          }}
        />
        <button
          type="button"
          onClick={inc}
          disabled={disabled || atMax}
          aria-label={`Increase ${label.toLowerCase()}`}
          style={stepperBtnStyle(disabled || atMax)}
        >
          +
        </button>
      </div>
    </div>
  );
}
