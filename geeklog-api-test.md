# Geek Log API — Manual curl Test Suite (G1)

Verifies the three serverless endpoints behind `/api/geeklog/*` on the
deployed Vercel app. Run after each deploy that touches the API layer.

Substitute `$KEY` with the actual `GEEKLOG_KEY` value before running.
`$BASE` should be the deployment URL (e.g. `https://mortgagegeek.ai`).

```sh
export BASE=https://mortgagegeek.ai
export KEY=...           # paste GEEKLOG_KEY here, then `set +o history` if you care
```

`today` in the examples below is whatever today's ISO date is in
America/Chicago (e.g. `2026-05-21`). The `daysIntoYear` value the year
endpoint returns will match.

---

## Auth

### 1. No header → 401

```sh
curl -i "$BASE/api/geeklog/year?year=2026"
```
Expect: `HTTP/2 401`, body `{"error":"Unauthorized"}`.

### 2. Wrong header → 401

```sh
curl -i -H "X-Geeklog-Key: wrong-value" "$BASE/api/geeklog/year?year=2026"
```
Expect: `HTTP/2 401`, body `{"error":"Unauthorized"}`.

### 3. Correct header → 200

```sh
curl -i -H "X-Geeklog-Key: $KEY" "$BASE/api/geeklog/year?year=2026"
```
Expect: `HTTP/2 200`, JSON body with `year`, `goal`, `closingsCount`,
`entriesCount`, `daysIntoYear` fields.

---

## Goal

### 4. Set 2026 goal to 100

```sh
curl -i -X POST "$BASE/api/geeklog/year?year=2026" \
  -H "X-Geeklog-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{"target":100}'
```
Expect: `HTTP/2 200`, body `{"target":100,"year":2026}`.

### 5. Get 2026 year stats (clean state)

```sh
curl -s -H "X-Geeklog-Key: $KEY" "$BASE/api/geeklog/year?year=2026" | jq
```
Expect (before any entries / closings):
```json
{ "year": 2026, "goal": { "target": 100, "year": 2026 }, "closingsCount": 0, "entriesCount": 0, "daysIntoYear": <today> }
```

---

## Entries

### 6. POST an entry for today

```sh
curl -i -X POST "$BASE/api/geeklog/entry" \
  -H "X-Geeklog-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-05-21",
    "applications":2,
    "prospecting":14,
    "appointments":3,
    "contentShipped":1,
    "headline":"Curl smoke test"
  }'
```
Expect: `HTTP/2 201`, body echoes the record plus `createdAt`/`updatedAt`
unix-ms timestamps.

### 7. GET the entry by date

```sh
curl -s -H "X-Geeklog-Key: $KEY" "$BASE/api/geeklog/entry?date=2026-05-21" | jq
```
Expect: the same record from #6.

### 8. GET all entries for 2026

```sh
curl -s -H "X-Geeklog-Key: $KEY" "$BASE/api/geeklog/entry?year=2026" | jq
```
Expect: `{ "2026-05-21": { ...record } }` (single-field map).

---

## Closings

### 9. POST a closing for today

```sh
curl -i -X POST "$BASE/api/geeklog/closing" \
  -H "X-Geeklog-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-05-21",
    "borrower":"Smith",
    "loanType":"FHA",
    "note":"curl smoke test"
  }'
```
Expect: `HTTP/2 201`, body is an array with one ClosingRecord.

### 10. GET all closings for 2026

```sh
curl -s -H "X-Geeklog-Key: $KEY" "$BASE/api/geeklog/closing?year=2026" | jq
```
Expect: `{ "2026-05-21": [ { ...closing } ] }`.

---

## Aggregate again

### 11. GET year stats with entry + closing in place

```sh
curl -s -H "X-Geeklog-Key: $KEY" "$BASE/api/geeklog/year?year=2026" | jq
```
Expect: `closingsCount: 1`, `entriesCount: 1`.

---

## Cleanup

### 12. DELETE the entry

```sh
curl -i -X DELETE "$BASE/api/geeklog/entry?date=2026-05-21" \
  -H "X-Geeklog-Key: $KEY"
```
Expect: `HTTP/2 204`, no body.

### 13. DELETE the closing (date + index 0)

```sh
curl -i -X DELETE "$BASE/api/geeklog/closing" \
  -H "X-Geeklog-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-05-21","index":0}'
```
Expect: `HTTP/2 200`, body `[]` (the now-empty array; underlying field
is also removed from the hash).

### 14. GET year stats one more time (back to zero)

```sh
curl -s -H "X-Geeklog-Key: $KEY" "$BASE/api/geeklog/year?year=2026" | jq
```
Expect: `closingsCount: 0`, `entriesCount: 0`. `goal` still set from #4.
