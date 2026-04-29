// src/components/calculator/ProgramCardCompact.jsx
//
// Compact summary tile that replaces the heavyweight card body in the
// cockpit layout. Keeps the existing colored header (program name + total
// + rate) but drops the in-card breakdown — the breakdown now lives in the
// detail panel below.
//
// Eligibility / over-limit / VA / "★ Lowest" / "✓ Selected" states are all
// preserved. Only the card body shrinks.
//
// Engineering standards: named export only, P/F/PROGRAM_COLORS from theme,
// no hardcoded hex, inline styles.

import React from 'react';
import { P, F } from '../../theme';
import { fmt } from '../../utils/format';

/**
 * Props
 *  - prog:        the program object built in CalculatorPage.jsx (the same
 *                 object today's full card consumes — no shape changes)
 *  - isBest:      bool — show "★ Lowest" badge
 *  - isSelected:  bool — show "✓ Selected" pill + gold border
 *  - onSelect:    () => void — called when the card body is clicked
 *  - countyLabel: string — preserved label used in over-limit copy
 *  - homePrice:   number — preserved, used for the over-limit "needed down"
 *                 calculation (matches the live page's existing math)
 *  - baseLoan:    number — preserved, used in over-limit copy
 */
export function ProgramCardCompact({
  prog,
  isBest,
  isSelected,
  onSelect,
  countyLabel,
  homePrice,
  baseLoan,
}) {
  // Ineligible — gray header + reason title + truncated body. The live
  // page renders the full reason body; we keep the same words but cap the
  // visible portion to two lines so the card height stays in rhythm with
  // its eligible siblings. Hover/long-press still reveals the rest via
  // the title attribute.
  if (!prog.eligible) {
    const reason = prog.ineligibleReason;
    return (
      <article
        className="content-card calc-compact-card"
        style={ineligibleStyle}
        title={reason ? `${reason.title} — ${reason.body}` : 'Ineligible'}
      >
        <div style={ineligibleHeaderStyle}>
          <span style={programLabelStyle}>{prog.name}</span>
          <span style={ineligibleTitleStyle}>Ineligible</span>
        </div>
        <div style={compactBodyStyle}>
          {reason ? (
            <>
              <p style={ineligibleReasonTitleStyle}>{reason.title}</p>
              <p style={ineligibleReasonBodyStyle}>{reason.body}</p>
            </>
          ) : (
            <p style={ineligibleReasonTitleStyle}>Not available</p>
          )}
        </div>
      </article>
    );
  }

  // Over-limit — gray header + To-Qualify mini-callout. Copy mirrors the
  // live page: "Exceeds {countyLabel} {prog.name} Limit", a sentence
  // explaining the limit + current loan, then the gold "To Qualify"
  // callout. Word-for-word from CalculatorPage.jsx so we don't drift.
  if (prog.overLimit) {
    const neededDown = homePrice - prog.loanLimit;
    const neededPct = homePrice > 0 ? (neededDown / homePrice) * 100 : 0;
    return (
      <article
        className="content-card calc-compact-card"
        style={ineligibleStyle}
      >
        <div style={ineligibleHeaderStyle}>
          <span style={programLabelStyle}>{prog.name}</span>
          <span style={ineligibleTitleStyle}>Over Loan Limit</span>
        </div>
        <div style={compactBodyStyle}>
          <p style={overLimitHeadingStyle}>
            Exceeds {countyLabel} {prog.name} Limit
          </p>
          <p style={overLimitBodyStyle}>
            The {prog.name} loan limit for this area is{' '}
            <strong style={{ color: P.text }}>{fmt(prog.loanLimit)}</strong>.
            Your current loan amount of{' '}
            <strong style={{ color: P.text }}>{fmt(baseLoan)}</strong> exceeds it.
          </p>
          <div style={toQualifyStyle}>
            <span style={toQualifyEyebrowStyle}>To Qualify</span>
            <span style={toQualifyBodyStyle}>
              Increase down payment to at least{' '}
              <strong>{fmt(neededDown)}</strong> ({neededPct.toFixed(1)}%)
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Eligible — full color header, click selects.
  return (
    <article
      className="content-card calc-compact-card"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      style={{
        ...eligibleStyle,
        border: isSelected ? `3px solid ${P.gold}` : `3px solid transparent`,
        boxShadow: isSelected
          ? '0 0 0 4px rgba(184, 134, 11, 0.15), 0 8px 30px rgba(0, 0, 0, 0.12)'
          : undefined,
        transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {isSelected && (
        <span style={selectedPillStyle}>✓ Selected</span>
      )}
      {/* Colored header — preserved treatment, just shorter. */}
      <header
        style={{
          background: prog.color,
          padding: '18px 16px 16px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {isBest && <span style={lowestBadgeStyle(prog.color)}>★ Lowest</span>}
        <span style={headerProgramNameStyle}>{prog.name}</span>
        <span style={headerTotalStyle}>{fmt(prog.total)}</span>
        <span style={headerRateStyle}>
          /mo · {Number(prog.rate).toFixed(3)}%
        </span>
      </header>

      {/* Compact body — eligibility note + click-to-detail affordance. */}
      <div style={compactBodyStyle}>
        <p style={noteStyle}>{prog.note}</p>
        {/* [NEW COPY — Nick to review] "Tap to see details ↓" /
            "Showing in detail ↓" affordance. The live card has no
            equivalent string; this is the cockpit-only hint that the
            detail panel below mirrors the selected card. Strip if the
            visual selection (gold border + ✓ pill) is clear enough on
            its own. */}
        <span style={detailHintStyle}>
          {isSelected ? 'Showing in detail ↓' : 'Tap to see details ↓'}
        </span>
      </div>
    </article>
  );
}

/* ---------- styles ---------- */

const baseCardStyle = {
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
  display: 'flex',
  flexDirection: 'column',
};

const eligibleStyle = baseCardStyle;

const ineligibleStyle = {
  ...baseCardStyle,
  cursor: 'default',
  opacity: 0.62,
};

const ineligibleHeaderStyle = {
  background: P.warmGrayLight,
  padding: '18px 16px 16px',
  textAlign: 'center',
};

const ineligibleTitleStyle = {
  display: 'block',
  fontFamily: F.display,
  fontSize: 22,
  color: '#fff',
};

// Ineligible / over-limit body copy — title is the bold line, body is
// the explanatory sentence. Both visible in the card; we no longer hide
// the body. Card height grows to fit, and the parent grid uses
// `align-items: stretch` so eligible siblings track the tallest tile.
const ineligibleReasonTitleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: P.text,
  textAlign: 'center',
  margin: '0 0 6px',
  lineHeight: 1.3,
};

const ineligibleReasonBodyStyle = {
  fontSize: 11,
  color: P.warmGray,
  textAlign: 'center',
  margin: 0,
  lineHeight: 1.5,
};

const overLimitHeadingStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: P.text,
  textAlign: 'center',
  margin: '0 0 6px',
  lineHeight: 1.3,
};

const overLimitBodyStyle = {
  fontSize: 11,
  color: P.warmGray,
  textAlign: 'center',
  margin: '0 0 10px',
  lineHeight: 1.5,
};

const toQualifyStyle = {
  background: 'rgba(184, 134, 11, 0.08)',
  border: '1px solid rgba(184, 134, 11, 0.25)',
  borderRadius: 6,
  padding: '6px 8px',
  textAlign: 'center',
};

const toQualifyEyebrowStyle = {
  display: 'block',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: P.goldMuted,
  marginBottom: 2,
};

const toQualifyBodyStyle = {
  fontSize: 11,
  color: P.text,
  lineHeight: 1.4,
};

const programLabelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: 2,
};

const headerProgramNameStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: 2,
};

const headerTotalStyle = {
  display: 'block',
  fontFamily: F.display,
  fontSize: 28,
  color: '#fff',
  lineHeight: 1.1,
};

const headerRateStyle = {
  display: 'block',
  fontSize: 11,
  color: 'rgba(255, 255, 255, 0.4)',
  marginTop: 2,
};

const compactBodyStyle = {
  padding: '14px 16px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  // Floor — guarantees the body has room to breathe even when copy is
  // a single line, so an eligible card next to an ineligible one don't
  // pull the row off-rhythm. The grid uses `align-items: stretch` (CSS
  // default for grid children) so this floor propagates to siblings.
  minHeight: 96,
};

const noteStyle = {
  fontSize: 11,
  color: P.warmGrayLight,
  textAlign: 'center',
  fontStyle: 'italic',
  margin: 0,
};

const detailHintStyle = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: P.goldMuted,
  textAlign: 'center',
  marginTop: 'auto',
};

const lowestBadgeStyle = (programColor) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  background: '#fff',
  color: programColor,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: 50,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
});

const selectedPillStyle = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 5,
  background: P.gold,
  color: '#fff',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: 50,
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
};
