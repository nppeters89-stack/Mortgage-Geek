// Thin fetch wrapper around the /api/geeklog/* endpoints (G1). Every
// exported function takes the URL key as the first argument and sends
// it as the X-Geeklog-Key header. This module never reads, stores, or
// caches the key — callers own it.

const BASE = "/api/geeklog";

async function request(key, path, init = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        "X-Geeklog-Key": key,
      },
    });
  } catch {
    throw new Error("Network error");
  }
  if (res.status === 401) throw new Error("Unauthorized");
  // 204 No Content responses have no body — short-circuit before parse.
  if (res.status === 204) return null;
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.status >= 400) {
    if (res.status === 400 && body?.error) throw new Error(body.error);
    throw new Error(`Request failed: ${res.status}`);
  }
  return body;
}

// GET /api/geeklog/entry?date=YYYY-MM-DD
// Server returns 200 with JSON `null` when the entry doesn't exist.
// Defensive: 404 also resolves to null.
export async function fetchEntry(key, dateISO) {
  try {
    const data = await request(key, `/entry?date=${encodeURIComponent(dateISO)}`);
    return data ?? null;
  } catch (err) {
    if (err.message === "Request failed: 404") return null;
    throw err;
  }
}

// POST /api/geeklog/entry — server upserts, returns saved EntryRecord
// with createdAt/updatedAt populated.
export async function saveEntry(key, entryRecord) {
  return request(key, `/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entryRecord),
  });
}

// GET /api/geeklog/year?year=YYYY — used as the auth probe on page
// load and as the source of aggregate stats.
export async function fetchYearStats(key, year) {
  return request(key, `/year?year=${encodeURIComponent(year)}`);
}
