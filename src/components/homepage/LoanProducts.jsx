import { HOME, F } from "../../theme";

// "Popular Home Loan Products" (design handoff). 12 programs as a scannable
// index: 3-col editorial list on desktop, 2-up grid on mobile. Icons are inlined
// Lucide (MIT) monoline paths, stroke 1.6, brand red.
//
// Links are DISABLED for now (program pages don't exist yet): href is null, so
// each item renders as a non-navigating row while the layout + hover animation
// stay intact. To enable later, just set a real href on the item.
const PRODUCTS = [
  { label: "Conventional Loans", icon: "house", href: null },
  { label: "FHA Loans", icon: "landmark", href: null },
  { label: "VA Loans", icon: "shield-check", href: null },
  { label: "USDA Loans", icon: "sprout", href: null },
  { label: "Jumbo Loans", icon: "banknote", href: null },
  { label: "Self Employed Loans", icon: "briefcase", href: null },
  { label: "Construction Loans", icon: "hard-hat", href: null },
  { label: "DSCR Loans", icon: "building-2", href: null },
  { label: "Reverse Mortgage", icon: "rotate-ccw", href: null },
  { label: "Renovation Loans 203(k)", icon: "hammer", href: null },
  { label: "HELOC Loans", icon: "credit-card", href: null },
  { label: "Down Payment Assistance", icon: "hand-coins", href: null },
];

// Inlined Lucide icon bodies (viewBox 0 0 24 24).
const ICONS = {
  house: <><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  landmark: <><path d="M10 18v-7" /><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z" /><path d="M14 18v-7" /><path d="M18 18v-7" /><path d="M3 22h18" /><path d="M6 18v-7" /></>,
  "shield-check": <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  sprout: <><path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" /><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" /><path d="M5 21h14" /></>,
  banknote: <><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></>,
  briefcase: <><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></>,
  "hard-hat": <><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" /><path d="M14 6a6 6 0 0 1 6 6v3" /><path d="M4 15v-3a6 6 0 0 1 6-6" /><rect x="2" y="15" width="20" height="4" rx="1" /></>,
  "building-2": <><path d="M10 12h4" /><path d="M10 8h4" /><path d="M14 21v-3a2 2 0 0 0-4 0v3" /><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" /><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /></>,
  "rotate-ccw": <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>,
  hammer: <><path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9" /><path d="m18 15 4-4" /><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" /></>,
  "credit-card": <><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></>,
  "hand-coins": <><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" /><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" /><path d="m2 16 6 6" /><circle cx="16" cy="9" r="2.9" /><circle cx="6" cy="5" r="3" /></>,
};

function Icon({ name }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={HOME.red} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const css = `
  .lp-section { background: ${HOME.cream}; padding: 24px 56px 84px; }
  .lp-wrap { max-width: 1240px; margin: 0 auto; }
  .lp-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; border-bottom: 1px solid ${HOME.borderLight}; padding-bottom: 30px; margin-bottom: 14px; }
  .lp-eyebrow { font-family: ${F.sans}; font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${HOME.red}; margin: 0 0 14px; }
  .lp-h2 { font-family: ${F.sans}; font-size: 56px; font-weight: 900; letter-spacing: -.03em; line-height: .94; text-transform: uppercase; color: ${HOME.ink}; margin: 0; }
  .lp-h2 .lp-red { color: ${HOME.red}; }
  .lp-sub { font-family: ${F.sans}; font-size: 16px; font-weight: 500; line-height: 1.5; color: ${HOME.textSecondary}; max-width: 300px; text-align: right; padding-bottom: 6px; margin: 0; flex-shrink: 0; }
  .lp-grid { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 48px; }
  .lp-row { display: flex; align-items: center; gap: 18px; padding: 22px 4px; border-bottom: 1px solid ${HOME.rowDivider}; text-decoration: none; cursor: default; transition: padding-left .18s ease; }
  a.lp-row { cursor: pointer; }
  .lp-row:hover { padding-left: 10px; }
  .lp-icon { flex-shrink: 0; display: inline-flex; }
  .lp-label { font-family: ${F.sans}; font-size: 17px; font-weight: 800; letter-spacing: -.005em; line-height: 1.12; text-transform: uppercase; color: ${HOME.ink}; }

  @media (max-width: 768px) {
    .lp-section { padding: 6px 20px 44px; }
    .lp-head { flex-direction: column; align-items: flex-start; gap: 0; border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
    .lp-h2 { font-size: 34px; letter-spacing: -.02em; line-height: .92; }
    .lp-sub { text-align: left; max-width: none; padding-bottom: 0; margin-top: 12px; font-size: 15px; line-height: 1.45; }
    .lp-grid { grid-template-columns: 1fr 1fr; column-gap: 18px; border-top: 1px solid ${HOME.borderLight}; margin-top: 22px; }
    .lp-row { flex-direction: column; align-items: flex-start; gap: 9px; padding: 16px 2px 15px; }
    .lp-row:hover { padding-left: 2px; }
    .lp-label { font-size: 13px; line-height: 1.18; }
  }
  @media (prefers-reduced-motion: reduce) { .lp-row { transition: none; } }
`;

export function LoanProducts() {
  return (
    <section id="products" className="lp-section">
      <style>{css}</style>
      <div className="lp-wrap">
        <div className="lp-head">
          <div>
            <p className="lp-eyebrow">Home Loan Options</p>
            <h2 className="lp-h2">Popular <span className="lp-red">Home Loan</span><br />Products</h2>
          </div>
          <p className="lp-sub">A few of our most-requested loan options and niche lending programs.</p>
        </div>
        <div className="lp-grid">
          {PRODUCTS.map((p) => {
            const inner = (
              <>
                <span className="lp-icon" style={{ width: 30, height: 30 }}><Icon name={p.icon} /></span>
                <span className="lp-label">{p.label}</span>
              </>
            );
            // Links disabled until program pages exist -> render a non-navigating
            // row. Set p.href to enable the anchor.
            return p.href
              ? <a key={p.label} className="lp-row" href={p.href}>{inner}</a>
              : <div key={p.label} className="lp-row">{inner}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
