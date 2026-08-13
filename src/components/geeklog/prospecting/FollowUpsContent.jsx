import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { T, FF } from "../gl2Tokens";
import { getCachedProspects, loadProspects, persistFollowUps, persistSoi, setCachedSoi, persistPin, setCachedPinned, persistManualContact } from "./prospectStore";
import { idFromPhone, followUpQueue, isTopScore, isPinnedMember, qualifiesForFollowUp, manualContactTsvRow } from "./prospectsModel";
import { FollowUpDetail } from "./FollowUpDetail";
import { ContactQueueRow } from "./ContactQueueRow";
import { AddToFollowUpsSheet } from "./AddToFollowUpsSheet";
import { StatusBarCap, Toast } from "./ProspectingContent";
import { copyText } from "./clipboard";
import { quietAction } from "./detailActionStyles";

// Follow Ups tab: contacts whose call log scored 9 or 10 (derived membership),
// sorted by neglect. Log repeated auto-dated touches per contact; full history per
// contact. Shares the prospect store with the Prospecting tab, so a call scored
// 9+ shows up here on the next tab switch without a reload.
export function FollowUpsContent({ apiKey }) {
  const seed = getCachedProspects();
  const [prospects, setProspects] = useState(() => seed?.prospects || []);
  const [logs, setLogs] = useState(() => seed?.logs || {});
  const [followUps, setFollowUps] = useState(() => seed?.followUps || {});
  const [soi, setSoi] = useState(() => seed?.soi || {});
  const [pinned, setPinned] = useState(() => seed?.pinned || []);
  const [ready, setReady] = useState(!!seed);
  const [view, setView] = useState("queue");
  const [openId, setOpenId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const fuRef = useRef(followUps);
  fuRef.current = followUps;
  const soiRef = useRef(soi);
  soiRef.current = soi;
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;

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
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [apiKey]);

  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);
  const queue = useMemo(() => followUpQueue(prospects, logs, followUps, soi, pinnedSet), [prospects, logs, followUps, soi, pinnedSet]);
  const openProspect = prospects.find((p) => idFromPhone(p.phone) === openId) || null;

  // Why a search hit may not be addable, shown on the row before it is tapped.
  const describeStatus = useCallback((id) => {
    if (soi[id]) return "Already in your SOI";
    if (qualifiesForFollowUp(logs[id]) || pinnedSet.has(id)) return "Already in Follow Ups";
    const score = logs[id]?.score;
    return score ? `Logged at ${score}/10` : "";
  }, [logs, soi, pinnedSet]);

  const handleLogFollowUp = useCallback((id, note) => {
    const next = [...(fuRef.current[id] || []), { ts: Date.now(), note }];
    setFollowUps((prev) => ({ ...prev, [id]: next }));
    persistFollowUps(apiKey, id, next);
    showToast("Follow up logged");
  }, [apiKey, showToast]);

  // Promote to SOI: optimistic, then straight back to the queue, where the
  // contact no longer belongs. On a failed write put the previous map back in
  // both this view and the shared cache.
  const handleAddToSoi = useCallback((id) => {
    const prev = soiRef.current;
    setSoi({ ...prev, [id]: String(Date.now()) });
    setView("queue");
    setOpenId(null);
    showToast("Added to SOI");
    persistSoi(apiKey, id, "add").catch(() => {
      setSoi(prev);
      setCachedSoi(prev);
      showToast("Could not update SOI");
    });
  }, [apiKey, showToast]);

  // Pin a contact into Follow Ups, or take them out. Optimistic with a revert,
  // same shape as the SOI write.
  const setPin = useCallback((id, action, message) => {
    const prev = pinnedRef.current;
    const next = action === "add"
      ? (prev.includes(id) ? prev : [...prev, id])
      : prev.filter((x) => x !== id);
    setPinned(next);
    if (message) showToast(message);
    persistPin(apiKey, id, action).catch(() => {
      setPinned(prev);
      setCachedPinned(prev);
      showToast("Could not update Follow Ups");
    });
  }, [apiKey, showToast]);

  // Tapping a search result. Someone already in Follow Ups or SOI is left alone:
  // the toast says where they are rather than duplicating anything.
  const handlePinFromSheet = useCallback((p) => {
    const id = idFromPhone(p.phone);
    if (soiRef.current[id]) { showToast(`${p.name} is already in your SOI`); return; }
    if (qualifiesForFollowUp(logs[id]) || pinnedRef.current.includes(id)) {
      showToast(`${p.name} is already in Follow Ups`);
      return;
    }
    setPin(id, "add", `${p.name} added to Follow Ups`);
    setSheetOpen(false);
  }, [logs, setPin, showToast]);

  // Create a manual contact. The server pins it, so the local pin is applied from
  // the confirmed response rather than optimistically.
  const handleCreateContact = useCallback(async (input) => {
    const { contact, cache } = await persistManualContact(apiKey, input);
    setProspects(cache.prospects);
    setPinned(cache.pinned);
    setSheetOpen(false);
    showToast(`${contact.name} added to Follow Ups`);
  }, [apiKey, showToast]);

  const handleCopyForExcel = useCallback((p) => {
    copyText(manualContactTsvRow(p)).then(
      () => showToast("Contact row copied"),
      () => showToast("Copy failed"),
    );
  }, [showToast]);

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
          onToast={showToast}
          onAddToSoi={() => handleAddToSoi(id)}
          onCopyForExcel={openProspect.manual ? () => handleCopyForExcel(openProspect) : null}
          footerAction={isPinnedMember(id, pinnedSet, soi) ? (
            <button type="button" onClick={() => { setPin(id, "remove", `${openProspect.name} removed from Follow Ups`); setView("queue"); setOpenId(null); }} style={quietAction}>
              Remove from Follow Ups
            </button>
          ) : null}
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
            {ready ? (
              <>Nothing to follow up yet.<br />Any call you score 9 or 10 lands here automatically.</>
            ) : "Loading…"}
          </div>
        ) : (
          queue.map((p) => {
            const id = idFromPhone(p.phone);
            return (
              <ContactQueueRow key={id} prospect={p}
                touches={followUps[id] || []}
                highlight={isTopScore(logs[id])}
                badge={p.manual ? "manual" : ""}
                onOpen={() => { setOpenId(id); setView("detail"); }}
              />
            );
          })
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
