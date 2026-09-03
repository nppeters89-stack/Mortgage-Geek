import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toPng, getFontEmbedCSS } from "html-to-image";
import { T, FF, staleColor, staleWash } from "../gl2Tokens";
import { LEAD_PIPELINE, trackOf } from "./pipelines";
import { leadInfo, leadPlaceLabel, expiryDaysLeft, attemptsOf, ATTEMPTING } from "./leadsModel";
import { idFromPhone, repliesOf, lastReplyTs, lastTouchTs, e164Phone, REPLY_STAGE } from "./prospectsModel";
import { getCachedLeads, loadLeads, persistLeadTouch, persistLead, persistLeadStatus, persistLeadAccount, deleteLead } from "./leadStore";
import { getCachedProspects, persistFire, setCachedFire } from "./prospectStore";
import { ReplyBadge } from "./ReplyBadge";
import { ReplyDateDialog, LoggedDatePicker, todayLocalISO, tsForLoggedDate } from "./LoggedDatePicker";
import { startText } from "./textIntent";
import { copyText } from "./clipboard";
import { StatusBarCap, Toast } from "./ProspectingContent";
import { ChipRow } from "./ChipFields";
import { LEAD_OBJECTIONS, LEAD_TIMELINE } from "./chips";
import { assembleAccountReport } from "./leadReport";
import { LeadReportCard } from "./LeadReportCard";
import { useIsMobile } from "../../../utils/hooks";

// Leads tab: the consumer lead pipeline, running the same engine as the agent
// board through LEAD_PIPELINE. Mobile renders a filtered list; desktop (via
// the cockpit's Agents | Leads switcher) renders the linear board with the
// status tracks after App Complete, the way SOI sits after the agent board.
// Data rule enforced by the entry form: a lead is name, mobile, email,
// account, source note, stage and short next-step notes. Nothing else.

