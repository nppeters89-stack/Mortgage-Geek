// Homepage sales-body value-prop modules — DATA-DRIVEN and ASSET-INDEPENDENT.
//
// Gated bits stay reserved so they slot in via config, not a rebuild:
//   ctaHref -> approved Rate funnel URL (TODO, pending)
//   mark    -> official Rate product mark/lockup (RESERVED, null for now)
//   Agent Advantage video/copy -> pending Rate (videoUrl null, placeholder copy)
//
// Disclosures below are the OFFICIAL verbatim fine print. NOTE: the Same Day
// "8 hours" figure is pending Rate confirmation vs the 24h full T&C — if they
// say 24, it's a one-word edit to the string below.
//
// Surface rule: exactly ONE red surface (PowerBid); the others charcoal/cream
// so red stays a spark, per the brand spec.

export const VALUE_PROPS = [
  {
    id: "powerbid",
    surface: "red",
    videoAspect: "portrait",
    eyebrow: "PowerBid Approval",
    headline: "Make an offer that competes with cash.",
    body: "A verified approval up front, so sellers take you seriously. We do the underwriting work early, so you can shop with confidence.",
    bullets: null,
    ctaLabel: "Get PowerBid Approved",
    ctaHref: null, // TODO: Rate funnel URL, pending
    videoUrl: "https://totalexpert.net/org_media/00124/00124-627ec8b162e66599014400627ec8b162e6a677700321.mp4",
    mark: null, // RESERVED: official Rate PowerBid Approval mark, pending Rate
    disclosure: "PowerBid Approval assumes receipt of all required documentation, a re-review of financial condition and may be revoked at any time if there is a change impairing ability to repay and/or if any borrower information is inaccurate or incomplete. Applicant subject to credit and underwriting approval. Restrictions apply.",
    fullTermsHref: null,
    agentFacing: false,
  },
  {
    id: "same-day",
    surface: "charcoal",
    videoAspect: "square",
    eyebrow: "Same Day Mortgage",
    headline: "An approval in a day, if you qualify.",
    body: "Get your documents in early and you can have a loan approval within one business day. Less waiting, more house hunting.",
    bullets: null,
    ctaLabel: "See if you qualify",
    ctaHref: null, // TODO: Rate funnel URL, pending
    videoUrl: "https://totalexpert.net/org_media/00124/00124-6410ab5ca4dd49333276696410ab5ca4dda120250890.mp4",
    mark: null, // RESERVED: official Rate Same Day Mortgage mark, pending Rate
    // OFFICIAL verbatim. nmlsconsumeraccess.org and rate.com/same-day-mortgage
    // are auto-linkified by ValuePropModule. "8 hours" pending Rate confirmation.
    disclosure: "Equal Housing Lender. NMLS ID: 2611. (For licensing information, visit nmlsconsumeraccess.org) Guaranteed Rate's Same Day Mortgage (aka \"FastTrack\") promotion offers qualified customers who provide certain required financial information/documentation within 8 hours of locking a rate on a mortgage loan the opportunity to receive a loan approval within 1 business day of timely submission of documentation and does not suggest that the borrower will receive funding on the same day as their application submission. Guaranteed Rate cannot guarantee that a loan will be approved or that a closing will occur within a specific timeframe. Applicant subject to credit and underwriting approval. Restrictions apply. Visit rate.com/same-day-mortgage for terms and condition.",
    fullTermsHref: null,
    agentFacing: false,
  },
  {
    id: "agent-advantage",
    surface: "cream",
    videoAspect: "square",
    eyebrow: "Agent Advantage",
    // SAFE PLACEHOLDER ONLY. Real headline/body/claims come from Rate's approved
    // Agent Advantage material — do not invent specifics.
    headline: "For real estate agents: ask about Agent Advantage.",
    body: null,
    bullets: null,
    ctaLabel: "For agents",
    ctaHref: null, // TODO: Rate funnel URL, pending
    videoUrl: null, // RESERVED, pending Rate — module renders with no video slot
    mark: null, // RESERVED, pending Rate
    disclosure: null, // RESERVED, pending Rate
    fullTermsHref: null,
    agentFacing: true,
  },
];
