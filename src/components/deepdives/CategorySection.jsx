import { LibraryCard } from "./LibraryCard";

// One topical section: hairline rule, numbered header with H2 and a visible-card
// count, then the auto-fill card grid. A section with zero visible cards (after
// filter/search) hides entirely, header included.
export function CategorySection({ number, title, articles }) {
  if (articles.length === 0) return null;
  const headingId = `dd-section-${number}`;
  return (
    <section className="ddcs-section" aria-labelledby={headingId}>
      <hr className="ddcs-rule" />
      <div className="ddcs-head">
        <span className="ddcs-num">{number}</span>
        <h2 className="ddcs-h2" id={headingId}>{title}</h2>
        <span className="ddcs-count">{articles.length} {articles.length === 1 ? "guide" : "guides"}</span>
      </div>
      <div className="ddcs-grid">
        {articles.map((a) => (
          <LibraryCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
