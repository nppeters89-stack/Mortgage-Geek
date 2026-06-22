import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { HomeHeader } from "../components/homepage/HomeHeader";
import { Hero } from "../components/homepage/Hero";
import { Page } from "../components/homepage/Page";
import { Reviews } from "../components/homepage/Reviews";
import { SEOHead } from "../components/SEOHead";

// Homepage = the sales / value-prop page. The educational scroll and the
// topic/tools sidebar were moved to /learn (LearnPage) in the IA split; what
// remains is the slim co-brand header, the hero, social proof, and reserved
// space for the sales body (built in a later phase). No Sidebar here, so no
// 280px main-content offset.
export function MainSite() {
  return (
    <div style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100vh", minHeight: "100dvh" }}>
      <SEOHead
        title="Mortgage Geek: A Clear Path to Your First Home"
        description="Real answers from a real loan officer for first-time buyers. Get matched to the right loan program, see your real numbers, and reach a real person when you're ready to start."
        path="/"
      />
      <style>{globalCSS}</style>
      <HomeHeader />
      <Hero />
      <Page>
        <Reviews />
      </Page>
      <MobileToolbar />
    </div>
  );
}
