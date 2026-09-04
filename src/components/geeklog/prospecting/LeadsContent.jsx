import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toPng, getFontEmbedCSS } from "html-to-image";
import { T, FF, staleColor, staleWash, stageRampColor, whaleRampColor } from "../gl2Tokens";
import { LEAD_PIPELINE, trackOf } from "./pipelines";
import { leadInfo, leadPlaceLabel, expiryDaysLeft, attemptsOf, ATTEMPTING } from "./leadsModel";
import { idFromPhone, repliesOf, lastReplyTs, lastTouchTs, e164Phone, REPLY_STAGE } from "./prospectsModel";
import { getCachedLeads, loadLeads, persistLeadTouch, persistLead, persistLeadStatus, deleteLead } from "./leadStore";
import { getCachedProspects, loadProspects, persistFire, setCachedFire, persistFollowUps, persistManualContact, persistSoi, persistSoiCategory } from "./prospectStore";
import { SOI_CATEGORIES, soiCategoryOf, soiReportDayOf } from "./prospectsModel";
import { ReplyBadge } from "./ReplyBadge";
import { ReplyDateDialog, LoggedDatePicker, todayLocalISO, tsForLoggedDate } from "./LoggedDatePicker";
import { startText } from "./textIntent";
import { copyText } from "./clipboard";
import { StatusBarCap, Toast } from "./ProspectingContent";
import { ChipRow } from "./ChipFields";
import { LEAD_OBJECTIONS, LEAD_TIMELINE } from "./chips";
import { assembleReferrerReport, leadFunnel } from "./leadReport";
import { LeadReportCard } from "./LeadReportCard";
import { useIsMobile } from "../../../utils/hooks";

// Leads tab: the consumer lead pipeline, running the same engine as the agent
// board through LEAD_PIPELINE. Mobile renders a filtered list; desktop (via
// the cockpit's Agents | Leads switcher) renders the linear board with the
// status tracks after App Complete, the way SOI sits after the agent board.
// Data rule enforced by the entry form: a lead is name, mobile, email,
// account, source note, stage and short next-step notes. Nothing else.

