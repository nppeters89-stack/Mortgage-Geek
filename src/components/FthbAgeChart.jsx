import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea, ReferenceDot } from "recharts";
import { P, F, CHART_COLORS } from "../theme";
import { withAlpha } from "../utils/format";
import { FTHB_AGE } from "../data/geekCharts";

// The Age of the First-Time Homebuyer: NAR's median first-time buyer age by
// survey year, on a dark charcoal canvas. One cream line with a dot at every
// survey point, because the data is a survey and not every year exists (NAR
// skipped years in the 1980s and 1990s), so the line connects the years that
// do. Colors from CHART_COLORS / P via withAlpha; no hardcoded hex. No
// animation. The whisper-subtle band from 28 to 33 is the chart's argument: for
// forty years the line lived inside it, then broke out after 2020. Per the
// text-overlay rule the two callout labels sit in open space off the line (the
// 1991 low below its dot, the 2025 record above-left of its top-right dot),
// never on the line and with no background boxes. sr-only table mirrors the
// series for crawlers.
export function FthbAgeChart() {
  const { surveyYears, surveyAges, BAND_LOW, BAND_HIGH } = FTHB_AGE;

  const data = useMemo(
    () => surveyYears.map((year, i) => ({ year, age: surveyAges[i] })),
    [surveyYears, surveyAges]
  );

  const tickColor = withAlpha(CHART_COLORS.line, 0.55);
  const faint = withAlpha(CHART_COLORS.line, 0.4);
  const ageAt = (yr) => surveyAges[surveyYears.indexOf(yr)];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: P.navyDark, border: `1px solid ${withAlpha(CHART_COLORS.line, 0.15)}`, borderRadius: 8, padding: "10px 14px", boxShadow: `0 4px 20px ${withAlpha(P.navyDark, 0.5)}`, minWidth: 210 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: CHART_COLORS.line, marginBottom: 6 }}>{d.year}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(CHART_COLORS.line, 0.8), marginBottom: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: CHART_COLORS.line, flexShrink: 0 }} />
          median first-time buyer age: {d.age}
        </p>
        <p style={{ fontSize: 11, color: withAlpha(CHART_COLORS.line, 0.5), margin: 0 }}>
          NAR Profile of Home Buyers and Sellers
        </p>
      </div>
    );
  };

  return (
    <div className="fthb-chart">
      <style>{`
        .fthb-chart { width: 100%; }
        .fthb-plot { width: 100%; height: 400px; min-height: 320px; }
        @media (max-width: 640px) { .fthb-plot { height: 340px; } }
        .fthb-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `}</style>

      <div className="fthb-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1981, 2025]}
              ticks={[1981, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025]}
              allowDecimals={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.axis }}
            />
            <YAxis
              domain={[18, 44]}
              ticks={[18, 22, 26, 30, 34, 38, 42]}
              allowDataOverflow
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            {/* The 1981 to 2020 range. Whisper-subtle wash; the label sits at its
                top-left corner in the faint text color, clear of the line. */}
            {/* Explicit x1/x2 span the full domain. Without them Recharts
                renders the band's label but not its fill rect. */}
            <ReferenceArea
              x1={1981}
              x2={2025}
              y1={BAND_LOW}
              y2={BAND_HIGH}
              fill={withAlpha(CHART_COLORS.line, 0.035)}
              stroke="none"
              ifOverflow="hidden"
              label={{ value: `the 1981 to 2020 range: ${BAND_LOW} to ${BAND_HIGH}`, position: "insideTopLeft", fill: faint, fontSize: 11, fontFamily: F.body }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: withAlpha(CHART_COLORS.line, 0.2) }} />
            <Line
              type="monotone"
              dataKey="age"
              stroke={CHART_COLORS.line}
              strokeWidth={2.75}
              dot={{ r: 3, fill: CHART_COLORS.line, stroke: P.navyDark, strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: CHART_COLORS.line, stroke: P.navyDark, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {/* 1991 record low: income-blue dot, label BELOW in the open space
                under the line. */}
            <ReferenceDot x={1991} y={ageAt(1991)} r={5} fill={CHART_COLORS.income} stroke={P.navyDark} strokeWidth={2} isFront
              label={{ value: `${ageAt(1991)} · 1991`, position: "bottom", fill: CHART_COLORS.income, fontSize: 12, fontFamily: F.body, fontWeight: 700 }} />
            {/* 2025 record high: accent-red dot at the top right. The dot sits at
                the x-domain max, so a normal right-growing label clips at the edge.
                Custom label anchored "end" above the dot grows leftward into the
                clear space above the rising line. */}
            <ReferenceDot x={2025} y={ageAt(2025)} r={5} fill={CHART_COLORS.accent} stroke={P.navyDark} strokeWidth={2} isFront
              label={({ viewBox }) => (
                <text x={viewBox.x - 8} y={viewBox.y - 12} textAnchor="end" fill={CHART_COLORS.accent} fontSize={12} fontFamily={F.body} fontWeight={700}>{`${ageAt(2025)} · record`}</text>
              )} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Crawler / no-JS / screen-reader fallback: the full survey series. */}
      <div className="fthb-sr-only">
        <table>
          <caption>Median age of the first-time homebuyer by survey year, from the National Association of Realtors Profile of Home Buyers and Sellers. Survey years only; the survey was not conducted every year in the 1980s and 1990s.</caption>
          <thead>
            <tr>
              <th scope="col">Survey year</th>
              <th scope="col">Median first-time buyer age</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <th scope="row">{d.year}</th>
                <td>{d.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
