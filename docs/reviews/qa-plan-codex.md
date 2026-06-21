REVISE
7 HIGH / 6 MED / 1 NIT

**REMEDY EXECUTION SIMULATION**

- **Remedy:** §4 clear gates, then run unblocked workstreams.
  **First run:** Env setup hits `.env.example` and Admin client requirements in [lib/shopify-admin.ts](/home/james/projects/wildenflower/shopSite/lib/shopify-admin.ts:47).
  **What breaks:** `write_products` is insufficient; seeding also queries locations/publications and sets inventory. Storefront-only env passes E2E setup but not Admin seeding.
  **Remedy status:** DEGRADED

- **Remedy:** §6 W1 extend route/link crawler.
  **First run:** Current crawler starts `/`, caps at 100, only queues same-origin links in [scripts/validate-routes.ts](/home/james/projects/wildenflower/shopSite/scripts/validate-routes.ts:27) and [scripts/validate-routes.ts](/home/james/projects/wildenflower/shopSite/scripts/validate-routes.ts:57).
  **What breaks:** External links, unlinked public routes, API routes, placeholder links, and canonical/OG targets are not covered unless the script is substantially rewritten.
  **Remedy status:** DEGRADED

- **Remedy:** §6 W2 add persona specs.
  **First run:** Playwright always runs local `next dev` with one worker and Shopify env setup in [playwright.config.ts](/home/james/projects/wildenflower/shopSite/playwright.config.ts:5).
  **What breaks:** Returning-account persona redirects to Shopify via [app/login/page.tsx](/home/james/projects/wildenflower/shopSite/app/login/page.tsx:27); no seeded customer/session/callback fixture is specified.
  **Remedy status:** FATAL for account persona, DEGRADED for buyer personas

- **Remedy:** §6 W3 run UI/a11y/contrast across all routes.
  **First run:** A11y only tests `/` and `/collections/all` in [scripts/accessibility-test.ts](/home/james/projects/wildenflower/shopSite/scripts/accessibility-test.ts:27); contrast uses old indigo/coral tokens in [scripts/color-contrast-checker.ts](/home/james/projects/wildenflower/shopSite/scripts/color-contrast-checker.ts:14).
  **What breaks:** A green W3 report can miss most routes and validate the wrong design system.
  **Remedy status:** DEGRADED

- **Remedy:** §6 W4 classify all route/lib/component coverage.
  **First run:** Repo has 58 page/route files, including test/admin/API surfaces.
  **What breaks:** “Covered?” is not checkable without defining static, integration, E2E, and manual coverage separately; component coverage will become hand-wavy.
  **Remedy status:** DEGRADED

- **Remedy:** §6 W5 cart/checkout/account edge specs.
  **First run:** Cart persists only `shopsite-cart` localStorage in [lib/cart-store.ts](/home/james/projects/wildenflower/shopSite/lib/cart-store.ts:225); checkout redirects by assigning `window.location.href` in [components/cart-drawer.tsx](/home/james/projects/wildenflower/shopSite/components/cart-drawer.tsx:216).
  **What breaks:** Expired cart IDs, cross-tab state, checkout return/cancel, discount “coming soon”, and Shopify cart userErrors are not specified.
  **Remedy status:** DEGRADED

- **Remedy:** §6 W6 email/webhook verification.
  **First run:** `test:webhook` is mapping/HMAC unit coverage only in [scripts/test-webhook.ts](/home/james/projects/wildenflower/shopSite/scripts/test-webhook.ts:66). Routes do fail closed in [app/api/webhooks/orders-create/route.ts](/home/james/projects/wildenflower/shopSite/app/api/webhooks/orders-create/route.ts:31).
  **What breaks:** No durable retry/dedup proof across cold starts; no actual Resend delivery proof unless inbox/mock protocol is specified.
  **Remedy status:** DEGRADED

- **Remedy:** §6 W7 SEO/meta/legal.
  **First run:** Product schema emits `https://shopsite.com/products/...` in [app/products/[handle]/page.tsx](/home/james/projects/wildenflower/shopSite/app/products/[handle]/page.tsx:112).
  **What breaks:** Plan says verify schema, but not schema URL/domain correctness, canonical presence, or social image fallback consistency.
  **Remedy status:** DEGRADED

- **Remedy:** §6 W8 Lighthouse optional.
  **First run:** No script exists in `package.json`; only optional manual execution.
  **What breaks:** Optional perf smoke can vanish from launch readiness while still satisfying the plan.
  **Remedy status:** SOUND only if explicitly kept optional and reported as skipped

- **Remedy:** §7 fan out read-only audits with no worktree; reports committed.
  **First run:** W1/W3 require script changes or generated files, and all audits write `reports/*`.
  **What breaks:** “No worktree” collides with “report committed”; concurrent agents can overwrite report files.
  **Remedy status:** FATAL

