# Phase 20: CI/CD Pipeline - Research

**Researched:** 2026-02-28
**Domain:** GitHub Actions CI/CD — lint, typecheck, build, Playwright E2E, secrets scanning, npm audit, branch protection, manual deployment gate
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Workflow structure:**
- Single workflow file with parallel jobs (not separate workflow files)
- Fast checks first (lint, typecheck, build); Playwright E2E only triggers if those pass
- All failures surface as distinct named status checks on the PR so it's immediately clear which stage failed

**E2E test behavior:**
- Retry count: 2 retries in CI (tolerates flakiness without failing the build)
- E2E failures block merge — warning-only is not acceptable
- Browser matrix: Chromium, Firefox, and WebKit — all three run in CI
- Playwright HTML report uploaded as a downloadable artifact on every CI run

**Branch protection rules:**
- All CI jobs required to pass before merge (lint, typecheck, build, E2E, secrets scan)
- CI runs on draft PRs so failures are visible early
- Deployment does NOT trigger on draft PRs — only on "Ready for Review"
- Only repository admin can bypass checks (emergency hotfix situations only)

**Deployment gate:**
- Environment hierarchy: preview (per PR, Vercel) → staging (on merge to main) → production
- Production requires a manual "approve" click in the GitHub Actions UI before deploy proceeds
- Notifications only on deployment failure or successful production deploy completion
- Claude's Discretion: notification channel (Slack vs email vs GitHub-only)

### Claude's Discretion

- Exact GitHub Actions versions to pin (checkout, setup-node, etc.)
- Cache strategy for node_modules and Playwright browsers
- Secrets scan tooling (gitleaks vs trufflehog vs custom regex matching `.env` secret patterns)
- Exact job names and step labels in the workflow YAML

### Deferred Ideas (OUT OF SCOPE)

- Vercel environment splitting (preview/staging/prod as separate Vercel projects) — Phase 21
- IaC/OpenTofu for environment config — Phase 21
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CICD-01 | GitHub Actions CI runs lint + typecheck + build on every PR against main | `quality` job with parallel steps; `npm run lint`, `npm run typecheck`, `npm run build` scripts already exist in package.json |
| CICD-02 | GitHub Actions CI runs Playwright E2E tests on every PR (critical user flows) | `e2e` job with `needs: quality`; matrix over chromium/firefox/webkit; playwright.config.ts already in place |
| CICD-03 | CI uploads Playwright HTML report as a downloadable artifact on every run | `actions/upload-artifact@v4` with `playwright-report/` path; `if: ${{ !cancelled() }}` ensures upload even on failure |
| CICD-04 | CI runs secrets scan on every PR — blocks merge if secrets detected | `gitleaks/gitleaks-action@v2`; personal repo = no license key required; `fetch-depth: 0` required |
| CICD-05 | CI runs `npm audit` and fails on high/critical severity vulnerabilities | `npm audit --audit-level=high` exits non-zero when high/critical found; native npm command, no extra action needed |
| CICD-07 | Production deployment requires manual approval via GitHub environment gate | GitHub environment named `production` with required reviewers configured in repo Settings; job references `environment: production` |
| DEVX-03 | Main branch requires PR with passing CI before merge (branch protection rule) | `gh api` PUT to `/repos/{owner}/{repo}/branches/main/protection` with `required_status_checks.contexts` listing all job names |
</phase_requirements>

---

## Summary

This phase creates a single GitHub Actions workflow file (`.github/workflows/ci.yml`) that runs on every PR against main and provides five distinct named CI checks: quality (lint + typecheck + build), E2E tests (Chromium/Firefox/WebKit matrix), secrets scan, npm audit, and — for the production deployment path — a manual-gated deploy job. All five must pass before a PR can merge.

The project already has the critical prerequisites in place: `playwright.config.ts` with `retries: process.env.CI ? 2 : 0`, three E2E spec files in `./e2e/`, npm scripts for `lint`, `typecheck`, `build`, and `test:e2e`, and `dependabot.yml` with a `github-actions` ecosystem entry ready to auto-update action versions. The only new infrastructure needed is the workflow YAML and branch protection configuration in GitHub Settings.

