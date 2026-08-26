import { useState, useEffect, useRef, useCallback } from "react";
import { toPng, getFontEmbedCSS } from "html-to-image";
import { T, APP_MAX } from "./gl2Tokens";
import { useIsMobile } from "../../utils/hooks";
import { TabBar } from "./Gl2Primitives";
import { Gl2TabDock } from "./Gl2TabDock";
import { Gl2TopNav } from "./Gl2TopNav";
import { TodayContent, WeekContent, ClosingsContent, SettingsPanel } from "./Gl2Screens";
import { CorrectionPanel } from "./Gl2Correction";
import { YtdContent } from "./Gl2Ytd";
import { ProspectingContent } from "./prospecting/ProspectingContent";
import { FollowUpsContent } from "./prospecting/FollowUpsContent";
import { SoiContent } from "./prospecting/SoiContent";
import { BestDayFlash, TargetBurst, RecapSeal } from "./Gl2Rewards";
import { StoryCard } from "./StoryCard";
import { ALL_KEYS, CONV_SUBS, STREAK_FLOOR, emptyDay, normalizeDay, convOf } from "./gl2Model";
import { centralDateKey, weekStartFor, weekDayKeys, dayOfWeek, addDays, monthDay, weekdayName, rangeLabel } from "./gl2Week";
import { fetchWeek, saveDay, saveDayKeepalive, saveSettings, fetchYearStats, fetchStats } from "../../utils/geeklogApi";
import { initAudio, playTick, playMilestone, playDown, haptic } from "./gl2Sound";

// Geek Log 2.0 authorized app. Fills the viewport (charcoal cockpit), holds the
// week's activity state, writes optimistically with debounced POSTs + retry,
// caches the current week for instant open, and generates the activity-only
// story card PNG off-screen. Reward layer: tap sound + haptics, milestone
// pulses, a target-cleared burst, a new-best-day flash, a Sunday recap seal, and
// bests/pace/streak on the Week screen. Closings and the story-card contract are
// untouched.

const CACHE_KEY = "gl2:week";
// Marks that the cached week holds taps not yet confirmed by the server. Its
// value is the date key those taps belong to, so a stale flag from an earlier
// day is ignored. Set on every tap, cleared when a flush fully drains.
const DIRTY_KEY = "gl2:dirty";
const WRITE_DEBOUNCE_MS = 350;
const RETRY_MS = 4000;
const CONV_KEYS = new Set(CONV_SUBS.map((s) => s.key));
// Desktop cap (APP_MAX, from gl2Tokens): keep the cockpit a centered column
// instead of stretching across a wide monitor. Mobile is unaffected (viewport is
// narrower than this, so the column is full width).

function loadCache() {
  try { const raw = localStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writeCache(obj) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); } catch { /* best-effort */ }
}
function flagGet(key) { try { return localStorage.getItem(key) === "1"; } catch { return false; } }
function flagSet(key) { try { localStorage.setItem(key, "1"); } catch { /* best-effort */ } }
function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, v) { try { localStorage.setItem(key, v); } catch { /* best-effort */ } }

