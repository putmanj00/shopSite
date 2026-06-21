# Wildenflower — Full QA / E2E Test-Coverage Plan

**Status:** DRAFT for cross-review (Codex + Gemini) → then execute in a separate session.
**Author:** Claude Code, 2026-06-21.
**Target repo:** `~/projects/wildenflower/shopSite` (Next `^16.2.9` / React `19.2.4` / Tailwind 4, headless Shopify, Vercel).
**Execution model:** parallel agents, separate session(s). This doc is the self-contained brief — an executing agent should need nothing else.

---

## 1. Objective

Prove the storefront works end-to-end before launch: every route resolves, every
link works, the core buyer journeys complete for multiple personas, the UI/UX is
consistent across pages and breakpoints, and we know exactly what code is and is
not covered. Produce a ranked defect list + a coverage map, not just green checks.

## 2. Why now / scope boundary

- The email/webhook pipeline (orders/create confirmation, fulfillments/create
  shipping, dedup) is already built + unit/smoke-tested. This plan **verifies** it,
  does not rebuild it.
- Brand/visual direction is **locked** (see `docs/c2-corpus-gap-analysis-2026-06.md`).
  Do **not** relitigate palette/chrome. "Consistency" here = the shipped design
  applied uniformly, not a redesign.
- **In scope:** routes, links, navigation, persona journeys, cart/account flows,
  UI/UX consistency, responsive/a11y, SEO/meta/legal, repo test-coverage analysis,
  email-pipeline verification.
- **Out of scope:** completing real paid orders (needs Shopify test mode — gate
  below); marketing/IG integration; delivery-confirmation email (deferred — missing
  routes); any prod write.

## 3. Current test surface (build on this, don't reinvent)

| Asset | What it does | Plan action |
|---|---|---|
| `playwright.config.ts` | 3 browsers (chromium/firefox/webkit), `workers:1`, `fullyParallel:false`, auto-starts `next dev` :3000, `globalSetup` requires Shopify env | Extend; consider sharding (see §8) |
| `e2e/*.spec.ts` (8) | homepage, collections, category-nav, search, product-detail, add-to-cart, checkout | Extend into persona journeys |
| `e2e/support/shopify-test-product.ts` | Anchors specs to a real published handle (`shibori-indigo-scarf-2`), env-overridable | Repoint at stable seeded test products |
| `e2e/support/require-shopify-env.ts` | Global setup, fails fast without Shopify env | Reuse |
| `scripts/validate-routes.ts` | BFS crawler from `/`, ≤100 pages, per-page HTTP status + console errors | Extend → full link integrity (§ W1) |
| `scripts/ui-tests.ts`, `a11y:test`, `contrast:check` | UI / accessibility / WCAG contrast | Fold into UI audit (§ W3) |
| `scripts/test-webhook.ts` | 47/47 webhook unit tests | Reuse in pipeline verify (§ W6) |
| `scripts/seed-shopify.ts`, `publish-products.ts` | Seed collections/products via Admin API | Gated on Admin token (§4) |

## 4. Prerequisites & capability gates (JAMES — clear before/at execution)

These are hard blockers for specific workstreams. The plan runs the unblocked
workstreams regardless; blocked ones are marked.

1. **Write-scoped Admin token + PUBLICATION to the headless channel** (per ADR 0001).
   Local `.env` has **Storefront tokens only**. `write_products` **alone is not enough**:
   - Admin-created products do **NOT** auto-publish to the headless Custom App's sales
     channel → the Storefront API returns **404** and every product-backed spec fails
     (Gemini F3). Seeding must also run a `publishablePublish` GraphQL mutation against
     the headless app's ID, needing `write_publications` (and the seed also touches
     collections / locations / inventory — Codex). 
   - `scripts/seed-shopify.ts` as-is seeds **off-brand generic products** and the wrong
     `art` handle — do **not** reuse it. Build a small launch-safe fixture script
     (correct `artwork` taxonomy, on-brand items) that creates **and publishes**.
   - *Blocks:* automated product seeding (W5 setup).
   - *Workaround:* James creates 3–5 stable test products via Shopify admin UI **and
     publishes them to the headless channel**; we anchor specs to those handles.
2. ~~Shopify test mode / Bogus Gateway~~ — **REMOVED** (Gemini F5). This plan stops at
   the Shopify-hosted **checkout handoff** (§2), so no payment is ever completed and
   test mode is never exercised. Keeping it as a blocker would stall execution for no
   reason. Only reinstate if scope later extends to completing a paid order.
