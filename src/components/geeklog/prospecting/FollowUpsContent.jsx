import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF, STAGE_RAMP } from "../gl2Tokens";
import { getCachedProspects, loadProspects, persistFollowUps, persistSoi, setCachedSoi, persistPin, setCachedPinned, persistManualContact, persistRac, setCachedRac, persistCold, persistDead, setCachedColdDead, persistStageMove, setCachedStagemap, persistMotivation, setCachedMotivation, persistLog, persistWhale, setCachedWhale, persistFire, setCachedFire } from "./prospectStore";
import { idFromPhone, followUpQueue, coldQueue, isTopScore, isPinnedMember, qualifiesForFollowUp, manualContactTsvRow, stageOf, coldCount, isDueForTouch, dueDaysFor, dueInfoFor, lastTouchTs, weekScoreboard, CONVO_TARGET, COLD_DUE_DAYS, DEFAULT_STAGES, DEFAULT_CONFIG, WHALE_COLUMNS, fireFirst, REPLY_STAGE, repliesOf, lastReplyTs } from "./prospectsModel";
import { FollowUpDetail } from "./FollowUpDetail";
import { FollowUpCockpit } from "./FollowUpCockpit";
import { ContactQueueRow } from "./ContactQueueRow";
import { MobileQueueRow } from "./MobileQueueRow";
import { AddToFollowUpsSheet } from "./AddToFollowUpsSheet";
import { StatusBarCap, Toast } from "./ProspectingContent";
import { copyText } from "./clipboard";
import { quietAction } from "./detailActionStyles";
import { fireConfetti } from "./confetti";

// Accent hex at an alpha, for the mobile filter tiles' active state.
const tint = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

