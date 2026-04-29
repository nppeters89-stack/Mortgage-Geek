// src/components/calculator/DetailPanel.jsx
//
// The right-side / below-cards detail panel for the cockpit layout.
// Renders everything currently stuffed inside the selected card:
//   - Pie chart of monthly payment composition (NEW)
//   - Detailed breakdown table (existing markup, relocated)
//   - Base loan + upfront fee + total loan inner card (existing)
//   - VA usage selector when VA is selected (existing)
//   - Pay-It-Off-Faster expandable (existing — full Original/With Extra block)
//   - APR readout + Cash-to-Close link + APR small-print (existing)
//   - Save to Loan Comparison button + toast + "View saved" link (existing —
//     moved from page-level)
//
// All copy strings are passed in as props or lifted directly from the
// existing `prog` shape. Strings the LIVE page does not contain are
// flagged with `[NEW COPY — Nick to review]` so a human can approve or
// replace them before merging.
//
// Engineering standards: named export only, P/F/PROGRAM_COLORS from theme,
// no hardcoded hex (use withAlpha for translucent brand color), inline
// styles. Recharts already in the bundle for AmortizationChart.

import React from 'react';
import { P, F } from '../../theme';
import { fmt } from '../../utils/format';
// `formatPayoff` is already imported by CalculatorPage from utils/math; pull
// it directly here so DetailPanel is self-contained when it formats the
// "pay it off X earlier" copy.
import { generateAmortData, formatPayoff } from '../../utils/math';
import { CompareIcon } from '../icons';
import { PaymentPieChart } from './PaymentPieChart';

/**
 * Tiny helper: convert a hex color (#RRGGBB) to rgba(r,g,b,a). Lets us
 * tint brand colors without hardcoding rgb triplets. If the input is not a
 * 6-digit hex (e.g. it's already rgba, a CSS keyword, or a 3-digit hex),
 * we return it unchanged — caller is responsible for picking sensible
 * inputs.
 */
