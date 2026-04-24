import { P, F } from "../theme";

export function DeepDiveFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${P.creamDark}`, marginTop: 48, paddingTop: 28, paddingBottom: 16, textAlign: "center" }}>
      <p style={{ fontFamily: F.display, fontSize: 15, color: P.navy, marginBottom: 4 }}>
        Nick Peters <span style={{ color: P.gold }}>🤓</span>
      </p>
      <p style={{ fontSize: 12, color: P.warmGrayLight, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <span>NMLS# 1119524</span>
        <span aria-hidden="true">·</span>
        <svg
          width="12"
          height="13"
          viewBox="0 0 40 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Equal Housing Lender logo"
          style={{ verticalAlign: "middle" }}
        >
          <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          <rect x="12" y="22" width="16" height="3" fill="currentColor" />
          <rect x="12" y="28" width="16" height="3" fill="currentColor" />
        </svg>
        <span>Equal Housing Lender</span>
      </p>
    </footer>
  );
}
