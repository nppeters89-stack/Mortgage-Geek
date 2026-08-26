import { useMemo } from "react";
import { T, FF } from "../gl2Tokens";
import { idFromPhone, soiQueue, touchesBy, referralsOf, lastTouchByTs, lastReferralTs, touchOverdue, producing, quadrantOf, DEFAULT_CONFIG } from "./prospectsModel";

// The desktop SOI cockpit (>= 900px), matching soi_cockpit_preview: a stat
// strip, then a 2x2 quadrant grid driven by two clocks per partner - last touch
// (what Nick did) and last referral (what the partner sent). NOT a drag board:
// cards place themselves from the derivations, and logging activity moves them.
// Preview's gold is byte-identical to T.amber; names are Figtree per the
// app-wide font pass (the preview predates it). Colors from gl2Tokens.

const DAY = 86400000;
const daysAgo = (ts) => (ts == null ? null : Math.round((Date.now() - ts) / DAY));
const rel = (ts) => {
  const d = daysAgo(ts);
  return d == null ? "Never" : d <= 0 ? "Today" : d === 1 ? "1d" : `${d}d`;
};

// Quadrant order matches the preview: 0 Producing & Connected, 1 Producing &
// Overdue, 2 Quiet & Connected, 3 Quiet & Drifting.
const QUADS = [
  { title: "Producing & Connected", hint: "Referring · maintain the rhythm", tone: "hum" },
  { title: "Producing & Overdue", hint: "They gave. You owe a touch. Today.", tone: "danger" },
  { title: "Quiet & Connected", hint: "Nurturing · referrals will come", tone: "neutral" },
  { title: "Quiet & Drifting", hint: "Fading · re-engage or accept it", tone: "drift" },
];

const toneColor = { hum: T.green, danger: T.redLift, drift: T.amber, neutral: T.dim };
const toneBorder = {
  hum: "rgba(47,191,113,0.35)",
  danger: "rgba(226,87,91,0.55)",
  drift: "rgba(201,162,58,0.4)",
  neutral: T.line,
};

// Mobile priority order per the preview: owe a thank you, drifting, producing &
// connected, quiet & connected. Empty groups are omitted by the caller.
export const SOI_GROUPS = [
  { qi: 1, label: "Owe a thank you", tone: "danger" },
  { qi: 3, label: "Drifting", tone: "drift" },
  { qi: 0, label: "Producing & connected", tone: "hum" },
  { qi: 2, label: "Quiet & connected", tone: "neutral" },
];
export const soiGroupColor = (tone) => toneColor[tone] || T.dim;

// Card content shared by the quadrant cards and the mobile rows: name (with the
// RAC check), gold stars for lifetime referrals (capped at five), brokerage,
// and the two timer chips.
function Timer({ value, tone, label }) {
  const color = tone === "bad" ? T.redLift : tone === "ok" ? T.green : tone === "gold" ? T.amber : T.faint;
  return (
    <div style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 8px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color }}>{value}</div>
      <div style={{ fontSize: 9, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{label}</div>
    </div>
  );
}