const dSince = (ts) => (ts ? Math.floor((Date.now() - ts) / 86400000) : null);
// Accent hex at 14% alpha for the rail's lit-tab background (same treatment
// as the agent cockpit rail).
const wash14 = (hex) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},0.14)`;
const SEND = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" />
  </svg>
);
const BUBBLE = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export function LeadsContent({ apiKey, openLeadId = null, onOpenConsumed = null }) {
  const seed = getCachedLeads();
  const [contacts, setContacts] = useState(() => seed?.contacts || {});
  const [fu, setFu] = useState(() => seed?.fu || {});
  const [status, setStatus] = useState(() => seed?.status || {});
  // Referral sources are SOI members; the agent cache is the registry.
  const [agent, setAgent] = useState(() => getCachedProspects());
  const [fire, setFire] = useState(() => getCachedProspects()?.fire || []);
  const [ready, setReady] = useState(!!seed);
  const [filter, setFilter] = useState(null); // null | "due" | "attempting" | "owed" | accountId
  const [openId, setOpenId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [replyFor, setReplyFor] = useState(null);
  const [reportFor, setReportFor] = useState(null); // assembled report being exported
  const reportRef = useRef(null);
  const dragRef = useRef(null); // lead id mid-drag
  const [over, setOver] = useState(null); // highlighted drop key
  const [toast, setToast] = useState("");
  const isNarrow = useIsMobile(899);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadLeads(apiKey).then((c) => {
      if (cancelled) return;
      setContacts(c.contacts); setFu(c.fu); setStatus(c.status); setReady(true);
    }).catch(() => setReady(true));
    if (!getCachedProspects()) loadProspects(apiKey).then((c) => { if (!cancelled) setAgent(c); }).catch(() => {});
    else setAgent(getCachedProspects());
    return () => { cancelled = true; };
  }, [apiKey]);

  useEffect(() => {
    if (openLeadId) { setOpenId(openLeadId); onOpenConsumed?.(); }
  }, [openLeadId, onOpenConsumed]);

  const infoOf = useCallback((id) => leadInfo(fu[id], status[id], Date.now(), contacts[id]?.stageOverride || null), [fu, status, contacts]);
  const fireSet = useMemo(() => new Set(fire), [fire]);

  const leads = useMemo(() => Object.entries(contacts).map(([id, c]) => ({ id, ...c })), [contacts]);
  const owedOf = useCallback((id) => lastReplyTs(fu[id]) > (lastTouchTs(fu[id]) || 0), [fu]);

  const counts = useMemo(() => ({
    due: leads.filter((l) => infoOf(l.id).due).length,
    attempting: leads.filter((l) => { const i = infoOf(l.id); return i.place.type === "stage" && i.place.index === ATTEMPTING; }).length,
    owed: leads.filter((l) => owedOf(l.id)).length,
  }), [leads, infoOf, owedOf]);

  const visible = useMemo(() => {
    let pool = leads;
    if (filter === "due") pool = pool.filter((l) => infoOf(l.id).due);
    else if (filter === "attempting") pool = pool.filter((l) => { const i = infoOf(l.id); return i.place.type === "stage" && i.place.index === ATTEMPTING; });
    else if (filter === "owed") pool = pool.filter((l) => owedOf(l.id));
    else if (filter) pool = pool.filter((l) => l.referredBy === filter);
    return [...pool].sort((a, b) => {
      const ia = infoOf(a.id), ib = infoOf(b.id);
      if (ia.due !== ib.due) return ia.due ? -1 : 1;
      return (ia.dueTs || Infinity) - (ib.dueTs || Infinity);
    });
  }, [leads, filter, infoOf, owedOf]);

  // ----- writes -----
  const logTouch = useCallback((id, touch) => {
    const next = [...(fu[id] || []), touch];
    setFu((prev) => ({ ...prev, [id]: next }));
    persistLeadTouch(apiKey, id, next).catch(() => showToast("Save failed"));
  }, [apiKey, fu, showToast]);

  const logAttempt = useCallback((id, ts) => {
    logTouch(id, { ts: Number.isFinite(ts) ? ts : Date.now(), note: "", stage: ATTEMPTING, type: "attempt" });
    showToast("Attempt logged");
  }, [logTouch, showToast]);

  const logReply = useCallback((id, ts) => {
    logTouch(id, { ts: Number.isFinite(ts) ? ts : Date.now(), note: "", stage: REPLY_STAGE });
    showToast("Reply logged");
  }, [logTouch, showToast]);

  const setTrack = useCallback((id, track, expiryTs) => {
    setStatus((prev) => {
      const next = { ...prev };
      if (track) next[id] = { track, ts: Date.now(), ...(expiryTs ? { expiryTs } : {}) };
      else delete next[id];
      return next;
    });
    persistLeadStatus(apiKey, id, track, expiryTs).catch(() => showToast("Save failed"));
    showToast(track ? `Track: ${trackOf(track)?.label || track}` : "Back on the board");
  }, [apiKey, showToast]);

  const toggleFire = useCallback((id) => {
    const cur = getCachedProspects()?.fire || [];
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    setFire(next);
    setCachedFire(next);
    persistFire(apiKey, id, cur.includes(id) ? "remove" : "add").catch(() => { setFire(cur); setCachedFire(cur); });
  }, [apiKey]);

  // ----- board drag: placements and track drops, agent-board semantics -----
  const moveToStage = useCallback((si) => {
    const id = dragRef.current;
    if (!id) return;
    const cur = leadInfo(fu[id], status[id], Date.now(), contacts[id]?.stageOverride || null);
    if (cur.place.type === "stage" && cur.place.index === si) return;
    if (cur.place.type === "track") {
      setStatus((prev) => { const next = { ...prev }; delete next[id]; return next; });
      persistLeadStatus(apiKey, id, "", undefined).catch(() => {});
    }
    const next = { ...contacts[id], stageOverride: { s: si, ts: Date.now() } };
    setContacts((p) => ({ ...p, [id]: next }));
    persistLead(apiKey, next).catch(() => showToast("Move failed"));
    showToast(`Moved to ${LEAD_PIPELINE.stages[si].label}`);
  }, [apiKey, contacts, fu, status, showToast]);

  const moveToTrack = useCallback((tid) => {
    const id = dragRef.current;
    if (!id) return;
    if (status[id]?.track === tid) return;
    setTrack(id, tid, undefined);
  }, [status, setTrack]);

  const dropProps = (key, onDrop) => ({
    onDragOver: (e) => { e.preventDefault(); if (over !== key) setOver(key); },
    onDragLeave: () => setOver(null),
    onDrop: (e) => { e.preventDefault(); setOver(null); onDrop(); dragRef.current = null; },
  });

  const handleText = useCallback((lead) => {
    const info = infoOf(lead.id);
    const stageIdx = info.place.type === "stage" ? info.place.index : 5;
    const r = startText({ prospect: lead, stage: stageIdx, pipeline: LEAD_PIPELINE });
    if (!r.ok) { showToast("No valid mobile number"); return; }
    if (r.mode === "copy") copyText(r.body).then(() => showToast(`Message copied. Text ${r.number}`), () => showToast("Copy failed"));
  }, [infoOf, showToast]);

  // Off-screen report card to PNG, the same path the week story uses. The
  // payload is assembled note-free before anything renders.
  const exportReport = useCallback(async (member) => {
    const report = assembleReferrerReport({ member, contacts, fu, status });
    setReportFor(report);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (document.fonts?.ready) await document.fonts.ready;
      const node = reportRef.current;
      if (!node) throw new Error("no report node");
      const fontEmbedCSS = await getFontEmbedCSS(node);
      const height = Math.max(1350, node.scrollHeight);
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: T.bg1, fontEmbedCSS, width: 1080, height, canvasWidth: 1080, canvasHeight: height });
      const link = document.createElement("a");
      link.download = `lead-report-${member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${todayLocalISO()}.png`;
      link.href = dataUrl;
      link.click();
      showToast("Report exported");
    } catch {
      showToast("Export failed");
    } finally {
      setReportFor(null);
    }
  }, [contacts, fu, status, showToast]);

  // ----- referral sources: SOI members, from the agent cache -----
  const referrers = useMemo(() => {
    const soi = agent?.soi || {};
    const byId = new Map((agent?.prospects || []).map((p) => [idFromPhone(p.phone), p]));
    const list = Object.keys(soi).map((id) => {
      const p = byId.get(id);
      return { id, name: p?.name || id, brokerage: p?.brokerage || "", category: soiCategoryOf(soi[id]), reportDay: soiReportDayOf(soi[id]) };
    });
    const rank = (c) => (c === "builder_agent" || c === "retail_agent" ? 0 : 1);
    return list.sort((a, b) => rank(a.category) - rank(b.category) || a.name.localeCompare(b.name));
  }, [agent]);
  const referrerName = useCallback((id) => referrers.find((r) => r.id === id)?.name || "", [referrers]);

  // Rails come from the mode declaration, not hardcoded component logic.
  const railChips = LEAD_PIPELINE.mode.rails.flatMap((key) => {
    if (key === "due") return [{ key: "due", label: `Due today ${counts.due}` }];
    if (key === "attempting") return [{ key: "attempting", label: `Attempting ${counts.attempting}` }];
    if (key === "owed") return [{ key: "owed", label: `Owed a response ${counts.owed}` }];
    if (key === "referrers") return [...new Set(leads.map((l) => l.referredBy).filter(Boolean))].map((id) => ({ key: id, label: referrerName(id) || "Unknown" }));
    return [];
  });

  // Funnel stat strip, ordered by the mode declaration.
  const funnel = useMemo(() => {
    const rows = leadFunnel(leads, fu, status);
    return LEAD_PIPELINE.mode.statStrip.map((label) => rows.find((r) => r.label === label)).filter(Boolean);
  }, [leads, fu, status]);
  const funnelStrip = isNarrow && leads.length > 0 && (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8 }}>
      {funnel.map((f) => (
        <div key={f.label} style={{ flex: "1 0 100px", minWidth: 100, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: "9px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: T.cream, fontVariantNumeric: "tabular-nums" }}>
            {f.total}{f.week > 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: T.greenBright }}> +{f.week}</span>}
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.dimmer, marginTop: 3 }}>{f.label}</div>
        </div>
      ))}
    </div>
  );

  const rail = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "10px 0" }}>
      {railChips.map((c) => {
        const on = filter === c.key;
        return (
          <button key={c.key} type="button" onClick={() => setFilter(on ? null : c.key)}
            style={{ flex: "none", fontSize: 12.5, fontWeight: on ? 700 : 500, color: on ? T.bg1 : T.dim, border: `1px solid ${on ? T.cream : T.line}`, borderRadius: 999, padding: "7px 13px", background: on ? T.cream : "none", fontFamily: FF.body, cursor: "pointer" }}>
            {c.label}
          </button>
        );
      })}
      <span style={{ flex: 1 }} />
      <button type="button" onClick={() => setAcctOpen(true)}
        style={{ flex: "none", fontSize: 12.5, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 999, padding: "7px 13px", background: "none", fontFamily: FF.body, cursor: "pointer" }}>
        Reports
      </button>
      <button type="button" onClick={() => setFormOpen(true)}
        style={{ flex: "none", fontSize: 12.5, fontWeight: 700, color: T.cream, border: "none", borderRadius: 999, padding: "7px 15px", background: T.green, fontFamily: FF.body, cursor: "pointer" }}>
        New Lead
      </button>
    </div>
  );

  const leadCard = (lead) => {
    const id = lead.id;
    const info = infoOf(id);
    const days = dSince(info.sinceTs);
    const wash = info.dueDays == null ? null : staleWash(days, info.dueDays);
    const replies = repliesOf(fu[id]);
    const rTs = lastReplyTs(fu[id]);
    const exp = expiryDaysLeft(info);
    const canText = !!e164Phone(lead.phone);
    return (
      <div key={id} role="button" tabIndex={0} onClick={() => setOpenId(id)}
        draggable={!isNarrow} onDragStart={() => { dragRef.current = id; }} onDragEnd={() => { dragRef.current = null; setOver(null); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(id); } }}
        style={{ boxSizing: "border-box", width: "100%", maxWidth: isNarrow ? "none" : 210, backgroundColor: T.surface, backgroundImage: wash ? `linear-gradient(0deg, ${wash}, ${wash})` : "none", border: `1px solid ${fireSet.has(id) ? T.orangeWashLine : T.line}`, borderRadius: 11, padding: "11px 13px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <span style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 15.5, lineHeight: 1.2, color: T.cream, minWidth: 0, overflowWrap: "break-word" }}>
            {lead.name}{fireSet.has(id) ? " 🔥" : ""}
          </span>
          <ReplyBadge count={replies.length} days={rTs ? dSince(rTs) : null} owed={rTs > (lastTouchTs(fu[id]) || 0)} />
        </div>
        <div style={{ fontSize: 11, color: T.dim, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{referrerName(lead.referredBy)}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 8, fontSize: 10.5, color: T.faint }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {leadPlaceLabel(info)}{info.place.type === "stage" && info.place.index === ATTEMPTING ? ` · ${attemptsOf(fu[id])} of ${LEAD_PIPELINE.attemptCap}` : ""}{exp != null ? ` · expires ${exp}d` : ""}
          </span>
          <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 6 }}>
            {canText && (
              <button type="button" title="Text them" aria-label={`Text ${lead.name}`}
                onClick={(e) => { e.stopPropagation(); handleText(lead); }}
                style={{ flex: "none", background: "none", border: "none", padding: 2, cursor: "pointer", color: T.dim, display: "inline-flex" }}>
                {SEND}
              </button>
            )}
            <button type="button" title="They replied" aria-label={`They replied: ${lead.name}`}
              onClick={(e) => { e.stopPropagation(); setReplyFor({ id, name: lead.name }); }}
              style={{ flex: "none", background: "none", border: "none", padding: 2, cursor: "pointer", color: T.dim, display: "inline-flex" }}>
              {BUBBLE}
            </button>
            <span style={{ color: info.dueDays == null ? T.faint : staleColor(days, T.faint, info.dueDays), fontVariantNumeric: "tabular-nums" }}>
              {days == null ? "never" : `${days}d`}
            </span>
          </span>
        </div>
      </div>
    );
  };

  // Desktop board: linear stages then status tracks, one horizontal run.
  const board = useMemo(() => {
    const stageCols = LEAD_PIPELINE.stages.map(() => []);
    const trackCols = Object.fromEntries(LEAD_PIPELINE.tracks.map((t) => [t.id, []]));
    for (const lead of visible) {
      const info = infoOf(lead.id);
      if (info.place.type === "track") trackCols[info.place.track]?.push(lead);
      else stageCols[info.place.index].push(lead);
    }
    return { stageCols, trackCols };
  }, [visible, infoOf]);

  const colShell = (border) => ({ boxSizing: "border-box", flex: "1 0 200px", minWidth: 200, maxWidth: 240, border: `1px solid ${border || T.line}`, borderRadius: 12, display: "flex", flexDirection: "column" });
  const colBody = { display: "flex", flexDirection: "column", gap: 8, padding: 10, minHeight: 56, maxHeight: "52vh", overflowY: "auto" };

  // Agent-board style column: ramp dash plus label in the ramp color.
  const column = (label, ramp, items, border, drop) => (
    <div key={label} style={{ ...colShell(border), outline: drop && over === drop.key ? `2px solid ${T.line}` : "none" }}
      {...(drop ? dropProps(drop.key, drop.onDrop) : {})}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderBottom: `1px solid ${border || T.line}` }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <span style={{ flex: "none", width: 14, height: 5, borderRadius: 3, background: ramp }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: ramp, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        </span>
        <span style={{ fontSize: 12, color: T.faint, fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
      </div>
      <div style={colBody}>{items.map(leadCard)}</div>
    </div>
  );

  const openLead = openId ? { id: openId, ...(contacts[openId] || {}) } : null;

  // Lead cockpit diagnostics: the Triage HUD shape with lead data points.
  const oldestDue = useMemo(() => {
    const dues = leads.map((l) => infoOf(l.id)).filter((i) => i.due && i.sinceTs);
    if (!dues.length) return null;
    return Math.max(...dues.map((i) => Math.floor((Date.now() - i.sinceTs) / 86400000)));
  }, [leads, infoOf]);
  const railSegs = [
    { key: "due", glyph: "◗", label: "Due today", accent: T.redLift, count: counts.due },
    { key: "attempting", glyph: "☎", label: "Attempting", accent: T.amber, count: counts.attempting },
    { key: "owed", glyph: "💬", label: "Owed a response", accent: T.greenBright, count: counts.owed },
    ...[...new Set(leads.map((l) => l.referredBy).filter(Boolean))].map((id) => ({
      key: id, glyph: "🤝", label: referrerName(id) || "Unknown", accent: T.whale,
      count: leads.filter((l) => l.referredBy === id).length,
    })),
  ];
  const leadsHud = !isNarrow && (
    <div style={{ fontFamily: FF.body, margin: "10px 0 2px" }}>
      <div style={{ width: "fit-content", maxWidth: "100%", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden", display: "grid", gridTemplateColumns: "280px auto 250px" }}>
        <div style={{ padding: "14px 18px 15px", borderRight: `1px solid ${T.line}`, background: T.redWash, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.redLift }}>Needs you now</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 0.85, fontVariantNumeric: "tabular-nums", color: counts.due > 0 ? T.redLift : T.dim }}>{counts.due}</div>
            <div style={{ paddingBottom: 3, fontSize: 12, lineHeight: 1.35, color: T.dim }}>leads past<br />their clock</div>
          </div>
          <div style={{ fontSize: 11.5, color: T.dim }}>
            {counts.attempting} attempting · {counts.owed} owed a response{oldestDue != null ? ` · oldest ${oldestDue}d` : ""}
          </div>
        </div>
        <div style={{ padding: "14px 18px 15px", borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.greenBright }}>Funnel</div>
          <div style={{ display: "flex", gap: 16 }}>
            {funnel.map((f) => (
              <div key={f.label} style={{ minWidth: 62, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.cream, fontVariantNumeric: "tabular-nums" }}>
                  {f.total}{f.week > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: T.greenBright }}> +{f.week}</span>}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.dimmer, marginTop: 3, lineHeight: 1.3 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 18px 15px", display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dim }}>Post-app</div>
          <div style={{ fontSize: 11.5, color: T.dim, lineHeight: 1.8 }}>
            <span style={{ color: T.whale }}>{board.trackCols.preapproved.length} pre-approved</span><br />
            <span style={{ color: whaleRampColor(3, 4) }}>{board.trackCols.under_contract.length} under contract</span><br />
            <span style={{ color: T.faint }}>{"💀"} {board.trackCols.dead.length}</span>
          </div>
        </div>
      </div>
      {/* Docked filter rail, welded under the grid like the agent cockpit. */}
      <div role="group" aria-label="Filter the lead board"
        style={{ borderTop: `1px solid ${T.line}`, background: "rgba(255,254,251,0.02)", display: "flex", alignItems: "stretch" }}>
        <div style={{ padding: "0 16px", display: "flex", alignItems: "center", borderRight: `1px solid ${T.line}`, fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.dimmer, whiteSpace: "nowrap" }}>
          Filter the board
        </div>
        {railSegs.map((seg) => {
          const active = filter === seg.key;
          const off = !seg.count;
          return (
            <button key={seg.key} type="button" disabled={off} aria-pressed={active}
              onClick={() => setFilter(active ? null : seg.key)}
              style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", border: "none", borderRight: `1px solid ${T.line}`, borderTop: `2px solid ${active ? seg.accent : "transparent"}`, background: active ? wash14(seg.accent) : "rgba(255,254,251,0.02)", cursor: off ? "default" : "pointer", fontFamily: FF.body, opacity: off ? 0.45 : 1 }}>
              <span aria-hidden="true" style={{ flex: "none", fontSize: 11, color: active ? seg.accent : T.dimmer }}>{seg.glyph}</span>
              <span style={{ fontSize: 12.5, color: active ? seg.accent : T.dim, fontWeight: active ? 700 : 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{seg.label}</span>
              <span style={{ flex: "none", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: active ? seg.accent : T.dimmer }}>{seg.count}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => setFilter(null)}
          style={{ flex: "none", padding: "0 14px", border: "none", background: "none", fontSize: 12, color: T.dimmer, cursor: "pointer", fontFamily: FF.body, whiteSpace: "nowrap" }}>
          All {leads.length} ✕
        </button>
        <button type="button" onClick={() => setAcctOpen(true)}
          style={{ flex: "none", padding: "0 14px", border: "none", borderLeft: `1px solid ${T.line}`, background: "none", fontSize: 12, fontWeight: 700, color: T.dim, cursor: "pointer", fontFamily: FF.body, whiteSpace: "nowrap" }}>
          Reports
        </button>
        <button type="button" onClick={() => setFormOpen(true)}
          style={{ flex: "none", margin: 7, border: "none", borderRadius: 999, padding: "0 15px", background: T.green, color: T.cream, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FF.body, whiteSpace: "nowrap" }}>
          New Lead
        </button>
      </div>
    </div>
  );

  const body = (
    <>
      {leadsHud}
      {funnelStrip}
      {isNarrow && rail}
      {!ready ? (
        <div style={{ textAlign: "center", color: T.faint, padding: "50px 30px", fontSize: 14 }}>Loading…</div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: "center", color: T.faint, padding: "50px 30px", fontSize: 14, lineHeight: 1.6 }}>
          No leads yet. Add an account, then your first lead.
        </div>
      ) : isNarrow ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{visible.map(leadCard)}</div>
      ) : (
        <>
          {/* Main lead pipeline: same red-to-yellow ramp as the agent board. */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto", paddingBottom: 16 }}>
            {LEAD_PIPELINE.stages.map((st, i) => column(st.label, stageRampColor(i, LEAD_PIPELINE.stages.length), board.stageCols[i], undefined, { key: `s${i}`, onDrop: () => moveToStage(i) }))}
          </div>

          {/* Post-app tracks: the whale palette, Pre-Approved through Under
              Contract. Under Contract is a number, not cards; Closed has no
              column at all (it lives in the funnel). */}
          <details open style={{ margin: "2px 0 14px", border: `1px solid ${T.whaleWashLine}`, borderRadius: 14, overflow: "hidden" }}>
            <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer", background: T.whaleWash }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.whale }}>Post-App Pipeline · {["preapproved", "not_yet", "nurture", "under_contract"].reduce((n, t) => n + board.trackCols[t].length, 0)}</span>
              <span style={{ fontSize: 11.5, color: T.faint }}>Pre-approval through contract. Under contract counts itself; closings live in the funnel.</span>
            </summary>
            <div style={{ display: "flex", gap: 12, padding: 12, overflowX: "auto", alignItems: "flex-start" }}>
              {["preapproved", "not_yet", "nurture"].map((tid, i) => {
                const t = trackOf(tid);
                return column(t.label, whaleRampColor(i, 4), board.trackCols[tid], T.whaleWashLine, { key: `t${tid}`, onDrop: () => moveToTrack(tid) });
              })}
              <div key="uc" style={{ ...colShell(T.whaleWashLine), outline: over === "tuc" ? `2px solid ${T.line}` : "none" }} {...dropProps("tuc", () => moveToTrack("under_contract"))}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", borderBottom: `1px solid ${T.whaleWashLine}` }}>
                  <span style={{ flex: "none", width: 14, height: 5, borderRadius: 3, background: whaleRampColor(3, 4) }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: whaleRampColor(3, 4) }}>Under Contract</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "26px 14px 28px" }}>
                  <span aria-hidden="true" style={{ fontSize: 24, lineHeight: 1 }}>{"🏡"}</span>
                  <span style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, color: whaleRampColor(3, 4), fontVariantNumeric: "tabular-nums" }}>{board.trackCols.under_contract.length}</span>
                  <span style={{ fontSize: 11, color: T.dim }}>under contract</span>
                </div>
              </div>
            </div>
          </details>

          {/* Dead box. */}
          <details style={{ margin: "0 0 14px", border: `1px solid ${over === "tdead" ? T.redWashLine : T.line}`, borderRadius: 14, overflow: "hidden", background: over === "tdead" ? T.redWash : "transparent" }} {...dropProps("tdead", () => moveToTrack("dead"))}>
            <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer" }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.faint }}>{"💀"} Dead · {board.trackCols.dead.length}</span>
              <span style={{ fontSize: 11.5, color: T.faint }}>Open one to revive it.</span>
            </summary>
            <div style={{ padding: "4px 14px 12px" }}>
              {board.trackCols.dead.length === 0 ? (
                <div style={{ fontSize: 12, color: T.faint, padding: "6px 2px" }}>Nobody here.</div>
              ) : board.trackCols.dead.map((lead) => (
                <button key={lead.id} type="button" onClick={() => setOpenId(lead.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${T.lineSoft}`, padding: "9px 4px", cursor: "pointer", fontFamily: FF.body }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: T.dim }}>{lead.name}</span>
                  <span style={{ fontSize: 11.5, color: T.faint }}>{referrerName(lead.referredBy)}</span>
                </button>
              ))}
            </div>
          </details>
        </>
      )}

      {openLead && openLead.name && (
        <LeadDetail lead={openLead} touches={fu[openId] || []} info={infoOf(openId)} accountLabel={referrerName(openLead.referredBy)}
          isFire={fireSet.has(openId)} onToggleFire={() => toggleFire(openId)}
          onClose={() => setOpenId(null)}
          onLogTouch={(touch) => logTouch(openId, touch)}
          onLogAttempt={(ts) => logAttempt(openId, ts)}
          onSetTrack={(track, expiryTs) => setTrack(openId, track, expiryTs)}
          onText={() => handleText(openLead)}
          onSaveNote={(note) => { const next = { ...contacts[openId], note }; setContacts((p) => ({ ...p, [openId]: next })); persistLead(apiKey, next).catch(() => showToast("Save failed")); }}
          onSaveTimeline={(timeline) => { const next = { ...contacts[openId], timeline }; setContacts((p) => ({ ...p, [openId]: next })); persistLead(apiKey, next).catch(() => showToast("Save failed")); }}
          onDelete={() => { deleteLead(apiKey, openId); setContacts((p) => { const n = { ...p }; delete n[openId]; return n; }); setOpenId(null); showToast("Lead deleted"); }}
          isNarrow={isNarrow} />
      )}

      {formOpen && (
        <NewLeadForm referrers={referrers} apiKey={apiKey}
          onClose={() => setFormOpen(false)}
          onSaved={(contact) => {
            const id = idFromPhone(contact.phone);
            setContacts((p) => ({ ...p, [id]: contact }));
            setFormOpen(false);
            showToast("Lead added");
            // Referral side effect: a stage -3 touch on the referring SOI
            // member's existing history, so the producing clock and Owe a
            // Thank You update with zero new logic.
            const parts = String(contact.name || "").trim().split(/\s+/);
            const label = `lead: ${parts[0] || ""} ${parts.length > 1 ? parts[parts.length - 1][0] + "." : ""}`.trim();
            const agentFu = getCachedProspects()?.followUps?.[contact.referredBy] || [];
            persistFollowUps(apiKey, contact.referredBy, [...agentFu, { ts: Date.now(), note: label, stage: -3 }]).catch(() => {});
            setAgent(getCachedProspects());
          }}
          onSoiAdded={() => setAgent({ ...getCachedProspects() })}
          onToast={showToast} />
      )}
      {acctOpen && (
        <ReferrerReports referrers={referrers} leads={leads} apiKey={apiKey}
          onClose={() => setAcctOpen(false)} onReport={(m) => exportReport(m)} onToast={showToast}
          onDaySet={() => setAgent({ ...getCachedProspects() })} />
      )}
      {reportFor && (
        <div aria-hidden="true" style={{ position: "fixed", left: -12000, top: 0 }}>
          <div ref={reportRef}><LeadReportCard report={reportFor} /></div>
        </div>
      )}
      {replyFor && (
        <ReplyDateDialog name={replyFor.name} onClose={() => setReplyFor(null)} onSave={(ts) => logReply(replyFor.id, ts)} />
      )}
      <Toast msg={toast} />
    </>
  );

  if (isNarrow) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <StatusBarCap />
        <header style={{ padding: "2px 20px 0" }}>
          <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Leads</h1>
        </header>
        <div style={{ flex: 1, padding: "0 20px 20px" }}>{body}</div>
      </div>
    );
  }
  return <div style={{ padding: "2px 26px 40px" }}>{body}</div>;
}