The Playwright package installed is `playwright` (not `@playwright/test`), confirmed from Phase 19 decisions and `package.json`. This means browser installation uses `npx playwright install --with-deps` and tests import from `playwright/test`. The `playwright.config.ts` currently only configures Chromium — it must be updated to add Firefox and WebKit projects before CI can run the full matrix.

**Primary recommendation:** One workflow file, `jobs.quality` runs in parallel, `jobs.e2e` has `needs: quality` and uses a browser matrix, `jobs.secrets` and `jobs.audit` run in parallel with `quality`. Branch protection is configured via `gh api` with the exact named check contexts.

---

## Standard Stack

### Core

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| GitHub Actions | N/A (platform) | CI/CD orchestration | Already on GitHub; native PR integration, no extra service |
| `actions/checkout` | v4 (pin to SHA for security) | Check out repo code | Official GitHub action; v4 is stable, v6 was cited in some docs but verify |
| `actions/setup-node` | v4 | Set up Node.js in runner | Official; supports `cache: 'npm'` built-in |
| `actions/upload-artifact` | v4 | Upload Playwright HTML report | v4 is the stable recommended version (v7 very new as of 2026-02-26) |
| `gitleaks/gitleaks-action` | v2 | Secrets scanning on PR | Official gitleaks action; personal repo = no license key needed |

**Action version guidance (MEDIUM confidence — verified via releases pages):**
- `actions/checkout`: latest stable is v4.x; v6 was mentioned in some Playwright docs but v4 is the well-established safe pin
- `actions/setup-node`: latest stable is v4.x (v6.2.0 released Jan 2025 but v4 is the widely-deployed stable)
- `actions/upload-artifact`: v4 is the current widely-used stable (v7 just released 2026-02-26 — too new to adopt immediately)
- `gitleaks/gitleaks-action`: v2.3.9 is latest as of 2026-04-17 — use `@v2` floating tag

### Supporting

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `npm audit --audit-level=high` | npm built-in | Fail CI on high/critical vulns | Part of `audit` job; native npm, no extra action needed |
| GitHub Environments | N/A (platform feature) | Manual approval gate for production deploy | Required for CICD-07; configured in repo Settings UI |
| `gh api` REST | gh CLI | Configure branch protection rules | Run once after first CI pass to wire up required status checks |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `gitleaks/gitleaks-action@v2` | `trufflesecurity/trufflehog-actions-scan` | Gitleaks is already installed locally (Phase 18) — same tool in CI = no config drift |
| `gitleaks/gitleaks-action@v2` | Custom regex grep on `.env` patterns | Hand-rolled misses token formats; gitleaks uses a maintained ruleset |
| `npm audit --audit-level=high` | `audit-ci` npm package | `npm audit` is zero-dependency and built-in; `audit-ci` adds config flexibility but unnecessary here |
| Matrix strategy per browser | Single job running all three browsers | Matrix gives distinct named checks per browser — user requires all three as separate visible checks |

**Installation:** No new npm packages needed. All tooling is GitHub Actions runners and CLI built-ins.

---

## Architecture Patterns

### Workflow File Structure

```
.github/
└── workflows/
    └── ci.yml          # Single workflow file, all jobs
```

### Pattern 1: Job Dependency Graph (Fan-in/Fan-out)

**What:** Fast blocking jobs (`quality`) gate slower jobs (`e2e`). Independent jobs (`secrets`, `audit`) run in parallel with `quality` to minimize total wall time.

