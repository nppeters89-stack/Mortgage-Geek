import { useState, useRef, useMemo, useEffect } from "react";
import { T, FF, stageRampColor, whaleRampColor, staleColor, staleWash, STAGE_RAMP } from "../gl2Tokens";
import { TriageHud, HudHelp, ConvoBar } from "./TriageHud";
import { idFromPhone, stageOf, coldCount, coldColIndex, lastTouchTs, qualifiesForFollowUp, isTopScore, isDueForTouch, dueDaysFor, heatColor, COLD_COLUMNS, WHALE_COLUMNS, COLD_CHECKIN_CAP, COLD_DUE_DAYS, STALE_DAYS, REPLY_STAGE, dueInfoFor, repliesOf, lastReplyTs, fireFirst, weekScoreboard, shortStage, e164Phone, hasMotivation } from "./prospectsModel";
import { ColdPips } from "./StageDots";
import { LoggedDatePicker, ReplyDateDialog, todayLocalISO, tsForLoggedDate } from "./LoggedDatePicker";
import { ReplyBadge } from "./ReplyBadge";
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


const DAY = 86400000;
const rel = (ts) => { if (!ts) return "No touches"; const d = Math.round((Date.now() - ts) / DAY); return d <= 0 ? "Today" : d === 1 ? "1d ago" : `${d}d ago`; };
const isStale = (ts) => !!ts && Date.now() - ts > STALE_DAYS * DAY;
// Days since a timestamp, for the urgency ramp (null = never).
const dSince = (ts) => (ts ? Math.floor((Date.now() - ts) / DAY) : null);
const isMember = (id, logs, pinnedSet) => qualifiesForFollowUp(logs[id]) || pinnedSet.has(id);


// Occasional border pulse for hot leads: a comet of warm light laps the card
// border, then rests. The masked ring shows only the border band; the oversized
// square inside carries the conic tail and spins. Decorative only; the keyframes
// are neutralized under prefers-reduced-motion in Gl2App's style block.
function FirePulse() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 11, padding: 2, pointerEvents: "none", WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", maskComposite: "exclude" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: "300%", aspectRatio: "1 / 1", marginLeft: "-150%", marginTop: "-150%", background: `conic-gradient(transparent 0deg 300deg, ${T.orange} 354deg, transparent 360deg)`, animation: "gl-fire-orbit 6s linear infinite", opacity: 0 }} />
    </div>
  );
}

