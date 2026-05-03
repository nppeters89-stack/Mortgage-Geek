// src/components/prequal/DetailPanel.jsx
//
// The Pre-Qual cockpit's detail panel. Hosts the DTI deep-dive (focal)
// plus everything relocated out of the compact card body:
//   - Colored header band (program name, max purchase, rate, APR)
//   - DTIDeepDive (the focal visualization)
//   - Max breakdown table (Max Housing Payment, Housing+Debts, Loan
//     Amount, Loan/Income Limit, Financed Fee, Down Payment, MI)
//   - Comfortable Range card
//   - VA Eligibility selector (when VA is selected)
//   - USDA household-income callout (when USDA is selected)
//   - Notes paragraph (verbatim)
//   - APR readout + small print (verbatim)
//   - Footer: "Run this scenario in Calculator →"
//
// All copy strings except the [NEW COPY — Nick to review] eyebrows are
// lifted from PreQualPage.jsx via props on `prog`. If a string in this
// file looks like prose I wrote, it should be replaced with the live
// page's exact phrasing.
//
// Engineering standards: named export only, P/F/PROGRAM_COLORS from
// theme, withAlpha from utils/format, no hardcoded hex, inline styles.

import React from 'react';
import { P, F } from '../../theme';
import { fmt, withAlpha } from '../../utils/format';
import { DTIDeepDive } from './DTIDeepDive';

/**
 * Props
 *  - prog: full program object from PreQualPage.jsx. Required for the
 *      panel to render anything; pass null to render the empty state.
 *      Adds these on top of the ProgramResultCardCompact required set:
 *        prog.apr                 : number
 *        prog.maxHousing          : number — max monthly housing payment (PITI+MI)
 *        prog.maxHousingPlusDebts : number — housing + debts
 *        prog.loanAmount          : number — base loan amount (after limit cap)
 *        prog.financedFee         : number — UFMIP / VA funding fee / USDA guarantee
 *        prog.financedFeeLabel    : string — e.g. "Financed UFMIP"
 *        prog.downPayment         : number — actual down payment dollars
 *        prog.mi                  : number — monthly MI dollars
 *        prog.miLabel             : string — e.g. "PMI (0.27%)"
 *        prog.comfortablePrice    : number — comfortable purchase price (75% of cap)
 *        prog.comfortablePayment  : number — comfortable monthly housing payment
 *        prog.note                : string — the italic note paragraph
 *        prog.aprSmallPrint       : ReactNode — verbatim small-print JSX from live page
 *        prog.usdaIncomeCallout   : ReactNode | null — the "household income" callout JSX (USDA only)
 *  - grossMonthlyIncome: number — passed through to DTIDeepDive
 *  - monthlyDebts: number — passed through to DTIDeepDive
 *  - vaUsage, setVaUsage: existing state + setter from PreQualPage (preserved)
 *  - vaUsageSelectId: existing useId() value (preserves a11y label association)
 *  - dtiBarHeight: number — 18 at desktop-wide, 14 at desktop. Caller picks.
 *  - dtiLayout: 'stacked' | 'side-by-side'. Caller picks.
 *  - calculatorHref: string — built by the page from the current scenario;
 *      the cross-link's href, preserved verbatim including all URL params.
 */
