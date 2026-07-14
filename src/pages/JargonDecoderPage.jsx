import { P, F, globalCSS } from "../theme";
import { ContactCard } from "../components/homepage/ContactCard";
import { Page } from "../components/homepage/Page";
import { JargonDecoder } from "../components/homepage/JargonDecoder";
import { MobileToolbar } from "../components/MobileToolbar";

// Dedicated page for the Jargon Decoder glossary, extracted from the Learning
// Hub so it has its own URL and metadata. Reuses the tool-page header (co-brand
// lockup home link + contact phone icon + Learning Hub back link) and renders
// the glossary expanded via the `standalone` prop. Metadata lives in the route
// adapter (routes/jargon-decoder.jsx).
export function JargonDecoderPage() {
  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <style>{globalCSS}</style>

      <div className="pwa-safe-top" style={{ background: "#FFFFFF", borderBottom: `1px solid ${P.creamDark}`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="cobrand-rate" style={{ display: "inline-flex", alignItems: "center" }}><img src="/rate-2color-black-tight.svg" alt="Rate" width={63} height={26} style={{ display: "block", flexShrink: 0 }} /><span aria-hidden="true" style={{ width: 1, height: 26, background: P.creamDark, flexShrink: 0, margin: "0 14px" }} /></span><span className="mg-lockup mg--light" style={{ "--mg-h": "28px" }}><img className="mg-lockup__mark" src="/assets/mg-mark-sm.svg" alt="" aria-hidden="true" />
            <span className="mg-lockup__words"><span className="mg-lockup__top">Mortgage</span><span className="mg-lockup__geek">Geek</span></span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ContactCard iconOnly ariaLabel="Contact Nick" />
            <a href="/learn" style={{ fontSize: 13, color: P.textLight, textDecoration: "none", fontWeight: 500, marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6 }}><span aria-hidden="true">←</span><img src="/assets/learning-hub-mark-sm.svg" alt="" width={20} height={16} style={{ display: "block" }} />Learning Hub</a>
          </div>
        </div>
      </div>

      <Page>
        <JargonDecoder standalone />
      </Page>

      <MobileToolbar />
    </main>
  );
}
