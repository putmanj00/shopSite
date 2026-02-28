# Phase 18: Security & Dev Tooling - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the codebase with security headers on every HTTP response, eliminate secrets from git history, and enforce code quality gates (lint, typecheck, conventional commits, secret detection) on every local commit before it lands. No CI pipeline work here — that is Phase 20.

</domain>

<decisions>
## Implementation Decisions

### CSP Policy
- Use `'unsafe-inline'` for script-src — no nonce-based approach (simpler, avoids middleware complexity)
- All security headers live in `next.config.ts` headers() array — no middleware.ts needed
- Allow these external domains in script-src and connect-src: Shopify (`*.shopify.com`, `*.myshopify.com`) + Google Analytics (`*.google-analytics.com`, `*.googletagmanager.com`)
- Deploy CSP as `Content-Security-Policy-Report-Only` first to observe violations, then switch to enforcing once confirmed clean
- Also set: HSTS, X-Frame-Options (DENY), X-Content-Type-Options (nosniff)

### Pre-commit Hook Tooling
- Use **Lefthook** (not Husky) as the git hook manager
- ESLint runs on staged `.ts`/`.tsx` files only — fast, not full project
- ESLint runs in auto-fix mode: auto-fixable errors are corrected and re-staged; unfixable errors block the commit
- TypeScript type check runs on staged files only (via lefthook globs, not full `tsc`)
- **Conventional commit format enforced** via a `commit-msg` hook — messages must follow `type(scope): description` pattern

### Secrets Scanning
- Use **gitleaks** (not truffleHog or GitHub secret scanning)
- Run gitleaks against full git history as a one-time audit during this phase
- If findings are detected: document them, rotate affected keys immediately, leave git history as-is (no destructive history rewrite)
- Add gitleaks as a **pre-commit hook via lefthook** to block commits that introduce new secrets
- Use gitleaks default ruleset — no custom `.gitleaks.toml` config needed

### Dependabot
- Weekly frequency — one batch per week
- Group all npm updates into a **single PR per week** (not individual PRs per package)
- Monitor both **npm packages and GitHub Actions** workflow dependencies
- All Dependabot PRs require **manual review** — no auto-merge (revisit after Phase 20 CI is live)

### Claude's Discretion
- Exact CSP directive values beyond script-src and connect-src (img-src, style-src, font-src, frame-src, etc.)
- Which day of the week Dependabot runs
- Lefthook config file structure and exact glob patterns
- Conventional commit regex pattern for commit-msg hook

</decisions>

<specifics>
## Specific Ideas

- CSP starts in report-only mode — this means the plan should include a clear note/comment in next.config.ts explaining how to switch to enforcing mode
- The gitleaks history scan result (zero findings or documented findings with rotation) should be captured in a commit message or brief note

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-security-dev-tooling*
*Context gathered: 2026-02-27*
