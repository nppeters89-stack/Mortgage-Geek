# CLAUDE.md — Mortgage Geek (mortgagegeek.ai)

Standing instructions for Claude Code. Read this fully at the start of every session. This is
the always-loaded essentials; the fuller reference is listed at the bottom.

## What this is
The Mortgage Geek: a mortgage-education and lead-capture site for first-time homebuyers.
React + Vite, deployed on Vercel. Owner: Nick Peters, VP of Mortgage Lending at Rate
(Guaranteed Rate, Inc.), NMLS #1119524.

## Architecture (current — do not assume otherwise)
The app is modular, on React Router v7 framework mode. Routing is defined in src/routes.js. The
document shell (html head, site-wide Person + FinancialService JSON-LD, Meta/Links/Scripts) is
src/root.jsx. Global chrome (SiteFooter with route-derived props, WelcomeToast) is a pathless
layout route in src/routes/layout.jsx, deriving its props from useLocation(). Each route maps to
a thin adapter in src/routes/ that default-re-exports its page component from src/pages/*. Shared
UI in src/components/*, data in src/data/*, helpers in src/utils/*. There is no App.jsx (removed
in the framework-mode migration); any note referencing src/App.jsx is stale. Design tokens live
in src/theme.js: the P color object, F fonts, PROGRAM_COLORS, the semantic tokens (P.success /
P.caution / P.danger), and globalCSS.

## Non-negotiable conventions
- Named exports only. The sole default exports are the framework-mode route modules: src/root.jsx, src/routes/layout.jsx, and the thin per-route adapters in src/routes/ (each re-exports its named page component as default).
- No barrel/index files. Explicit import paths. Per-file React hook imports.
- All colors come from theme.js tokens. No hardcoded hex in components.
- TOKEN NAMES ARE HISTORICAL, NOT SEMANTIC. After the Rate refresh, values were swapped but
  names kept. P.gold is Arrow Red #CF3338, P.navy is charcoal, P.sage is grey, P.goldLight is
  a light red. Pick a token by the VISUAL RESULT you want, never by its old color name. Status
  colors use P.success / P.caution / P.danger. The four loan programs use PROGRAM_COLORS. Keep
  these three color systems independent.
- To add a route: create the page in src/pages/* (named export), add a thin adapter in src/routes/ that default-re-exports it, and register it in src/routes.js. If the route is public and should be indexed, ALSO add its path to the prerender array in react-router.config.js. A public route missing from that array is not prerendered: it returns 404 on a direct hit instead of serving content. Private or gated routes (e.g. /geek-log) are intentionally excluded from the prerender array and fall back to the SPA via a vercel.json rewrite.
- Public prerendered pages get their metadata from a route meta export (unique title, description, canonical, og/twitter, and JSON-LD as script descriptors) so it lands in the static HTML. Do NOT use <SEOHead> on a prerendered public route: it injects client-side, will not appear in the prerendered HTML, and would duplicate the meta export. <SEOHead> / react-helmet-async is retained ONLY for non-prerendered SPA routes (e.g. /geek-log). Private or gated routes follow the separate rulebook in engineering_standards.md.
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
- Verify before declaring done: `npm run build` (react-router build, zero errors), `npm run dev` (react-router dev, clean console, no red errors), and a smoke test of the affected routes. For changes touching render-time code, also confirm the prerender build still produces static HTML for all public routes.
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