export function DetailPanel({
  prog,
  grossMonthlyIncome,
  monthlyDebts,
  vaUsage,
  setVaUsage,
  vaUsageSelectId,
  dtiBarHeight = 14,
  dtiLayout = 'stacked',
  calculatorHref,
}) {
  if (!prog) {
    return (
      <section
        className="content-card pq-detail-panel pq-detail-panel--empty"
        style={emptyPanelStyle}
        aria-label="Program details (empty)"
      >
        {/* [NEW COPY — Nick to review] empty-state copy. Removed in C3
            once default-selected lands. */}
        <p style={{ fontFamily: F.body, fontSize: 14, color: P.warmGrayLight, margin: 0 }}>
          Tap a program above to see its breakdown. <span aria-hidden="true">↑</span>
        </p>
      </section>
    );
  }

  return (
    <section
      key={prog.name}
      className="content-card pq-detail-panel"
      aria-label={`${prog.name} pre-qualification details`}
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* HEADER BAND — colored, mirrors compact card header so the
          selection feels like the card "expanded" into the panel. */}
      <header style={panelHeaderStyle(prog.color)}>
        <div>
          {/* [NEW COPY — Nick to review] "Detailed View" eyebrow. The
              live card has no equivalent — added here so the panel
              reads as the expanded detail of the selected card above. */}
          <span style={panelEyebrowStyle}>{prog.name} · Detailed View</span>
          <span style={panelMaxPriceStyle}>
            {fmt(prog.maxPrice)}
            <span style={{ fontSize: 16, opacity: 0.6 }}> max</span>
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={panelEyebrowStyle}>Rate · APR</span>
          <span style={panelRateStyle}>
            {Number(prog.rate).toFixed(3)}%
            <span style={{ opacity: 0.65, fontSize: 14, marginLeft: 6 }}>
              · {Number(prog.apr).toFixed(3)}%
            </span>
          </span>
        </div>
      </header>

      {/* OVER-LIMIT BANNER — when the program's max is capped by the loan
          limit (not DTI), surface a clear warning so the user understands
          the binding constraint isn't their income/debts. */}
      {prog.overLimit && (
        <aside style={overLimitBannerStyle(prog.color)}>
          <span aria-hidden="true" style={{ fontSize: 16, marginRight: 8 }}>⚠️</span>
          <span>
            <strong>Capped by {prog.name} loan limit ({fmt(prog.loanLimit)}) — not DTI.</strong>{' '}
            Your income and debts could support more, but the {prog.name} program limit caps your loan amount in this county.
          </span>
        </aside>
      )}

      {/* USDA household-income callout — relocated from current card top.
          Only renders for USDA, where the live page already shows it.
          The callout JSX (including its colored "Household income…" lead)
          is lifted verbatim from the live page via prog.usdaIncomeCallout. */}
      {prog.name === 'USDA' && prog.usdaIncomeCallout && (
        <aside style={usdaCalloutStyle(prog.color)}>
          {prog.usdaIncomeCallout}
        </aside>
      )}

      {/* BODY — 2-column at >=1100px (cockpit). LEFT: Math, Comfortable
          Range, VA selector, Note, Est APR. RIGHT: DTI deep-dive. The
          cross-link CTA sits full-width below the grid. The class hooks
          .pq-detail-panel-body in PreQualPage's CSS for the responsive
          grid switch. */}
      <div className="pq-detail-panel-body" style={panelBodyStyle}>
        {/* LEFT — The Math, Comfortable Range, VA selector, Note, APR */}
        <div style={leftColumnStyle}>
          <div>
            <h3 style={sectionHeadingStyle}>The Math</h3>
            <div style={breakdownInnerCardStyle}>
              <BreakdownRow label="Max Housing Payment" value={fmt(prog.maxHousing)} />
              <BreakdownRow label="Housing + Debts" value={fmt(prog.maxHousingPlusDebts)} />
              <BreakdownRow label="Loan Amount" value={fmt(prog.loanAmount)} />
              <BreakdownRow
                label="Loan Limit"
                value={fmt(prog.loanLimit)}
                muted={!prog.loanLimit}
              />
              {prog.financedFee > 0 && (
                <BreakdownRow
                  label={prog.financedFeeLabel}
                  value={fmt(prog.financedFee)}
                  italic
                />
              )}
              {prog.isVA && prog.financedFee === 0 && (
                <BreakdownRow
                  label="Funding Fee Waived"
                  value="$0"
                  accent={P.sage}
                  italic
                />
              )}
              <BreakdownRow label="Down Payment" value={fmt(prog.downPayment)} />
              {prog.mi > 0 && (
                <BreakdownRow label={prog.miLabel} value={`${fmt(prog.mi)}/mo`} />
              )}
            </div>
          </div>

          {/* Comfortable Range — two-row layout. */}
          {prog.comfortablePrice > 0 && (
            <div style={comfortableCardStyle}>
              <span style={comfortableEyebrowStyle}>Comfortable Range</span>
              <div style={comfortableRowStyle}>
                <span style={{ color: P.warmGray }}>Purchase Price</span>
                <span style={{ fontWeight: 700, color: P.sage, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(prog.comfortablePrice)}
                </span>
              </div>
              <div style={comfortableRowStyle}>
                <span style={{ color: P.warmGray }}>Housing Payment</span>
                <span style={{ fontWeight: 600, color: P.text, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(prog.comfortablePayment)}/mo
                </span>
              </div>
            </div>
          )}

          {/* VA usage selector (VA only) */}
          {prog.isVA && (
            <div>
              <label htmlFor={vaUsageSelectId} style={vaUsageLabelStyle}>
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

          {/* APR readout */}
          <div style={aprCardStyle}>
            <span style={aprEyebrowStyle}>Est. APR</span>
            <span style={aprValueStyle(prog.color)}>
              {Number(prog.apr).toFixed(3)}%
            </span>
            {prog.aprSmallPrint ? (
              <div style={aprDetailWrapStyle}>{prog.aprSmallPrint}</div>
            ) : (
              <p style={aprDetailLineStyle}>
                Includes lender fees and any financed upfront cost. Estimated APR is for educational purposes only — your actual APR will be disclosed on your Loan Estimate.
              </p>
            )}
          </div>

          {/* Cross-link CTA — anchored to the bottom of the left column
              so its width matches the column rather than spanning the
              full panel. */}
          {calculatorHref && (
            <a href={calculatorHref} style={crossLinkButtonStyle(prog.color)}>
              Run this scenario in Calculator
              <span style={{ marginLeft: 8 }} aria-hidden="true">→</span>
            </a>
          )}
        </div>

        {/* RIGHT — DTI power bars (focal visualization). The DTI caveat
            note (`prog.note`) lives here too so it sits adjacent to the
            calculations it qualifies, rather than floating in the left
            column between Comfortable Range and APR. */}
        <div style={rightColumnStyle}>
          <DTIDeepDive
            prog={prog}
            grossMonthlyIncome={grossMonthlyIncome}
            monthlyDebts={monthlyDebts}
            barHeight={dtiBarHeight}
            layout={dtiLayout}
          />
          {prog.note && (
            <p style={notesStyle}>{prog.note}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------- breakdown helpers ----------------- */

function BreakdownRow({ label, value, muted, italic, accent }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: `1px solid ${P.creamDark}`,
        fontStyle: italic ? 'italic' : 'normal',
        fontSize: italic ? 11 : 13,
      }}
    >
      <span style={{ color: muted ? P.warmGrayLight : (accent || P.warmGray) }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          color: muted ? P.warmGrayLight : (accent || P.text),
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ----------------- styles ----------------- */

const panelHeaderStyle = (color) => ({
  background: color,
  padding: '20px 28px',
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 12,
});

const panelEyebrowStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: 'rgba(255, 255, 255, 0.65)',
  display: 'block',
  marginBottom: 2,
};

const panelMaxPriceStyle = {
  fontFamily: F.display,
  fontSize: 30,
  color: '#fff',
  lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums',
};

const panelRateStyle = {
  fontFamily: F.display,
  fontSize: 18,
  color: '#fff',
  fontVariantNumeric: 'tabular-nums',
};

const usdaCalloutStyle = (color) => ({
  background: withAlpha(color, 0.08),
  borderLeft: `3px solid ${color}`,
  padding: '10px 16px',
  fontFamily: F.body,
  fontSize: 13,
  color: P.text,
  lineHeight: 1.5,
});

const overLimitBannerStyle = (color) => ({
  background: withAlpha(color, 0.1),
  borderLeft: `3px solid ${color}`,
  padding: '12px 16px',
  fontFamily: F.body,
  fontSize: 13,
  color: P.text,
  lineHeight: 1.5,
  display: 'flex',
  alignItems: 'flex-start',
});

// NOTE: grid-template-columns and gap are intentionally driven by the
// .pq-detail-panel-body CSS rule in PreQualPage.jsx so the @media
// breakpoint can switch to 2 columns at >=1100px. Inline styles would
// beat the class rule, so we only set padding here.
const panelBodyStyle = {
  // Bottom padding bumped from 16 → 24 since the cross-link CTA now
  // lives inside the left column and there's no longer a separate
  // padded wrapper below the grid.
  padding: '24px 28px 24px',
};

const leftColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minWidth: 0,
};

const rightColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minWidth: 0,
};

const sectionHeadingStyle = {
  fontFamily: F.body,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  margin: '8px 0 10px',
};

const breakdownInnerCardStyle = {
  background: P.creamDark,
  borderRadius: 8,
  padding: '4px 16px',
};

const comfortableCardStyle = {
  marginTop: 16,
  background: P.creamDark,
  borderRadius: 8,
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const comfortableEyebrowStyle = {
  fontFamily: F.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
};

const comfortableRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: F.body,
  fontSize: 12,
};

const vaUsageLabelStyle = {
  fontFamily: F.body,
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

const notesStyle = {
  fontFamily: F.body,
  fontSize: 12,
  fontStyle: 'italic',
  color: P.warmGrayLight,
  lineHeight: 1.6,
  margin: '16px 0 12px',
  textAlign: 'center',
};

const aprCardStyle = {
  marginTop: 8,
  padding: '12px 14px',
  background: P.cream,
  borderRadius: 8,
  textAlign: 'center',
};

const aprEyebrowStyle = {
  fontFamily: F.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: P.warmGrayLight,
  display: 'block',
  marginBottom: 4,
};

const aprValueStyle = (color) => ({
  fontFamily: F.display,
  fontSize: 22,
  color: color,
  fontVariantNumeric: 'tabular-nums',
});

const aprDetailLineStyle = {
  fontFamily: F.body,
  fontSize: 10,
  color: P.warmGrayLight,
  marginTop: 6,
  lineHeight: 1.5,
};

const aprDetailWrapStyle = {
  marginTop: 6,
};

const crossLinkButtonStyle = (color) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Lives at the bottom of the left column. The column's gap: 16
  // handles top spacing; column-flex stretches it to the column width.
  padding: '14px 20px',
  background: color,
  color: '#fff',
  borderRadius: 10,
  fontFamily: F.body,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'transform 0.15s, box-shadow 0.15s',
});

const emptyPanelStyle = {
  padding: '40px 28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  border: `1px dashed ${P.creamDark}`,
  background: 'transparent',
  boxShadow: 'none',
};