function withAlpha(hex, alpha) {
  if (typeof hex !== 'string' || hex.length !== 7 || hex[0] !== '#') return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Props
 *  - prog: the selected program object (full shape from CalculatorPage.jsx)
 *  - taxes, insurance, hoa: monthly escrow values
 *  - baseLoan: number
 *  - homePrice: number — used for the Cash-to-Close URL params and for
 *    the MI-dropoff-LTV calculation in the payoff scenarios block.
 *  - downPct: number — used for the Cash-to-Close URL and FHA MI-month
 *    rule in the payoff scenarios block.
 *  - term: 30 | 15 — used for payoff scenario amort generation.
 *  - taxState, taxMetro: strings — used for the Cash-to-Close URL.
 *  - vaUsage, setVaUsage: existing VA usage state + setter
 *  - extraConfig, updateExtraConfig: existing payoff feature state + setter
 *  - vaUsageSelectId: existing useId() value (preserves accessible label
 *    associations when VA card switches focus)
 *  - pieDiameter: number (px) — caller passes a breakpoint-aware value
 *  - selectedProgram: string | null — only `prog.name` is the *currently
 *    selected* program in the live page's Save button label, but in the
 *    cockpit `prog` is the selected program by definition. Kept as a prop
 *    so the cockpit could relax that invariant later without a rewrite.
 *  - saveToast: { type: 'success' | 'error', msg: string } | null
 *  - onSaveToComparison: () => void — same handler the page uses today.
 *    Wraps the existing localStorage write + toast schedule. Defined in
 *    CalculatorPage.jsx (preserved verbatim) and threaded down.
 */
export function DetailPanel({
  prog,
  taxes,
  insurance,
  hoa,
  baseLoan,
  homePrice,
  downPct,
  term,
  taxState,
  taxMetro,
  vaUsage,
  setVaUsage,
  extraConfig,
  updateExtraConfig,
  vaUsageSelectId,
  pieDiameter = 280,
  saveToast,
  onSaveToComparison,
}) {
  if (!prog) return null;

  const cfg = extraConfig[prog.name] || { enabled: false, strategy: 'monthly', amount: 0 };
  const biweeklyEquivalent = Math.round(prog.pi / 12);

  // Breakdown rows — same logic and labels the existing in-card breakdown uses.
  const breakdownRows = [
    { label: 'Principal & Interest', val: prog.pi },
    ...(prog.mi > 0 ? [{ label: prog.miLabel, val: prog.mi }] : []),
    { label: 'Taxes', val: taxes },
    { label: 'Insurance', val: insurance },
    ...(hoa > 0 ? [{ label: 'HOA Dues', val: hoa }] : []),
  ];

  // Cash-to-Close URL — preserved verbatim from CalculatorPage.jsx so the
  // existing simulator picks up the same scenario the user is looking at.
  const cashToCloseHref =
    `/cash-to-close?price=${homePrice}` +
    `&down=${downPct}` +
    `&term=${term}` +
    `&program=${encodeURIComponent(prog.name)}` +
    `&rate=${prog.rate}` +
    `&state=${taxState}` +
    `&metro=${encodeURIComponent(taxMetro)}` +
    (prog.isVA ? `&vaUsage=${vaUsage}` : '') +
    (hoa > 0 ? `&hoa=${hoa}` : '');

  // Save button is enabled only when the selected program is eligible —
  // matches the live page's `selectedProg = ... && p.eligible` guard.
  const saveEnabled = prog.eligible;

  return (
    <section
      key={prog.name}
      className="content-card calc-detail-panel"
      aria-label={`${prog.name} payment details`}
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Panel header — colored band, matches card header treatment so the
          selection feels like the card "expanded" into the detail panel. */}
      <header
        style={{
          background: prog.color,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          {/* [NEW COPY — Nick to review] "Detailed View" eyebrow. The live
              card header doesn't have this label; it's added here to clue
              users that this band is the expanded detail of the selected
              card above. Strip or rename freely. */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.65)',
              display: 'block',
              marginBottom: 2,
            }}
          >
            {prog.name} · Detailed View
          </span>
          <span style={{ fontFamily: F.display, fontSize: 30, color: '#fff', lineHeight: 1.1 }}>
            {fmt(prog.total)}<span style={{ fontSize: 16, opacity: 0.6 }}> /mo</span>
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* [NEW COPY — Nick to review] "Rate · APR" eyebrow. The live
              card shows rate and APR separately, never under one label.
              Combined here only because the panel header has limited
              vertical real estate. */}
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.65)', display: 'block' }}>
            Rate · APR
          </span>
          <span style={{ fontFamily: F.display, fontSize: 18, color: '#fff' }}>
            {Number(prog.rate).toFixed(3)}%
            <span style={{ opacity: 0.65, fontSize: 14, marginLeft: 6 }}>
              · {Number(prog.apr).toFixed(3)}% APR
            </span>
          </span>
        </div>
      </header>

      {/* Body — 2-column at ≥1100px (cockpit). Left = monthly breakdown
          (+ VA selector when applicable). Right = pie chart, then
          Pay-it-off-faster, then Est. APR. Below the grid the loan
          amount card, note, and Save button stretch full width.
          The class hooks responsive-rules.md's grid switch. */}
      <div className="calc-detail-panel-body" style={detailBodyStyle}>
        {/* LEFT — Breakdown (and VA selector when VA is selected) */}
        <div style={breakdownZoneStyle}>
          {/* [NEW COPY — Nick to review] "Monthly Breakdown" heading. The
              live card has no heading on the breakdown table; it's added
              here because the panel is wider and the table benefits from
              a label. Strip or rename freely. */}
          <h3 style={breakdownHeadingStyle}>Monthly Breakdown</h3>
          <div>
            {breakdownRows.map((r, i) => (
              <div key={i} style={breakdownRowStyle}>
                <span style={{ color: P.warmGray }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: P.text }}>{fmt(r.val)}</span>
              </div>
            ))}
          </div>

          {/* VA usage selector — only when VA is the selected program. */}
          {prog.isVA && (
            <div style={{ marginTop: 14 }}>
              <label
                htmlFor={vaUsageSelectId}
                style={vaUsageLabelStyle}
              >
                VA Eligibility
              </label>
              <select
                id={vaUsageSelectId}
                value={vaUsage}
                onChange={(e) => setVaUsage(e.target.value)}
                style={vaUsageSelectStyle}
              >
                <option value="first">First-Time Use</option>
                <option value="subsequent">Subsequent Use</option>
                <option value="exempt">Exempt (Disability)</option>
              </select>
            </div>
          )}
        </div>

        {/* RIGHT — Pie chart, Pay-it-off-faster, Est. APR */}
        <div style={rightColumnStyle}>
          {/* Pie chart — or a same-size placeholder when total isn't ready yet
              (e.g. rate hasn't loaded). [NEW COPY — Nick to review] "Calculating…" */}
          <div style={pieZoneStyle}>
            {prog.total > 0 ? (
              <PaymentPieChart
                programName={prog.name}
                pi={prog.pi}
                mi={prog.mi}
                miLabel={prog.miLabel}
                taxes={taxes}
                insurance={insurance}
                hoa={hoa}
                total={prog.total}
                diameter={pieDiameter}
              />
            ) : (
              <div
                style={{
                  width: pieDiameter,
                  height: pieDiameter,
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: withAlpha(prog.color, 0.06),
                  border: `1px dashed ${withAlpha(prog.color, 0.35)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: F.body,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: P.warmGrayLight,
                }}
                aria-live="polite"
              >
                Calculating…
              </div>
            )}
          </div>

          {/* Pay-It-Off-Faster — preserved feature, full markup. */}
          <PayoffControl
            prog={prog}
            cfg={cfg}
            biweeklyEquivalent={biweeklyEquivalent}
            updateExtraConfig={updateExtraConfig}
            term={term}
            downPct={downPct}
            homePrice={homePrice}
          />

          {/* APR readout — preserved verbatim from the live card, with
              Cash-to-Close link and small-print note. */}
          <div style={aprCardStyle}>
            <span style={aprEyebrowStyle}>Est. APR</span>
            <span style={{ fontFamily: F.display, fontSize: 22, color: prog.color }}>
              {prog.apr.toFixed(3)}%
            </span>
            <p style={aprDetailLineStyle}>
              Includes lender fees
              {prog.upfront > 0 ? `, ${prog.upfrontLabel}` : ''}
              {prog.mi > 0 ? ', monthly MI' : ''}.{' '}
              <a
                href={cashToCloseHref}
                style={{ color: P.warmGrayLight, textDecoration: 'underline' }}
              >
                Full APR detail →
              </a>
            </p>
            <p style={aprSmallPrintStyle}>
              Estimated APR is for educational purposes only — your actual APR
              will be disclosed on your Loan Estimate.
            </p>
          </div>
        </div>
      </div>

      {/* Loan amount inner card + note + Save button — full-width below
          the 2-col grid. */}
      <div style={{ padding: '24px 28px 20px' }}>
        <div style={loanInnerCardStyle}>
          <div style={loanRowStyle}>
            <span style={{ color: P.warmGray }}>Base Loan Amount</span>
            <span style={{ fontWeight: 600, color: P.text }}>{fmt(baseLoan)}</span>
          </div>
          {prog.upfront > 0 && (
            <div style={{ ...loanRowStyle, fontStyle: 'italic', fontSize: 11 }}>
              <span style={{ color: P.warmGrayLight }}>+ {prog.upfrontLabel}</span>
              <span style={{ fontWeight: 600, color: P.warmGrayLight }}>{fmt(prog.upfront)}</span>
            </div>
          )}
          {prog.isVA && prog.upfront === 0 && (
            <div style={{ ...loanRowStyle, fontStyle: 'italic', fontSize: 11 }}>
              <span style={{ color: P.sage, fontWeight: 600 }}>Funding Fee Waived</span>
              <span style={{ fontWeight: 600, color: P.sage }}>$0</span>
            </div>
          )}
          <div
            style={{
              ...loanRowStyle,
              paddingTop: 6,
              borderTop:
                prog.upfront > 0 || prog.isVA ? `1px solid ${P.creamDark}` : 'none',
            }}
          >
            <span style={{ color: P.warmGray }}>Total Loan Amount</span>
            <span style={{ fontWeight: 700, color: prog.color }}>{fmt(prog.loan)}</span>
          </div>
        </div>

        {/* Note line — preserved verbatim from the live card. */}
        <p
          style={{
            fontSize: 12,
            color: P.warmGrayLight,
            textAlign: 'center',
            fontStyle: 'italic',
            margin: '12px 0 16px',
          }}
        >
          {prog.note}
        </p>

        {/* Save to Comparison — preserved button. The handler
            (`onSaveToComparison`) lives in CalculatorPage.jsx and writes
            to `mg_compare_scenarios` localStorage. Schema unchanged.
            Toast is rendered below the button; "View saved" link is
            preserved. */}
        <div style={saveBlockStyle}>
          <button
            type="button"
            onClick={onSaveToComparison}
            disabled={!saveEnabled}
            style={saveButtonStyle(saveEnabled)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <CompareIcon size={18} variant="cream" />
              {saveEnabled
                ? `Save ${prog.name} to Loan Comparison`
                : 'Select a card above to save'}
            </span>
          </button>
          {saveToast && (
            <p
              style={{
                fontSize: 12,
                marginTop: 10,
                fontWeight: 600,
                color: saveToast.type === 'error' ? '#C0392B' : P.sageDark,
              }}
            >
              {saveToast.msg}
            </p>
          )}
          <div style={{ marginTop: 10 }}>
            <a
              href="/compare"
              style={{
                fontSize: 12,
                color: P.warmGrayLight,
                textDecoration: 'underline',
                fontFamily: F.body,
              }}
            >
              View saved scenarios →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pay-It-Off-Faster ---------- */
//
// Full feature, mirroring the live card markup line-for-line. The block
// has three logical sections:
//   1. Toggle button (enabled/collapsed/expanded)
//   2. Strategy picker (monthly / annual / biweekly) — colored when active
//   3. Either the biweekly explainer OR the extra-payment $ input, then
//      the "enter an amount" empty state OR the Original / With Extra
//      results panel + "You save" navy ribbon + (Conv/FHA only) the
//      MI-savings note.
//
// The math here is identical to the live page; we re-import
// `generateAmortData` and `formatPayoff` from `utils/math`. The only
// reason this lives in a sub-component (rather than inline in the panel)
// is to keep DetailPanel's render readable.

function PayoffControl({
  prog,
  cfg,
  biweeklyEquivalent,
  updateExtraConfig,
  term,
  downPct,
  homePrice,
}) {
  // Header / toggle button.
  return (
    <div style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={() => updateExtraConfig(prog.name, { enabled: !cfg.enabled })}
        style={payoffToggleStyle(cfg.enabled, prog.color)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <span>Pay it off faster</span>
        </span>
        <span style={{ fontSize: 14, opacity: 0.7 }}>{cfg.enabled ? '▾' : '▸'}</span>
      </button>

      {cfg.enabled && (
        <div style={payoffPanelStyle}>
          <label style={payoffStrategyLabelStyle}>Strategy</label>
          <div style={payoffStrategyGridStyle}>
            {[
              { key: 'monthly', label: 'Monthly' },
              { key: 'annual', label: 'Annual' },
              { key: 'biweekly', label: 'Bi-weekly' },
            ].map((s) => {
              const active = cfg.strategy === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => updateExtraConfig(prog.name, { strategy: s.key })}
                  style={payoffStrategyButtonStyle(active, prog.color)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Strategy-specific input */}
          {cfg.strategy === 'biweekly' ? (
            <div style={biweeklyExplainerStyle}>
              {/* Preserved verbatim from live page. */}
              <p style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.5, margin: 0 }}>
                Paying half your P&I every two weeks results in 26 half-payments
                (13 full) per year — one extra monthly payment, split into{' '}
                <strong style={{ color: P.text }}>{fmt(biweeklyEquivalent)}/mo</strong>{' '}
                equivalent.
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor={`extra-payment-${prog.name}`}
                style={extraPaymentLabelStyle}
              >
                Extra {cfg.strategy === 'annual' ? 'per year' : 'per month'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={extraPaymentPrefixStyle}>$</span>
                <input
                  id={`extra-payment-${prog.name}`}
                  type="number"
                  min="0"
                  value={cfg.amount || ''}
                  onChange={(e) =>
                    updateExtraConfig(prog.name, {
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  style={extraPaymentInputStyle}
                />
              </div>
            </div>
          )}

          {/* Original vs With Extra results */}
          <PayoffResults
            prog={prog}
            cfg={cfg}
            term={term}
            downPct={downPct}
            homePrice={homePrice}
          />
        </div>
      )}
    </div>
  );
}

function PayoffResults({ prog, cfg, term, downPct, homePrice }) {
  const isConv = prog.name === 'Conventional';
  const isFHA = prog.name === 'FHA';

  // MI dropoff modeling — preserved from the live page.
  let miDropoffType = 'none';
  let miMonths = 0;
  if (isConv && prog.mi > 0) {
    miDropoffType = 'ltv';
    miMonths = term * 12;
  } else if (isFHA) {
    miDropoffType = 'term';
    miMonths = downPct < 10 ? term * 12 : 132;
  }

  const originalResult = generateAmortData(prog.loan, prog.rate, term, {
    strategy: 'none',
    monthlyMI: prog.mi,
    miMonths,
    homeValue: homePrice,
    miDropoffType,
  });

  const improvedResult = generateAmortData(prog.loan, prog.rate, term, {
    strategy: cfg.strategy,
    extraAmount: cfg.amount,
    monthlyMI: prog.mi,
    miMonths,
    homeValue: homePrice,
    miDropoffType,
  });

  const hasMeaningfulInput =
    cfg.strategy === 'biweekly' || (cfg.amount && cfg.amount > 0);

  if (!hasMeaningfulInput) {
    return (
      <div style={emptyStateStyle}>
        {/* Preserved verbatim from live page. */}
        <p style={{ fontSize: 12, color: P.warmGrayLight, fontStyle: 'italic' }}>
          Enter an amount above to see your savings.
        </p>
      </div>
    );
  }

  const interestSaved = originalResult.totalInterest - improvedResult.totalInterest;
  const monthsSaved = originalResult.payoffMonth - improvedResult.payoffMonth;
  const miSaved = originalResult.miPaidTotal - improvedResult.miPaidTotal;
  const miMonthsSaved =
    (originalResult.miEndMonth || 0) - (improvedResult.miEndMonth || 0);
  const showPmiNote = (isConv || isFHA) && miSaved > 100;

  // Preserved verbatim from live page.
  const headlineLabel =
    cfg.strategy === 'biweekly'
      ? 'Bi-weekly payments'
      : cfg.strategy === 'annual'
      ? `$${cfg.amount.toLocaleString()}/year extra`
      : `$${cfg.amount.toLocaleString()}/month extra`;

  return (
    <div style={resultsCardStyle}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={resultsEyebrowStyle}>Your Impact</span>
        <div style={{ fontFamily: F.display, fontSize: 17, color: P.navy }}>
          {headlineLabel}
        </div>
      </div>

      <div style={resultsGridStyle}>
        <div style={originalCellStyle}>
          <div style={cellLabelStyle('warm')}>Original</div>
          <div style={{ marginBottom: 6 }}>
            <div style={cellRowLabelStyle}>Loan term</div>
            <div style={cellRowValueStyle}>{formatPayoff(originalResult.payoffMonth)}</div>
          </div>
          <div>
            <div style={cellRowLabelStyle}>Total interest</div>
            <div style={cellRowValueStyle}>{fmt(originalResult.totalInterest)}</div>
          </div>
        </div>

        <div style={improvedCellStyle}>
          <div style={cellLabelStyle('gold')}>With extra</div>
          <div style={{ marginBottom: 6 }}>
            <div style={cellRowLabelStyle}>Payoff in</div>
            <div style={cellRowValueStyle}>{formatPayoff(improvedResult.payoffMonth)}</div>
          </div>
          <div>
            <div style={cellRowLabelStyle}>Total interest</div>
            <div style={cellRowValueStyle}>{fmt(improvedResult.totalInterest)}</div>
          </div>
        </div>
      </div>

      <div style={youSaveRibbonStyle}>
        <div style={youSaveEyebrowStyle}>You save</div>
        <div style={youSaveBodyStyle}>
          <span style={{ display: 'block' }}>
            <strong style={{ color: P.goldLight }}>{fmt(interestSaved)}</strong> in interest
          </span>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 500, opacity: 0.92, marginTop: 2 }}>
            Pay off{' '}
            <strong style={{ color: P.goldLight, fontWeight: 700 }}>
              {formatPayoff(monthsSaved)}
            </strong>{' '}
            sooner
          </span>
        </div>
      </div>

      {showPmiNote && (
        <div style={pmiNoteStyle}>
          <p style={{ fontSize: 10.5, color: P.warmGray, lineHeight: 1.4 }}>
            <strong style={{ color: P.navy }}>{isFHA ? 'Note:' : 'Bonus:'}</strong>{' '}
            {isFHA
              ? `FHA MIP runs the life of the loan with <10% down, but ends ${formatPayoff(miMonthsSaved)} earlier with these payments.`
              : `PMI also drops off ${formatPayoff(miMonthsSaved)} earlier, saving an additional ${fmt(miSaved)}.`}
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- styles ---------- */

const detailBodyStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 24,
  padding: '24px 28px 0',
};

// At desktop-wide, the body becomes 2-column. Hooked via responsive-rules.md.
// (CSS for the grid-template-columns switch lives in globalCSS.)

const pieZoneStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 280,
};

const breakdownZoneStyle = {};

const rightColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const breakdownHeadingStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  margin: '0 0 10px',
};

const breakdownRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '7px 0',
  fontSize: 13,
  borderBottom: `1px solid ${P.creamDark}`,
};

const vaUsageLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  display: 'block',
  marginBottom: 4,
};

const vaUsageSelectStyle = {
  width: '100%',
  border: `1px solid ${P.creamDark}`,
  borderRadius: 6,
  background: P.cream,
  padding: '8px 10px',
  fontSize: 13,
  fontFamily: F.body,
  fontWeight: 600,
  color: P.text,
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
};

const loanInnerCardStyle = {
  background: P.creamDark,
  borderRadius: 8,
  padding: '14px 16px',
};

const loanRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 6,
  fontSize: 13,
};

/* ---------- Payoff styles ---------- */

const payoffToggleStyle = (enabled, programColor) => ({
  width: '100%',
  background: enabled ? programColor : P.cream,
  color: enabled ? '#fff' : P.text,
  border: `1px solid ${enabled ? programColor : P.creamDark}`,
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: F.body,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
});

const payoffPanelStyle = {
  marginTop: 10,
  padding: '14px 14px 12px',
  background: P.cream,
  borderRadius: 8,
  border: `1px solid ${P.creamDark}`,
};

const payoffStrategyLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  display: 'block',
  marginBottom: 8,
};

const payoffStrategyGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 6,
  marginBottom: 12,
};

const payoffStrategyButtonStyle = (active, programColor) => ({
  background: active ? programColor : '#fff',
  color: active ? '#fff' : P.text,
  border: `1px solid ${active ? programColor : P.creamDark}`,
  borderRadius: 6,
  padding: '8px 4px',
  fontSize: 11,
  fontWeight: 600,
  fontFamily: F.body,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
});

const biweeklyExplainerStyle = {
  background: '#fff',
  borderRadius: 6,
  padding: '10px 12px',
  border: `1px solid ${P.creamDark}`,
};

const extraPaymentLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  display: 'block',
  marginBottom: 6,
};

const extraPaymentPrefixStyle = {
  position: 'absolute',
  left: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: 13,
  color: P.warmGrayLight,
  fontWeight: 600,
};

const extraPaymentInputStyle = {
  width: '100%',
  background: '#fff',
  border: `1px solid ${P.creamDark}`,
  borderRadius: 6,
  padding: '10px 12px 10px 24px',
  fontSize: 13,
  fontFamily: F.body,
  fontWeight: 600,
  color: P.text,
  outline: 'none',
  boxSizing: 'border-box',
};

const emptyStateStyle = {
  marginTop: 12,
  padding: '14px 16px',
  background: P.cream,
  borderRadius: 6,
  textAlign: 'center',
};

const resultsCardStyle = {
  marginTop: 12,
  background: `linear-gradient(135deg, ${P.creamDark} 0%, ${P.cream} 100%)`,
  borderRadius: 8,
  padding: '14px 12px',
};

const resultsEyebrowStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: P.goldMuted,
  display: 'block',
  marginBottom: 2,
};

const resultsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
  marginBottom: 12,
};

const originalCellStyle = {
  background: '#fff',
  borderRadius: 6,
  padding: '10px 11px',
  borderTop: `2px solid ${P.warmGrayLight}`,
};

const improvedCellStyle = {
  background: '#fff',
  borderRadius: 6,
  padding: '10px 11px',
  borderTop: `2px solid ${P.gold}`,
};

const cellLabelStyle = (variant) => ({
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: variant === 'gold' ? P.goldMuted : P.warmGrayLight,
  marginBottom: 4,
});

const cellRowLabelStyle = {
  fontSize: 10,
  color: P.warmGray,
  lineHeight: 1.2,
};

const cellRowValueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: P.navy,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.25,
};

const youSaveRibbonStyle = {
  background: P.navy,
  color: P.cream,
  borderRadius: 6,
  padding: '10px 14px',
  textAlign: 'center',
};

const youSaveEyebrowStyle = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1.5,
  color: P.goldLight,
  textTransform: 'uppercase',
  marginBottom: 2,
};

const youSaveBodyStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: P.cream,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.4,
};

const pmiNoteStyle = {
  marginTop: 8,
  padding: '7px 11px',
  background: withAlpha(P.gold, 0.08),
  borderRadius: 4,
  borderLeft: `2px solid ${P.gold}`,
};

/* ---------- APR styles ---------- */

const aprCardStyle = {
  marginTop: 12,
  padding: '10px 12px',
  background: P.cream,
  borderRadius: 8,
  textAlign: 'center',
};

const aprEyebrowStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  display: 'block',
  marginBottom: 2,
};

const aprDetailLineStyle = {
  fontSize: 9,
  color: P.warmGrayLight,
  marginTop: 4,
  lineHeight: 1.4,
};

const aprSmallPrintStyle = {
  fontSize: 8,
  color: P.warmGrayLight,
  marginTop: 4,
  lineHeight: 1.4,
  fontStyle: 'italic',
};

/* ---------- Save block styles ---------- */

const saveBlockStyle = {
  textAlign: 'center',
  marginTop: 16,
  paddingTop: 16,
  borderTop: `1px solid ${P.creamDark}`,
};

const saveButtonStyle = (enabled) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '14px 28px',
  borderRadius: 10,
  border: 'none',
  background: enabled ? P.navy : P.creamDark,
  color: enabled ? '#fff' : P.warmGrayLight,
  fontFamily: F.body,
  fontSize: 14,
  fontWeight: 600,
  cursor: enabled ? 'pointer' : 'not-allowed',
  boxShadow: enabled ? '0 4px 16px rgba(27, 58, 75, 0.25)' : 'none',
  transition: 'all 0.2s',
});
