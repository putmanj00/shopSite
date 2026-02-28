---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: UX Cleanup & Navigation
status: unknown
last_updated: "2026-02-28T20:21:25.781Z"
progress:
  total_phases: 17
  completed_phases: 15
  total_plans: 47
  completed_plans: 45
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-27)

**Core value:** A shopper lands on a beautiful, nature-inspired handmade goods storefront and immediately feels the warmth and authenticity of the Wildenflower brand — while the Shopify integration underneath works reliably.
**Current focus:** Milestone v1.2 — Phase 18: Security & Dev Tooling
## Current Position

Phase: 21 of 23 (Vercel Environments & IaC) [IN PROGRESS]
Plan: 21-01 complete (1 of 3) — awaiting checkpoint:human-verify before Plan 02
Status: Phase 21 Plan 01 auto-tasks complete; human verification checkpoint pending
Last activity: 2026-02-28 — Executed Phase 21 Plan 01. Created infra/ OpenTofu HCL with two Vercel project resources + domain resource. tofu init and tofu validate pass. Awaiting human checkpoint verification.

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

### Pending Todos

None.

### Blockers/Concerns

- OAuth auth routes (app/api/auth/customer/) are fragile — no logic changes in v1.2
- CSP header whitelists `*.shopify.com` and `checkout.shopify.com` — implemented in 18-01 (connect-src and form-action)
- Vercel dev project URL must be added to Shopify Customer Account API allowed redirect URIs when Phase 21 runs
- Playwright cannot test Shopify checkout completion (cross-domain, anti-bot) — test order via bogus gateway in Phase 23 instead

## Session Continuity

Last session: 2026-02-28
Stopped at: 21-01-PLAN.md checkpoint:human-verify — tasks 1+2 complete, awaiting visual verification before Plan 02.
Resume file: None
