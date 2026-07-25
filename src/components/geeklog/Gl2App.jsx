import { useState, useEffect, useRef, useCallback } from "react";
import { toPng, getFontEmbedCSS } from "html-to-image";
import { T } from "./gl2Tokens";
import { TabBar } from "./Gl2Primitives";
import { TodayContent, WeekContent, ClosingsContent, SettingsPanel } from "./Gl2Screens";
import { StoryCard } from "./StoryCard";
import { ALL_KEYS, emptyDay, normalizeDay, convOf } from "./gl2Model";
import { centralDateKey, weekStartFor, weekDayKeys, dayOfWeek, addDays, monthDay, weekdayName, rangeLabel } from "./gl2Week";
import { fetchWeek, saveDay, saveSettings, fetchYearStats } from "../../utils/geeklogApi";

// Geek Log 2.0 authorized app. Fills the viewport (charcoal cockpit), holds the
// week's activity state, writes optimistically with debounced POSTs + retry,
// caches the current week in localStorage for instant open, and generates the
// activity-only story card PNG off-screen. The gear in the Today header opens
// Settings; the TabBar switches Today / Week / Closings. Closings is read-only
// (existing year endpoint) and never reaches the story card.

const CACHE_KEY = "gl2:week";
const WRITE_DEBOUNCE_MS = 350;
const RETRY_MS = 4000;

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeCache(obj) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch {
    /* private mode / quota: cache is best-effort */
  }
}

export function Gl2App({ apiKey }) {
  const todayKey = centralDateKey();
  const weekStart = weekStartFor(todayKey);
  const dayKeys = weekDayKeys(weekStart);
  const todayIndex = dayOfWeek(todayKey);
  const year = Number(todayKey.slice(0, 4));

  // Instant open from cache (only if it is this same Central week).
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
  const [tab, setTab] = useState("today");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Hydrate from the server (authoritative). Zeros for missing days.
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
      .catch(() => { /* keep cached state */ });
    fetchYearStats(apiKey, year)
      .then((res) => { if (!cancelled && res && Number.isInteger(res.closingsCount)) setClosings(res.closingsCount); })
      .catch(() => {});
    return () => { cancelled = true; };
    // weekStart/dayKeys/year derive from the Central date and are stable per day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Best-effort cache of the current week.
  useEffect(() => {
    writeCache({ weekStart, target, days: daysMap });
  }, [daysMap, target, weekStart]);

  // Debounced writes with retry. daysRef always holds the latest counts so a
  // flush POSTs the full, current day document (last-write-wins).
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
      if (left) timer.current = setTimeout(flush, RETRY_MS); // retry failures
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

  // Optimistic counter mutation on the selected day (always within the writable
  // window: navigation is capped at [weekStart .. today]).
  const bump = (counterKey, delta) => {
    setDaysMap((prev) => {
      const day = prev[selectedDate] || emptyDay();
      return { ...prev, [selectedDate]: { ...day, [counterKey]: Math.max(0, (day[counterKey] || 0) + delta) } };
    });
    scheduleWrite(selectedDate);
  };
  const inc = (k) => bump(k, +1);
  const dec = (k) => bump(k, -1);

  // Settings target: optimistic, debounced POST, clamped to the API's range.
  const settingsTimer = useRef(null);
  const changeTarget = (newTarget) => {
    const clamped = Math.max(1, Math.min(500, newTarget));
    setTarget(clamped);
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    settingsTimer.current = setTimeout(() => { saveSettings(apiKey, clamped).catch(() => {}); }, 400);
  };

  // Day navigation, capped at the current Central week.
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
    for (const dk of dayKeys) {
      const d = daysMap[dk] || emptyDay();
      for (const k of ALL_KEYS) totals[k] += d[k] || 0;
    }
    return totals;
  })();
  const rLabel = rangeLabel(weekStart);

  // Off-screen story card -> PNG (activity totals + range only; never closings).
  const storyRef = useRef(null);
  const doExport = async () => {
    if (exporting) return;
    const node = storyRef.current;
    if (!node) return;
    setExporting(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r()));
      if (document.fonts?.ready) await document.fonts.ready;
      const fontEmbedCSS = await getFontEmbedCSS(node);
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: T.bg1,
        fontEmbedCSS,
        width: 1080,
        height: 1920,
        canvasWidth: 1080,
        canvasHeight: 1920,
      });
      const link = document.createElement("a");
      link.download = `mortgage-geek-week-${weekStart}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("[geeklog] story export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {/* Tap-pop (count bump) and the syncing-dot blink. This route does not
          inject globalCSS, so the keyframes live here, ported from the CD
          prototype head. Disabled under reduced-motion. */}
      <style>{`
        @keyframes gl-pop { 0% { transform: scale(1); } 38% { transform: scale(1.26); } 100% { transform: scale(1); } }
        @keyframes gl-blink { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes gl-pop { from { transform: none; } to { transform: none; } }
          @keyframes gl-blink { from { opacity: 0.7; } to { opacity: 0.7; } }
        }
      `}</style>
      <main style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: `linear-gradient(180deg, ${T.bg0} 0%, ${T.bg1} 78%)`, color: T.cream, overflow: "hidden" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingTop: "calc(8px + env(safe-area-inset-top, 0px))" }}>
          {tab === "today" && (
            <TodayContent
              state={selectedDay} inc={inc} dec={dec}
              dateLabel={monthDay(selectedDate)}
              subtitle={selectedDate === todayKey ? "Today" : weekdayName(selectedDate)}
              onBack={goBack} backDisabled={backDisabled}
              onForward={goForward} canForward={canForward}
              onSettings={() => setSettingsOpen(true)}
              weekConv={weekConv} target={target} syncing={syncing}
            />
          )}
          {tab === "week" && (
            <WeekContent week={weekTotals} days={perDayConv} todayIndex={todayIndex} target={target} rangeLabel={rLabel} onExport={doExport} exporting={exporting} />
          )}
          {tab === "closings" && <ClosingsContent closings={closings} year={year} />}
        </div>

        <TabBar active={tab} onChange={setTab} />

        {settingsOpen && <SettingsPanel target={target} setTarget={changeTarget} onClose={() => setSettingsOpen(false)} />}
      </main>

      {/* Off-screen render target for the story-card PNG. Fed only the seven
          activity totals + the range label. Closings can never reach it. */}
      <div aria-hidden="true" style={{ position: "fixed", left: -100000, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
        <div ref={storyRef}>
          <StoryCard week={weekTotals} rangeLabel={rLabel} />
        </div>
      </div>
    </>
  );
}
