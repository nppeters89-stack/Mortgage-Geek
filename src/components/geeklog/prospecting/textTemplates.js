// Prefilled text-message templates for the Text button. Placeholder copy:
// Nick owns the words and will rewrite these. Placeholders: {first} is the
// contact's first name, {link} is SITE_URL, {hook} stays empty until the hook
// field exists and collapses cleanly when blank. No rate figures, no program
// names, no claims; each template stays under 300 characters.

export const SITE_URL = "https://mortgagegeek.ai";

// All three are just the greeting: Nick's templates change all the time, so
// he pastes the body in Messages after the prefill. The three exports stay
// separate so stage-specific copy can return later without rewiring.
export const firstContact = "Hey {first}, ";
export const pipeline = "Hey {first}, ";
export const maintenance = "Hey {first}, ";

// Which template a card gets, from its stage. The Prospecting tab always
// takes firstContact; cold always takes maintenance. Whale value-add columns
// map through the same indexes.
export function templateForStage(stageIndex, { prospectingTab = false, cold = false } = {}) {
  if (prospectingTab || stageIndex === 0) return firstContact;
  if (cold || stageIndex >= 5) return maintenance;
  return pipeline;
}

// Fill placeholders and tidy whatever an empty {hook} leaves behind: doubled
// spaces, a space before punctuation, or repeated punctuation.
export function fill(template, contact = {}) {
  const first = String(contact.name || "").trim().split(/\s+/)[0] || "there";
  let out = String(template || "")
    .replaceAll("{first}", first)
    .replaceAll("{link}", SITE_URL)
    .replaceAll("{hook}", String(contact.hook || "").trim());
  out = out
    .replace(/ {2,}/g, " ")
    .replace(/ ([,.!?])/g, "$1")
    .replace(/([,.!?])\1+/g, "$1")
    .replace(/^[ ]+|[ ]+$/gm, "");
  return out.trim();
}
