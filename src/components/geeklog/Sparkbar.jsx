// One sparkbar cell. Reused 4x inside SnapshotCard. Pure
// presentational — all date awareness (dayOfYear, dayLetters,
// sundayIndex) is computed by SnapshotCard and passed in as props.
//
// Anatomy (top → bottom), per CD's V3+YTD spec:
//   1. Today value (60px Instrument Serif)
//   2. Sparkbar row (84px tall, 7 bars × 14px, 8px gap)
//   3. Day letters row (9px DM Sans)
//   4. Label (11px DM Sans uppercase)
//   5. YTD line (10px DM Sans uppercase, " YTD" portion at 0.7 opacity)

import { P, F } from "../../theme";

const BAR_WIDTH = 14;
const BAR_GAP = 8;
const SPARKBAR_HEIGHT = 84;

export function Sparkbar({
  value,
  ytd,
  weekBars,
  label,
  dayOfYear,
  dayLetters,
  sundayIndex,
}) {
  // Bar heights are computed relative to the week's max. min 2px for
  // any non-zero day so a 1/22 bar still has some presence.
  const maxBar = Math.max(...weekBars, 1);
  // Pre-year ticks fill the leading `7 - dayOfYear` slots when the
  // snapshot's date falls in the first six days of the year.
  const preYearCount = dayOfYear < 7 ? 7 - dayOfYear : 0;

  const todayColor = value === 0 ? P.warmGrayLight : P.navyDark;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Today value */}
      <div style={{
        fontFamily: F.display,
        fontSize: 60,
        lineHeight: 1.0,
        color: todayColor,
        fontWeight: 400,
        fontVariantNumeric: "lining-nums tabular-nums",
      }}>
        {value}
      </div>

      {/* Sparkbar row */}
      <div style={{
        height: SPARKBAR_HEIGHT,
        display: "flex",
        alignItems: "flex-end",
        gap: BAR_GAP,
      }}>
        {weekBars.map((v, i) => {
          const isToday = i === weekBars.length - 1;
          const isPreYear = i < preYearCount && !isToday;
          // Pre-year tick: dashed baseline, sits at the bottom of the 84px slot.
          if (isPreYear) {
            return (
              <div
                key={i}
                style={{
                  width: BAR_WIDTH,
                  height: SPARKBAR_HEIGHT,
                  display: "flex",
                  alignItems: "flex-end",
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

          // Zero days that aren't today: fixed 2px tick in creamDark @ 55%.
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
          const isGoldToday = isToday;
          return (
            <div
              key={i}
              style={{
                width: BAR_WIDTH,
                height: h,
                background: isGoldToday ? P.gold : P.navy,
                boxShadow: isGoldToday ? `inset 0 0 0 1px ${P.goldMuted}` : "none",
                alignSelf: "flex-end",
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Day letters row — same 14/8 grid as the bars above */}
      <div style={{
        display: "flex",
        gap: BAR_GAP,
        marginTop: -8,
      }}>
        {dayLetters.map((letter, i) => {
          const isSun = i === sundayIndex;
          return (
            <span
              key={i}
              style={{
                display: "inline-flex",
                width: BAR_WIDTH,
                justifyContent: "center",
                fontFamily: F.body,
                fontSize: 9,
                letterSpacing: "0.08em",
                fontWeight: isSun ? 600 : 500,
                color: isSun ? P.warmGray : P.warmGrayLight,
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
        fontSize: 11,
        letterSpacing: "0.22em",
        fontWeight: 500,
        color: P.warmGray,
        textTransform: "uppercase",
      }}>
        {label}
      </div>

      {/* YTD line — " YTD" portion at 0.7 opacity per CD's spec */}
      <div style={{
        fontFamily: F.body,
        fontSize: 10,
        letterSpacing: "0.18em",
        fontWeight: 500,
        color: P.warmGrayLight,
        textTransform: "uppercase",
        fontVariantNumeric: "tabular-nums",
      }}>
        <span>{ytd.toLocaleString()}</span>
        <span style={{ opacity: 0.7 }}> YTD</span>
      </div>
    </div>
  );
}