export function SoiPartnerContent({ prospect: p, touches, config, inRac, nameSize = 16.5 }) {
  const lt = lastTouchByTs(touches);
  const lr = lastReferralTs(touches);
  const n = referralsOf(touches).length;
  const tBad = touchOverdue(touches, config);
  const rGold = producing(touches, config);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <span style={{ fontFamily: FF.body, fontWeight: 600, fontSize: nameSize, lineHeight: 1.2, color: T.cream, minWidth: 0, overflowWrap: "break-word" }}>{p.name} {"🤝"}</span>
        {inRac && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="In RAC" style={{ flex: "none" }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
        {n > 0 && <span style={{ flex: "none", color: T.amber, fontSize: 11, letterSpacing: 1 }}>{"★".repeat(Math.min(n, 5))}</span>}
      </div>
      <div style={{ fontSize: 11.5, color: T.dim, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Timer value={rel(lt)} tone={tBad ? "bad" : "ok"} label="Last touch" />
        <Timer value={rel(lr)} tone={lr == null ? "dim" : rGold ? "gold" : "dim"} label="Last referral" />
      </div>
    </>
  );
}

export function SoiCockpit({ prospects, soi, followUps, config, racSet, onOpenDetail, onOpenFollowUps }) {
  const members = useMemo(() => soiQueue(prospects, soi, followUps), [prospects, soi, followUps]);

  const byQuad = useMemo(() => {
    const cols = [[], [], [], []];
    members.forEach((p) => cols[quadrantOf(followUps[idFromPhone(p.phone)] || [], config)].push(p));
    // Oldest touch first within a quadrant: the most neglected lead the list.
    cols.forEach((c) => c.sort((a, b) => (lastTouchByTs(followUps[idFromPhone(a.phone)]) || 0) - (lastTouchByTs(followUps[idFromPhone(b.phone)]) || 0)));
    return cols;
  }, [members, followUps, config]);

  const stats = useMemo(() => {
    const quietMs = (config.refQuietDays ?? DEFAULT_CONFIG.refQuietDays) * DAY;
    const refs90 = members.reduce((n, p) => n + referralsOf(followUps[idFromPhone(p.phone)] || []).filter((t) => Date.now() - t.ts < quietMs).length, 0);
    const gaps = members.map((p) => daysAgo(lastTouchByTs(followUps[idFromPhone(p.phone)] || []))).filter((d) => d != null);
    const avg = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0;
    return { total: members.length, refs90, owe: byQuad[1].length, avg };
  }, [members, followUps, byQuad, config]);

  const card = (p) => {
    const id = idFromPhone(p.phone);
    return (
      <div key={id} onClick={() => onOpenDetail(id)}
        style={{ boxSizing: "border-box", flex: "0 0 236px", minWidth: 0, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 13px", cursor: "pointer" }}>
        <SoiPartnerContent prospect={p} touches={followUps[id] || []} config={config} inRac={racSet.has(id)} />
      </div>
    );
  };

  return (
    // Full-bleed tab, centered content: the cockpit caps at 1440 and centers,
    // so ultrawide screens frame the quadrants instead of stretching them.
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "18px 26px 40px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Sphere of Influence</h1>
        <button type="button" onClick={onOpenFollowUps}
          style={{ fontSize: 13, color: T.dim, background: "none", border: `1px solid ${T.line}`, borderRadius: 999, padding: "7px 14px", cursor: "pointer", fontFamily: FF.body }}>
          ← Follow Up Cockpit
        </button>
      </div>

      {/* Stat strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <Stat label="Partners">{stats.total}</Stat>
        <Stat label={`Referrals ${config.refQuietDays ?? DEFAULT_CONFIG.refQuietDays}d`} color={T.amber}>{stats.refs90}</Stat>
        <Stat label="Owe a thank you" color={T.redLift}>{stats.owe}</Stat>
        <Stat label="Avg since touch">{stats.avg}d</Stat>
      </div>

      <div style={{ fontSize: 12.5, color: T.faint, marginBottom: 12 }}>Cards place themselves by the two clocks: last touch and last referral. Nobody gets dragged; log activity and they move on their own. Top right is always today's call list.</div>

      {/* Axis labels + 2x2 quadrant grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.faint, textAlign: "center" }}>Touched within {config.touchOverdueDays ?? DEFAULT_CONFIG.touchOverdueDays} days</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.faint, textAlign: "center" }}>No touch in {config.touchOverdueDays ?? DEFAULT_CONFIG.touchOverdueDays}+ days</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {QUADS.map((q, qi) => (
          <div key={qi} style={{ boxSizing: "border-box", border: `1px solid ${toneBorder[q.tone]}`, boxShadow: q.tone === "danger" ? "inset 0 0 0 1px rgba(226,87,91,0.15)" : "none", borderRadius: 16, background: T.colWash, minHeight: 230, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "13px 16px 10px", borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: toneColor[q.tone] }}>{q.title}</span>
              <span style={{ fontSize: 11, color: T.faint }}>{q.hint}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 12, alignContent: "flex-start", flex: 1 }}>
              {byQuad[qi].length === 0 ? (
                <div style={{ fontSize: 12, color: T.faint, padding: "8px 6px" }}>{qi === 1 ? "Nobody here. That is the goal." : "Empty."}</div>
              ) : byQuad[qi].map((p) => card(p))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, children, color = "inherit" }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 16px", minWidth: 130 }}>
      <div style={{ fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums", color }}>{children}</div>
      <div style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{label}</div>
    </div>
  );
}