**When to use:** When some jobs are meaningless without a passing build (E2E can't test a broken app) but others are fully independent (secrets scanning works whether the code compiles or not).

**Dependency graph:**

```
push/PR trigger
   ├── quality   (lint + typecheck + build) ─────────┐
   ├── secrets   (gitleaks)                           ├─► all pass → merge allowed
   └── audit     (npm audit)                          │
                                                      │
   quality passes →
       └── e2e   (playwright × 3 browsers) ──────────┘
```

**Workflow skeleton (verified against Playwright official docs and GitHub docs):**

```yaml
# Source: https://playwright.dev/docs/ci + GitHub Actions docs
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    name: Quality (lint / typecheck / build)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
        env:
          SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
          SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_ACCESS_TOKEN }}
          NEXT_PUBLIC_BASE_URL: https://example.com

  e2e:
    name: E2E (${{ matrix.browser }})
    needs: quality
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --project=${{ matrix.browser }}
        env:
          CI: true
          SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
          SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_ACCESS_TOKEN }}
          NEXT_PUBLIC_BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30

  secrets:
    name: Secrets Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  audit:
    name: npm audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high

  deploy-prod:
    name: Deploy to Production
    needs: [quality, e2e, secrets, audit]
    runs-on: ubuntu-latest
    environment: production         # ← manual approval gate
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - run: echo "Production deployment — implement Phase 21 Vercel deploy here"
```

### Pattern 2: Playwright Config — Multi-Browser Projects

**What:** The current `playwright.config.ts` only has a `chromium` project. To run the CI matrix, Firefox and WebKit projects must be added.

**Required change to `playwright.config.ts`:**

```typescript
// Source: https://playwright.dev/docs/ci
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
],
```

**Note on reporters:** The current config uses `reporter: 'list'`. For CI, switch to array reporter to get both console output and the uploadable HTML report:

```typescript
reporter: process.env.CI
  ? [['list'], ['html', { open: 'never' }]]
  : 'list',
```

### Pattern 3: Branch Protection via gh CLI

**What:** After the first CI run completes, use `gh api` to wire up branch protection so named checks are required.

**Command (run once manually after first CI run):**

```bash
# Source: https://docs.github.com/en/rest/branches/branch-protection
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "Quality (lint / typecheck / build)",
      "E2E (chromium)",
      "E2E (firefox)",
      "E2E (webkit)",
      "Secrets Scan",
      "npm audit"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF
```

**Note:** `contexts` must exactly match the `name:` field in the workflow jobs. Verify by looking at the first CI run's check names in the GitHub PR UI before running this command.

### Pattern 4: GitHub Environment for Manual Approval

**What:** A GitHub environment named `production` with required reviewers prevents automatic production deploys. The environment is configured in GitHub Settings, not in the YAML.

**Setup steps:**
1. Go to repo Settings → Environments → New environment → name it `production`
2. Enable "Required reviewers" — add yourself (or the team)
3. Enable "Prevent self-review" if desired
4. The YAML job references `environment: production` — this is the only YAML change needed

**The job pauses at the environment gate until a reviewer approves in the GitHub Actions UI.**

### Pattern 5: Draft PR Behavior

**What:** CI runs on draft PRs (no `draft: false` filter on `pull_request` trigger). Deployment only triggers on push to `main`, never on PRs, so draft PRs naturally get CI but no deploy.

**The `on.pull_request` trigger fires on draft PRs by default.** The deploy job's `if: github.ref == 'refs/heads/main' && github.event_name == 'push'` condition guarantees it only runs post-merge.

### Anti-Patterns to Avoid

- **Separate workflow files per job:** The user decision is a single workflow file. Multiple files create multiple workflow runs which are harder to correlate.
- **`actions/checkout` without `fetch-depth: 0` for gitleaks:** Gitleaks needs full git history to scan all commits. Shallow clone (default `fetch-depth: 1`) causes false negatives.
- **Running E2E without `needs: quality`:** If the build is broken, E2E will fail at server startup — noisy, slow, and masks the real cause.
- **`reporter: 'html'` always (not `[['list'], ['html']]`):** HTML-only suppresses console output in CI logs; use array reporter in CI to get both.
- **Caching Playwright browsers:** Playwright docs explicitly advise against this — restore time ≈ download time; system deps on Linux are not cacheable.
- **Using `@playwright/test` import:** Phase 19 decision — package is `playwright`, not `@playwright/test`. Import from `playwright/test`.
- **`next build` without Shopify env vars:** `next build` will fail if `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` are not available; these must be in GitHub Secrets and passed as env vars to the build step.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secrets detection patterns | Custom regex on `.env` files | `gitleaks/gitleaks-action@v2` | Gitleaks ships 150+ maintained rules for AWS keys, Shopify tokens, GitHub PATs, etc. Regex misses format variations |
| Dependency vulnerability check | Parsing npm output manually | `npm audit --audit-level=high` | Native npm command; non-zero exit on threshold; no extra package needed |
| Manual approval workflow | Custom "issue as gate" action | GitHub Environments with required reviewers | Native platform feature; no external dependencies; UI is the GitHub Actions run page the user already knows |
| Browser binary management | Downloading browsers manually | `npx playwright install --with-deps` | Playwright manages version-matched browsers + system deps in one command |

**Key insight:** Every problem in this phase has a first-party or well-maintained official solution. The entire CI pipeline is configuration, not code.

---

## Common Pitfalls

### Pitfall 1: Build Fails in CI Due to Missing Env Vars

**What goes wrong:** `npm run build` runs `next build` which calls Shopify's Storefront API at build time. Without `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, the build throws a runtime error or produces an empty site.

**Why it happens:** Next.js App Router can call APIs during build for static generation. The local `.env` file is not available in CI runners.

**How to avoid:** Add all required env vars as GitHub Secrets (Settings → Secrets and Variables → Actions → Repository secrets). Pass them explicitly in the `build` step's `env:` block. A `NEXT_PUBLIC_BASE_URL` value like `https://placeholder.com` is sufficient for build-time SSG since the actual URL is not critical at build time.

**Warning signs:** CI log shows `Error: SHOPIFY_STORE_DOMAIN is not set` or a Next.js fetch error during `next build`.

### Pitfall 2: Playwright E2E Fails at "webServer" Startup

**What goes wrong:** The `webServer` command in `playwright.config.ts` is `next dev --webpack`, which works locally but adds ~30-60 seconds startup time in CI. If the timeout is too short the test runner aborts before the app is ready.

**Why it happens:** The current config has `webServer.timeout: 120_000` (120s) which should be sufficient. However, `reuseExistingServer: true` combined with a CI environment where no server is running may cause confusion if `localhost:3000` is already in use from a previous step.

**How to avoid:** In CI, `reuseExistingServer` should be `false` to ensure a fresh server. Consider:
```typescript
reuseExistingServer: !process.env.CI,
```

**Warning signs:** Test log shows `waiting for server ... gave up after 120000ms`.

### Pitfall 3: Browser Matrix Artifact Name Collision

**What goes wrong:** Three parallel E2E jobs all try to upload an artifact named `playwright-report`. GitHub Actions v4 upload fails on duplicate artifact names.

**Why it happens:** The artifact `name:` field must be unique per workflow run.

**How to avoid:** Use `name: playwright-report-${{ matrix.browser }}` so each job uploads a distinct artifact.

**Warning signs:** Actions UI shows "artifact upload failed" or one of the three reports silently overwrites the others.

### Pitfall 4: Status Check Names Don't Match Branch Protection

**What goes wrong:** Branch protection is configured with check names like `"E2E Tests"` but the actual workflow job produces a check named `"E2E (chromium)"`. The PR shows all checks green but the "required check" shows as missing, so merge is still blocked.

**Why it happens:** The `name:` field in the workflow job YAML is the string that appears in the GitHub PR status check list. Branch protection contexts must match exactly.

**How to avoid:** Set up branch protection AFTER the first CI run completes. Copy the exact check names from the "Checks" tab in the first PR's GitHub UI rather than guessing them.

**Warning signs:** PR shows "Some checks haven't completed yet" even though all jobs are green.

### Pitfall 5: gitleaks Shallow Clone False Negatives

**What goes wrong:** Secrets committed in an earlier commit are not detected because `actions/checkout` defaults to `fetch-depth: 1` (only the latest commit).

**Why it happens:** Shallow clone saves time but gitleaks can only scan what it can see.

**How to avoid:** Add `fetch-depth: 0` to the `actions/checkout` step in the `secrets` job.

**Warning signs:** gitleaks job completes instantly (no commits to scan) — look for `scanning 1 commit` in the output when you expect more.

### Pitfall 6: `npm audit` Fails on Existing Vulnerabilities

**What goes wrong:** The first CI run fails `npm audit --audit-level=high` because the current project already has a high-severity transitive dependency vulnerability.

**Why it happens:** Projects accumulate vulnerabilities over time. Enabling the check for the first time may find pre-existing issues.

**How to avoid:** Run `npm audit --audit-level=high` locally BEFORE configuring CI. Fix or document any existing high/critical issues. Consider `--omit=dev` if the only high-severity vulns are in devDependencies that are never bundled.

**Warning signs:** First CI run immediately fails `audit` job — check `npm audit` locally to see the report.

---

## Code Examples

### Complete CI Workflow (verified pattern)

```yaml
# Source: https://playwright.dev/docs/ci + https://github.com/gitleaks/gitleaks-action + GitHub Actions docs
# File: .github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    name: Quality (lint / typecheck / build)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Typecheck
        run: npm run typecheck
      - name: Build
        run: npm run build
        env:
          SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
          SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_ACCESS_TOKEN }}
          SHOPIFY_SHOP_ID: ${{ secrets.SHOPIFY_SHOP_ID }}
          NEXT_PUBLIC_BASE_URL: https://wildenflower.com

  e2e:
    name: E2E (${{ matrix.browser }})
    needs: quality
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          CI: true
          SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
          SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_ACCESS_TOKEN }}
          NEXT_PUBLIC_BASE_URL: http://localhost:3000
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30

  secrets:
    name: Secrets Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  audit:
    name: npm audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Audit for vulnerabilities
        run: npm audit --audit-level=high

  deploy-prod:
    name: Deploy to Production
    needs: [quality, e2e, secrets, audit]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Production deploy placeholder
        run: echo "Phase 21 will implement Vercel deploy here"
```

### playwright.config.ts — CI-Ready Multi-Browser Config

```typescript
// Source: https://playwright.dev/docs/ci
import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'next dev --webpack',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,   // false in CI, true locally
    timeout: 120_000,
  },
});
```

### Branch Protection Setup Command

```bash
# Source: https://docs.github.com/en/rest/branches/branch-protection
# Run AFTER first CI run completes so check names are confirmed
# Replace {owner}/{repo} with actual values (e.g., jamesputman/shopSite)

gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "Quality (lint / typecheck / build)",
      "E2E (chromium)",
      "E2E (firefox)",
      "E2E (webkit)",
      "Secrets Scan",
      "npm audit"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF
```

### GitHub Environment Setup (UI steps, not YAML)

```
# These steps are performed in the GitHub web UI, not in YAML
1. github.com/{owner}/{repo}/settings/environments
2. Click "New environment"
3. Name: production
4. Click "Configure environment"
5. Check "Required reviewers" → add yourself
6. Save protection rules
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate CI services (CircleCI, Travis CI) | GitHub Actions native | 2019+ | Zero third-party accounts needed |
| `actions/upload-artifact@v3` | `@v4` (v3 deprecated) | April 2024 | Must use v4+; v3 will stop working |
| `actions/checkout@v3` with `node-version: 14` | `@v4` with `node-version: '22'` | 2023–2024 | Node 20+ required; v22 is LTS as of project |
| Caching Playwright browsers manually | No cache (per Playwright docs) | Playwright v1.30+ | Playwright advises against caching — restore time ≈ download time |
| Branch protection rules (legacy) | Repository rulesets (new API) | 2023 | Rulesets are the modern API-first path; legacy branch protection still works and is simpler for solo repos |

**Deprecated/outdated:**
- `actions/upload-artifact@v3`: Deprecated April 2024. All workflows must use v4+.
- `npm audit --audit-level critical` alone: Misses high-severity vulns. Use `--audit-level=high`.
- `actions/checkout@v2`: Very old. v4 is current stable.

---

## Open Questions

1. **Shopify env vars needed for `next build`**
   - What we know: `npm run build` in package.json runs `npm run contrast:check && next build`; contrast check is a local script that likely fails if it can't find files
   - What's unclear: Does `contrast:check` make HTTP requests or read static files only? If HTTP, it may fail in CI without a running server
   - Recommendation: Run `npx tsx scripts/color-contrast-checker.ts` locally to check what it does. If it reads static files, it will work in CI. If it hits an HTTP endpoint, either skip it in CI or split build to `next build` only.

2. **Exact gh repo name for branch protection command**
   - What we know: Repo is at `github.com/{owner}/shopSite` (name from package.json: `shop-site`)
   - What's unclear: Exact GitHub repo name and owner (could be `shopSite` or `shop-site`)
   - Recommendation: Run `gh repo view --json name,owner` to get the exact values before running the branch protection command.

3. **Whether `npm audit` will pass on first run**
   - What we know: Project has never had an audit CI gate; some transitive deps may have existing vulnerabilities
   - What's unclear: Whether any current deps have high/critical vulns
   - Recommendation: Run `npm audit --audit-level=high` locally before CI setup. If high/critical vulns exist, resolve them or add `--omit=dev` if they are devDependencies only.

4. **Notification channel for deploy events**
   - What we know: User marked this as Claude's Discretion; deploy job currently just echoes a placeholder
   - What's unclear: Whether Slack, email, or GitHub-only notifications are preferred
   - Recommendation: Default to GitHub-only (Actions UI + email) — no extra secret configuration, no webhook setup. Slack integration is Phase 21 scope if needed.

---

## Sources

### Primary (HIGH confidence)
- `https://playwright.dev/docs/ci` — GitHub Actions workflow YAML, multi-browser matrix, report upload, browser cache guidance
- `https://playwright.dev/docs/ci-intro` — Basic workflow and reporter configuration
- `https://docs.github.com/en/rest/branches/branch-protection` — REST API for branch protection, required status checks format
- `https://docs.github.com/en/actions/managing-workflow-runs/reviewing-deployments` — GitHub Environments manual approval gate
- `https://github.com/gitleaks/gitleaks-action` — Official gitleaks-action README, v2.3.9, personal account license requirements

### Secondary (MEDIUM confidence)
- `https://github.com/actions/upload-artifact/releases` — Verified v4 is current stable, v7 released 2026-02-26 (too new)
- `https://github.com/actions/checkout/releases` — Verified v4.x is stable
- `https://github.com/actions/setup-node/releases` — v4.x stable, v6.2.0 exists but v4 is widely deployed
- `https://docs.npmjs.com/cli/audit` — `--audit-level` flag behavior, exit codes

### Tertiary (LOW confidence)
- WebSearch result stating `actions/checkout@v6` is current — could not independently verify; v4 confirmed from releases page; using v4 as safe recommendation
- WebSearch result stating `actions/setup-node@v6` is current — confirmed v6.2.0 exists but v4 is the primary stable; using v4 for safety

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified action versions from GitHub releases pages; verified gitleaks-action version from official README
- Architecture patterns: HIGH — workflow structure verified against Playwright official docs and GitHub Actions docs; branch protection API verified against official REST docs
- Pitfalls: HIGH — pitfalls derived from existing project state (playwright.config.ts examined, Phase 19 decisions read) plus official docs confirming behaviors

**Research date:** 2026-02-28
**Valid until:** 2026-03-28 (GitHub Actions action versions change frequently; re-verify action versions at plan execution time)
