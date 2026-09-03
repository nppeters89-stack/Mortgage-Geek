// Pipeline configs: the agent pipeline (a lift of the shipped constants with
// zero value changes) and the consumer lead pipeline. Engine functions take a
// config and default to AGENT_PIPELINE, so agent call sites behave exactly as
// before. This file imports nothing from prospectsModel; the model imports
// from here and re-exports the legacy constant names.

export const AGENT_PIPELINE = {
  id: "agent",
  ns: "prospects",
  stages: [
    { id: "new", label: "New" },
    { id: "intro", label: "Intro Follow Up" },
    { id: "value_social", label: "Value Add & Social" },
    { id: "value_add", label: "Value Add" },
    { id: "check_in", label: "Check In" },
    { id: "maintenance", label: "Motivation Identified / Maintenance" },
    { id: "soi", label: "SOI" },
  ],
  // Same values the cadence retune shipped: index 6 (SOI) deliberately absent
  // so it falls through to the fallback for badge counts.
  dueDays: [1, 8, 7, 14, 21, 30],
  whaleDueDays: [3, 7, 14, 30, 30, 30, 30],
  fallbackDueDays: 7,
  chips: "agent",
  templates: "agent",
};

export const LEAD_PIPELINE = {
  id: "lead",
  ns: "leads",
  stages: [
    { id: "new", label: "New" },
    { id: "attempting", label: "Attempting" },
    { id: "conversation", label: "Conversation" },
    { id: "prequal", label: "Prequal" },
    { id: "app_started", label: "App Started" },
    { id: "app_complete", label: "App Complete" },
  ],
  // Attempting (index 1) derives its clock from the attempt count via
  // attemptOffsets; app_complete is terminal for the linear board and hands
  // off to the status tracks.
  dueDays: [0, null, 2, 3, 2, null],
  // Gap in days after the nth attempt: call now, next day, next day, two
  // days, three days. After attemptCap attempts with no conversation logged
  // the lead derives to the nurture track.
  attemptOffsets: [0, 1, 1, 2, 3],
  attemptCap: 5,
  tracks: [
    { id: "preapproved", label: "Pre-Approved", dueDays: 14 },
    { id: "not_yet", label: "Not Yet", dueDays: 30 },
    { id: "nurture", label: "Nurture", dueDays: 30 },
    { id: "under_contract", label: "Under Contract", dueDays: null },
    { id: "closed", label: "Closed", dueDays: null },
    { id: "dead", label: "Dead", dueDays: null },
  ],
  nurtureDeadMonths: 12,
  fallbackDueDays: 7,
  chips: "lead",
  templates: "lead",
  // Mode declaration read by the components: what the lead surface shows.
  // Behavior lives here, not in component conditionals.
  mode: {
    rails: ["due", "attempting", "owed", "referrers"],
    statStrip: ["Received", "Contacted", "Conversation", "Application", "Pre-Approved", "Under Contract", "Closed"],
    chips: { objections: "lead", timeline: true },
    templates: "lead",
    quickActions: ["attempt", "text", "reply"],
    entryForm: ["name", "phone", "email", "referredBy", "sourceNote"],
  },
};

export const TRACK_IDS = LEAD_PIPELINE.tracks.map((t) => t.id);
export const trackOf = (id) => LEAD_PIPELINE.tracks.find((t) => t.id === id) || null;
