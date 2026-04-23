import { P, F } from "../../theme";

export function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ maxWidth: 640, marginBottom: 40 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.gold, display: "block", marginBottom: 10 }}>{eyebrow}</span>
      <h2 style={{ fontFamily: F.display, fontSize: "clamp(26px, 3.5vw, 36px)", color: P.navy, marginBottom: 10, lineHeight: 1.15 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, lineHeight: 1.7, color: P.warmGray }}>{subtitle}</p>}
    </div>
  );
}
