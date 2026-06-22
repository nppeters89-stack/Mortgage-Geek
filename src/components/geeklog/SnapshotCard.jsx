// 4:5 portrait snapshot card — exactly 1080×1350, the dimensions
// html-to-image captures. Zone heights sum to 1350:
//   Header 132 + Hero 544 + TextBlock 190 + Metrics 420 + Footer 64
//
// Layout, typography, and colors are lifted from CD's locked V3+YTD
// portrait spec (Geek Log Implementation Notes + snapshot-card.jsx +
// metric-variants.jsx L scale). The card always renders portrait L;
// no variant prop is exposed.

import { P, F } from "../../theme";
import { DotGrid } from "./DotGrid";
import { Sparkbar } from "./Sparkbar";

// Map JS Date.getUTCDay() index (0=Sun) → single-letter label.
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// Auto-size the italic headline so it always fits on one line. CD's
// spec assumed ~38-char headlines at 36px; the G3 input allows up to
// 80 chars and longer headlines overflow the 984px content width at
// the canonical size. Scale down to 24px (matches the caption) at
// the upper bound — italic equal in size to the caption is the
// floor before the typographic hierarchy inverts.
function autoSizeItalic(text) {
  const len = (text || "").length;
  if (len <= 38) return 36;
  if (len <= 50) return 32;
  if (len <= 65) return 28;
  return 24;
}

// Build the 7 day-letter labels for the bars ending on `today`.
// Index 6 is today. The Sparkbar component highlights index 6 per
// CD's source (today's letter, not Sunday — Sunday landed at idx 6
// only because the mock used Sun as today).
function buildDayLetters(todayISO) {
  const [y, m, d] = todayISO.split("-").map(Number);
  const todayMs = Date.UTC(y, m - 1, d);
  const letters = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(todayMs - i * 86400000);
    letters.push(DAY_LETTERS[dt.getUTCDay()]);
  }
  return letters;
}

// 3px circle separator used in the header DAY · DATE line and the
// footer credits. Same construction in both places.
function DotSeparator({ color = P.warmGrayLight, mx = 12, mb = 0 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: color,
        margin: `0 ${mx}px ${mb}px`,
        verticalAlign: "middle",
      }}
    />
  );
}

export function SnapshotCard({ data, logoDataUrl = null }) {
  const dayLetters = buildDayLetters(data.dateISO);
  const goalTarget = data.goalTarget || 100;
  const headlineText = (data.headline || "").trim();
  // Visible preview cold-start fallback: if the data URL hasn't
  // resolved yet, point at the public asset so the preview still
  // shows a logo. SnapshotExportButton refuses to export until the
  // data URL is ready, so the captured PNG never falls back.
  const logoSrc = logoDataUrl || "/favicons/icon-512.png";

  return (
    <div style={{
      width: 1080,
      height: 1350,
      position: "relative",
      background: P.cream,
      color: P.navyDark,
      overflow: "hidden",
      fontFamily: F.body,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* HEADER — 132px navy strip. Logo + GEEK LOG wordmark on the
          left, DAY · DATE on the right. */}
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
          {/* Logo rendered as an inline SVG <image> with a data URL
              href. Two prior approaches (HTML <img>, CSS
              background-image on a <div>) both broke on mobile
              WebKit's <foreignObject> capture pipeline — the
              background-image fix from G6 worked at 1080x1080 but
              dropped the image at the larger 1080x1350 output canvas.
              SVG <image> is processed as native SVG content during
              the outer SVG's rasterization (not as foreignObject
              HTML/CSS), which sidesteps the dimension-related
              rendering quirks entirely. */}
          <svg
            role="img"
            aria-label="The Mortgage Geek"
            width="96"
            height="96"
            viewBox="0 0 96 96"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, display: "block" }}
          >
            <image href={logoSrc} width="96" height="96" preserveAspectRatio="xMidYMid meet" />
          </svg>
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
          fontSize: 20,
          letterSpacing: "0.22em",
          fontWeight: 500,
          textTransform: "uppercase",
          color: P.cream,
          display: "inline-flex",
          alignItems: "center",
        }}>
          {/* Literal middle-dot character per CD's source — kept inline
              with the text so its weight matches the surrounding type. */}
          Day {data.day} · <span style={{ fontVariantNumeric: "tabular-nums" }}>{data.dateISO}</span>
        </span>
      </div>

      {/* HERO — 544px, DotGrid only. Pinned high with paddingTop 48 so
          the grid pairs visually with the masthead. Canonical 26/14
          defaults (no size overrides) → 386×386 grid. */}
      <div style={{
        height: 544,
        paddingTop: 48,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}>
        <DotGrid filled={data.closings} total={goalTarget} />
      </div>

      {/* TEXTBLOCK — 190px. Italic headline (or 8×8 gold diamond
          fallback) + tri-color caption. 36px symmetric vertical
          padding, 18px inner gap, centered. */}
      <div style={{
        height: 190,
        padding: "36px 48px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
      }}>
        {headlineText ? (
          <p style={{
            fontFamily: F.display,
            fontStyle: "italic",
            fontSize: autoSizeItalic(headlineText),
            lineHeight: 1.15,
            letterSpacing: "0.005em",
            color: P.navy,
            margin: 0,
            whiteSpace: "nowrap",
            textAlign: "center",
          }}>
            {headlineText}
          </p>
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              background: P.gold,
              transform: "rotate(45deg)",
            }}
          />
        )}
        <p style={{
          fontFamily: F.body,
          fontSize: 24,
          lineHeight: 1.0,
          letterSpacing: "0.01em",
          textAlign: "center",
          margin: 0,
        }}>
          <span style={{ color: P.navyDark, fontWeight: 600 }}>{data.closings}</span>
          <span style={{ color: P.warmGrayLight, fontWeight: 400 }}>{` / ${goalTarget} `}</span>
          <span style={{ color: P.warmGray, fontWeight: 400 }}>customers home</span>
        </p>
      </div>

      {/* METRICS — 420px. 4 sparkbar cells at L scale, cream bg,
          creamDark top+bottom borders + inter-cell verticals. */}
      <div style={{
        height: 420,
        background: P.cream,
        borderTop: `1px solid ${P.creamDark}`,
        borderBottom: `1px solid ${P.creamDark}`,
        padding: "16px 48px",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {[
          { key: "applications", label: "Apps" },
          { key: "prospecting", label: "Prospecting" },
          { key: "appointments", label: "Appts" },
          { key: "contentShipped", label: "Content" },
        ].map((m, i) => (
          <div
            key={m.key}
            style={{
              borderRight: i < 3 ? `1px solid ${P.creamDark}` : "none",
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
          fontSize: 13,
          letterSpacing: "0.22em",
          fontWeight: 500,
          textTransform: "uppercase",
          color: P.warmGray,
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
        }}>
          nick peters
          <DotSeparator mb={3} />
          nmls# 1119524
          <DotSeparator mb={3} />
          mortgagegeek.ai
        </span>
      </div>
    </div>
  );
}
