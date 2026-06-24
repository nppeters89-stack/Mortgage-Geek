import { HOME, F } from "../../theme";
import { MortgageCalcIcon, CompareIcon, PreQualIcon, CashToCloseIcon } from "../icons";

// Education hub (design handoff §5) — three refined entry cards:
//   01 the learning hub home (comprehensive guide), 02 Deep Dives, 03 Your Toolkit.
const CARDS = [
  { n: "01", type: "hub", h: "The whole process, start to finish", b: "A comprehensive, plain-English guide to the mortgage process, from your first call to closing day.", href: "/learn" },
  { n: "02", type: "deepdives", h: "Deep Dives", b: "In-depth answers to the trickiest questions, broken down by loan program.", href: "/deep-dives" },
  { n: "03", type: "toolkit", h: "Your Toolkit", b: "Calculators and side-by-side comparisons built by a loan officer, not a marketing team.", href: "/learn#tools-cta" },
];

const css = `
  .ed-section { background: ${HOME.cream}; padding: 80px 56px; }
  .ed-wrap { max-width: 1240px; margin: 0 auto; }
  .ed-head { max-width: 760px; margin-bottom: 44px; }
  .ed-label { font-family: ${F.sans}; font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${HOME.red}; margin: 0 0 14px; }
  .ed-h2 { font-family: ${F.sans}; font-size: 64px; font-weight: 800; letter-spacing: -.035em; line-height: .98; color: ${HOME.ink}; margin: 0; }
  .ed-underline { width: 60px; height: 4px; background: ${HOME.red}; margin: 18px 0 22px; border-radius: 2px; }
  .ed-intro { font-family: ${F.sans}; font-size: 19px; line-height: 1.6; color: ${HOME.textSecondary}; margin: 0 0 22px; }
  .ed-cta { display: inline-flex; align-items: center; gap: 9px; font-family: ${F.sans}; font-size: 16px; font-weight: 700; color: ${HOME.red}; text-decoration: none; transition: gap .2s ease; }
  .ed-cta:hover { gap: 13px; }
  .ed-cta img { display: block; }
  .ed-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
  .ed-card { background: ${HOME.white}; border: 1px solid ${HOME.borderCard}; border-radius: 16px; padding: 28px; transition: transform .25s ease, box-shadow .25s ease; display: block; }
  .ed-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(0,0,0,.08); }
  .ed-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 40px; margin-bottom: 16px; }
  .ed-badge { width: 40px; height: 40px; border-radius: 10px; background: ${HOME.charcoal}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ed-badge img { width: 24px; height: auto; display: block; }
  .ed-whale { font-size: 22px; line-height: 1; }
  .ed-tools { display: inline-flex; align-items: center; gap: 8px; }
  .ed-idx { font-family: ${F.sans}; font-size: 14px; font-weight: 800; color: ${HOME.red}; }
  .ed-card-h3 { font-family: ${F.sans}; font-size: 21px; font-weight: 700; letter-spacing: -.01em; color: ${HOME.ink}; margin: 0 0 8px; }
  .ed-card-b { font-family: ${F.sans}; font-size: 15px; line-height: 1.55; color: ${HOME.textSecondary}; margin: 0; }
  @media (max-width: 960px) {
    .ed-section { padding: 52px 20px; }
    .ed-h2 { font-size: 40px; }
    .ed-intro { font-size: 16px; }
    .ed-grid { grid-template-columns: 1fr; gap: 12px; }
  }
`;

function CardIcon({ type }) {
  if (type === "deepdives") {
    return <span className="ed-badge"><span className="ed-whale" role="img" aria-label="Deep Dives">🐳</span></span>;
  }
  if (type === "toolkit") {
    return (
      <span className="ed-tools" aria-hidden="true">
        <MortgageCalcIcon size={26} variant="navy" />
        <CompareIcon size={26} variant="navy" />
        <PreQualIcon size={26} variant="navy" />
        <CashToCloseIcon size={26} variant="navy" />
      </span>
    );
  }
  // hub — the Learning Hub book mark
  return <span className="ed-badge"><img src="/assets/learning-hub-mark-cream-sm.svg" alt="" aria-hidden="true" /></span>;
}

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
          <a className="ed-cta" href="/learn">
            <img src="/assets/learning-hub-mark-sm.svg" alt="" aria-hidden="true" width={22} height={18} />
            Explore the learning hub →
          </a>
        </div>
        <div className="ed-grid">
          {CARDS.map((c) => (
            <a key={c.n} className="ed-card" href={c.href} style={{ textDecoration: "none" }}>
              <div className="ed-card-top">
                <CardIcon type={c.type} />
                <span className="ed-idx">{c.n}</span>
              </div>
              <h3 className="ed-card-h3">{c.h}</h3>
              <p className="ed-card-b">{c.b}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
