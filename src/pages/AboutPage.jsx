import { P, F, globalCSS } from "../theme";
import { HEADSHOT } from "../data/headshot";
import { MobileToolbar } from "../components/MobileToolbar";
import { SEOHead } from "../components/SEOHead";
import { PERSONAL_NMLS, CORPORATE_NMLS, TRADE_NAME, LO_TITLE } from "../data/compliance";

export function AboutPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh" }}>
      <SEOHead
        title="About Nick Peters — Mortgage Loan Officer | NMLS# 1119524"
        description="12+ years helping first-time buyers through the mortgage process. Licensed in multiple states. Straight answers, no jargon — based in Tennessee."
        path="/about"
      />
      <style>{globalCSS}</style>

      {/* Header */}
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 800, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>🤓</span>
            </div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:+16156560737" aria-label="Call Nick Peters at (615) 656-0737" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: P.gold, color: "#fff", fontFamily: F.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span className="btn-label-mobile-hide">Call</span>
            </a>
            <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500, marginLeft: 8 }}>← Back</a>
          </div>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "48px 24px 64px", maxWidth: 800, margin: "0 auto" }}>
        {/* Headshot + intro */}
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center", marginBottom: 48 }}>
          <div style={{ width: 140, height: 140, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `4px solid ${P.gold}`, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
            <img src={HEADSHOT} alt="Nick Peters, mortgage loan officer with 12+ years of experience" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 8 }}>The Person Behind the Site</span>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(28px, 4vw, 38px)", color: P.navy, marginBottom: 6 }}>Nick Peters</h1>
            <p style={{ fontSize: 14, color: P.warmGray }}>{LO_TITLE} at {TRADE_NAME} · NMLS# {PERSONAL_NMLS}</p>
            <p style={{ fontSize: 13, color: P.warmGrayLight, marginTop: 2 }}>Nashville, TN · Licensed since 2014</p>
          </div>
        </div>

        {/* Bio */}
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            I'm a {LO_TITLE} at {TRADE_NAME} and a licensed Mortgage Loan Originator (NMLS# {PERSONAL_NMLS}, Corporate NMLS# {CORPORATE_NMLS}).
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            For twelve years, I worked the sales desk in new construction model homes. I was the person families approached after falling in love with a house — the one responsible for turning that excitement into numbers that actually worked. Some conversations ended in approvals. Others required me to gently explain why the answer was "not yet," and what steps we could take to change that.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            Builder lending taught me the real edges of the mortgage world in a way retail banking never could. Over the years, I've assisted countless homebuyers of all types and navigated virtually every loan scenario imaginable. I learned how to structure deals that were favorable and perfectly tailored to each customer's specific needs and situation.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray, marginBottom: 20 }}>
            The Mortgage Geek exists because most mortgage websites are either generic rate-bait or thinly disguised lead forms. Neither respects the borrower. This site is the opposite bet: give you the real information, the real tools, and a real human to text when you're ready. No drip campaigns. No "apply now" before you know what you're applying for. Just a plain-English answer to whatever you need.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: P.warmGray }}>
            If you're anywhere in the mortgage process — whether you're just curious about what you can afford or you've already accepted an offer and your current lender has gone silent — feel free to text me. I'm happy to help, no matter what stage you're at.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 48 }}>
          {[
            { num: "12+", label: "Years in the industry" },
            { num: "Hundreds", label: "Families helped" },
          ].map((s, i) => (
            <div key={i} className="content-card" style={{ padding: "24px 16px", textAlign: "center" }}>
              <span style={{ fontFamily: F.display, fontSize: 30, color: P.navy, display: "block", marginBottom: 4 }}>{s.num}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: P.warmGrayLight, letterSpacing: 0.3, textTransform: "uppercase" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Programs */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: P.warmGrayLight, display: "block", marginBottom: 12 }}>Loan Programs Mastered</span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Conventional", "FHA", "VA", "USDA", "Jumbo", "DSCR"].map((p, i) => (
              <span key={i} style={{ padding: "8px 18px", borderRadius: 50, background: P.white, fontSize: 13, fontWeight: 600, color: P.navy, border: `1px solid ${P.creamDark}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>{p}</span>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div style={{
          background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 100%)`,
          borderRadius: 16, padding: "36px 32px", marginBottom: 48,
        }}>
          <h3 style={{ fontFamily: F.display, fontSize: 24, color: "#fff", marginBottom: 8 }}>Let's connect.</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Whether you're ready to get pre-approved or just have a question — reach out anytime.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="tel:+16156560737" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: P.gold, color: "#fff",
              fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              (615) 656-0737
            </a>
            <a href="sms:+16156560737&body=Hi%20Nick%2C%20I%20found%20your%20site%20and%20wanted%20to%20connect." style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Text me
            </a>
            <a href="mailto:npeters@annie-mac.com" aria-label="Email Nick Peters at npeters@annie-mac.com" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: F.body, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email me
            </a>
            <a href="https://www.linkedin.com/in/nickpeters2/" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: F.body, fontSize: 14, fontWeight: 500, textDecoration: "none",
            }}>
              LinkedIn →
            </a>
          </div>
        </div>

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          <span>NMLS# {PERSONAL_NMLS} ·</span>
          <svg width="11" height="12" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
            <path d="M20 1L0.5 16.8V41.5H39.5V16.8L20 1Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
            <rect x="12" y="22" width="16" height="3" fill="currentColor"/>
            <rect x="12" y="28" width="16" height="3" fill="currentColor"/>
          </svg>
          <span>Equal Housing Lender</span>
        </p>
      </div>
      <MobileToolbar />
    </main>
  );
}