const dSince = (ts) => (ts ? Math.floor((Date.now() - ts) / 86400000) : null);
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
  const [accounts, setAccounts] = useState(() => seed?.accounts || {});
  const [fire, setFire] = useState(() => getCachedProspects()?.fire || []);
  const [ready, setReady] = useState(!!seed);
  const [filter, setFilter] = useState(null); // null | "due" | "attempting" | "owed" | accountId
  const [openId, setOpenId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [replyFor, setReplyFor] = useState(null);
  const [reportFor, setReportFor] = useState(null); // assembled report being exported
  const reportRef = useRef(null);
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
      setContacts(c.contacts); setFu(c.fu); setStatus(c.status); setAccounts(c.accounts); setReady(true);
    }).catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [apiKey]);

  useEffect(() => {
    if (openLeadId) { setOpenId(openLeadId); onOpenConsumed?.(); }
  }, [openLeadId, onOpenConsumed]);

  const infoOf = useCallback((id) => leadInfo(fu[id], status[id]), [fu, status]);
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
    else if (filter) pool = pool.filter((l) => l.accountId === filter);
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

  const handleText = useCallback((lead) => {
    const info = infoOf(lead.id);
    const stageIdx = info.place.type === "stage" ? info.place.index : 5;
    const r = startText({ prospect: lead, stage: stageIdx, ns: "lead", pipeline: "lead" });
    if (!r.ok) { showToast("No valid mobile number"); return; }
    if (r.mode === "copy") copyText(r.body).then(() => showToast(`Message copied. Text ${r.number}`), () => showToast("Copy failed"));
  }, [infoOf, showToast]);

  // Off-screen report card to PNG, the same path the week story uses. The
  // payload is assembled note-free before anything renders.
  const exportReport = useCallback(async (account) => {
    const report = assembleAccountReport({ account, contacts, fu, status });
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
      link.download = `lead-report-${account.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${todayLocalISO()}.png`;
      link.href = dataUrl;
      link.click();
      showToast("Report exported");
    } catch {
      showToast("Export failed");
    } finally {
      setReportFor(null);
    }
  }, [contacts, fu, status, showToast]);

  // ----- pieces -----
  const accountName = (id) => accounts[id]?.name || "";

  const railChips = [
    { key: "due", label: `Due today ${counts.due}` },
    { key: "attempting", label: `Attempting ${counts.attempting}` },
    { key: "owed", label: `Owed a response ${counts.owed}` },
    ...Object.values(accounts).map((a) => ({ key: a.id, label: a.name })),
  ];

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
        Accounts
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
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(id); } }}
        style={{ boxSizing: "border-box", width: "100%", maxWidth: isNarrow ? "none" : 210, backgroundColor: T.surface, backgroundImage: wash ? `linear-gradient(0deg, ${wash}, ${wash})` : "none", border: `1px solid ${fireSet.has(id) ? T.orangeWashLine : T.line}`, borderRadius: 11, padding: "11px 13px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <span style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 15.5, lineHeight: 1.2, color: T.cream, minWidth: 0, overflowWrap: "break-word" }}>
            {lead.name}{fireSet.has(id) ? " 🔥" : ""}
          </span>
          <ReplyBadge count={replies.length} days={rTs ? dSince(rTs) : null} owed={rTs > (lastTouchTs(fu[id]) || 0)} />
        </div>
        <div style={{ fontSize: 11, color: T.dim, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{accountName(lead.accountId)}</div>
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

  const colShell = { boxSizing: "border-box", flex: "1 0 200px", minWidth: 200, maxWidth: 240, border: `1px solid ${T.line}`, borderRadius: 12, display: "flex", flexDirection: "column" };
  const colHead = { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderBottom: `1px solid ${T.line}` };
  const colBody = { display: "flex", flexDirection: "column", gap: 8, padding: 10, minHeight: 56, maxHeight: "52vh", overflowY: "auto" };

  const column = (label, color, items) => (
    <div key={label} style={colShell}>
      <div style={colHead}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        <span style={{ fontSize: 12, color: T.faint, fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
      </div>
      <div style={colBody}>{items.map(leadCard)}</div>
    </div>
  );

  const openLead = openId ? { id: openId, ...(contacts[openId] || {}) } : null;

  const body = (
    <>
      {rail}
      {!ready ? (
        <div style={{ textAlign: "center", color: T.faint, padding: "50px 30px", fontSize: 14 }}>Loading…</div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: "center", color: T.faint, padding: "50px 30px", fontSize: 14, lineHeight: 1.6 }}>
          No leads yet. Add an account, then your first lead.
        </div>
      ) : isNarrow ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{visible.map(leadCard)}</div>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto", paddingBottom: 16 }}>
          {LEAD_PIPELINE.stages.map((st, i) => column(st.label, T.greenBright, board.stageCols[i]))}
          {LEAD_PIPELINE.tracks.map((t) => column(t.label, t.id === "dead" ? T.faint : t.id === "closed" ? T.green : T.whale, board.trackCols[t.id]))}
        </div>
      )}

      {openLead && openLead.name && (
        <LeadDetail lead={openLead} touches={fu[openId] || []} info={infoOf(openId)} accountLabel={accountName(openLead.accountId)}
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
        <NewLeadForm accounts={accounts} apiKey={apiKey}
          onClose={() => setFormOpen(false)}
          onSaved={(contact) => { const id = idFromPhone(contact.phone); setContacts((p) => ({ ...p, [id]: contact })); setFormOpen(false); showToast("Lead added"); }}
          onAccountAdded={(a) => setAccounts((p) => ({ ...p, [a.id]: a }))}
          onToast={showToast} />
      )}
      {acctOpen && (
        <AccountManager accounts={accounts} apiKey={apiKey} onClose={() => setAcctOpen(false)}
          onSaved={(a) => setAccounts((p) => ({ ...p, [a.id]: a }))} onToast={showToast}
          onReport={(a) => exportReport(a)} />
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
function NewLeadForm({ accounts, apiKey, onClose, onSaved, onAccountAdded, onToast }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [accountId, setAccountId] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [addingAcct, setAddingAcct] = useState(false);
  const [newAcctName, setNewAcctName] = useState("");
  const [newAcctType, setNewAcctType] = useState("team");
  const [busy, setBusy] = useState(false);

  const inp = { width: "100%", boxSizing: "border-box", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "11px 12px", fontFamily: FF.body, fontSize: 14 };
  const lbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim, marginBottom: 6, marginTop: 12 };

  const addAccount = async () => {
    if (!newAcctName.trim()) return;
    try {
      const a = await persistLeadAccount(apiKey, { name: newAcctName.trim(), type: newAcctType, reportDay: 5 });
      onAccountAdded(a);
      setAccountId(a.id);
      setAddingAcct(false);
      setNewAcctName("");
    } catch { onToast("Account save failed"); }
  };

  const save = async () => {
    if (busy) return;
    if (!accountId) { onToast("Pick an account"); return; }
    if (!name.trim() || idFromPhone(phone).length < 7) { onToast("Name and mobile required"); return; }
    setBusy(true);
    const contact = { kind: "lead", name: name.trim(), phone: phone.trim(), email: email.trim(), accountId, sourceNote: sourceNote.trim(), note: "", timeline: "", createdAt: Date.now() };
    try {
      await persistLead(apiKey, contact);
      onSaved(contact);
    } catch (e) { onToast(e.message || "Save failed"); }
    setBusy(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 56, padding: "36px 14px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 420, padding: "18px 20px 22px", fontFamily: FF.body }}>
        <div style={{ fontWeight: 700, fontSize: 19, color: T.cream }}>New Lead</div>
        <div style={{ fontSize: 11.5, color: T.dimmer, marginTop: 3 }}>Name, mobile, email, account, source. Nothing else, on purpose.</div>
        <div style={lbl}>Name</div>
        <input style={inp} value={name} onChange={(e) => setName(e.target.value.slice(0, 120))} autoFocus />
        <div style={lbl}>Mobile</div>
        <input style={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 20))} />
        <div style={lbl}>Email</div>
        <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 200))} />
        <div style={lbl}>Account</div>
        {addingAcct ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <input style={{ ...inp, flex: 1, minWidth: 140 }} placeholder="Account name" value={newAcctName} onChange={(e) => setNewAcctName(e.target.value.slice(0, 120))} />
            <select style={{ ...inp, width: "auto" }} value={newAcctType} onChange={(e) => setNewAcctType(e.target.value)}>
              <option value="team">Team</option>
              <option value="builder">Builder</option>
              <option value="agent">Agent</option>
            </select>
            <button type="button" onClick={addAccount} style={{ border: "none", borderRadius: 10, padding: "0 14px", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <select style={{ ...inp, flex: 1 }} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Pick an account…</option>
              {Object.values(accounts).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button type="button" onClick={() => setAddingAcct(true)} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: "0 12px", background: "none", color: T.dim, fontFamily: FF.body, fontSize: 12.5, cursor: "pointer" }}>New</button>
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

// ---------- account management ----------
function AccountManager({ accounts, apiKey, onClose, onSaved, onToast, onReport = null }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("team");
  const [reportDay, setReportDay] = useState(5);
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const inp = { boxSizing: "border-box", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px", fontFamily: FF.body, fontSize: 13.5 };

  const save = async (existing) => {
    const account = existing
      ? { ...existing }
      : { name: name.trim(), type, reportDay: Number(reportDay) };
    if (!account.name) return;
    try {
      const a = await persistLeadAccount(apiKey, account);
      onSaved(a);
      if (!existing) { setName(""); onToast("Account added"); }
      else onToast("Account updated");
    } catch { onToast("Account save failed"); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 56, padding: "36px 14px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 460, padding: "18px 20px 22px", fontFamily: FF.body }}>
        <div style={{ fontWeight: 700, fontSize: 19, color: T.cream, marginBottom: 12 }}>Accounts</div>
        {Object.values(accounts).map((a) => (
          <AccountRow key={a.id} account={a} days={DAYS} inp={inp} onSave={(next) => save(next)} onReport={onReport} />
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          <input style={{ ...inp, flex: 1, minWidth: 130 }} placeholder="New account name" value={name} onChange={(e) => setName(e.target.value.slice(0, 120))} />
          <select style={inp} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="team">Team</option>
            <option value="builder">Builder</option>
            <option value="agent">Agent</option>
          </select>
          <select style={inp} value={reportDay} onChange={(e) => setReportDay(Number(e.target.value))}>
            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <button type="button" onClick={() => save(null)} style={{ border: "none", borderRadius: 10, padding: "0 14px", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add</button>
        </div>
      </div>
    </div>
  );
}

function AccountRow({ account, days, inp, onSave, onReport = null }) {
  const [name, setName] = useState(account.name);
  const [reportDay, setReportDay] = useState(account.reportDay);
  const dirty = name !== account.name || reportDay !== account.reportDay;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
      <input style={{ ...inp, flex: 1, minWidth: 130 }} value={name} onChange={(e) => setName(e.target.value.slice(0, 120))} />
      <span style={{ fontSize: 10.5, color: T.dimmer, textTransform: "uppercase", letterSpacing: "0.05em" }}>{account.type}</span>
      <select style={inp} value={reportDay} onChange={(e) => setReportDay(Number(e.target.value))}>
        {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
      </select>
      {dirty && (
        <button type="button" onClick={() => onSave({ ...account, name: name.trim(), reportDay })}
          style={{ border: "none", borderRadius: 10, padding: "8px 12px", background: T.green, color: T.cream, fontFamily: FF.body, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Save
        </button>
      )}
      {onReport && (
        <button type="button" onClick={() => onReport(account)}
          style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: "8px 12px", background: "none", color: T.dim, fontFamily: FF.body, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Report
        </button>
      )}
    </div>
  );
}
