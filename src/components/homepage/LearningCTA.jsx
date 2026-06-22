import { P, F } from "../../theme";

// Learning-mode entry point for visitors who want to understand the process
// rather than transact. The whole card is one crawlable <a href="/learn"> with
// descriptive anchor text.
export function LearningCTA() {
  return (
    <a
      href="/learn"
      style={{
        display: "block",
        textDecoration: "none",
        background: P.white,
        border: `1px solid ${P.creamDark}`,
        borderRadius: 16,
        padding: "clamp(28px, 4vw, 40px)",
      }}
    >
      <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", color: P.goldMuted, marginBottom: 12 }}>
        Just here to learn?
      </span>
      <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px, 3.2vw, 32px)", fontWeight: 400, color: P.navy, lineHeight: 1.2, marginBottom: 12 }}>
        Mortgage education and guides
      </h2>
      <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.7, color: P.warmGray, maxWidth: 620, marginBottom: 18 }}>
        The whole mortgage process in plain English: how loan programs compare, what drives rates, where closing costs come from, and what underwriters actually look for. No forms, no pressure.
      </p>
      <span style={{ fontFamily: F.body, fontSize: 15, fontWeight: 600, color: P.gold }}>
        Explore the learning hub <span aria-hidden="true">→</span>
      </span>
    </a>
  );
}
