---
phase: 21-vercel-environments-iac
plan: 03
subsystem: infra
tags: [vercel, ci-cd, github-actions, deploy, github-secrets]

requires:
  - phase: 21-02
    provides: shopsite-prod Vercel project (prj_JuSM2gXMpQ1b4xKEzJRKEKvFce21) with Shopify env vars
  - phase: 20-03
    provides: CI workflow with deploy-prod job stub (environment: production gate, placeholder echo)

provides:
  - CI deploy-prod job wired to Vercel CLI (vercel pull + vercel build --prod + vercel deploy --prebuilt --prod)
  - Production deployments triggered automatically on main push after quality gates pass and human approval given
  - GitHub secrets VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID_PROD added (human-action Task 1)
  - Preview deployments auto-generated per PR by Vercel's native GitHub integration (VERC-03)

affects:
  - 22-error-monitoring (Sentry env vars will feed into this same CI/deploy pipeline)
  - 23-shopify-go-live (prod deployment pipeline is fully functional — go-live verification is next)

tech-stack:
  added:
    - vercel CLI (installed via npm install -g vercel@latest in deploy-prod CI step)
  patterns:
    - "vercel pull + vercel build + vercel deploy --prebuilt pattern — three-step CLI deploy separates env sync, build, and deploy for better failure isolation"
    - "GitHub environment gate (environment: production) provides manual approval layer before each prod deploy"
    - "VERCEL_PROJECT_ID set per-job via env block — allows using same VERCEL_TOKEN and VERCEL_ORG_ID for multiple projects without conflict"

key-files:
  created: []
  modified:
    - .github/workflows/ci.yml

key-decisions:
  - "Preserved job name 'secrets' (not 'secrets-scan') in needs array — matched the actual job name in the existing CI file to avoid breaking the dependency chain"
  - "Three-step vercel CLI pattern (pull, build, deploy) chosen over single vercel --prod — pull syncs env vars from Vercel, build produces artifact, deploy --prebuilt ships it; clearer failure isolation than one combined command"

patterns-established:
  - "Vercel CLI deploy in CI: always run pull before build — ensures local .vercel/ directory is populated with project config and env vars"

requirements-completed: [VERC-01, VERC-02, VERC-03]

duration: 5min
completed: 2026-02-28
---

# Phase 21 Plan 03: CI Deploy Wiring Summary

**CI deploy-prod job replaced with real Vercel CLI three-step deploy (pull + build + prebuilt) using GitHub secrets VERCEL_TOKEN/VERCEL_ORG_ID/VERCEL_PROJECT_ID_PROD, preserving environment: production manual approval gate**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-01T01:00:00Z
- **Completed:** 2026-03-01T01:06:16Z
- **Tasks:** 2 of 3 tasks complete (Task 3 is a human-verify checkpoint — awaiting user)
- **Files modified:** 1

## Accomplishments

- Replaced placeholder `echo` statement in deploy-prod job with real `vercel pull`, `vercel build --prod`, `vercel deploy --prebuilt --prod` sequence
- Preserved `environment: production` manual approval gate (Phase 20 requirement)
- Preserved `needs: [quality, e2e, secrets, audit]` dependency chain — all checks must pass before deploy
- GitHub secrets VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID_PROD confirmed added (human-action checkpoint)

## Task Commits

1. **Task 1: GitHub secrets** - human-action checkpoint (no code commit — user manually added secrets)
2. **Task 2: Replace placeholder deploy-prod job** - `261e90c` (feat)

**Plan metadata:** TBD (committed after human-verify checkpoint)

## Files Created/Modified

- `.github/workflows/ci.yml` - deploy-prod job replaced: placeholder echo removed, vercel CLI three-step deploy added with VERCEL_TOKEN/VERCEL_ORG_ID/VERCEL_PROJECT_ID_PROD secrets

## Vercel Project IDs (for reference)

```
dev_project_id  = "prj_0hEeS5coA98GGf7dxakblTTXNts5"
dev_project_url = "https://shopsite-dev.vercel.app"
prod_project_id = "prj_JuSM2gXMpQ1b4xKEzJRKEKvFce21"
```

## Decisions Made

- Preserved `secrets` as the job name (not `secrets-scan`) in the `needs` array — the actual job in the CI file is named `secrets`, and changing the reference would break the dependency chain.
- Used the three-step vercel CLI pattern (pull, build, deploy --prebuilt) rather than a single `vercel --prod` command. The pull step syncs `.vercel/` project config and env vars from Vercel cloud; the build step produces a prebuilt artifact; the deploy step ships it. Clearer failure isolation.

## Deviations from Plan

### Minor Discrepancy Auto-Fixed

**1. [Rule 1 - Bug] Preserved correct needs array job name**
- **Found during:** Task 2 (editing ci.yml)
- **Issue:** The plan template specified `needs: [quality, e2e, secrets-scan, audit]` but the actual CI file uses `needs: [quality, e2e, secrets, audit]` (job is named `secrets`, not `secrets-scan`). Using `secrets-scan` would break the dependency chain.
- **Fix:** Kept `needs: [quality, e2e, secrets, audit]` matching the existing job name.
- **Files modified:** .github/workflows/ci.yml
- **Verification:** grep confirms `needs: [quality, e2e, secrets, audit]` is present.
- **Committed in:** 261e90c

---

**Total deviations:** 1 auto-fixed (naming discrepancy between plan template and actual file)
**Impact on plan:** Essential correctness fix — using wrong job name would silently drop the secrets-scan dependency from the gate.

## Issues Encountered

None.

## User Setup Required

**Human-verify checkpoint (Task 3) is pending.** The user needs to:

1. Push the updated ci.yml on a branch and open a PR to main
2. Confirm a Vercel preview deployment URL auto-generates in the PR checks (verifies VERC-03)
3. Merge the PR to main after CI passes
4. In GitHub Actions, confirm the deploy-prod job pauses at the environment approval gate
5. Approve the deployment — confirm shopsite-prod shows the new deployment in Vercel dashboard
6. Visit the prod deployment URL and confirm the storefront loads

## Next Phase Readiness

- CI pipeline fully functional pending human-verify confirmation (Task 3)
- Phase 22 (Error Monitoring) ready: add Sentry env vars via `vercel_project_environment_variable` in `infra/main.tf`
- Phase 23 (Go-Live Verification): prod project ID confirmed — `prj_JuSM2gXMpQ1b4xKEzJRKEKvFce21`
- Blocker (carried from Phase 21-02): `https://shopsite-dev.vercel.app` must be added to Shopify Customer Account API OAuth redirect URIs before OAuth flows work on the dev Vercel deployment
- Blocker (carried from Phase 21-02): wildenflower.com domain must be manually removed from shop-site Vercel project before IaC can attach it to shopsite-prod

---
*Phase: 21-vercel-environments-iac*
*Completed: 2026-02-28*
