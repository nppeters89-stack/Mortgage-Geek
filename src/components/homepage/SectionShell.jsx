// Two-column section primitive: rail on the left, content on the right.
// Used by sections that benefit from a contextual sidebar — e.g. tab strips,
// program lists, anchor menus.
//
// Mobile collapse is handled by the .section-shell CSS class in
// src/theme.js globalCSS — pure CSS, no useIsMobile branching, no hydration flash.

export function SectionShell({
  rail,
  children,
  railWidth = 280,
  gap = 56,
  style,
  railStyle,
  contentStyle,
}) {
  return (
    <div
      className="section-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: `${railWidth}px 1fr`,
        gap,
        alignItems: 'start',
        ...style,
      }}
    >
      <aside
        style={{
          position: 'sticky',
          top: 24,
          ...railStyle,
        }}
      >
        {rail}
      </aside>
      <div style={{ minWidth: 0, ...contentStyle }}>{children}</div>
    </div>
  );
}
