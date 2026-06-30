// Featured zone: one large hero card for the manually flagged newest deep dive.
// The whole card is a single link. "Latest" is an editorial badge, not computed.
export function FeaturedCard({ article }) {
  return (
    <section aria-label="Featured deep dive">
      <div className="ddf-eyebrow">Featured</div>
      <a className="ddf-card" href={`/deep-dives/${article.slug}`}>
        <div className="ddf-tile" aria-hidden="true">{article.emoji}</div>
        <div className="ddf-content">
          <span className="ddf-badge">Latest</span>
          <h2 className="ddf-title">{article.title}</h2>
          <p className="ddf-desc">{article.desc}</p>
          <div className="ddf-footer">
            <span className="ddf-meta">Last verified · {article.verified}</span>
            <span className="ddf-read">Read →</span>
          </div>
        </div>
      </a>
    </section>
  );
}
