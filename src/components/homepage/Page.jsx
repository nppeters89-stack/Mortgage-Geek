// Page-level frame: caps homepage content at 1180px, centers it,
// and provides fluid horizontal gutters via clamp().
//
// Used by src/pages/MainSite.jsx to wrap everything below the hero.
// Hero stays outside — it remains full-bleed.

export function Page({ children, style }) {
  return (
    <div
      style={{
        maxWidth: 1180,
        margin: '0 auto',
        paddingLeft: 'clamp(20px, 4vw, 56px)',
        paddingRight: 'clamp(20px, 4vw, 56px)',
        boxSizing: 'border-box',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
