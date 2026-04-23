import { P, F } from "../../theme";
import { PreQualIcon, MortgageCalcIcon } from "../icons";

export function NextSteps() {
  return (
    <section id="next-steps" style={{ padding: "64px 40px" }}>
      <div style={{ maxWidth: 720 }}>
        <div style={{
          background: `linear-gradient(145deg, ${P.navyDark} 0%, ${P.navy} 55%, ${P.navyLight} 100%)`,
          borderRadius: 16, padding: "48px 36px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 100%, rgba(184,134,11,0.1) 0%, transparent 50%)" }} />
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldLight, display: "block", marginBottom: 12 }}>Ready?</span>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px, 3.5vw, 34px)", color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
              Let's figure out your next move.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", marginBottom: 32, maxWidth: 480 }}>
              Whether you're ready to get pre-approved or just have a quick question — I'm here. No pressure, no obligation. Just a conversation.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="tel:+16156560737" style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10,
                background: P.gold, textDecoration: "none", color: "#fff",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>Call me</span>
                  <span style={{ display: "block", fontSize: 12, opacity: 0.7 }}>(615) 656-0737 — let's talk through your scenario</span>
                </div>
              </a>

              <a href="sms:+16156560737&body=Hi%2C%20I%20found%20your%20site%20and%20had%20a%20question%20about%20mortgages." style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none", color: "#fff",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>Text me</span>
                  <span style={{ display: "block", fontSize: 12, opacity: 0.5 }}>Quick question? Shoot me a text — I respond fast</span>
                </div>
              </a>

              <div className="nextsteps-tools" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <a href="/prequal" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none", color: "rgba(255,255,255,0.7)",
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24 }}>
                    <PreQualIcon size={22} variant="cream" />
                  </span>
                  <div>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>What can I afford?</span>
                    <span style={{ display: "block", fontSize: 11, opacity: 0.5 }}>Pre-Qual Simulator</span>
                  </div>
                </a>

                <a href="/calculator" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none", color: "rgba(255,255,255,0.7)",
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24 }}>
                    <MortgageCalcIcon size={22} variant="cream" />
                  </span>
                  <div>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>Run the numbers</span>
                    <span style={{ display: "block", fontSize: 11, opacity: 0.5 }}>Mortgage Calculator</span>
                  </div>
                </a>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 24, textAlign: "center" }}>NMLS# 1119524 · Equal Housing Lender</p>
          </div>
        </div>
      </div>
    </section>
  );
}
