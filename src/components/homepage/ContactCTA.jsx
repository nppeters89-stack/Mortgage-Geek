import { HOME, F } from "../../theme";
import { ContactCard } from "./ContactCard";

// Contact CTA band (design handoff §7): dark band, headline + Contact Nick.
const css = `
  .cc-section { background: radial-gradient(120% 130% at 12% 10%, rgba(207,51,56,.22) 0%, transparent 50%), ${HOME.darkStage}; padding: 84px 56px; }
  .cc-wrap { max-width: 1240px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 40px; flex-wrap: wrap; }
  .cc-h2 { font-family: ${F.sans}; font-size: 60px; font-weight: 900; letter-spacing: -.035em; line-height: .95; color: ${HOME.white}; margin: 0 0 14px; }
  .cc-body { font-family: ${F.sans}; font-size: 18px; line-height: 1.5; color: ${HOME.textOnDark}; margin: 0; max-width: 460px; }
  .cc-right { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
  .cc-btn { display: inline-flex; align-items: center; justify-content: center; font-family: ${F.sans}; font-size: 17px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; border-radius: 12px; padding: 16px 30px; min-height: 44px; box-sizing: border-box; background: ${HOME.red}; color: ${HOME.white}; transition: background .2s ease, transform .2s ease; }
  .cc-btn:hover { background: ${HOME.redHover}; transform: translateY(-2px); }; font-size: 15px; color: ${HOME.textMuted2}; }
  @media (max-width: 960px) {
    .cc-section { padding: 52px 20px; }
    .cc-wrap { flex-direction: column; align-items: stretch; }
    .cc-h2 { font-size: 40px; }
    .cc-body { font-size: 15px; }
    .cc-right { align-items: stretch; }
    .cc-btn { width: 100%; }
  }
`;

export function ContactCTA() {
  return (
    <section className="cc-section">
      <style>{css}</style>
      <div className="cc-wrap">
        <div>
          <h2 className="cc-h2">Let's get your<br />loan, done.</h2>
          <p className="cc-body">Talk to Nick directly. No call center, no runaround.</p>
        </div>
        <div className="cc-right">
          <ContactCard triggerClassName="cc-btn" />
        </div>
      </div>
    </section>
  );
}
