import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF } from "../gl2Tokens";
import { getCachedProspects, loadProspects, persistFollowUps } from "./prospectStore";
import { idFromPhone, followUpQueue, lastTouchLabel } from "./prospectsModel";
import { FollowUpDetail } from "./FollowUpDetail";
import { StatusBarCap, Toast } from "./ProspectingContent";

// Follow Ups tab: contacts whose call log scored 9 or 10 (derived membership),
// sorted by neglect. Log repeated auto-dated touches per contact; full history per
// contact. Shares the prospect store with the Prospecting tab, so a call scored
// 9+ shows up here on the next tab switch without a reload.
export function FollowUpsContent({ apiKey }) {
  const seed = getCachedProspects();
  const [prospects, setProspects] = useState(() => seed?.prospects || []);
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [followUps, setFollowUps] = useState(() => seed?.followUps || {});
  const [ready, setReady] = useState(!!seed);
  const [view, setView] = useState("queue");
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const fuRef = useRef(followUps);
  fuRef.current = followUps;

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    let cancelled = false;
    loadProspects(apiKey)
      .then((c) => {
        if (cancelled) return;
        setProspects(c.prospects);
        setLogs(c.logs);
        setFollowUps(c.followUps);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [apiKey]);

  const queue = useMemo(() => followUpQueue(prospects, logs, followUps), [prospects, logs, followUps]);
  const openProspect = prospects.find((p) => idFromPhone(p.phone) === openId) || null;

  const handleLogFollowUp = useCallback((id, note) => {
    const next = [...(fuRef.current[id] || []), { ts: Date.now(), note }];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);
    showToast("Follow up logged");
  }, [apiKey, showToast]);

  // ----- Detail view (stay here after logging a touch) -----
  if (view === "detail" && openProspect) {
    const id = idFromPhone(openProspect.phone);
    return (
      <>
        <StatusBarCap />
        <FollowUpDetail
          prospect={openProspect}
          log={logs[id]}
          touches={followUps[id] || []}
          onBack={() => { setView("queue"); setOpenId(null); }}
          onLogFollowUp={(note) => handleLogFollowUp(id, note)}
        />
        <Toast msg={toast} />
      </>
    );
  }

  // ----- Queue view -----
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <StatusBarCap />
      <header style={{ position: "sticky", top: 0, zIndex: 20, padding: "20px 20px 14px", background: T.bg1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: FF.serif, fontWeight: 400, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Follow Ups</h1>
          <div style={{ fontSize: 13, color: T.dim, fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: T.redLift, fontWeight: 600 }}>{queue.length}</strong> to work
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "4px 12px 0" }}>
        {queue.length === 0 ? (
          <div style={{ textAlign: "center", color: T.faint, padding: "60px 30px", fontSize: 14, lineHeight: 1.6 }}>
            {ready ? (
              <>Nothing to follow up yet.<br />Any call you score 9 or 10 lands here automatically.</>
            ) : "Loading…"}
          </div>
        ) : (
          queue.map((p) => {
            const id = idFromPhone(p.phone);
            const touches = followUps[id] || [];
            const count = touches.length;
            const { label, stale } = lastTouchLabel(touches);
            return (
              <div key={id} role="button" tabIndex={0}
                onClick={() => { setOpenId(id); setView("detail"); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(id); setView("detail"); } }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 10px", borderBottom: `1px solid ${T.line}`, cursor: "pointer", borderRadius: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FF.serif, fontSize: 20, lineHeight: 1.15, color: T.cream }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: T.dim, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
                </div>
                {count > 0 && (
                  <span style={{ flex: "none", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 6, color: T.dim, background: "rgba(255,254,251,0.08)" }}>{count} touch{count === 1 ? "" : "es"}</span>
                )}
                <div style={{ flex: "none", textAlign: "right" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: stale ? T.amber : T.dim, fontVariantNumeric: "tabular-nums" }}>{label}</div>
                  <div style={{ fontSize: 10, color: T.faint, letterSpacing: "0.06em", textTransform: "uppercase" }}>last touch</div>
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
