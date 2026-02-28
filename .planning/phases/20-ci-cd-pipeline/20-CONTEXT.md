# Phase 20: CI/CD Pipeline - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Automated GitHub Actions CI/CD workflow that validates every PR — lint, typecheck, build, Playwright E2E tests, secrets scanning — with branch protection rules and a manual deployment gate before production. Vercel environment splitting and IaC are Phase 21.

</domain>

<decisions>
## Implementation Decisions

### Workflow structure
- Single workflow file with parallel jobs (not separate workflow files)
- Fast checks first (lint, typecheck, build); Playwright E2E only triggers if those pass
- All failures surface as distinct named status checks on the PR so it's immediately clear which stage failed

### E2E test behavior
- Retry count: 2 retries in CI (tolerates flakiness without failing the build)
- E2E failures block merge — warning-only is not acceptable
- Browser matrix: Chromium, Firefox, and WebKit — all three run in CI
- Playwright HTML report uploaded as a downloadable artifact on every CI run

### Branch protection rules
- All CI jobs required to pass before merge (lint, typecheck, build, E2E, secrets scan)
- CI runs on draft PRs so failures are visible early
- Deployment does NOT trigger on draft PRs — only on "Ready for Review"
- Only repository admin can bypass checks (emergency hotfix situations only)

### Deployment gate
- Environment hierarchy: preview (per PR, Vercel) → staging (on merge to main) → production
- Production requires a manual "approve" click in the GitHub Actions UI before deploy proceeds
- Notifications only on deployment failure or successful production deploy completion
- Claude's Discretion: notification channel (Slack vs email vs GitHub-only)

### Claude's Discretion
- Exact GitHub Actions versions to pin (checkout, setup-node, etc.)
- Cache strategy for node_modules and Playwright browsers
- Secrets scan tooling (gitleaks vs trufflehog vs custom regex matching `.env` secret patterns)
- Exact job names and step labels in the workflow YAML

</decisions>

<specifics>
## Specific Ideas

- "Parallel Speed" standard: maximize efficiency by running independent jobs in parallel
- "Anti-Flakiness" standard: retry=2 allows for network lag without letting flakiness slide
- "Quality Gate" standard: all checks required; draft PRs run CI but don't deploy
- "Safe Release" standard: manual approval as final human sanity check before production

</specifics>

<deferred>
## Deferred Ideas

- Vercel environment splitting (preview/staging/prod as separate Vercel projects) — Phase 21
- IaC/OpenTofu for environment config — Phase 21

</deferred>

---

*Phase: 20-ci-cd-pipeline*
*Context gathered: 2026-02-28*
