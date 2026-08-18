import { T, FF, APP_MAX } from "./gl2Tokens";
import { Eyebrow, Card, Wordmark } from "./Gl2Primitives";
import { CONV_SUBS, APPT_SUBS, CONTENT_SUBS, sumKeys, convOf } from "./gl2Model";
import { monthDay } from "./gl2Week";

// Geek Log 2.0 reward-layer UI: the Week-screen bests/pace/streak block, the
// "new best day" flash, the target-cleared burst, and the Sunday recap seal.
// Green tokens stay scoped here (gl2Tokens). No em-dashes. Keyframes gl-burst /
// gl-flash / gl-sealin live in Gl2App's <style>.

const GREEN_TINT = "rgba(47,191,113,0.16)";
const GREEN_LINE = "rgba(47,191,113,0.24)";

function Row({ label, children, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 30, borderBottom: last ? "none" : `1px solid ${T.lineSoft}` }}>
      <Eyebrow size={10.5}>{label}</Eyebrow>
      <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{children}</div>
    </div>
  );
}

// Compact bests / pace / streak block for the Week screen (near the day strip).
// pace = { hasData, diff } (this week through today minus last week through the
// same day index). streak >= 2 to show; green at 3+.
export function WeekRewards({ bestDay, todayConv, pace, streak }) {
  const bestShown = Math.max(bestDay || 0, todayConv || 0);
  const beating = (todayConv || 0) > (bestDay || 0) && todayConv > 0;
  const showPace = pace && pace.hasData;
  const showStreak = streak >= 2;
  if (bestShown === 0 && !showPace && !showStreak) return null;

  let paceText = "Level with last week's pace";
  let paceColor = T.cream;
  if (showPace) {
    if (pace.diff > 0) { paceText = `${pace.diff} ahead of last week's pace`; paceColor = T.greenBright; }
    else if (pace.diff < 0) { paceText = `${-pace.diff} behind last week's pace`; paceColor = T.dim; }
  }

  return (
    <Card pad={15}>
      <Row label="Best day" last={!showPace && !showStreak}>
        <span style={{ color: beating ? T.greenBright : T.cream }}>{bestShown}</span>
        {beating && <span style={{ fontWeight: 500, fontSize: 11, color: T.dimmer }}> today</span>}
      </Row>
      {showPace && (
        <Row label="Pace" last={!showStreak}>
          <span style={{ color: paceColor, fontSize: 13 }}>{paceText}</span>
        </Row>
      )}
      {showStreak && (
        <Row label="Streak" last>
          <span style={{ color: streak >= 3 ? T.greenBright : T.dim }}>{streak} day streak</span>
        </Row>
      )}
    </Card>
  );
}

// Transient "New best day" chip pinned near the top (Today screen).
export function BestDayFlash() {
  return (
    <div style={{ position: "fixed", top: "calc(10px + env(safe-area-inset-top, 0px))", left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 45, pointerEvents: "none" }}>
      <div style={{ animation: "gl-flash 2s ease both", background: GREEN_TINT, border: `1px solid ${GREEN_LINE}`, borderRadius: 999, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 26px rgba(0,0,0,.4)" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.greenBright }} />
        <span style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 13, color: T.cream }}>New best day</span>
      </div>
    </div>
  );
}

// Full-screen green burst when weekly conversations first reach the target.
export function TargetBurst() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", pointerEvents: "none", animation: "gl-burstfade 1.9s ease both", background: "radial-gradient(circle at 50% 50%, rgba(47,191,113,0.28) 0%, rgba(47,191,113,0.10) 40%, rgba(19,20,22,0.82) 72%)" }}>
      <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", border: `2px solid ${T.greenBright}`, animation: "gl-burst 1.9s cubic-bezier(.2,.8,.3,1) both" }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontFamily: FF.body, fontWeight: 800, fontSize: 40, letterSpacing: "-0.02em", color: T.cream, animation: "gl-flash 1.9s ease both" }}>Target cleared</div>
        <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 14, color: T.greenBright, marginTop: 8, letterSpacing: "0.02em" }}>You hit the number this week.</div>
      </div>
    </div>
  );
}

// Sunday recap seal: shown once when the week rolls over and the prior week has
// activity. Prior week pillar totals, best day, target result, streak, and the
// option to generate the story card for that prior week.
export function RecapSeal({ lastWeek, target, streak, onExport, onDismiss, exporting }) {
  const days = lastWeek.days || [];
  const totals = {};
  for (const d of days) for (const k of Object.keys(d)) if (k !== "date") totals[k] = (totals[k] || 0) + (d[k] || 0);
  const conv = sumKeys(totals, CONV_SUBS);
  const appt = sumKeys(totals, APPT_SUBS);
  const content = sumKeys(totals, CONTENT_SUBS);
  let best = 0;
  for (const d of days) best = Math.max(best, convOf(d));
  const hit = conv >= target;
  const range = `${monthDay(days[0].date)} to ${monthDay(days[6].date)}`;

  const Stat = ({ label, value, accent }) => (
    <div style={{ flex: 1, background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 12, padding: "14px 12px" }}>
      <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 26, lineHeight: 1, color: accent ? T.greenBright : T.cream, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.dimmer, marginTop: 6 }}>{label}</div>
    </div>
  );

  return (
    // Fixed and column-centered (the column flows with the document now; see
    // SettingsPanel). Keeps the seal scoped to the phone column on desktop.
    <div style={{ position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: APP_MAX, zIndex: 58, background: `linear-gradient(180deg, ${T.bg0} 0%, ${T.bg1} 78%)`, display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top, 0px)", animation: "gl-sealin .4s ease both", overflowY: "auto" }}>
      <div style={{ flex: "0 0 auto", padding: "16px 20px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Eyebrow size={11} color={T.greenBright}>Last week, sealed</Eyebrow>
        <Wordmark height={22} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "6px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontFamily: FF.body, fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em", color: T.cream }}>{conv} conversations</div>
          <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 12.5, color: T.dim, marginTop: 4 }}>{range}. {hit ? "Target cleared." : "Target missed, but the reps are logged."}</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Stat label="Conversations" value={conv} accent />
          <Stat label="Appointments" value={appt} />
          <Stat label="Content" value={content} />
        </div>

        <Card pad={15}>
          <Row label="Best day">{best}</Row>
          <Row label="Target">{hit ? <span style={{ color: T.greenBright }}>Hit</span> : <span style={{ color: T.dim }}>Missed</span>}</Row>
          <Row label="Current streak" last>{streak >= 1 ? <span style={{ color: streak >= 3 ? T.greenBright : T.cream }}>{streak} day{streak === 1 ? "" : "s"}</span> : <span style={{ color: T.dimmer }}>None yet</span>}</Row>
        </Card>

        <div onClick={exporting ? undefined : onExport} role="button" aria-label="Generate story card for last week"
          style={{ marginTop: 2, height: 54, borderRadius: 14, cursor: exporting ? "default" : "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", background: T.cream, color: T.bg1, opacity: exporting ? 0.7 : 1 }}>
          <span style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 15.5 }}>{exporting ? "Generating story card" : "Generate story card"}</span>
        </div>
        <div onClick={onDismiss} role="button" aria-label="Dismiss recap"
          style={{ height: 48, borderRadius: 14, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `inset 0 0 0 1px ${T.line}`, color: T.dim }}>
          <span style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 14 }}>Start this week</span>
        </div>
      </div>
    </div>
  );
}
