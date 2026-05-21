// The 1080×1080 snapshot card — exactly the dimensions html-to-image
// captures. Zone heights sum to 1080:
//   Header 132 + Hero 442 + TextBlock 162 + Metrics 280 + Footer 64
//
// All sizing/typography per CD's V3+YTD spec. No transform: scale()
// here — the preview wrapper in AuthorizedView handles its own
// scaling, the export pipeline captures this at native resolution.

import { P, F } from "../../theme";
import { DotGrid } from "./DotGrid";
import { Sparkbar } from "./Sparkbar";

// Map JS Date.getUTCDay() index (0=Sun) → single-letter label.
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// Build the 7 day-letter labels for the bars ending on `today`.
// Returns { letters, sundayIndex }. Index 6 corresponds to today.
function buildDayLetters(todayISO) {
  const [y, m, d] = todayISO.split("-").map(Number);
  const todayMs = Date.UTC(y, m - 1, d);
  const letters = [];
  let sundayIndex = -1;
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(todayMs - i * 86400000);
    const dow = dt.getUTCDay();
    if (dow === 0) sundayIndex = 6 - i;
    letters.push(DAY_LETTERS[dow]);
  }
  return { letters, sundayIndex };
}

// 3px circle separator used in the header DAY · DATE line and the
// footer credits. Same construction in both places.
function DotSeparator({ size = 3, mx = 12, color = P.warmGrayLight }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        margin: `0 ${mx}px`,
        verticalAlign: "middle",
      }}
    />
  );
}

export function SnapshotCard({ data, logoDataUrl = null }) {
  const { letters: dayLetters, sundayIndex } = buildDayLetters(data.dateISO);
  const goalTarget = data.goalTarget || 100;
  const headlineText = (data.headline || "").trim();
  // Prefer the pre-fetched data URL (already bypassed the service
  // worker → reliable in html-to-image's mobile capture). Fall back to
  // the original path for the visible preview during cold-start before
  // the prefetch resolves.
  const logoSrc = logoDataUrl || "/icon-512.png";

  return (
    <div style={{
      width: 1080,
      height: 1080,
      position: "relative",
      background: P.cream,
      color: P.text,
      overflow: "hidden",
      fontFamily: F.body,
    }}>
      {/* HEADER — 132px navy strip with logo + wordmark + DAY/DATE */}
      <div style={{
        height: 132,
        background: P.navy,
        borderBottom: `1px solid ${P.gold}`,
        padding: "0 64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Background-image on a div rather than an <img> — iOS
              Safari's <foreignObject> renderer drops nested HTML
              <img> elements during html-to-image capture. CSS
              backgrounds are serialized inline into the style
              attribute, which mobile WebKit handles reliably. */}
          <div
            role="img"
            aria-label="The Mortgage Geek"
            style={{
              width: 96,
              height: 96,
              flexShrink: 0,
              backgroundImage: `url(${logoSrc})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <span style={{
            fontFamily: F.display,
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: "0.14em",
            color: P.cream,
            lineHeight: 1,
          }}>
            GEEK&nbsp;LOG
          </span>
        </div>
        <span style={{
          fontFamily: F.body,
          fontSize: 13,
          letterSpacing: "0.22em",
          fontWeight: 500,
          textTransform: "uppercase",
          color: P.goldLight,
          display: "inline-flex",
          alignItems: "center",
        }}>
          Day {data.day}
          <DotSeparator color={P.goldLight} mx={10} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{data.dateISO}</span>
        </span>
      </div>

      {/* HERO — 442px, DotGrid only. Canonical defaults: 26/14 → 386x386 */}
      <div style={{
        height: 442,
        paddingTop: 56,
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}>
        <DotGrid filled={data.closings} total={goalTarget} />
      </div>

      {/* TEXTBLOCK — 162px. Italic headline (or gold diamond fallback) + caption */}
      <div style={{
        height: 162,
        padding: "48px 64px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}>
        {headlineText ? (
          <p style={{
            fontFamily: F.display,
            fontStyle: "italic",
            fontSize: 28,
            lineHeight: 1.15,
            letterSpacing: "0.005em",
            color: P.navy,
            margin: 0,
            whiteSpace: "nowrap",
          }}>
            {headlineText}
          </p>
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              background: P.gold,
              transform: "rotate(45deg)",
            }}
          />
        )}
        <p style={{
          fontFamily: F.body,
          fontSize: 20,
          lineHeight: 1.0,
          letterSpacing: "0.01em",
          margin: 0,
        }}>
          <span style={{ color: P.navyDark, fontWeight: 600 }}>{data.closings}</span>
          <span style={{ color: P.warmGrayLight, fontWeight: 400 }}>{` / ${goalTarget} `}</span>
          <span style={{ color: P.warmGray, fontWeight: 400 }}>customers home</span>
        </p>
      </div>

      {/* METRICS — 280px. 4 sparkbar cells, cream bg, creamDark top+bottom borders */}
      <div style={{
        height: 280,
        background: P.cream,
        borderTop: `1px solid ${P.creamDark}`,
        borderBottom: `1px solid ${P.creamDark}`,
        padding: "16px 48px",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {[
          { key: "applications", label: "Applications" },
          { key: "prospecting", label: "Prospecting" },
          { key: "appointments", label: "Appointments" },
          { key: "contentShipped", label: "Content" },
        ].map((m, i) => (
          <div
            key={m.key}
            style={{
              paddingLeft: i === 0 ? 0 : 24,
              paddingRight: i === 3 ? 0 : 24,
              borderLeft: i === 0 ? "none" : `1px solid ${P.creamDark}`,
              boxSizing: "border-box",
            }}
          >
            <Sparkbar
              value={data[m.key].today}
              ytd={data[m.key].ytd}
              weekBars={data[m.key].weekBars}
              label={m.label}
              dayOfYear={data.day}
              dayLetters={dayLetters}
              sundayIndex={sundayIndex}
            />
          </div>
        ))}
      </div>

      {/* FOOTER — 64px. nick peters · nmls# 1119524 · mortgagegeek.ai */}
      <div style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{
          fontFamily: F.body,
          fontSize: 11,
          letterSpacing: "0.22em",
          fontWeight: 500,
          textTransform: "uppercase",
          color: P.warmGray,
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
        }}>
          nick peters
          <DotSeparator />
          nmls# 1119524
          <DotSeparator />
          mortgagegeek.ai
        </span>
      </div>
    </div>
  );
}
