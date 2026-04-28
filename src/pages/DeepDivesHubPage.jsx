import { P, F, globalCSS } from "../theme";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";

export function DeepDivesHubPage() {
  const topics = [
    {
      slug: "derogatory-credit",
      emoji: "⏳",
      title: "Derogatory Credit Wait Periods",
      summary: "How long you have to wait before qualifying for a mortgage after bankruptcy, foreclosure, short sale, deed-in-lieu, or late mortgage payments — compared across all five major loan programs.",
      lastVerified: "April 2026",
    },
    {
      slug: "fha-manual-underwriting",
      emoji: "📋",
      title: "FHA Manual Underwriting",
      summary: "What happens when FHA's automated system sends your file to a human underwriter. HUD 4000.1 credit rules, the DTI and compensating factors grid, required downgrade triggers, and how to actually get approved.",
      lastVerified: "April 2026",
    },
    {
      slug: "va-manual-underwriting",
      emoji: "🎖️",
      title: "VA Manual Underwriting",
      summary: "When VA's automated system refers your file to a human underwriter. Residual income tables by region and family size, the DTI and compensating factors framework, the 13 VA comp factors, and what actually gets a manual file approved.",
      lastVerified: "April 2026",
    },
    {
      slug: "usda-manual-underwriting",
      emoji: "🌾",
      title: "USDA Manual Underwriting",
      summary: "When USDA's GUS system returns Refer or Refer with Caution. The two eligibility gates (income limits and rural property), the 29/41 baseline and 34/44 waiver ceilings, the 680 credit score waiver gate, the five compensating factors (including PN 621's payment shock), and how to actually get approved.",
      lastVerified: "April 2026",
    },
    {
      slug: "arms-demystified",
      emoji: "📈",
      title: "ARMs Demystified",
      summary: "How adjustable-rate mortgages actually work, with a custom anatomy graphic, a 12-term glossary, and a worked example of what 5/1/5 caps mean in real dollars. When ARMs genuinely make sense and when they put a borrower in a bind.",
      lastVerified: "April 2026",
    },
    {
      slug: "residency-rules",
      emoji: "🌐",
      title: "Residency and Visa Rules",
      summary: "Which residency status qualifies for which loan program, organized as a 5x5 grid of borrower status by program. Includes the May 25, 2025 FHA rule change that closed the door on H-1Bs, EADs, asylees, and refugees, plus the work visa and EAD codes that still qualify on Conventional and USDA.",
      lastVerified: "April 2026",
    },
    {
      slug: "self-employed-documentation",
      emoji: "📊",
      title: "Self-Employed Mortgage Documentation",
      summary: "What lenders actually want from self-employed borrowers, by business structure and loan program. The 25% ownership rule, two-year and one-year tax return options, the business returns waiver, and how qualifying income gets calculated (with a worked example showing why $200k revenue often becomes $65k qualifying income).",
      lastVerified: "April 2026",
    },
    {
      slug: "expected-income",
      emoji: "📅",
      title: "Expected Income: Using a New Job Offer to Qualify",
      summary: "How to qualify for a mortgage with an offer letter for a job you haven't started yet. The 60-day vs 90-day window split, Fannie's two options, Freddie's two options, the common professions exception (doctors, teachers, professors), and how reserves work. Includes an interactive matrix mapping three borrower scenarios across all five major loan programs.",
      lastVerified: "April 2026",
    },
  ];

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title="Mortgage Deep Dives — Detailed Guides for Every Loan Question"
        description="Comprehensive comparison guides for complex mortgage scenarios. Bankruptcy wait periods, manual underwriting, gift funds — real answers from a 12-year pro."
        path="/deep-dives"
      />
      <style>{globalCSS}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🐳</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 10 }}>Deep Dives</span>
          <h1 style={{ fontFamily: F.display, fontSize: 42, color: P.navy, fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}>
            Where <em style={{ fontStyle: "italic", color: P.gold }}>real questions</em> get real answers.
          </h1>
          <p style={{ fontSize: 15, color: P.warmGray, maxWidth: 620, margin: "0 auto", lineHeight: 1.65 }}>
            Mortgage guidelines aren't one-size-fits-all. Different loan programs have different rules — sometimes dramatically different. These deep dives compare how the five major programs handle common borrower situations, with clear answers and the source handbook sections cited.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {topics.map((t) => (
            <a key={t.slug} href={`/deep-dives/${t.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: "24px 28px",
                border: `1px solid ${P.creamDark}`,
                borderLeft: `3px solid ${P.gold}`,
                transition: "transform 0.15s, box-shadow 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(15, 37, 48, 0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{t.emoji}</span>
                  <h3 style={{ fontFamily: F.display, fontSize: 22, color: P.navy, fontWeight: 400, lineHeight: 1.2 }}>{t.title}</h3>
                </div>
                <p style={{ fontSize: 14, color: P.warmGray, lineHeight: 1.65, marginBottom: 10 }}>{t.summary}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: P.warmGrayLight, fontStyle: "italic" }}>Last verified · {t.lastVerified}</span>
                  <span style={{ fontSize: 13, color: P.gold, fontWeight: 600 }}>Read →</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, padding: "24px", background: P.creamDark, borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: P.warmGray, fontStyle: "italic" }}>More deep dives coming soon. Got a topic you want covered? <a href="tel:+16156560737" style={{ color: P.navy, fontWeight: 600, textDecoration: "underline" }}>Call (615) 656-0737</a>.</p>
        </div>
      </div>

      <MobileToolbar />
    </main>
  );
}
