import { useState, useEffect } from "react";
import { T, FF, STAGE_RAMP } from "../gl2Tokens";
import { COV_TARGET, RAC_TARGET, MOT_TARGET } from "./prospectsModel";

// Triage HUD (CD handoff 1A): the cockpit's ten-card diagnostic strip replaced
// by one three-zone panel. Zone 1 is the work owed (the only red on the strip),
// zone 2 is whether Nick is working it, zone 3 is what data is missing. Whales
// and SOI are pipeline composition, not diagnostics, so they live on the footer
// line below the panel. SoiCockpit keeps the old Stat/Ring cards; this panel is
// this screen's own instrument.

// The old instructions paragraph, moved behind a ? by the title: read once, it
// no longer costs a permanent row.
const HELP_COPY = "Drag a card to any stage to move it, no touch logged. Open a card and tap the whale by the name to move a top producer to their own pipeline. Drop on the goal column to promote to SOI. Drag down to cold when someone goes quiet, further down to the dead box to let go. Click any card for the full view and to log touches.";

export function HudHelp() {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" aria-label="How the board works" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${T.line}`, background: "none", color: T.dim, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FF.body, lineHeight: 1, padding: 0 }}>
        ?
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div role="dialog" aria-label="How the board works"
            style={{ position: "absolute", top: 28, left: 0, zIndex: 41, width: 340, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.55, color: T.dim, fontFamily: FF.body, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" }}>
            {HELP_COPY}
          </div>
        </>
      )}
    </span>
  );
}

const eyebrow = (color) => ({ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color });
const zonePad = { padding: "16px 20px 17px", display: "flex", flexDirection: "column" };

// One data-on-file gauge row: label, target-ticked bar, value. The tick is a
// sibling of the clipped fill (the track clips, the row does not) so a target
// at 100% is not sheared off.
function GaugeRow({ label, pct, color, target }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 116, flex: "none", fontSize: 11.5, color: T.dim, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ position: "relative", flex: 1, height: 7 }}>
        <span style={{ position: "absolute", inset: 0, background: T.bg0, borderRadius: 4, overflow: "hidden" }}>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, borderRadius: 4, transition: "width .5s ease" }} />
        </span>
        <span style={{ position: "absolute", top: -2, bottom: -2, width: 2, left: `calc(${target}% - 1px)`, background: "rgba(255,254,251,0.55)" }} />
      </span>
      <span style={{ width: 34, flex: "none", textAlign: "right", fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", color }}>{pct}%</span>
    </div>
  );
}

