import { useState, useEffect, useRef } from "react";
import { T, FF, greenFor } from "./gl2Tokens";

// Geek Log 2.0 primitives, ported from the CD handoff (gl2-components). The
// prototype's StatusBar and fixed-size Screen frame are intentionally dropped;
// the real page fills the viewport. The tap-pop keyframes (gl-pop) live in the
// page's <style>. No em-dashes in copy.

// ---------- Wordmark ---------- (MORTGAGE = DM Sans 700, GEEK = Archivo 800)
export function Wordmark({ size = 18, tone = "cream" }) {
  const geekColor = tone === "red" ? T.redLift : T.cream;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.34, lineHeight: 1 }}>
      <span style={{ fontFamily: FF.mark1, fontWeight: 700, fontSize: size, letterSpacing: size * 0.14, color: T.cream }}>MORTGAGE</span>
      <span style={{ fontFamily: FF.mark2, fontWeight: 800, fontSize: size * 1.16, letterSpacing: size * 0.02, color: geekColor }}>GEEK</span>
    </div>
  );
}

// ---------- Eyebrow label ----------
export function Eyebrow({ children, color = T.dim, size = 11, style }) {
  return (
    <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: size, letterSpacing: "0.16em", textTransform: "uppercase", color, ...style }}>
      {children}
    </div>
  );
}

// ---------- Card shell ----------
export function Card({ children, pad = 16, style }) {
  return (
    <div style={{ background: T.surface, borderRadius: 15, padding: pad, boxShadow: `inset 0 0 0 1px ${T.line}`, ...style }}>
      {children}
    </div>
  );
}