- **Remedy:** §7 shard Playwright or raise workers.
  **First run:** Config is `workers: 1`, `fullyParallel: false`, one local port 3000 in [playwright.config.ts](/home/james/projects/wildenflower/shopSite/playwright.config.ts:6).
  **What breaks:** Parallel shards sharing one browser storage/cart and one dev server can create false passes or flakes unless each shard has isolated storage, product fixtures, and port/baseURL.
  **Remedy status:** DEGRADED

**Findings**

- **HIGH §7:** Read-only split is internally contradictory. W1/W3/W4/W6/W7/W8 all write reports, and W1/W3 need script/code changes to meet their own Done-when. Fix: give every report-producing workstream an isolated worktree or unique `reports/<workstream>/` path, then merge in Phase D.

- **HIGH §4.1/W5:** Admin gate is underspecified. `seed-shopify.ts` needs client credentials plus product, collection, publication, location, and inventory capabilities, not just `write_products`; it also seeds old/off-brand generic products and `art` instead of launch `artwork`. Fix: do not use this script as-is; create a launch-safe test fixture script with exact scopes and category handles.

- **HIGH §5/W2/W5:** Account persona is not executable as written. `/login` auto-redirects to Shopify and `/account` redirects unauthenticated users, so local Playwright cannot prove login/order history without a real test customer plus callback/session seeding. Fix: define three account tiers: unauth redirect, mocked authenticated session, optional live Shopify customer auth.

- **HIGH §6 W3:** “Across all routes” is false with current tools. Existing a11y scans 2 pages and contrast checks stale colors. Fix: make W3 consume W1’s discovered public route list and replace contrast inputs with live CSS variables/Tailwind tokens.

- **HIGH §7:** Playwright sharding is unsafe without isolation. The cart store persists a full Shopify cart object in localStorage, and tests currently clear storage per spec only in some files. Fix: require `test.use({ storageState: { cookies: [], origins: [] } })` or per-worker contexts for every cart/auth spec; use unique ports/baseURLs per agent if running separate Playwright processes.

- **HIGH §6 W6:** Webhook verification overclaims email/retry coverage. Unit tests prove mapping/HMAC, not Resend delivery, Shopify retry behavior, or dedup across server restarts. Fix: add a local signed POST script with injectable email transport, assert status/body for no-secret/bad-sig/duplicate/send-failure, and mark real inbox delivery as gated.

- **HIGH §8/§10:** Success criteria allow silent false confidence. “All 5 personas pass” conflicts with gated checkout/account, while “reports committed” has no machine-checkable manifest. Fix: require a `reports/manifest.json` listing every skipped assertion with gate ID, command, exit code, route count, browser matrix, and artifact path.

- **MED §6 W1:** External link requirement is brittle. Many sites block automated HEAD/GET or return geo/rate-limit statuses; “every external link 2xx/3xx” will produce noise. Fix: classify external links as `reachable`, `blocked`, `redirect`, `dead`, with retries and allowlist.

- **MED §6 W4:** Coverage map scope is too broad for pre-launch. Classifying every component and lib file manually will bury critical gaps. Fix: prioritize buyer-visible routes, cart/checkout/auth/webhook/email/SEO helpers, then sample low-risk presentational components.

- **MED §6 W5:** Cart edge cases miss stale remote cart behavior. Persisted cart IDs can expire or be deleted server-side; current plan only tests reload persistence. Fix: add a stale-cart fixture that seeds invalid localStorage and expects recovery, not a stuck checkout button.

- **MED §6 W5:** Currency/i18n coverage is named by the prompt but absent from the plan. The app has a mock currency converter with fixed rates in [lib/currency-context.tsx](/home/james/projects/wildenflower/shopSite/lib/currency-context.tsx:17). Fix: either test USD-only checkout consistency or explicitly gate/remove multi-currency confidence.

- **MED §6 W7:** SEO verification misses known bad structured-data classes. Product schema URL uses `shopsite.com`, and LocalBusiness has placeholder NAP TODO in [lib/structured-data.ts](/home/james/projects/wildenflower/shopSite/lib/structured-data.ts:18). Fix: include schema value assertions, not just presence/valid JSON.

- **MED §6 W2/W5:** Shopify API failure/rate-limit states are not exercised. `shopifyFetch` throws on GraphQL errors, and pages often turn that into `notFound()`. Fix: add mocked/network-failure tests for collection/PDP/cart mutation errors and rate-limit-ish responses.

- **NIT Header:** Target version is stale. `package.json` has Next `^16.2.9` and React `19.2.4`, not Next 16.1.1 / React 19 generically. Fix the plan header so execution agents do not chase version ghosts.

VERDICT: REVISE — 1. Fix the execution model/report manifest so skips and parallel writes cannot be hidden; 2. Replace the Admin/product/account gates with exact executable fixtures and scopes; 3. Rewrite W3/W6/W7 from presence checks into route/schema/email assertions that prove the claimed coverage.