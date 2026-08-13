// Clipboard write, extracted so the Prospecting copy actions and the contact
// detail's Excel row can share one implementation. Returns a promise; each caller
// owns its own toast wording.

export function copyText(text) {
  if (!text) return Promise.reject(new Error("nothing to copy"));
  if (!navigator.clipboard?.writeText) return Promise.reject(new Error("clipboard unavailable"));
  return navigator.clipboard.writeText(text);
}
