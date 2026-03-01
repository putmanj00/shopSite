---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Production Readiness & Go-Live
status: unknown
last_updated: "2026-03-01T17:26:59.326Z"
progress:
  total_phases: 19
  completed_phases: 17
  total_plans: 54
  completed_plans: 52
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-27)

**Core value:** A shopper lands on a beautiful, nature-inspired handmade goods storefront and immediately feels the warmth and authenticity of the Wildenflower brand — while the Shopify integration underneath works reliably.
**Current focus:** Milestone v1.2 — Phase 18: Security & Dev Tooling
## Current Position

Phase: 23 of 23 (Shopify Go-Live Verification) [In Progress]
Plan: 23-01 complete (1 of 3) — Webhook endpoint created, email from address updated, 23-VERIFICATION.md runbook pre-filled
Status: Phase 23 Plan 01 complete. Webhook handler at app/api/webhooks/order-created/route.ts. lib/email.ts from address updated to hello@wildenflower.com. 23-VERIFICATION.md runbook pre-filled for all 8 SHOP-XX requirements. Ready for Plan 02 (human: Vercel env vars + Resend domain verification).
Last activity: 2026-03-01 — Completed Phase 23 Plan 01. Commits: d797c60, 817609e.

Progress: [▓░░░░░░░░░] 12% (v1.2)

## Performance Metrics

**Velocity (v1.1 reference):**
- Total plans completed: 26 (v1.0 + v1.1)
- Average duration: ~2 min/plan
- Total execution time: ~52 min

**v1.2 By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 16. Legal Pages & SEO Metadata | TBD | - | - |
| 17. Cookie Consent & Product Schema | TBD | - | - |
| 18. Security & Dev Tooling | TBD | - | - |
| 19. Playwright E2E Tests | TBD | - | - |
| 20. CI/CD Pipeline | TBD | - | - |
| 21. Vercel Environments & IaC | TBD | - | - |
| 22. Error Monitoring | TBD | - | - |
| 23. Shopify Go-Live Verification | TBD | - | - |

