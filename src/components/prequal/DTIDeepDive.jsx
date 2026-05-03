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

import React, { useState, useEffect } from 'react';
import { P, F, PROGRAM_COLORS } from '../../theme';
import { fmt, pctCap, withAlpha } from '../../utils/format';

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
      {/* Front-End — VA's 50% front-end cap is treated like every other
          program. (The earlier "VA has no front-end cap" branch reflected
          a different policy stance; PreQualPage now uses 0.50 for VA so
          we always render a normal bar.) */}
      <DTISection
        variant="front"
        prog={prog}
        ratio={prog.frontDTI}
        cap={prog.frontCap}
        binding={prog.bindingConstraint === 'front'}
        grossMonthlyIncome={grossMonthlyIncome}
        monthlyDebts={monthlyDebts}
        barHeight={barHeight}
      />

      {/* Back-End */}
      <DTISection
        variant="back"
        prog={prog}
        ratio={prog.backDTI}
        cap={prog.backCap}
        binding={prog.bindingConstraint === 'back'}
        grossMonthlyIncome={grossMonthlyIncome}
        monthlyDebts={monthlyDebts}
        barHeight={barHeight}
      />
    </div>
  );
}

/* ----------------- one bar + breakdown ----------------- */

function DTISection({ variant, prog, ratio, cap, binding, grossMonthlyIncome, monthlyDebts, barHeight }) {
  const heading = variant === 'front' ? 'Front-End DTI' : 'Back-End DTI';

  // Housing pill text uses a darker variant of prog.color so it stays
  // legible against the soft tint background.
  const housingPillText = housingPillTextColor(prog.color);
  // Sage tints noticeably lighter than the others at 0.10 alpha, so its
  // pill background gets a slightly stronger 0.12 tint.
  const housingPillAlpha = prog.color === P.sage ? 0.12 : 0.10;

  // Equation data. numeratorTerms drives both the fraction's numerator
  // row and the key-pill row (alongside the denominator term). Front-end
  // is single-term; back-end has the housing + debts addition.
  const numeratorTerms = variant === 'front'
    ? [{
        value: fmt(prog.maxHousing),
        color: prog.color,
        pillText: housingPillText,
        pillBgAlpha: housingPillAlpha,
        label: 'Max Housing Payment',
      }]
    : [
        {
          value: fmt(prog.maxHousing),
          color: prog.color,
          pillText: housingPillText,
          pillBgAlpha: housingPillAlpha,
          label: 'Max Housing Payment',
        },
        {
          value: fmt(monthlyDebts),
          color: P.equationDebts,
          pillText: P.equationDebts,
          pillBgAlpha: 0.10,
          label: 'Monthly Debts',
        },
      ];

  const denominator = {
    value: fmt(grossMonthlyIncome),
    color: P.equationIncome,
    pillText: P.equationIncome,
    pillBgAlpha: 0.10,
    label: 'Gross Monthly Income',
  };

  // pctCap (not pct) so the borrower DTI tops out at the cap visually.
  // Without it, a back-end DTI of 0.4998 rounds up to "50.0%" via
  // toFixed(1) and visually exceeds the displayed cap of "49.99%".
  const ratioLabel = pctCap(ratio);

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
        height={barHeight}
      />

      {/* Stacked-fraction equation + color key */}
      <div style={equationWrapStyle}>
        <div style={equationRowStyle}>
          {/* Fraction stack: numerator over denominator with a horizontal
              division bar that auto-stretches to the wider of the two. */}
          <div style={fractionColStyle}>
            <div style={numDenomRowStyle}>
              {numeratorTerms.map((t, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={opPlusStyle}>+</span>}
                  <span style={equationTermStyle(t.color)}>{t.value}</span>
                </React.Fragment>
              ))}
            </div>
            <div style={divisionBarStyle} />
            <div style={numDenomRowStyle}>
              <span style={equationTermStyle(denominator.color)}>{denominator.value}</span>
            </div>
          </div>

          <span style={equalsStyle}>=</span>

          {/* Result block: percentage in prog.color, label below */}
          <div style={resultColStyle}>
            <span style={resultPctStyle(prog.color)}>{ratioLabel}</span>
            <span style={resultLabelStyle}>{heading}</span>
          </div>
        </div>

        {/* Color key — one tinted pill per variable in the equation */}
        <div style={keyRowStyle}>
          {[...numeratorTerms, denominator].map((t) => (
            <span key={t.label} style={pillStyle(t.color, t.pillBgAlpha)}>
              <span style={pillValueStyle(t.pillText)}>{t.value}</span>
              <span style={pillLabelStyle(t.pillText)}>{t.label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Map prog.color → text color for the housing key-pill so the pill text
// stays legible against the withAlpha-tinted background. Falls back to
// P.text for any unknown color.
function housingPillTextColor(progColor) {
  switch (progColor) {
    case PROGRAM_COLORS.Conventional: return P.navy;
    case PROGRAM_COLORS.FHA: return P.goldMuted;
    case PROGRAM_COLORS.VA: return P.sage;
    case PROGRAM_COLORS.USDA: return P.siennaDark;
    default: return P.text;
  }
}

/* ----------------- the bar component ----------------- */

function DTIBar({ ratio, cap, color, height }) {
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
  // Both the borrower DTI label and the cap use pctCap() so a borrower
  // sitting at the cap never visually exceeds it (toFixed(1) on
  // 0.4998 rounds to "50.0%", which would overshoot a "49.99%" cap).
  const ratioLabel = pctCap(ratio);
  const capLabel = pctCap(cap);

  // Battery-cell layout + animation timing. Hoisted above the effects
  // so the mount-sweep timeout can compute its total duration.
  const CELL_COUNT = 5;
  const CELL_RADIUS = 3;
  const CELL_FILL_MS = 130; // per-cell fill duration
  const CELL_STAGGER_MS = 110; // delay between successive cells
  const POST_MOUNT_MS = 220; // un-staggered transition after mount sweep

  // Mount-sweep animation. animFill drives the visual width and label
  // position. Initialized to 0 so first paint shows empty cells; the
  // post-paint effect then sets it to fillPct, letting the cell-fill
  // CSS transition sweep left-to-right (battery-charging effect).
  //
  // Per-cell transition-delay (CELL_STAGGER_MS * i) makes the cells
  // light up sequentially — cell 0 first, then cell 1, etc. — so the
  // bar reads as "powering up" rather than all cells filling at once.
  //
  // After the staggered sweep completes we flip `mounted` to true,
  // which switches the cells to a snappier un-staggered transition.
  // This way typing income/debts (which fires the second effect below)
  // doesn't re-trigger the stagger — bars respond immediately.
  const [animFill, setAnimFill] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // requestAnimationFrame ensures the browser paints the initial 0%
    // width before we set it to fillPct, so the transition actually runs.
    const raf = requestAnimationFrame(() => setAnimFill(fillPct));
    // Flip `mounted` once the longest staggered transition would have
    // finished (last cell's delay + its own duration).
    const sweepMs = (CELL_COUNT - 1) * CELL_STAGGER_MS + CELL_FILL_MS;
    const t = setTimeout(() => setMounted(true), sweepMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only — sweep runs once per (re)mount

  useEffect(() => {
    // Post-mount fillPct updates (typing income/debts). Skip during the
    // mount sweep so it isn't interrupted.
    if (mounted) setAnimFill(fillPct);
  }, [fillPct, mounted]);

  // Power-bar label rule: ALWAYS tether the percentage to the leading
  // edge of the fill (the spot the bar is "maxing out" toward). Default
  // sits in the empty portion just past the leading edge (dark text on
  // cream). When the fill is so wide the label would overrun the cap
  // tick, flip it inside the fill anchored to the leading edge from the
  // right (white text on color). Either way the label stays glued to
  // the bar's leading edge — that's the "power bar" read. Use animFill
  // (not fillPct) so the label slides with the animation.
  const labelEscapesRight = animFill > 78;

  // Label font scales with bar height so the digits feel balanced on
  // both the compact (14px) and the doubled (28px) treatments.
  const labelFontSize = Math.max(13, Math.round(height * 0.55));

  // Battery-cell render: 5 equal cells, 2px gap, each cell rounded on
  // all four corners (reads as five stacked pills, like a battery).
  // Each cell shows a left-anchored partial fill against a tint
  // background, where the partial width within cell `i` is
  // clamp((fillPct/100 * 5) - i, 0, 1). Fully-past cells fill solid;
  // the in-progress cell partials; remaining cells stay tint.
  //
  // Shade progression: leftmost lit cell is the LIGHTEST shade
  // (60% white mixed into prog.color); rightmost is full prog.color.
  // As the bar fills higher, darker cells become visible — gives the
  // "fuller = visually heavier" power-bar read while keeping the
  // discrete cell aesthetic.
  const cellShade = (i) =>
    `color-mix(in srgb, white ${60 - i * 15}%, ${color})`;

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

      {/* Bar container — cell row + cap tick + percentage label.
          Both binding and non-binding bars use the same cell styling;
          the ← BINDING pill in the section header is the visual cue. */}
      <div
        style={{
          position: 'relative',
          height,
          display: 'flex',
          gap: 2,
        }}
      >
        {Array.from({ length: CELL_COUNT }, (_, i) => {
          const cellFill = Math.max(0, Math.min(1, (animFill / 100) * CELL_COUNT - i));
          return (
            <div
              key={i}
              aria-hidden="true"
              style={{
                position: 'relative',
                flex: 1,
                background: withAlpha(color, 0.12),
                borderRadius: CELL_RADIUS,
                overflow: 'hidden',
              }}
            >
              {/* Partial-fill div is always rendered (even at 0% width)
                  so the CSS width transition can run from 0 → target on
                  mount and panel-switch. During the mount sweep each
                  cell uses transition-delay = i * CELL_STAGGER_MS so
                  cells light up sequentially. After the sweep completes
                  (mounted === true) we drop the stagger so typing-driven
                  updates respond immediately. */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${cellFill * 100}%`,
                  background: cellShade(i),
                  transition: mounted
                    ? `width ${POST_MOUNT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    : `width ${CELL_FILL_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${i * CELL_STAGGER_MS}ms`,
                }}
              />
            </div>
          );
        })}

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
              left: `calc(${animFill}% + 8px)`,
              transform: 'translateY(-50%)',
              fontFamily: F.body,
              fontSize: labelFontSize,
              fontWeight: 700,
              color: P.text,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 0.2,
              whiteSpace: 'nowrap',
              // Cream chip masks any cell tint or gap beneath the digits
              background: P.cream,
              padding: '0 4px',
              borderRadius: 3,
              // Match the cells' overall pace: full sweep duration during
              // mount, snappier post-mount.
              transition: mounted
                ? `left ${POST_MOUNT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : `left ${(CELL_COUNT - 1) * CELL_STAGGER_MS + CELL_FILL_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          >
            {ratioLabel}
          </span>
        ) : (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              right: `calc(100% - ${animFill}% + 8px)`,
              transform: 'translateY(-50%)',
              fontFamily: F.body,
              fontSize: labelFontSize,
              fontWeight: 700,
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 0.2,
              whiteSpace: 'nowrap',
              // prog.color chip masks any 2px inter-cell gap behind digits
              background: color,
              padding: '0 4px',
              borderRadius: 3,
              transition: mounted
                ? `right ${POST_MOUNT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : `right ${(CELL_COUNT - 1) * CELL_STAGGER_MS + CELL_FILL_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
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

/* ----------------- equation + key styles ----------------- */

const equationWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const equationRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 28,
  padding: '8px 0 4px',
};

const fractionColStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
};

const numDenomRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '0 6px',
};

const equationTermStyle = (color) => ({
  fontFamily: F.display,
  fontSize: 28,
  fontWeight: 600,
  color,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: 0.2,
  whiteSpace: 'nowrap',
});

const opPlusStyle = {
  fontFamily: F.display,
  fontSize: 24,
  fontWeight: 400,
  color: P.warmGray,
};

// alignSelf: 'stretch' makes the bar match the wider of numerator /
// denominator. The fraction column itself is align-items: center, so
// the bar remains centered without an explicit width.
const divisionBarStyle = {
  alignSelf: 'stretch',
  height: 0,
  borderTop: `1.5px solid ${P.text}`,
  margin: '2px 0',
};

const equalsStyle = {
  fontFamily: F.display,
  fontSize: 26,
  fontWeight: 400,
  color: P.warmGray,
};

const resultColStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 2,
};

const resultPctStyle = (color) => ({
  fontFamily: F.display,
  fontSize: 38,
  fontWeight: 600,
  color,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.05,
});

const resultLabelStyle = {
  fontFamily: F.body,
  fontSize: 10,
  fontWeight: 400,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
};

const keyRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  padding: '18px 0 0',
  marginTop: 18,
  borderTop: `1px solid ${P.creamDark}`,
};

const pillStyle = (color, alpha) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 13px',
  background: withAlpha(color, alpha),
  borderRadius: 999,
});

const pillValueStyle = (textColor) => ({
  fontFamily: F.display,
  fontSize: 14,
  fontWeight: 600,
  color: textColor,
  fontVariantNumeric: 'tabular-nums',
});

const pillLabelStyle = (textColor) => ({
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 500,
  color: textColor,
});