// ---------- detail ----------
function LeadDetail({ lead, touches, info, accountLabel, isFire, onToggleFire, onClose, onLogTouch, onLogAttempt, onSetTrack, onText, onSaveNote, onSaveTimeline, onDelete, isNarrow }) {
  const [note, setNote] = useState("");
  const [stageSel, setStageSel] = useState(() => (info.place.type === "stage" ? Math.min(info.place.index + 1, 5) : 5));
  const [loggedOn, setLoggedOn] = useState(() => todayLocalISO());
  const [talked, setTalked] = useState(false);
  const [objections, setObjections] = useState([]);
  const [timeline, setTimeline] = useState(lead.timeline || "");
  const [nextStep, setNextStep] = useState(lead.note || "");
  const [expiry, setExpiry] = useState("");
  const history = [...touches].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const exp = expiryDaysLeft(info);

  const save = () => {
    const text = note.trim();
    if (!text) return;
    const touch = { ts: tsForLoggedDate(loggedOn), note: text, stage: stageSel };
    if (talked) touch.talked = true;
    if (objections.length) touch.objections = objections;
    onLogTouch(touch);
    setNote(""); setTalked(false); setObjections([]); setLoggedOn(todayLocalISO());
  };

  const trackBtn = (t) => (
    <button key={t.id} type="button"
      onClick={() => onSetTrack(t.id, t.id === "preapproved" && expiry ? new Date(`${expiry}T12:00:00`).getTime() : undefined)}
      style={{ border: `1px solid ${info.place.type === "track" && info.place.track === t.id ? T.greenWashLine : T.line}`, background: info.place.type === "track" && info.place.track === t.id ? T.greenWash : "none", color: info.place.type === "track" && info.place.track === t.id ? T.greenBright : T.dim, borderRadius: 999, padding: "6px 11px", fontFamily: FF.body, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
      {t.label}
    </button>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 55, padding: isNarrow ? "24px 12px" : "40px 20px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 560, padding: "18px 20px 24px", fontFamily: FF.body }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: T.cream }}>{lead.name}</div>
            <div style={{ fontSize: 12.5, color: T.dim, marginTop: 2 }}>
              {accountLabel}{lead.sourceNote ? ` · ${lead.sourceNote}` : ""}{lead.email ? ` · ${lead.email}` : ""}
            </div>
            <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>
              {leadPlaceLabel(info)}{exp != null ? ` · pre-approval expires in ${exp}d` : ""}
            </div>
          </div>
          <button type="button" title={isFire ? "Cool this lead off" : "Mark as a hot lead"} onClick={onToggleFire}
            style={{ flex: "none", background: isFire ? T.orangeWash : "none", border: `1px solid ${isFire ? T.orangeWashLine : T.line}`, borderRadius: 8, padding: "2px 8px", fontSize: 15, cursor: "pointer", lineHeight: 1.5, filter: isFire ? "none" : "grayscale(1) opacity(0.55)" }}>
            {"🔥"}
          </button>
          <a href={`tel:${String(lead.phone || "").replace(/[^0-9+]/g, "")}`}
            style={{ flex: "none", border: `1px solid ${T.greenWashLine}`, borderRadius: 10, padding: "8px 14px", color: T.green, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
            Call
          </a>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onLogAttempt()}
            style={{ border: "none", borderRadius: 10, padding: "10px 14px", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Log attempt
          </button>
          <button type="button" onClick={onText}
            style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 14px", background: "none", color: T.dim, fontFamily: FF.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Text
          </button>
          {onDelete && (
            <button type="button" onClick={onDelete}
              style={{ marginLeft: "auto", border: `1px solid ${T.redWashLine}`, borderRadius: 10, padding: "10px 14px", background: "none", color: T.redLift, fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Delete
            </button>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim }}>Next step</div>
          <input type="text" value={nextStep} onChange={(e) => setNextStep(e.target.value.slice(0, 500))} onBlur={() => nextStep !== (lead.note || "") && onSaveNote(nextStep)}
            placeholder="Status and next step only. No numbers."
            style={{ width: "100%", boxSizing: "border-box", marginTop: 6, background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px", fontFamily: FF.body, fontSize: 14 }} />
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim }}>Status track</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {LEAD_PIPELINE.tracks.map(trackBtn)}
            {info.place.type === "track" && (
              <button type="button" onClick={() => onSetTrack("", undefined)}
                style={{ border: `1px solid ${T.line}`, background: "none", color: T.faint, borderRadius: 999, padding: "6px 11px", fontFamily: FF.body, fontSize: 12, cursor: "pointer" }}>
                Clear
              </button>
            )}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 11.5, color: T.dim, fontFamily: FF.body }}>
            Pre-approval expiry
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)}
              style={{ background: T.bg0, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 8, padding: "5px 8px", fontFamily: FF.body, fontSize: 12.5, colorScheme: "dark" }} />
          </label>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim }}>Log a touch</div>
          <select value={stageSel} onChange={(e) => setStageSel(Number(e.target.value))}
            style={{ width: "100%", marginTop: 8, background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "11px 12px", fontFamily: FF.body, fontSize: 14 }}>
            {LEAD_PIPELINE.stages.map((s, i) => <option key={s.id} value={i}>{s.label}</option>)}
          </select>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <ChipRow label="Timeline" options={LEAD_TIMELINE} value={timeline} onChange={(v) => { setTimeline(v); onSaveTimeline(v); }} />
            <ChipRow label="Objections (this call)" options={LEAD_OBJECTIONS} value={objections} onChange={setObjections} multi />
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Status and next step only. No numbers."
            style={{ width: "100%", boxSizing: "border-box", marginTop: 8, minHeight: 70, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.body, fontSize: 14, lineHeight: 1.5 }} />
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <LoggedDatePicker value={loggedOn} onChange={setLoggedOn} />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: FF.body, fontSize: 11.5, color: talked ? T.greenBright : T.dim, cursor: "pointer" }}>
              <input type="checkbox" checked={talked} onChange={(e) => setTalked(e.target.checked)} style={{ accentColor: T.green, width: 15, height: 15, margin: 0 }} />
              We talked
            </label>
          </div>
          <button type="button" onClick={save} disabled={!note.trim()}
            style={{ width: "100%", marginTop: 10, padding: 13, borderRadius: 12, border: "none", background: note.trim() ? T.green : T.surface, color: note.trim() ? T.cream : T.faint, fontFamily: FF.body, fontSize: 15, fontWeight: 700, cursor: note.trim() ? "pointer" : "default" }}>
            Log touch
          </button>
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim, marginBottom: 8 }}>History · {history.length}</div>
            {history.map((t, i) => (
              <div key={`${t.ts}-${i}`} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "8px 10px", border: `1px solid ${T.line}`, borderRadius: 9, marginBottom: 6, background: T.surface }}>
                <span style={{ flex: "none", fontSize: 11.5, color: T.cream, fontVariantNumeric: "tabular-nums" }}>{new Date(t.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span style={{ flex: "none", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: t.stage === REPLY_STAGE ? T.greenBright : T.dim }}>
                  {t.stage === REPLY_STAGE ? "They replied" : t.type === "attempt" ? "Attempt" : LEAD_PIPELINE.stages[t.stage]?.label || "Touch"}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: T.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.note}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- entry form: the data rule made physical ----------
function NewLeadForm({ referrers, apiKey, onClose, onSaved, onSoiAdded, onToast }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [refQuery, setRefQuery] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [addingRef, setAddingRef] = useState(false);
  const [refName, setRefName] = useState("");
  const [refPhone, setRefPhone] = useState("");
  const [refBrokerage, setRefBrokerage] = useState("");
  const [refCategory, setRefCategory] = useState("");
  const [busy, setBusy] = useState(false);

  const inp = { width: "100%", boxSizing: "border-box", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "11px 12px", fontFamily: FF.body, fontSize: 14 };
  const lbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim, marginBottom: 6, marginTop: 12 };

  const q = refQuery.trim().toLowerCase();
  const matches = (q
    ? referrers.filter((r) => r.name.toLowerCase().includes(q) || r.brokerage.toLowerCase().includes(q))
    : referrers
  ).slice(0, 8);
  const chosen = referrers.find((r) => r.id === referredBy) || null;

  // Inline SOI add: writes through the existing SOI path (manual contact plus
  // membership with category); no parallel registry.
  const addReferrer = async () => {
    const rid = idFromPhone(refPhone);
    if (!refName.trim() || rid.length < 7 || !refCategory) { onToast("Name, mobile and category required"); return; }
    try {
      await persistManualContact(apiKey, { name: refName.trim(), phone: refPhone.trim(), brokerage: refBrokerage.trim() });
      await persistSoi(apiKey, rid, "add", refCategory);
      onSoiAdded();
      setReferredBy(rid);
      setRefQuery(refName.trim());
      setAddingRef(false);
    } catch (e) { onToast(e.message || "Could not add to SOI"); }
  };

  const save = async () => {
    if (busy) return;
    if (!referredBy) { onToast("Pick a referral source"); return; }
    if (!name.trim() || idFromPhone(phone).length < 7) { onToast("Name and mobile required"); return; }
    setBusy(true);
    const contact = { kind: "lead", name: name.trim(), phone: phone.trim(), email: email.trim(), referredBy, sourceNote: sourceNote.trim(), note: "", timeline: "", createdAt: Date.now() };
    try {
      await persistLead(apiKey, contact);
      onSaved(contact);
    } catch (e) { onToast(e.message || "Save failed"); }
    setBusy(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 56, padding: "36px 14px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 440, padding: "18px 20px 22px", fontFamily: FF.body }}>
        <div style={{ fontWeight: 700, fontSize: 19, color: T.cream }}>New Lead</div>
        <div style={{ fontSize: 11.5, color: T.dimmer, marginTop: 3 }}>Name, mobile, email, referral source, source note. Nothing else, on purpose.</div>
        <div style={lbl}>Name</div>
        <input style={inp} value={name} onChange={(e) => setName(e.target.value.slice(0, 120))} autoFocus />
        <div style={lbl}>Mobile</div>
        <input style={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 20))} />
        <div style={lbl}>Email</div>
        <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 200))} />
        <div style={lbl}>Referral source (SOI)</div>
        <input style={inp} placeholder="Search your SOI…" value={chosen ? `${chosen.name}${chosen.brokerage ? ` · ${chosen.brokerage}` : ""}` : refQuery}
          onChange={(e) => { setReferredBy(""); setRefQuery(e.target.value); }} />
        {!chosen && refQuery.trim() !== "" && (
          <div style={{ border: `1px solid ${T.line}`, borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
            {matches.map((r) => (
              <button key={r.id} type="button" onClick={() => { setReferredBy(r.id); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", borderBottom: `1px solid ${T.lineSoft}`, color: T.cream, fontFamily: FF.body, fontSize: 13.5, cursor: "pointer" }}>
                {r.name}{r.brokerage ? <span style={{ color: T.dim }}> · {r.brokerage}</span> : null}
              </button>
            ))}
            {matches.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12.5, color: T.faint }}>No SOI match.</div>}
          </div>
        )}
        {!addingRef ? (
          <button type="button" onClick={() => setAddingRef(true)}
            style={{ marginTop: 8, background: "none", border: "none", color: T.greenBright, fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>
            Not in SOI yet? Add them.
          </button>
        ) : (
          <div style={{ marginTop: 10, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 12px 14px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.amber }}>New SOI member</div>
            <input style={{ ...inp, marginTop: 8 }} placeholder="Name" value={refName} onChange={(e) => setRefName(e.target.value.slice(0, 120))} />
            <input style={{ ...inp, marginTop: 6 }} type="tel" placeholder="Mobile" value={refPhone} onChange={(e) => setRefPhone(e.target.value.slice(0, 20))} />
            <input style={{ ...inp, marginTop: 6 }} placeholder="Brokerage" value={refBrokerage} onChange={(e) => setRefBrokerage(e.target.value.slice(0, 120))} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {SOI_CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setRefCategory(refCategory === c.id ? "" : c.id)}
                  style={{ border: `1px solid ${refCategory === c.id ? T.greenWashLine : T.line}`, background: refCategory === c.id ? T.greenWash : "none", color: refCategory === c.id ? T.greenBright : T.dim, borderRadius: 999, padding: "5px 10px", fontFamily: FF.body, fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                  {c.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={addReferrer}
              style={{ marginTop: 10, width: "100%", border: "none", borderRadius: 10, padding: "10px 0", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Add to SOI and select
            </button>
          </div>
        )}
        <div style={lbl}>Source note</div>
        <input style={inp} value={sourceNote} onChange={(e) => setSourceNote(e.target.value.slice(0, 300))} placeholder="Open house 5/12, sign call, builder site…" />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1px solid ${T.line}`, background: "none", color: T.dim, fontFamily: FF.body, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button type="button" onClick={save} disabled={busy} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{busy ? "Saving…" : "Save lead"}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- per-referrer weekly reports ----------
function ReferrerReports({ referrers, leads, apiKey, onClose, onReport, onToast, onDaySet }) {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const withLeads = referrers
    .map((r) => ({ ...r, count: leads.filter((l) => l.referredBy === r.id).length }))
    .filter((r) => r.count > 0);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 56, padding: "36px 14px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 480, padding: "18px 20px 22px", fontFamily: FF.body }}>
        <div style={{ fontWeight: 700, fontSize: 19, color: T.cream }}>Weekly reports</div>
        <div style={{ fontSize: 11.5, color: T.dimmer, marginTop: 3 }}>Per referring SOI member. Status only, never notes.</div>
        {withLeads.length === 0 && <div style={{ marginTop: 16, fontSize: 13, color: T.faint }}>No referring members with leads on file yet.</div>}
        {withLeads.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: T.cream }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: T.dim }}>{r.brokerage || ""}{r.count ? ` · ${r.count} lead${r.count === 1 ? "" : "s"}` : ""}</div>
            </div>
            <select value={r.reportDay ?? ""} onChange={(e) => {
                const day = e.target.value === "" ? null : Number(e.target.value);
                if (day == null || !r.category) { onToast(r.category ? "Pick a day" : "Categorize them in the SOI cockpit first"); return; }
                persistSoiCategory(apiKey, r.id, r.category, day).then(onDaySet).catch(() => onToast("Could not set day"));
              }}
              style={{ background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 8, padding: "7px 8px", fontFamily: FF.body, fontSize: 12 }}>
              <option value="">Report day…</option>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <button type="button" onClick={() => onReport({ id: r.id, name: r.name, brokerage: r.brokerage })}
              style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: "8px 14px", background: "none", color: T.dim, fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
