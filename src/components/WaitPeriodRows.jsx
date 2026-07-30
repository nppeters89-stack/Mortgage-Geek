import { P, F } from "../theme";
import {
  DEROG_PROGRAM_COLORS,
  PROGRAM_META,
  SCALE_MAX,
  EVENT_SOURCES,
  CH13_PATHS,
  CH13_DATA,
} from "../data/derogatoryCredit";

function WaitRow({ event, row, isFirst }) {
  const meta = PROGRAM_META[row.program];
  const accent = DEROG_PROGRAM_COLORS[row.program];
  const showBars = event.id !== "latepayments";
  const stdPct = showBars ? Math.max(4, (row.std / SCALE_MAX) * 100) : 0;
  const hasExtBar = showBars && row.extYears !== null && row.extYears < row.std;
  const extPct = hasExtBar ? Math.max(2, (row.extYears / SCALE_MAX) * 100) : 0;
  const source = EVENT_SOURCES[event.id]?.[row.program];

  return (
    <div style={{
      padding: "14px 16px",
      borderTop: isFirst ? `1px solid ${P.creamDark}` : "none",
      borderBottom: `1px solid ${P.creamDark}`,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "baseline",
        gap: 12,
        marginBottom: showBars ? 8 : 4,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.navy, lineHeight: 1.2 }}>
            {meta.full}
          </div>
          <div style={{ fontSize: 10.5, color: P.warmGrayLight, marginTop: 1 }}>
            {meta.flavor}
          </div>
        </div>
        <div style={{
          fontFamily: F.display,
          fontSize: 26,
          color: accent,
          lineHeight: 1,
          fontWeight: 400,
          whiteSpace: "nowrap",
        }}>
          {row.stdLabel}
        </div>
      </div>

      {showBars && (
        <div style={{ marginBottom: 6 }}>
          <div style={{
            height: 7,
            background: P.creamDark,
            borderRadius: 4,
            position: "relative",
            overflow: "hidden",
            marginBottom: hasExtBar ? 4 : 0,
          }}>
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: `${stdPct}%`,
              background: accent,
              borderRadius: 4,
            }} />
          </div>
          {hasExtBar && (
            <div style={{
              height: 5,
              background: P.creamDark,
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: `${extPct}%`,
                background: accent,
                opacity: 0.4,
                borderRadius: 3,
              }} />
            </div>
          )}
        </div>
      )}

      {row.extLabel && (
        <div style={{ fontSize: 11, color: P.goldMuted, lineHeight: 1.5, marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>Extenuating:</span> {row.extLabel}
        </div>
      )}

      <div style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5 }}>
        {row.note}
      </div>

      {source && (
        <div style={{
          fontSize: 9.5,
          color: P.warmGrayLight,
          marginTop: 4,
          fontStyle: "italic",
          letterSpacing: 0.2,
        }}>
          Source: {source}
        </div>
      )}
    </div>
  );
}

export function WaitPeriodRows({ event }) {
  const showBars = event.id !== "latepayments";
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: `1px solid ${P.creamDark}`,
      overflow: "hidden",
    }}>
      {showBars && (
        <div style={{
          padding: "10px 16px 6px",
          background: P.cream,
          borderBottom: `1px solid ${P.creamDark}`,
        }}>
          <div style={{
            position: "relative",
            height: 14,
            fontSize: 9.5,
            color: P.warmGrayLight,
            letterSpacing: 0.3,
          }}>
            {[0, 2, 4, 6, 8].map((y) => (
              <div key={y} style={{
                position: "absolute",
                left: `${(y / SCALE_MAX) * 100}%`,
                transform: y === 0 ? "translateX(0)" : y === 8 ? "translateX(-100%)" : "translateX(-50%)",
                top: 0,
              }}>{y}{y === 0 ? "y" : y === 8 ? "y" : ""}</div>
            ))}
          </div>
          <div style={{
            display: "flex",
            gap: 14,
            marginTop: 4,
            fontSize: 9.5,
            color: P.warmGray,
            letterSpacing: 0.3,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ display: "inline-block", width: 14, height: 6, background: P.navy, borderRadius: 3 }} />
              Standard wait
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ display: "inline-block", width: 14, height: 5, background: P.navy, opacity: 0.4, borderRadius: 3 }} />
              Extenuating
            </div>
          </div>
        </div>
      )}

      {event.rows.map((r, i) => (
        <WaitRow key={r.program} event={event} row={r} isFirst={i === 0} />
      ))}
    </div>
  );
}

