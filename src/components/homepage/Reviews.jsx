import { P, F } from "../../theme";
import { REVIEWS } from "../../data/reviews";

// "2026-05" -> "May 2026"; anything else passes through unchanged.
function formatMonth(ym) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || "");
  if (!m) return ym || "";
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Decorative 5-star row, filled up to the rounded value. The precise rating is
// always announced by adjacent visible text, so the stars are aria-hidden.
function Stars({ value, size = 16 }) {
  const filled = Math.round(value || 0);
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", gap: 2, fontSize: size, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= filled ? P.gold : P.creamDark }}>★</span>
      ))}
    </span>
  );
}

export function Reviews() {
  const { rating, count, profileUrl, reviews } = REVIEWS;
  const hasRating = typeof rating === "number" && count > 0;
  const cards = Array.isArray(reviews) ? reviews : [];

  return (
    <section id="reviews" style={{ padding: "64px 0" }}>
      <div style={{ maxWidth: 640, marginBottom: cards.length ? 36 : 20 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 10 }}>Social proof</span>
        <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 3.5vw, 36px)", color: P.navy, marginBottom: 12, lineHeight: 1.15 }}>
          Real reviews from real clients.
        </h2>

        {hasRating ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Stars value={rating} size={20} />
            <span style={{ fontSize: 15, fontWeight: 600, color: P.text }}>
              {rating.toFixed(1)} from {count}+ Google reviews
            </span>
            {profileUrl && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: P.gold, textDecoration: "none" }}>
                Read on Google &rarr;
              </a>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.7, color: P.warmGray }}>
            Worked with me? A quick Google review helps the next first-time buyer find real answers.
            {profileUrl && (
              <>
                {" "}
                <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: P.gold, fontWeight: 600, textDecoration: "none" }}>Leave a review &rarr;</a>
              </>
            )}
          </p>
        )}
      </div>

      {cards.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {cards.map((r, i) => (
            <figure key={i} className="content-card" style={{ margin: 0, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <Stars value={r.rating ?? 5} size={15} />
              <blockquote style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: P.text, fontFamily: F.body }}>
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: "50%", background: P.creamDark, color: P.navy, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontSize: 15, flexShrink: 0 }}>
                  {r.name ? r.name.trim().charAt(0) : "★"}
                </span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: P.navy }}>{r.name}</span>
                  {r.date && <span style={{ fontSize: 11, color: P.warmGray }}>{formatMonth(r.date)}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
