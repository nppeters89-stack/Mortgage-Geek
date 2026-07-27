import { useState, useEffect, useRef, useCallback } from "react";
import { toPng, getFontEmbedCSS } from "html-to-image";
import { T } from "./gl2Tokens";
import { TabBar } from "./Gl2Primitives";
import { TodayContent, WeekContent, ClosingsContent, SettingsPanel } from "./Gl2Screens";
import { YtdContent } from "./Gl2Ytd";
import { BestDayFlash, TargetBurst, RecapSeal } from "./Gl2Rewards";
import { StoryCard } from "./StoryCard";
import { ALL_KEYS, CONV_SUBS, STREAK_FLOOR, emptyDay, normalizeDay, convOf } from "./gl2Model";
import { centralDateKey, weekStartFor, weekDayKeys, dayOfWeek, addDays, monthDay, weekdayName, rangeLabel } from "./gl2Week";
import { fetchWeek, saveDay, saveSettings, fetchYearStats, fetchStats } from "../../utils/geeklogApi";
import { initAudio, playTick, playMilestone, playDown, haptic } from "./gl2Sound";

// Geek Log 2.0 authorized app. Fills the viewport (charcoal cockpit), holds the
// week's activity state, writes optimistically with debounced POSTs + retry,
// caches the current week for instant open, and generates the activity-only
// story card PNG off-screen. Reward layer: tap sound + haptics, milestone
// pulses, a target-cleared burst, a new-best-day flash, a Sunday recap seal, and
// bests/pace/streak on the Week screen. Closings and the story-card contract are
// untouched.

const CACHE_KEY = "gl2:week";
const WRITE_DEBOUNCE_MS = 350;
const RETRY_MS = 4000;
const CONV_KEYS = new Set(CONV_SUBS.map((s) => s.key));
// Desktop cap: keep the cockpit a centered column instead of stretching across
// a wide monitor. Mobile is unaffected (viewport is narrower than this, so the
// column is full width).
const APP_MAX = 880;

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
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        setDaysMap(() => {
          const next = {};
          for (const dk of dayKeys) next[dk] = emptyDay();
          for (const d of res.days || []) if (next[d.date]) next[d.date] = normalizeDay(d);
          return next;
        });
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
    });
  }, [apiKey]);

  const scheduleWrite = useCallback((dateKey) => {
    pending.current.add(dateKey);
    setSyncing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, WRITE_DEBOUNCE_MS);
  }, [flush]);

  useEffect(() => {
    const onOnline = () => flush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);

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

  useEffect(() => () => { clearTimeout(flashTimer.current); clearTimeout(burstTimer.current); }, []);

  // Settings target.
  const settingsTimer = useRef(null);
  const changeTarget = (newTarget) => {
    const clamped = Math.max(1, Math.min(500, newTarget));
    setTarget(clamped);
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    settingsTimer.current = setTimeout(() => { saveSettings(apiKey, clamped).catch(() => {}); }, 400);
  };

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
        html, body { background: ${T.bg1}; overscroll-behavior: none; }
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
      <main style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", background: `linear-gradient(180deg, ${T.bg0} 0%, ${T.bg1} 78%)`, color: T.cream, overflow: "hidden" }}>
        {/* Phone-width column, centered on desktop. The gradient full-bleeds on
            main behind it; the scroll area, tab bar, and overlays live inside. */}
        <div style={{ position: "relative", width: "100%", maxWidth: APP_MAX, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingTop: "calc(8px + env(safe-area-inset-top, 0px))" }}>
          {tab === "today" && (
            <TodayContent
              state={selectedDay} inc={inc} dec={dec}
              dateLabel={monthDay(selectedDate)}
              subtitle={selectedDate === todayKey ? "Today" : weekdayName(selectedDate)}
              onBack={goBack} backDisabled={backDisabled}
              onForward={goForward} canForward={canForward}
              onSettings={() => setSettingsOpen(true)}
              weekConv={weekConv} target={target} syncing={syncing} pulse={pulse}
            />
          )}
          {tab === "week" && (
            <WeekContent week={weekTotals} days={perDayConv} todayIndex={todayIndex} target={target} rangeLabel={rLabel} onExport={() => doExport()} exporting={exporting} rewards={weekRewards} />
          )}
          {tab === "ytd" && <YtdContent apiKey={apiKey} year={year} />}
          {tab === "closings" && <ClosingsContent closings={closings} year={year} />}
        </div>

        <TabBar active={tab} onChange={setTab} />

        {settingsOpen && <SettingsPanel target={target} setTarget={changeTarget} onClose={() => setSettingsOpen(false)} soundOn={soundOn} setSoundOn={setSoundOn} />}

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
