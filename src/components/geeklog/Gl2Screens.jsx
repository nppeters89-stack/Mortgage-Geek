import { useState } from "react";
import { T, FF } from "./gl2Tokens";
import { Wordmark, Eyebrow, Card, TapTarget, Pillar, WeekBar, DayStrip } from "./Gl2Primitives";
import { WeekRewards } from "./Gl2Rewards";
import { CONV_SUBS, APPT_SUBS, CONTENT_SUBS, EVENTS_SUBS, CONV_DEF, sumKeys } from "./gl2Model";

// Geek Log 2.0 screen bodies. Each renders header + scrollable content only; the
// page (GeekLogPage) supplies the viewport shell and the persistent TabBar, and
// opens Settings as an overlay from the gear in the Today header. No em-dashes.

function HeaderButton({ onClick, disabled, ariaLabel, children }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      role="button"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      style={{
        width: 34, height: 34, borderRadius: 10, flex: "0 0 auto",
        cursor: disabled ? "default" : "pointer", userSelect: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `inset 0 0 0 1px ${T.line}`, opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </div>
  );
}

function GearGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" stroke={T.dim} strokeWidth="1.6" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" stroke={T.dim} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SyncDot() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.dim, animation: "gl-blink 1s ease-in-out infinite" }} />
      <span style={{ fontFamily: FF.body, fontWeight: 600, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.dimmer }}>Syncing</span>
    </div>
  );
}

// ===========================================================================
// Today
// ===========================================================================
export function TodayContent({ state, inc, dec, dateLabel, subtitle, onBack, backDisabled, onForward, canForward, onSettings, weekConv, target, syncing, pulse }) {
  const convTotal = sumKeys(state, CONV_SUBS);
  const apptTotal = sumKeys(state, APPT_SUBS);
  const contentTotal = sumKeys(state, CONTENT_SUBS);
  const eventsTotal = sumKeys(state, EVENTS_SUBS);

  return (
    <>
      <div style={{ flex: "0 0 auto", padding: "2px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <HeaderButton onClick={onBack} disabled={backDisabled} ariaLabel="Previous day">
            <div style={{ width: 8, height: 8, borderLeft: `1.6px solid ${T.dim}`, borderBottom: `1.6px solid ${T.dim}`, transform: "rotate(45deg)", marginLeft: -2 }} />
          </HeaderButton>
          <div>
            <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: T.cream }}>{dateLabel}</div>
            <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, marginTop: 1 }}>{subtitle}</div>
          </div>
          {canForward && (
            <HeaderButton onClick={onForward} ariaLabel="Next day">
              <div style={{ width: 8, height: 8, borderRight: `1.6px solid ${T.dim}`, borderTop: `1.6px solid ${T.dim}`, transform: "rotate(45deg)", marginRight: -2 }} />
            </HeaderButton>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {syncing && <SyncDot />}
          <HeaderButton onClick={onSettings} ariaLabel="Settings"><GearGlyph /></HeaderButton>
          <Wordmark height={24} />
        </div>
      </div>

      <div style={{ flex: "0 0 auto", margin: "0 20px 14px", padding: "12px 14px 13px", borderRadius: 14, background: "rgba(255,254,251,0.035)", boxShadow: `inset 0 0 0 1px ${T.line}` }}>
        <WeekBar value={weekConv} target={target} thickness={7} pulse={pulse} />
      </div>

      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Pillar title="Conversations" total={convTotal} note={CONV_DEF}>
          {CONV_SUBS.map((s) => (
            <TapTarget key={s.key} label={s.label} count={state[s.key]} ceiling={s.ceiling} onInc={() => inc(s.key)} onDec={() => dec(s.key)} />
          ))}
        </Pillar>
        <Pillar title="Appointments" total={apptTotal}>
          {APPT_SUBS.map((s) => (
            <TapTarget key={s.key} label={s.label} count={state[s.key]} ceiling={s.ceiling} onInc={() => inc(s.key)} onDec={() => dec(s.key)} />
          ))}
        </Pillar>
        <Pillar title="Content" total={contentTotal}>
          {CONTENT_SUBS.map((s) => (
            <TapTarget key={s.key} label={s.label} count={state[s.key]} ceiling={s.ceiling} onInc={() => inc(s.key)} onDec={() => dec(s.key)} />
          ))}
        </Pillar>
        <Pillar title="Events" total={eventsTotal}>
          {EVENTS_SUBS.map((s) => (
            <TapTarget key={s.key} label={s.label} count={state[s.key]} ceiling={s.ceiling} onInc={() => inc(s.key)} onDec={() => dec(s.key)} />
          ))}
        </Pillar>
      </div>
    </>
  );
}

// ===========================================================================
// This Week
// ===========================================================================
function WeekRow({ label, value, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 30, borderBottom: last ? "none" : `1px solid ${T.lineSoft}` }}>
      <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 14, color: T.dim }}>{label}</div>
      <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums", color: value > 0 ? T.cream : T.dimmer }}>{value}</div>
    </div>
  );
}

