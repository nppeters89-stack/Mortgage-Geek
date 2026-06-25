import { useRef, useState } from "react";
import { HOME, F } from "../../theme";
import { Seal } from "./Seal";
import { ContactCard } from "./ContactCard";

// The five benefit-framed steps (intentionally vague; detail comes in the call).
const STEPS = [
  { n: "01", label: "More Leads" },
  { n: "02", label: "Higher Conversion" },
  { n: "03", label: "You Look Good" },
  { n: "04", label: "Offers That Win" },
  { n: "05", label: "Referrals for Life" },
];

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
  /* Tile matches the overview clip's native 4:5 portrait aspect, so the video
     fills it with no crop and keeps full resolution. Capped + centered in the
     column so it doesn't tower. */
  .aa-tile { position: relative; aspect-ratio: 4/5; width: 100%; max-width: 380px; margin: 0 auto; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,.08); box-shadow: 0 24px 60px rgba(0,0,0,.4); background: linear-gradient(150deg, #3A3D42, ${HOME.charcoal}); }
  .aa-tile video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .aa-facade { position: absolute; inset: 0; width: 100%; height: 100%; border: none; cursor: pointer; background: transparent; display: flex; align-items: center; justify-content: center; -webkit-tap-highlight-color: transparent; }
  /* Subtle scrim so the play button + caption read over the video frame. */
  .aa-facade::before { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.28) 100%); }
  .aa-play { display: inline-flex; align-items: center; justify-content: center; width: 84px; height: 84px; border-radius: 50%; background: ${HOME.red}; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
  .aa-caption { position: absolute; left: 18px; bottom: 16px; text-align: left; }
  .aa-cap1 { font-family: ${F.sans}; font-size: 14px; font-weight: 700; color: ${HOME.white}; }
  .aa-cap2 { font-family: ${F.sans}; font-size: 12px; color: ${HOME.textOnDark}; margin-top: 2px; }
  /* ── Tier 2: "My Method" seal callout ── */
  .aa-method { max-width: 1240px; margin: 40px auto 0; }
  .aa-panel { position: relative; overflow: hidden; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 22px; padding: 44px 48px; display: grid; grid-template-columns: 236px 1fr; gap: 52px; align-items: center; }
  .aa-panel::before { content: ""; position: absolute; inset: 0; background: radial-gradient(90% 120% at 12% 0%, rgba(207,51,56,.14), transparent 55%); pointer-events: none; }
  .aa-seal { position: relative; z-index: 1; display: flex; justify-content: center; }
  .aa-seal img { width: 220px; height: 220px; }
  .aa-method-body-col { position: relative; z-index: 1; }
  .aa-method-eyebrow { font-family: ${F.sans}; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${HOME.brightRed}; margin: 0 0 12px; }
  .aa-h3 { font-family: ${F.sans}; font-size: 34px; font-weight: 800; letter-spacing: -.025em; line-height: 1.05; color: ${HOME.white}; margin: 0 0 14px; }
  .aa-method-body { font-family: ${F.sans}; font-size: 16px; line-height: 1.55; color: ${HOME.textOnDark}; margin: 0 0 22px; max-width: 540px; }
  .aa-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 28px; padding: 0; list-style: none; }
  .aa-chip { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 99px; padding: 8px 15px; }
  .aa-chip-num { font-family: ${F.sans}; font-size: 12px; font-weight: 800; color: ${HOME.brightRed}; }
  .aa-chip-label { font-family: ${F.sans}; font-size: 13px; font-weight: 600; color: ${HOME.borderCard}; }
  .aa-book-row { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .aa-book { display: inline-flex; align-items: center; gap: 8px; font-family: ${F.sans}; font-size: 16px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; border-radius: 10px; padding: 15px 26px; min-height: 44px; box-sizing: border-box; background: ${HOME.red}; color: ${HOME.white}; transition: background .2s ease, transform .2s ease; }
  .aa-book:hover { background: ${HOME.redHover}; transform: translateY(-2px); }
  .aa-helper { font-family: ${F.sans}; font-size: 13px; color: ${HOME.textMuted}; max-width: 170px; margin: 0; }

  @media (max-width: 960px) {
    .aa-section { padding: 48px 20px; }
    .aa-wrap { grid-template-columns: 1fr; gap: 24px; }
    .aa-h2 { font-size: 36px; }
    .aa-body { font-size: 15px; }
    .aa-play { width: 64px; height: 64px; }
    .aa-panel { grid-template-columns: 1fr; gap: 24px; padding: 30px 22px 28px; border-radius: 20px; text-align: center; }
    .aa-seal img { width: 158px; height: 158px; }
    .aa-h3 { font-size: 26px; }
    .aa-method-body { font-size: 15px; margin-left: auto; margin-right: auto; }
    .aa-chips { justify-content: center; }
    .aa-chip { padding: 10px 14px; }
    .aa-book-row { flex-direction: column; align-items: stretch; }
    .aa-book { justify-content: center; width: 100%; }
    .aa-helper { max-width: none; text-align: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .aa-cta, .aa-book { transition: none; }
    .aa-cta:hover, .aa-book:hover { transform: none; }
  }
`;

export function AgentAdvantage() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  // Cover = the clip's first frame: load metadata only and seek just past 0.
  const onLoadedMetadata = (e) => { if (!playing) { try { e.currentTarget.currentTime = 0.05; } catch { /* noop */ } } };
  const start = () => {
    setPlaying(true);
    const v = videoRef.current;
    if (v) { v.muted = false; try { v.currentTime = 0; } catch { /* noop */ } const p = v.play && v.play(); if (p && p.catch) p.catch(() => {}); }
  };

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
          <video ref={videoRef} src={AGENT_VIDEO} muted playsInline preload="metadata" controls={playing} onLoadedMetadata={onLoadedMetadata} />
          {!playing && (
            <button type="button" className="aa-facade" onClick={start} aria-label="Play video: Agent Advantage overview">
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

      {/* Tier 2 — "My Method" 5-step process seal callout (same dark band). */}
      <div className="aa-method">
        <div className="aa-panel">
          <div className="aa-seal">
            <Seal size={220} variant="primary" />
          </div>
          <div className="aa-method-body-col">
            <p className="aa-method-eyebrow">My method</p>
            <h3 className="aa-h3">A proven 5-step process that helps you win.</h3>
            <p className="aa-method-body">Five plays I run for the agents I partner with, built to grow your business, not just close your buyers.</p>
            <ul className="aa-chips">
              {STEPS.map((s) => (
                <li key={s.n} className="aa-chip">
                  <span className="aa-chip-num">{s.n}</span>
                  <span className="aa-chip-label">{s.label}</span>
                </li>
              ))}
            </ul>
            <div className="aa-book-row">
              {/* Booking link isn't live yet, so this opens the Contact card
                  (call/text/email). TODO: swap to a direct scheduler link once
                  the booking URL is active. */}
              <ContactCard triggerClassName="aa-book" triggerLabel="Book a 15-min walkthrough →" />
              <p className="aa-helper">I'll walk you through all five, live.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
