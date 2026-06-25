import { HOME, F } from "../../theme";

// Value props (design handoff §3): PowerBid (red gradient) + Same Day (charcoal).
// Product logos use the existing repo SVGs. The * / ** footnotes are the short
// marketing notes on the cards (full legal lives in the footer).
const css = `
  .vp-section { background: ${HOME.cream}; padding: 64px 56px 72px; }
  .vp-wrap { max-width: 1240px; margin: 0 auto; }
  .vp-label-row { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
  .vp-label { font-family: ${F.sans}; font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${HOME.red}; white-space: nowrap; }
  .vp-rule { flex: 1; height: 1px; background: ${HOME.borderLight}; }
  .vp-grid { display: grid; grid-template-columns: 1.14fr 0.86fr; gap: 24px; }
  .vp-card { border-radius: 20px; padding: 42px 40px; color: ${HOME.white}; display: flex; flex-direction: column; }
  .vp-card--pb { background: linear-gradient(155deg, ${HOME.redGradFrom}, ${HOME.redGradTo}); box-shadow: 0 14px 34px rgba(184,42,47,.24); }
  .vp-card--sd { background: ${HOME.charcoal}; box-shadow: 0 14px 34px rgba(0,0,0,.16); }
  .vp-logo { display: block; width: auto; }
  .vp-h2 { font-family: ${F.sans}; font-weight: 800; letter-spacing: -.025em; color: ${HOME.white}; margin: 22px 0 14px; }
  .vp-card--pb .vp-h2 { font-size: 42px; line-height: 1.02; }
  .vp-card--sd .vp-h2 { font-size: 36px; line-height: 1.05; }
  .vp-star-pb { color: ${HOME.redTint3}; }
  .vp-star-sd { color: ${HOME.brightRed}; }
  .vp-body { font-family: ${F.sans}; font-size: 17px; line-height: 1.55; margin: 0 0 26px; max-width: 460px; }
  .vp-card--pb .vp-body { color: ${HOME.redTint1}; }
  .vp-card--sd .vp-body { color: ${HOME.textOnDark}; }
  .vp-cta { display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; font-family: ${F.sans}; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 10px; padding: 14px 24px; min-height: 44px; box-sizing: border-box; transition: background .2s ease, transform .2s ease; }
  .vp-cta-pb { background: ${HOME.white}; color: ${HOME.red}; }
  .vp-cta-pb:hover { transform: translateY(-2px); }
  .vp-cta-sd { background: ${HOME.red}; color: ${HOME.white}; }
  .vp-cta-sd:hover { background: ${HOME.redHover}; transform: translateY(-2px); }
  .vp-fine { font-family: ${F.sans}; font-size: 12px; margin: 26px 0 0; padding-top: 16px; }
  .vp-card--pb .vp-fine { color: ${HOME.redTint4}; border-top: 1px solid rgba(255,255,255,.2); }
  .vp-card--sd .vp-fine { color: ${HOME.textMuted2}; border-top: 1px solid rgba(255,255,255,.12); }
  @media (max-width: 960px) {
    .vp-section { padding: 44px 20px 48px; }
    .vp-grid { grid-template-columns: 1fr; gap: 16px; }
    .vp-card { padding: 30px 26px; }
    .vp-card--pb .vp-h2 { font-size: 30px; }
    .vp-card--sd .vp-h2 { font-size: 28px; }
    .vp-body { font-size: 15px; }
  }
`;

export function ValueProps() {
  return (
    <section className="vp-section">
      <style>{css}</style>
      <div className="vp-wrap">
        <div className="vp-label-row">
          <span className="vp-label">Two ways to win</span>
          <span className="vp-rule" aria-hidden="true" />
        </div>
        <div className="vp-grid">
          {/* PowerBid */}
          <div className="vp-card vp-card--pb">
            <img className="vp-logo" src="/powerbid_logo_white_transparent.svg" alt="PowerBid Approval" style={{ height: 52 }} />
            <h2 className="vp-h2">Make an offer that competes with cash.<span className="vp-star-pb">*</span></h2>
            <p className="vp-body">A verified approval up front, so sellers take you seriously. We do the underwriting work early, so you can shop with confidence.</p>
            <a className="vp-cta vp-cta-pb" href="https://rate.com/nickpeters" target="_blank" rel="noopener noreferrer">Get started →</a>
            <p className="vp-fine">*PowerBid Approval terms and conditions apply.</p>
          </div>
          {/* Same Day */}
          <div className="vp-card vp-card--sd">
            <img className="vp-logo" src="/same_day_mortgage_transparent_vector.svg" alt="Same Day Mortgage" style={{ height: 66 }} />
            <h2 className="vp-h2">An approval in a day, if you qualify.<span className="vp-star-sd">**</span></h2>
            <p className="vp-body">Get your documents in early and you can have a loan approval within one business day. Less waiting, more house hunting.</p>
            <a className="vp-cta vp-cta-sd" href="https://rate.com/nickpeters" target="_blank" rel="noopener noreferrer">See if you qualify →</a>
            <p className="vp-fine">**Timing depends on document submission.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
