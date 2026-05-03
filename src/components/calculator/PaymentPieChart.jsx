// src/components/calculator/PaymentPieChart.jsx
//
// Donut chart of the selected program's monthly payment composition.
// Built on Recharts (already installed for AmortizationChart).
//
// All slice colors derive from existing tokens — no hardcoded hex values.
// The P&I slice picks up PROGRAM_COLORS[programName] so the chart re-themes
// when the user selects a different card.
//
// Engineering standards:
//   - Named export only.
//   - Inline styles, matching existing repo convention.
//   - All copy/labels passed in via props from CalculatorPage; no invented strings.
//   - Tooltip and center label use `fmt()` from utils/format for consistency
//     with the rest of the calculator's number formatting.

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { P, F, PROGRAM_COLORS } from '../../theme';
import { fmt } from '../../utils/format';

/**
 * Props
 *  - programName: 'Conventional' | 'FHA' | 'VA' | 'USDA'
 *  - pi:        number  (P&I monthly)
 *  - mi:        number  (PMI/MIP/Annual Fee monthly — pass 0 to omit slice)
 *  - miLabel:   string | null  (e.g. "MIP (0.50%)" — pass null to omit)
 *  - taxes:     number
 *  - insurance: number
 *  - hoa:       number  (pass 0 to omit slice)
 *  - total:     number  (sum of all of the above; computed by parent for consistency)
 *  - diameter:  number  (px; defaults handled by parent breakpoint)
 */
export function PaymentPieChart({
  programName,
  pi,
  mi,
  miLabel,
  taxes,
  insurance,
  hoa,
  total,
  diameter = 280,
  showTooltip = true,
}) {
  // Build the slice array. Order is fixed (P&I always first, HOA always last
  // when present) so the chart reads consistently across programs.
  const slices = useMemo(() => {
    const piColor = PROGRAM_COLORS[programName];
    // Insurance defaults to sage, but swaps to gold when the program color is
    // also sage (VA) so the slice doesn't collide with P&I. VA has no monthly
    // MI slice, so gold is free on that program.
    const insuranceColor = piColor === P.sage ? P.gold : P.sage;
    const arr = [
      { key: 'pi', label: 'Principal & Interest', value: pi, color: piColor },
      { key: 'taxes', label: 'Taxes', value: taxes, color: P.warmGray },
      { key: 'insurance', label: 'Insurance', value: insurance, color: insuranceColor },
    ];
    if (mi > 0 && miLabel) {
      // MI sits between insurance and HOA so the visual order is:
      // [program color] → [neutrals] → [gold accent] → [optional HOA]
      arr.push({ key: 'mi', label: miLabel, value: mi, color: P.gold });
    }
    if (hoa > 0) {
      arr.push({ key: 'hoa', label: 'HOA Dues', value: hoa, color: P.warmGrayLight });
    }
    return arr;
  }, [programName, pi, mi, miLabel, taxes, insurance, hoa]);

  // Donut geometry — outer radius drives the actual visual size; inner radius
  // is the hole. The PieChart's plotting area is sized to `diameter` so the
  // donut stays a perfect circle even though the chart container reserves
  // extra height below for the pinned tooltip.
  const outerRadius = diameter / 2;
  const innerRadius = outerRadius * 0.62; // 62% inner = comfortable label hole
  // Reserve room below the donut for the pinned tooltip so it never has to
  // overlap the center label or any slice. When showTooltip is off (mobile
  // card path, where colored badges on the breakdown rows replace the
  // tooltip role), drop the reserve so the chart's bottom hugs the donut.
  const TOOLTIP_RESERVE = showTooltip ? 64 : 0;
  const totalHeight = diameter + TOOLTIP_RESERVE;
  const donutCenterY = diameter / 2; // donut stays vertically centered in the
                                     // top `diameter` slab of the chart

  return (
    <div
      style={{
        position: 'relative',
        width: diameter,
        height: totalHeight,
        // Center the chart in whatever container the parent provides.
        margin: '0 auto',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy={donutCenterY}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke={P.cream}
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={420}
            animationEasing="ease-out"
          >
            {slices.map((s) => (
              <Cell key={s.key} fill={s.color} />
            ))}
          </Pie>
          {/* Tooltip is pinned to a fixed point just below the donut so it
              can never overlap the center label. Using `position` overrides
              Recharts' default cursor-tracking behavior; `wrapperStyle`
              keeps it click-through and centered relative to the chart. */}
          {showTooltip && (
            <Tooltip
              content={<SliceTooltip total={total} />}
              position={{ x: Math.max(0, (diameter - 200) / 2), y: diameter + 4 }}
              wrapperStyle={{ pointerEvents: 'none', zIndex: 5 }}
              isAnimationActive={false}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center label — overlay on the donut hole. Sized to the top `diameter`
          slab only so the bottom tooltip reserve doesn't shift the labels. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: diameter,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: F.body,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: P.warmGrayLight,
          }}
        >
          PITI
        </span>
        <span
          style={{
            fontFamily: F.display,
            fontSize: Math.round(diameter * 0.10),
            color: P.navy,
            lineHeight: 1.05,
            marginTop: 2,
          }}
        >
          {fmt(total)}
        </span>
        <span
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: P.textLight,
            marginTop: 2,
          }}
        >
          / month
        </span>
      </div>
    </div>
  );
}

// Tooltip card. Mirrors the existing breakdown row treatment so it doesn't
// look like a foreign element.
function SliceTooltip({ active, payload, total }) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;
  const pct = total > 0 ? (slice.value / total) * 100 : 0;
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${P.creamDark}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontFamily: F.body,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        width: 200,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          color: P.warmGray,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: slice.color,
          }}
        />
        {slice.label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: P.text }}>
        {fmt(slice.value)}
        <span style={{ fontWeight: 500, color: P.warmGray, marginLeft: 6 }}>
          {pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
