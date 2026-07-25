import { T, FF } from "./gl2Tokens";
import { Wordmark } from "./Gl2Primitives";
import { CONV_SUBS, APPT_SUBS, CONTENT_SUBS, sumKeys } from "./gl2Model";

// Geek Log 2.0 export card: Instagram Story, exactly 1080 x 1920. Raw weekly
// activity scoreboard only. HARD RULE (permanent): closings data must never be
// passed to, rendered in, or reachable from this component. Its props are the
// seven activity counters (via `week`) and the range label, nothing else. No
// closings, no target, no progress, no ratios.

function StoryBlock({ label, total, subs, week, numeral, cols, accent }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
        <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 27, letterSpacing: "0.20em", textTransform: "uppercase", color: accent ? T.green : T.dim, paddingBottom: 22 }}>{label}</div>
        <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: numeral, lineHeight: 0.86, color: accent ? T.greenBright : T.cream, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>{total}</div>
      </div>
      <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1, background: T.line }}>
        {subs.map((s) => (
          <div key={s.key} style={{ background: T.bg1, padding: "22px 4px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 44, lineHeight: 1, color: week[s.key] > 0 ? T.cream : "rgba(255,254,251,0.26)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{week[s.key]}</div>
            <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 19, letterSpacing: "0.10em", textTransform: "uppercase", color: T.dimmer }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoryCard({ week, rangeLabel }) {
  const conv = sumKeys(week, CONV_SUBS);
  const appt = sumKeys(week, APPT_SUBS);
  const content = sumKeys(week, CONTENT_SUBS);

  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: `linear-gradient(178deg, ${T.bg0} 0%, ${T.bg1} 58%, #0E0F11 100%)`, fontFamily: FF.body, color: T.cream, display: "flex", flexDirection: "column", padding: "104px 88px 76px", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: -180, bottom: -220, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,191,113,0.13) 0%, rgba(47,191,113,0) 68%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", flex: "0 0 auto" }}>
        <Wordmark height={64} />
        <div style={{ marginTop: 34, height: 1, background: T.line }} />
        <div style={{ marginTop: 30, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 25, letterSpacing: "0.22em", textTransform: "uppercase", color: T.cream }}>Weekly activity</div>
          <div style={{ fontWeight: 600, fontSize: 23, letterSpacing: "0.10em", textTransform: "uppercase", color: T.dim, fontVariantNumeric: "tabular-nums" }}>{rangeLabel}</div>
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 74, paddingTop: 20 }}>
        <StoryBlock label="Conversations" total={conv} subs={CONV_SUBS} week={week} numeral={252} cols={3} accent />
        <div style={{ height: 1, background: T.line }} />
        <StoryBlock label="Appointments" total={appt} subs={APPT_SUBS} week={week} numeral={168} cols={2} />
        <div style={{ height: 1, background: T.line }} />
        <StoryBlock label="Content" total={content} subs={CONTENT_SUBS} week={week} numeral={168} cols={2} />
      </div>

      <div style={{ position: "relative", flex: "0 0 auto", paddingTop: 40, borderTop: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ fontWeight: 600, fontSize: 21, color: T.dim, letterSpacing: "0.04em" }}>Nick Peters, NMLS #1119524</div>
            <div style={{ fontWeight: 500, fontSize: 19, color: T.dimmer, letterSpacing: "0.04em" }}>Rate corporate NMLS #2611</div>
            <div style={{ fontWeight: 500, fontSize: 19, color: T.dimmer, letterSpacing: "0.04em" }}>Equal Housing Opportunity</div>
          </div>
          <div style={{ fontWeight: 600, fontSize: 20, letterSpacing: "0.10em", textTransform: "uppercase", color: T.dimmer, whiteSpace: "nowrap" }}>mortgagegeek.ai</div>
        </div>
      </div>
    </div>
  );
}
