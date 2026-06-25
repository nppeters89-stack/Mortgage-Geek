import { useEffect, useRef, useState } from "react";
import { HOME, F } from "../../theme";
import { REVIEWS } from "../../data/reviews";
import { useIsMobile } from "../../utils/hooks";

// Reviews (design handoff §6): white section. Desktop = 3-up grid; mobile =
// carousel (auto-advance 4.5s, prev/next, dots), paused under reduced-motion.
// Review data are PLACEHOLDERS — TODO: replace with real Google reviews.
const css = `
  .rv-section { background: ${HOME.white}; padding: 80px 56px; border-top: 1px solid ${HOME.borderLight}; }
  .rv-wrap { max-width: 1240px; margin: 0 auto; }
  .rv-head { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 36px; }
  .rv-label { font-family: ${F.sans}; font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${HOME.red}; margin: 0 0 10px; }
  .rv-h2 { font-family: ${F.sans}; font-size: 52px; font-weight: 800; letter-spacing: -.03em; line-height: 1.0; color: ${HOME.ink}; margin: 0; }
  .rv-chip { display: inline-flex; align-items: center; gap: 8px; background: ${HOME.cream}; border-radius: 99px; padding: 10px 18px; }
  .rv-chip-stars { color: ${HOME.red}; font-size: 15px; letter-spacing: 1px; }
  .rv-chip-num { font-family: ${F.sans}; font-size: 22px; font-weight: 800; color: ${HOME.ink}; }
  .rv-chip-sub { font-family: ${F.sans}; font-size: 14px; color: ${HOME.textMuted}; }
  /* auto-fit + centered so 1-2 reviews don't look broken; 3+ fill the row. */
  .rv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 360px)); gap: 20px; justify-content: center; }
  .rv-empty { text-align: center; padding: 8px 0 4px; }
  .rv-empty p { font-family: ${F.sans}; font-size: 16px; color: ${HOME.textSecondary}; margin: 0 0 14px; }
  .rv-empty a, .rv-google { display: inline-flex; align-items: center; gap: 6px; font-family: ${F.sans}; font-size: 15px; font-weight: 700; color: ${HOME.red}; text-decoration: none; }
  .rv-empty a:hover, .rv-google:hover { text-decoration: underline; }
  .rv-google { font-size: 14px; }
  .rv-card { background: ${HOME.warmWhite}; border: 1px solid ${HOME.borderCard}; border-radius: 16px; padding: 30px 28px; transition: transform .25s ease, box-shadow .25s ease; }
  .rv-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(0,0,0,.08); }
  .rv-stars { color: ${HOME.red}; font-size: 15px; letter-spacing: 1px; }
  .rv-quote { font-family: ${F.sans}; font-size: 17px; font-weight: 500; line-height: 1.55; color: ${HOME.ink}; margin: 14px 0 20px; }
  .rv-foot { display: flex; align-items: center; gap: 12px; }
  .rv-avatar { width: 40px; height: 40px; border-radius: 50%; background: ${HOME.red}; color: ${HOME.white}; display: inline-flex; align-items: center; justify-content: center; font-family: ${F.sans}; font-weight: 800; font-size: 16px; flex-shrink: 0; }
  .rv-name { font-family: ${F.sans}; font-size: 15px; font-weight: 700; color: ${HOME.ink}; }
  .rv-date { font-family: ${F.sans}; font-size: 13px; color: ${HOME.textMuted}; }

  /* Carousel (mobile) */
  .rv-viewport { overflow: hidden; }
  .rv-track { display: flex; transition: transform .55s cubic-bezier(.4,0,.2,1); }
  .rv-slide { flex: 0 0 100%; min-width: 100%; box-sizing: border-box; }
  .rv-nav { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 20px; }
  .rv-arrow { width: 38px; height: 38px; border-radius: 50%; border: 1px solid ${HOME.borderCard}; background: ${HOME.white}; color: ${HOME.ink}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; }
  .rv-dots { display: flex; align-items: center; gap: 8px; }
  .rv-dot { height: 8px; width: 8px; border-radius: 99px; border: none; padding: 0; background: ${HOME.dotInactive}; cursor: pointer; transition: width .3s ease, background .3s ease; }
  .rv-dot.is-active { width: 24px; background: ${HOME.red}; }

  @media (max-width: 960px) {
    .rv-section { padding: 52px 20px; }
    .rv-h2 { font-size: 34px; }
  }
`;