*Updated after each plan completion*
| Phase 18 P01 | 2 | 2 tasks | 1 files |
| Phase 18 P02 | 12 | 3 tasks | 0 files |
| Phase 19 P01 | 4 | 3 tasks | 7 files |
| Phase 20 P01 | 2 | 2 tasks | 3 files |
| Phase 20 P02 | 1 | 2 tasks | 1 files |
| Phase 20 P03 | 5 | 2 tasks | 0 files |
| Phase 21-vercel-environments-iac P01 | 5 | 2 tasks | 6 files |
| Phase 21-vercel-environments-iac P02 | 12 | 1 task | 2 files |
| Phase 21-vercel-environments-iac P03 | 5 | 2 tasks | 1 files |
| Phase 22-error-monitoring P01 | 5 | 1 tasks | 1 files |
| Phase 22-error-monitoring P02 | 5 | 2 tasks | 8 files |
| Phase 22-error-monitoring P03 | 2 | 2 tasks | 5 files |
| Phase 22-error-monitoring P04 | 10 | 2 tasks | 2 files |
| Phase 23-shopify-go-live-verification P01 | 3 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.2 roadmap]: Phase 16 starts with legal pages before cookie banner — banner must link to Privacy Policy (hard dependency)
- [v1.2 roadmap]: Playwright tests (Phase 19) precede CI pipeline (Phase 20) — CI E2E job requires test files to exist
- [v1.2 roadmap]: SHOP-01–08 grouped as admin checklist phase (Phase 23) — executed as verification, not code changes
- [v1.2 roadmap]: Phases 16, 18, 19 have no interdependency — can begin in any order; default order is sequential
- [v1.2 roadmap]: OpenTofu local state (gitignored) acceptable for solo dev two-project setup; no Terraform Cloud needed
- [v1.2 roadmap]: Sentry gated to NODE_ENV === 'production' — avoids burning 5k/month free tier quota in dev
- [18-01]: CSP deployed in Report-Only mode — flip CSP_ENFORCE=true in next.config.ts after confirming zero violations in production
- [18-01]: X-Frame-Options DENY (not SAMEORIGIN) — no framing use case for this storefront
- [18-01]: HSTS 2yr with preload directive — ready for HSTS preload list submission
- [18-02]: gitleaks installed via GitHub release binary (not brew) — brew was compiling Go from source on macOS 13
- [18-02]: Git history confirmed clean — no credential rotation required; history rewrite policy moot
- [19-01]: webServer command uses 'next dev --webpack' not 'npm run dev' — avoids Turbopack panic caused by multiple lockfiles in workspace root (pnpm-lock.yaml at parent dir + package-lock.json in project)
- [19-01]: All E2E spec imports use 'playwright/test' (not '@playwright/test') — package installed is 'playwright', not '@playwright/test'
- [19-01]: Category nav test uses .hover() to trigger onMouseEnter dropdown — more reliable than .click() in headless Chromium
- [20-01]: npm audit --audit-level=high --omit=dev is the correct CI flag set — excludes devDep vulns (minimatch via @typescript-eslint), catches prod vulns (next.js)
- [20-01]: Upgraded next@16.1.1 to next@16.1.6 — fixes 3 high-severity DoS CVEs (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf, GHSA-5f7q-jpqc-wp7h)
- [20-01]: reuseExistingServer: !process.env.CI — ensures fresh dev server in CI (not reusing stale); idiomatic Playwright CI pattern
- [Phase 20]: All five CI jobs in single workflow file — simpler to maintain, produces distinct named status checks in GitHub PR UI
- [Phase 20]: No Playwright browser caching in CI — restore time equals download time per Playwright docs
- [Phase 20]: deploy-prod uses environment: production field — creates manual approval gate; Plan 03 configures required reviewers in GitHub Settings
- [Phase 20]: [20-03]: Branch protection strict:false — PRs need passing checks but branch does not need to be up-to-date with main
- [Phase 20]: [20-03]: enforce_admins:false — admin bypass allowed for emergency hotfixes on single-maintainer repo
- [Phase 21-01]: Removed production_deployment_enabled from vercel_project.prod — attribute dropped in vercel provider v1.10+; manual promote via Vercel dashboard
- [Phase 21-01]: Committed .terraform.lock.hcl to pin provider version (vercel/vercel v1.14.1) per OpenTofu best practices
- [Phase 21-02]: Vercel API rejects sensitive=true env vars targeting "development" — use target=["preview","production"] for sensitive vars
- [Phase 21-02]: vercel_project_domain deferred — wildenflower.com is attached to pre-existing shop-site project; must be moved manually before tofu can manage it
- [Phase 21-02]: Added tfplan/*.tfplan to .gitignore — plan files embed sensitive variable values in plaintext
- [Phase 21-03]: Preserved 'secrets' job name in needs array (not 'secrets-scan') — plan template had wrong name; using wrong name would silently drop the secrets-scan dependency from the gate
- [Phase 21-03]: Three-step vercel CLI pattern (pull + build + deploy --prebuilt) chosen for clearer failure isolation over single vercel --prod command
- [Phase 22-error-monitoring]: Sentry gated to production-only env vars — SENTRY_DSN/NEXT_PUBLIC_SENTRY_DSN/SENTRY_AUTH_TOKEN set in Vercel prod and GitHub Secrets only, not dev/preview
- [22-02]: tunnelRoute: '/monitoring' chosen — same-origin tunnel avoids ad-blocker interference; no CSP connect-src change needed
- [22-02]: Org slug left as YOUR_ORG_SLUG placeholder — user must substitute actual slug in next.config.ts before first production deploy
- [22-02]: tracesSampleRate: 0.1 on all runtimes — conservative 10% to protect free tier quota
- [Phase 22-error-monitoring]: Error boundaries require explicit Sentry.captureException in useEffect — Next.js handles these errors before Sentry's global handler fires
- [Phase 22-error-monitoring]: SENTRY_AUTH_TOKEN added to quality job Build step only; deploy-prod job uses vercel build --prod which pulls Vercel env vars automatically
- [Phase 22-error-monitoring]: Test routes deleted immediately after dashboard confirmation — MON-01/MON-02/MON-03 all verified; Phase 22 complete
- [Phase 23-01]: Return 200 on Resend email failure to prevent Shopify duplicate-email retries
- [Phase 23-01]: crypto.timingSafeEqual for HMAC comparison (not ===) prevents timing attacks on webhook
- [Phase 23-01]: request.text() must be called before JSON.parse in webhook handler — body stream consumed once

### Pending Todos

None.

### Blockers/Concerns

- OAuth auth routes (app/api/auth/customer/) are fragile — no logic changes in v1.2
- CSP header whitelists `*.shopify.com` and `checkout.shopify.com` — implemented in 18-01 (connect-src and form-action)
- Vercel dev project URL (https://shopsite-dev.vercel.app) must be added to Shopify Customer Account API allowed redirect URIs before OAuth flows work on dev deployment
- wildenflower.com domain must be manually removed from shop-site Vercel project before IaC can attach it to shopsite-prod
- Playwright cannot test Shopify checkout completion (cross-domain, anti-bot) — test order via bogus gateway in Phase 23 instead

## Session Continuity

Last session: 2026-03-01
Stopped at: Completed 23-01-PLAN.md — webhook endpoint created, email from address updated to hello@wildenflower.com, 23-VERIFICATION.md runbook pre-filled for SHOP-01 through SHOP-08. Ready for Plan 02.
Resume file: None
