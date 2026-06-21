BLOCK
3 HIGH / 2 MED / 1 NIT

## REMEDY EXECUTION SIMULATION

- **Remedy:** "Fan out concurrently, no worktree (they only read + write to `reports/`)" (§7).
- **First run:** Parallel agents execute in the same shared working directory. Agent A (W1) and Agent B (W3) finish simultaneously and attempt to commit their generated `reports/*.md` files. Lands in `.git/`.
- **What breaks:** The second agent's `git commit` dies with `.git/index.lock exists`. Git does not support concurrent mutations in the same worktree.
- **Remedy status:** FATAL

- **Remedy:** "Run-phase parallelism... shard by spec across agents" (§7).
- **First run:** Agent A executes `npx playwright test e2e/w2.spec.ts`. Agent B executes `npx playwright test e2e/w5.spec.ts`. `playwright.config.ts` (§3) triggers `webServer` to boot Next.js. Lands in Node `net` module.
- **What breaks:** Agent A binds port 3000. Agent B's webserver dies with `EADDRINUSE 0.0.0.0:3000`. Next.js fails to start for all but one agent.
- **Remedy status:** FATAL

- **Remedy:** "Seed stable test products via Admin API... `write_products`" (§4.1).
- **First run:** Agent executes `scripts/seed-shopify.ts`. Product is successfully created in Shopify Admin. Playwright specs run and navigate to the new PDP. Lands in `app/products/[handle]/page.tsx`.
- **What breaks:** Storefront API returns 404 (Product not found). Admin API product creation does not automatically publish the product to the Headless Custom App's Sales Channel. Playwright specs immediately fail.
- **Remedy status:** FATAL

## Findings

**F1 (HIGH): Git lock collisions in Phase B.** (§7)
As simulated, "no worktree" parallel agents will crash on concurrent git operations.
*Correction:* Either use isolated worktrees for *all* agents, or mandate that Phase B agents only write files locally and a single Phase D synthesis agent performs the git commit for all `reports/*`.

**F2 (HIGH): Playwright port collisions in Phase C.** (§3, §7)
As simulated, sharding Playwright runs across agents crashes `next dev`.
*Correction:* Do not shard by agent. Assign exactly one agent to run Phase C using `npx playwright test` with `fullyParallel: true` and rely on Playwright's native process management (which automatically provisions separate ports or shares the single `webServer` instance).

**F3 (HIGH): Headless publication gap for seeded products.** (§4.1, W5)
As simulated, `write_products` is insufficient for headless visibility.
*Correction:* Update `scripts/seed-shopify.ts` to require `write_product_listings` or `write_publications` scopes, and explicitly execute a `publishablePublish` GraphQL mutation targeting the Headless Custom App's App ID. 

**F4 (MED): Next.js 16 CSR/Hydration gap in Cart testing.** (§5, W5)
Next 16 App Router reading cart state from `localStorage` during SSR is the #1 cause of cart UI failure, which Playwright will mask if it only checks final DOM state.
*Correction:* Require W5 cart persistence specs to explicitly fail if `Hydration failed because...` or `Text content did not match` appears in the browser console during the reload step.

**F5 (MED): YAGNI Capability Gate blocking execution.** (§4.2, §2)
§4.2 mandates "Shopify test mode / Bogus Gateway" as a hard blocker. However, §2 and §5 correctly state that the plan stops at "checkout handoff" (because completing checkout on Shopify's domain requires different cross-origin context handling). If no actual checkout is completed, Bogus Gateway is never used.
*Correction:* Remove §4.2 entirely. It is a false blocker that will stall execution.

**F6 (NIT): Customer Auth cross-origin assumption.** (§5 Persona 4)
"Returning Account Holder... login" assumes a local auth form. Modern headless Shopify uses the Customer Account API, which redirects the user to `accounts.shopify.com`.
*Correction:* Explicitly note in W2/W5 that Persona 4 requires cross-origin domain traversal in Playwright, ensuring the agent configures `playwright.config.ts` to allow it.

VERDICT: REJECT
1. Fix the git `.index.lock` and Playwright `EADDRINUSE` concurrency fatals in the Phase B/C execution model.
2. Add the `publishablePublish` mutation to the Shopify seeding script; otherwise all E2E specs will 404.
3. Remove the conflicting Bogus Gateway requirement, as the scope deliberately stops at checkout handoff.