// ---------- Tap target ----------
// One tap on the body increments. The 48px column at right decrements. Both are
// >= 44px tall. Green fills in as the count climbs.
export function TapTarget({ label, count, ceiling = 8, onInc, onDec, height = 64 }) {
  const [hot, setHot] = useState(false);
  const [cold, setCold] = useState(false);
  const [pulse, setPulse] = useState(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  function inc() {
    onInc && onInc();
    setPulse((p) => p + 1);
    setHot(true);
    later(() => setHot(false), 300);
  }
  function dec(e) {
    e.stopPropagation();
    if (!count) return;
    onDec && onDec();
    setCold(true);
    later(() => setCold(false), 240);
  }

  const fill = greenFor(count, ceiling);
  const on = count > 0;

  return (
    <div
      onClick={inc}
      style={{
        position: "relative", height, borderRadius: 13, overflow: "hidden",
        background: cold ? T.surfaceHi : T.surface, cursor: "pointer", userSelect: "none",
        transform: hot ? "scale(0.994)" : "scale(1)",
        transition: "transform .14s cubic-bezier(.2,.8,.3,1), background .18s ease",
        boxShadow: hot
          ? `inset 0 0 0 1px ${T.green}, 0 0 26px rgba(47,191,113,.30)`
          : `inset 0 0 0 1px ${on ? "rgba(47,191,113,.26)" : T.line}`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, background: "linear-gradient(90deg, rgba(47,191,113,.26) 0%, rgba(47,191,113,.05) 100%)", transition: "width .34s cubic-bezier(.2,.8,.3,1)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: on ? T.green : "transparent", transition: "background .2s ease" }} />

      <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, paddingLeft: 18, fontFamily: FF.body, fontWeight: 600, fontSize: 16.5, color: T.cream, letterSpacing: "-0.005em" }}>{label}</div>
        <div key={pulse} style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 27, lineHeight: 1, color: on ? T.greenBright : T.dimmer, fontVariantNumeric: "tabular-nums", paddingRight: 14, minWidth: 46, textAlign: "right", animation: pulse ? "gl-pop .3s cubic-bezier(.2,.9,.3,1)" : "none" }}>{count}</div>
        <div onClick={dec} style={{ width: 48, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${T.lineSoft}`, cursor: count ? "pointer" : "default" }}>
          <div style={{ width: 15, height: 1.5, borderRadius: 1, background: cold ? T.cream : (count ? T.dim : T.faint), transition: "background .16s ease" }} />
        </div>
      </div>
    </div>
  );
}

// ---------- Pillar section ----------
export function Pillar({ title, total, note, children, gap = 8 }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: note ? 4 : 9 }}>
        <Eyebrow size={11}>{title}</Eyebrow>
        <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 15, color: total > 0 ? T.green : T.dimmer, fontVariantNumeric: "tabular-nums" }}>{total}</div>
      </div>
      {note && (
        <div style={{ fontFamily: FF.body, fontWeight: 400, fontSize: 11.5, color: T.dimmer, marginBottom: 9, letterSpacing: "0.01em" }}>{note}</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>
    </div>
  );
}

// ---------- Week progress ----------
export function WeekBar({ value, target, thickness = 8, showCaption = true, big = false }) {
  const pct = Math.min(1, value / target);
  const over = value >= target;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: big ? 14 : 8 }}>
        <Eyebrow size={big ? 12 : 10.5}>Conversations this week</Eyebrow>
        <div style={{ fontFamily: FF.body, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontWeight: 700, fontSize: big ? 20 : 14, color: over ? T.greenBright : T.cream }}>{value}</span>
          <span style={{ fontWeight: 500, fontSize: big ? 16 : 13, color: T.dimmer }}> / {target}</span>
        </div>
      </div>
      <div style={{ height: thickness, borderRadius: thickness / 2, background: "rgba(255,254,251,0.08)", overflow: "hidden", boxShadow: `inset 0 0 0 1px ${T.lineSoft}` }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, borderRadius: thickness / 2, background: `linear-gradient(90deg, ${T.greenDeep} 0%, ${T.green} 62%, ${T.greenBright} 100%)`, boxShadow: "0 0 18px rgba(47,191,113,.42)", transition: "width .4s cubic-bezier(.2,.8,.3,1)" }} />
      </div>
      {showCaption && (
        <div style={{ marginTop: big ? 12 : 7, fontFamily: FF.body, fontWeight: 500, fontSize: big ? 13.5 : 11.5, color: T.dim, letterSpacing: "0.01em" }}>
          {over ? `Target cleared. ${value - target} over.` : `${target - value} to go.`}
        </div>
      )}
    </div>
  );
}

// ---------- Seven day strip ---------- (values = conversations per day)
export function DayStrip({ days, todayIndex, size = 34 }) {
  const letters = ["S", "M", "T", "W", "T", "F", "S"];
  const peak = Math.max(...days, 1);
  return (
    <div style={{ display: "flex", gap: 7, justifyContent: "space-between" }}>
      {days.map((n, i) => {
        const isToday = i === todayIndex;
        const future = i > todayIndex;
        const intensity = n ? 0.22 + 0.78 * (n / peak) : 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: "100%", height: size, borderRadius: 9,
              background: n ? `rgba(47,191,113,${intensity * 0.85})` : (future ? "transparent" : "rgba(255,254,251,0.05)"),
              boxShadow: isToday ? `inset 0 0 0 1.5px ${T.greenBright}` : `inset 0 0 0 1px ${future ? T.lineSoft : T.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FF.body, fontWeight: 700, fontSize: 13, color: n ? T.cream : T.faint, fontVariantNumeric: "tabular-nums",
            }}>{n || ""}</div>
            <div style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", color: isToday ? T.greenBright : T.dimmer }}>{letters[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Bottom tab bar ---------- (safe-area padding for the home indicator)
export function TabBar({ active, onChange }) {
  const tabs = [
    { id: "today", label: "Today" },
    { id: "week", label: "Week" },
    { id: "closings", label: "Closings" },
  ];
  return (
    <div style={{ flex: "0 0 auto", borderTop: `1px solid ${T.line}`, background: "rgba(19,20,22,0.92)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div style={{ height: 64, display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <div key={t.id} onClick={() => onChange && onChange(t.id)} role="tab" aria-selected={on}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
              <div style={{ width: 18, height: 3, borderRadius: 2, background: on ? T.greenBright : "transparent" }} />
              <div style={{ fontFamily: FF.body, fontWeight: on ? 700 : 500, fontSize: 12, letterSpacing: "0.04em", color: on ? T.cream : T.dimmer }}>{t.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