export function WeekGroup({ title, total, subs, week }) {
  return (
    <Card pad={15}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 10, borderBottom: `1px solid ${T.line}`, marginBottom: 4 }}>
        <Eyebrow size={11}>{title}</Eyebrow>
        <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 24, lineHeight: 1, color: total > 0 ? T.greenBright : T.dimmer, fontVariantNumeric: "tabular-nums" }}>{total}</div>
      </div>
      {subs.map((s, i) => (
        <WeekRow key={s.key} label={s.label} value={week[s.key]} last={i === subs.length - 1} />
      ))}
    </Card>
  );
}

export function WeekContent({ week, days, todayIndex, target, rangeLabel, onExport, exporting, rewards }) {
  const convTotal = sumKeys(week, CONV_SUBS);
  const apptTotal = sumKeys(week, APPT_SUBS);
  const contentTotal = sumKeys(week, CONTENT_SUBS);
  const eventsTotal = sumKeys(week, EVENTS_SUBS);
  const ratio = apptTotal > 0 ? (convTotal / apptTotal).toFixed(1) : null;

  return (
    <>
      <div style={{ flex: "0 0 auto", padding: "2px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: T.cream }}>This Week</div>
          <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, marginTop: 1 }}>{rangeLabel}</div>
        </div>
        <Wordmark height={24} />
      </div>

      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ padding: "18px 17px 17px", borderRadius: 16, background: "linear-gradient(155deg, rgba(47,191,113,.13) 0%, rgba(47,191,113,.02) 62%, transparent 100%)", boxShadow: "inset 0 0 0 1px rgba(47,191,113,.24)" }}>
          <WeekBar value={convTotal} target={target} thickness={13} big />
        </div>

        <Card pad={15}>
          <Eyebrow size={10.5} style={{ marginBottom: 12 }}>Activity by day</Eyebrow>
          <DayStrip days={days} todayIndex={todayIndex} />
        </Card>

        {rewards && <WeekRewards {...rewards} />}

        <Card pad={15}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Eyebrow size={10.5}>Conversations per appointment</Eyebrow>
              <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, marginTop: 5 }}>{convTotal} conversations, {apptTotal} appointments</div>
            </div>
            <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 30, lineHeight: 1, color: T.cream, fontVariantNumeric: "tabular-nums" }}>{ratio || "0.0"}</div>
          </div>
        </Card>

        <WeekGroup title="Conversations" total={convTotal} subs={CONV_SUBS} week={week} />
        <WeekGroup title="Appointments" total={apptTotal} subs={APPT_SUBS} week={week} />
        <WeekGroup title="Content" total={contentTotal} subs={CONTENT_SUBS} week={week} />
        <WeekGroup title="Events" total={eventsTotal} subs={EVENTS_SUBS} week={week} />

        <div onClick={exporting ? undefined : onExport} role="button" aria-label="Generate story card"
          style={{ marginTop: 2, height: 54, borderRadius: 14, cursor: exporting ? "default" : "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: T.cream, color: T.bg1, opacity: exporting ? 0.7 : 1 }}>
          <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.005em" }}>{exporting ? "Generating story card" : "Generate story card"}</div>
        </div>
      </div>
    </>
  );
}

