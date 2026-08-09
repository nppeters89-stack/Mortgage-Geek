import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF } from "../gl2Tokens";
import { fetchProspects, saveProspectLog, saveProspectLogKeepalive } from "../../../utils/geeklogApi";
import { ContactCard } from "./ContactCard";
import {
  idFromPhone, sortedQueue, filterQueue, hasIntelDot, isToday,
  outcomeMeta, PILL_TONES, logTsvRow, logTsvAll,
} from "./prospectsModel";

// Prospecting tab root: loads the call queue + logs once (cached for instant
// re-open), renders the queue or a contact card, and persists each call log via
// the keepalive pattern with a dirty-flag reconcile on load — the same
// durability approach as the day tracker, so a Save survives the phone locking
// mid-walk. Contact data is never persisted anywhere but Redis + this session's
// caches.

// Session cache so switching tabs re-opens instantly; localStorage backs it for
// offline. Reconcile against the server on every load.
let sessionCache = null; // { prospects, logs }
const LS_KEY = "gl2:prospects:v1";
const DIRTY_KEY = "gl2:prospects:dirty";

function loadLS() { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveLS(obj) { try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch { /* best-effort */ } }
function getDirty() { try { return new Set(JSON.parse(localStorage.getItem(DIRTY_KEY) || "[]")); } catch { return new Set(); } }
function writeDirty(set) { try { localStorage.setItem(DIRTY_KEY, JSON.stringify([...set])); } catch { /* best-effort */ } }

const CHIPS = [
  { id: "all", label: "All" },
  { id: "vip", label: "Has intel" },
  { id: "cb", label: "Callbacks" },
  { id: "today", label: "Logged today" },
];

export function ProspectingContent({ apiKey }) {
  const seed = sessionCache || loadLS();
  const [prospects, setProspects] = useState(() => (seed?.prospects ? sortedQueue(seed.prospects) : []));
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [ready, setReady] = useState(!!seed);
  const [view, setView] = useState("queue");
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const logsRef = useRef(logs);
  logsRef.current = logs;

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Load + reconcile: server logs are the source of truth, but re-push any dirty
  // (unsynced) local log that never landed, and keep the local version until the
  // server confirms it.
  useEffect(() => {
    let cancelled = false;
    fetchProspects(apiKey)
      .then((data) => {
        if (cancelled || !data) return;
        const srv = sortedQueue(data.list?.prospects || []);
        const serverLogs = data.logs || {};
        const merged = { ...serverLogs };
        const dirty = getDirty();
        for (const id of Array.from(dirty)) {
          const local = logsRef.current[id];
          const s = serverLogs[id];
          if (local && (!s || (s.ts || 0) < (local.ts || 0))) {
            merged[id] = local;
            saveProspectLog(apiKey, id, local)
              .then(() => { const d = getDirty(); d.delete(id); writeDirty(d); })
              .catch(() => {});
          } else {
            dirty.delete(id);
          }
        }
        writeDirty(dirty);
        setProspects(srv);
        setLogs(merged);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Persist the session + offline cache on any change.
  useEffect(() => {
    if (!ready) return;
    sessionCache = { prospects, logs };
    saveLS(sessionCache);
  }, [prospects, logs, ready]);

  const openProspect = prospects.find((p) => idFromPhone(p.phone) === openId) || null;

  const handleSave = useCallback((id, log) => {
    setLogs((prev) => ({ ...prev, [id]: log }));
    const d = getDirty(); d.add(id); writeDirty(d);
    saveProspectLogKeepalive(apiKey, id, log); // survives the phone locking
    saveProspectLog(apiKey, id, log)
      .then(() => { const dd = getDirty(); dd.delete(id); writeDirty(dd); })
      .catch(() => { /* stays dirty; reconciled on next load */ });
    showToast("Saved");
    setView("queue");
    setOpenId(null);
  }, [apiKey, showToast]);

  const copy = useCallback((text, msg, emptyMsg) => {
    if (!text) { showToast(emptyMsg || "Nothing to copy"); return; }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(msg), () => showToast("Copy failed"));
    } else {
      showToast("Copy failed");
    }
  }, [showToast]);

  const shown = useMemo(() => filterQueue(prospects, { filter, query, logs }), [prospects, filter, query, logs]);

  const loggedCount = useMemo(() => Object.values(logs).filter((l) => l && l.outcome).length, [logs]);
  const todayLogs = useMemo(() => Object.values(logs).filter((l) => l && l.outcome && isToday(l.ts)), [logs]);
  const callsToday = todayLogs.length;
  const conversationsToday = todayLogs.filter((l) => l.outcome === "Talked").length;

  // ----- Contact card view -----
  if (view === "detail" && openProspect) {
    const id = idFromPhone(openProspect.phone);
    return (
      <>
        <ContactCard
          prospect={openProspect}
          log={logs[id]}
          onBack={() => { setView("queue"); setOpenId(null); }}
          onSave={(log) => handleSave(id, log)}
          onCopyOne={(log) => copy(logTsvRow(openProspect, log), `Copied row for ${openProspect.name}`)}
        />
        <Toast msg={toast} />
      </>
    );
  }

  // ----- Queue view -----
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <header style={{ padding: "20px 20px 14px", position: "sticky", top: 0, zIndex: 20, background: `linear-gradient(${T.bg1} 82%, rgba(19,20,22,0))` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: FF.serif, fontWeight: 400, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Prospecting</h1>
          <div style={{ fontSize: 13, color: T.dim, fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: T.redLift, fontWeight: 600 }}>{loggedCount}</strong> logged · {shown.length} in queue
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or brokerage" autoComplete="off"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: T.cream, fontFamily: FF.sans, fontSize: 15 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", scrollbarWidth: "none" }}>
          {CHIPS.map((c) => {
            const on = filter === c.id;
            return (
              <button key={c.id} type="button" onClick={() => setFilter(c.id)}
                style={{ flex: "none", fontSize: 13, fontWeight: on ? 600 : 500, color: on ? T.bg1 : T.dim, border: `1px solid ${on ? T.cream : T.line}`, borderRadius: 999, padding: "7px 14px", background: on ? T.cream : "none", fontFamily: FF.sans, cursor: "pointer" }}>
                {c.label}
              </button>
            );
          })}
        </div>
      </header>

      <div style={{ flex: 1, padding: "4px 12px 0" }}>
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
              <div key={id} role="button" tabIndex={0}
                onClick={() => { setOpenId(id); setView("detail"); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(id); setView("detail"); } }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 10px", borderBottom: `1px solid ${T.line}`, cursor: "pointer", borderRadius: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: hasIntelDot(p) ? T.redLift : "transparent", flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FF.serif, fontSize: 20, lineHeight: 1.15, color: T.cream }}>{p.name}</div>
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

      <div style={{ position: "sticky", bottom: 0, zIndex: 10, display: "flex", gap: 10, padding: "12px 16px", background: `linear-gradient(rgba(19,20,22,0), ${T.bg1} 40%)` }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "9px 14px" }}>
          <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{callsToday}</span>
          <span style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>Calls today</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "9px 14px" }}>
          <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{conversationsToday}</span>
          <span style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conversations</span>
        </div>
        <button type="button" onClick={() => copy(logTsvAll(prospects, logs), `${loggedCount} rows copied`, "No calls logged yet")}
          style={{ flex: "none", padding: "0 18px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.bg0, color: T.cream, fontFamily: FF.sans, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Copy log
        </button>
      </div>

      <Toast msg={toast} />
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div aria-live="polite" style={{
      position: "fixed", bottom: 96, left: "50%", transform: `translateX(-50%) translateY(${msg ? 0 : 8}px)`,
      background: T.cream, color: T.bg1, fontSize: 13.5, fontWeight: 600, padding: "10px 18px", borderRadius: 999,
      opacity: msg ? 1 : 0, pointerEvents: "none", transition: "opacity 0.2s, transform 0.2s", zIndex: 50, whiteSpace: "nowrap",
      fontFamily: FF.sans,
    }}>{msg}</div>
  );
}