export function Gl2App({ apiKey }) {
  const todayKey = centralDateKey();
  const weekStart = weekStartFor(todayKey);
  const dayKeys = weekDayKeys(weekStart);
  const todayIndex = dayOfWeek(todayKey);
  const year = Number(todayKey.slice(0, 4));

  const [daysMap, setDaysMap] = useState(() => {
    const base = {};
    for (const dk of dayKeys) base[dk] = emptyDay();
    const c = loadCache();
    if (c && c.weekStart === weekStart && c.days) {
      for (const dk of dayKeys) if (c.days[dk]) base[dk] = normalizeDay(c.days[dk]);
    }
    return base;
  });
  const [target, setTarget] = useState(() => {
    const c = loadCache();
    return c && c.weekStart === weekStart && Number.isInteger(c.target) ? c.target : 50;
  });
  const [closings, setClosings] = useState(0);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("today");
  // The desktop Follow Up cockpit (>= 900px) runs full-bleed: no width cap, the
  // board owns the whole screen. Every other tab and all of mobile stay at
  // APP_MAX.
  const isNarrow = useIsMobile(899);
  const columnMax = (tab === "followups" || tab === "soi") && !isNarrow ? "100%" : APP_MAX;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportCard, setExportCard] = useState(null);

  // Reward-layer transient state.
  const [soundOn, setSoundOn] = useState(() => lsGet("gl2:soundOn") !== "0"); // default on
  const [pulse, setPulse] = useState(0);
  const [bestFlash, setBestFlash] = useState(false);
  const [targetBurst, setTargetBurst] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);

  useEffect(() => { lsSet("gl2:soundOn", soundOn ? "1" : "0"); }, [soundOn]);

  // Hydrate the current week + closings + reward stats from the server.
  useEffect(() => {
    let cancelled = false;
    fetchWeek(apiKey)
      .then((res) => {
        if (cancelled || !res || res.weekStart !== weekStart) return;
        // The server's view of the current week.
        const serverDays = {};
        for (const dk of dayKeys) serverDays[dk] = emptyDay();
        for (const d of res.days || []) if (serverDays[d.date]) serverDays[d.date] = normalizeDay(d);

        // Reconcile today rather than blindly overwriting. A debounced tap can be
        // lost when the PWA is backgrounded before it POSTs; the local cache still
        // holds it and the dirty flag is set. If our cached today is unsynced and
        // ahead of the server, push it and keep it; otherwise the server wins,
        // which is the normal case (clean load, or the server is already current).
        const wasDirty = lsGet(DIRTY_KEY) === todayKey;
        const localToday = daysRef.current[todayKey] || emptyDay();
        const localSum = ALL_KEYS.reduce((n, k) => n + (localToday[k] || 0), 0);
        const serverSum = ALL_KEYS.reduce((n, k) => n + (serverDays[todayKey][k] || 0), 0);

        if (wasDirty && localSum > serverSum) {
          const next = { ...serverDays, [todayKey]: localToday };
          daysRef.current = next;
          setDaysMap(next);
          pending.current.add(todayKey);
          flush();
        } else {
          daysRef.current = serverDays;
          setDaysMap(serverDays);
          lsSet(DIRTY_KEY, "");
        }
        if (Number.isInteger(res.weeklyTarget)) setTarget(res.weeklyTarget);
      })
      .catch(() => {});
    fetchYearStats(apiKey, year)
      .then((res) => { if (!cancelled && res && Number.isInteger(res.closingsCount)) setClosings(res.closingsCount); })
      .catch(() => {});
    fetchStats(apiKey)
      .then((res) => {
        if (cancelled || !res) return;
        setStats(res);
        // Sunday recap: show once when the week has rolled over and the prior
        // week has any logged activity.
        const lwConv = (res.lastWeek?.days || []).reduce((a, d) => a + convOf(d), 0);
        if (lwConv > 0 && lsGet("gl2:lastSeenWeek") !== weekStart) setRecapOpen(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => { writeCache({ weekStart, target, days: daysMap }); }, [daysMap, target, weekStart]);

  // iOS standalone can cold-launch with a stale, letterboxed viewport that only
  // corrects once the document scrolls. The column's 100lvh guarantees at least
  // a sliver of scroll range, and this nudge exercises it so the correction
  // happens immediately instead of waiting for the first user swipe. No-op on
  // desktop and in ordinary browsers.
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 1);
      window.scrollTo(0, 0);
    });
  }, []);

  // Each tab starts at its own top; the document scroller is shared across tabs.
  const isFirstTab = useRef(true);
  useEffect(() => {
    if (isFirstTab.current) { isFirstTab.current = false; return; }
    window.scrollTo(0, 0);
  }, [tab]);

  // Debounced writes with retry.
  const pending = useRef(new Set());
  const timer = useRef(null);
  const daysRef = useRef(daysMap);
  daysRef.current = daysMap;

  const flush = useCallback(() => {
    const dates = Array.from(pending.current);
    if (!dates.length) { setSyncing(false); return; }
    setSyncing(true);
    Promise.allSettled(
      dates.map((dk) => saveDay(apiKey, { date: dk, ...daysRef.current[dk] }).then(() => pending.current.delete(dk)))
    ).then(() => {
      const left = pending.current.size > 0;
      setSyncing(left);
      if (left) timer.current = setTimeout(flush, RETRY_MS);
      else lsSet(DIRTY_KEY, ""); // everything confirmed; the cache is clean again
    });
  }, [apiKey]);

  const scheduleWrite = useCallback((dateKey) => {
    pending.current.add(dateKey);
    lsSet(DIRTY_KEY, todayKey); // taps exist that the server has not confirmed
    setSyncing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, WRITE_DEBOUNCE_MS);
  }, [flush, todayKey]);

  // Immediately flush any pending day writes when the page is hidden or unloaded,
  // before the debounce timer would have fired. A normal fetch would be killed
  // with the page; a keepalive fetch survives suspension and still carries the
  // auth header. Fire-and-forget: we cannot await during unload, and the pending
  // set plus the dirty flag let the online-retry and the load-time reconcile
  // recover anything that does not land. The server upsert makes a duplicate
  // write (beacon now, debounce later on resume) harmless.
  const flushBeacon = useCallback(() => {
    for (const dk of Array.from(pending.current)) {
      saveDayKeepalive(apiKey, { date: dk, ...daysRef.current[dk] });
    }
  }, [apiKey]);

  useEffect(() => {
    const onOnline = () => flush();
    const onVisibility = () => { if (document.visibilityState === "hidden") flushBeacon(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushBeacon);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushBeacon);
    };
  }, [flush, flushBeacon]);

  const weekConvOf = (map) => dayKeys.reduce((a, dk) => a + convOf(map[dk] || emptyDay()), 0);
  const flashTimer = useRef(null);
  const burstTimer = useRef(null);

  // Optimistic counter mutation + reward detection (sound, milestone pulse, new
  // best day, target burst). Runs on the selected day; celebrations key off the
  // weekly conversation total and today's total.
  const bump = (counterKey, delta) => {
    initAudio(); // this call is a user gesture (unlocks iOS audio)
    const prev = daysRef.current;
    const day = prev[selectedDate] || emptyDay();
    const newDay = { ...day, [counterKey]: Math.max(0, (day[counterKey] || 0) + delta) };
    const next = { ...prev, [selectedDate]: newDay };

    let moment = false;
    if (delta > 0 && CONV_KEYS.has(counterKey)) {
      const oldWeekConv = weekConvOf(prev);
      const newWeekConv = weekConvOf(next);
      // Every 10th conversation of the week: bar pulse.
      if (newWeekConv > 0 && Math.floor(newWeekConv / 10) > Math.floor(oldWeekConv / 10)) {
        moment = true;
        setPulse((p) => p + 1);
      }
      // Target crossed (once per week).
      if (oldWeekConv < target && newWeekConv >= target && !flagGet(`gl2:targetCelebrated:${weekStart}`)) {
        moment = true;
        flagSet(`gl2:targetCelebrated:${weekStart}`);
        setTargetBurst(true);
        clearTimeout(burstTimer.current);
        burstTimer.current = setTimeout(() => setTargetBurst(false), 1900);
      }
      // New best day, live for today (once per exceed event per day).
      if (selectedDate === todayKey && stats) {
        const bestToBeat = stats.bestDay?.count || 0;
        if (convOf(newDay) > bestToBeat && !flagGet(`gl2:bestCelebrated:${todayKey}`)) {
          moment = true;
          flagSet(`gl2:bestCelebrated:${todayKey}`);
          setBestFlash(true);
          clearTimeout(flashTimer.current);
          flashTimer.current = setTimeout(() => setBestFlash(false), 2100);
        }
      }
    }

    if (soundOn) {
      if (delta < 0) { playDown(); haptic(8); }
      else if (moment) { playMilestone(); haptic([10, 28, 12]); }
      else { playTick(); haptic(12); }
    }

    daysRef.current = next;
    setDaysMap(next);
    scheduleWrite(selectedDate);
  };
  const inc = (k) => bump(k, +1);
  const dec = (k) => bump(k, -1);

  // Log a prospecting conversation from the Prospecting tab: bump TODAY's
  // "Prospecting" conversation counter and persist it through the same debounced
  // write + reconcile as the tap counters. Quiet (no tap sound) since the user
  // is logging a call, not tapping the Today counters.
  const addProspectingConversation = useCallback(() => {
    const prev = daysRef.current;
    const day = prev[todayKey] || emptyDay();
    const next = { ...prev, [todayKey]: { ...day, prospecting: (day.prospecting || 0) + 1 } };
    daysRef.current = next;
    setDaysMap(next);
    scheduleWrite(todayKey);
  }, [todayKey, scheduleWrite]);

  useEffect(() => () => { clearTimeout(flashTimer.current); clearTimeout(burstTimer.current); }, []);

  // Settings target.
  const settingsTimer = useRef(null);
  const changeTarget = (newTarget) => {
    const clamped = Math.max(1, Math.min(500, newTarget));
    setTarget(clamped);
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    settingsTimer.current = setTimeout(() => { saveSettings(apiKey, clamped).catch(() => {}); }, 400);
  };

  // A backdated correction wrote straight to the server. If it landed on a day
  // in the current week, merge it into the in-memory week so Today/Week reflect
  // it at once; past weeks refresh on their own when their screen remounts.
  const handleCorrectionSaved = useCallback((saved) => {
    if (!saved || !dayKeys.includes(saved.date)) return;
    const next = { ...daysRef.current, [saved.date]: normalizeDay(saved) };
    daysRef.current = next;
    setDaysMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  // Day navigation.
  const goBack = () => setSelectedDate((d) => (d > weekStart ? addDays(d, -1) : d));
  const goForward = () => setSelectedDate((d) => (d < todayKey ? addDays(d, +1) : d));
  const backDisabled = selectedDate <= weekStart;
  const canForward = selectedDate < todayKey;

  // Derived views.
  const selectedDay = daysMap[selectedDate] || emptyDay();
  const perDayConv = dayKeys.map((dk) => convOf(daysMap[dk] || emptyDay()));
  const weekConv = perDayConv.reduce((a, b) => a + b, 0);
  const weekTotals = (() => {
    const totals = emptyDay();
    for (const dk of dayKeys) { const d = daysMap[dk] || emptyDay(); for (const k of ALL_KEYS) totals[k] += d[k] || 0; }
    return totals;
  })();
  const rLabel = rangeLabel(weekStart);

  const todayConv = convOf(daysMap[todayKey] || emptyDay());
  const lwDays = stats?.lastWeek?.days || [];
  const hasLastWeekData = lwDays.reduce((a, d) => a + convOf(d), 0) > 0;
  const thisWeekThroughToday = perDayConv.slice(0, todayIndex + 1).reduce((a, b) => a + b, 0);
  const lastWeekThroughIndex = lwDays.slice(0, todayIndex + 1).reduce((a, d) => a + convOf(d), 0);
  const streak = (stats?.streakBase || 0) + (todayConv >= STREAK_FLOOR ? 1 : 0);
  const weekRewards = {
    bestDay: stats?.bestDay?.count || 0,
    todayConv,
    pace: { hasData: hasLastWeekData, diff: thisWeekThroughToday - lastWeekThroughIndex },
    streak,
  };

  // Off-screen story card -> PNG. Renders whichever week `exportCard` names (the
  // recap passes last week); defaults to the current week.
  const storyRef = useRef(null);
  const doExport = async (cardData) => {
    if (exporting) return;
    const card = cardData || { week: weekTotals, rangeLabel: rLabel, weekStart };
    setExporting(true);
    setExportCard(card);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (document.fonts?.ready) await document.fonts.ready;
      const node = storyRef.current;
      if (!node) throw new Error("no export node");
      const fontEmbedCSS = await getFontEmbedCSS(node);
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: T.bg1, fontEmbedCSS, width: 1080, height: 1920, canvasWidth: 1080, canvasHeight: 1920 });
      const link = document.createElement("a");
      link.download = `mortgage-geek-week-${card.weekStart}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("[geeklog] story export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  const closeRecap = () => { lsSet("gl2:lastSeenWeek", weekStart); setRecapOpen(false); };
  const recapExport = async () => {
    const lw = stats?.lastWeek;
    if (!lw) return closeRecap();
    const totals = emptyDay();
    for (const d of lw.days) for (const k of ALL_KEYS) totals[k] += d[k] || 0;
    const rl = `${monthDay(lw.days[0].date)} to ${monthDay(lw.days[6].date)}`;
    await doExport({ week: totals, rangeLabel: rl, weekStart: lw.weekStart });
    closeRecap();
  };

  const card = exportCard || { week: weekTotals, rangeLabel: rLabel };

  return (
    <>
      <style>{`
        /* This route deliberately does not inject globalCSS, so it never got a
           reset and body kept the UA default 8px margin. Everything here is
           fixed-position so it mostly did not show, but a full-screen app should
           not be sitting inside a stray margin. */
        /* Reset only — no height locks, no overscroll suppression. The body is
           the scroller now (matching the main-site pages), and the root
           background is the canvas that paints any part of the webview the
           layout doesn't reach. */
        html, body { margin: 0; padding: 0; background: ${T.bg1}; }
        /* Kill double-tap-to-zoom on every tap target; taps fire immediately. */
        html, body { touch-action: manipulation; }
        @keyframes gl-pop { 0% { transform: scale(1); } 38% { transform: scale(1.26); } 100% { transform: scale(1); } }
        @keyframes gl-blink { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes gl-barpulse { 0% { opacity: 0; } 25% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes gl-burst { 0% { transform: scale(0.2); opacity: 0.9; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes gl-burstfade { 0% { opacity: 0; } 14% { opacity: 1; } 74% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes gl-flash { 0% { opacity: 0; transform: translateY(-8px); } 12% { opacity: 1; transform: none; } 80% { opacity: 1; } 100% { opacity: 0; transform: translateY(-6px); } }
        @keyframes gl-sealin { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes gl-pop { from { transform: none; } to { transform: none; } }
          @keyframes gl-blink { from { opacity: 0.7; } to { opacity: 0.7; } }
          @keyframes gl-barpulse { from { opacity: 0; } to { opacity: 0; } }
          @keyframes gl-burst { from { opacity: 0; } to { opacity: 0; } }
          @keyframes gl-flash { 0% { opacity: 1; } 100% { opacity: 1; } }
        }
      `}</style>
      {/* DOCUMENT FLOW, not a fixed shell — this is the fix for the iOS
          standalone dead band at the bottom of the screen, and it makes this
          route work structurally like every main-site page (minHeight + the
          BODY as the scroller). The old position:fixed/inset:0 shell meant the
          document itself could never scroll; iOS standalone can cold-launch
          with a stale, letterboxed viewport, and with zero document scroll
          range WebKit never corrects it — leaving a permanent unpainted strip
          below the layout viewport that no fixed element could reach. A
          scrollable document heals the viewport and paints content plus the
          root canvas across the whole webview. */}
      <main style={{ minHeight: "100dvh", display: "flex", justifyContent: "center", background: `linear-gradient(180deg, ${T.bg0} 0%, ${T.bg1} 78%)`, color: T.cream }}>
        {/* Phone-width column, centered on desktop. minHeight is 100lvh (the
            LARGE viewport) so the document always has at least a sliver of
            scroll range on a letterboxed cold launch — that sliver is what lets
            the mount-time scroll nudge below trigger the viewport correction. */}
        <div style={{ position: "relative", width: "100%", maxWidth: columnMax, minHeight: "100lvh", display: "flex", flexDirection: "column", transition: "max-width 0.2s ease" }}>
        {/* Desktop (>= 900px): top-bar navigation replaces the bottom TabBar
            entirely - conditional render, so only one nav landmark exists. */}
        {!isNarrow && <Gl2TopNav active={tab} onChange={setTab} />}

        {/* Content area. Bottom padding keeps the last rows clear of the fixed
            tab bar; the bar overlays content, exactly like MobileToolbar. */}
        <div style={{ flex: 1, // The 18px of desktop breathing room stays off the Prospecting tab: its
            // solid sticky header against the column gradient turned the gap into a
            // visible gray band. Prospecting's own header carries the spacing.
            paddingTop: isNarrow ? "calc(8px + env(safe-area-inset-top, 0px))" : tab === "prospecting" ? 0 : 18, paddingBottom: isNarrow ? "calc(96px + env(safe-area-inset-bottom, 0px))" : 24 }}>

          {tab === "today" && (
            <TodayContent
              state={selectedDay} inc={inc} dec={dec}
              dateLabel={monthDay(selectedDate)}
              subtitle={selectedDate === todayKey ? "Today" : weekdayName(selectedDate)}
              onBack={goBack} backDisabled={backDisabled}
              onForward={goForward} canForward={canForward}
              onSettings={() => setSettingsOpen(true)}
              onOpenClosings={() => setTab("closings")}
              onOpenSoi={() => setTab("soi")}
              weekConv={weekConv} target={target} syncing={syncing} pulse={pulse}
            />
          )}
          {tab === "week" && (
            <WeekContent week={weekTotals} days={perDayConv} todayIndex={todayIndex} target={target} rangeLabel={rLabel} onExport={() => doExport()} exporting={exporting} rewards={weekRewards} onSettings={() => setSettingsOpen(true)} />
          )}
          {tab === "prospecting" && <ProspectingContent apiKey={apiKey} onTalkedLogged={addProspectingConversation} />}
          {tab === "followups" && <FollowUpsContent apiKey={apiKey} onOpenSoi={() => setTab("soi")} />}
          {tab === "ytd" && <YtdContent apiKey={apiKey} year={year} onSettings={() => setSettingsOpen(true)} />}
          {/* Closings and SOI are not bottom tabs; they open from the dollar and
              SOI buttons in the Today header. */}
          {tab === "closings" && <ClosingsContent closings={closings} year={year} />}
          {tab === "soi" && <SoiContent apiKey={apiKey} onOpenFollowUps={() => setTab("followups")} />}
        </div>

        {isNarrow && (
          <Gl2TabDock resetKey={tab} maxWidth={columnMax}>
            <TabBar active={tab} onChange={setTab} />
          </Gl2TabDock>
        )}

        {settingsOpen && <SettingsPanel target={target} setTarget={changeTarget} onClose={() => setSettingsOpen(false)} soundOn={soundOn} setSoundOn={setSoundOn} onOpenCorrection={() => setCorrectionOpen(true)} />}

        {/* Correction form layers above Settings; closing it returns there. */}
        {correctionOpen && <CorrectionPanel apiKey={apiKey} onClose={() => setCorrectionOpen(false)} onSaved={handleCorrectionSaved} />}

        {/* Recap seal is scoped to the column so it does not stretch on desktop. */}
        {recapOpen && stats?.lastWeek && <RecapSeal lastWeek={stats.lastWeek} target={target} streak={stats.currentStreak || 0} onExport={recapExport} onDismiss={closeRecap} exporting={exporting} />}
        </div>
      </main>

      {bestFlash && <BestDayFlash />}
      {targetBurst && <TargetBurst />}

      {/* Off-screen render target for the story-card PNG. Fed only the seven
          activity totals + the range label. Closings can never reach it. */}
      <div aria-hidden="true" style={{ position: "fixed", left: -100000, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
        <div ref={storyRef}>
          <StoryCard week={card.week} rangeLabel={card.rangeLabel} />
        </div>
      </div>
    </>
  );
}
