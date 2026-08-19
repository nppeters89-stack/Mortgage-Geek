import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF } from "../gl2Tokens";
import { getCachedProspects, loadProspects, persistFollowUps, persistSoi, setCachedSoi, persistRac, setCachedRac, persistMotivation, setCachedMotivation } from "./prospectStore";
import { idFromPhone, soiQueue, isTopScore, formatSoiSince, manualContactTsvRow } from "./prospectsModel";
import { copyText } from "./clipboard";
import { FollowUpDetail } from "./FollowUpDetail";
import { ContactQueueRow } from "./ContactQueueRow";
import { StatusBarCap, Toast } from "./ProspectingContent";
import { quietAction } from "./detailActionStyles";

// SOI (sphere of influence): contacts promoted out of Follow Ups after they send
// a referral. Unlike Follow Ups, membership is stored (a Redis hash of id to
// promotion date), not derived from the call score.
//
// Everything else is deliberately the same feature: the same queue row, the same
// detail component, the same neglect sort, and the same touch history key. A
// promotion moves no data, so removing someone drops them back into Follow Ups
// with every touch intact.
export function SoiContent({ apiKey }) {
  const seed = getCachedProspects();
  const [prospects, setProspects] = useState(() => seed?.prospects || []);
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [followUps, setFollowUps] = useState(() => seed?.followUps || {});
  const [soi, setSoi] = useState(() => seed?.soi || {});
  const [rac, setRac] = useState(() => seed?.rac || []);
  const [motivation, setMotivation] = useState(() => seed?.motivation || {});
  const [ready, setReady] = useState(!!seed);
  const [view, setView] = useState("queue");
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const fuRef = useRef(followUps);
  fuRef.current = followUps;
  const soiRef = useRef(soi);
  soiRef.current = soi;
  const racRef = useRef(rac);
  racRef.current = rac;
  const motivationRef = useRef(motivation); motivationRef.current = motivation;

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
        setSoi(c.soi || {});
        setRac(c.rac || []);
        setMotivation(c.motivation || {});
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [apiKey]);

  const queue = useMemo(() => soiQueue(prospects, soi, followUps), [prospects, soi, followUps]);
  const racSet = useMemo(() => new Set(rac), [rac]);
  const openProspect = prospects.find((p) => idFromPhone(p.phone) === openId) || null;

  // Same handler and same key as Follow Ups: a touch logged here is the same
  // history the Follow Ups view would show.
  const handleLogFollowUp = useCallback((id, note) => {
    const next = [...(fuRef.current[id] || []), { ts: Date.now(), note }];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);
    showToast("Follow up logged");
  }, [apiKey, showToast]);

  // Same motivation note as Follow Ups, on the same shared key.
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

  // Same RAC toggle as Follow Ups, on the same shared key, so a contact marked in
  // one view is marked in the other.
  const toggleRac = useCallback((id) => {
    const prev = racRef.current;
    const adding = !prev.includes(id);
    setRac(adding ? [...prev, id] : prev.filter((x) => x !== id));
    showToast(adding ? "Added to RAC" : "RAC mark cleared");
    persistRac(apiKey, id, adding ? "add" : "remove").catch(() => {
      setRac(prev);
      setCachedRac(prev);
      showToast("Could not update RAC");
    });
  }, [apiKey, showToast]);

  // Demote: optimistic, back to the queue, revert both this view and the shared
  // cache if the write fails. Nothing is deleted, so the contact reappears in
  // Follow Ups on the strength of its original call score.
  const handleRemoveFromSoi = useCallback((id) => {
    const prev = soiRef.current;
    const next = { ...prev };
    delete next[id];
    setSoi(next);
    setView("queue");
    setOpenId(null);
    showToast("Removed from SOI");
    persistSoi(apiKey, id, "remove").catch(() => {
      setSoi(prev);
      setCachedSoi(prev);
      showToast("Could not update SOI");
    });
  }, [apiKey, showToast]);

  // ----- Detail view -----
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
          onToast={showToast}
          motivation={motivation[id] || ""} onSaveMotivation={(text) => handleSaveMotivation(id, text)}
          onCopyForExcel={openProspect.manual ? () => copyText(manualContactTsvRow(openProspect)).then(
            () => showToast("Contact row copied"),
            () => showToast("Copy failed"),
          ) : null}
          inRac={racSet.has(id)}
          onToggleRac={() => toggleRac(id)}
          backLabel="SOI"
          footerAction={
            <button type="button" onClick={() => handleRemoveFromSoi(id)} style={quietAction}>
              Remove from SOI
            </button>
          }
        />
        <Toast msg={toast} />
      </>
    );
  }

  // ----- Queue view -----
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <StatusBarCap />
      <header style={{ position: "sticky", top: "calc(8px + env(safe-area-inset-top, 0px))", zIndex: 20, padding: "20px 20px 14px", background: T.bg1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>SOI</h1>
          <div style={{ fontSize: 13, color: T.dim, fontVariantNumeric: "tabular-nums" }}>
            <strong style={{ color: T.green, fontWeight: 600 }}>{queue.length}</strong> in sphere
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "4px 12px 0" }}>
        {queue.length === 0 ? (
          <div style={{ textAlign: "center", color: T.faint, padding: "60px 30px", fontSize: 14, lineHeight: 1.6 }}>
            {ready ? (
              <>No one in your sphere yet.<br />Add a contact from their Follow Ups detail once they refer you.</>
            ) : "Loading…"}
          </div>
        ) : (
          queue.map((p) => {
            const id = idFromPhone(p.phone);
            const since = formatSoiSince(soi[id]);
            return (
              <ContactQueueRow key={id} prospect={p}
                touches={followUps[id] || []}
                highlight={isTopScore(logs[id])}
                meta={since ? `SOI since ${since}` : ""}
                badge={p.manual ? "manual" : ""}
                checked={racSet.has(id)}
                onOpen={() => { setOpenId(id); setView("detail"); }}
              />
            );
          })
        )}
      </div>

      <Toast msg={toast} />
    </div>
  );
}