// Local bold renderer for Ch13 notes. Splits on ** pairs and renders the inner
// text as a navy strong span. Mirrors renderBold in DerogatoryCreditPage, kept
// local so the component does not import from the page.
function renderCh13Bold(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: P.navy, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Small inline pill. Variants: aus (solid navy), manual (outlined navy),
// exception (outlined muted red), na (dashed gray).
const CH13_BADGE_STYLES = {
  aus: { background: P.navy, color: "#fff", border: "1.5px solid transparent" },
  manual: { background: "transparent", color: P.navy, border: `1.5px solid ${P.navy}` },
  exception: { background: "transparent", color: P.goldMuted, border: `1.5px solid ${P.goldMuted}` },
  na: { background: "transparent", color: P.warmGray, border: `1.5px dashed ${P.warmGrayLight}` },
};

function Ch13Badge({ variant, label }) {
  return <span className="ch13x-badge" style={CH13_BADGE_STYLES[variant]}>{label}</span>;
}

// A subtle wash of the program's color for its eligibility cells. Solid mix over
// white (not a translucent overlay), so it reads as a clean tint and does not
// blend with the creamDark grid gaps behind the cell. Browsers without color-mix
// fall back to the white .ch13x-cell / .ch13x-mcell background.
const cellTint = (accent) => `color-mix(in srgb, ${accent} 7%, #fff)`;

// The FHA "no wait" underwriting story: manual for the first 2 years, AUS after.
// Labels sit BELOW the two-segment track, never on top of it.
function Ch13AusUnlock() {
  const fha = DEROG_PROGRAM_COLORS.FHA;
  return (
    <div className="ch13x-unlock">
      <div className="ch13x-unlock-track">
        <div style={{ width: "42%", background: fha, opacity: 0.35 }} />
        <div style={{ width: "58%", background: fha }} />
      </div>
      <div className="ch13x-unlock-labels">
        <div style={{ width: "42%" }}>0 to 2 yrs: manual only</div>
        <div style={{ width: "58%" }}>2 yrs +: AUS eligible</div>
      </div>
    </div>
  );
}

// One path cell body (headline, badge, note, optional unlock strip). Shared by
// the desktop grid and the mobile stack.
function Ch13PathCell({ accent, path }) {
  return (
    <>
      <div
        className="ch13x-headline"
        style={{ color: path.muted ? P.warmGray : accent, fontSize: path.headlineSize === "sm" ? 16 : 21 }}
      >
        {path.headline}
      </div>
      <div className="ch13x-badge-wrap">
        <Ch13Badge variant={path.badge} label={path.badgeLabel} />
      </div>
      <div className="ch13x-note">{renderCh13Bold(path.note)}</div>
      {path.ausUnlock && <Ch13AusUnlock />}
    </>
  );
}

const CH13_LEGEND = [
  { variant: "aus", label: "AUS OK", desc: "automated approval available" },
  { variant: "manual", label: "Manual UW", desc: "human underwriter required" },
  { variant: "exception", label: "Credit exception", desc: "documented lender exception" },
  { variant: "na", label: "Not eligible", desc: "no path until status changes" },
];

export function Ch13Card() {
  return (
    <div className="ch13x-card">
      <style>{`
        .ch13x-card {
          background: #fff;
          border: 1px solid ${P.creamDark};
          border-radius: 10px;
          overflow: hidden;
        }
        .ch13x-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;
          padding: 12px 16px;
          background: ${P.cream};
          border-bottom: 1px solid ${P.creamDark};
        }
        .ch13x-legend-item { display: flex; align-items: center; gap: 8px; }
        .ch13x-legend-desc { font-size: 11.5px; color: ${P.warmGray}; }

        .ch13x-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-radius: 4px;
          padding: 3px 8px;
          line-height: 1.2;
          white-space: nowrap;
        }

        .ch13x-headline { font-weight: 600; line-height: 1.1; margin-bottom: 8px; }
        .ch13x-badge-wrap { margin-bottom: 8px; }
        .ch13x-note { font-size: 11px; color: ${P.warmGray}; line-height: 1.55; }

        .ch13x-unlock { margin-top: 10px; }
        .ch13x-unlock-track {
          display: flex;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }
        .ch13x-unlock-labels { display: flex; margin-top: 3px; }
        .ch13x-unlock-labels > div {
          font-size: 9px;
          color: ${P.warmGray};
          letter-spacing: 0.3px;
          line-height: 1.3;
        }

        /* Desktop matrix: program column plus one column per path. Column and
           row separators come from the 1px grid gap over a creamDark ground. */
        .ch13x-grid {
          display: grid;
          grid-template-columns: 170px 1fr 1fr 1fr;
          gap: 1px;
          background: ${P.creamDark};
        }
        .ch13x-h {
          background: ${P.cream};
          padding: 10px 14px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: ${P.warmGray};
        }
        .ch13x-id { background: #fff; padding: 14px; }
        .ch13x-id-name { font-size: 14px; font-weight: 600; line-height: 1.2; }
        .ch13x-id-flavor { font-size: 10.5px; color: ${P.warmGrayLight}; margin-top: 2px; }
        .ch13x-id-source { font-size: 9.5px; font-style: italic; color: ${P.warmGrayLight}; margin-top: 8px; }
        .ch13x-cell { background: #fff; padding: 14px; }

        /* Mobile: one stacked card per program. */
        .ch13x-mobile { display: none; }
        .ch13x-mcard { border-bottom: 1px solid ${P.creamDark}; }
        .ch13x-mcard:last-child { border-bottom: none; }
        .ch13x-mhead {
          background: ${P.cream};
          padding: 12px 16px;
          border-bottom: 1px solid ${P.creamDark};
        }
        .ch13x-mcell { padding: 14px 16px; border-bottom: 1px solid ${P.creamDark}; }
        .ch13x-mcell:last-child { border-bottom: none; }
        .ch13x-mlabel {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: ${P.warmGrayLight};
          margin-bottom: 8px;
        }

        @media (max-width: 760px) {
          .ch13x-desktop { display: none; }
          .ch13x-mobile { display: block; }
        }
      `}</style>

      <div className="ch13x-legend">
        {CH13_LEGEND.map((it) => (
          <div key={it.variant} className="ch13x-legend-item">
            <Ch13Badge variant={it.variant} label={it.label} />
            <span className="ch13x-legend-desc">{it.desc}</span>
          </div>
        ))}
      </div>

      <div className="ch13x-desktop">
        <div className="ch13x-grid">
          <div className="ch13x-h">Program</div>
          {CH13_PATHS.map((p) => (
            <div key={p.key} className="ch13x-h">{p.label}</div>
          ))}
          {CH13_DATA.rows.flatMap((row) => {
            const meta = PROGRAM_META[row.program];
            const accent = DEROG_PROGRAM_COLORS[row.program];
            const cells = [
              <div key={`${row.program}-id`} className="ch13x-id">
                <div className="ch13x-id-name" style={{ color: accent }}>{meta.full}</div>
                <div className="ch13x-id-flavor">{meta.flavor}</div>
                <div className="ch13x-id-source">{row.source}</div>
              </div>,
            ];
            for (const p of CH13_PATHS) {
              cells.push(
                <div key={`${row.program}-${p.key}`} className="ch13x-cell" style={{ background: cellTint(accent) }}>
                  <Ch13PathCell accent={accent} path={row.paths[p.key]} />
                </div>
              );
            }
            return cells;
          })}
        </div>
      </div>

      <div className="ch13x-mobile">
        {CH13_DATA.rows.map((row) => {
          const meta = PROGRAM_META[row.program];
          const accent = DEROG_PROGRAM_COLORS[row.program];
          return (
            <div key={row.program} className="ch13x-mcard">
              <div className="ch13x-mhead">
                <div className="ch13x-id-name" style={{ color: accent }}>{meta.full}</div>
                <div className="ch13x-id-flavor">{meta.flavor}</div>
                <div className="ch13x-id-source">{row.source}</div>
              </div>
              {CH13_PATHS.map((p) => (
                <div key={p.key} className="ch13x-mcell" style={{ background: cellTint(accent) }}>
                  <div className="ch13x-mlabel">{p.label}</div>
                  <Ch13PathCell accent={accent} path={row.paths[p.key]} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