export function TriageHud({ stats, weekTarget, dueOnly, onToggleDueOnly, coldTotal, deadCount, onJump }) {
  // Same matchMedia pattern as the cockpit's ultra hook: below 1200px the three
  // zones stack and the dividers rotate from right edges to bottom edges.
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1200px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1200px)");
    const onChange = (e) => setWide(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const [hov, setHov] = useState(false);

  const divider = wide ? { borderRight: `1px solid ${T.line}` } : { borderBottom: `1px solid ${T.line}` };
  const dayMax = Math.max(1, ...stats.dayCounts);
  const weekPct = Math.min(100, (stats.week / (weekTarget || 1)) * 100);
  const pillOff = stats.due === 0;

  // Worst first: ascending by percentage, so the gap to close sits on top.
  const gauges = [
    { label: "Motivation on file", pct: stats.motPct, color: T.orange, target: MOT_TARGET },
    { label: "In RAC", pct: stats.racPct, color: T.amber, target: RAC_TARGET },
    { label: "Touched in 14d", pct: stats.cov, color: stats.cov < COV_TARGET ? T.amber : T.green, target: COV_TARGET },
  ].sort((a, b) => a.pct - b.pct);

  const footBtn = (color) => ({ background: "none", border: "none", padding: 0, fontFamily: FF.body, fontSize: 11.5, color, cursor: "pointer" });

  return (
    <div style={{ fontFamily: FF.body, marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: wide ? "320px 1fr 360px" : "1fr", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden", boxSizing: "border-box" }}>

        {/* Zone 1 — Needs you now. The only red on the strip: work owed. */}
        <div style={{ ...zonePad, ...divider, background: T.redWash, gap: 10 }}>
          <div style={eyebrow(T.redLift)}>Needs you now</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 0.85, fontVariantNumeric: "tabular-nums", color: stats.due > 0 ? T.redLift : T.dim }}>{stats.due}</div>
            <div style={{ paddingBottom: 3, fontSize: 12.5, lineHeight: 1.35, color: T.dim }}>past their<br />touch clock</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" disabled={pillOff} aria-pressed={dueOnly} onClick={onToggleDueOnly}
              onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              style={{ background: hov && !pillOff ? "rgba(226,87,91,0.22)" : "rgba(226,87,91,0.14)", border: `1px solid ${T.redLiftLine}`, borderRadius: 999, padding: "7px 13px", fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, color: T.redLiftHi, cursor: pillOff ? "default" : "pointer", opacity: pillOff ? 0.45 : 1 }}>
              {dueOnly ? "Showing due only ✕" : "Work the queue →"}
            </button>
            <span style={{ fontSize: 12, color: T.dim }}>
              {stats.hotLeads} {"🔥"} hot{stats.due > 0 ? ` · oldest ${stats.oldestDue === null ? "never touched" : `${stats.oldestDue}d`}` : ""}
            </span>
          </div>
        </div>

        {/* Zone 2 — Am I working it. */}
        <div style={{ ...zonePad, ...divider, gap: 11 }}>
          <div style={eyebrow(T.greenBright)}>Am I working it</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
              <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: T.cream }}>{stats.today}</span>
              <span style={{ fontSize: 12, color: T.dim }}>today</span>
            </div>
            <div role="img" aria-label={`Touches per day over the last 14 days: ${stats.dayCounts.join(", ")}`}
              style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40 }}>
              {stats.dayCounts.map((n, i) => (
                <div key={i} style={{ width: 9, borderRadius: 2, height: `${Math.max(8, (n / dayMax) * 100)}%`, background: n === 0 ? T.faint : i === 13 ? T.greenBright : i >= 7 ? "rgba(47,191,113,0.55)" : "rgba(47,191,113,0.35)" }} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: "0 1 460px", minWidth: 210 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, color: T.dim }}>This week</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: stats.week >= weekTarget ? T.greenBright : T.cream }}>
                  {stats.week} <span style={{ color: T.dimmer, fontWeight: 500 }}>/ {weekTarget} goal</span>
                </span>
              </div>
              <div style={{ position: "relative", height: 6, background: T.bg0, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${weekPct}%`, background: stats.week >= weekTarget ? T.greenBright : `linear-gradient(90deg, ${T.redLift}, ${T.amber})`, borderRadius: 3, transition: "width .4s" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, color: T.dim }}>Day streak</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < Math.min(stats.streak, 7) ? T.greenBright : "rgba(255,254,251,0.14)" }} />
                  ))}
                  <span style={{ marginLeft: 5, fontSize: 12.5, fontWeight: 700, color: T.cream }}>{stats.streak}</span>
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: T.dimmer }}>last 14 days · touches per day</div>
            </div>
          </div>
        </div>

        {/* Zone 3 — Data on file, worst first. Orange is the missing-data nag. */}
        <div style={{ ...zonePad, gap: 9 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={eyebrow(T.dim)}>Data on file · {stats.liveCount} live</div>
            <div style={{ fontSize: 11, color: T.dimmer }}>worst first</div>
          </div>
          {gauges.map((g) => <GaugeRow key={g.label} label={g.label} pct={g.pct} color={g.color} target={g.target} />)}
          <div style={{ marginTop: 2, fontSize: 11, color: T.dimmer }}>Ticks are the target.</div>
        </div>
      </div>

      {/* Footer: pipeline composition, not diagnostics. The section names jump. */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 4px 0", fontSize: 11.5, color: T.faint }}>
        <span>Pipeline</span>
        <span style={{ color: T.dim }}>{stats.activeCount} active</span>
        <button type="button" style={footBtn(T.whale)} onClick={() => onJump("whale")}>{stats.whales} {"🐳"} whales</button>
        <button type="button" style={footBtn(STAGE_RAMP[STAGE_RAMP.length - 1])} onClick={() => onJump("soi")}>{stats.soiCount} {"🤝"} SOI</button>
        <button type="button" style={footBtn(T.cold)} onClick={() => onJump("cold")}>{coldTotal} cold</button>
        <span>{deadCount} buried</span>
      </div>
    </div>
  );
}
