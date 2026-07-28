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

// GET /api/geeklog/entry?year=YYYY — returns the per-date map
// { "YYYY-MM-DD": EntryRecord, ... }. Empty year → {}.
export async function fetchAllEntries(key, year) {
  const data = await request(key, `/entry?year=${encodeURIComponent(year)}`);
  return data || {};
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

// GET /api/geeklog/closing?year=YYYY — returns the per-date map
// { "YYYY-MM-DD": [closingRecord, ...] }. Empty year → {}.
export async function fetchClosings(key, year) {
  const data = await request(key, `/closing?year=${encodeURIComponent(year)}`);
  return data || {};
}

// POST /api/geeklog/closing — appends to that date's array. Server
// returns the new full array for the date.
export async function saveClosing(key, closingRecord) {
  return request(key, `/closing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(closingRecord),
  });
}

// DELETE /api/geeklog/closing — body { date, index }. Server returns
// the updated array (empty array if the last closing was removed).
export async function deleteClosing(key, dateISO, index) {
  return request(key, `/closing`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: dateISO, index }),
  });
}

// ---- Geek Log 2.0 activity tracker (G1 Phase 1 endpoints) ----

// GET /api/geeklog/activity?date=YYYY-MM-DD (optional; default today Central).
// Returns { weekStart, days: [{ date, ...seven counters }] x7, weeklyTarget }.
export async function fetchWeek(key, dateISO) {
  const q = dateISO ? `?date=${encodeURIComponent(dateISO)}` : "";
  return request(key, `/activity${q}`);
}

// POST /api/geeklog/activity — upsert one day; body = { date, ...seven counters }.
// Server enforces the current-week write window and returns the stored document.
export async function saveDay(key, dayDoc) {
  return request(key, `/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dayDoc),
  });
}

// Fire-and-forget upsert of one day with keepalive: true, so the write survives
// the page being backgrounded or unloaded (the phone locked right after a tap).
// sendBeacon cannot set custom headers, but a keepalive fetch can, so the
// X-Geeklog-Key auth header rides along. Same endpoint and body as saveDay; the
// server upsert makes a duplicate write harmless. The caller cannot await during
// unload, and the load-time reconcile is the backstop if this never lands.
export function saveDayKeepalive(key, dayDoc) {
  try {
    fetch(`${BASE}/activity`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        "X-Geeklog-Key": key,
      },
      body: JSON.stringify(dayDoc),
    });
  } catch {
    /* best-effort; reconcile on next load recovers a lost write */
  }
}

// GET /api/geeklog/activity?year=YYYY — YTD weekly totals. Returns
// { year, weeks: [{ weekStart, ...seven counter totals }] } from the first week
// with data through the current Central week (zero-filled gaps).
export async function fetchYear(key, year) {
  return request(key, `/activity?year=${encodeURIComponent(year)}`);
}

// GET /api/geeklog/activity?scope=stats — reward-layer read. Returns
// { todayKey, bestDay: {date, count}, currentStreak, streakBase, lastWeek }.
export async function fetchStats(key) {
  return request(key, `/activity?scope=stats`);
}

// GET /api/geeklog/settings — { weeklyTarget } (defaults to 50 when unset).
export async function fetchSettings(key) {
  return request(key, `/settings`);
}

// POST /api/geeklog/settings — { weeklyTarget }.
export async function saveSettings(key, weeklyTarget) {
  return request(key, `/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weeklyTarget }),
  });
}
