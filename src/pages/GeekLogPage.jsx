// Gated /geek-log route. Validates the URL ?key= param by calling the
// G1 /api/geeklog/year endpoint with X-Geeklog-Key. The client never
// sees the real GEEKLOG_KEY value — it only learns accept/reject from
// the server response. Unauthorized visitors get a generic 404 view
// that's visually indistinguishable from a real not-found page.
//
// Both authorized AND unauthorized renderings emit
// <meta name="robots" content="noindex, nofollow"> so search engines
// never index either response. This is belt + suspenders alongside
// robots.txt's `Disallow: /geek-log`.
//
// No SEOHead here by design — that helper sets canonical + Open Graph
// metadata which we explicitly don't want on a hidden route.

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { P, F } from "../theme";
import { fetchYearStats } from "../utils/geeklogApi";
import { AuthorizedView } from "../components/geeklog/AuthorizedView";

const STATE = { LOADING: "loading", AUTHORIZED: "authorized", DENIED: "denied" };

function readKeyFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("key") || "";
  } catch {
    return "";
  }
}

export function GeekLogPage() {
  const [state, setState] = useState(STATE.LOADING);
  const [apiKey] = useState(() => readKeyFromURL());

  useEffect(() => {
    let cancelled = false;
    if (!apiKey) {
      setState(STATE.DENIED);
      return;
    }
    fetchYearStats(apiKey, new Date().getFullYear())
      .then(() => { if (!cancelled) setState(STATE.AUTHORIZED); })
      .catch(() => { if (!cancelled) setState(STATE.DENIED); });
    return () => { cancelled = true; };
  }, [apiKey]);

  // Always emit noindex + a non-revealing title regardless of state so
  // a wrong-key visitor can't infer the route exists from <head>.
  const helmet = (
    <Helmet>
      <title>{state === STATE.AUTHORIZED ? "Geek Log" : "Page not found"}</title>
      <meta name="robots" content="noindex, nofollow" />
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

  if (state === STATE.AUTHORIZED) {
    return (
      <>
        {helmet}
        <AuthorizedView apiKey={apiKey} />
      </>
    );
  }

  // DENIED — generic not-found view. No mention of "Geek Log", no hint
  // that the URL maps to anything. Should be indistinguishable from a
  // real 404.
  return (
    <>
      {helmet}
      <main style={{
        minHeight: "100dvh",
        background: P.cream,
        color: P.navy,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
      }}>
        <h1 style={{ fontFamily: F.display, fontSize: 56, fontWeight: 400, color: P.navyDark, margin: 0, lineHeight: 1.1 }}>
          Page not found
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: P.navy, opacity: 0.7, marginTop: 16, maxWidth: 480, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <a
          href="/"
          style={{
            fontFamily: F.body,
            fontSize: 14,
            fontWeight: 600,
            color: P.navy,
            textDecoration: "underline",
            marginTop: 24,
          }}
        >
          Back to mortgagegeek.ai
        </a>
      </main>
    </>
  );
}
