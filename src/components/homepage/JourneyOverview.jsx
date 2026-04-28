import { P, F } from "../../theme";
import { useIsMobile } from "../../utils/hooks";
import { JourneyOverviewMobile } from "./JourneyOverviewMobile";

export function JourneyOverview() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: "48px 0 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, marginBottom: 4 }}>Your Mortgage Journey</h3>
        <p style={{ fontSize: 12, color: P.warmGrayLight }}>6 steps from first conversation to getting your keys</p>
      </div>
      {isMobile && <JourneyOverviewMobile />}
    </section>
  );
}
