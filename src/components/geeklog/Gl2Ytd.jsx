import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { T, FF } from "./gl2Tokens";
import { Wordmark, Eyebrow, Card } from "./Gl2Primitives";
import { WeekGroup } from "./Gl2Screens";
import { CONV_SUBS, APPT_SUBS, CONTENT_SUBS, sumKeys } from "./gl2Model";
import { monthDay, rangeLabel } from "./gl2Week";
import { fetchYear } from "../../utils/geeklogApi";

// Geek Log 2.0 YTD screen: weekly totals by Central week, first data week
// through this week. A toggle switches the charted pillar (Conversations /
// Appointments / Content); tapping a point selects that week and shows its
// consolidated breakdown. Green accents, same as the rest of the app.

const withA = (a) => `rgba(255,254,251,${a})`;

const METRICS = [
  { id: "conversations", label: "Conversations", subs: CONV_SUBS, unit: "conversations" },
  { id: "appointments", label: "Appointments", subs: APPT_SUBS, unit: "appointments" },
  { id: "content", label: "Content", subs: CONTENT_SUBS, unit: "posts" },
];

export function YtdContent({ apiKey, year }) {
  const [weeks, setWeeks] = useState(null); // null = loading, [] = no data
  const [selected, setSelected] = useState(null); // weekStart key
  const [metric, setMetric] = useState("conversations");

  useEffect(() => {
    let cancelled = false;
    fetchYear(apiKey, year)
      .then((res) => {
        if (cancelled) return;
        const ws = (res && res.weeks) || [];
        setWeeks(ws);
        setSelected(ws.length ? ws[ws.length - 1].weekStart : null);
      })
      .catch(() => { if (!cancelled) setWeeks([]); });
    return () => { cancelled = true; };
  }, [apiKey, year]);

  const active = METRICS.find((m) => m.id === metric);

  const data = useMemo(
    () => (weeks || []).map((w) => ({ weekStart: w.weekStart, label: monthDay(w.weekStart), value: sumKeys(w, active.subs), week: w })),
    [weeks, active]
  );
  const selectedWeek = useMemo(() => (weeks || []).find((w) => w.weekStart === selected) || null, [weeks, selected]);

  const renderDot = (props) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;
    const on = payload.weekStart === selected;
    return <circle cx={cx} cy={cy} r={on ? 6 : 4} fill={on ? T.greenBright : T.green} stroke={T.bg1} strokeWidth={2} />;
  };

  const Tip = ({ active: on, payload }) => {
    if (!on || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: T.bg1, border: `1px solid ${withA(0.15)}`, borderRadius: 8, padding: "8px 12px" }}>
        <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 12, color: T.cream }}>Week of {d.label}</div>
        <div style={{ fontFamily: FF.body, fontSize: 12, color: T.greenBright, marginTop: 3, fontWeight: 600 }}>{d.value} {active.unit}</div>
      </div>
    );
  };

  const onSelect = (state) => {
    if (state && state.activeLabel != null) {
      const pt = data.find((d) => d.label === state.activeLabel);
      if (pt) setSelected(pt.weekStart);
    }
  };

  return (
    <>
      <div style={{ flex: "0 0 auto", padding: "2px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FF.body, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: T.cream }}>This Year</div>
          <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 11.5, color: T.dimmer, marginTop: 1 }}>Weekly totals</div>
        </div>
        <Wordmark height={24} />
      </div>

      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 13 }}>
        <Card pad={15}>
          {/* Pillar toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }} role="group" aria-label="Chart metric">
            {METRICS.map((m) => {
              const on = m.id === metric;
              return (
                <button
                  key={m.id} type="button" onClick={() => setMetric(m.id)} aria-pressed={on}
                  style={{
                    flex: 1, fontFamily: FF.body, fontSize: 12.5, fontWeight: 700, padding: "8px 4px",
                    borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap",
                    background: on ? "rgba(47,191,113,0.16)" : "transparent",
                    border: `1px solid ${on ? "rgba(47,191,113,0.55)" : T.line}`,
                    color: on ? T.cream : T.dim, transition: "background .15s, border-color .15s, color .15s",
                  }}
                >{m.label}</button>
              );
            })}
          </div>

          {weeks === null ? (
            <div style={{ fontFamily: FF.body, fontSize: 12.5, color: T.dimmer, padding: "24px 0", textAlign: "center" }}>Loading your weeks.</div>
          ) : data.length === 0 ? (
            <div style={{ fontFamily: FF.body, fontSize: 12.5, color: T.dimmer, padding: "24px 0", textAlign: "center", lineHeight: 1.5 }}>
              No weeks yet. Log a few conversations and this fills in as the weeks roll over.
            </div>
          ) : (
            <div style={{ width: "100%", height: 240 }} aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 4 }} onClick={onSelect}>
                  <CartesianGrid stroke={withA(0.07)} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: withA(0.55), fontSize: 11 }} tickLine={false} axisLine={{ stroke: withA(0.2) }} />
                  <YAxis allowDecimals={false} width={30} tick={{ fill: withA(0.55), fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<Tip />} cursor={{ stroke: withA(0.2) }} />
                  <Line type="monotone" dataKey="value" stroke={T.green} strokeWidth={2.75} dot={renderDot} activeDot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {data.length > 0 && (
            <div style={{ fontFamily: FF.body, fontSize: 11, color: T.dimmer, marginTop: 4, textAlign: "center" }}>Tap a point to see that week.</div>
          )}
        </Card>

        {selectedWeek && (
          <>
            <div style={{ padding: "16px 17px", borderRadius: 16, background: "linear-gradient(155deg, rgba(47,191,113,.13) 0%, rgba(47,191,113,.02) 62%, transparent 100%)", boxShadow: "inset 0 0 0 1px rgba(47,191,113,.24)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div>
                  <Eyebrow size={11}>Selected week</Eyebrow>
                  <div style={{ fontFamily: FF.body, fontWeight: 500, fontSize: 12, color: T.dim, marginTop: 5 }}>{rangeLabel(selectedWeek.weekStart)}</div>
                </div>
                <div style={{ fontFamily: FF.body, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                  <span style={{ fontWeight: 700, fontSize: 26, color: T.greenBright }}>{sumKeys(selectedWeek, active.subs)}</span>
                  <div style={{ fontWeight: 500, fontSize: 11, color: T.dimmer }}>{active.unit}</div>
                </div>
              </div>
            </div>

            <WeekGroup title="Conversations" total={sumKeys(selectedWeek, CONV_SUBS)} subs={CONV_SUBS} week={selectedWeek} />
            <WeekGroup title="Appointments" total={sumKeys(selectedWeek, APPT_SUBS)} subs={APPT_SUBS} week={selectedWeek} />
            <WeekGroup title="Content" total={sumKeys(selectedWeek, CONTENT_SUBS)} subs={CONTENT_SUBS} week={selectedWeek} />
          </>
        )}
      </div>
    </>
  );
}