function Card({ r }) {
  const initial = r.name ? r.name.trim().charAt(0) : "★";
  const date = (() => {
    const m = /^(\d{4})-(\d{2})$/.exec(r.date || "");
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : r.date;
  })();
  return (
    <figure className="rv-card" style={{ margin: 0 }}>
      <div className="rv-stars" aria-hidden="true">★★★★★</div>
      <blockquote className="rv-quote" style={{ border: 0, padding: 0 }}>&ldquo;{r.quote}&rdquo;</blockquote>
      <figcaption className="rv-foot">
        <span className="rv-avatar" aria-hidden="true">{initial}</span>
        <span>
          <span className="rv-name" style={{ display: "block" }}>{r.name}</span>
          <span className="rv-date" style={{ display: "block" }}>{date}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewsCarousel() {
  const isMobile = useIsMobile(960);
  const cards = Array.isArray(REVIEWS.reviews) ? REVIEWS.reviews : [];
  const rating = typeof REVIEWS.rating === "number" ? REVIEWS.rating.toFixed(1) : "5.0";
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  const reduceMotion = typeof window !== "undefined" && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = (i) => setActive((i + cards.length) % cards.length);

  useEffect(() => {
    if (!isMobile || reduceMotion || cards.length <= 1) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % cards.length), 4500);
    return () => clearInterval(timer.current);
  }, [isMobile, reduceMotion, cards.length, active]);

  const manual = (i) => { if (timer.current) clearInterval(timer.current); go(i); };

  return (
    <section className="rv-section">
      <style>{css}</style>
      <div className="rv-wrap">
        <div className="rv-head">
          <div>
            <p className="rv-label">Social proof</p>
            <h2 className="rv-h2">Real reviews from real clients.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <span className="rv-chip">
              <span className="rv-chip-stars" aria-hidden="true">★★★★★</span>
              <span className="rv-chip-num">{rating}</span>
              <span className="rv-chip-sub">on Google</span>
            </span>
            {REVIEWS.profileUrl && (
              <a className="rv-google" href={REVIEWS.profileUrl} target="_blank" rel="noopener noreferrer">Read on Google →</a>
            )}
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="rv-empty">
            <p>More reviews are coming in. Read the latest on Google.</p>
            {REVIEWS.profileUrl && (
              <a href={REVIEWS.profileUrl} target="_blank" rel="noopener noreferrer">See reviews on Google →</a>
            )}
          </div>
        ) : !isMobile ? (
          <div className="rv-grid">
            {cards.map((r, i) => <Card key={i} r={r} />)}
          </div>
        ) : (
          <>
            <div className="rv-viewport">
              <div className="rv-track" style={{ transform: `translateX(-${active * 100}%)` }}>
                {cards.map((r, i) => (
                  <div className="rv-slide" key={i} aria-hidden={i !== active}><Card r={r} /></div>
                ))}
              </div>
            </div>
            <div className="rv-nav">
              <button type="button" className="rv-arrow" aria-label="Previous review" onClick={() => manual(active - 1)}>‹</button>
              <span className="rv-dots">
                {cards.map((_, i) => (
                  <button key={i} type="button" className={`rv-dot${i === active ? " is-active" : ""}`} aria-label={`Go to review ${i + 1}`} aria-current={i === active} onClick={() => manual(i)} />
                ))}
              </span>
              <button type="button" className="rv-arrow" aria-label="Next review" onClick={() => manual(active + 1)}>›</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
