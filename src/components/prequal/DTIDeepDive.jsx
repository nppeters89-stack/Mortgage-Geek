// src/components/prequal/DTIDeepDive.jsx
//
// Pre-Qual's focal visualization. Shows the borrower's Front-End and
// Back-End DTI ratios as enlarged horizontal bars with cap markers and
// a step-by-step calculation breakdown beneath each bar. Replaces the
// pie chart's role on the Pre-Qual detail panel.
//
// Why this exists
// ---------------
// Calculator's question is "where does my payment go?" → pie chart.
// Pre-Qual's question is "what's my DTI ceiling and how close am I to
// it?" → DTI bars + the math. The deep-dive is the focal section of
// the Pre-Qual detail panel; everything else (max breakdown table,
// comfortable range, VA usage selector, notes, APR, cross-link) lives
// below.
//
// Three things this component MUST get right because they're the whole
// point:
//   1. The bar fill must show how close the borrower is to the cap. A
//      tick mark at the cap is non-negotiable — without it, the bar
//      reads as "X% of total income" instead of "X% of the cap."
//   2. The binding constraint must be visually obvious. When a program
//      is constrained by Back-End DTI, the back bar gets a ring + halo
//      in `prog.color` and a "← BINDING" pill. The non-binding bar
//      reads as informational.
//   3. The math under each bar must show its work. Pre-Qual's whole
//      promise is "we tell you how we got here." The breakdown rows
//      mirror a calculator showing intermediate steps:
//        Front: HousingMax ÷ GrossIncome = Front-End DTI
//        Back:  HousingMax + Debts ÷ GrossIncome = Back-End DTI
//
// VA edge case
// ------------
// VA does not enforce a front-end DTI cap. The front-end bar renders
// with a striped diagonal pattern and the breakdown is replaced by a
// short note. Lift the live page's exact phrasing into `vaNoFrontCopy`
// before merging — the placeholder copy is `[NEW COPY — Nick to
// review]`.
//
// Engineering standards: named export only, P/F from theme, withAlpha
// from utils/format (added in C0). No new hex values. Inline styles.

import React from 'react';
import { P, F } from '../../theme';
import { fmt, withAlpha } from '../../utils/format';

/**
 * Props
 *  - prog: the selected program object (full shape from PreQualPage.jsx).
 *      Required fields:
 *        prog.name           : string — "Conventional" | "FHA" | "VA" | "USDA"
 *        prog.color          : string — hex from PROGRAM_COLORS[prog.name]
 *        prog.isVA           : boolean
 *        prog.frontDTI       : number — computed front-end ratio (0..1)
 *        prog.backDTI        : number — computed back-end ratio (0..1)
 *        prog.frontCap       : number — front-end DTI cap (0..1)
 *        prog.backCap        : number — back-end DTI cap (0..1)
 *        prog.bindingConstraint : 'front' | 'back' | 'limit' | 'minDown' | null
 *        prog.maxHousing     : number — max monthly housing payment (PITI+MI)
 *      These are EXISTING fields produced by the live PreQualPage.jsx
 *      math — Phase C2's first task is to confirm their names. If the
 *      live file uses different names, rename the props here in one
 *      place rather than chasing the rename across multiple call sites.
 *  - grossMonthlyIncome: number — input from the rail
 *  - monthlyDebts: number — input from the rail
 *  - barHeight: number — 18 at desktop-wide, 14 at desktop. Caller picks.
 *  - layout: 'stacked' | 'side-by-side' — caller picks based on viewport.
 *      'stacked'      → both sections in a single column, gap 32px
 *      'side-by-side' → 1fr 1fr grid, gap 24px
 */
export function DTIDeepDive({
  prog,
  grossMonthlyIncome,
  monthlyDebts,
  barHeight = 14,
  layout = 'stacked',
}) {
  if (!prog) return null;

  const containerStyle =
    layout === 'side-by-side'
      ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }
      : { display: 'flex', flexDirection: 'column', gap: 32 };

  return (
    <div className="pq-dti-deepdive" style={containerStyle}>
      {/* Front-End */}
      {prog.isVA ? (
        <DTISectionVANoFront prog={prog} barHeight={barHeight} />
      ) : (
        <DTISection
          variant="front"
          prog={prog}
          ratio={prog.frontDTI}
          cap={prog.frontCap}
          binding={prog.bindingConstraint === 'front'}
          breakdown={[
            { kind: 'input', label: 'Max Housing Payment', value: fmt(prog.maxHousing) },
            { kind: 'op', label: '÷' },
            { kind: 'input', label: 'Gross Monthly Income', value: fmt(grossMonthlyIncome) },
            { kind: 'op', label: '=' },
            {
              kind: 'result',
              label: 'Front-End DTI',
              value: pct(prog.frontDTI),
            },
            {
              kind: 'capref',
              label: `Cap: ${pct(prog.frontCap)}`,
            },
          ]}
          barHeight={barHeight}
        />
      )}

      {/* Back-End */}
      <DTISection
        variant="back"
        prog={prog}
        ratio={prog.backDTI}
        cap={prog.backCap}
        binding={prog.bindingConstraint === 'back'}
        breakdown={[
          { kind: 'input', label: 'Max Housing Payment', value: fmt(prog.maxHousing) },
          { kind: 'op', label: '+' },
          { kind: 'input', label: 'Monthly Debts', value: fmt(monthlyDebts) },
          { kind: 'op', label: '÷' },
          { kind: 'input', label: 'Gross Monthly Income', value: fmt(grossMonthlyIncome) },
          { kind: 'op', label: '=' },
          {
            kind: 'result',
            label: 'Back-End DTI',
            value: pct(prog.backDTI),
          },
          {
            kind: 'capref',
            label: `Cap: ${pct(prog.backCap)}`,
          },
        ]}
        barHeight={barHeight}
      />
    </div>
  );
}

