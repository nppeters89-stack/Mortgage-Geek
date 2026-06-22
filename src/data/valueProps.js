// Homepage sales-body value-prop modules — DATA-DRIVEN and ASSET-INDEPENDENT.
//
// Everything gated on Rate is reserved here so it slots in later as a config
// edit, not a rebuild:
//   ctaHref   -> the approved Rate funnel URL (TODO, pending)
//   videoUrl  -> the approved clip for that module (TODO). Until then, the two
//                borrower modules use a confirmed Total Expert stand-in for
//                wiring/testing; Agent Advantage's video stays reserved (null).
//   mark      -> the official Rate product mark/lockup (RESERVED, null for now)
//   disclosure-> reserved fine print (RESERVED), except the Same Day DRAFT below
//                which is included and flagged pending Rate confirmation.
//
// Surface rule: at most ONE red surface (PowerBid). The others stay
// charcoal/cream so red remains a spark, per the brand spec.

// TODO: temporary stand-in clip for wiring/testing only. Replace per module
// with the approved PowerBid / Same Day clips when provided.
const STANDIN_VIDEO = "https://rapid.totalexpert.net/org_media/00124/00124-6a0482bde8e735016502176a0482bde8e79334929488.mp4";

export const VALUE_PROPS = [
  {
    id: "powerbid",
    surface: "red",
    eyebrow: "PowerBid Approval",
    headline: "Make an offer that competes with cash.",
    body: "A verified approval up front, so sellers take you seriously. We do the underwriting work early, so you can shop with confidence.",
    bullets: null,
    ctaLabel: "Get PowerBid Approved",
    ctaHref: null, // TODO: Rate funnel URL, pending
    videoUrl: STANDIN_VIDEO, // TODO: approved PowerBid clip
    videoPoster: null,
    mark: null, // RESERVED: official Rate PowerBid Approval mark, pending Rate
    disclosure: null, // RESERVED, pending Rate
    disclosurePending: false,
    fullTermsHref: null,
    agentFacing: false,
  },
  {
    id: "same-day",
    surface: "charcoal",
    eyebrow: "Same Day Mortgage",
    headline: "An approval in a day, if you qualify.",
    body: "Get your documents in early and you can have a loan approval within one business day. Less waiting, more house hunting.",
    bullets: null,
    ctaLabel: "See if you qualify",
    ctaHref: null, // TODO: Rate funnel URL, pending
    videoUrl: STANDIN_VIDEO, // TODO: approved Same Day clip
    videoPoster: null,
    mark: null, // RESERVED: official Rate Same Day Mortgage mark, pending Rate
    // DRAFT short-form disclosure — pending Rate confirmation. Do not treat as final.
    disclosure: "Same Day Mortgage offers qualified customers who provide required documentation within 24 hours of locking a rate the opportunity to receive a loan approval within 1 business day, and does not suggest funding on the same day. Rate cannot guarantee approval or a closing within a specific timeframe. Applicant subject to credit and underwriting approval. Restrictions apply. Equal Housing Lender. NMLS #2611.",
    disclosurePending: true,
    fullTermsHref: null, // TODO: full terms URL
    agentFacing: false,
  },
  {
    id: "agent-advantage",
    surface: "cream",
    eyebrow: "Agent Advantage",
    // SAFE PLACEHOLDER ONLY. Real headline/body/claims come from Rate's
    // approved Agent Advantage material — do not invent specifics.
    headline: "For real estate agents: ask about Agent Advantage.",
    body: null,
    bullets: null,
    ctaLabel: "For agents",
    ctaHref: null, // TODO: Rate funnel URL, pending
    videoUrl: null, // RESERVED, pending Rate
    videoPoster: null,
    mark: null, // RESERVED, pending Rate
    disclosure: null, // RESERVED, pending Rate
    disclosurePending: false,
    fullTermsHref: null,
    agentFacing: true,
  },
];
