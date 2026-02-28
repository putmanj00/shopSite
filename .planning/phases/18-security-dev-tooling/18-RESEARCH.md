# Phase 18: Security & Dev Tooling - Research

**Researched:** 2026-02-27
**Domain:** Security hardening (HTTP headers, secrets scanning) + developer experience tooling (git hooks, Dependabot)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**CSP Policy**
- Use `'unsafe-inline'` for script-src — no nonce-based approach (simpler, avoids middleware complexity)
- All security headers live in `next.config.ts` headers() array — no middleware.ts needed
- Allow these external domains in script-src and connect-src: Shopify (`*.shopify.com`, `*.myshopify.com`) + Google Analytics (`*.google-analytics.com`, `*.googletagmanager.com`)
- Deploy CSP as `Content-Security-Policy-Report-Only` first to observe violations, then switch to enforcing once confirmed clean
- Also set: HSTS, X-Frame-Options (DENY), X-Content-Type-Options (nosniff)

**Pre-commit Hook Tooling**
- Use **Lefthook** (not Husky) as the git hook manager
- ESLint runs on staged `.ts`/`.tsx` files only — fast, not full project
- ESLint runs in auto-fix mode: auto-fixable errors are corrected and re-staged; unfixable errors block the commit
- TypeScript type check runs on staged files only (via lefthook globs, not full `tsc`)
- **Conventional commit format enforced** via a `commit-msg` hook — messages must follow `type(scope): description` pattern

**Secrets Scanning**
- Use **gitleaks** (not truffleHog or GitHub secret scanning)
- Run gitleaks against full git history as a one-time audit during this phase
- If findings are detected: document them, rotate affected keys immediately, leave git history as-is (no destructive history rewrite)
- Add gitleaks as a **pre-commit hook via lefthook** to block commits that introduce new secrets
- Use gitleaks default ruleset — no custom `.gitleaks.toml` config needed

**Dependabot**
- Weekly frequency — one batch per week
- Group all npm updates into a **single PR per week** (not individual PRs per package)
- Monitor both **npm packages and GitHub Actions** workflow dependencies
- All Dependabot PRs require **manual review** — no auto-merge (revisit after Phase 20 CI is live)

### Claude's Discretion
- Exact CSP directive values beyond script-src and connect-src (img-src, style-src, font-src, frame-src, etc.)
- Which day of the week Dependabot runs
- Lefthook config file structure and exact glob patterns
- Conventional commit regex pattern for commit-msg hook

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-01 | Security headers on all responses — CSP (allows `*.shopify.com`, `checkout.shopify.com`), HSTS, X-Frame-Options, X-Content-Type-Options | Next.js `headers()` in `next.config.ts`, verified via official docs |
| SEC-02 | Existing git history scanned for committed secrets — clean confirmed | gitleaks `git -v` command scans full history; zero findings expected based on .gitignore audit |
| SEC-03 | All `.env*` files verified in `.gitignore` | Already in .gitignore (`.env*` pattern); no env files found in git history |
| DEVX-01 | Pre-commit hook runs ESLint on staged files before every commit | Lefthook `pre-commit` with `{staged_files}` + `stage_fixed: true` |
| DEVX-02 | Pre-commit hook runs TypeScript type-check before every commit | Lefthook `pre-commit` with `glob: "*.{ts,tsx}"` + `npx tsc --noEmit` |
| CICD-06 | Dependabot configured to open PRs for npm dependency updates weekly | `.github/dependabot.yml` with `package-ecosystem: npm` + `groups` |
</phase_requirements>

---

## Summary

This phase covers three distinct concerns that share a common theme: catching problems before they reach production. Security headers harden every HTTP response against XSS, clickjacking, and MIME sniffing attacks. Secrets scanning closes the barn door retroactively (history audit) and going forward (pre-commit hook). Git hooks ensure code quality gates run automatically without relying on developer discipline.

The project's current state is favorable: `.env*` is already in `.gitignore` and no env files exist in git history (verified via `git log --all --full-history`). The ESLint config uses the modern flat config format (`eslint.config.mjs`) with `eslint-config-next`. No Lefthook, Husky, or gitleaks tooling currently exists — this phase installs everything from scratch.

