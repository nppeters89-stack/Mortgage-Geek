// Pure-function transform: raw entries + closings + year stats →
// the data shape SnapshotCard renders. No fetches, no Date.now, no
// side effects. The `today` input handles all date awareness so tests
// (and future history-viewing) can pass any date in.

const METRIC_FIELDS = ["applications", "prospecting", "appointments", "contentShipped"];

function partsFromISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

// Day-of-year (1-based) for an ISO date, computed in UTC to avoid
// timezone drift. The caller decided the date already.
function dayOfYear(iso) {
  const { y, m, d } = partsFromISO(iso);
  const jan1 = Date.UTC(y, 0, 1);
  const dt = Date.UTC(y, m - 1, d);
  return Math.round((dt - jan1) / 86400000) + 1;
}

// "2026-05-21" + (-3) → "2026-05-18". Crosses year boundaries
// correctly via Date(Date.UTC(...)) normalization.
function addDaysISO(iso, days) {
  const { y, m, d } = partsFromISO(iso);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function buildMetric(entriesByDate, today, field) {
  const todayValue = entriesByDate[today]?.[field] ?? 0;

  // 7-day window, oldest → today. Last 7 days inclusive of today.
  const weekBars = [];
  for (let offset = 6; offset >= 0; offset--) {
    const iso = addDaysISO(today, -offset);
    const v = entriesByDate[iso]?.[field];
    weekBars.push(typeof v === "number" ? v : 0);
  }

  // YTD: sum of `field` across every entry in the current year's map.
  // fetchAllEntries scopes to a single year so a flat sum is correct.
  const yearStr = today.slice(0, 4);
  let ytd = 0;
  for (const [iso, entry] of Object.entries(entriesByDate)) {
    if (iso.startsWith(yearStr) && entry && typeof entry[field] === "number") {
      ytd += entry[field];
    }
  }

  return { today: todayValue, ytd, weekBars };
}

export function buildSnapshotData({ entriesByDate = {}, closingsByDate = {}, yearStats = null, today }) {
  // Total closings YTD — count from the closings map directly so the
  // result stays correct if yearStats is stale or absent.
  let closings = 0;
  for (const arr of Object.values(closingsByDate)) {
    if (Array.isArray(arr)) closings += arr.length;
  }

  const goalTarget = yearStats?.goal?.target ?? 100;
  const headline = entriesByDate[today]?.headline ?? "";

  const data = {
    day: dayOfYear(today),
    dateISO: today,
    closings,
    goalTarget,
    headline,
  };
  for (const field of METRIC_FIELDS) {
    data[field] = buildMetric(entriesByDate, today, field);
  }
  return data;
}
