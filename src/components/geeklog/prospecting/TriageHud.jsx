import { useState, useEffect } from "react";
import { T, FF, STAGE_RAMP } from "../gl2Tokens";
import { COV_TARGET, RAC_TARGET, MOT_TARGET, CONVO_TARGET } from "./prospectsModel";

// Triage HUD (CD handoff 1A + the 2B filter rail): the cockpit's diagnostics as
// one instrument. Zone 1 is the work owed (the only red on the strip), zone 2
// is whether Nick is working it (with the pipeline composition pinned to its
// bottom edge), zone 3 is what data is missing. The rail docked underneath
// filters the hot board: due / missing RAC / has motivation / fire-flagged.
// SoiCockpit keeps the old Stat/Ring cards; this panel is this screen's own.

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

// Accent hex at 14% alpha for the rail's lit-tab background.
const wash14 = (hex) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},0.14)`;

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

// Conversations power bar in its own box, sitting on the title line above the
// panel. Fill ramps by progress so it reads as a gauge, capped at the goal.
export function ConvoBar({ convosWeek }) {
  const pct = Math.min(100, (convosWeek / CONVO_TARGET) * 100);
  const fill = pct >= 100 ? T.greenBright : pct >= 50 ? `linear-gradient(90deg, ${T.orange}, ${T.amber})` : `linear-gradient(90deg, ${T.redLift}, ${T.orange})`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "0 1 380px", minWidth: 280, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 14px", fontFamily: FF.body, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dim, whiteSpace: "nowrap" }}>Conversations this week</span>
        <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{convosWeek} <span style={{ fontSize: 11.5, fontWeight: 400, color: T.faint }}>/ {CONVO_TARGET} goal</span></span>
      </div>
      <div role="progressbar" aria-valuenow={Math.min(convosWeek, CONVO_TARGET)} aria-valuemin={0} aria-valuemax={CONVO_TARGET} aria-label={`Conversations this week toward a weekly goal of ${CONVO_TARGET}`}
        style={{ position: "relative", height: 12, background: T.bg0, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 6, width: `${pct}%`, transition: "width .5s ease", background: fill }} />
        {[25, 50, 75].map((q) => (
          <div key={q} style={{ position: "absolute", top: 0, bottom: 0, width: 1, left: `${q}%`, background: "rgba(255,254,251,0.14)" }} />
        ))}
      </div>
    </div>
  );
}

export function TriageHud({ stats, weekTarget, activeFilter, onSetFilter, coldTotal, deadCount, onJump }) {
  // Same matchMedia pattern as the cockpit's ultra hook: below 1200px the three
  // zones stack, the dividers rotate to bottom edges, and the rail wraps.
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1200px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1200px)");
    const onChange = (e) => setWide(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const [hovSeg, setHovSeg] = useState(null);

  const divider = wide ? { borderRight: `1px solid ${T.line}` } : { borderBottom: `1px solid ${T.line}` };

  // Worst first: ascending by percentage, so the gap to close sits on top.
  const gauges = [
    { label: "Motivation on file", pct: stats.motPct, color: T.orange, target: MOT_TARGET },
    { label: "In RAC", pct: stats.racPct, color: T.amber, target: RAC_TARGET },
    { label: "Touched in 14d", pct: stats.cov, color: stats.cov < COV_TARGET ? T.amber : T.green, target: COV_TARGET },
  ].sort((a, b) => a.pct - b.pct);

  // Rail segments. Counts are absolute (unfiltered pools) so the rail stays a
  // menu, not a mirror. Fire uses ramp yellow: orange is the motivation signal.
  const segs = [
    { key: "due", glyph: "◗", label: "Due today", accent: T.redLift, count: stats.due },
    { key: "rac", glyph: "✓", label: "Missing RAC", accent: T.amber, count: stats.racMissing },
    { key: "mot", glyph: "●", label: "Motivation", accent: T.orange, count: stats.motCount },
    { key: "fire", glyph: "🔥", label: "Hot", accent: STAGE_RAMP[5], count: stats.hotLeads },
    // Maintenance Day: the whole Motivation / Maintenance column plus the
    // entire cold pipeline, regardless of due state. A view, not a clock.
    { key: "maint", glyph: "🛠", label: "Maintenance Day", accent: T.cold, count: stats.maintCount + coldTotal },
    // Replied: qualify-next list. Badge counts only owed responses; the
    // filter itself shows every card with a reply in history.
    { key: "replied", glyph: "💬", label: "Replied", accent: T.greenBright, count: stats.repliedOwed },
  ];

  const footBtn = (color) => ({ background: "none", border: "none", padding: 0, fontFamily: FF.body, fontSize: 11.5, color, cursor: "pointer" });

  return (
    <div style={{ fontFamily: FF.body, marginBottom: 16 }}>
      {/* One bordered container: the three-zone grid plus the docked rail. */}
      <div style={{ width: wide ? "fit-content" : "auto", maxWidth: "100%", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "320px auto 360px" : "1fr", boxSizing: "border-box" }}>

          {/* Zone 1 — Needs you now. The only red on the strip: work owed. */}
          <div style={{ ...zonePad, ...divider, background: T.redWash, gap: 10 }}>
            <div style={eyebrow(T.redLift)}>Needs you now</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 0.85, fontVariantNumeric: "tabular-nums", color: stats.due > 0 ? T.redLift : T.dim }}>{stats.due}</div>
              <div style={{ paddingBottom: 3, fontSize: 12.5, lineHeight: 1.35, color: T.dim }}>past their<br />touch clock</div>
            </div>
            <div style={{ fontSize: 12, color: T.dim }}>
              {stats.hotLeads} {"🔥"} hot{stats.due > 0 ? ` · oldest ${stats.oldestDue === null ? "never touched" : `${stats.oldestDue}d`}` : ""}
            </div>
          </div>

          {/* Zone 2 — Am I working it, with pipeline composition on its floor. */}
          <div style={{ ...zonePad, ...divider, gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <div style={eyebrow(T.greenBright)}>Am I working it</div>
              <div style={{ fontSize: 11, color: T.faint }}>{stats.weekLabel}</div>
            </div>
            {/* Three numbers, hairline-split. Added today is the only green and
                the only daily figure; the wk suffixes keep the timeframes honest. */}
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ flex: 1, paddingRight: 16, borderRight: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: T.greenBright }}>{stats.addedToday}</div>
                <div style={{ marginTop: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.greenBright }}>Added · Today</div>
              </div>
              <div style={{ flex: 1, padding: "0 16px", borderRight: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: T.cream }}>{stats.addedWeek}</div>
                <div style={{ marginTop: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dimmer }}>Added · Week</div>
              </div>
              <div style={{ flex: 1, padding: "0 16px", borderRight: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: T.cream }}>{stats.week}</div>
                <div style={{ marginTop: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dimmer }}>Follow ups · Week</div>
              </div>
              <div style={{ flex: 1, padding: "0 16px", borderRight: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: T.cream }}>{stats.repliesWeek}</div>
                <div style={{ marginTop: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dimmer }}>Replies · Week</div>
              </div>
              <div style={{ flex: 1.25, paddingLeft: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: T.amber }}>{stats.ratioPct}%</span>
                  <span style={{ fontSize: 10.5, color: T.dimmer, fontVariantNumeric: "tabular-nums" }}>{stats.convosWeek === 0 ? "no conversations this week" : `${stats.addedWeek} of ${stats.convosWeek} convos`}</span>
                </div>
                <div style={{ marginTop: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dimmer }}>Conversion ratio · wk</div>
              </div>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 11, borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: T.faint }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dimmer }}>Pipeline</span>
              <span style={{ color: T.dim }}>{stats.activeCount} active</span>
              <button type="button" style={footBtn(T.whale)} onClick={() => onJump("whale")}>{stats.whales} {"🐳"} whales</button>
              <button type="button" style={footBtn(STAGE_RAMP[STAGE_RAMP.length - 1])} onClick={() => onJump("soi")}>{stats.soiCount} {"🤝"} SOI</button>
              <button type="button" style={footBtn(T.cold)} onClick={() => onJump("cold")}>{coldTotal} cold</button>
              <span>{deadCount} buried</span>
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

        {/* The 2B rail: docked to the panel, filters the hot board. */}
        <div role="group" aria-label="Filter the board"
          style={{ borderTop: `1px solid ${T.line}`, background: "rgba(255,254,251,0.02)", display: "flex", alignItems: "stretch", flexWrap: wide ? "nowrap" : "wrap" }}>
          {wide && (
            <div style={{ padding: "0 18px", display: "flex", alignItems: "center", borderRight: `1px solid ${T.line}`, fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dimmer, whiteSpace: "nowrap" }}>
              Filter the board
            </div>
          )}
          {segs.map((seg) => {
            const active = activeFilter === seg.key;
            const off = !seg.count;
            return (
              <button key={seg.key} type="button" disabled={off} aria-pressed={active}
                onClick={() => onSetFilter(active ? null : seg.key)}
                onMouseEnter={() => setHovSeg(seg.key)} onMouseLeave={() => setHovSeg(null)}
                style={{ flex: wide ? 1 : "1 0 50%", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "14px 12px", border: "none", borderRight: `1px solid ${T.line}`, borderTop: `2px solid ${active ? seg.accent : "transparent"}`, background: active ? wash14(seg.accent) : hovSeg === seg.key && !off ? T.lineSoft : "rgba(255,254,251,0.02)", cursor: off ? "default" : "pointer", fontFamily: FF.body, opacity: off ? 0.45 : 1 }}>
                <span aria-hidden="true" style={{ fontSize: 11, color: active ? seg.accent : T.dimmer }}>{seg.glyph}</span>
                <span style={{ fontSize: 13, marginLeft: -3, color: active ? seg.accent : T.dim, fontWeight: active ? 700 : 600 }}>{seg.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: active ? seg.accent : T.dimmer }}>{seg.count}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => onSetFilter(null)}
            style={{ flex: wide ? "none" : "1 0 100%", padding: wide ? "0 18px" : "12px 18px", border: "none", background: "none", fontSize: 12, color: T.dimmer, cursor: "pointer", fontFamily: FF.body }}>
            All {stats.activeCount} ✕
          </button>
        </div>
      </div>
    </div>
  );
}