/* ----------------- one bar + breakdown ----------------- */

function DTISection({ variant, prog, ratio, cap, binding, breakdown, barHeight }) {
  const heading = variant === 'front' ? 'Front-End DTI' : 'Back-End DTI';

  return (
    <section
      className="pq-dti-section"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {/* Section header: title + (optional) BINDING pill */}
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h4 style={sectionHeadingStyle}>{heading}</h4>
        {binding && (
          <span style={bindingPillStyle(prog.color)}>← BINDING</span>
        )}
      </header>

      {/* The bar itself, with cap label above it */}
      <DTIBar
        ratio={ratio}
        cap={cap}
        color={prog.color}
        binding={binding}
        height={barHeight}
      />

      {/* Calculation breakdown */}
      <BreakdownTable rows={breakdown} progColor={prog.color} />
    </section>
  );
}

/* ----------------- VA front-end (no cap) ----------------- */

function DTISectionVANoFront({ prog, barHeight }) {
  // [NEW COPY — Nick to review] Replace this string with the live
  // page's exact phrasing for VA's no-front-cap state. Look in the
  // current PreQualPage.jsx for the VA card body — there's already
  // copy explaining VA only enforces back-end DTI. Lift it verbatim.
  const vaNoFrontCopy =
    'VA does not enforce a front-end DTI cap — back-end is the only binding constraint. [NEW COPY — Nick to review]';

  // Diagonal stripe pattern in the program color tint.
  const stripeColor = withAlpha(prog.color, 0.18);

  return (
    <section
      className="pq-dti-section pq-dti-section--va-nofront"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h4 style={sectionHeadingStyle}>Front-End DTI</h4>
        <span style={vaNAPillStyle}>N/A</span>
      </header>

      <div
        role="img"
        aria-label="VA does not enforce a front-end DTI cap"
        style={{
          height: barHeight,
          borderRadius: 4,
          background: `repeating-linear-gradient(
            -45deg,
            ${P.creamDark} 0,
            ${P.creamDark} 6px,
            ${stripeColor} 6px,
            ${stripeColor} 12px
          )`,
        }}
      />

      <p
        style={{
          fontFamily: F.body,
          fontSize: 12,
          fontStyle: 'italic',
          color: P.warmGrayLight,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {vaNoFrontCopy}
      </p>
    </section>
  );
}

/* ----------------- the bar component ----------------- */

function DTIBar({ ratio, cap, color, binding, height }) {
  // Display ratio as % of the total visible scale. We'd usually show a
  // 0..cap scale, but consumers asked specifically: "show me how close
  // I am to the cap." So:
  //  - Bar track represents 0..cap (the full cap is 100% of the track).
  //  - Bar fill is `(ratio / cap) * 100%`. If ratio > cap (over-cap,
  //    shouldn't happen if eligible), the fill caps at 100% and the
  //    breakdown's BINDING pill is the visual cue.
  //  - A tick at exactly 100% of the track shows the cap; the cap
  //    label sits above it.
  //
  // ALTERNATIVE: 0..100% absolute scale with the cap as a tick mark
  // somewhere along it. Rejected because the cap differs across
  // programs (FHA 56.99% vs Conv 49.99%) and a 0..100% scale wastes a
  // huge swath of bar at the right with nothing in it. Cap-relative
  // scale uses the full bar width meaningfully.
  const fillPct = Math.min(1, ratio / cap) * 100;
  const ratioLabel = pct(ratio);
  const capLabel = pct(cap);

  // Power-bar label rule: ALWAYS tether the percentage to the leading
  // edge of the fill (the spot the bar is "maxing out" toward). Default
  // sits in the empty portion just past the leading edge (dark text on
  // cream). When the fill is so wide the label would overrun the cap
  // tick, flip it inside the fill anchored to the leading edge from the
  // right (white text on color). Either way the label stays glued to
  // the bar's leading edge — that's the "power bar" read.
  const labelEscapesRight = fillPct > 78;

  // Ring + halo on the binding bar. The halo is implemented as a 4px
  // outer outline with offset so it sits outside the bar's border.
  const ringStyles = binding
    ? {
        outline: `2px solid ${color}`,
        outlineOffset: 0,
        boxShadow: `0 0 0 4px ${withAlpha(color, 0.18)}`,
      }
    : null;

  // Label font scales with bar height so the digits feel balanced on
  // both the compact (14px) and the doubled (28px) treatments.
  const labelFontSize = Math.max(13, Math.round(height * 0.55));

  return (
    <div className="pq-dti-bar-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Cap label row: lives above the bar, right-aligned to the cap tick (which is the bar's right edge). */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          fontFamily: F.body,
          fontSize: 11,
          color: P.warmGrayLight,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        Cap: {capLabel}
      </div>

      {/* Bar container — track + fill + cap tick + percentage label. */}
      <div
        style={{
          position: 'relative',
          height,
          borderRadius: 4,
          // Track: program color at 12% — gives a subtle band, not a hard track.
          background: withAlpha(color, 0.12),
          ...ringStyles,
        }}
      >
        {/* Fill */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${fillPct}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 220ms ease',
          }}
        />

        {/* Percentage label — tethered to the leading edge of the fill.
            Sits in the empty portion just past the fill (dark on cream)
            until the fill is wide enough that it would overrun the cap
            tick; then flips inside the fill, still anchored to the
            leading edge (white on color). */}
        {!labelEscapesRight ? (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: `calc(${fillPct}% + 8px)`,
              transform: 'translateY(-50%)',
              fontFamily: F.body,
              fontSize: labelFontSize,
              fontWeight: 700,
              color: P.text,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 0.2,
              whiteSpace: 'nowrap',
            }}
          >
            {ratioLabel}
          </span>
        ) : (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              right: `calc(100% - ${fillPct}% + 8px)`,
              transform: 'translateY(-50%)',
              fontFamily: F.body,
              fontSize: labelFontSize,
              fontWeight: 700,
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 0.2,
              whiteSpace: 'nowrap',
            }}
          >
            {ratioLabel}
          </span>
        )}

        {/* Cap tick — 1px vertical rule at the right edge of the track */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -3,
            bottom: -3,
            right: 0,
            width: 1,
            background: P.text,
          }}
        />
      </div>
    </div>
  );
}

