// Chip vocabularies for structured call and contact data. Ids are stable
// snake_case strings that persist to Redis; labels are display text Nick can
// rename freely without touching stored data.

// Facts about one call: multi-select, stored on the touch or call-log record.
export const OBJECTIONS = [
  { id: "no_volume", label: "No volume right now" },
  { id: "send_info", label: "Send me info" },
  { id: "call_back", label: "Call back later" },
  { id: "not_now", label: "Bad timing" },
  { id: "not_interested", label: "Not interested" },
];

// Nick's current understanding of the contact: single-select, overwritten as
// understanding improves.
export const LENDER_SITUATION = [
  { id: "loyal", label: "Loyal to one" },
  { id: "uses_few", label: "Uses a few" },
  { id: "unhappy", label: "Unhappy" },
  { id: "none", label: "No go-to" },
];

// Contact needs: multi-select, contact record.
export const NEEDS = [
  { id: "shaky_preapprovals", label: "Shaky pre-approvals" },
  { id: "gov_manual", label: "FHA/VA/manual files" },
  { id: "speed", label: "Speed to close" },
  { id: "ftb_volume", label: "First-time buyer volume" },
  { id: "marketing", label: "Marketing help" },
];

export const OBJECTION_IDS = OBJECTIONS.map((c) => c.id);
export const LENDER_SITUATION_IDS = LENDER_SITUATION.map((c) => c.id);
export const NEED_IDS = NEEDS.map((c) => c.id);

export const objectionLabel = (id) => (OBJECTIONS.find((c) => c.id === id) || {}).label || id;
export const lenderLabel = (id) => (LENDER_SITUATION.find((c) => c.id === id) || {}).label || id;
export const needLabel = (id) => (NEEDS.find((c) => c.id === id) || {}).label || id;