// ===========================================================================
// Closings (internal only, read-only count from the existing year endpoint)
// ===========================================================================
function ClosingsGrid({ filled, total = 100, dotSize = 22, gap = 11 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(10, ${dotSize}px)`, gridTemplateRows: `repeat(10, ${dotSize}px)`, columnGap: gap, rowGap: gap, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < filled;
        return (
          <div key={i} style={{ width: dotSize, height: dotSize, borderRadius: "50%", background: on ? T.gold : "transparent", boxShadow: on ? `inset 0 0 0 1px ${T.goldMuted}` : "inset 0 0 0 1.5px rgba(255,254,251,0.13)" }} />
        );
      })}
    </div>
  );
}

export function ClosingsContent({ closings, year }) {
  const [open, setOpen] = useState(false); // collapsed by default
  const remaining = Math.max(0, 100 - closings);
  return (
    <>
      <div style={{ flex: "0 0 auto", padding: "2px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: T.cream }}>Closings</div>
          <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, marginTop: 1 }}>{year} goal</div>
        </div>
        <Wordmark height={24} />
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ padding: "12px 14px", borderRadius: 13, marginBottom: 13, background: "rgba(207,51,56,0.09)", boxShadow: "inset 0 0 0 1px rgba(226,87,91,0.30)", display: "flex", gap: 11, alignItems: "flex-start" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.redLift, marginTop: 5, flex: "0 0 auto" }} />
          <div>
            <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.redLift }}>Internal only</div>
            <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 12, color: T.dim, marginTop: 4, lineHeight: 1.45 }}>Closings never appear on the story card. Activity is what gets shared.</div>
          </div>
        </div>

        <Card pad={0}>
          <div onClick={() => setOpen((o) => !o)} role="button" aria-expanded={open} aria-label="Toggle closings grid"
            style={{ height: 52, padding: "0 15px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
              <Eyebrow size={11}>Closings to date</Eyebrow>
              <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 15, color: T.gold, fontVariantNumeric: "tabular-nums" }}>{closings} / 100</div>
            </div>
            <div style={{ width: 8, height: 8, borderRight: `1.6px solid ${T.dim}`, borderBottom: `1.6px solid ${T.dim}`, transform: open ? "rotate(225deg)" : "rotate(45deg)", transition: "transform .22s ease", marginTop: open ? 3 : -3 }} />
          </div>

          {open && (
            <div style={{ padding: "4px 15px 20px", borderTop: `1px solid ${T.lineSoft}` }}>
              <div style={{ padding: "20px 0 16px" }}>
                <ClosingsGrid filled={closings} />
              </div>
              <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, textAlign: "center", letterSpacing: "0.01em" }}>One dot per closed loan. {remaining} to go.</div>
            </div>
          )}
        </Card>

        {!open && (
          <div style={{ marginTop: 13, fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, textAlign: "center" }}>Collapsed by default so it never competes with activity.</div>
        )}
      </div>
    </>
  );
}

// ===========================================================================
// Settings overlay (opened from the Today gear; not a tab)
// ===========================================================================
export function SettingsPanel({ target, setTarget, onClose, soundOn, setSoundOn, onOpenCorrection }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, background: `linear-gradient(180deg, ${T.bg0} 0%, ${T.bg1} 78%)`, display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div style={{ flex: "0 0 auto", padding: "14px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <HeaderButton onClick={onClose} ariaLabel="Close settings">
            <div style={{ width: 8, height: 8, borderLeft: `1.6px solid ${T.dim}`, borderBottom: `1.6px solid ${T.dim}`, transform: "rotate(45deg)", marginLeft: -2 }} />
          </HeaderButton>
          <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: T.cream }}>Settings</div>
        </div>
        <Wordmark height={24} />
      </div>

      <div style={{ padding: "0 20px" }}>
        <Card pad={16}>
          <Eyebrow size={10.5}>Weekly conversation target</Eyebrow>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div onClick={() => setTarget(Math.max(1, target - 5))} role="button" aria-label="Decrease target"
              style={{ width: 52, height: 52, borderRadius: 13, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `inset 0 0 0 1px ${T.line}` }}>
              <div style={{ width: 16, height: 1.6, background: T.cream, borderRadius: 1 }} />
            </div>
            <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 52, lineHeight: 1, color: T.cream, fontVariantNumeric: "tabular-nums" }}>{target}</div>
            <div onClick={() => setTarget(Math.min(500, target + 5))} role="button" aria-label="Increase target"
              style={{ width: 52, height: 52, borderRadius: 13, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `inset 0 0 0 1px ${T.line}`, position: "relative" }}>
              <div style={{ width: 16, height: 1.6, background: T.cream, borderRadius: 1 }} />
              <div style={{ width: 1.6, height: 16, background: T.cream, borderRadius: 1, position: "absolute" }} />
            </div>
          </div>
          <div style={{ marginTop: 15, paddingTop: 13, borderTop: `1px solid ${T.lineSoft}`, fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, lineHeight: 1.5 }}>Week starts Sunday at 12:00am Central. Every day is a business day.</div>
        </Card>

        <div style={{ marginTop: 13 }}>
          <Card pad={16}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <Eyebrow size={10.5}>Tap sound</Eyebrow>
                <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, marginTop: 5, lineHeight: 1.5 }}>A quiet tick on every count.</div>
              </div>
              <div onClick={() => setSoundOn(!soundOn)} role="switch" aria-checked={soundOn} aria-label="Tap sound"
                style={{ flex: "0 0 auto", width: 52, height: 30, borderRadius: 999, cursor: "pointer", padding: 3, background: soundOn ? T.green : "rgba(255,254,251,0.12)", transition: "background .2s", display: "flex", justifyContent: soundOn ? "flex-end" : "flex-start", alignItems: "center" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: soundOn ? T.bg1 : T.dim, transition: "background .2s" }} />
              </div>
            </div>
          </Card>
        </div>

        {onOpenCorrection && (
          <div style={{ marginTop: 13 }}>
            <div onClick={onOpenCorrection} role="button" aria-label="Correct a past day"
              style={{ background: T.surface, borderRadius: 15, boxShadow: `inset 0 0 0 1px ${T.line}`, padding: 16, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <Eyebrow size={10.5}>Correct a past day</Eyebrow>
                <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, marginTop: 5, lineHeight: 1.5 }}>Fix or backfill activity for an earlier day this year.</div>
              </div>
              <div style={{ width: 8, height: 8, borderRight: `1.6px solid ${T.dim}`, borderBottom: `1.6px solid ${T.dim}`, transform: "rotate(-45deg)", flexShrink: 0 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
