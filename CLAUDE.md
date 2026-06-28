# CLAUDE.md — Mortgage Geek (mortgagegeek.ai)

Standing instructions for Claude Code. Read this fully at the start of every session. This is
the always-loaded essentials; the fuller reference is listed at the bottom.

## What this is
The Mortgage Geek: a mortgage-education and lead-capture site for first-time homebuyers.
React + Vite, deployed on Vercel. Owner: Nick Peters, VP of Mortgage Lending at Rate
(Guaranteed Rate, Inc.), NMLS #1119524.

## Architecture (current — do not assume otherwise)
The app is modular. Routing uses React Router v7 framework mode (SPA, ssr:false): routes are
declared in src/routes.js (route()/index() helpers); the document shell is src/root.jsx (head,
JSON-LD schemas, Meta/Links/Scripts, HelmetProvider); global chrome (SiteFooter with
route-derived layout/hasSidebar props, plus WelcomeToast) lives in a pathless layout route
src/routes/layout.jsx that derives props from useLocation(); each route is a thin adapter in
src/routes/ that default-re-exports its named page component. Pages in src/pages/*, shared UI in
src/components/*, data in src/data/*, helpers in src/utils/*. Design tokens live in src/theme.js:
the P color object, F fonts, PROGRAM_COLORS, the semantic tokens (P.success / P.caution /
P.danger), and globalCSS.

## Non-negotiable conventions
- Named exports only. The one default export is the App.jsx lazy-load adapter.
- No barrel/index files. Explicit import paths. Per-file React hook imports.
- All colors come from theme.js tokens. No hardcoded hex in components.
- TOKEN NAMES ARE HISTORICAL, NOT SEMANTIC. After the Rate refresh, values were swapped but
  names kept. P.gold is Arrow Red #CF3338, P.navy is charcoal, P.sage is grey, P.goldLight is
  a light red. Pick a token by the VISUAL RESULT you want, never by its old color name. Status
  colors use P.success / P.caution / P.danger. The four loan programs use PROGRAM_COLORS. Keep
  these three color systems independent.
- New routes are lazy-loaded via the App.jsx adapter pattern.
- Public pages need a <SEOHead> (unique title, description, canonical, schema). Private/gated
  routes follow the separate rulebook in engineering_standards.md.
- Images need explicit width and height (CLS).
- No new npm dependencies without explicit approval.

## Content voice (any user-visible text)
- No em-dashes. Use periods, colons, or parentheses.
- No formulaic AI phrasing ("it's not just X it's Y", "in today's world", "unlock",
  "leverage", "dive deep"). Write plainly, like an experienced loan officer talking.

## Workflow discipline (every task)
- Inventory first. Read the relevant files and report what you find BEFORE editing. Surface
  decisions; do not assume.
- One workstream per session. One commit per logical change, descriptive message.
- Verify before declaring done: `npx vite build` (zero errors), `npm run dev` (clean, no red
  console errors), and a smoke test of the affected routes.
- On any failure: `git checkout .` and retry. Never patch forward.
- Work on a branch and push a Vercel preview. Never merge to main without explicit review.

## TRIPWIRE — when to STOP and ask instead of proceeding
You may run multi-step or batched work autonomously. But STOP, report, and wait if you hit any
of these, where a wrong call is expensive:
1. A WCAG AA contrast failure you cannot resolve with an obvious token choice.
2. A regulated mortgage-disclosure question, or any use of a Rate trademark or product mark
   (PowerBid, Same Day Mortgage, the Rate logo) whose exact treatment or wording is not already
   locked in the task.
3. An unexpected cross-dependency: a change that would touch something outside the task's stated
   scope.
4. Anything that would put a wrong or irreversible thing live (a bad recolor across many
   surfaces, a disclosure error, a merge to main).
Outside these, proceed on your best judgment and capture the decisions in your summary for human
review on the preview.

## Project reference docs (consult as relevant)
- engineering_standards.md — full conventions, SEO requirements, private-route rulebook.

## Build and environment
- Scripts: `npm run dev` (Vite dev server), `npm run build` (production build),
  `npm run preview` (serve the build locally).
- Geek Log KV (Upstash Redis), consumed by api/geeklog/_redis.js: `GEEKLOG_KEY` (API auth),
  `GEEKLOG_KV_REST_API_URL`, `GEEKLOG_KV_REST_API_TOKEN`. Set in the Vercel project env
  (and .env.local for local dev).
- Vercel: deployed on Vercel; vercel.json holds the SPA rewrites (routes → /) and cache
  headers for service-worker.js and manifest.json. Branch pushes get preview deploys.
