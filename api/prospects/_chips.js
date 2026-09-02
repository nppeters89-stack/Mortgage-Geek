// Chip id vocabularies, mirrored by hand from
// src/components/geeklog/prospecting/chips.js, the same arrangement as
// STREAK_FLOOR in ../geeklog/_activity.js. Ids only: labels live client-side
// and can change freely; a new id must land in both files.
export const OBJECTION_IDS = new Set(["no_volume", "send_info", "call_back", "not_now", "not_interested"]);
export const LENDER_SITUATION_IDS = new Set(["loyal", "uses_few", "unhappy", "none"]);
export const NEED_IDS = new Set(["shaky_preapprovals", "gov_manual", "speed", "ftb_volume", "marketing"]);