3. **Stable, PUBLISHED test-product handles** (output of #1 or workaround). Specs must
   not depend on the live, changing catalog.
4. **Test buyer inbox + Resend test mode** (or mock) for asserting emails actually send.
5. **Base URL targets** confirmed: local `next dev`, Vercel **preview** (PR), prod
   (read-only smoke). Never run write/seed against prod.

> If a gate is unmet at execution time, the agent must `log()` the skipped coverage
> explicitly (no-silent-shortcuts) — a skipped checkout is not a passed checkout.

## 5. Personas (drive the journeys)

Each persona = a named fixture + a journey spec. Keep them few and real.

1. **Browser/Bouncer** — lands from social, skims homepage → one collection → one PDP
   → leaves. Tests first-impression, hero, nav, images, no console errors, mobile.
2. **Intent Buyer** — searches a known product → PDP → add to cart → cart → checkout
   handoff. Tests search, variants, cart math, checkout entry.
3. **Gift Shopper** — browses by category, compares 2–3 PDPs, uses wishlist, abandons
   then returns (cart persistence). Tests category nav, wishlist, cart durability.
4. **Returning Account Holder** — account area → order history/profile. **NOT a local
   login form:** `/login` redirects to Shopify's **Customer Account API**
   (`accounts.shopify.com`), and `/account` redirects unauthenticated users
   (Codex + Gemini F6). Test in **three tiers**: (a) unauth → redirect happens,
   (b) **mocked authenticated session** for the account UI, (c) *optional* live Shopify
   customer with cross-origin traversal enabled in `playwright.config.ts`. Do not claim
   "login works" from tier (a)/(b) alone.
5. **Edge/Hostile** — bad URLs, empty cart checkout, out-of-stock add, deep links,
   back-button mid-flow, slow network. Tests error states + resilience.

## 6. Workstreams (parallelizable units of work)

Each is a self-contained brief: Objective · Output · Done-when. Independent unless noted.

**W1 — Route & link integrity (read-only).**
Extend `validate-routes.ts`: crawl all internal routes + every `<a href>` (internal
and external), record HTTP status, console errors, and dead/placeholder links
(`#`, empty, 404). Flag the known `/care-guides` + any other dead targets. Include
footer/legal/nav links. Output: `reports/links.json` + ranked broken-link list.
Done-when: 0 unexpected 404s on internal routes, every external link 2xx/3xx, report committed.

**W2 — Persona E2E journeys (writes specs).**
One spec per persona (§5) under `e2e/personas/`. Reuse support helpers; anchor to
seeded products. Assert: navigation, content present, no console errors, cart math,
checkout handoff reached. Done-when: all persona specs pass on all 3 browsers (or
documented skips for gated checkout).

**W3 — UI/UX consistency audit (read-only + report).**
Sweep components + pages for: design-token adherence (colors/spacing/type vs Tailwind
config), heading hierarchy, button/link styles, image aspect handling, empty/loading/
error states, responsive at 360/768/1280, focus states. Run `a11y:test` + `contrast:check`
across all routes (not just sampled). Output: `reports/ui-consistency.md` with
screenshots + ranked inconsistencies. Done-when: report delivered, criticals ticketed.

**W4 — Repo coverage analysis (read-only).**
Map the codebase: every `app/**/page.tsx`, `app/api/**/route.ts`, `lib/**`,
`components/**`. For each, note existing test coverage vs none. Identify untested
critical paths (esp. `lib/shopify.ts`, cart, checkout, auth, money formatting).
Output: `reports/coverage-map.md` — table of module → covered? → risk → proposed test.
Done-when: every route + lib module classified; gap list ranked.

**W5 — Cart / checkout / account flows + edge cases (writes specs).**
Deep specs beyond persona happy-paths: variant selection, quantity changes, cart
add/remove/persist across reload, price/tax/shipping display, out-of-stock, empty-cart
checkout block, account login/logout, wishlist. (Setup gated on §4 test products.)
Done-when: flow specs pass; gated steps logged.

**W6 — Email / webhook pipeline verification (read-only + smoke).**
Re-run `test:webhook` (47/47). Re-run the local signed-POST smoke (orders/create +
fulfillments/create + dedup) — see the verified pattern in this session. Confirm
fail-closed behavior (no secret → 500, bad sig → 401). Done-when: unit + smoke green,
fail-closed proven.

**W7 — SEO / meta / structured data / legal (read-only).**
Verify every public page has OpenGraph + title/description; PDPs have valid JSON-LD
`Product`; `/sitemap.xml` + `/robots.txt` resolve; footer legal links (privacy/terms/
refund) work. Output: `reports/seo.md`. Done-when: all public pages pass, legal links live.

**W8 — Performance smoke (optional, read-only).**
Lighthouse (or PSI) on homepage, a collection, a PDP at mobile + desktop. Output:
`reports/perf.md` with Core Web Vitals. Done-when: scores recorded, regressions flagged.

## 7. Parallel-agent execution model

Run via the **Workflow tool** in the separate session. **Two concurrency fatals the
naive model hits (Gemini F1/F2) — the model below avoids both:**

- **No agent runs git.** Parallel agents in one worktree crash on `.git/index.lock`
  (F1). Rule: Phase B agents **write files only** — each to its own
  `reports/<workstream>/` dir (no shared filenames). A **single Phase D agent** does the
  one git commit for all reports. (Alternative: `isolation: 'worktree'` per agent + merge
  — heavier; prefer the write-only split for read-only audits.)
- **One agent owns the Playwright run.** Sharding `playwright test` across agents binds
  port 3000 N times → `EADDRINUSE` (F2). Do **not** shard across agents. **Exactly one**
  Phase C agent runs `npx playwright test` and, to parallelize, flips `fullyParallel:true`
  + raises `workers` in config — Playwright manages its own workers against the single
  `webServer`. Cart/auth specs must isolate storage:
  `test.use({ storageState: { cookies: [], origins: [] } })` (cart lives in
  `localStorage` — shared state = false passes, Codex).
- **Phases:** A = seed+publish products + env-gate check → B = parallel **read-only
  audits** (W1,W3,W4,W6,W7) + **spec authoring** (W2,W5, each to disjoint files) → C =
  **one** agent runs all specs ×3 browsers → D = single agent commits reports +
  synthesizes one ranked defect report + coverage map + `reports/manifest.json` (§8.7).
  A completeness-critic in D asks "what route/flow/persona/state was NOT exercised?" →
  next round.
- **Verification gate:** a workstream is "done" only when its Done-when holds AND its
  report row is in `manifest.json` with every skipped/gated assertion named (no silent
  skips). Adversarially verify W1/W4 findings (a second agent confirms a "dead link" /
  "untested path" before it lands).

## 8. Success criteria (measurable)

1. 100% of internal routes resolve (no unexpected 404/500); every link classified.
2. All 5 persona journeys pass on chromium+firefox+webkit (gated checkout steps
   explicitly logged, not silently skipped).
3. Coverage map covers every route + lib module; ranked gap list exists.
4. UI-consistency + a11y + contrast reports delivered; criticals ticketed.
5. Email/webhook unit + smoke green, fail-closed proven.
6. SEO/meta/legal verified on all public pages.
7. **`reports/manifest.json`** (machine-checkable, prevents silent false confidence —
   Codex/Gemini): one row per workstream with `done_when_met`, `routes_scanned`,
   `browser_matrix`, every `skipped_assertion` + its `gate_id`, each command + `exit_code`,
   and artifact paths. "All personas pass" is INVALID if a gated checkout/account step is
   skipped without a manifest row.
8. One consolidated, **ranked** defect report (severity × confidence) + a re-run command.

## 9. Constraints

- No prod writes. Seed/test against local + Vercel preview only.
- Least-privilege Admin token; never commit secrets (lefthook gitleaks is active).
- Don't relitigate brand/palette (locked).
- No real payments. Test mode only.
- Match existing patterns (tsx scripts, playwright support helpers) — smallest change.
- Respect the context-% gate: a workstream too big for one agent window gets split.

## 10. Verification (how we know it's real)

- Every report committed to `reports/` with the command that produced it.
- Persona specs run in CI (or a documented local run) on all 3 browsers.
- Defect report entries each cite file:line or a repro URL + steps.
- Coverage claims backed by the actual map, not assertion.

## 11. Risks / open questions

- Shopify catalog drift breaks product-anchored specs → mitigated by stable seeded
  test products (gate §4.1/§4.3).
- Real customer-auth scope for the account persona — confirm what's testable without
  a live customer (W2/W5 persona 4).
- Parallel Playwright flakiness (shared cart/session) — validate before sharding.
- `workers:1` today → run-phase parallelism needs a deliberate decision.

## 12. Phasing (for the execution session)

0. **Cross-review this plan (Codex + Gemini)** → fold findings. *(this doc, §13)*
1. Clear gates §4 (James) → seed test products.
2. Fan out read-only audits (W1,W3,W4,W6,W7) + author persona/flow specs (W2,W5).
3. Run all specs × 3 browsers; collect reports.
4. Synthesize ranked defect report + coverage map; completeness-critic pass.
5. Fix criticals (separate PRs), re-run, hand James the launch-readiness summary.

---

## 13. Cross-review findings (Codex + Gemini) — 2026-06-21

Artifacts: `docs/reviews/qa-plan-codex.md`, `docs/reviews/qa-plan-gemini.md`.
**Verdicts:** Codex **REVISE** (7 HIGH/6 MED/1 NIT) · Gemini **REJECT** (3 HIGH/2 MED/1 NIT).
Both: **do not execute as written.** The FATALs below are now fixed inline (§4, §5, §7,
§8); the remaining per-workstream deltas are the execution session's revision checklist.

### Fixed inline (FATAL / HIGH)
- **Execution model (§7)** — git `.index.lock` collisions + Playwright `EADDRINUSE` were
  fatal. Rewrote: no agent runs git (per-workstream report dirs, single Phase D commit);
  one agent owns the Playwright run with `fullyParallel:true`; storageState isolation.
- **Headless publication (§4.1)** — Admin create ≠ published; needs `publishablePublish`
  + `write_publications` or all specs 404. seed-shopify.ts is off-brand → build a
  publish-aware fixture.
- **Account persona (§5)** — Customer Account API cross-origin redirect, not a local
  form → three account tiers.
- **§4.2 Bogus Gateway** — removed (false blocker; scope stops at handoff).
- **§8 success criteria** — added `reports/manifest.json` so gated skips can't pass as green.

### Revision checklist (apply during execution)
- **W1** — external links will rate-limit/geo-block; classify `reachable|blocked|redirect|dead`
  with retries + allowlist, not a flat "every external 2xx/3xx".
- **W3** — "all routes" is currently false: `accessibility-test.ts` scans only 2 routes and
  `color-contrast-checker.ts` uses **stale indigo/coral tokens**. Consume W1's route list +
  feed live CSS-variable/Tailwind tokens.
- **W4** — prioritize buyer-visible routes + cart/checkout/auth/webhook/email/SEO helpers;
  sample presentational components (don't hand-classify all 58 files).
- **W5** — add: stale-remote-cart fixture (expired/deleted cart ID → expect recovery, not a
  stuck button); **hydration assertion** (fail on `Hydration failed` / text-mismatch on
  reload — Next 16 localStorage cart, Gemini F4); currency is a **mock fixed-rate converter**
  → test USD-only consistency or explicitly gate multi-currency confidence; mock Shopify
  GraphQL failure/rate-limit on collection/PDP/cart-mutation paths.
- **W6** — unit tests prove only mapping/HMAC. Add a signed-POST script with an **injectable
  email transport**; assert status/body for no-secret(500)/bad-sig(401)/duplicate/send-failure;
  mark real-inbox delivery + cross-restart dedup as **gated** (per-instance dedup can't be
  proven across cold starts).
- **W7** — assert schema **values**, not just presence (see app bugs below).
- **Header NIT** — pin versions: Next `^16.2.9`, React `19.2.4`.

### Real app bugs surfaced (worth fixing regardless of QA run)
These are shippable defects the reviewers found while simulating — flag to James:
1. **Product JSON-LD uses `shopsite.com`** (wrong domain) — `app/products/[handle]/page.tsx:112`. Breaks rich results / canonical.
2. **LocalBusiness structured data has a placeholder NAP TODO** — `lib/structured-data.ts:18`.
3. **Contrast checker validates the wrong (old indigo/coral) design system** — `color-contrast-checker.ts:14`.
4. **a11y test covers only 2 routes** — false "accessible" signal.
5. **`seed-shopify.ts` seeds off-brand generic products + `art` not `artwork`.**

### Optional follow-up
Per the Gemini→Codex→Gemini pattern, a final Gemini **ratify** pass on this revised plan
can run as step 0 of the execution session (not blocking).