// Follow Ups tab. On mobile (< 900px) this is the list experience: neglect-sorted
// queue with the pipeline stage on every row, a stage selector in the composer
// (choosing the goal stage promotes to SOI), and a collapsible Cold Pipeline.
// On desktop (>= 900px) it renders the FollowUpCockpit drag board instead, with
// the shared FollowUpDetail opening in a modal on a card click. Both surfaces
// write through the same handlers and the same derivations (prospectsModel), so
// there is one source of truth for stage, cold, and dead. Moving TO cold or dead
// is a desktop drag gesture; mobile can check in and revive. Dead contacts are
// excluded from every list.
export function FollowUpsContent({ apiKey, onOpenSoi }) {
  const seed = getCachedProspects();
  const [prospects, setProspects] = useState(() => seed?.prospects || []);
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [followUps, setFollowUps] = useState(() => seed?.followUps || {});
  const [soi, setSoi] = useState(() => seed?.soi || {});
  const [pinned, setPinned] = useState(() => seed?.pinned || []);
  const [rac, setRac] = useState(() => seed?.rac || []);
  const [whale, setWhale] = useState(() => seed?.whale || []);
  const [fire, setFire] = useState(() => seed?.fire || []);
  const [addedat, setAddedat] = useState(() => seed?.addedat || {});
  const [cold, setCold] = useState(() => seed?.cold || {});
  const [stagemap, setStagemap] = useState(() => seed?.stagemap || {});
  const [motivation, setMotivation] = useState(() => seed?.motivation || {});
  const [dead, setDead] = useState(() => seed?.dead || {});
  const [stages, setStages] = useState(() => seed?.stages || DEFAULT_STAGES);
  const [config, setConfig] = useState(() => seed?.config || DEFAULT_CONFIG);
  const [ready, setReady] = useState(!!seed);
  const [openId, setOpenId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const fuRef = useRef(followUps); fuRef.current = followUps;
  const logsRef = useRef(logs); logsRef.current = logs;
  const soiRef = useRef(soi); soiRef.current = soi;
  const pinnedRef = useRef(pinned); pinnedRef.current = pinned;
  const racRef = useRef(rac); racRef.current = rac;
  const whaleRef = useRef(whale); whaleRef.current = whale;
  const fireRef = useRef(fire); fireRef.current = fire;
  const coldRef = useRef(cold); coldRef.current = cold;
  const stagemapRef = useRef(stagemap); stagemapRef.current = stagemap;
  const motivationRef = useRef(motivation); motivationRef.current = motivation;
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
        setStagemap(c.stagemap || {});
        setMotivation(c.motivation || {});
        setPinned(c.pinned || []);
        setRac(c.rac || []);
        setWhale(c.whale || []);
        setFire(c.fire || []); setAddedat(c.addedat || {});
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
  const whaleSet = useMemo(() => new Set(whale), [whale]);
  const fireSet = useMemo(() => new Set(fire), [fire]);
  const queue = useMemo(() => followUpQueue(prospects, logs, followUps, soi, pinnedSet, cold, dead), [prospects, logs, followUps, soi, pinnedSet, cold, dead]);
  const coldList = useMemo(() => coldQueue(prospects, followUps, cold, dead), [prospects, followUps, cold, dead]);

  // Mobile mirrors the desktop board's exclusivity: whales leave the main list
  // for their own tray. queue is already neglect-sorted; fire-flagged hot leads
  // float to the top of each half, neglect order kept within each group.
  const hotList = useMemo(() => fireFirst(queue.filter((p) => !whaleSet.has(idFromPhone(p.phone))), fireSet), [queue, whaleSet, fireSet]);
  const whaleList = useMemo(() => fireFirst(queue.filter((p) => whaleSet.has(idFromPhone(p.phone))), fireSet), [queue, whaleSet, fireSet]);
  // The header badge counts follow-ups actually DUE (7+ days or never touched),
  // matching the desktop top-nav badge.
  const infoOf = useCallback((id) => dueInfoFor(followUps[id], stageOf(followUps[id], { goalIndex, override: stagemap[id] }), whaleSet.has(id)), [followUps, goalIndex, stagemap, whaleSet]);
  const dueCount = useMemo(() => [...hotList, ...whaleList].filter((p) => infoOf(idFromPhone(p.phone)).due).length, [hotList, whaleList, infoOf]);
  // Mobile 5B: filter tiles + staleness groups. Its own state, deliberately a
  // different set from the desktop rail (data hygiene is desk work).
  const [mobileFilter, setMobileFilter] = useState(null); // null | "due" | "fire" | "whale"
  // Shared weekly scoreboard, same selector as the desktop HUD.
  const wk = useMemo(() => weekScoreboard({ prospects, logs, followUps, soi, pinned: pinnedSet, cold, dead, addedat }), [prospects, logs, followUps, soi, pinnedSet, cold, dead, addedat]);
  const mobileGroups = useMemo(() => {
    const combined = [...hotList, ...whaleList];
    let pool = combined;
    if (mobileFilter === "whale") pool = whaleList;
    else if (mobileFilter === "fire") pool = combined.filter((p) => fireSet.has(idFromPhone(p.phone)));
    else if (mobileFilter === "due") pool = combined.filter((p) => infoOf(idFromPhone(p.phone)).due);
    const overdue = [], soon = [], recent = [];
    pool.forEach((p) => {
      const id = idFromPhone(p.phone);
      const info = infoOf(id);
      const rampDays = info.sinceTs ? Math.floor((Date.now() - info.sinceTs) / 86400000) : null;
      // Due soon window scales with the clock: half the cadence, floor one
      // day, and the 1-2 day clocks (including the reply clock) skip the tier.
      const win = info.dueDays <= 2 ? 0 : Math.max(1, Math.floor(info.dueDays / 2));
      if (info.due) overdue.push(p);
      else if (win > 0 && rampDays != null && rampDays >= info.dueDays - win) soon.push(p);
      else recent.push(p);
    });
    const groups = [
      { key: "overdue", label: "Overdue · past their clock", color: T.redLiftHi, wash: T.redWash, rule: "rgba(226,87,91,0.30)", rows: fireFirst(overdue, fireSet) },
      { key: "soon", label: "Due soon · window closing", color: T.amber, wash: "rgba(201,162,58,0.10)", rule: "rgba(201,162,58,0.30)", rows: fireFirst(soon, fireSet) },
      { key: "recent", label: "Recently touched", color: T.dimmer, wash: "rgba(255,254,251,0.03)", rule: T.lineSoft, rows: fireFirst(recent, fireSet) },
    ];
    return { groups, total: pool.length, allCount: combined.length, fireCount: combined.filter((p) => fireSet.has(idFromPhone(p.phone))).length };
  }, [hotList, whaleList, mobileFilter, followUps, fireSet, infoOf]);
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
  const handleLogFollowUp = useCallback((id, note, stage, ts, talked) => {
    const touch = { ts: Number.isFinite(ts) ? ts : Date.now(), note };
    if (Number.isInteger(stage)) touch.stage = stage;
    if (talked === true) touch.talked = true;
    const next = [...(fuRef.current[id] || []), touch];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);

    if (Number.isInteger(stage) && stage === goalIndex && !whaleRef.current.includes(id)) {
      const prev = soiRef.current;
      setSoi({ ...prev, [id]: String(Date.now()) });
      closeDetail();
      showToast("Promoted to SOI");
      persistSoi(apiKey, id, "add").catch(() => { setSoi(prev); setCachedSoi(prev); showToast("Could not update SOI"); });
    } else {
      // The dropdown is authoritative: when the ratchet alone would not land
      // the card on the chosen stage (a lower stage than the ratchet, or a
      // backdated touch older than an existing hand placement), pin the stage
      // as a placement - the same mechanism as a cockpit drag.
      if (Number.isInteger(stage)) {
        const derived = stageOf(next, { goalIndex, override: stagemapRef.current[id] });
        if (derived !== stage) {
          const prevMap = stagemapRef.current;
          setStagemap({ ...prevMap, [id]: { s: stage, ts: Date.now() } });
          persistStageMove(apiKey, id, stage).catch(() => { setStagemap(prevMap); setCachedStagemap(prevMap); });
        }
      }
      showToast(Number.isInteger(stage) ? `Logged: ${(whaleRef.current.includes(id) ? WHALE_COLUMNS : stages)[stage]}` : "Follow up logged");
    }
  }, [apiKey, showToast, goalIndex, stages, closeDetail]);

  // Re-score the first call from Follow Ups. Membership is derived from this
  // score, so setting it below 9 drops the contact from Follow Ups (unless
  // pinned by hand) - the deliberate downgrade path. A hand-added contact has
  // no call log at all; their first score creates one ("Talked" is the honest
  // outcome - the conversation is how they earned a score), through the same
  // /log path Prospecting writes.
  const handleSetScore = useCallback((id, score) => {
    const prev = logsRef.current[id];
    // No ts on the synthetic log: the score describes a conversation that
    // happened at some unknown point before the contact was added by hand, so
    // it must not count as a call or conversation "today". Undated logs are
    // skipped by every today-counter and date label (the !ts guards).
    const next = prev ? { ...prev, score } : { outcome: "Talked", score, note: "" };
    setLogs((l) => ({ ...l, [id]: next }));
    persistLog(apiKey, id, next);
    showToast(score >= 9 ? `Score set to ${score}/10` : `Score ${score}/10. Dropping from Follow Ups`);
  }, [apiKey, showToast]);

  // Flag or unflag a whale. A whale leaves the hot board for the whale
  // pipeline; unflagging drops them back at their derived stage.
  const toggleWhale = useCallback((id) => {
    const prev = whaleRef.current;
    const adding = !prev.includes(id);
    setWhale(adding ? [...prev, id] : prev.filter((x) => x !== id));
    showToast(adding ? "Moved to the whale pipeline 🐳" : "Removed from the whale pipeline");
    persistWhale(apiKey, id, adding ? "add" : "remove").catch(() => {
      setWhale(prev);
      setCachedWhale(prev);
      showToast("Could not update");
    });
  }, [apiKey, showToast]);

  // Flag or unflag a hot lead. A marker only - no pipeline move.
  const toggleFire = useCallback((id) => {
    const prev = fireRef.current;
    const adding = !prev.includes(id);
    setFire(adding ? [...prev, id] : prev.filter((x) => x !== id));
    showToast(adding ? "Marked as a hot lead 🔥" : "Cooled off");
    persistFire(apiKey, id, adding ? "add" : "remove").catch(() => {
      setFire(prev);
      setCachedFire(prev);
      showToast("Could not update");
    });
  }, [apiKey, showToast]);

  // Save (or clear) a contact's motivation note.
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

  // Desktop drag: a hand placement. The card moves to the dropped stage with no
  // touch logged, in either direction; stageOf treats the placement as the new
  // ratchet base, so touches logged after it can still advance the card.
  const handleMoveStage = useCallback((id, si) => {
    const prev = stagemapRef.current;
    setStagemap({ ...prev, [id]: { s: si, ts: Date.now() } });
    showToast(`Moved to ${(whaleRef.current.includes(id) ? WHALE_COLUMNS : stages)[si]}`);
    persistStageMove(apiKey, id, si).catch(() => {
      setStagemap(prev);
      setCachedStagemap(prev);
      showToast("Could not move");
    });
  }, [apiKey, showToast, stages]);

  // Inbound reply: appended to the same history as stage -4. Not an outbound
  // touch; the model excludes it from clocks, ratchet and stats.
  const handleLogReply = useCallback((id, note, ts) => {
    const touch = { ts: Number.isFinite(ts) ? ts : Date.now(), note: note || "", stage: REPLY_STAGE };
    const next = [...(fuRef.current[id] || []), touch];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);
    showToast("Reply logged");
  }, [apiKey, showToast]);

  const handleColdCheckIn = useCallback((id, note, ts, talked) => {
    const touch = { ts: Number.isFinite(ts) ? ts : Date.now(), note, stage: -1 };
    if (talked === true) touch.talked = true;
    const next = [...(fuRef.current[id] || []), touch];
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
      const st = stageOf(fuRef.current[id], { goalIndex, override: stagemapRef.current[id] });
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
    const stageIdx = stageOf(followUps[id], { goalIndex, override: stagemap[id] });
    if (isColdContact) {
      return (
        <FollowUpDetail
          prospect={p} log={logs[id]} touches={followUps[id] || []}
          onBack={closeDetail} onToast={showToast}
          motivation={motivation[id] || ""} onSaveMotivation={(text) => handleSaveMotivation(id, text)}
          copyPhoneOnTap={modal}
          onSetScore={(v) => handleSetScore(id, v)}
          isWhale={whaleSet.has(id)} onToggleWhale={() => toggleWhale(id)}
          isFire={fireSet.has(id)} onToggleFire={() => toggleFire(id)}
          inRac={racSet.has(id)} onToggleRac={() => toggleRac(id)}
          stages={stages} showStageTags
          composerMode="cold" coldCount={coldCount(followUps[id])}
          statusLine={`Cold · ${coldCount(followUps[id])} of 5 · was at ${stages[stageIdx]}`}
          onColdCheckIn={(note, ts, talked) => handleColdCheckIn(id, note, ts, talked)}
          onRevive={() => handleRevive(id)}
        />
      );
    }
    const logTouch = (note, stage, ts, talked) => { handleLogFollowUp(id, note, stage, ts, talked); if (modal && stage === goalIndex) fireConfetti(); };
    return (
      <FollowUpDetail
        prospect={p} log={logs[id]} touches={followUps[id] || []}
        onBack={closeDetail}
        onLogFollowUp={logTouch}
        onLogReply={(note, ts) => handleLogReply(id, note, ts)}
        onToast={showToast}
        onAddToSoi={() => { handleAddToSoi(id); if (modal) fireConfetti(); }}
        onCopyForExcel={p.manual ? () => handleCopyForExcel(p) : null}
        motivation={motivation[id] || ""} onSaveMotivation={(text) => handleSaveMotivation(id, text)}
        copyPhoneOnTap={modal}
        onSetScore={(v) => handleSetScore(id, v)}
        isWhale={whaleSet.has(id)} onToggleWhale={() => toggleWhale(id)}
        isFire={fireSet.has(id)} onToggleFire={() => toggleFire(id)}
        whaleMode={whaleSet.has(id)}
        inRac={racSet.has(id)} onToggleRac={() => toggleRac(id)}
        composerMode="stage" stages={whaleSet.has(id) ? WHALE_COLUMNS : stages} stageIndex={stageIdx} goalIndex={goalIndex} showStageTags
        footerAction={isPinnedMember(id, pinnedSet, soi) ? (
          <button type="button" onClick={() => { setPin(id, "remove", `${p.name} removed from Follow Ups`); closeDetail(); }} style={quietAction}>
            Remove from Follow Ups
          </button>
        ) : null}
      />
    );
  }, [prospects, logs, followUps, cold, dead, soi, stages, goalIndex, stagemap, motivation, racSet, pinnedSet, whaleSet, fireSet, closeDetail, showToast, toggleRac, toggleWhale, toggleFire, handleColdCheckIn, handleRevive, handleLogFollowUp, handleLogReply, handleAddToSoi, handleCopyForExcel, handleSaveMotivation, handleSetScore, setPin]);

  // ----- Desktop: the cockpit, with the detail in a modal -----
  if (isDesktop) {
    return (
      <div style={{ minHeight: "100%" }}>
        <StatusBarCap />
        <FollowUpCockpit
          prospects={prospects} logs={logs} followUps={followUps} soi={soi} pinnedSet={pinnedSet}
          cold={cold} dead={dead} stages={stages} goalIndex={goalIndex} weekTarget={config.weekTarget}
          stagemap={stagemap} motivation={motivation} rac={racSet} whaleSet={whaleSet} fireSet={fireSet} addedat={addedat}
          onLogReply={handleLogReply}
          onOpenDetail={setOpenId}
          onOpenSoi={onOpenSoi}
          onLogTouch={handleLogFollowUp}
          onMoveStage={handleMoveStage}
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
      <header style={{ padding: "2px 20px 0", background: T.bg1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Pipeline</h1>
          <button type="button" onClick={() => setSheetOpen(true)} aria-label="Add to Follow Ups"
            style={{ flex: "none", width: 32, height: 32, borderRadius: "50%", background: T.surfaceHi, border: `1px solid ${T.lineSoft}`, color: T.dim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        {/* Week strip: the same numbers the desktop HUD shows, same selector. */}
        <div style={{ marginTop: 11, padding: "9px 12px", background: T.surfaceHi, border: `1px solid ${T.line}`, borderRadius: 11, display: "flex", alignItems: "center", gap: 12, fontFamily: FF.body }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.greenBright }}>{wk.addedToday}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dimmer }}>Added</span>
          </span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.cream }}>{wk.week}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dimmer }}>Wk</span>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.dimmer }}>Convos</span>
              <span style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: T.dimmer }}><strong style={{ color: T.cream, fontWeight: 700 }}>{wk.convosWeek}</strong>/{CONVO_TARGET}</span>
            </span>
            <span style={{ position: "relative", display: "block", height: 7, marginTop: 4, background: T.bg0, borderRadius: 4, overflow: "hidden" }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 4, width: `${Math.min(100, (wk.convosWeek / CONVO_TARGET) * 100)}%`, background: `linear-gradient(90deg, ${T.redLift}, ${T.orange})` }} />
              <span style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "rgba(255,254,251,0.14)" }} />
            </span>
          </span>
        </div>
        {/* Filter tiles. All is an explicit tile; single select. */}
        <div style={{ display: "flex", gap: 6, padding: "11px 0" }}>
          {[
            { key: null, glyph: "◆", label: "All", accent: T.cream, count: mobileGroups.allCount },
            { key: "due", glyph: "◗", label: "Due", accent: T.redLift, count: dueCount },
            { key: "fire", glyph: "🔥", label: "Hot", accent: STAGE_RAMP[5], count: mobileGroups.fireCount },
            { key: "whale", glyph: "🐳", label: "Whales", accent: T.whale, count: whaleList.length },
          ].map((tile) => {
            const active = mobileFilter === tile.key;
            const a = tile.accent;
            return (
              <button key={tile.label} type="button" aria-pressed={active} onClick={() => setMobileFilter(tile.key)}
                style={{ flex: 1, minWidth: 0, height: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, borderRadius: 10, border: `1px solid ${active ? tint(a, 0.5) : T.line}`, background: active ? tint(a, 0.14) : "rgba(255,254,251,0.02)", cursor: "pointer", fontFamily: FF.body }}>
                <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span aria-hidden="true" style={{ fontSize: 11, color: active ? a : T.dimmer }}>{tile.glyph}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: active ? a : T.dimmer }}>{tile.count}</span>
                </span>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 600, color: active ? a : T.dim }}>{tile.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div style={{ flex: 1, padding: "4px 12px 0" }}>
        {hotList.length === 0 && whaleList.length === 0 ? (
          <div style={{ textAlign: "center", color: T.faint, padding: "60px 30px", fontSize: 14, lineHeight: 1.6 }}>
            {ready ? (<>Nothing to follow up yet.<br />Any call you score 9 or 10 lands here automatically.</>) : "Loading…"}
          </div>
        ) : mobileFilter && mobileGroups.total === 0 ? (
          <div style={{ textAlign: "center", color: T.dim, padding: "40px 30px", fontSize: 12.5 }}>
            Nothing matches this filter.{" "}
            <button type="button" onClick={() => setMobileFilter(null)}
              style={{ background: "none", border: "none", color: T.greenBright, fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>
              Show all
            </button>
          </div>
        ) : (
          mobileGroups.groups.map((g) => (
            <div key={g.key}>
              {/* Sticky tier header. Wash layered over bg1 so scrolling rows
                  never show through; the count is always g.rows.length. */}
              <div style={{ position: "sticky", top: "env(safe-area-inset-top, 0px)", zIndex: 5, display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 -12px", padding: "7px 16px", background: `linear-gradient(0deg, ${g.wash}, ${g.wash}), ${T.bg1}`, borderTop: `1px solid ${g.rule}`, borderBottom: `1px solid ${g.rule}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: g.color }}>{g.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: g.color }}>{g.rows.length}</span>
              </div>
              {g.rows.map((p) => {
                const id = idFromPhone(p.phone);
                const ts = lastTouchTs(followUps[id]);
                const info = infoOf(id);
                const rCount = repliesOf(followUps[id]).length;
                const rTs = lastReplyTs(followUps[id]);
                return (
                  <MobileQueueRow key={id} prospect={p} tier={g.key}
                    reply={rCount ? { count: rCount, days: rTs ? Math.floor((Date.now() - rTs) / 86400000) : null, owed: rTs > (ts || 0) } : null}
                    days={ts ? Math.floor((Date.now() - ts) / 86400000) : null}
                    rampDays={info.sinceTs ? Math.floor((Date.now() - info.sinceTs) / 86400000) : null}
                    dueDays={info.dueDays}
                    fire={fireSet.has(id)} whale={whaleSet.has(id)} checked={racSet.has(id)}
                    onReply={() => handleLogReply(id)}
                    onOpen={() => setOpenId(id)} />
                );
              })}
            </div>
          ))
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
                    dueDay={COLD_DUE_DAYS}
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
