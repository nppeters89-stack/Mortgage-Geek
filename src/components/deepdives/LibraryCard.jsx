import { PROGRAM_COLORS } from "../../theme";

// Condensed catalog card. Reads visually lighter than the FeaturedCard. The
// program pill appears ONLY on the three Manual Underwriting cards; color comes
// from PROGRAM_COLORS (source values, white text) mapped by visual result. The
// whole card is a single link.
export function LibraryCard({ article }) {
  return (
    <a className="ddl-card" href={`/deep-dives/${article.slug}`}>
      <div className="ddl-top">
        <span className="ddl-emoji" aria-hidden="true">{article.emoji}</span>
        {article.program && (
          <span className="ddl-pill" style={{ background: PROGRAM_COLORS[article.program] }}>
            {article.program}
          </span>
        )}
      </div>
      <h3 className="ddl-title">{article.title}</h3>
      <p className="ddl-tagline">{article.tagline}</p>
      <div className="ddl-footer">
        <span className="ddl-meta">Last verified · {article.verified}</span>
        <span className="ddl-read">Read →</span>
      </div>
    </a>
  );
}
