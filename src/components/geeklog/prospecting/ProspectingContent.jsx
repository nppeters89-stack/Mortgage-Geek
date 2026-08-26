import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF } from "../gl2Tokens";
import { ContactCard } from "./ContactCard";
import { getCachedProspects, loadProspects, persistLog, persistMotivation, setCachedMotivation } from "./prospectStore";
import {
  idFromPhone, sortedQueue, filterQueue, hasIntelDot, isToday,
  outcomeMeta, PILL_TONES, logTsvRow, logTsvAll,
} from "./prospectsModel";
import { copyText } from "./clipboard";

// Prospecting tab root: reads the shared prospect store (prospectStore.js) for
// the call queue + logs, renders the queue or a contact card, and persists each
// call log through the store's keepalive + dirty-flag path so a Save survives the
// phone locking mid-walk. Contact data lives only in Redis + the session cache.

const CHIPS = [
  { id: "all", label: "All" },
  { id: "vip", label: "Has intel" },
  { id: "cb", label: "Callbacks" },
  { id: "today", label: "Logged today" },
];

export function ProspectingContent({ apiKey, onTalkedLogged }) {
  const seed = getCachedProspects();
  const [prospects, setProspects] = useState(() => (seed?.prospects ? sortedQueue(seed.prospects) : []));
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [motivation, setMotivation] = useState(() => seed?.motivation || {});
  const [ready, setReady] = useState(!!seed);
  const [view, setView] = useState("queue");
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const logsRef = useRef(logs);
  logsRef.current = logs;
  const motivationRef = useRef(motivation); motivationRef.current = motivation;

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Load + reconcile via the shared store (one GET for the whole feature).
  useEffect(() => {
    let cancelled = false;
    loadProspects(apiKey)
      .then((c) => {
        if (cancelled) return;
        setProspects(c.prospects);
        setLogs(c.logs);
        setMotivation(c.motivation || {});
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [apiKey]);

  const openProspect = prospects.find((p) => idFromPhone(p.phone) === openId) || null;

  const handleSave = useCallback((id, log) => {
    const prevOutcome = logsRef.current[id]?.outcome;
    setLogs((prev) => ({ ...prev, [id]: log }));
    persistLog(apiKey, id, log); // cache + keepalive + reconcile
    // A newly-marked "Talked" is a two-way conversation, so add it to today's
    // Prospecting count on the Today screen. Only on the transition to Talked, so
    // editing or re-saving the same contact never double-counts.
    if (log.outcome === "Talked" && prevOutcome !== "Talked") onTalkedLogged?.();
    showToast(log.score >= 9 ? "Saved. Added to Follow Ups" : "Saved");
    setView("queue");
    setOpenId(null);
  }, [apiKey, showToast, onTalkedLogged]);

  // Same motivation note as Follow Ups, on the same shared key - entered here
  // during the call, waiting in Follow Ups when the contact graduates.
  const handleSaveMotivation = useCallback((id, text) => {
    const prev = motivationRef.current;
    const next = { ...prev };
    const value = (text || "").trim();
    if (value) next[id] = value; else delete next[id];
    setMotivation(next);
    showToast(value ? "Motivation saved" : "Motivation cleared");
    persistMotivation(apiKey, id, value).catch(() => {
      setMotivation(prev);
      setCachedMotivation(prev);
      showToast("Could not save motivation");
    });
  }, [apiKey, showToast]);

  const copy = useCallback((text, msg, emptyMsg) => {
    if (!text) { showToast(emptyMsg || "Nothing to copy"); return; }
    copyText(text).then(() => showToast(msg), () => showToast("Copy failed"));
  }, [showToast]);

  const shown = useMemo(() => filterQueue(prospects, { filter, query, logs }), [prospects, filter, query, logs]);

  const loggedCount = useMemo(() => Object.values(logs).filter((l) => l && l.outcome).length, [logs]);
  const todayLogs = useMemo(() => Object.values(logs).filter((l) => l && l.outcome && isToday(l.ts)), [logs]);
  const callsToday = todayLogs.length;
  const conversationsToday = todayLogs.filter((l) => l.outcome === "Talked").length;

  // The most recently logged contact (max ts). Opening the tab (or returning to
  // the queue after a save) scrolls this row into view so Nick resumes where he
  // left off in the list.
  const lastLoggedId = useMemo(() => {
    let id = null, best = -1;
    for (const [k, l] of Object.entries(logs)) {
      const ts = l?.ts || 0;
      if (l && l.outcome && ts > best) { best = ts; id = k; }
    }
    return id;
  }, [logs]);

  const queueRef = useRef(null);
  useEffect(() => {
    if (view !== "queue" || !ready || !lastLoggedId) return;
    const el = queueRef.current?.querySelector(`[data-pid="${lastLoggedId}"]`);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "center" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, ready, lastLoggedId]);

  // ----- Contact card view -----
  if (view === "detail" && openProspect) {
    const id = idFromPhone(openProspect.phone);
    return (
      <>
        <StatusBarCap />
        <ContactCard
          prospect={openProspect}
          log={logs[id]}
          onBack={() => { setView("queue"); setOpenId(null); }}
          onSave={(log) => handleSave(id, log)}
          onCopyOne={(log) => copy(logTsvRow(openProspect, log), `Copied row for ${openProspect.name}`)}
          onToast={showToast}
          motivation={motivation[id] || ""}
          onSaveMotivation={(text) => handleSaveMotivation(id, text)}
        />
        <Toast msg={toast} />
      </>
    );
  }

  // ----- Queue view -----
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <StatusBarCap />
      <header style={{ position: "sticky", top: "calc(8px + env(safe-area-inset-top, 0px))", zIndex: 20, padding: "2px 20px 14px", background: T.bg1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Prospecting</h1>
          <div style={{ fontSize: 13, color: T.dim, fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: T.redLift, fontWeight: 600 }}>{loggedCount}</strong> logged · {shown.length} in queue
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <div style={{ flex: 1, background: conversationsToday > 0 ? T.greenWash : T.surface, border: `1px solid ${conversationsToday > 0 ? T.greenWashLine : T.line}`, borderRadius: 12, padding: "8px 13px" }}>
            <div style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: conversationsToday > 0 ? T.greenBright : T.cream }}>{conversationsToday}</div>
            <div style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>Conversations</div>
          </div>
          <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "8px 13px" }}>
            <div style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{callsToday}</div>
            <div style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>Calls today</div>
          </div>
          <button type="button" onClick={() => copy(logTsvAll(prospects, logs), `${loggedCount} rows copied`, "No calls logged yet")}
            style={{ flex: "none", padding: "0 16px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.bg0, color: T.cream, fontFamily: FF.body, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            Copy log
          </button>
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or brokerage" autoComplete="off"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: T.cream, fontFamily: FF.body, fontSize: 15 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", scrollbarWidth: "none" }}>
          {CHIPS.map((c) => {
            const on = filter === c.id;
            return (
              <button key={c.id} type="button" onClick={() => setFilter(c.id)}
                style={{ flex: "none", fontSize: 13, fontWeight: on ? 600 : 500, color: on ? T.bg1 : T.dim, border: `1px solid ${on ? T.cream : T.line}`, borderRadius: 999, padding: "7px 14px", background: on ? T.cream : "none", fontFamily: FF.body, cursor: "pointer" }}>
                {c.label}
              </button>
            );
          })}
        </div>
      </header>

      <div ref={queueRef} style={{ flex: 1, padding: "4px 12px 0" }}>
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", color: T.faint, padding: "60px 30px", fontSize: 14, lineHeight: 1.6 }}>
            {ready ? "Nothing here yet." : "Loading queue…"}
            {ready && <><br />Log a call and it will show up under this filter.</>}
          </div>
        ) : (
          shown.map((p) => {
            const id = idFromPhone(p.phone);
            const log = logs[id];
            const meta = log && log.outcome ? outcomeMeta(log.outcome) : null;
            const tone = meta ? PILL_TONES[meta.tone] : null;
            return (
              <div key={id} data-pid={id} role="button" tabIndex={0}
                onClick={() => { setOpenId(id); setView("detail"); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(id); setView("detail"); } }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 10px", borderBottom: `1px solid ${T.line}`, cursor: "pointer", borderRadius: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: hasIntelDot(p) ? T.redLift : "transparent", flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 20, lineHeight: 1.15, color: T.cream }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: T.dim, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
                </div>
                {meta && (
                  <span style={{ flex: "none", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 6, color: tone.color, background: tone.bg }}>{meta.short}</span>
                )}
                <div style={{ flex: "none", textAlign: "right" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{p.buysides}</div>
                  <div style={{ fontSize: 10, color: T.faint, letterSpacing: "0.06em", textTransform: "uppercase" }}>buysides</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Toast msg={toast} />
    </div>
  );
}

// Opaque cap over the top of the installed PWA so scrolled content never bleeds
// through. Its height matches the app scroll container's top padding
// (8px + safe-area inset); the sticky header sticks flush at the bottom of it, so
// there is no gap for a row to show through. Zero-ish height on non-inset
// displays. Fixed to the viewport.
export function StatusBarCap() {
  return <div aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, height: "calc(8px + env(safe-area-inset-top, 0px))", background: T.bg1, zIndex: 40 }} />;
}

export function Toast({ msg }) {
  return (
    <div aria-live="polite" style={{
      position: "fixed", bottom: 96, left: "50%", transform: `translateX(-50%) translateY(${msg ? 0 : 8}px)`,
      background: T.cream, color: T.bg1, fontSize: 13.5, fontWeight: 600, padding: "10px 18px", borderRadius: 999,
      opacity: msg ? 1 : 0, pointerEvents: "none", transition: "opacity 0.2s, transform 0.2s", zIndex: 50, whiteSpace: "nowrap",
      fontFamily: FF.body,
    }}>{msg}</div>
  );
}
