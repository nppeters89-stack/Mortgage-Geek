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

function PathBar({ accent, path }) {
  const isNA = path.years === null;
  const isNoWait = path.years === 0;
  const pct = isNA ? 0 : Math.max(3, ((path.years || 0.3) / SCALE_MAX) * 100);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "92px 1fr 86px",
      alignItems: "center",
      gap: 8,
      padding: "3px 0",
    }}>
      <div style={{
        fontSize: 10.5,
        color: P.warmGray,
        fontWeight: 500,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {path._label}
      </div>

      <div style={{
        height: 8,
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        border: isNA ? `1px dashed ${P.warmGrayLight}` : "none",
        background: isNA ? "transparent" : P.creamDark,
      }}>
        {!isNA && !isNoWait && (
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: accent,
            borderRadius: 4,
          }} />
        )}
        {isNoWait && (
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 16,
            background: accent,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
          }}>✓</div>
        )}
      </div>

      <div style={{
        fontSize: 10.5,
        color: isNA ? P.warmGrayLight : P.navy,
        fontWeight: 600,
        textAlign: "right",
        fontStyle: isNA ? "italic" : "normal",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {path.label}
      </div>
    </div>
  );
}

function Ch13Row({ row, isFirst }) {
  const meta = PROGRAM_META[row.program];
  const accent = DEROG_PROGRAM_COLORS[row.program];
  return (
    <div style={{
      padding: "14px 16px",
      borderTop: isFirst ? "none" : `1px solid ${P.creamDark}`,
    }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: P.navy, lineHeight: 1.2 }}>{meta.full}</div>
        <div style={{ fontSize: 10.5, color: P.warmGrayLight, marginTop: 1 }}>{meta.flavor}</div>
      </div>

      <div>
        {CH13_PATHS.map((p) => (
          <PathBar
            key={p.key}
            accent={accent}
            path={{ ...row.paths[p.key], _label: p.label }}
          />
        ))}
      </div>

      <div style={{
        fontSize: 9.5,
        color: P.warmGrayLight,
        marginTop: 8,
        fontStyle: "italic",
        letterSpacing: 0.2,
      }}>
        Source: {row.source}
      </div>
    </div>
  );
}

export function Ch13Card() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: `1px solid ${P.creamDark}`,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 16px 8px",
        background: P.cream,
        borderBottom: `1px solid ${P.creamDark}`,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "92px 1fr 86px",
          gap: 8,
          fontSize: 9.5,
          color: P.warmGrayLight,
          letterSpacing: 0.3,
        }}>
          <div></div>
          <div style={{ position: "relative", height: 14 }}>
            {[0, 2, 4, 6, 8].map((y) => (
              <div key={y} style={{
                position: "absolute",
                left: `${(y / SCALE_MAX) * 100}%`,
                transform: y === 0 ? "translateX(0)" : y === 8 ? "translateX(-100%)" : "translateX(-50%)",
                top: 0,
              }}>{y}{y === 0 ? "y" : y === 8 ? "y" : ""}</div>
            ))}
          </div>
          <div></div>
        </div>
        <div style={{
          display: "flex",
          gap: 12,
          marginTop: 4,
          fontSize: 9.5,
          color: P.warmGray,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "inline-block", width: 12, height: 6, background: P.navy, borderRadius: 3 }} /> Wait period
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "inline-block", width: 12, height: 6, background: P.navy, borderRadius: 3, position: "relative" }}>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 7, fontWeight: 700 }}>✓</span>
            </span>
            No wait
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "inline-block", width: 12, height: 6, borderRadius: 3, border: `1px dashed ${P.warmGrayLight}` }} />
            Not eligible
          </div>
        </div>
      </div>

      {CH13_DATA.rows.map((r, i) => (
        <Ch13Row key={r.program} row={r} isFirst={i === 0} />
      ))}
    </div>
  );
}