The locked decision to use `'unsafe-inline'` for script-src and deploy via `next.config.ts` (not middleware) is the right tradeoff for this site. The nonce-based approach documented in Next.js official docs forces dynamic rendering on all pages and kills CDN cacheability — unacceptable for a primarily static storefront. The `next.config.ts` `headers()` approach with `unsafe-inline` is what Next.js themselves recommend for applications not requiring strict nonce-based CSP.

**Primary recommendation:** Install Lefthook via npm devDependency (package: `lefthook`), configure `lefthook.yml` with parallel pre-commit commands for ESLint + typecheck + gitleaks, add commit-msg hook for conventional commits validation, then write `.github/dependabot.yml`. Security headers go into `next.config.ts` `headers()` as `Content-Security-Policy-Report-Only` first.

---

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| Lefthook | 2.1.1 (npm `lefthook`) | Git hooks manager | Zero-dependency Go binary; npm postinstall auto-installs hooks; parallel execution; `stage_fixed` for ESLint auto-fix; cleaner YAML config vs Husky shell scripts |
| gitleaks | 8.24.2+ (install via brew) | Secrets scanning | Purpose-built for git history; comprehensive default ruleset covers AWS, GitHub, Shopify tokens, API keys; used industry-wide |
| Next.js `headers()` | Built-in to Next.js 16.1.1 | HTTP security headers | Zero new dependencies; applies to all routes via `source: '/(.*)'`; no middleware complexity |
| GitHub Dependabot | GitHub-native (no install) | Automated dependency PRs | Already available on any GitHub repo; groups feature batches updates; zero maintenance |

### Supporting

| Library / Tool | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| `@evilmartians/lefthook` | 2.1.1 | Alt npm package that installs executables for ALL OS platforms | Use instead of `lefthook` if team works across different OSes (Linux, macOS, Windows) |
| `commit-message-validator` (npm) | optional | Commit message validation binary | Only if you don't want a shell regex in the commit-msg hook |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lefthook | Husky | Husky requires shell scripts and `chmod +x` gymnastics; Lefthook is faster, YAML-based, and handles `stage_fixed` natively |
| Lefthook | lint-staged + Husky | More npm packages, more config; Lefthook replaces both |
| gitleaks (brew) | pre-commit framework + gitleaks hook | pre-commit Python dep adds complexity; direct gitleaks install is simpler for a Node project |
| Custom regex commit-msg | commitlint | commitlint is another npm devDep; for this use case, a shell regex in the hook is sufficient and adds zero dependencies |

**Installation:**

```bash
# Lefthook (npm devDependency — postinstall auto-runs lefthook install)
npm install --save-dev lefthook

# gitleaks (system install via brew — not in package.json)
brew install gitleaks

# Then initialize lefthook config (creates lefthook.yml if not exists)
npx lefthook install
```

---

## Architecture Patterns

### Recommended File Structure

```
shopSite/
├── next.config.ts           # Security headers go here (headers() function)
├── lefthook.yml             # Git hooks config (pre-commit + commit-msg)
├── .github/
│   └── dependabot.yml       # Dependabot version updates config
└── .gitignore               # Already contains .env* (no changes needed)
```

No new source directories are needed. All changes are config files in the project root and `.github/`.

---

### Pattern 1: Security Headers via next.config.ts headers()

**What:** Add an async `headers()` function to `next.config.ts` that returns HTTP security headers applied to all routes via the wildcard source `'/(.*)'`.

**When to use:** Any time you need headers on all responses without middleware complexity.

**Key insight from official docs:** The `next.config.ts` approach only works with `unsafe-inline` CSP (or static hashes). For nonce-based CSP you need middleware, but that forces dynamic rendering. The user decision to use `unsafe-inline` is correct for this use case.

