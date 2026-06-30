// Shown only when zero cards match across all sections. Copy is exact (site
// voice, no em-dashes).
export function EmptyState() {
  return (
    <div className="dde-empty" role="status">
      <div className="dde-glyph" aria-hidden="true">🔍</div>
      <p className="dde-title">No guides match that yet.</p>
      <p className="dde-text">Try a broader term, or clear the filter to see all fifteen deep dives.</p>
      <p className="dde-text">
        Have a question we have not covered? Call{" "}
        <a className="dde-phone" href="tel:+16156560737">(615) 656-0737</a>.
      </p>
    </div>
  );
}
