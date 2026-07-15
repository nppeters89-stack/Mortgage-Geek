import { HOME, F } from "../../theme";
import { withAlpha } from "../../utils/format";
import { LO_PHONE, LO_EMAIL, PERSONAL_NMLS } from "../../data/compliance";

// "The Second Opinion" homepage conversion band (design handoff). A dark
// full-bleed band placed between the Education (Guides) and Reviews sections,
// inviting under-contract buyers to send their Loan Estimate for a free review.
// Recreated with the site's tokens and the ContactCTA dark-band pattern it
// visually rhymes with (HOME.darkStage + the red radial glow, HOME.red button).
// Accent ships as HOME.brightRed (Live Red) via the --accent custom property.

const telDigits = LO_PHONE.replace(/\D/g, "");
// "Text me" -> SMS (the handoff's href was tel:, but the label says text, so
// the SMS intent is honored; see the note in the handoff summary).
const SMS = `sms:+1${telDigits}`;
const MAILTO = `mailto:${LO_EMAIL}?subject=${encodeURIComponent("Loan Estimate second opinion")}&body=${encodeURIComponent("Hi Nick, I'm under contract and would like a second opinion on my Loan Estimate before I commit. A copy is attached.")}`;

// Cream skeleton rows inside the faux Loan Estimate card (decorative). Each is
// [height, width, opacity, marginTop]; opacity 1 renders solid warmWhite.
const CARD_ROWS = [
  [13, "56%", 1, 12],
  [7, "36%", 0.42, 11],
  ["divider", null, 0.16, 20],
  [9, "30%", 0.9, 0],
  [7, "88%", 0.26, 12],
  [7, "72%", 0.26, 9],
  [9, "33%", 0.9, 22],
  [7, "90%", 0.26, 12],
  [7, "64%", 0.26, 9],
  [9, "28%", 0.9, 22],
  [7, "80%", 0.26, 12],
];

const cream = (o) => (o >= 1 ? HOME.warmWhite : withAlpha(HOME.warmWhite, o));

const css = `
  .so-section { --accent: ${HOME.brightRed}; font-family: ${F.sans}; background: radial-gradient(120% 130% at 12% 8%, ${withAlpha(HOME.red, 0.22)} 0%, transparent 52%), ${HOME.darkStage}; padding: 88px 56px; color: ${HOME.white}; }
  .so-wrap { max-width: 1240px; margin: 0 auto; }

  .so-top { display: grid; grid-template-columns: 1fr 468px; gap: 76px; align-items: center; }
  .so-eyebrow { font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); }
  .so-h2 { font-size: 56px; font-weight: 800; letter-spacing: -.03em; line-height: 1.0; color: ${HOME.white}; margin: 18px 0 0; max-width: 600px; text-wrap: balance; }
  .so-sub { font-size: 18px; line-height: 1.55; color: ${HOME.textOnDark}; margin: 22px 0 0; max-width: 520px; }
  .so-ctarow { display: flex; gap: 14px; margin-top: 34px; flex-wrap: wrap; }
  .so-btn { display: inline-flex; align-items: center; justify-content: center; height: 54px; font-size: 16px; font-weight: 700; border-radius: 12px; text-decoration: none; box-sizing: border-box; cursor: pointer; transition: transform .2s, background .2s, border-color .2s; }
  .so-btn--primary { padding: 0 28px; background: ${HOME.red}; color: ${HOME.white}; border: 1.5px solid ${HOME.red}; }
  .so-btn--primary:hover { background: ${HOME.redHover}; border-color: ${HOME.redHover}; transform: translateY(-2px); }
  .so-btn--secondary { padding: 0 26px; background: transparent; color: ${HOME.white}; border: 1.5px solid ${withAlpha(HOME.white, 0.4)}; }
  .so-btn--secondary:hover { background: ${withAlpha(HOME.white, 0.08)}; border-color: ${HOME.white}; }
  .so-btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

  /* The card is in normal flow so the wrapper always sizes to it (no fixed
     container height that the taller card could overflow and overlap the
     steps). Annotations are absolute RELATIVE TO the card wrapper, so they
     stay glued to the card at any width. */
  .so-graphic { display: flex; }
  .so-cardwrap { position: relative; width: 376px; margin-left: 30px; }
  .so-card { position: relative; width: 376px; transform: rotate(-1.6deg); background: ${withAlpha(HOME.warmWhite, 0.05)}; border: 1px solid ${withAlpha(HOME.warmWhite, 0.2)}; border-radius: 12px; box-shadow: 0 24px 50px rgba(0,0,0,.42); padding: 28px 32px; backdrop-filter: blur(2px); }
  .so-card-label { font-size: 10px; font-weight: 800; letter-spacing: .2em; color: ${withAlpha(HOME.warmWhite, 0.55)}; }
  .so-ellipse { position: absolute; top: 128px; left: 10px; width: 170px; height: 48px; border: 2.5px solid var(--accent); border-radius: 50%; transform: rotate(-4deg); }
  .so-underline { position: absolute; top: 264px; left: 26px; width: 150px; height: 3px; background: var(--accent); border-radius: 2px; }
  .so-arrow { position: absolute; top: 114px; left: -28px; font-size: 30px; color: var(--accent); transform: rotate(8deg); line-height: 1; }

  .so-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 88px; }
  .so-stepnum { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: ${HOME.ink}; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .so-steptitle { font-size: 19px; font-weight: 800; letter-spacing: -.01em; color: ${HOME.white}; margin-top: 18px; }
  .so-stepbody { font-size: 15.5px; line-height: 1.55; color: ${HOME.stepBodyDark}; margin-top: 8px; }

  .so-quotewrap { margin-top: 84px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .so-bar { width: 60px; height: 4px; background: var(--accent); transform-origin: center; animation: soBar .7s ease .1s both; }
  .so-quote { font-size: 40px; font-weight: 800; letter-spacing: -.03em; line-height: 1.16; color: ${HOME.white}; margin: 28px 0 0; max-width: 880px; text-wrap: balance; }
  .so-quote em { font-style: normal; color: var(--accent); }

  .so-fine { margin-top: 56px; display: flex; justify-content: center; }
  .so-fine p { max-width: 940px; text-align: center; font-size: 12.5px; line-height: 1.6; color: ${HOME.finePrintDark}; margin: 0; }

  @keyframes soBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: reduce) { .so-bar { animation: none; } }

  @media (max-width: 960px) {
    .so-section { padding: 64px 22px; }
    .so-top { grid-template-columns: 1fr; gap: 40px; }
    .so-graphic { justify-content: center; }
    .so-cardwrap { margin-left: 0; }
    .so-h2 { font-size: 40px; }
    .so-ctarow { margin-top: 26px; }
    .so-steps { grid-template-columns: 1fr; gap: 24px; margin-top: 48px; }
    .so-step { display: flex; gap: 16px; align-items: flex-start; }
    .so-steptitle { margin-top: 0; }
    .so-quotewrap { margin-top: 56px; }
    .so-quote { font-size: 30px; letter-spacing: -.02em; line-height: 1.2; }
    .so-fine { margin-top: 40px; }
  }

  @media (max-width: 600px) {
    .so-section { padding: 56px 22px; background: radial-gradient(130% 60% at 50% 0%, ${withAlpha(HOME.red, 0.24)} 0%, transparent 55%), ${HOME.darkStage}; }
    .so-eyebrow { font-size: 12px; }
    .so-h2 { font-size: 36px; line-height: 1.02; margin-top: 14px; }
    .so-sub { font-size: 16px; margin-top: 16px; }
    .so-ctarow { flex-direction: column; align-items: stretch; gap: 12px; }
    .so-btn { width: 100%; padding: 0; }
    .so-cardwrap { width: 302px; }
    .so-card { width: 302px; padding: 22px 24px; box-shadow: 0 18px 38px rgba(0,0,0,.45); border-radius: 11px; }
    .so-ellipse { width: 142px; height: 42px; left: 50%; margin-left: -71px; top: 122px; }
    .so-underline { display: none; }
    .so-arrow { font-size: 26px; left: -22px; top: 108px; }
    .so-steptitle { font-size: 17px; }
    .so-stepbody { font-size: 15px; line-height: 1.5; }
    .so-quote { font-size: 27px; }
    .so-fine p { font-size: 12px; }
  }
`;

