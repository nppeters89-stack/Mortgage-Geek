import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { JourneyOverviewMobile } from "./JourneyOverviewMobile";

export function JourneyOverview() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: "48px 0 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: P.gold, marginBottom: 10 }}>
          The Journey
        </div>
        <h3 style={{ fontFamily: F.display, fontSize: 28, color: P.navy, marginBottom: 8 }}>6 steps to your keys</h3>
        <p style={{ fontSize: 13, color: P.warmGray, lineHeight: 1.5 }}>Three steps at your pace, then ~30 days after you're under contract.</p>
      </div>
      {isMobile && <JourneyOverviewMobile />}
    </section>
  );
}
