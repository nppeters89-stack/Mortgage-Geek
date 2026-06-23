// Homepage sales-body value-prop modules — DATA-DRIVEN and ASSET-INDEPENDENT.
//
// Remaining gated bits stay reserved so they slot in via config, not a rebuild:
//   ctaHref (PowerBid, Same Day) -> approved Rate funnel URL (TODO, pending)
//   mark -> official Rate product mark/lockup (RESERVED, null for now)
//
// Disclosures are OFFICIAL verbatim fine print. NOTE: the Same Day "8 hours"
// figure is pending Rate confirmation vs the 24h full T&C — a one-word edit.
//
// Surface rule: exactly ONE red surface (PowerBid); the others charcoal/cream
// so red stays a spark, per the brand spec.

export const VALUE_PROPS = [
  {
    id: "powerbid",
    surface: "red",
    videoAspect: "portrait", // clip is 540x960 (9:16)
    coverFrame: "first",
    eyebrow: "PowerBid Approval",
    headline: "Make an offer that competes with cash.",
    body: "A verified approval up front, so sellers take you seriously. We do the underwriting work early, so you can shop with confidence.",
    bullets: null,
    ctaLabel: "Get PowerBid Approved",
    ctaHref: null, // TODO: Rate funnel URL, pending
    ctaExternal: true,
    videoUrl: "https://totalexpert.net/org_media/00124/00124-627ec8b162e66599014400627ec8b162e6a677700321.mp4",
    // White wordmark on the red surface. Natural aspect (~3.6:1), capped ~40px tall.
    mark: { src: "/powerbid_logo_white_transparent.svg", alt: "PowerBid Approval", w: 1426, h: 397 },
    disclosure: "PowerBid Approval assumes receipt of all required documentation, a re-review of financial condition and may be revoked at any time if there is a change impairing ability to repay and/or if any borrower information is inaccurate or incomplete. Applicant subject to credit and underwriting approval. Restrictions apply.",
    fullTermsHref: null,
    agentFacing: false,
  },
  {
    id: "same-day",
    surface: "charcoal",
    videoAspect: "square", // clip is 1080x1080 (1:1)
    coverFrame: "last",
    eyebrow: "Same Day Mortgage",
    headline: "An approval in a day, if you qualify.",
    body: "Get your documents in early and you can have a loan approval within one business day. Less waiting, more house hunting.",
    bullets: null,
    ctaLabel: "See if you qualify",
    ctaHref: null, // TODO: Rate funnel URL, pending
    ctaExternal: true,
    videoUrl: "https://totalexpert.net/org_media/00124/00124-6410ab5ca4dd49333276696410ab5ca4dda120250890.mp4",
    // Red+white badge on the charcoal surface. Near-square (~1:1), capped ~64px tall.
    mark: { src: "/same_day_mortgage_transparent_vector.svg", alt: "Same Day Mortgage", w: 1024, h: 979 },
    // OFFICIAL verbatim. nmlsconsumeraccess.org + rate.com/same-day-mortgage
    // auto-linkified by ValuePropModule. "8 hours" pending Rate confirmation.
    disclosure: "Equal Housing Lender. NMLS ID: 2611. (For licensing information, visit nmlsconsumeraccess.org) Guaranteed Rate's Same Day Mortgage (aka \"FastTrack\") promotion offers qualified customers who provide certain required financial information/documentation within 8 hours of locking a rate on a mortgage loan the opportunity to receive a loan approval within 1 business day of timely submission of documentation and does not suggest that the borrower will receive funding on the same day as their application submission. Guaranteed Rate cannot guarantee that a loan will be approved or that a closing will occur within a specific timeframe. Applicant subject to credit and underwriting approval. Restrictions apply. Visit rate.com/same-day-mortgage for terms and condition.",
    fullTermsHref: null,
    agentFacing: false,
  },
  {
    id: "agent-advantage",
    surface: "cream",
    // Probed: the clip is 1080x1350 (4:5 vertical), not square. Using a 4:5
    // container so it shows uncropped. Change here if Rate supplies a different cut.
    videoAspect: "portrait45",
    coverFrame: "first",
    eyebrow: "Agent Advantage",
    headline: "For real estate agents.",
    // INTERIM, claim-free copy pending Rate's approved Agent Advantage material.
    body: "Watch the quick overview of Agent Advantage, then head to Rate's agent hub to see how partnering works.",
    bullets: null,
    ctaLabel: "Explore Agent Advantage",
    ctaHref: "https://agents.rate.com/agents",
    ctaExternal: true,
    videoUrl: "https://rapid.totalexpert.net/org_media/00124/00124-6a0482bde8e735016502176a0482bde8e79334929488.mp4",
    mark: null, // RESERVED, pending Rate
    disclosure: null, // none on-page for now (video carries its own); confirm with Rate
    fullTermsHref: null,
    agentFacing: true,
  },
];
