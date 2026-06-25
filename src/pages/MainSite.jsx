import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { HomeHeader } from "../components/homepage/HomeHeader";
import { HeroEditorial } from "../components/homepage/HeroEditorial";
import { ValueProps } from "../components/homepage/ValueProps";
import { LoanProducts } from "../components/homepage/LoanProducts";
import { AgentAdvantage } from "../components/homepage/AgentAdvantage";
import { Education } from "../components/homepage/Education";
import { ReviewsCarousel } from "../components/homepage/ReviewsCarousel";
import { ContactCTA } from "../components/homepage/ContactCTA";
import { SEOHead } from "../components/SEOHead";

// Homepage = the rebranded editorial marketing page (design handoff). Section
// order: header -> hero -> value props -> agent advantage -> education ->
// reviews -> contact CTA -> footer (footer is rendered globally by App.jsx).
// Figtree is scoped to these homepage sections; the rest of the site keeps the
// serif display. Feature flags default on.
export function MainSite({ showStats = true, showAgentSection = true, enableMotion = true }) {
  return (
    <div style={{ fontFamily: F.sans, color: P.text, background: P.cream, minHeight: "100vh", minHeight: "100dvh" }}>
      <SEOHead
        title="Mortgage Geek: A Clear Path to Your First Home"
        description="Real answers from a real loan officer. Get matched to the right loan program, see your real numbers, and reach a real person when you're ready to start."
        path="/"
      />
      <style>{globalCSS}</style>
      <HomeHeader />
      <HeroEditorial showStats={showStats} enableMotion={enableMotion} />
      <ValueProps />
      <LoanProducts />
      {showAgentSection && <AgentAdvantage />}
      <Education />
      <ReviewsCarousel />
      <ContactCTA />
      <MobileToolbar />
    </div>
  );
}
