// src/components/prequal/ProgramResultCardCompact.jsx
//
// Compact summary tile for the Pre-Qual cockpit. Replaces the
// heavyweight per-program card body — the big breakdown table, the
// inline DTI text, the comfortable-range card, the VA usage selector,
// the notes, the APR readout, and the cross-link CTA — all of which
// move to the detail panel.
//
// What stays on the card
// ----------------------
//   - Colored header with program name, max purchase price, rate
//   - "★ Most Power" badge (preserved logic)
//   - "✓ Selected" pill in the gold treatment
//   - Two thin DTI bars (4–6px) — quick-glance indicators ONLY; the
//     real visualization lives in the detail panel's DTIDeepDive
//   - Per-card binding-constraint label below the bars
//   - Ineligible state (gray header, ⚠️ icon, reason title)
//   - Over-limit state (gray header, "⚠️ Loan limit: $X")
//
// Card click behavior
// -------------------
// Clicking an eligible card sets it as the detail panel's source.
// Clicking the same card again does NOT deselect — the panel always
// shows something. Mirrors Calculator's cockpit. Ineligible cards are
// not clickable (`role="presentation"`, no onClick).
//
// PROVENANCE NOTES
// ----------------
// All copy strings — "★ Most Power", "front-end DTI binding",
// "back-end DTI binding", "capped at loan limit", "capped at X% min
// down", the ⚠️ icons, the reason-title strings — should be lifted
// VERBATIM from PreQualPage.jsx. This component receives them as
// props or reads them from `prog`. If you find yourself typing a new
// string in this file, stop and check the live page first.
//
// Engineering standards: named export only, P/F from theme, withAlpha
// from utils/format, no hardcoded hex, inline styles.

import React from 'react';
import { P, F } from '../../theme';
import { fmt, withAlpha } from '../../utils/format';

/**
 * Props
 *  - prog: program object (full shape from PreQualPage.jsx). Required:
 *      prog.name                  : string
 *      prog.color                 : string — hex from PROGRAM_COLORS
 *      prog.eligible              : boolean
 *      prog.maxPrice              : number
 *      prog.rate                  : number
 *      prog.frontDTI              : number (0..1)
 *      prog.backDTI               : number (0..1)
 *      prog.frontCap              : number (0..1)
 *      prog.backCap               : number (0..1)
 *      prog.bindingConstraint     : 'front' | 'back' | 'limit' | 'minDown' | null
 *      prog.bindingLabel          : string — verbatim from live page
 *      prog.ineligibleReason      : string | null — title-case reason
 *      prog.overLimit             : boolean — over-loan-limit flag
 *      prog.loanLimit             : number — applicable limit (FHA/VA/USDA)
 *      prog.isMostPower           : boolean
 *  - selected: boolean — whether this card is the active detail-panel source
 *  - onSelect: () => void — called when card is clicked (eligible cards only)
 */
export function ProgramResultCardCompact({ prog, selected, onSelect }) {
  if (!prog) return null;
  const eligible = !!prog.eligible && !prog.overLimit;

  // Header treatment matches the live card's header. Gray for ineligible
  // and over-limit states; full program color for eligible.
  const headerBg = eligible ? prog.color : P.warmGrayLight;

  return (
    <article
      className={
        'pq-card-compact' +
        (selected ? ' pq-card-compact--selected' : '') +
        (eligible ? '' : ' pq-card-compact--ineligible')
      }
      onClick={eligible ? onSelect : undefined}
      role={eligible ? 'button' : 'presentation'}
      tabIndex={eligible ? 0 : -1}
      onKeyDown={
        eligible
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect && onSelect();
              }
            }
          : undefined
      }
      aria-pressed={eligible ? !!selected : undefined}
      style={cardOuterStyle(selected, eligible)}
    >
      {/* SELECTED PILL (top-left) */}
      {selected && eligible && (
        <span style={selectedPillStyle}>✓ Selected</span>
      )}

      {/* MOST POWER BADGE (top-right) */}
      {prog.isMostPower && eligible && (
        <span style={mostPowerBadgeStyle}>★ Most Power</span>
      )}

      {/* HEADER — colored band */}
      <header style={cardHeaderStyle(headerBg)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={cardProgramNameStyle}>{prog.name}</span>
          {eligible ? (
            <span style={cardMaxPriceStyle}>{fmt(prog.maxPrice)}</span>
          ) : (
            <span style={cardIneligibleTitleStyle}>
              ⚠️ {prog.ineligibleReason || (prog.overLimit ? `Loan limit: ${fmt(prog.loanLimit)}` : 'Not eligible')}
            </span>
          )}
        </div>
        <span style={cardRateStyle}>
          {Number(prog.rate).toFixed(3)}%
        </span>
      </header>

      {/* BODY — DTI bars + binding label */}
      <div style={cardBodyStyle}>
        {eligible ? (
          <>
            <DTIRow
              label="Front"
              ratio={prog.frontDTI}
              cap={prog.frontCap}
              color={prog.color}
              binding={prog.bindingConstraint === 'front'}
            />
            <DTIRow
              label="Back"
              ratio={prog.backDTI}
              cap={prog.backCap}
              color={prog.color}
              binding={prog.bindingConstraint === 'back'}
            />

            {prog.bindingLabel && (
              <p style={bindingLabelStyle(prog.color)}>{prog.bindingLabel}</p>
            )}
          </>
        ) : (
          <p style={ineligibleBodyStyle}>
            {/* Ineligible/over-limit copy — lifted from the live card body.
                Phase C2: replace this fallback with whatever the live page
                renders for the matching state. The live page has distinct
                copy for ineligible vs over-limit; both should be passed in
                via prog (e.g. prog.ineligibleBody / prog.overLimitBody) so
                this file holds zero hand-written copy. */}
            {prog.ineligibleBody ||
              (prog.overLimit
                ? `Maximum loan capped at ${fmt(prog.loanLimit)} for this county.`
                : prog.ineligibleReason || 'Not eligible.')}
          </p>
        )}
      </div>
    </article>
  );
}

