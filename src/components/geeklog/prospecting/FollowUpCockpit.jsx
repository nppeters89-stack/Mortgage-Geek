import { useState, useRef, useMemo, useEffect } from "react";
import { T, FF, stageRampColor, staleColor } from "../gl2Tokens";
import { idFromPhone, stageOf, coldCount, coldColIndex, lastTouchTs, qualifiesForFollowUp, isTopScore, heatColor, COLD_COLUMNS, WHALE_COLUMNS, COLD_CHECKIN_CAP } from "./prospectsModel";
import { ColdPips } from "./StageDots";
import { fireConfetti } from "./confetti";

// The desktop Follow Up cockpit (viewport >= 900px), matching followup_cockpit
// preview v3 section by section: a gamified stat strip, the seven-stage hot drag
// board, a collapsible five-column cold pipeline, and a dead box. Positions come
// from touch data plus the cold/dead hashes, EXCEPT hand placements: a drag onto
// a stage column is a plain move stored in the stagemap hash (no touch logged,
// works in both directions), and stageOf treats it as the new ratchet base.
// Drag-and-drop is native HTML5, no library. The interaction grammar: drag a
// card to any stage to move it; the goal column is the exception, promoting to
// SOI (with confetti) after asking for the referral note; drag down to cold when
// someone goes quiet and further down to the dead box to let go. Touches are
// logged from the card's detail view. A card click opens the shared
// detail (onOpenDetail). Data mutations run through the parent's handlers so the
// mobile list and this board write through exactly one path. Colors from
// gl2Tokens; no hardcoded hex.

