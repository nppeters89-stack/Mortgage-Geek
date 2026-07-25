// Gated /geek-log route (Geek Log 2.0). Validates a key by calling the G1
// /api/geeklog/year endpoint with X-Geeklog-Key. The client never sees the real
// GEEKLOG_KEY value; it only learns accept/reject. Unauthorized visitors get a
// generic 404 view that is visually indistinguishable from a real not-found
// page, and every state emits noindex.
//
// Auth persistence (standalone/home-screen app): the key comes from the URL
// ?key= param OR, if absent, from localStorage. On a successful probe the key is
// stored so the installed app does not demand it every morning; on an explicit
// Unauthorized it is cleared. The key is NEVER placed in the manifest or
// start_url (the manifest is a public file).
//
// No SEOHead here by design (it would set canonical + Open Graph on a hidden
// route). The PWA manifest + theme-color are attached only in the authorized
// state so the 404 masquerade never reveals the route.

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { P, F } from "../theme";
import { fetchYearStats } from "../utils/geeklogApi";
import { Gl2App } from "../components/geeklog/Gl2App";

const STATE = { LOADING: "loading", AUTHORIZED: "authorized", DENIED: "denied" };
const KEY_STORAGE = "gl2:key";

function readKeyFromURL() {
  try {
    return new URLSearchParams(window.location.search).get("key") || "";
  } catch {
    return "";
  }
}
function readKeyFromStorage() {
  try {
    return localStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return "";
  }
}
function storeKey(k) {
  try {
    localStorage.setItem(KEY_STORAGE, k);
  } catch {
    /* private mode / quota */
  }
}
function clearStoredKey() {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* no-op */
  }
}

export function GeekLogPage() {
  const [state, setState] = useState(STATE.LOADING);
  const [apiKey] = useState(() => readKeyFromURL() || readKeyFromStorage());

  useEffect(() => {
    let cancelled = false;
    if (!apiKey) {
      setState(STATE.DENIED);
      return;
    }
    fetchYearStats(apiKey, new Date().getFullYear())
      .then(() => {
        if (cancelled) return;
        setState(STATE.AUTHORIZED);
        storeKey(apiKey); // persist for the installed app
      })
      .catch((err) => {
        if (cancelled) return;
        setState(STATE.DENIED);
        // Only forget the key on an explicit rejection, not a transient network error.
        if (err && err.message === "Unauthorized") clearStoredKey();
      });
    return () => { cancelled = true; };
  }, [apiKey]);

  const authed = state === STATE.AUTHORIZED;
  const helmet = (
    <Helmet>
      <title>{authed ? "Geek Log" : "Page not found"}</title>
      <meta name="robots" content="noindex, nofollow" />
      {/* This route does not inject globalCSS, so load the brand fonts here.
          The wordmark (DM Sans + Archivo) and body (Figtree) need them, and
          getFontEmbedCSS() embeds them into the exported PNG. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Figtree:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap" />
      {/* Manifest + PWA/iOS install tags only when authorized, so the 404
          masquerade never leaks the route's purpose from <head>. iOS ignores
          the manifest icons for the home-screen icon and uses apple-touch-icon,
          so that link is what actually shows the Geek Log icon on an iPhone. */}
      {authed && <link rel="manifest" href="/geeklog.webmanifest" />}
      {authed && <meta name="theme-color" content="#131416" />}
      {authed && <link rel="apple-touch-icon" sizes="180x180" href="/geeklog/icon-180.png" />}
      {authed && <meta name="apple-mobile-web-app-capable" content="yes" />}
      {authed && <meta name="apple-mobile-web-app-title" content="Geek Log" />}
      {authed && <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />}
    </Helmet>
  );

  if (state === STATE.LOADING) {
    return (
      <>
        {helmet}
        <main style={{ minHeight: "100dvh", background: P.cream }} aria-hidden="true" />
      </>
    );
  }

  if (authed) {
    return (
      <>
        {helmet}
        <Gl2App apiKey={apiKey} />
      </>
    );
  }

  // DENIED — generic not-found view, indistinguishable from a real 404.
  return (
    <>
      {helmet}
      <main style={{ minHeight: "100dvh", background: P.cream, color: P.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <h1 style={{ fontFamily: F.display, fontSize: 56, fontWeight: 400, color: P.navyDark, margin: 0, lineHeight: 1.1 }}>Page not found</h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: P.navy, opacity: 0.7, marginTop: 16, maxWidth: 480, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <a href="/" style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: P.navy, textDecoration: "underline", marginTop: 24 }}>
          Back to mortgagegeek.ai
        </a>
      </main>
    </>
  );
}
