// /api/geeklog/settings — the activity tracker's settings singleton.
//   GET  -> { weeklyTarget }  (defaults to 50 when unset)
//   POST { weeklyTarget } -> validate (positive integer, <= 500), store, return.
// One Redis STRING key: geeklog:settings. Reuses the shared auth + client.

import { authorize, redis, requireKey, jsonResponse, parseStored } from "./_redis.js";
import { SETTINGS_KEY, DEFAULT_WEEKLY_TARGET, validateWeeklyTarget } from "./_activity.js";

export default async function handler(req, res) {
  const auth = authorize(req, res, { exportRead: true });
  if (!auth.ok) return jsonResponse(res, auth.status, { error: auth.status === 403 ? "Forbidden" : "Unauthorized" });

  try {
    if (req.method === "GET") {
      const settings = parseStored(await redis.get(SETTINGS_KEY));
      const weeklyTarget = Number.isInteger(settings?.weeklyTarget) ? settings.weeklyTarget : DEFAULT_WEEKLY_TARGET;
      return jsonResponse(res, 200, { weeklyTarget });
    }

    if (req.method === "POST") {
      const body = req.body;
      const err = validateWeeklyTarget(body?.weeklyTarget);
      if (err) return jsonResponse(res, 400, { error: err });
      const settings = { weeklyTarget: body.weeklyTarget };
      await redis.set(SETTINGS_KEY, JSON.stringify(settings));
      return jsonResponse(res, 200, settings);
    }

    res.setHeader("Allow", "GET, POST");
    return jsonResponse(res, 405, { error: "Method Not Allowed" });
  } catch (err) {
    console.error("[geeklog/settings] error:", err);
    return jsonResponse(res, 500, { error: "Internal Server Error" });
  }
}