**Example (source: https://nextjs.org/docs/app/guides/content-security-policy):**

```typescript
// next.config.ts
import type { NextConfig } from "next";
import createMDX from '@next/mdx';

// Set to true once CSP violations have been observed and confirmed clean
const CSP_ENFORCE = false;

const cspDirectives = [
  "default-src 'self'",
  // unsafe-inline required for Next.js inline scripts; no nonce approach
  // unsafe-eval added in dev only (React uses eval for error overlays)
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.shopify.com *.myshopify.com *.google-analytics.com *.googletagmanager.com"
    : "script-src 'self' 'unsafe-inline' *.shopify.com *.myshopify.com *.google-analytics.com *.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com",
  "img-src 'self' blob: data: cdn.shopify.com *.shopify.com *.google-analytics.com",
  "connect-src 'self' *.shopify.com *.myshopify.com *.google-analytics.com *.googletagmanager.com",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  {
    key: CSP_ENFORCE
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only',
    value: cspDirectives,
  },
  {
    // max-age=63072000 = 2 years; includeSubDomains; preload for HSTS preload list
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // DENY: no framing at all (more restrictive than SAMEORIGIN)
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

const withMDX = createMDX({});
export default withMDX(nextConfig);
```

**IMPORTANT: Add a comment block** explaining the `CSP_ENFORCE = false` flag and how to switch to enforcing mode. This is a locked decision from CONTEXT.md.

---

### Pattern 2: Lefthook Pre-commit + Commit-msg Hooks

**What:** `lefthook.yml` at project root defines hooks. `lefthook` npm package's postinstall script runs `lefthook install` automatically when developers run `npm install`.

**When to use:** All git repos in Node.js projects — installs once, runs automatically forever.

**Key findings:**
- The npm package name is `lefthook` (not `@arkweid/lefthook` which is deprecated, not `@evilmartians/lefthook` which is the multi-platform variant)
- `postinstall` in the `lefthook` package runs `lefthook install` automatically — **no `prepare` script needed** in `package.json`
- The `{staged_files}` token passes staged files to commands
- `stage_fixed: true` re-stages files after ESLint auto-fix so the fix is included in the commit
- For TypeScript typecheck: `tsc --noEmit` doesn't support per-file arguments — it always runs the whole project. The `glob` in lefthook acts as a gate (only run the command if matching staged files exist), but the `tsc` command itself checks all files. This is correct behavior — type errors anywhere matter even if you only changed one file.
- `commit-msg` hook receives the commit message file path as argument `{1}`

**Example lefthook.yml:**

```yaml
# Source: official lefthook docs + verified community patterns
pre-commit:
  parallel: true
  commands:
    eslint:
      glob: "*.{ts,tsx}"
      run: npx eslint --fix {staged_files}
      stage_fixed: true
    typecheck:
      glob: "*.{ts,tsx}"
      run: npx tsc --noEmit
    gitleaks:
      run: gitleaks protect --staged --source .

commit-msg:
  commands:
    conventional-commits:
      run: |
        MSG=$(cat {1})
        PATTERN='^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\([a-zA-Z0-9_.-]+\))?(!)?:\s.+'
        if ! echo "$MSG" | grep -qE "$PATTERN"; then
          echo "ERROR: Commit message must follow Conventional Commits format."
          echo "  Valid: feat(scope): description"
          echo "  Types: feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert"
          exit 1
        fi
```

**package.json change** — add `"prepare": "lefthook install"` as a safety net for environments where postinstall doesn't run:

```json
{
  "scripts": {
    "prepare": "lefthook install"
  }
}
```

---

### Pattern 3: gitleaks History Audit

**What:** One-time command to scan full git history for secrets. Run once during this phase, capture result.

**Commands (verified from gitleaks v8 README):**

```bash
# One-time history audit (run during phase execution)
gitleaks git -v .

# Pre-commit protection (only staged files) — used in lefthook.yml
gitleaks protect --staged --source .
```

**Key finding:** In gitleaks v8, `detect` and `protect` commands are deprecated in favor of `git`, `dir`, and `stdin`. However `protect --staged` remains the recommended approach for pre-commit staged file scanning as of v8.24.2. The `git` subcommand replaces `detect` for history scanning.

**If findings detected:** Document in commit message. Rotate affected credentials immediately. Do NOT rewrite history — the user decision explicitly prohibits this.

---

### Pattern 4: Dependabot Configuration

**What:** `.github/dependabot.yml` tells GitHub's Dependabot to check for updates. `.github/` directory must be created — it doesn't exist yet in this repo.

**Key findings:**
- `groups` key batches multiple package updates into one PR per group
- `github-actions` is a valid `package-ecosystem` value, scoped to `.github/workflows/` automatically
- `directory: "/"` is correct for both npm and github-actions
- Since there are no GitHub Actions workflows yet (Phase 20 creates them), the `github-actions` entry will effectively be dormant but harmless

**Example .github/dependabot.yml:**

```yaml
# Source: https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    groups:
      all-npm-dependencies:
        patterns:
          - "*"
    open-pull-requests-limit: 5

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
```

**Note:** No `automerge` config — all PRs require manual review (locked decision).

---

### Anti-Patterns to Avoid

- **Setting `Content-Security-Policy` (enforcing) from day one:** Start with `Content-Security-Policy-Report-Only`. Shopify's checkout redirect, Google Analytics, and Next.js internal scripts will likely produce violations that need whitelisting before enforcement. Going straight to enforcing will break checkout.
- **Scanning only new changes with gitleaks during history audit:** Use `gitleaks git -v .` (scans entire history via `git log -p`), not `gitleaks dir` (scans filesystem only). Secrets committed and then deleted still exist in history.
- **Running `tsc` only on staged files:** TypeScript's type-checker is whole-program. You cannot typecheck a single file in isolation without missing cross-file type errors. Use glob as a trigger but run `tsc --noEmit` project-wide.
- **Putting gitleaks in devDependencies:** gitleaks is a system binary installed via brew, not an npm package. Don't try to install it via npm.
- **Using `@arkweid/lefthook` package:** This is the deprecated old scoped name. Use the plain `lefthook` npm package.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secrets in git history detection | Custom regex grep over git log | gitleaks | Hundreds of rules covering cloud providers, tokens, API keys; handles binary diffs, encoding variations, base64 |
| Git hook management | Shell scripts in `.git/hooks/` | Lefthook | `.git/hooks/` are not committed to git; hand-rolled hooks aren't shared across the team; Lefthook commits the config, installs on `npm install` |
| Commit message validation | Custom commitlint config + deps | Shell regex in lefthook commit-msg hook | One npm package fewer; regex pattern is sufficient for `type(scope): description` enforcement without a full parser |
| Dependency update PRs | Manually checking npm outdated | Dependabot | GitHub-native, zero maintenance, never forgets |

**Key insight:** The security domain is full of deceptively complex edge cases. Secrets can be base64-encoded, URL-encoded, or split across lines. CSP directives interact with each other in non-obvious ways. Use dedicated tools — don't hand-roll detection or header building logic.

---

## Common Pitfalls

### Pitfall 1: CSP Breaks Shopify Checkout Redirect

**What goes wrong:** After enabling enforcing CSP, clicking "Checkout" either silently fails or shows a console error because `checkout.shopify.com` or `*.myshopify.com` is blocked by `form-action` or `connect-src`.
**Why it happens:** Next.js Storefront API calls go to `*.myshopify.com`; checkout redirect goes to `checkout.shopify.com`. Both must be in `connect-src` and the redirect must be in `form-action`.
**How to avoid:** Use `Content-Security-Policy-Report-Only` first. Check browser console during a full checkout flow before switching to enforcing. Include `form-action 'self' *.shopify.com checkout.shopify.com` in the directive.
**Warning signs:** Checkout button does nothing or console shows CSP violation for `shopify.com` origins.

### Pitfall 2: Lefthook Not Installing for New Developers

**What goes wrong:** New developer clones repo, runs `npm install`, but pre-commit hooks never run because `lefthook install` wasn't triggered.
**Why it happens:** The `lefthook` npm postinstall script runs `lefthook install` automatically, but in some environments (CI, LEFTHOOK=0 env var) it is skipped.
**How to avoid:** Add `"prepare": "lefthook install"` to `package.json` scripts as a safety net. The `prepare` lifecycle runs before `npm publish` and after `npm install` in non-CI environments.
**Warning signs:** Developer commits lint errors or bad commit messages without being blocked.

### Pitfall 3: gitleaks False Positives on Example/Fixture Files

**What goes wrong:** gitleaks flags `.env.example`, test fixtures, or documentation examples as secrets because they contain placeholder values that match token patterns (e.g., `your_storefront_access_token`).
**Why it happens:** The default ruleset matches patterns, not semantics. Template values with realistic formats trigger rules.
**How to avoid:** Run the history audit with `-v` to inspect findings before treating them as real secrets. For false positives in `.env.example`, add an `allowlist` entry in `.gitleaks.toml` (user decision: no custom config needed initially — revisit if false positives appear).
**Warning signs:** History audit flags `.env.example` or `README.md` examples.

### Pitfall 4: TypeScript tsc Slows the Pre-commit Hook

**What goes wrong:** `tsc --noEmit` on the whole project takes 15-30 seconds, making pre-commit hooks feel sluggish.
**Why it happens:** TypeScript always type-checks the whole project. There is no native "typecheck only staged files" mode.
**How to avoid:** Accept the tradeoff — full typecheck on pre-commit is the correct behavior. If it becomes too slow, consider moving typecheck to pre-push instead and keeping only ESLint on pre-commit. But start with pre-commit as the user decided.
**Warning signs:** Developers bypass hooks with `git commit --no-verify` due to slowness.

### Pitfall 5: HSTS Locks Out HTTP Development

**What goes wrong:** After setting `Strict-Transport-Security`, local development on `http://localhost:3000` may behave unexpectedly in some browsers that cache HSTS.
**Why it happens:** Browsers may apply HSTS to localhost if the header is served without path/domain scoping.
**How to avoid:** This is generally safe for localhost because `max-age=63072000` applies to the served domain. HSTS on localhost does not persist meaningfully. No special action needed — just verify dev server still works after the change.

### Pitfall 6: Dependabot PRs Against Non-Existent GitHub Actions

**What goes wrong:** `package-ecosystem: "github-actions"` in dependabot.yml may produce a warning or error if no `.github/workflows/` directory exists yet.
**Why it happens:** Dependabot looks for workflow files to parse Actions references. No workflows = nothing to update.
**How to avoid:** This is harmless — Dependabot silently skips when no workflows exist. The config is forward-looking for Phase 20. Include it anyway.

---

## Code Examples

Verified patterns from official sources:

### Complete next.config.ts with Security Headers

```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
// Source: https://nextjs.org/docs/app/guides/content-security-policy
import type { NextConfig } from "next";
import createMDX from '@next/mdx';

// FLIP TO TRUE after confirming zero CSP violations in browser console
// and securityheaders.com report looks good.
const CSP_ENFORCE = false;

const isDev = process.env.NODE_ENV === 'development';

const cspValue = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev ? "'unsafe-eval'" : '',
    '*.shopify.com *.myshopify.com',
    '*.google-analytics.com *.googletagmanager.com',
  ].filter(Boolean).join(' '),
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com",
  "img-src 'self' blob: data: cdn.shopify.com *.shopify.com *.google-analytics.com",
  "connect-src 'self' *.shopify.com *.myshopify.com checkout.shopify.com *.google-analytics.com *.googletagmanager.com",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.shopify.com checkout.shopify.com",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  {
    key: CSP_ENFORCE ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    value: cspValue,
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

const withMDX = createMDX({});
export default withMDX(nextConfig);
```

### lefthook.yml

```yaml
# Source: https://lefthook.dev/
# Install: npm install --save-dev lefthook && npx lefthook install
pre-commit:
  parallel: true
  commands:
    eslint:
      glob: "*.{ts,tsx}"
      run: npx eslint --fix {staged_files}
      stage_fixed: true
    typecheck:
      glob: "*.{ts,tsx}"
      run: npx tsc --noEmit
    gitleaks:
      run: gitleaks protect --staged --source .

commit-msg:
  commands:
    conventional-commits:
      run: |
        MSG=$(cat {1})
        PATTERN='^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\([a-zA-Z0-9_.-]+\))?(!)?:\s.+'
        if ! echo "$MSG" | grep -qE "$PATTERN"; then
          echo ""
          echo "ERROR: Commit message does not follow Conventional Commits format."
          echo "  Required: type(scope): description"
          echo "  Example:  feat(header): add mobile navigation"
          echo "  Types:    feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert"
          echo ""
          exit 1
        fi
```

### .github/dependabot.yml

```yaml
# Source: https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    groups:
      all-npm-dependencies:
        patterns:
          - "*"
    open-pull-requests-limit: 5

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
```

### gitleaks History Audit Command

```bash
# Source: https://github.com/gitleaks/gitleaks (README)
# Scan full git history — run once during this phase
gitleaks git -v .

# If findings: document them in commit message, rotate keys
# Do NOT rewrite history
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Husky + lint-staged | Lefthook | ~2021-2022 | Single tool replaces two; YAML config committed to git; faster parallel execution |
| `gitleaks detect` / `gitleaks protect` | `gitleaks git` / `gitleaks protect --staged` | v8.19.0 | `detect` deprecated but still works; `git` is the modern subcommand for history scanning |
| CSP via middleware.ts | CSP via next.config.ts headers() (for unsafe-inline) | Next.js 13+ | Middleware CSP required for nonces; config-based CSP is simpler and correct for unsafe-inline |
| Individual Dependabot PRs per package | Grouped Dependabot PRs | GitHub 2023 | `groups` key in dependabot.yml batches all updates into one PR; dramatically reduces PR noise |

**Deprecated/outdated:**
- `@arkweid/lefthook` npm package: use `lefthook` instead
- `gitleaks detect` subcommand: deprecated in v8.19.0; use `gitleaks git` for history, `gitleaks protect --staged` for pre-commit
- `.eslintrc.json` / `.eslintrc.js`: project already uses modern flat config (`eslint.config.mjs`) — no changes needed to ESLint config format

---

## Open Questions

1. **gitleaks system dependency on developer machines**
   - What we know: gitleaks is installed via `brew install gitleaks`, not npm. It is a required binary for the pre-commit hook to function.
   - What's unclear: How to handle machines where gitleaks is not installed when the pre-commit hook fires (e.g., a developer without brew who cloned the repo).
   - Recommendation: Document the gitleaks installation requirement in the commit message or a brief note. Lefthook will fail gracefully with a "command not found" error rather than silently passing. Consider adding a `fail_text` message in the lefthook job to guide developers.

2. **CSP violations during Report-Only phase**
   - What we know: Report-Only violations appear in browser DevTools console but don't block anything.
   - What's unclear: Whether `*.google-analytics.com` and `*.googletagmanager.com` cover all GA4 + GTM endpoints (some use `analytics.google.com` or `stats.g.doubleclick.net`).
   - Recommendation: After deploying Report-Only headers, manually check browser console during a full user session. Capture any violations and add missing domains before switching to enforcing.

3. **Conventional commit regex for merge commits and Dependabot**
   - What we know: Dependabot creates PRs with titles like `Bump next from 16.1.1 to 16.1.2` — not conventional commit format.
   - What's unclear: Whether the commit-msg hook will block merge commits or Dependabot squash-merges.
   - Recommendation: The commit-msg hook only runs locally, not on GitHub PR merges. Dependabot PRs are merged via GitHub UI where the hook doesn't run. No problem here — but document this so it's understood.

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/api-reference/config/next-config-js/headers — Next.js headers() API, verified version 16.1.6 docs (matching project's 16.1.1)
- https://nextjs.org/docs/app/guides/content-security-policy — Next.js official CSP guide including unsafe-inline vs nonce tradeoffs, without-nonces example

### Secondary (MEDIUM confidence)
- https://github.com/gitleaks/gitleaks — gitleaks README: install, subcommands (`git`, `protect --staged`), version v8.24.2 reference
- https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates — Dependabot configuration, groups, github-actions ecosystem
- WebSearch (lefthook npm package) — confirmed package name is `lefthook`, version 2.1.1, postinstall auto-installs hooks; cross-referenced with https://github.com/evilmartians/lefthook
- WebSearch (lefthook configuration) — `{staged_files}`, `stage_fixed: true`, `parallel: true`, `commit-msg` hook patterns; cross-referenced with multiple sources

### Tertiary (LOW confidence — flag for validation)
- Conventional commit regex pattern `^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\([a-zA-Z0-9_.-]+\))?(!)?:\s.+` — sourced from community gists and blog posts, not a formal specification. The official Conventional Commits spec at https://conventionalcommits.org defines the format but not a canonical regex.
- gitleaks `protect --staged` command for pre-commit staged scanning — gitleaks v8 deprecated `protect` in v8.19.0 but community sources confirm `protect --staged` still works for pre-commit use. Verify after installation: `gitleaks protect --help`.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js headers() is official API; Lefthook and gitleaks are current-generation tools verified via official repos and recent (2025/2026) community sources; Dependabot is GitHub-native
- Architecture: HIGH — All patterns sourced from official docs or verified community sources with version numbers; existing project structure audited
- Pitfalls: MEDIUM-HIGH — CSP/Shopify pitfall is domain knowledge; lefthook postinstall pitfall verified from GitHub issues; gitleaks `protect --staged` command flag has LOW-confidence footnote

**Research date:** 2026-02-27
**Valid until:** 2026-04-01 (30 days — tools are stable; gitleaks subcommand naming worth rechecking if installing months later)
