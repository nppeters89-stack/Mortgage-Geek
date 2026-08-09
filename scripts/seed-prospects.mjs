// Seed the prospecting call queue into Redis via the app's own API.
//
// Excel stays the single source of truth for contact enrichment; this pushes a
// wholesale snapshot to prospects:list:v1 and NEVER touches the per-contact call
// logs, so re-seeding preserves everything already logged.
//
// The seed JSON is Nick's PII (do NOT commit it; it is gitignored). This script
// reads it from a local path passed on the command line and PUTs it to
// /api/prospects/list with the same GEEKLOG_KEY auth as the rest of Geek Log.
//
// Requires Node 18+ (global fetch). No dependencies.
//
// Usage:
//   GEEKLOG_KEY=... SEED_BASE_URL=https://<deployment> \
//     node scripts/seed-prospects.mjs ./prospects_seed.json
//
//   SEED_BASE_URL defaults to http://localhost:3000 for a local `vercel dev`.

import { readFile } from "node:fs/promises";

const filePath = process.argv[2];
const base = (process.env.SEED_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const key = process.env.GEEKLOG_KEY;

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

if (!filePath) fail("pass the seed JSON path, e.g. node scripts/seed-prospects.mjs ./prospects_seed.json");
if (!key) fail("set GEEKLOG_KEY in the environment");

let blob;
try {
  blob = JSON.parse(await readFile(filePath, "utf8"));
} catch (e) {
  fail(`could not read/parse ${filePath}: ${e.message}`);
}

if (!blob || typeof blob !== "object" || !Array.isArray(blob.prospects)) {
  fail("seed file must be an object with a `prospects` array");
}

console.log(`seeding ${blob.prospects.length} prospects to ${base}/api/prospects/list ...`);

let res;
try {
  res = await fetch(`${base}/api/prospects/list`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Geeklog-Key": key },
    body: JSON.stringify(blob),
  });
} catch (e) {
  fail(`request failed: ${e.message}`);
}

const text = await res.text();
if (!res.ok) fail(`server returned ${res.status}: ${text}`);
console.log(`done. ${text}`);