/* ----------------- thin DTI row (quick-glance) ----------------- */

function DTIRow({ label, ratio, cap, color, binding }) {
  const fillPct = Math.min(1, (ratio || 0) / (cap || 1)) * 100;

  return (
    <div style={dtiRowOuterStyle}>
      <span style={dtiRowLabelStyle}>{label}</span>
      <div style={dtiRowBarOuterStyle(color)}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `${fillPct}%`,
            background: color,
            borderRadius: 2,
            boxShadow: binding
              ? `0 0 0 2px ${withAlpha(color, 0.3)}`
              : 'none',
          }}
        />
      </div>
      <span style={dtiRowValueStyle}>{pct(ratio)}</span>
    </div>
  );
}

/* ----------------- formatting helper ----------------- */

function pct(x) {
  if (typeof x !== 'number' || Number.isNaN(x)) return '—';
  return `${(x * 100).toFixed(1)}%`;
}

/* ----------------- styles ----------------- */

const cardOuterStyle = (selected, eligible) => ({
  position: 'relative',
  background: P.cream,
  border: `1px solid ${selected ? P.gold : P.creamDark}`,
  borderRadius: 14,
  overflow: 'hidden',
  boxShadow: selected
    ? `0 6px 20px ${withAlpha(P.gold, 0.18)}`
    : '0 1px 2px rgba(0,0,0,0.03)',
  cursor: eligible ? 'pointer' : 'default',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  display: 'flex',
  flexDirection: 'column',
  // Set a min-height so all four cards align across the row even if
  // some have a binding label and others don't.
  minHeight: 168,
});

const selectedPillStyle = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 2,
  fontFamily: F.body,
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#fff',
  background: P.gold,
  borderRadius: 999,
  padding: '2px 9px 3px',
};

const mostPowerBadgeStyle = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 2,
  fontFamily: F.body,
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: 0.8,
  color: P.text,
  background: P.goldLight,
  borderRadius: 999,
  padding: '2px 9px 3px',
};

const cardHeaderStyle = (bg) => ({
  background: bg,
  color: '#fff',
  padding: '14px 14px 12px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
});

const cardProgramNameStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.75)',
};

const cardMaxPriceStyle = {
  fontFamily: F.display,
  fontSize: 24,
  color: '#fff',
  lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums',
};

const cardIneligibleTitleStyle = {
  fontFamily: F.body,
  fontSize: 13,
  fontWeight: 600,
  color: '#fff',
  lineHeight: 1.3,
  marginTop: 2,
};

const cardRateStyle = {
  fontFamily: F.display,
  fontSize: 14,
  color: 'rgba(255,255,255,0.85)',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

const cardBodyStyle = {
  padding: '12px 14px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
};

const dtiRowOuterStyle = {
  display: 'grid',
  gridTemplateColumns: '40px 1fr 50px',
  alignItems: 'center',
  gap: 8,
};

const dtiRowLabelStyle = {
  fontFamily: F.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
};

const dtiRowBarOuterStyle = (color) => ({
  position: 'relative',
  height: 6,
  background: withAlpha(color, 0.12),
  borderRadius: 2,
});

const dtiRowValueStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 600,
  color: P.text,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

const bindingLabelStyle = (color) => ({
  fontFamily: F.body,
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: 0.4,
  color: color,
  margin: '4px 0 0',
  lineHeight: 1.3,
});

const ineligibleBodyStyle = {
  fontFamily: F.body,
  fontSize: 12,
  color: P.warmGray,
  lineHeight: 1.45,
  margin: 0,
};
