// Gated /geek-log route (Geek Log 2.0). Auth is a signed HttpOnly session
// cookie set by the server: on load the page calls auth.check; without a valid
// session it renders a full-screen login where the passphrase is typed once
// per device and never stored client-side. Any later 401 from the api drops
// back to this screen through the geeklogApi unauthorized handler. The old
// key URL parameter, the stored key, and the 404 masquerade are retired.
//
// No SEOHead here by design (it would set canonical + Open Graph on a hidden
// route); every state emits noindex.

import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { T, FF } from "../components/geeklog/gl2Tokens";
import { authCheck, authLogin, authLogout, setUnauthorizedHandler } from "../utils/geeklogApi";
import { Gl2App } from "../components/geeklog/Gl2App";

const STATE = { LOADING: "loading", AUTHORIZED: "authorized", LOGIN: "login" };

export function GeekLogPage() {
  const [state, setState] = useState(STATE.LOADING);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Any gated api call that comes back 401 lands here, from any tab.
  useEffect(() => {
    setUnauthorizedHandler(() => setState(STATE.LOGIN));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    authCheck()
      .then((status) => { if (!cancelled) setState(status === 204 ? STATE.AUTHORIZED : STATE.LOGIN); })
      .catch(() => { if (!cancelled) setState(STATE.LOGIN); });
    return () => { cancelled = true; };
  }, []);

  const submit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (busy || !pass) return;
    setBusy(true);
    setError("");
    try {
      const status = await authLogin(pass);
      if (status === 204) { setPass(""); setState(STATE.AUTHORIZED); }
      else if (status === 429) setError("Too many attempts, wait 15 minutes");
      else setError("Wrong passphrase");
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  }, [busy, pass]);

  const signOut = useCallback(async () => {
    try { await authLogout(); } catch { /* cookie may already be gone */ }
    setState(STATE.LOGIN);
  }, []);

  const helmet = (
    <Helmet>
      <title>Geek Log</title>
      <meta name="robots" content="noindex, nofollow" />
      {/* This route does not inject globalCSS, so load the brand fonts here.
          The wordmark (DM Sans + Archivo) and body (Figtree) need them, and
          getFontEmbedCSS() embeds them into the exported PNG. Instrument Serif
          is the display serif for Geek Log numbers, snapshot card, and the
          Prospecting names/headers. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Figtree:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap" />
      {/* The PWA manifest, apple-touch-icon, and app title for /geek-log are set
          in the document shell (src/root.jsx), route-aware. Do not re-add them
          here. */}
    </Helmet>
  );

  if (state === STATE.LOADING) {
    return (
      <>
        {helmet}
        <main style={{ minHeight: "100dvh", background: T.bg1 }} aria-hidden="true" />
      </>
    );
  }

  if (state === STATE.AUTHORIZED) {
    return (
      <>
        {helmet}
        <Gl2App apiKey="" onSignOut={signOut} />
      </>
    );
  }

  // LOGIN: one passphrase, typed once per device.
  return (
    <>
      {helmet}
      <main style={{ minHeight: "100dvh", background: T.bg1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <form onSubmit={submit} style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: FF.body, fontWeight: 800, fontSize: 26, letterSpacing: "-0.3px", color: T.cream, textAlign: "center", marginBottom: 6 }}>Geek Log</div>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Passphrase"
            aria-label="Passphrase"
            style={{ boxSizing: "border-box", width: "100%", background: T.surface, color: T.cream, border: `1px solid ${T.line}`, borderRadius: 12, padding: "14px 16px", fontFamily: FF.body, fontSize: 16, outline: "none" }}
          />
          <button type="submit" disabled={busy || !pass}
            style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: busy || !pass ? T.surface : T.green, color: busy || !pass ? T.faint : T.cream, fontFamily: FF.body, fontSize: 16, fontWeight: 700, cursor: busy || !pass ? "default" : "pointer" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div role="status" style={{ minHeight: 18, fontFamily: FF.body, fontSize: 13, color: T.redLift, textAlign: "center" }}>{error}</div>
        </form>
      </main>
    </>
  );
}
