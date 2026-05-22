// One sparkbar cell at CD's L-scale (the locked baseline for the
// portrait V3+YTD card). Reused 4× inside SnapshotCard. Pure
// presentational — all date awareness (dayOfYear, dayLetters) is
// computed by SnapshotCard and passed in as props.
//
// Anatomy (top → bottom), per CD's locked spec:
//   1. Today value (84px Instrument Serif)
//   2. Sparkbar row (120px tall, 7 bars × 18px, 11px gap)
//   3. Day letters row (11px DM Sans; today's letter — last index —
//      gets the darker treatment per CD's source)
//   4. Label (13px DM Sans uppercase)
//   5. YTD line (12px DM Sans uppercase; " YTD" suffix at 0.7 opacity)
//
// No weekly (WK) line — CD intentionally dropped it. The sparkbar
// conveys the week visually; the numeric was information redundancy.

import { P, F } from "../../theme";

const BAR_WIDTH = 18;
const BAR_GAP = 11;
const SPARKBAR_HEIGHT = 120;
const CELL_PADDING = "16px 14px";
const CELL_GAP = 12;

export function Sparkbar({ value, ytd, weekBars, label, dayOfYear, dayLetters }) {
  // Bar heights are computed relative to the week's max. min 2px for
  // any non-zero day so a low bar still has presence.
  const maxBar = Math.max(...weekBars, 1);
  // Pre-year ticks fill the leading `7 - dayOfYear` slots when the
  // snapshot's date falls in the first six days of the year.
  const preYearCount = dayOfYear < 7 ? 7 - dayOfYear : 0;

  const todayColor = value === 0 ? P.warmGrayLight : P.navyDark;
  const lastIndex = weekBars.length - 1;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: CELL_GAP,
      padding: CELL_PADDING,
      boxSizing: "border-box",
    }}>
      {/* Today value */}
      <div style={{
        fontFamily: F.display,
        fontSize: 84,
        lineHeight: 1,
        color: todayColor,
        fontWeight: 400,
        fontVariantNumeric: "lining-nums tabular-nums",
      }}>
        {value}
      </div>

      {/* Sparkbar row */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: BAR_GAP,
        height: SPARKBAR_HEIGHT,
        marginTop: 8,
      }}>
        {weekBars.map((v, i) => {
          const isToday = i === lastIndex;
          const isPreYear = i < preYearCount && !isToday;
          // Pre-year tick: dashed baseline at the bottom of the slot.
          if (isPreYear) {
            return (
              <div
                key={i}
                style={{
                  width: BAR_WIDTH,
                  height: SPARKBAR_HEIGHT,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
                aria-hidden="true"
              >
                <div style={{
                  width: BAR_WIDTH,
                  height: 0,
                  borderBottom: `1.5px dashed ${P.warmGrayLight}`,
                  opacity: 0.6,
                }} />
              </div>
            );
          }
          // Zero non-today: fixed 2px tick in creamDark @ 55%.
          if (!isToday && v === 0) {
            return (
              <div
                key={i}
                style={{
                  width: BAR_WIDTH,
                  height: 2,
                  background: P.creamDark,
                  opacity: 0.55,
                  alignSelf: "flex-end",
                }}
                aria-hidden="true"
              />
            );
          }
          const computed = (v / maxBar) * SPARKBAR_HEIGHT;
          const h = Math.max(2, Math.round(computed));
          return (
            <div
              key={i}
              style={{
                width: BAR_WIDTH,
                height: h,
                background: isToday ? P.gold : P.navy,
                boxShadow: isToday ? `inset 0 0 0 1px ${P.goldMuted}` : "none",
                alignSelf: "flex-end",
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Day letters row — same 18/11 grid as the bars above. Today
          (last index) gets warmGray + weight 600 per CD's source. */}
      <div style={{
        display: "flex",
        gap: BAR_GAP,
        marginTop: 4,
      }}>
        {dayLetters.map((letter, i) => {
          const isLast = i === lastIndex;
          return (
            <span
              key={i}
              style={{
                display: "inline-flex",
                width: BAR_WIDTH,
                justifyContent: "center",
                fontFamily: F.body,
                fontSize: 11,
                letterSpacing: "0.08em",
                fontWeight: isLast ? 600 : 500,
                color: isLast ? P.warmGray : P.warmGrayLight,
                textTransform: "uppercase",
              }}
              aria-hidden="true"
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Label */}
      <div style={{
        fontFamily: F.body,
        fontSize: 13,
        letterSpacing: "0.22em",
        fontWeight: 500,
        color: P.warmGray,
        textTransform: "uppercase",
        marginTop: 12,
      }}>
        {label}
      </div>

      {/* YTD line — " YTD" portion at 0.7 opacity per CD's spec. */}
      <div style={{
        fontFamily: F.body,
        fontSize: 12,
        letterSpacing: "0.18em",
        fontWeight: 500,
        color: P.warmGrayLight,
        textTransform: "uppercase",
        fontVariantNumeric: "tabular-nums",
        marginTop: 6,
      }}>
        <span>{ytd.toLocaleString()}</span>
        <span style={{ opacity: 0.7 }}> YTD</span>
      </div>
    </div>
  );
}