// The RAC check, same visual language as the mobile queue rows: green check
// beside the name once the contact has been entered into the CRM.
const RacCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    role="img" aria-label="In RAC" style={{ flex: "none" }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const DAY = 86400000;
const rel = (ts) => { if (!ts) return "No touches"; const d = Math.round((Date.now() - ts) / DAY); return d <= 0 ? "Today" : d === 1 ? "1d ago" : `${d}d ago`; };
const isStale = (ts) => !!ts && Date.now() - ts > 14 * DAY;
// Days since a timestamp, for the urgency ramp (null = never).
const dSince = (ts) => (ts ? Math.floor((Date.now() - ts) / DAY) : null);
const isMember = (id, logs, pinnedSet) => qualifiesForFollowUp(logs[id]) || pinnedSet.has(id);

export function FollowUpCockpit({
  prospects, logs, followUps, soi, pinnedSet, cold, dead, stages, goalIndex, weekTarget, stagemap, motivation, rac, whaleSet,
  onOpenDetail, onOpenSoi, onLogTouch, onMoveStage, onColdCheckIn, onMoveToCold, onMarkDead, onRestore, onRevive, onReviveSilent,
}) {
  const drag = useRef(null); // { id, from: "hot" | "cold" }
  const [over, setOver] = useState(null); // highlight key, e.g. "hot:3" | "cold:2" | "tray" | "dead"
  const [pop, setPop] = useState(null); // { type, id, targetStage }
  // Collapsed stage columns (indices). Collapsing hides the card list; the
  // header stays a drop target, so a card can still be dragged onto it.
  const [collapsedCols, setCollapsedCols] = useState(() => new Set());
  // Two-across only on screens that genuinely fit it. Below the gate every
  // column is a single stack and the board scrolls sideways - columns never
  // compress into a squeezed, overlapping middle state.
  const [ultra, setUltra] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1600px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1600px)");
    const onChange = (e) => setUltra(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const toggleCol = (si) => setCollapsedCols((prev) => {
    const next = new Set(prev);
    if (next.has(si)) next.delete(si); else next.add(si);
    return next;
  });

  const touchesOf = (id) => followUps[id] || [];
  const stageFor = (id) => stageOf(touchesOf(id), { isSoi: !!soi[id], goalIndex, override: stagemap[id] });

  // Board columns: active pipeline members plus SOI members (SOI sits in the goal
  // column via the stageOf exception), minus cold and dead. Each column oldest
  // last-touch first, so the most neglected sit at the top.
  const board = useMemo(() => {
    const cols = stages.map(() => []);
    prospects.forEach((p) => {
      const id = idFromPhone(p.phone);
      if (cold[id] || dead[id] || whaleSet?.has(id)) return;
      if (!(isMember(id, logs, pinnedSet) || soi[id])) return;
      cols[stageOf(followUps[id] || [], { isSoi: !!soi[id], goalIndex, override: stagemap[id] })].push(p);
    });
    cols.forEach((c) => c.sort((a, b) => (lastTouchTs(followUps[idFromPhone(a.phone)]) || 0) - (lastTouchTs(followUps[idFromPhone(b.phone)]) || 0)));
    return cols;
  }, [prospects, logs, followUps, soi, pinnedSet, cold, dead, stages, goalIndex, stagemap, whaleSet]);

  // Whale board: whales not cold and not dead, placed by the same stage ratchet
  // as the hot board (same stagemap drags), mapped onto the seven value-add
  // columns. Exclusive: these contacts do not appear on the hot board.
  const whaleCols = useMemo(() => {
    const cols = WHALE_COLUMNS.map(() => []);
    prospects.forEach((p) => {
      const id = idFromPhone(p.phone);
      if (!whaleSet?.has(id) || cold[id] || dead[id]) return;
      const si = Math.min(stageOf(followUps[id] || [], { goalIndex, override: stagemap[id] }), WHALE_COLUMNS.length - 1);
      cols[si].push(p);
    });
    cols.forEach((c) => c.sort((a, b) => (lastTouchTs(followUps[idFromPhone(a.phone)]) || 0) - (lastTouchTs(followUps[idFromPhone(b.phone)]) || 0)));
    return cols;
  }, [prospects, followUps, cold, dead, stagemap, goalIndex, whaleSet]);
  const whaleTotal = whaleCols.reduce((n, c) => n + c.length, 0);

  const coldCols = useMemo(() => {
    const cols = COLD_COLUMNS.map(() => []);
    prospects.forEach((p) => {
      const id = idFromPhone(p.phone);
      if (!cold[id] || dead[id]) return;
      cols[coldColIndex(followUps[id])].push(p);
    });
    cols.forEach((c) => c.sort((a, b) => (lastTouchTs(followUps[idFromPhone(a.phone)]) || 0) - (lastTouchTs(followUps[idFromPhone(b.phone)]) || 0)));
    return cols;
  }, [prospects, followUps, cold, dead]);

  const deadList = useMemo(() => prospects.filter((p) => dead[idFromPhone(p.phone)]), [prospects, dead]);
  const coldTotal = coldCols.reduce((n, c) => n + c.length, 0);

  const stats = useMemo(() => {
    const all = [];
    prospects.forEach((p) => { const id = idFromPhone(p.phone); if (dead[id]) return; (followUps[id] || []).forEach((t) => all.push(t)); });
    const dayKey = (ts) => new Date(ts).toDateString();
    const days = new Set(all.map((t) => dayKey(t.ts)));
    let streak = 0; const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
    const week = all.filter((t) => t.stage !== -3 && Date.now() - t.ts < 7 * DAY).length;
    const activeMembers = prospects.filter((p) => { const id = idFromPhone(p.phone); return !cold[id] && !dead[id] && !soi[id] && isMember(id, logs, pinnedSet); });
    const cov = activeMembers.length ? Math.round(activeMembers.filter((p) => { const ts = lastTouchTs(followUps[idFromPhone(p.phone)]); return ts && !isStale(ts); }).length / activeMembers.length * 100) : 100;
    const soiCount = prospects.filter((p) => { const id = idFromPhone(p.phone); return soi[id] && !dead[id]; }).length;
    return { streak, week, cov, soiCount };
  }, [prospects, logs, followUps, soi, pinnedSet, cold, dead]);

  // ----- drag plumbing -----
  const startDrag = (id, from) => (e) => {
    drag.current = { id, from };
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", id); } catch { /* Safari */ } }
  };
  const endDrag = () => { drag.current = null; setOver(null); };
  const allow = (key) => (e) => { e.preventDefault(); if (over !== key) setOver(key); };
  // Same, but stops the event bubbling to the cold tray so hovering a cold column
  // highlights the column, not the whole tray.
  const allowStop = (key) => (e) => { e.preventDefault(); e.stopPropagation(); if (over !== key) setOver(key); };

  const dropHot = (si) => (e) => {
    e.preventDefault(); setOver(null);
    const d = drag.current; if (!d) return;
    const { id, from } = d;
    if (from === "cold") {
      // Landing on the card's own derived stage is a plain revive (toasted).
      // Landing anywhere else revives silently and places the card there; the
      // goal column opens the promote popover instead of moving.
      const derived = stageOf(touchesOf(id), { goalIndex, override: stagemap[id] });
      if (si === goalIndex) { onReviveSilent(id); setPop({ type: "stage", id, targetStage: si }); }
      else if (si === derived) onRevive(id);
      else { onReviveSilent(id); onMoveStage(id, si); }
      return;
    }
    if (si === stageFor(id)) return;
    // An SOI member sits in the goal column by membership; dragging one to an
    // earlier stage would fight the soi hash. Demote from the SOI tab instead.
    if (soi[id] && si !== goalIndex) return;
    // The goal column is a promotion (SOI membership + confetti), so it still
    // asks how the referral came in. Every other column is a plain move: the
    // card goes where it was dropped, no touch logged. Log touches from the
    // card's detail view (or by promoting).
    if (si === goalIndex) { setPop({ type: "stage", id, targetStage: si }); return; }
    onMoveStage(id, si);
  };

  const dropCold = (ci, stop) => (e) => {
    e.preventDefault(); if (stop) e.stopPropagation(); setOver(null);
    const d = drag.current; if (!d) return;
    const { id, from } = d;
    if (from !== "cold") {
      if (soi[id] || dead[id]) return; // SOI cards do not go cold this phase
      onMoveToCold(id);
      return;
    }
    // a cold card: a rightward drop below the cap logs one check-in
    if (ci != null && ci > coldColIndex(followUps[id]) && coldCount(followUps[id]) < COLD_CHECKIN_CAP) {
      setPop({ type: "cold", id });
    }
  };

  const dropWhale = (wi) => (e) => {
    e.preventDefault(); e.stopPropagation(); setOver(null);
    const d = drag.current; if (!d) return;
    const { id, from } = d;
    if (from === "cold") { onReviveSilent(id); if (wi !== stageOf(followUps[id] || [], { goalIndex, override: stagemap[id] })) onMoveStage(id, wi); return; }
    if (wi === stageOf(followUps[id] || [], { goalIndex, override: stagemap[id] })) return;
    onMoveStage(id, wi);
  };

  const dropDead = (e) => {
    e.preventDefault(); setOver(null);
    const d = drag.current; if (!d) return;
    if (soi[d.id]) return; // SOI cards do not go to the dead box this phase
    setPop({ type: "dead", id: d.id });
  };

  const closePop = () => setPop(null);
  const savePop = (note) => {
    if (!pop) return;
    if (pop.type === "stage") { onLogTouch(pop.id, note, pop.targetStage); if (pop.targetStage === goalIndex) fireConfetti(); }
    else if (pop.type === "cold") onColdCheckIn(pop.id, note);
    else if (pop.type === "dead") onMarkDead(pop.id, note);
    closePop();
  };

  // Card render helpers as plain functions (not inner components), so the frequent
  // `over` state changes during a drag do not give the cards a new component type
  // and remount them, which would cancel the in-progress native drag.
  const hotCard = (p) => {
    const id = idFromPhone(p.phone);
    const ts = lastTouchTs(followUps[id]);
    const count = (followUps[id] || []).length;
    // Same green wash the mobile queue rows use for a 10/10 interaction score:
    // the hottest leads stay visibly hot on the board.
    const top = isTopScore(logs[id]);
    return (
      <div key={id} draggable onDragStart={startDrag(id, "hot")} onDragEnd={endDrag} onClick={() => onOpenDetail(id)}
        style={{ boxSizing: "border-box", flex: "none", width: "100%", maxWidth: 200, minWidth: 0, overflow: "hidden", background: top ? T.greenWash : T.surface, border: `1px solid ${top ? T.greenWashLine : T.line}`, borderRadius: 11, padding: "12px 13px", cursor: "grab", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 16.5, lineHeight: 1.2, color: T.cream, minWidth: 0, overflowWrap: "break-word" }}>{p.name}{whaleSet?.has(id) ? " 🐳" : ""}{soi[id] ? " 🤝" : ""}</div>
          {rac?.has(id) && <RacCheck />}
          {!!motivation?.[id] && <span title="Motivation noted" style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: T.orange }} />}
        </div>
        <div style={{ fontSize: 11.5, color: T.dim, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 9, fontSize: 11, color: T.faint }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{count} touch{count === 1 ? "" : "es"}</span>
          <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 6 }}>
            {!!logs[id]?.score && <span title="Interaction score from the first call" style={{ fontWeight: 700, color: heatColor(logs[id].score), fontVariantNumeric: "tabular-nums" }}>{logs[id].score}/10</span>}
            <span style={{ color: staleColor(dSince(ts), T.faint) }}>{rel(ts)}</span>
          </span>
        </div>
      </div>
    );
  };

  const coldCard = (p) => {
    const id = idFromPhone(p.phone);
    const n = coldCount(followUps[id]);
    const ts = lastTouchTs(followUps[id]);
    return (
      <div key={id} draggable onDragStart={startDrag(id, "cold")} onDragEnd={endDrag} onClick={() => onOpenDetail(id)}
        style={{ boxSizing: "border-box", flex: "none", width: "100%", maxWidth: 200, minWidth: 0, overflow: "hidden", background: T.surface, border: `1px solid ${T.coldWashLine}`, borderRadius: 11, padding: "11px 12px", cursor: "grab", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 15.5, lineHeight: 1.2, color: T.cream, minWidth: 0, overflowWrap: "break-word" }}>{p.name}</div>
          {rac?.has(id) && <RacCheck />}
          {!!motivation?.[id] && <span title="Motivation noted" style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: T.orange }} />}
        </div>
        <div style={{ fontSize: 11, color: T.dim, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <ColdPips count={n} />
          {!!logs[id]?.score && <span title="Interaction score from the first call" style={{ fontSize: 10, fontWeight: 700, color: heatColor(logs[id].score), fontVariantNumeric: "tabular-nums" }}>{logs[id].score}/10</span>}
          <span style={{ fontSize: 10, color: T.faint }}>{rel(ts)}</span>
        </div>
        {n >= COLD_CHECKIN_CAP && <div style={{ marginTop: 7, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: T.amber, textTransform: "uppercase" }}>Consider the dead box</div>}
      </div>
    );
  };

  // Busy columns (6+ cards) go two-across on ultrawide screens (the gate
  // above); everywhere else every column is a single 220px stack. border-box
  // throughout: this route has no global reset, and content-box arithmetic is
  // what let cards paint wider than their tracks.
  const colShell = (isGoal, wide) => ({ boxSizing: "border-box", flex: wide ? "2 0 440px" : "1 0 220px", minWidth: wide ? 440 : 220, background: T.colWash, border: `1px solid ${isGoal ? T.redWashLine : T.line}`, borderRadius: 14, display: "flex", flexDirection: "column", maxHeight: "56vh" });
  const colHead = { padding: "12px 14px 9px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "baseline", justifyContent: "space-between" };
  const colTitle = (color) => ({ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color });
  const colBody = { boxSizing: "border-box", padding: 10, display: "flex", flexDirection: "column", gap: 9, overflowY: "auto", overflowX: "hidden", minHeight: 64, flex: 1 };
  // The two-across body for busy ultrawide columns is deliberately NOT a CSS
  // grid: it is a row of two independent flex stacks, the same primitive as the
  // single-stack columns that render correctly on every screen. (The grid
  // version showed vertical overlap on some monitors; twin stacks make that
  // structurally impossible - each half is just a normal card stack.)
  const wideBody = { ...colBody, flexDirection: "row", alignItems: "flex-start" };
  const halfStack = { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 9 };

  return (
    <div style={{ padding: "18px 26px 40px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Follow Up Cockpit</h1>
      </div>

      {/* Stat strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="Day streak"><span style={{ color: T.redLift, marginRight: 7 }}>{"▲"}</span>{stats.streak}</Stat>
        <Stat label="Touches this week" extra={<div style={{ height: 5, background: T.bg0, borderRadius: 3, marginTop: 8, overflow: "hidden", minWidth: 110 }}><div style={{ height: "100%", width: `${Math.min(100, (stats.week / weekTarget) * 100)}%`, background: T.redLift, borderRadius: 3, transition: "width .4s" }} /></div>}>
          {stats.week}<span style={{ fontSize: 12, color: T.faint }}> / {weekTarget}</span>
        </Stat>
        <Stat label="14 day coverage" color={stats.cov < 70 ? T.amber : T.green}>{stats.cov}%</Stat>
        <Stat label="In SOI" color={T.redLift}>{stats.soiCount}</Stat>
      </div>

      <div style={{ fontSize: 12.5, color: T.faint, marginBottom: 12 }}>Drag a card to any stage to move it, no touch logged. Open a card and tap the whale by the name to move a top producer to their own pipeline. Drop on the goal column to promote to SOI. Drag down to cold when someone goes quiet, further down to the dead box to let go. Click any card for the full view and to log touches.</div>

      {/* Hot board */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", overflowX: "auto", paddingBottom: 18 }}>
        {stages.map((label, si) => {
          const isGoal = si === goalIndex;
          const key = `hot:${si}`;
          const ramp = stageRampColor(si, stages.length);
          const shut = collapsedCols.has(si);
          const wide = !shut && ultra && board[si].length >= 6;
          return (
            <div key={si} style={{ ...colShell(isGoal, wide), outline: over === key ? `2px solid ${T.line}` : "none" }} onDragOver={allow(key)} onDragLeave={() => setOver(null)} onDrop={dropHot(si)}>
              {/* Header doubles as the collapse toggle, color-coded to the same
                  dark-red-to-neon-yellow ramp as the mobile stage notches. */}
              <div style={{ display: "flex", alignItems: "stretch", borderBottom: shut ? "none" : `1px solid ${T.line}` }}>
                <button type="button" onClick={() => toggleCol(si)} aria-expanded={!shut}
                  style={{ ...colHead, flex: 1, minWidth: 0, background: "none", border: "none", cursor: "pointer", fontFamily: FF.body, alignItems: "center", borderBottom: "none" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span style={{ flex: "none", width: 14, height: 5, borderRadius: 3, background: ramp }} />
                    <span style={{ ...colTitle(ramp), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
                  </span>
                  <span style={{ flex: "none", fontSize: 12, color: T.faint }}>{board[si].length} <span style={{ fontSize: 10 }}>{shut ? "▸" : "▾"}</span></span>
                </button>
                {/* The goal column doubles as the door to the SOI cockpit. A
                    sibling, not a child: buttons cannot nest. Drop behavior is
                    untouched - it lives on the column shell. */}
                {isGoal && onOpenSoi && (
                  <button type="button" onClick={onOpenSoi} title="Open the SOI cockpit" aria-label="Open the SOI cockpit"
                    style={{ flex: "none", alignSelf: "center", margin: "0 10px 0 0", background: "none", border: `1px solid ${T.line}`, borderRadius: 999, padding: "3px 10px", color: T.amber, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FF.body }}>
                    →
                  </button>
                )}
              </div>
              {!shut && (
                <div style={{ ...(wide ? wideBody : colBody), background: over === key ? T.lineSoft : "transparent" }}>
                  {wide ? (
                    <>
                      <div style={halfStack}>{board[si].filter((_, i) => i % 2 === 0).map((p) => hotCard(p))}</div>
                      <div style={halfStack}>{board[si].filter((_, i) => i % 2 === 1).map((p) => hotCard(p))}</div>
                    </>
                  ) : (
                    board[si].map((p) => hotCard(p))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Whale pipeline: exclusive tray for top producers, above cold. */}
      <details open style={{ margin: "6px 0 14px", border: `1px solid ${T.whaleWashLine}`, borderRadius: 14, overflow: "hidden" }}>
        <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer", background: T.whaleWash }}>
          <span style={colTitle(T.whale)}>{"🐳"} Whale Pipeline · {whaleTotal}</span>
          <span style={{ fontSize: 11.5, color: T.faint }}>Top producers, nurtured on their own track. Drag between value adds; the whale button beside the name in an open card sends them here.</span>
        </summary>
        <div style={{ display: "flex", gap: 12, padding: 12, overflowX: "auto", alignItems: "flex-start" }}>
          {WHALE_COLUMNS.map((label, wi) => {
            const key = `whale:${wi}`;
            return (
              <div key={wi} style={{ boxSizing: "border-box", flex: "1 0 218px", minWidth: 218, background: "transparent", border: `1px solid ${T.whaleWashLine}`, borderRadius: 12, display: "flex", flexDirection: "column", maxHeight: "40vh" }}
                onDragOver={allowStop(key)} onDragLeave={() => setOver(null)} onDrop={dropWhale(wi)}>
                <div style={colHead}><span style={colTitle(T.whale)}>{label}</span><span style={{ fontSize: 12, color: T.faint }}>{whaleCols[wi].length}</span></div>
                <div style={{ ...colBody, background: over === key ? T.whaleWash : "transparent" }}>
                  {whaleCols[wi].map((p) => hotCard(p))}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Cold pipeline */}
      <details open style={{ margin: "6px 0 14px", border: `1px solid ${T.coldWashLine}`, borderRadius: 14, overflow: "hidden", background: over === "tray" ? T.coldWash : "transparent" }}
        onDragOver={allow("tray")} onDragLeave={() => setOver(null)} onDrop={dropCold(null, false)}>
        <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer", background: T.coldWash }}>
          <span style={colTitle(T.cold)}>Cold Pipeline · {coldTotal}</span>
          <span style={{ fontSize: 11.5, color: T.faint }}>Drag one column right to log a check-in. Drag back up to revive.</span>
        </summary>
        <div style={{ display: "flex", gap: 12, padding: 12, overflowX: "auto", alignItems: "flex-start" }}>
          {COLD_COLUMNS.map((label, ci) => {
            const key = `cold:${ci}`;
            return (
              <div key={ci} style={{ boxSizing: "border-box", flex: "1 0 218px", minWidth: 218, background: "transparent", border: `1px solid ${T.coldWashLine}`, borderRadius: 12, display: "flex", flexDirection: "column", maxHeight: "40vh" }}
                onDragOver={allowStop(key)} onDragLeave={() => setOver(null)} onDrop={dropCold(ci, true)}>
                <div style={colHead}><span style={colTitle(T.cold)}>{label}</span><span style={{ fontSize: 12, color: T.faint }}>{coldCols[ci].length}</span></div>
                <div style={{ ...colBody, background: over === key ? T.coldWash : "transparent" }}>
                  {coldCols[ci].map((p) => coldCard(p))}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Dead box */}
      <div onDragOver={allow("dead")} onDragLeave={() => setOver(null)} onDrop={dropDead}
        style={{ border: `1.5px dashed ${over === "dead" ? T.redLift : T.faint}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: over === "dead" ? T.redWash : "transparent", transition: "background .15s, border-color .15s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22, filter: "grayscale(0.3)" }}>{"💀"}</span>
          <div>
            <div style={colTitle(T.dim)}>Dead</div>
            <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>Drag here to let a prospect go. They leave the pipeline for good.</div>
          </div>
        </div>
        <button type="button" onClick={() => setPop({ type: "buried" })}
          style={{ fontSize: 12.5, fontWeight: 700, color: T.dim, border: `1px solid ${T.line}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer", background: "none", fontFamily: FF.body }}>
          {deadList.length} buried
        </button>
      </div>

      {pop && (
        <CockpitPopover pop={pop} stages={stages} goalIndex={goalIndex} deadList={deadList}
          followUps={followUps} onSave={savePop} onClose={closePop} onRestore={(id) => { onRestore(id); }} />
      )}
    </div>
  );
}

function Stat({ label, children, extra = null, color = "inherit" }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 16px", minWidth: 130 }}>
      <div style={{ fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", color }}>{children}</div>
      <div style={{ fontSize: 10, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{label}</div>
      {extra}
    </div>
  );
}

// The lightweight action popover for the drag gestures (log a stage touch, log a
// cold check-in, mark dead) and the buried restore list. The full contact detail
// is a separate, shared component the parent renders on a card click.
function CockpitPopover({ pop, stages, goalIndex, deadList, followUps, onSave, onClose, onRestore }) {
  const [note, setNote] = useState("");
  const scrim = { position: "fixed", inset: 0, background: "rgba(22,23,26,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 };
  const box = { background: T.bg0, border: `1px solid ${T.line}`, borderRadius: 16, width: "100%", maxWidth: 460, maxHeight: "86vh", overflowY: "auto", padding: 22 };
  const ta = { width: "100%", marginTop: 12, minHeight: 80, resize: "vertical", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12, fontFamily: FF.body, fontSize: 14.5, lineHeight: 1.5 };
  const row = { display: "flex", gap: 10, marginTop: 12 };
  const btn = (bg, fg, border) => ({ flex: 1, padding: 12, borderRadius: 11, border: border || "none", background: bg, color: fg, fontFamily: FF.body, fontSize: 15, fontWeight: 700, cursor: "pointer" });
  const stop = (e) => e.stopPropagation();

  const goal = pop.type === "stage" && pop.targetStage === goalIndex;
  const heading = pop.type === "stage" ? (goal ? "Promote to SOI" : `Log: ${stages[pop.targetStage]}`)
    : pop.type === "cold" ? "Cold check-in"
    : pop.type === "dead" ? "Mark as dead"
    : "Buried";
  const headColor = pop.type === "cold" ? T.cold : pop.type === "dead" ? T.dim : T.redLift;

  if (pop.type === "buried") {
    return (
      <div style={scrim} onClick={onClose}>
        <div style={box} onClick={stop}>
          <h3 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 22, color: T.cream }}>{"💀"} Buried</h3>
          {deadList.length === 0 ? (
            <div style={{ fontSize: 13, color: T.dim, marginTop: 10 }}>Nobody here. Good.</div>
          ) : deadList.map((p) => (
            <div key={idFromPhone(p.phone)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 2px", borderBottom: `1px solid ${T.line}` }}>
              <div style={{ minWidth: 0, paddingRight: 10 }}><div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 16, color: T.cream, overflowWrap: "break-word" }}>{p.name}</div><div style={{ fontSize: 11, color: T.dim, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || " "}</div></div>
              <button type="button" onClick={() => { onRestore(idFromPhone(p.phone)); onClose(); }} style={{ background: "none", border: `1px solid ${T.greenWashLine}`, color: T.green, borderRadius: 8, padding: "7px 13px", fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Restore</button>
            </div>
          ))}
          <div style={row}><button type="button" onClick={onClose} style={btn("none", T.dim, `1px solid ${T.line}`)}>Close</button></div>
        </div>
      </div>
    );
  }

  return (
    <div style={scrim} onClick={onClose}>
      <div style={box} onClick={stop}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: headColor }}>{heading}</div>
        {pop.type === "dead" && <div style={{ fontSize: 13, color: T.dim, marginTop: 10 }}>They leave the pipeline entirely. History is kept and you can restore them later from the buried list.</div>}
        <textarea autoFocus value={note} onChange={(e) => setNote(e.target.value)} style={ta}
          placeholder={pop.type === "cold" ? "Light touch. What did you send or say..." : goal ? "How did the referral come in..." : pop.type === "dead" ? "Optional. Why are you letting go..." : "What did this touch look like..."} />
        <div style={row}>
          <button type="button" onClick={onClose} style={btn("none", T.dim, `1px solid ${T.line}`)}>Cancel</button>
          <button type="button" onClick={() => onSave(note.trim())} disabled={pop.type !== "dead" && !note.trim()}
            style={btn(pop.type !== "dead" && !note.trim() ? T.surface : pop.type === "cold" ? T.cold : pop.type === "dead" ? T.redLift : goal ? T.redLift : T.green, pop.type !== "dead" && !note.trim() ? T.faint : T.cream)}>
            {pop.type === "cold" ? "Log check-in" : pop.type === "dead" ? "Mark dead" : goal ? "Promote" : "Log touch"}
          </button>
        </div>
      </div>
    </div>
  );
}
