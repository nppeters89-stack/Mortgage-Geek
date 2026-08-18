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

// POST /api/geeklog/activity?correction=1 — a backdated correction. Same body
// as saveDay (a full day document), but the server accepts any in-year date
// from the tracking epoch through today, not just the current week. Used only
// by the correction form in Settings.
export async function saveDayCorrection(key, dayDoc) {
  return request(key, `/activity?correction=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dayDoc),
  });
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

// ---- Prospecting (Geek Log tab) ----
// These endpoints live under /api/prospects (not /api/geeklog), so they use
// their own fetches rather than request(). Same X-Geeklog-Key auth. Contact data
// is returned only to an authorized client and is never cached in this module.

async function prospectsFetch(key, path, init = {}) {
  let res;
  try {
    res = await fetch(`/api/prospects${path}`, {
      ...init,
      headers: { ...(init.headers || {}), "X-Geeklog-Key": key },
    });
  } catch {
    throw new Error("Network error");
  }
  if (res.status === 401) throw new Error("Unauthorized");
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  if (res.status >= 400) throw new Error(body?.error || `Request failed: ${res.status}`);
  return body;
}

// GET /api/prospects — { list, logs, followUps, soi, pinned, manual, rac }. list
// = seed blob; everything else is keyed by phone id (pinned and rac are plain id
// arrays).
export async function fetchProspects(key) {
  const data = await prospectsFetch(key, "");
  return data || { list: { prospects: [] }, logs: {}, followUps: {}, soi: {}, pinned: [], manual: {}, rac: [] };
}

// PUT /api/prospects/log — upsert one contact's log. Awaited write.
export async function saveProspectLog(key, id, log) {
  return prospectsFetch(key, "/log", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, log }),
  });
}

// Fire-and-forget keepalive PUT so the log survives the phone locking right
// after Save (same idiom as saveDayKeepalive). Small payload; a duplicate write
// on the load-time reconcile is harmless (last write wins).
export function saveProspectLogKeepalive(key, id, log) {
  try {
    fetch(`/api/prospects/log`, {
      method: "PUT",
      keepalive: true,
      headers: { "Content-Type": "application/json", "X-Geeklog-Key": key },
      body: JSON.stringify({ id, log }),
    });
  } catch {
    /* best-effort; reconcile on next load recovers a lost write */
  }
}

// PUT /api/prospects/fu — upsert one contact's follow-up touch history (the full
// array). Awaited write.
export async function saveFollowUps(key, id, touches) {
  return prospectsFetch(key, "/fu", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, touches }),
  });
}

// Fire-and-forget keepalive variant, same durability idiom as the call log.
export function saveFollowUpsKeepalive(key, id, touches) {
  try {
    fetch(`/api/prospects/fu`, {
      method: "PUT",
      keepalive: true,
      headers: { "Content-Type": "application/json", "X-Geeklog-Key": key },
      body: JSON.stringify({ id, touches }),
    });
  } catch {
    /* best-effort; reconcile on next load recovers a lost write */
  }
}

// ----- Membership writes -----
//
// SOI, pinning, and manual contact creation all go to one endpoint,
// /api/prospects/membership, discriminated by `kind`. They were three routes
// until api/ hit Vercel's 12-function Hobby cap; they are one concern anyway
// (which list a contact belongs to). The call signatures below are unchanged, so
// nothing above this layer knows or cares.

// prospectsFetch adds the auth header; this is just the PUT shape.
const membershipBody = (body) => ({
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Fire-and-forget keepalive PUT so a membership change survives the phone
// locking on the way back to the queue. Paired with the awaited call, which is
// the one that reports failure.
function membershipKeepalive(key, body) {
  try {
    fetch(`/api/prospects/membership`, {
      method: "PUT",
      keepalive: true,
      headers: { "Content-Type": "application/json", "X-Geeklog-Key": key },
      body: JSON.stringify(body),
    });
  } catch {
    /* best-effort; the next load reads server truth */
  }
}

// Promote one contact into the sphere of influence ("add") or take them back out
// ("remove"). Awaited so the caller can revert its optimistic update.
export async function saveSoi(key, id, action) {
  return prospectsFetch(key, "/membership", membershipBody({ kind: "soi", id, action }));
}

export function saveSoiKeepalive(key, id, action) {
  membershipKeepalive(key, { kind: "soi", id, action });
}

// Manually place a contact in Follow Ups ("add") or take them out ("remove").
export async function savePin(key, id, action) {
  return prospectsFetch(key, "/membership", membershipBody({ kind: "pin", id, action }));
}

export function savePinKeepalive(key, id, action) {
  membershipKeepalive(key, { kind: "pin", id, action });
}

// Mark a contact as copied into the RAC CRM ("add") or clear the mark
// ("remove"). Awaited so the caller can revert its optimistic update.
export async function saveRac(key, id, action) {
  return prospectsFetch(key, "/membership", membershipBody({ kind: "rac", id, action }));
}

export function saveRacKeepalive(key, id, action) {
  membershipKeepalive(key, { kind: "rac", id, action });
}

// Move a contact to the cold pipeline ("add") or take them out ("remove"). The
// cold column position is derived from check-in touches, never sent here.
export async function saveCold(key, id, action) {
  return prospectsFetch(key, "/membership", membershipBody({ kind: "cold", id, action }));
}

export function saveColdKeepalive(key, id, action) {
  membershipKeepalive(key, { kind: "cold", id, action });
}

// Mark a contact dead ("add") or restore them ("remove"). The handler enforces
// the supersede rule server-side: add clears cold, remove lands them in cold.
export async function saveDead(key, id, action) {
  return prospectsFetch(key, "/membership", membershipBody({ kind: "dead", id, action }));
}

export function saveDeadKeepalive(key, id, action) {
  membershipKeepalive(key, { kind: "dead", id, action });
}

// Create a contact that did not come from Excel. The handler pins it too. Awaited
// only: this one creates a record, so the caller must see a 409 (duplicate) or a
// validation error rather than fire and forget.
export async function saveManualContact(key, contact) {
  return prospectsFetch(key, "/membership", membershipBody({ kind: "manual", contact }));
}