const STEPS = [
  { n: "1", title: "Send it over.", body: "Email or text a copy of your Loan Estimate. No application, no credit pull." },
  { n: "2", title: "I run the math.", body: "Side by side against what I can actually offer: monthly payment, cash to close, and what each option costs over five years and the life of the loan." },
  { n: "3", title: "You get a straight answer.", body: "Stay or switch. And if your close date is too tight to switch safely, I'll say that too." },
];

export function SecondOpinion({ showGraphic = true }) {
  return (
    <section className="so-section">
      <style>{css}</style>
      <div className="so-wrap">

        <div className="so-top">
          <div>
            <div className="so-eyebrow">The Second Opinion</div>
            <h2 className="so-h2">Under contract? Don't sign off on that Loan Estimate yet.</h2>
            <p className="so-sub">Send me your Loan Estimate before you commit. Within one business day, you'll know whether your lender's offer is competitive. Free, no credit pull, no obligation.</p>
            <div className="so-ctarow">
              <a className="so-btn so-btn--primary" href={MAILTO}>Email your Loan Estimate</a>
              <a className="so-btn so-btn--secondary" href={SMS}>Text me: {LO_PHONE}</a>
            </div>
          </div>

          {showGraphic && (
            <div className="so-graphic" aria-hidden="true">
              <div className="so-cardwrap">
                <div className="so-card">
                  <div className="so-card-label">LOAN ESTIMATE</div>
                  {CARD_ROWS.map(([h, w, o, mt], i) =>
                    h === "divider" ? (
                      <div key={i} style={{ height: 1, background: cream(o), margin: `${mt}px 0` }} />
                    ) : (
                      <div key={i} style={{ height: h, width: w, background: cream(o), borderRadius: 3, marginTop: mt }} />
                    )
                  )}
                </div>
                <div className="so-ellipse" />
                <div className="so-underline" />
                <div className="so-arrow">&#8600;</div>
              </div>
            </div>
          )}
        </div>

        <div className="so-steps">
          {STEPS.map((s) => (
            <div className="so-step" key={s.n}>
              <div className="so-stepnum">{s.n}</div>
              <div>
                <div className="so-steptitle">{s.title}</div>
                <p className="so-stepbody">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="so-quotewrap">
          <div className="so-bar" />
          <p className="so-quote">If your lender did right by you, <em>I'll tell you to stay put.</em> That's the whole deal.</p>
        </div>

        <div className="so-fine">
          <p>A second opinion is a review of the Loan Estimate you provide. It is not a loan application, a rate quote, a preapproval, or a commitment to lend. Any comparison depends on your qualifications and market conditions at the time of review. {`Nick Peters, NMLS #${PERSONAL_NMLS}.`}</p>
        </div>

      </div>
    </section>
  );
}
