import { useState } from "react";
import { P, F, globalCSS } from "../theme";
import { SEOHead } from "../components/SEOHead";

export function InstallPage() {
  // Auto-detect OS from user agent. Default to iOS if unclear (iOS has the worst
  // discoverability for Add to Home Screen, so it's the more important case to surface).
  const [os, setOs] = useState(() => {
    if (typeof navigator === "undefined") return "ios";
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    return "ios";
  });

  // Detect if user is on iOS but NOT in Safari — critical edge case since
  // Chrome/Brave/Firefox on iOS CANNOT install PWAs (Apple restricts this to Safari).
  const isIosNotSafari = (() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const iOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Brave/i.test(ua);
    return iOS && !isSafari;
  })();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/install");
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Clipboard API unavailable (very rare on modern iOS) — fall back to manual prompt
      window.prompt("Copy this URL and paste it into Safari:", window.location.origin + "/install");
    }
  };

  const Step = ({ num, title, body }) => (
    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: P.gold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontSize: 16, fontWeight: 700 }}>{num}</div>
      <div style={{ flex: 1, paddingTop: 3 }}>
        <h4 style={{ fontFamily: F.display, fontSize: 17, color: P.navy, marginBottom: 4 }}>{title}</h4>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: P.warmGray }}>{body}</p>
      </div>
    </div>
  );

  return (
    <main style={{ fontFamily: F.body, color: P.text, background: P.cream, minHeight: "100dvh", margin: 0 }}>
      <SEOHead
        title="Install The Mortgage Geek — Add to Home Screen"
        description="Install The Mortgage Geek as an app on your phone or tablet. Access mortgage calculators and guides offline, anytime."
        path="/install"
      />
      <style>{globalCSS}</style>
      <div className="pwa-safe-top" style={{ background: `linear-gradient(135deg, ${P.navyDark} 0%, ${P.navy} 100%)`, padding: "20px 24px", margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16 }}>🤓</span></div>
            <span style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>The Mortgage Geek</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </div>

      <div className="tool-page-content" style={{ padding: "40px 24px 64px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: P.goldMuted, display: "block", marginBottom: 8 }}>One-Tap Access</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(26px, 4vw, 38px)", color: P.navy, marginBottom: 10 }}>Install The Mortgage Geek</h1>
          <p style={{ fontSize: 14, color: P.warmGray, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>Add this site to your home screen and it works like a real app — launches full-screen with its own icon, opens faster, and works offline.</p>
        </div>

        {/* Why install micro-section */}
        <div className="content-card" style={{ padding: "20px 22px", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>🚀</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Faster</strong><br/>Launches instantly, no typing URLs.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>📱</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Full-screen</strong><br/>No browser bars — feels like an app.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>⚡</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Works offline</strong><br/>Reference content loads without signal.</p></div>
            <div><span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>🔒</span><p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.5 }}><strong style={{ color: P.navy }}>Private</strong><br/>No App Store account, no tracking.</p></div>
          </div>
        </div>

        {/* OS tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, background: P.creamDark, padding: 4, borderRadius: 10 }}>
          <button onClick={() => setOs("ios")} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: os === "ios" ? P.navy : "transparent", color: os === "ios" ? "#fff" : P.warmGray, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🍎 iPhone / iPad</button>
          <button onClick={() => setOs("android")} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: os === "android" ? P.navy : "transparent", color: os === "android" ? "#fff" : P.warmGray, fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🤖 Android</button>
        </div>

        {/* iOS instructions */}
        {os === "ios" && (
          <div className="content-card" style={{ padding: "28px 24px" }}>
            {isIosNotSafari && (
              <div style={{ background: `${P.gold}15`, border: `1px solid ${P.gold}`, borderRadius: 10, padding: "16px 18px", marginBottom: 24 }}>
                <strong style={{ color: P.navy, fontSize: 13, display: "block", marginBottom: 6 }}>⚠️ You're not in Safari</strong>
                <p style={{ fontSize: 12, color: P.warmGray, lineHeight: 1.6, marginBottom: 12 }}>Apple restricts app installation to Safari only on iPhone/iPad — Chrome, Brave, and Firefox can't install web apps on iOS. Copy the link below, then paste it into Safari's address bar.</p>
                <button onClick={copyCurrentUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, background: copiedUrl ? P.sage : P.navy, color: "#fff", border: "none", fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                  {copiedUrl ? (<><span>✓</span><span>Copied — now open Safari</span></>) : (<><span>📋</span><span>Copy install link</span></>)}
                </button>
              </div>
            )}
            <Step num="1" title="Open in Safari" body="Make sure you're in Safari — not Chrome, Brave, or another browser. Apple only allows Safari to install web apps on iPhone." />
            <Step num="2" title="Tap the Share button" body="It's the square icon with an up arrow, at the bottom of the screen on iPhone or top-right on iPad." />
            <Step num="3" title='Scroll and tap "Add to Home Screen"' body="You may need to scroll down the share sheet to find it. The icon looks like a plus sign inside a square." />
            <Step num='4' title='Confirm "Open as Web App" is ON' body={'This toggle (new in iOS 17+) is crucial — it\'s what makes the app launch full-screen instead of just opening Safari. Leave it enabled.'} />
            <Step num="5" title="Tap Add" body="The icon appears on your home screen. Tap it any time to launch The Mortgage Geek full-screen." />
          </div>
        )}

        {/* Android instructions */}
        {os === "android" && (
          <div className="content-card" style={{ padding: "28px 24px" }}>
            <Step num="1" title="Open in Chrome" body="Chrome on Android has the best PWA install support. Samsung Internet also works, but Firefox and Brave on Android have inconsistent behavior." />
            <Step num="2" title="Tap the three-dot menu" body="In the top-right corner of Chrome. The menu will slide down with a list of options." />
            <Step num="3" title='Tap "Install app" or "Add to Home screen"' body="The exact label depends on your Chrome version. If you see an install prompt banner at the bottom of the screen, you can just tap that instead." />
            <Step num="4" title="Confirm Install" body="A dialog asks you to confirm. Tap Install. The Mortgage Geek icon is added to your app drawer and home screen." />
            <Step num="5" title="Launch it like any app" body="Tap the icon to open full-screen with no Chrome UI. It behaves just like a native app." />
          </div>
        )}

        <p style={{ fontSize: 11, color: P.warmGrayLight, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Questions? Call Nick at <a href="tel:+16156560737" style={{ color: P.warmGrayLight, textDecoration: "underline" }}>(615) 656-0737</a>. No account needed — just tap the icon.
        </p>
      </div>
    </main>
  );
}
