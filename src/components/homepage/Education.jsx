import { HOME, F } from "../../theme";

// Education hub (design handoff §5): cream section, headline + 3 topic cards.
// CTA + cards link to the /learn hub.
const CARDS = [
  { n: "01", h: "Loan programs, compared", b: "Conventional, FHA, VA, side by side in plain terms." },
  { n: "02", h: "What drives your rate", b: "The levers that actually move your number, and the ones you control." },
  { n: "03", h: "Where closing costs come from", b: "Every line item, demystified before you sign." },
];

const css = `
  .ed-section { background: ${HOME.cream}; padding: 80px 56px; }
  .ed-wrap { max-width: 1240px; margin: 0 auto; }
  .ed-head { max-width: 760px; margin-bottom: 44px; }
  .ed-label { font-family: ${F.sans}; font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${HOME.red}; margin: 0 0 14px; }
  .ed-h2 { font-family: ${F.sans}; font-size: 64px; font-weight: 800; letter-spacing: -.035em; line-height: .98; color: ${HOME.ink}; margin: 0; }
  .ed-underline { width: 60px; height: 4px; background: ${HOME.red}; margin: 18px 0 22px; border-radius: 2px; }
  .ed-intro { font-family: ${F.sans}; font-size: 19px; line-height: 1.6; color: ${HOME.textSecondary}; margin: 0 0 22px; }
  .ed-cta { display: inline-flex; align-items: center; gap: 8px; font-family: ${F.sans}; font-size: 16px; font-weight: 700; color: ${HOME.red}; text-decoration: none; transition: gap .2s ease; }
  .ed-cta:hover { gap: 12px; }
  .ed-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
  .ed-card { background: ${HOME.white}; border: 1px solid ${HOME.borderCard}; border-radius: 16px; padding: 28px; transition: transform .25s ease, box-shadow .25s ease; }
  .ed-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(0,0,0,.08); }
  .ed-idx { font-family: ${F.sans}; font-size: 14px; font-weight: 800; color: ${HOME.red}; }
  .ed-card-h3 { font-family: ${F.sans}; font-size: 21px; font-weight: 700; letter-spacing: -.01em; color: ${HOME.ink}; margin: 14px 0 8px; }
  .ed-card-b { font-family: ${F.sans}; font-size: 15px; line-height: 1.55; color: ${HOME.textSecondary}; margin: 0; }
  @media (max-width: 960px) {
    .ed-section { padding: 52px 20px; }
    .ed-h2 { font-size: 40px; }
    .ed-intro { font-size: 16px; }
    .ed-grid { grid-template-columns: 1fr; gap: 12px; }
  }
`;

export function Education() {
  return (
    <section className="ed-section">
      <style>{css}</style>
      <div className="ed-wrap">
        <div className="ed-head">
          <p className="ed-label">Just here to learn?</p>
          <h2 className="ed-h2">Mortgage education<br />and guides.</h2>
          <div className="ed-underline" aria-hidden="true" />
          <p className="ed-intro">The whole mortgage process in plain English: how loan programs compare, what drives rates, where closing costs come from, and what underwriters actually look for. No forms, no pressure.</p>
          <a className="ed-cta" href="/learn">Explore the learning hub →</a>
        </div>
        <div className="ed-grid">
          {CARDS.map((c) => (
            <a key={c.n} className="ed-card" href="/learn" style={{ textDecoration: "none", display: "block" }}>
              <span className="ed-idx">{c.n}</span>
              <h3 className="ed-card-h3">{c.h}</h3>
              <p className="ed-card-b">{c.b}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
