// Chip id vocabularies, mirrored by hand from
// src/components/geeklog/prospecting/chips.js, the same arrangement as
// STREAK_FLOOR in ../geeklog/_activity.js. Ids only: labels live client-side
// and can change freely; a new id must land in both files.
export const OBJECTION_IDS = new Set(["no_volume", "send_info", "call_back", "not_now", "not_interested"]);
export const LENDER_SITUATION_IDS = new Set(["loyal", "uses_few", "unhappy", "none"]);
export const NEED_IDS = new Set(["shaky_preapprovals", "gov_manual", "speed", "ftb_volume", "marketing"]);

// Lead pipeline vocabularies (mirrored from chips.js the same way).
export const LEAD_OBJECTION_IDS = new Set(["working_with_lender", "just_looking", "credit", "needs_to_sell", "went_quiet"]);
export const LEAD_TIMELINE_IDS = new Set(["now", "soon", "later"]);
export const LEAD_TRACK_IDS = new Set(["preapproved", "not_yet", "nurture", "under_contract", "closed", "dead"]);
export const LEAD_ACCOUNT_TYPES = new Set(["team", "builder", "agent"]);
