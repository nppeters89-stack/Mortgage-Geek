import { HOME, F } from "../../theme";
import { ContactCard } from "./ContactCard";

// Hero — dark editorial stage (design handoff §2). Figtree throughout. Uses the
// existing headshot cutout. Glass stat badge floats (gated behind enableMotion +
// prefers-reduced-motion). Desktop 1.3/0.7 grid; mobile folds to one column.
const css = `
  .he-hero { position: relative; background:
    radial-gradient(120% 130% at 90% 6%, rgba(207,51,56,.24) 0%, transparent 48%),
    linear-gradient(165deg, #212327 0%, transparent 58%), ${HOME.darkStage};
    overflow: hidden; }
  .he-inner { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: 1.3fr 0.7fr; min-height: 720px; }
  .he-copy { padding: 84px 0 80px 56px; align-self: center; }
  .he-eyebrow { font-family: ${F.sans}; font-size: 13px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: ${HOME.brightRed}; margin: 0 0 18px; }
  .he-name { font-family: ${F.sans}; font-size: 128px; font-weight: 900; letter-spacing: -.035em; line-height: .86; color: ${HOME.white}; margin: 0; }
  .he-subhead { font-family: ${F.sans}; font-size: 20px; font-weight: 500; line-height: 1.5; color: ${HOME.textOnDark}; margin: 26px 0 0; max-width: 540px; }
  .he-rating { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 22px 0 0; font-family: ${F.sans}; font-size: 15px; color: ${HOME.textOnDark}; }
  .he-stars { color: ${HOME.star}; letter-spacing: 1px; font-size: 15px; }
  .he-dot { color: ${HOME.lockupDivDark}; }
  .he-ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin: 32px 0 0; }
  .he-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: ${F.sans}; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 10px; padding: 15px 26px; min-height: 44px; box-sizing: border-box; cursor: pointer; transition: background .2s ease, transform .2s ease, border-color .2s ease, color .2s ease; }
  .he-btn-primary { background: ${HOME.red}; color: ${HOME.white}; border: none; }
  .he-btn-primary:hover { background: ${HOME.redHover}; transform: translateY(-2px); }
  .he-btn-outline { background: transparent; color: ${HOME.borderCard}; border: 1px solid ${HOME.lockupDivDark}; }
  .he-btn-outline:hover { border-color: ${HOME.textMuted2}; color: ${HOME.white}; }

  .he-photo { position: relative; }
  .he-accent { position: absolute; left: 0; top: 16%; bottom: 18%; width: 4px; background: ${HOME.red}; }
  .he-photo img { position: absolute; bottom: 0; left: 54%; transform: translateX(-50%); height: 700px; width: auto; display: block; }
  .he-badge { position: absolute; left: 18px; bottom: 36px; z-index: 3;
    background: rgba(20,22,24,.66); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.13); border-radius: 14px; padding: 16px 20px;
    box-shadow: 0 16px 40px rgba(0,0,0,.32); }
  .he-stat-num { font-family: ${F.sans}; font-size: 32px; font-weight: 900; color: ${HOME.white}; line-height: 1; }
  .he-stat-num span { color: ${HOME.brightRed}; }
  .he-stat-label { font-family: ${F.sans}; font-size: 12px; color: ${HOME.textOnDark}; margin-top: 3px; }
  .he-badge-rule { height: 1px; background: rgba(255,255,255,.13); margin: 12px 0; }

  @media (prefers-reduced-motion: no-preference) {
    .he-badge.he-float { animation: he-float 5.5s ease-in-out infinite; }
  }
  @keyframes he-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }

  @media (max-width: 960px) {
    .he-inner { grid-template-columns: 1fr; min-height: 0; }
    .he-copy { padding: 34px 20px 0; }
    .he-name { font-size: 62px; line-height: .88; }
    .he-subhead { font-size: 16px; }
    .he-ctas { flex-direction: column; align-items: stretch; }
    .he-btn { justify-content: center; width: 100%; }
    .he-photo { height: 440px; overflow: hidden; margin-top: 28px; }
    .he-accent { display: none; }
    .he-photo img { height: 440px; }
    .he-badge { left: 16px; bottom: 24px; }
    @media (prefers-reduced-motion: no-preference) {
      @keyframes he-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    }
  }
`;

export function HeroEditorial({ showStats = true, enableMotion = true }) {
  return (
    <section className="he-hero">
      <style>{css}</style>
      <div className="he-inner">
        <div className="he-copy">
          <p className="he-eyebrow">VP of Mortgage Lending</p>
          <h1 className="he-name">Nick<br />Peters</h1>
          <p className="he-subhead">
            Real answers from a real loan officer, with a clear, no pressure path from first call to closing day.
          </p>
          <div className="he-rating">
            <span className="he-stars" aria-hidden="true">★★★★★</span>
            <span>5.0 on Google</span>
            <span className="he-dot" aria-hidden="true">•</span>
            <span>NMLS #1119524 · Nashville, TN</span>
          </div>
          <div className="he-ctas">
            <ContactCard triggerClassName="he-btn he-btn-primary" />
            <a className="he-btn he-btn-outline" href="/learn">Start learning →</a>
          </div>
        </div>

        <div className="he-photo">
          <span className="he-accent" aria-hidden="true" />
          <picture>
            <source media="(min-width: 961px)" srcSet="/hero-cutout-desktop.webp" />
            <source srcSet="/hero-cutout-mobile.webp" />
            <img src="/hero-cutout-desktop.webp" width="1323" height="1280" alt="Nick Peters, mortgage loan officer" loading="eager" fetchpriority="high" decoding="async" />
          </picture>
          {showStats && (
            <div className={`he-badge${enableMotion ? " he-float" : ""}`}>
              <div className="he-stat-num">12<span>+</span></div>
              <div className="he-stat-label">years lending</div>
              <div className="he-badge-rule" />
              <div className="he-stat-num">1,000<span>+</span></div>
              <div className="he-stat-label">loans closed</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