/* ----------------- breakdown rows ----------------- */

function BreakdownTable({ rows, progColor }) {
  return (
    <div className="pq-dti-breakdown" style={breakdownTableStyle}>
      {rows.map((r, i) => {
        if (r.kind === 'op') {
          return (
            <div key={i} style={breakdownOpRowStyle}>
              <span>{r.label}</span>
            </div>
          );
        }
        if (r.kind === 'result') {
          return (
            <div key={i} style={breakdownResultRowStyle(progColor)}>
              <span style={{ color: P.text, fontWeight: 700 }}>{r.label}</span>
              <span
                style={{
                  color: progColor,
                  fontWeight: 700,
                  fontFamily: F.display,
                  fontSize: 22,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {r.value}
              </span>
            </div>
          );
        }
        if (r.kind === 'capref') {
          return (
            <div key={i} style={breakdownCapRefRowStyle}>
              <span>{r.label}</span>
            </div>
          );
        }
        // 'input'
        return (
          <div key={i} style={breakdownInputRowStyle}>
            <span style={{ color: P.warmGray }}>{r.label}</span>
            <span style={{ color: P.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {r.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------- formatting helper ----------------- */

function pct(x) {
  if (typeof x !== 'number' || Number.isNaN(x)) return '—';
  // Match the live page's display style. PreQualPage formats DTI as
  // "X.X%" (one decimal) — confirm during C2 and adjust if the live
  // page uses a different precision.
  return `${(x * 100).toFixed(1)}%`;
}

/* ----------------- styles ----------------- */

const sectionHeadingStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  margin: 0,
};

const bindingPillStyle = (color) => ({
  display: 'inline-block',
  fontFamily: F.body,
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#fff',
  background: color,
  borderRadius: 999,
  padding: '2px 8px 3px',
});

const vaNAPillStyle = {
  display: 'inline-block',
  fontFamily: F.body,
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  background: P.creamDark,
  borderRadius: 999,
  padding: '2px 8px 3px',
};

const breakdownTableStyle = {
  fontFamily: F.body,
  fontSize: 13,
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
};

const breakdownInputRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: `1px solid ${P.creamDark}`,
};

const breakdownOpRowStyle = {
  fontFamily: F.body,
  fontSize: 12,
  fontStyle: 'italic',
  color: P.warmGrayLight,
  textAlign: 'right',
  paddingRight: 4,
  margin: '2px 0',
};

const breakdownResultRowStyle = (color) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  padding: '8px 0 2px',
  borderTop: `2px solid ${color}`,
  marginTop: 4,
});

const breakdownCapRefRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  fontSize: 11,
  fontStyle: 'italic',
  color: P.warmGrayLight,
  paddingTop: 4,
};
