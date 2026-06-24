import { useState } from "react";
import { HOME, F } from "../../theme";

// Agent Advantage — dark media band (design handoff §4). The video tile is a
// facade; clicking loads the real overview clip (Total Expert) if wired, else
// shows the play affordance. TODO: swap to the final Agent Advantage video.
const AGENT_VIDEO = "https://rapid.totalexpert.net/org_media/00124/00124-6a0482bde8e735016502176a0482bde8e79334929488.mp4";

const css = `
  .aa-section { background: ${HOME.darkStage}; padding: 72px 56px; }
  .aa-wrap { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 48px; align-items: center; }
  .aa-label { font-family: ${F.sans}; font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${HOME.brightRed}; margin: 0 0 16px; }
  .aa-h2 { font-family: ${F.sans}; font-size: 52px; font-weight: 800; letter-spacing: -.03em; line-height: 1.0; color: ${HOME.white}; margin: 0 0 18px; }
  .aa-body { font-family: ${F.sans}; font-size: 18px; line-height: 1.55; color: ${HOME.textOnDark}; margin: 0 0 28px; max-width: 440px; }
  .aa-cta { display: inline-flex; align-items: center; gap: 8px; font-family: ${F.sans}; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 10px; padding: 14px 24px; min-height: 44px; box-sizing: border-box; background: ${HOME.white}; color: ${HOME.ink}; transition: transform .2s ease; }
  .aa-cta:hover { transform: translateY(-2px); }
  .aa-tile { position: relative; aspect-ratio: 16/9; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,.08); box-shadow: 0 24px 60px rgba(0,0,0,.4); background: linear-gradient(150deg, #3A3D42, ${HOME.charcoal}); }
  .aa-tile video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .aa-facade { position: absolute; inset: 0; width: 100%; height: 100%; border: none; cursor: pointer; background: linear-gradient(150deg, #3A3D42, ${HOME.charcoal}); display: flex; align-items: center; justify-content: center; -webkit-tap-highlight-color: transparent; }
  .aa-play { display: inline-flex; align-items: center; justify-content: center; width: 84px; height: 84px; border-radius: 50%; background: ${HOME.red}; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
  .aa-caption { position: absolute; left: 18px; bottom: 16px; text-align: left; }
  .aa-cap1 { font-family: ${F.sans}; font-size: 14px; font-weight: 700; color: ${HOME.white}; }
  .aa-cap2 { font-family: ${F.sans}; font-size: 12px; color: ${HOME.textOnDark}; margin-top: 2px; }
  @media (max-width: 960px) {
    .aa-section { padding: 48px 20px; }
    .aa-wrap { grid-template-columns: 1fr; gap: 24px; }
    .aa-h2 { font-size: 36px; }
    .aa-body { font-size: 15px; }
    .aa-play { width: 64px; height: 64px; }
  }
`;

export function AgentAdvantage() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="aa-section">
      <style>{css}</style>
      <div className="aa-wrap">
        <div>
          <p className="aa-label">For agents · Agent Advantage</p>
          <h2 className="aa-h2">For real estate agents.</h2>
          <p className="aa-body">Watch the quick overview of Agent Advantage, then head to Rate's agent hub to see how partnering works.</p>
          <a className="aa-cta" href="https://agents.rate.com/agents" target="_blank" rel="noopener noreferrer">Explore Agent Advantage →</a>
        </div>
        <div className="aa-tile">
          {playing ? (
            <video src={AGENT_VIDEO} controls autoPlay playsInline preload="none" />
          ) : (
            <button type="button" className="aa-facade" onClick={() => setPlaying(true)} aria-label="Play video: Agent Advantage overview">
              <span className="aa-play" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="aa-caption">
                <span className="aa-cap1" style={{ display: "block" }}>Agent Advantage overview</span>
                <span className="aa-cap2" style={{ display: "block" }}>2 min watch</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