export function FollowUpCockpit({
  prospects, logs, followUps, soi, pinnedSet, cold, dead, stages, goalIndex, weekTarget, stagemap, motivation, profile, rac, whaleSet, fireSet, addedat,
  onOpenDetail, onOpenSoi, onLogTouch, onLogReply, onText, onMoveStage, onColdCheckIn, onMoveToCold, onMarkDead, onRestore, onRevive, onReviveSilent,
}) {
  const drag = useRef(null); // { id, from: "hot" | "cold" }
  const boardRef = useRef(null);
  const whaleRef = useRef(null);
  const coldRef = useRef(null);
  // Footer jump: window.scrollTo, not scrollIntoView, so the smooth scroll owns
  // the whole viewport instead of fighting the horizontal board scrollers.
  const jumpTo = (which) => {
    const el = which === "whale" ? whaleRef.current : which === "cold" ? coldRef.current : boardRef.current;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
  };
  const [over, setOver] = useState(null); // highlight key, e.g. "hot:3" | "cold:2" | "tray" | "dead"
  const [pop, setPop] = useState(null); // { type, id, targetStage }
  const [replyPop, setReplyPop] = useState(null); // { id, name } for the reply date dialog
  // Collapsed stage columns (indices). Collapsing hides the card list; the
  // header stays a drop target, so a card can still be dragged onto it.
  const [collapsedCols, setCollapsedCols] = useState(() => new Set());
  // Rail filter (2B): narrows the hot board. Whale, cold and dead sections
  // are unaffected; the goal column is a doorway and stays whole.
  const [activeFilter, setActiveFilter] = useState(null); // null | "due" | "rac" | "mot" | "fire" | "maint" | "replied" | "tens"
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
  const repliedIn = (col) => col.filter((p) => repliesOf(followUps[idFromPhone(p.phone)]).length > 0).length;
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
    const ranked = cols.map((c) => fireFirst(c, fireSet));
    if (!activeFilter) return ranked;
    // Rail filter: due keeps each column's own stage-aware clock. Header
    // counts follow the filter; the rail's segment counts do not.
    const match = (p, si) => {
      const id = idFromPhone(p.phone);
      if (activeFilter === "maint") return si === goalIndex - 1;
      if (activeFilter === "replied") return repliesOf(followUps[id]).length > 0;
      if (activeFilter === "tens") return isTopScore(logs[id]);
      if (activeFilter === "due") return dueInfoFor(followUps[id], si).due;
      if (activeFilter === "rac") return !rac?.has(id);
      if (activeFilter === "mot") return hasMotivation(id, motivation, profile);
      if (activeFilter === "fire") return fireSet?.has(id);
      return true;
    };
    const replySort = (cols) => {
      if (activeFilter !== "replied") return cols;
      const rank = (p) => {
        const id = idFromPhone(p.phone);
        const rTs = lastReplyTs(followUps[id]);
        return [rTs > (lastTouchTs(followUps[id]) || 0) ? 0 : 1, -rTs];
      };
      return cols.map((c) => [...c].sort((a, b) => { const ra = rank(a), rb = rank(b); return ra[0] - rb[0] || ra[1] - rb[1]; }));
    };
    return replySort(ranked.map((c, si) => (si === goalIndex ? c : c.filter((p) => match(p, si)))));
  }, [prospects, logs, followUps, soi, pinnedSet, cold, dead, stages, goalIndex, stagemap, whaleSet, fireSet, activeFilter, rac, motivation, profile]);

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
    const ranked = cols.map((c) => fireFirst(c, fireSet));
    if (!activeFilter) return ranked;
    // Same rail filter as the hot board; due runs each column's whale clock.
    const match = (p, wi) => {
      if (activeFilter === "maint") return false;
      const id = idFromPhone(p.phone);
      if (activeFilter === "replied") return repliesOf(followUps[id]).length > 0;
      if (activeFilter === "tens") return isTopScore(logs[id]);
      if (activeFilter === "due") return dueInfoFor(followUps[id], wi, true).due;
      if (activeFilter === "rac") return !rac?.has(id);
      if (activeFilter === "mot") return hasMotivation(id, motivation, profile);
      if (activeFilter === "fire") return fireSet?.has(id);
      return true;
    };
    const sorted = ranked.map((c, wi) => c.filter((p) => match(p, wi)));
    if (activeFilter !== "replied") return sorted;
    const rank = (p) => {
      const id = idFromPhone(p.phone);
      const rTs = lastReplyTs(followUps[id]);
      return [rTs > (lastTouchTs(followUps[id]) || 0) ? 0 : 1, -rTs];
    };
    return sorted.map((c) => [...c].sort((a, b) => { const ra = rank(a), rb = rank(b); return ra[0] - rb[0] || ra[1] - rb[1]; }));
  }, [prospects, logs, followUps, cold, dead, stagemap, goalIndex, whaleSet, fireSet, activeFilter, rac, motivation, profile]);
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
    const week = all.filter((t) => t.stage !== -3 && t.stage !== REPLY_STAGE && Date.now() - t.ts < 7 * DAY).length;
    const todayKey = dayKey(Date.now());
    const today = all.filter((t) => t.stage !== -3 && t.stage !== REPLY_STAGE && dayKey(t.ts) === todayKey).length;
    const activeMembers = prospects.filter((p) => { const id = idFromPhone(p.phone); return !cold[id] && !dead[id] && !soi[id] && isMember(id, logs, pinnedSet); });
    const cov = activeMembers.length ? Math.round(activeMembers.filter((p) => { const ts = lastTouchTs(followUps[idFromPhone(p.phone)]); return ts && !isStale(ts); }).length / activeMembers.length * 100) : 100;
    const soiCount = prospects.filter((p) => { const id = idFromPhone(p.phone); return soi[id] && !dead[id]; }).length;
    // Due now: the working queue (not whales, not SOI) whose clock has crossed
    // 7 days or never started - the same definition as the nav badge.
    const hotMembers = activeMembers.filter((p) => !whaleSet?.has(idFromPhone(p.phone)));
    const dueMembers = hotMembers.filter((p) => {
      const id = idFromPhone(p.phone);
      const fu = followUps[id];
      return dueInfoFor(fu, stageOf(fu || [], { goalIndex, override: stagemap[id] })).due;
    });
    // Whales count toward due on their own 30-day nurture clock.
    const whaleMembers = prospects.filter((p) => { const id = idFromPhone(p.phone); return whaleSet?.has(id) && !cold[id] && !dead[id]; });
    const dueWhales = whaleMembers.filter((p) => {
      const id = idFromPhone(p.phone);
      const fu = followUps[id];
      return dueInfoFor(fu, stageOf(fu || [], { goalIndex, override: stagemap[id] }), true).due;
    });
    const dueAll = [...dueMembers, ...dueWhales];
    const due = dueAll.length;
    // Days since last touch for the most neglected due card. A never-touched
    // card is more neglected than any touched one, so it wins as null.
    let oldestDue = null;
    if (dueAll.length) {
      const tss = dueAll.map((p) => lastTouchTs(followUps[idFromPhone(p.phone)]) || null);
      oldestDue = tss.includes(null) ? null : Math.floor((Date.now() - Math.min(...tss)) / DAY);
    }
    // Touches per day for the last 14 calendar days, oldest first, index 13 =
    // today. Same -3 referral exclusion as week/today.
    const dayCounts = Array.from({ length: 14 }, (_, i) => {
      const dd = new Date(); dd.setDate(dd.getDate() - (13 - i));
      const k = dd.toDateString();
      return all.filter((t) => t.stage !== -3 && t.stage !== REPLY_STAGE && dayKey(t.ts) === k).length;
    });
    // Data-capture coverage across the whole live pipeline (hot + whales + SOI):
    // motivation on file, and entered into RAC.
    const livePool = prospects.filter((p) => { const id = idFromPhone(p.phone); return !cold[id] && !dead[id] && (isMember(id, logs, pinnedSet) || soi[id]); });
    const motCount = livePool.filter((p) => hasMotivation(idFromPhone(p.phone), motivation, profile)).length;
    const racMissing = livePool.filter((p) => !rac?.has(idFromPhone(p.phone))).length;
    const motPct = livePool.length ? Math.round(motCount / livePool.length * 100) : 0;
    const racPct = livePool.length ? Math.round((livePool.length - racMissing) / livePool.length * 100) : 0;
    const whales = whaleMembers.length;
    const hotLeads = prospects.filter((p) => { const id = idFromPhone(p.phone); return fireSet?.has(id) && !cold[id] && !dead[id]; }).length;
    // Maintenance Day pool: everyone sitting in the Motivation / Maintenance
    // column (the rail adds the cold total on top for its badge).
    // Perfect 10s across the live pool (hot board and whales).
    const tensCount = prospects.filter((p) => {
      const id = idFromPhone(p.phone);
      if (cold[id] || dead[id]) return false;
      if (!(isMember(id, logs, pinnedSet) || soi[id] || whaleSet?.has(id))) return false;
      return isTopScore(logs[id]);
    }).length;
    // Replied segment badge: cards where the newest event is an inbound reply.
    const repliedOwed = prospects.filter((p) => {
      const id = idFromPhone(p.phone);
      if (cold[id] || dead[id]) return false;
      if (!(isMember(id, logs, pinnedSet) || soi[id] || whaleSet?.has(id))) return false;
      const rTs = lastReplyTs(followUps[id]);
      return rTs > (lastTouchTs(followUps[id]) || 0);
    }).length;
    const maintCount = prospects.filter((p) => {
      const id = idFromPhone(p.phone);
      if (cold[id] || dead[id] || whaleSet?.has(id)) return false;
      if (!(isMember(id, logs, pinnedSet) || soi[id])) return false;
      return stageOf(followUps[id] || [], { isSoi: !!soi[id], goalIndex, override: stagemap[id] }) === goalIndex - 1;
    }).length;
    // Weekly scoreboard (4A): shared selector, so the phone strip and this
    // panel always agree on the week.
    const { weekLabel, addedToday, addedWeek, convosWeek, repliesWeek, objectionsWeek } = weekScoreboard({ prospects, logs, followUps, soi, pinned: pinnedSet, cold, dead, addedat });
    // Of this week's conversations, how many turned into queue adds. Always a
    // share of the conversations, so it cannot exceed 100.
    const ratioPct = convosWeek ? Math.min(100, Math.round((addedWeek / convosWeek) * 100)) : 0;
    return { streak, week, today, cov, soiCount, due, motPct, racPct, motCount, racMissing, whales, hotLeads, dayCounts, oldestDue, liveCount: livePool.length, activeCount: activeMembers.length, maintCount, repliedOwed, repliesWeek, tensCount, objectionsWeek, weekLabel, addedToday, addedWeek, convosWeek, ratioPct };
  }, [prospects, logs, followUps, soi, pinnedSet, cold, dead, whaleSet, fireSet, motivation, profile, rac, stagemap, goalIndex, addedat]);

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
  const savePop = (note, ts, talked) => {
    if (!pop) return;
    if (pop.type === "stage") { onLogTouch(pop.id, note, pop.targetStage, ts, talked); if (pop.targetStage === goalIndex) fireConfetti(); }
    else if (pop.type === "cold") onColdCheckIn(pop.id, note, ts, talked);
    else if (pop.type === "dead") onMarkDead(pop.id, note);
    closePop();
  };

  // Card render helpers as plain functions (not inner components), so the frequent
  // `over` state changes during a drag do not give the cards a new component type
  // and remount them, which would cancel the in-progress native drag.
  const hotCard = (p) => {
    const id = idFromPhone(p.phone);
    const ts = lastTouchTs(followUps[id]);
    // Urgency (color) can run on the reply clock; the age label stays the
    // outbound fact.
    const info = dueInfoFor(followUps[id] || [], stageFor(id), whaleSet?.has(id));
    const dueWash = staleWash(dSince(info.sinceTs), info.dueDays);
    const replies = repliesOf(followUps[id]);
    const replyTs = lastReplyTs(followUps[id]);
    const count = (followUps[id] || []).length;
    // Same green wash the mobile queue rows use for a 10/10 interaction score:
    // the hottest leads stay visibly hot on the board.
    const top = isTopScore(logs[id]);
    const hot = fireSet?.has(id);
    return (
      <div key={id} draggable onDragStart={startDrag(id, "hot")} onDragEnd={endDrag} onClick={() => onOpenDetail(id)}
        style={{ position: "relative", boxSizing: "border-box", flex: "none", width: "100%", maxWidth: 200, minWidth: 0, overflow: "hidden", backgroundColor: T.surface, backgroundImage: dueWash ? `linear-gradient(0deg, ${dueWash}, ${dueWash})` : "none", border: `1px solid ${hot ? T.orangeWashLine : T.line}`, borderRadius: 11, padding: "12px 13px", cursor: "grab", userSelect: "none" }}>
        {hot && <FirePulse />}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 16.5, lineHeight: 1.2, color: top ? T.greenBright : T.cream, minWidth: 0, overflowWrap: "break-word" }}>{p.name}{hot ? " 🔥" : ""}{whaleSet?.has(id) ? " 🐳" : ""}{soi[id] ? " 🤝" : ""}</div>
          {!!motivation?.[id] && <span title="Motivation noted" style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: T.orange }} />}
          <ReplyBadge count={replies.length} days={replyTs ? dSince(replyTs) : null} owed={replyTs > (ts || 0)} />
        </div>
        <div style={{ fontSize: 11.5, color: T.dim, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 9, fontSize: 11, color: T.faint }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {count} touch{count === 1 ? "" : "es"}
            {activeFilter === "replied" && !hasMotivation(id, motivation, profile) && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.orange }}>no motivation</span>}
          </span>
          <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 6 }}>
            {onText && (
              <button type="button" disabled={!e164Phone(p.phone)}
                title={e164Phone(p.phone) ? "Text them" : "no valid mobile number"} aria-label={`Text ${p.name}`}
                onClick={(e) => { e.stopPropagation(); onText(p, { stage: stageFor(id), cold: false }); }}
                style={{ flex: "none", background: "none", border: "none", padding: 2, cursor: e164Phone(p.phone) ? "pointer" : "default", color: T.dim, display: "inline-flex", opacity: e164Phone(p.phone) ? 1 : 0.35 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></svg>
              </button>
            )}
            {onLogReply && (
              <button type="button" title="They replied" aria-label={`They replied: ${p.name}`}
                onClick={(e) => { e.stopPropagation(); setReplyPop({ id, name: p.name }); }}
                style={{ flex: "none", background: "none", border: "none", padding: 2, cursor: "pointer", color: T.dim, display: "inline-flex" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </button>
            )}
            <span style={{ color: staleColor(dSince(info.sinceTs), T.faint, info.dueDays) }}>{rel(ts)}</span>
          </span>
        </div>
      </div>
    );
  };

  const coldCard = (p) => {
    const id = idFromPhone(p.phone);
    const n = coldCount(followUps[id]);
    const ts = lastTouchTs(followUps[id]);
    const dueWash = staleWash(dSince(ts), COLD_DUE_DAYS);
    return (
      <div key={id} draggable onDragStart={startDrag(id, "cold")} onDragEnd={endDrag} onClick={() => onOpenDetail(id)}
        style={{ position: "relative", boxSizing: "border-box", flex: "none", width: "100%", maxWidth: 200, minWidth: 0, overflow: "hidden", backgroundColor: T.surface, backgroundImage: dueWash ? `linear-gradient(0deg, ${dueWash}, ${dueWash})` : "none", border: `1px solid ${T.coldWashLine}`, borderRadius: 11, padding: "11px 12px", cursor: "grab", userSelect: "none" }}>
        {fireSet?.has(id) && <FirePulse />}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 15.5, lineHeight: 1.2, color: T.cream, minWidth: 0, overflowWrap: "break-word" }}>{p.name}{fireSet?.has(id) ? " 🔥" : ""}</div>
          {!!motivation?.[id] && <span title="Motivation noted" style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: T.orange }} />}
        </div>
        <div style={{ fontSize: 11, color: T.dim, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.brokerage || p.lineType || " "}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <ColdPips count={n} />
            {onText && (
              <button type="button" disabled={!e164Phone(p.phone)}
                title={e164Phone(p.phone) ? "Text them" : "no valid mobile number"} aria-label={`Text ${p.name}`}
                onClick={(e) => { e.stopPropagation(); onText(p, { stage: stageFor(id), cold: true }); }}
                style={{ flex: "none", background: "none", border: "none", padding: 2, cursor: e164Phone(p.phone) ? "pointer" : "default", color: T.dim, display: "inline-flex", opacity: e164Phone(p.phone) ? 1 : 0.35 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></svg>
              </button>
            )}
          <span style={{ fontSize: 10, color: staleColor(dSince(ts), T.faint, COLD_DUE_DAYS) }}>{rel(ts)}</span>
        </div>
        {n >= COLD_CHECKIN_CAP && <div style={{ marginTop: 7, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: T.amber, textTransform: "uppercase" }}>Consider the dead box</div>}
      </div>
    );
  };

  // Busy columns (6+ cards) go two-across on ultrawide screens (the gate
  // above); everywhere else every column is a single 220px stack. border-box
  // throughout: this route has no global reset, and content-box arithmetic is
  // what let cards paint wider than their tracks.
  const colShell = (isGoal, wide) => ({ boxSizing: "border-box", flex: wide ? "2 0 440px" : "1 0 220px", minWidth: wide ? 440 : 220, maxWidth: wide ? 470 : 300, background: T.colWash, border: `1px solid ${isGoal ? T.redWashLine : T.line}`, borderRadius: 14, display: "flex", flexDirection: "column", maxHeight: "56vh" });
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
    <div style={{ padding: "2px 26px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, letterSpacing: "0.2px", color: T.cream }}>Pipeline Cockpit</h1>
          <HudHelp />
        </div>
        <ConvoBar convosWeek={stats.convosWeek} />
      </div>

      <TriageHud stats={stats} weekTarget={weekTarget} activeFilter={activeFilter} onSetFilter={setActiveFilter}
        coldTotal={coldTotal} deadCount={deadList.length} onJump={jumpTo} />

      {/* Hot board */}
      <div ref={boardRef} style={{ display: "flex", gap: 14, alignItems: "flex-start", overflowX: "auto", paddingBottom: 18 }}>
        {stages.map((label, si) => {
          const isGoal = si === goalIndex;
          const key = `hot:${si}`;
          const ramp = stageRampColor(si, stages.length);
          const shut = collapsedCols.has(si);
          const wide = !shut && !isGoal && ultra && board[si].length >= 6;
          return (
            <div key={si} style={{ ...colShell(isGoal, wide), outline: over === key ? `2px solid ${T.line}` : "none" }} onDragOver={allow(key)} onDragLeave={() => setOver(null)} onDrop={dropHot(si)}>
              {/* Header doubles as the collapse toggle, color-coded to the same
                  dark-red-to-neon-yellow ramp as the mobile stage notches. */}
              <div style={{ display: "flex", alignItems: "stretch", borderBottom: shut ? "none" : `1px solid ${T.line}` }}>
                <button type="button" onClick={() => toggleCol(si)} aria-expanded={!shut}
                  style={{ ...colHead, flex: 1, minWidth: 0, background: "none", border: "none", cursor: "pointer", fontFamily: FF.body, alignItems: "center", borderBottom: "none" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span style={{ flex: "none", width: 14, height: 5, borderRadius: 3, background: ramp }} />
                    <span style={{ ...colTitle(ramp), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{wide ? label : shortStage(label)}</span>
                  </span>
                  <span style={{ flex: "none", fontSize: 12, color: T.faint }}>
                    {repliedIn(board[si]) > 0 && <span style={{ marginRight: 7, fontSize: 10.5, fontWeight: 700, color: T.greenBright }}>{repliedIn(board[si])} replied</span>}
                    {board[si].length} <span style={{ fontSize: 10 }}>{shut ? "▸" : "▾"}</span>
                  </span>
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
                isGoal ? (
                  /* SOI members are managed in their own cockpit; the goal
                     column reads as a doorway: the handshake count, click
                     anywhere to go. Still a drop target for promotions. */
                  <button type="button" onClick={onOpenSoi || undefined} title="Open the SOI cockpit"
                    style={{ background: over === key ? T.lineSoft : "transparent", border: "none", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "30px 14px 32px", cursor: onOpenSoi ? "pointer" : "default", fontFamily: FF.body }}>
                    <span aria-hidden="true" style={{ fontSize: 27, lineHeight: 1 }}>{"🤝"}</span>
                    <span style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: ramp, fontVariantNumeric: "tabular-nums" }}>{board[si].length}</span>
                    <span style={{ fontSize: 11.5, color: T.dim }}>partner{board[si].length === 1 ? "" : "s"} in SOI</span>
                    <span style={{ fontSize: 11, color: T.faint }}>Manage in the SOI cockpit →</span>
                  </button>
                ) : (
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
                )
              )}
            </div>
          );
        })}
      </div>

      {replyPop && (
        <ReplyDateDialog name={replyPop.name} onClose={() => setReplyPop(null)}
          onSave={(ts) => onLogReply(replyPop.id, "", ts)} />
      )}

      {activeFilter && board.every((c, si) => si === goalIndex || !c.length) && whaleCols.every((c) => !c.length) && !(activeFilter === "maint" && coldTotal > 0) && (
        <div style={{ textAlign: "center", padding: "2px 0 18px", fontSize: 12.5, color: T.dim, fontFamily: FF.body }}>
          Nothing matches this filter.{" "}
          <button type="button" onClick={() => setActiveFilter(null)}
            style={{ background: "none", border: "none", color: T.greenBright, fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>
            Show all
          </button>
        </div>
      )}

      {/* Whale pipeline: exclusive tray for top producers, above cold. */}
      <details ref={whaleRef} open style={{ margin: "6px 0 14px", border: `1px solid ${T.whaleWashLine}`, borderRadius: 14, overflow: "hidden" }}>
        <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer", background: T.whaleWash }}>
          <span style={colTitle(T.whale)}>{"🐳"} Whale Pipeline · {whaleTotal}</span>
          <span style={{ fontSize: 11.5, color: T.faint }}>Top producers, nurtured on their own track. Drag between value adds; the whale button beside the name in an open card sends them here.</span>
        </summary>
        <div style={{ display: "flex", gap: 12, padding: 12, overflowX: "auto", alignItems: "flex-start" }}>
          {WHALE_COLUMNS.map((label, wi) => {
            const key = `whale:${wi}`;
            const ramp = whaleRampColor(wi, WHALE_COLUMNS.length);
            // Busy columns (6+) double up on ultrawide screens, same twin-stack
            // mechanism as the hot board.
            const wide = ultra && whaleCols[wi].length >= 6;
            return (
              <div key={wi} style={{ boxSizing: "border-box", flex: wide ? "2 0 440px" : "1 0 218px", minWidth: wide ? 440 : 218, maxWidth: wide ? 470 : 300, background: "transparent", border: `1px solid ${T.whaleWashLine}`, borderRadius: 12, display: "flex", flexDirection: "column", maxHeight: "40vh" }}
                onDragOver={allowStop(key)} onDragLeave={() => setOver(null)} onDrop={dropWhale(wi)}>
                <div style={colHead}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span style={{ flex: "none", width: 14, height: 5, borderRadius: 3, background: ramp }} />
                    <span style={{ ...colTitle(ramp), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
                  </span>
                  <span style={{ fontSize: 12, color: T.faint }}>
                    {repliedIn(whaleCols[wi]) > 0 && <span style={{ marginRight: 7, fontSize: 10.5, fontWeight: 700, color: T.greenBright }}>{repliedIn(whaleCols[wi])} replied</span>}
                    {whaleCols[wi].length}
                  </span>
                </div>
                <div style={{ ...(wide ? wideBody : colBody), background: over === key ? T.whaleWash : "transparent" }}>
                  {wide ? (
                    <>
                      <div style={halfStack}>{whaleCols[wi].filter((_, i) => i % 2 === 0).map((p) => hotCard(p))}</div>
                      <div style={halfStack}>{whaleCols[wi].filter((_, i) => i % 2 === 1).map((p) => hotCard(p))}</div>
                    </>
                  ) : (
                    whaleCols[wi].map((p) => hotCard(p))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Cold pipeline: leaves the view while a rail filter is on, except
          Maintenance Day, whose whole point is working the cold list too. */}
      {(!activeFilter || activeFilter === "maint") && <>
      <details ref={coldRef} open style={{ margin: "6px 0 14px", border: `1px solid ${T.coldWashLine}`, borderRadius: 14, overflow: "hidden", background: over === "tray" ? T.coldWash : "transparent" }}
        onDragOver={allow("tray")} onDragLeave={() => setOver(null)} onDrop={dropCold(null, false)}>
        <summary style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer", background: T.coldWash }}>
          <span style={colTitle(T.cold)}>Cold Pipeline · {coldTotal}</span>
          <span style={{ fontSize: 11.5, color: T.faint }}>Drag one column right to log a check-in. Drag back up to revive.</span>
        </summary>
        <div style={{ display: "flex", gap: 12, padding: 12, overflowX: "auto", alignItems: "flex-start" }}>
          {COLD_COLUMNS.map((label, ci) => {
            const key = `cold:${ci}`;
            const wide = ultra && coldCols[ci].length >= 6;
            return (
              <div key={ci} style={{ boxSizing: "border-box", flex: wide ? "2 0 440px" : "1 0 218px", minWidth: wide ? 440 : 218, maxWidth: wide ? 470 : 300, background: "transparent", border: `1px solid ${T.coldWashLine}`, borderRadius: 12, display: "flex", flexDirection: "column", maxHeight: "40vh" }}
                onDragOver={allowStop(key)} onDragLeave={() => setOver(null)} onDrop={dropCold(ci, true)}>
                <div style={colHead}><span style={colTitle(T.cold)}>{label}</span><span style={{ fontSize: 12, color: T.faint }}>{coldCols[ci].length}</span></div>
                <div style={{ ...(wide ? wideBody : colBody), background: over === key ? T.coldWash : "transparent" }}>
                  {wide ? (
                    <>
                      <div style={halfStack}>{coldCols[ci].filter((_, i) => i % 2 === 0).map((p) => coldCard(p))}</div>
                      <div style={halfStack}>{coldCols[ci].filter((_, i) => i % 2 === 1).map((p) => coldCard(p))}</div>
                    </>
                  ) : (
                    coldCols[ci].map((p) => coldCard(p))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </details>
      </>}

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


// The lightweight action popover for the drag gestures (log a stage touch, log a
// cold check-in, mark dead) and the buried restore list. The full contact detail
// is a separate, shared component the parent renders on a card click.
function CockpitPopover({ pop, stages, goalIndex, deadList, followUps, onSave, onClose, onRestore }) {
  const [note, setNote] = useState("");
  const [loggedOn, setLoggedOn] = useState(() => todayLocalISO());
  const [talked, setTalked] = useState(false);
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
        {pop.type !== "dead" && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <LoggedDatePicker value={loggedOn} onChange={setLoggedOn} />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: FF.body, fontSize: 11.5, color: talked ? T.greenBright : T.dim, cursor: "pointer" }}>
              <input type="checkbox" checked={talked} onChange={(e) => setTalked(e.target.checked)} style={{ accentColor: T.green, width: 15, height: 15, margin: 0 }} />
              We talked
            </label>
          </div>
        )}
        <div style={row}>
          <button type="button" onClick={onClose} style={btn("none", T.dim, `1px solid ${T.line}`)}>Cancel</button>
          <button type="button" onClick={() => onSave(note.trim(), tsForLoggedDate(loggedOn), talked)} disabled={pop.type !== "dead" && !note.trim()}
            style={btn(pop.type !== "dead" && !note.trim() ? T.surface : pop.type === "cold" ? T.cold : pop.type === "dead" ? T.redLift : goal ? T.redLift : T.green, pop.type !== "dead" && !note.trim() ? T.faint : T.cream)}>
            {pop.type === "cold" ? "Log check-in" : pop.type === "dead" ? "Mark dead" : goal ? "Promote" : "Log touch"}
          </button>
        </div>
      </div>
    </div>
  );
}
