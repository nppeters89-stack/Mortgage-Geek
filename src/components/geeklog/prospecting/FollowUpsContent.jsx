import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF } from "../gl2Tokens";
import { getCachedProspects, loadProspects, persistFollowUps, persistSoi, setCachedSoi, persistPin, setCachedPinned, persistManualContact, persistRac, setCachedRac, persistCold, persistDead, setCachedColdDead } from "./prospectStore";
import { idFromPhone, followUpQueue, coldQueue, isTopScore, isPinnedMember, qualifiesForFollowUp, manualContactTsvRow, stageOf, coldCount, DEFAULT_STAGES, DEFAULT_CONFIG } from "./prospectsModel";
import { FollowUpDetail } from "./FollowUpDetail";
import { FollowUpCockpit } from "./FollowUpCockpit";
import { ContactQueueRow } from "./ContactQueueRow";
import { AddToFollowUpsSheet } from "./AddToFollowUpsSheet";
import { StatusBarCap, Toast } from "./ProspectingContent";
import { copyText } from "./clipboard";
import { quietAction } from "./detailActionStyles";
import { fireConfetti } from "./confetti";

// Follow Ups tab. On mobile (< 900px) this is the list experience: neglect-sorted
// queue with the pipeline stage on every row, a stage selector in the composer
// (choosing the goal stage promotes to SOI), and a collapsible Cold Pipeline.
// On desktop (>= 900px) it renders the FollowUpCockpit drag board instead, with
// the shared FollowUpDetail opening in a modal on a card click. Both surfaces
// write through the same handlers and the same derivations (prospectsModel), so
// there is one source of truth for stage, cold, and dead. Moving TO cold or dead
// is a desktop drag gesture; mobile can check in and revive. Dead contacts are
// excluded from every list.
export function FollowUpsContent({ apiKey }) {
  const seed = getCachedProspects();
  const [prospects, setProspects] = useState(() => seed?.prospects || []);
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [followUps, setFollowUps] = useState(() => seed?.followUps || {});
  const [soi, setSoi] = useState(() => seed?.soi || {});
  const [pinned, setPinned] = useState(() => seed?.pinned || []);
  const [rac, setRac] = useState(() => seed?.rac || []);
  const [cold, setCold] = useState(() => seed?.cold || {});
  const [dead, setDead] = useState(() => seed?.dead || {});
  const [stages, setStages] = useState(() => seed?.stages || DEFAULT_STAGES);
  const [config, setConfig] = useState(() => seed?.config || DEFAULT_CONFIG);
  const [ready, setReady] = useState(!!seed);
  const [openId, setOpenId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const fuRef = useRef(followUps); fuRef.current = followUps;
  const soiRef = useRef(soi); soiRef.current = soi;
  const pinnedRef = useRef(pinned); pinnedRef.current = pinned;
  const racRef = useRef(rac); racRef.current = rac;
  const coldRef = useRef(cold); coldRef.current = cold;
  const deadRef = useRef(dead); deadRef.current = dead;

  // Desktop cockpit at >= 900px. Read synchronously on first render (Geek Log is
  // a client-only SPA, so window is always available) to avoid a one-frame flash
  // of the wide cockpit on a phone.
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const goalIndex = stages.length - 1;

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
        setPinned(c.pinned || []);
        setRac(c.rac || []);
        setCold(c.cold || {});
        setDead(c.dead || {});
        setStages(c.stages || DEFAULT_STAGES);
        setConfig(c.config || DEFAULT_CONFIG);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [apiKey]);

  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);
  const racSet = useMemo(() => new Set(rac), [rac]);
  const queue = useMemo(() => followUpQueue(prospects, logs, followUps, soi, pinnedSet, cold, dead), [prospects, logs, followUps, soi, pinnedSet, cold, dead]);
  const coldList = useMemo(() => coldQueue(prospects, followUps, cold, dead), [prospects, followUps, cold, dead]);
  const openProspect = prospects.find((p) => idFromPhone(p.phone) === openId) || null;

  const closeDetail = useCallback(() => setOpenId(null), []);

  const describeStatus = useCallback((id) => {
    if (soi[id]) return "Already in your SOI";
    if (dead[id]) return "In the dead box";
    if (cold[id]) return "In the cold pipeline";
    if (qualifiesForFollowUp(logs[id]) || pinnedSet.has(id)) return "Already in Follow Ups";
    const score = logs[id]?.score;
    return score ? `Logged at ${score}/10` : "";
  }, [logs, soi, cold, dead, pinnedSet]);

  // Log a touch at a chosen stage. The goal stage promotes to SOI in the same
  // gesture (writes the stage touch AND adds SOI membership). Non-goal touches
  // leave the detail open so the stage advances in place.
  const handleLogFollowUp = useCallback((id, note, stage) => {
    const touch = { ts: Date.now(), note };
    if (Number.isInteger(stage)) touch.stage = stage;
    const next = [...(fuRef.current[id] || []), touch];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);

    if (Number.isInteger(stage) && stage === goalIndex) {
      const prev = soiRef.current;
      setSoi({ ...prev, [id]: String(Date.now()) });
      closeDetail();
      showToast("Promoted to SOI");
      persistSoi(apiKey, id, "add").catch(() => { setSoi(prev); setCachedSoi(prev); showToast("Could not update SOI"); });
    } else {
      showToast(Number.isInteger(stage) ? `Logged: ${stages[stage]}` : "Follow up logged");
    }
  }, [apiKey, showToast, goalIndex, stages, closeDetail]);

  const handleColdCheckIn = useCallback((id, note) => {
    const next = [...(fuRef.current[id] || []), { ts: Date.now(), note, stage: -1 }];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);
    showToast(`Check-in ${Math.min(coldCount(next), 5)} of 5 logged`);
  }, [apiKey, showToast]);

  // Revive from cold: cold remove, contact returns to the hot queue at its derived
  // stage. `silent` skips the toast and the detail close, used when a drag lands a
  // cold card on a different stage column (the stage popover fires next).
  const handleRevive = useCallback((id, silent = false) => {
    const prev = coldRef.current;
    const next = { ...prev };
    delete next[id];
    setCold(next);
    if (!silent) {
      closeDetail();
      const st = stageOf(fuRef.current[id], { goalIndex });
      showToast(`Revived at ${stages[st]}`);
    }
    persistCold(apiKey, id, "remove").catch(() => { setCold(prev); setCachedColdDead(prev, deadRef.current); showToast("Could not revive"); });
  }, [apiKey, showToast, goalIndex, stages, closeDetail]);

  // Desktop drag: move a hot card to cold.
  const handleMoveToCold = useCallback((id) => {
    const prev = coldRef.current;
    const next = { ...prev, [id]: String(Date.now()) };
    setCold(next);
    showToast("Moved to cold");
    persistCold(apiKey, id, "add").catch(() => { setCold(prev); setCachedColdDead(prev, deadRef.current); showToast("Could not move to cold"); });
  }, [apiKey, showToast]);

  // Desktop drag: mark a card dead. Writes a stage -2 touch and adds dead; the
  // server (and the optimistic cache) clear cold, since dead supersedes cold.
  const handleMarkDead = useCallback((id, note) => {
    const nextT = [...(fuRef.current[id] || []), { ts: Date.now(), note: note || "", stage: -2 }];
    setFollowUps((prev) => ({ ...prev, [id]: nextT }));
    persistFollowUps(apiKey, id, nextT);
    const prevCold = coldRef.current, prevDead = deadRef.current;
    const nc = { ...prevCold }; delete nc[id];
    const nd = { ...prevDead, [id]: String(Date.now()) };
    setCold(nc); setDead(nd);
    closeDetail();
    showToast("Marked dead");
    persistDead(apiKey, id, "add").catch(() => { setCold(prevCold); setDead(prevDead); setCachedColdDead(prevCold, prevDead); showToast("Could not update"); });
  }, [apiKey, showToast, closeDetail]);

  // Restore a dead contact: dead remove lands them in Fresh Cold (server + cache).
  const handleRestore = useCallback((id) => {
    const prevCold = coldRef.current, prevDead = deadRef.current;
    const nd = { ...prevDead }; delete nd[id];
    const nc = { ...prevCold, [id]: String(Date.now()) };
    setCold(nc); setDead(nd);
    showToast("Restored to cold");
    persistDead(apiKey, id, "remove").catch(() => { setCold(prevCold); setDead(prevDead); setCachedColdDead(prevCold, prevDead); showToast("Could not restore"); });
  }, [apiKey, showToast]);

  const handleAddToSoi = useCallback((id) => {
    const prev = soiRef.current;
    setSoi({ ...prev, [id]: String(Date.now()) });
    closeDetail();
    showToast("Added to SOI");
    persistSoi(apiKey, id, "add").catch(() => { setSoi(prev); setCachedSoi(prev); showToast("Could not update SOI"); });
  }, [apiKey, showToast, closeDetail]);

  const setPin = useCallback((id, action, message) => {
    const prev = pinnedRef.current;
    const next = action === "add" ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id);
    setPinned(next);
    if (message) showToast(message);
    persistPin(apiKey, id, action).catch(() => { setPinned(prev); setCachedPinned(prev); showToast("Could not update Follow Ups"); });
  }, [apiKey, showToast]);

  const handlePinFromSheet = useCallback((p) => {
    const id = idFromPhone(p.phone);
    if (soiRef.current[id]) { showToast(`${p.name} is already in your SOI`); return; }
    if (deadRef.current[id]) { showToast(`${p.name} is in the dead box`); return; }
    if (coldRef.current[id]) { showToast(`${p.name} is in the cold pipeline`); return; }
    if (qualifiesForFollowUp(logs[id]) || pinnedRef.current.includes(id)) { showToast(`${p.name} is already in Follow Ups`); return; }
    setPin(id, "add", `${p.name} added to Follow Ups`);
    setSheetOpen(false);
  }, [logs, setPin, showToast]);

  const handleCreateContact = useCallback(async (input) => {
    const { contact, cache } = await persistManualContact(apiKey, input);
    setProspects(cache.prospects);
    setPinned(cache.pinned);
    setSheetOpen(false);
    showToast(`${contact.name} added to Follow Ups`);
  }, [apiKey, showToast]);

  const toggleRac = useCallback((id) => {
    const prev = racRef.current;
    const adding = !prev.includes(id);
    setRac(adding ? [...prev, id] : prev.filter((x) => x !== id));
    showToast(adding ? "Added to RAC" : "RAC mark cleared");
    persistRac(apiKey, id, adding ? "add" : "remove").catch(() => { setRac(prev); setCachedRac(prev); showToast("Could not update RAC"); });
  }, [apiKey, showToast]);

  const handleCopyForExcel = useCallback((p) => {
    copyText(manualContactTsvRow(p)).then(() => showToast("Contact row copied"), () => showToast("Copy failed"));
  }, [showToast]);

  // The shared contact detail, built for either the mobile full page or the
  // desktop modal (modal adds the confetti on a goal promotion).
  const buildDetail = useCallback((id, { modal = false } = {}) => {
    const p = prospects.find((x) => idFromPhone(x.phone) === id);
    if (!p) return null;
    const isColdContact = !!cold[id] && !dead[id];
    const stageIdx = stageOf(followUps[id], { goalIndex });
    if (isColdContact) {
      return (
        <FollowUpDetail
          prospect={p} log={logs[id]} touches={followUps[id] || []}
          onBack={closeDetail} onToast={showToast}
          inRac={racSet.has(id)} onToggleRac={() => toggleRac(id)}
          stages={stages} showStageTags
          composerMode="cold" coldCount={coldCount(followUps[id])}
          statusLine={`Cold · ${coldCount(followUps[id])} of 5 · was at ${stages[stageIdx]}`}
          onColdCheckIn={(note) => handleColdCheckIn(id, note)}
          onRevive={() => handleRevive(id)}
        />
      );
    }
    const logTouch = (note, stage) => { handleLogFollowUp(id, note, stage); if (modal && stage === goalIndex) fireConfetti(); };
    return (
      <FollowUpDetail
        prospect={p} log={logs[id]} touches={followUps[id] || []}
        onBack={closeDetail}
        onLogFollowUp={logTouch}
        onToast={showToast}
        onAddToSoi={() => { handleAddToSoi(id); if (modal) fireConfetti(); }}
        onCopyForExcel={p.manual ? () => handleCopyForExcel(p) : null}
        inRac={racSet.has(id)} onToggleRac={() => toggleRac(id)}
        composerMode="stage" stages={stages} stageIndex={stageIdx} goalIndex={goalIndex} showStageTags
        footerAction={isPinnedMember(id, pinnedSet, soi) ? (
          <button type="button" onClick={() => { setPin(id, "remove", `${p.name} removed from Follow Ups`); closeDetail(); }} style={quietAction}>
            Remove from Follow Ups
          </button>
        ) : null}
      />
    );
  }, [prospects, logs, followUps, cold, dead, soi, stages, goalIndex, racSet, pinnedSet, closeDetail, showToast, toggleRac, handleColdCheckIn, handleRevive, handleLogFollowUp, handleAddToSoi, handleCopyForExcel, setPin]);

  // ----- Desktop: the cockpit, with the detail in a modal -----
  if (isDesktop) {
    return (
      <div style={{ minHeight: "100%" }}>
        <StatusBarCap />
        <FollowUpCockpit
          prospects={prospects} logs={logs} followUps={followUps} soi={soi} pinnedSet={pinnedSet}
          cold={cold} dead={dead} stages={stages} goalIndex={goalIndex} weekTarget={config.weekTarget}
          onOpenDetail={setOpenId}
          onLogTouch={handleLogFollowUp}
          onColdCheckIn={handleColdCheckIn}
          onMoveToCold={handleMoveToCold}
          onMarkDead={handleMarkDead}
          onRestore={handleRestore}
          onRevive={(id) => handleRevive(id)}
          onReviveSilent={(id) => handleRevive(id, true)}
        />
        {openProspect && (
          <div onClick={closeDetail} style={{ position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 55, padding: "40px 20px", overflowY: "auto" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 560, marginTop: 8 }}>
              {buildDetail(openId, { modal: true })}
            </div>
          </div>
        )}
        <Toast msg={toast} />
      </div>
    );
  }

  // ----- Mobile: full-page detail -----
  if (openProspect) {
    return (
      <>
        <StatusBarCap />
        {buildDetail(openId)}
        <Toast msg={toast} />
      </>
    );
  }

  // ----- Mobile: queue list -----
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <StatusBarCap />
      <header style={{ position: "sticky", top: 0, zIndex: 20, padding: "20px 20px 14px", background: T.bg1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Follow Ups</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, color: T.dim, fontVariantNumeric: "tabular-nums" }}>
              <strong style={{ color: T.redLift, fontWeight: 600 }}>{queue.length}</strong> to work
            </div>
            <button type="button" onClick={() => setSheetOpen(true)} aria-label="Add to Follow Ups"
              style={{ flex: "none", width: 34, height: 34, borderRadius: 10, background: "none", border: "none", boxShadow: `inset 0 0 0 1px ${T.line}`, color: T.dim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "4px 12px 0" }}>
        {queue.length === 0 ? (
          <div style={{ textAlign: "center", color: T.faint, padding: "60px 30px", fontSize: 14, lineHeight: 1.6 }}>
            {ready ? (<>Nothing to follow up yet.<br />Any call you score 9 or 10 lands here automatically.</>) : "Loading…"}
          </div>
        ) : (
          queue.map((p) => {
            const id = idFromPhone(p.phone);
            return (
              <ContactQueueRow key={id} prospect={p}
                touches={followUps[id] || []}
                highlight={isTopScore(logs[id])}
                badge={p.manual ? "manual" : ""}
                checked={racSet.has(id)}
                stage={stageOf(followUps[id], { goalIndex })}
                stages={stages}
                goalIndex={goalIndex}
                onOpen={() => setOpenId(id)}
              />
            );
          })
        )}

        {coldList.length > 0 && (
          <details style={{ margin: "14px 0 20px", border: `1px solid ${T.coldWashLine}`, borderRadius: 12, overflow: "hidden" }}>
            <summary style={{ listStyle: "none", cursor: "pointer", padding: "13px 14px", background: T.coldWash, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.cold }}>Cold Pipeline · {coldList.length}</span>
              <span style={{ fontSize: 11, color: T.faint }}>went quiet</span>
            </summary>
            <div style={{ padding: "2px 12px 6px" }}>
              {coldList.map((p) => {
                const id = idFromPhone(p.phone);
                return (
                  <ContactQueueRow key={id} prospect={p}
                    touches={followUps[id] || []}
                    coldCount={coldCount(followUps[id])}
                    onOpen={() => setOpenId(id)}
                  />
                );
              })}
            </div>
          </details>
        )}
      </div>

      {sheetOpen && (
        <AddToFollowUpsSheet
          prospects={prospects}
          onClose={() => setSheetOpen(false)}
          onPin={handlePinFromSheet}
          onCreate={handleCreateContact}
          describeStatus={describeStatus}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}
