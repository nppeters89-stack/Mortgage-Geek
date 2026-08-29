// Named-export seed + charset helpers for Geek Log Instagram handles.
// Leading underscore so Vercel does not count this as a Serverless Function
// (Hobby cap is 12; every file under api/ is a function unless private).
//
// Seed is exact display name -> handle with no @. GET applies these with
// HSETNX so a user-typed handle is never overwritten. Names only: never
// store phone numbers here.

export const INSTAGRAM_SEED = Object.freeze({
  "Jordyn Hollingsworth": "_jordynhollingsworth",
  "Linda Carter": "lindacarterhomes",
  "Sarah Butler": "sarahknowsnashville",
  "Darya Drugman": "daryarealtor",
  "Felicia Farnsworth Long": "ownnash_com",
  "Jon Sexton": "nashvillehomeagents",
  "Jonathan Harmon": "jharmonhometeam",
  "Jeff Lucas": "thelucasgrouptn",
  "Elijah Comas Montgomery": "comasmontgomeryauctionco",
});

// Instagram usernames: letters, numbers, periods, underscores. Empty is a
// clear, not a valid handle. Leading @ is stripped before this runs.
export const INSTAGRAM_HANDLE_RE = /^[A-Za-z0-9._]+$/;

export function normalizeInstagramHandle(raw) {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/^@+/, "").slice(0, 30);
}

const digits = (v) => String(v || "").replace(/\D/g, "");

// For each seed-list prospect whose name matches INSTAGRAM_SEED exactly and
// whose id has no stored handle yet, HSETNX the verified handle. Mutates
// `instagram` (id -> handle) so the GET payload includes what just landed.
export async function seedInstagramHandles(redis, key, prospects, instagram) {
  const pending = [];
  for (const p of prospects || []) {
    const handle = INSTAGRAM_SEED[p?.name];
    if (!handle) continue;
    const id = digits(p.phone);
    if (!id || instagram[id]) continue;
    pending.push({ id, handle });
  }
  if (!pending.length) return;
  const results = await Promise.all(pending.map(({ id, handle }) => redis.hsetnx(key, id, handle)));
  pending.forEach(({ id, handle }, i) => {
    if (results[i]) instagram[id] = handle;
  });
}
