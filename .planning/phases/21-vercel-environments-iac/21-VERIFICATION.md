---
phase: 21-vercel-environments-iac
verified: 2026-02-28T00:00:00Z
status: human_needed
score: 9/10 must-haves verified
re_verification: false
human_verification:
  - test: "Confirm wildenflower.com domain is attached to shopsite-prod"
    expected: "Vercel dashboard > shopsite-prod > Settings > Domains shows wildenflower.com (or the domain has been manually moved from the old shop-site project and tofu apply re-run with the uncommented resource)"
    why_human: "The vercel_project_domain.prod_domain resource is commented out in infra/main.tf. VERC-02 requires a custom domain on the prod project. Whether the domain has been manually attached via the Vercel dashboard (outside IaC) cannot be verified programmatically."
  - test: "Confirm shopsite-dev auto-deploys on merge to main"
    expected: "After any push to main, shopsite-dev shows a new deployment in the Vercel dashboard automatically — no approval required"
    why_human: "Auto-deploy behavior is a Vercel dashboard setting. The CI workflow only deploys to shopsite-prod via the deploy-prod job. Dev auto-deployment comes from Vercel's native GitHub integration on the shopsite-dev project, not the CI workflow. Cannot verify Vercel dashboard settings programmatically."
  - test: "Confirm PR preview deployments auto-generate on both projects"
    expected: "Opening a PR against main causes Vercel to post a preview URL comment on the PR (visible in GitHub PR checks or PR comments)"
    why_human: "Preview deployment auto-generation is a Vercel project setting (GitHub integration). Cannot verify live Vercel behavior from the codebase. User confirmed this works per the prompt context note."
  - test: "Confirm storefront loads at shopsite-prod deployment URL"
    expected: "Navigating to the prod deployment URL shows the Wildenflower storefront with products visible (Shopify env vars are correctly scoped and the app renders)"
    why_human: "Requires live verification of a running deployment. User confirmed this works per the prompt context note."
---

# Phase 21: Vercel Environments & IaC Verification Report

**Phase Goal:** Dev and prod run as independent Vercel projects with their own environment variables, and the project configuration is declared in version-controlled OpenTofu code
**Verified:** 2026-02-28
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Two distinct Vercel projects exist — dev auto-deploys on main merge, prod deploys via manual promote only | ? HUMAN | Projects confirmed live (user context). Dev auto-deploy and prod manual-promote-only are Vercel dashboard settings, not verifiable from code alone |
| 2 | PRs auto-generate a Vercel preview deployment URL — accessible and reflects PR changes | ? HUMAN | User confirmed in prompt context. Vercel native GitHub integration; no code artifact to verify |
| 3 | Dev and prod each have their own scoped environment variables — a var in dev does not appear in prod | ✓ VERIFIED | `infra/main.tf` lines 51-85: 4 distinct `vercel_project_environment_variable` resources — 2 scoped to `vercel_project.dev.id`, 2 scoped to `vercel_project.prod.id`; `tofu apply` confirmed to have run |
| 4 | `infra/` contains OpenTofu `.tf` files declaring both Vercel projects — `tofu plan` produces no errors | ✓ VERIFIED | `infra/main.tf`, `infra/variables.tf`, `infra/outputs.tf`, `infra/.terraform.lock.hcl` all present and tracked by git; `tofu validate` confirmed passing in 21-01-SUMMARY.md |
| 5 | `terraform.tfstate` is present in `.gitignore` and absent from git history | ✓ VERIFIED | `.gitignore` line 49: `terraform.tfstate`; `git ls-files --error-unmatch infra/terraform.tfstate` exits with error (not tracked). State file exists on disk but is correctly gitignored. |

**Score:** 3/5 truths fully verified from code; 2/5 require human confirmation (user has already confirmed these per prompt context)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `infra/main.tf` | Two `vercel_project` resources (dev + prod) + env var resources | ✓ VERIFIED | `vercel_project.dev` (shopsite-dev, line 15), `vercel_project.prod` (shopsite-prod, line 26), 4 env var resources (lines 51-85). Domain resource commented out with documented deferral reason. |
| `infra/variables.tf` | Three sensitive variable declarations | ✓ VERIFIED | `vercel_api_token`, `shopify_token_dev`, `shopify_token_prod` — all with `sensitive = true` |
| `infra/outputs.tf` | `dev_project_id`, `prod_project_id` outputs | ✓ VERIFIED | All three outputs present: `dev_project_id`, `prod_project_id`, `dev_project_url` |
| `infra/terraform.tfvars.example` | Placeholder values committed (no real tokens) | ✓ VERIFIED | Only `"your-vercel-api-token-here"` and equivalent placeholders; real values via `TF_VAR_*` env vars |
| `infra/.terraform.lock.hcl` | Provider version pinned | ✓ VERIFIED | Locks `vercel/vercel` to `1.14.1`, committed to git per OpenTofu best practices |
| `.gitignore` | OpenTofu state entries | ✓ VERIFIED | Lines 48-55: `terraform.tfstate`, `terraform.tfstate.backup`, `.terraform/`, `terraform.tfvars`, `tfplan`, `*.tfplan` |
| `.github/workflows/ci.yml deploy-prod job` | Real `vercel deploy --prebuilt --prod` command (not placeholder) | ✓ VERIFIED | Lines 119, 124, 129: `vercel pull --yes --environment=production`, `vercel build --prod`, `vercel deploy --prebuilt --prod`; placeholder echo is gone |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `infra/main.tf` provider block | `var.vercel_api_token` | `api_token` attribute | ✓ WIRED | Line 12: `api_token = var.vercel_api_token` |
| `vercel_project_environment_variable` resources (dev) | `vercel_project.dev` | `project_id` attribute | ✓ WIRED | Lines 52, 60: `project_id = vercel_project.dev.id` |
| `vercel_project_environment_variable` resources (prod) | `vercel_project.prod` | `project_id` attribute | ✓ WIRED | Lines 72, 80: `project_id = vercel_project.prod.id` |
| `vercel_project_domain.prod_domain` | `vercel_project.prod` | `project_id` attribute | ⚠ DEFERRED | Commented out at line 44. Domain still attached to pre-existing `shop-site` project. Manual prerequisite: remove domain from old project, uncomment resource, re-apply. |
| `deploy-prod` CI job | Vercel shopsite-prod | `VERCEL_TOKEN` secret + Vercel CLI | ✓ WIRED | Lines 119-132: three-step CLI pattern using `secrets.VERCEL_TOKEN`, `secrets.VERCEL_ORG_ID`, `secrets.VERCEL_PROJECT_ID_PROD` |
| `deploy-prod` CI job | quality + e2e + secrets + audit gates | `needs` array | ✓ WIRED | Line 107: `needs: [quality, e2e, secrets, audit]` — all quality gates must pass before deploy |
| `deploy-prod` CI job | GitHub environment approval gate | `environment: production` | ✓ WIRED | Line 109: `environment: production` preserved from Phase 20 |

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| VERC-01 | 21-01, 21-02, 21-03 | Dev Vercel project exists and auto-deploys on every merge to main | ? HUMAN | `vercel_project.dev` (shopsite-dev) confirmed live in 21-02-SUMMARY. Auto-deploy is a Vercel dashboard setting — user confirmed working |
| VERC-02 | 21-01, 21-02 | Prod Vercel project exists with custom domain — deploys via manual promote only | ? PARTIAL | `vercel_project.prod` (shopsite-prod) live. Manual promote via `environment: production` gate. **Domain DEFERRED** — wildenflower.com still on old project; domain resource commented out in main.tf |
| VERC-03 | 21-01, 21-02, 21-03 | PR preview deployments auto-generate per PR | ? HUMAN | Vercel native GitHub integration. User confirmed working in PR/merge flow per prompt context |
| VERC-04 | 21-02 | Dev and prod each have their own scoped environment variables | ✓ SATISFIED | Distinct `vercel_project_environment_variable` resources per project in `infra/main.tf`; `tofu apply` ran successfully |
| INFRA-01 | 21-01 | OpenTofu configuration declares both Vercel projects (dev + prod) as code | ✓ SATISFIED | `vercel_project.dev` and `vercel_project.prod` in `infra/main.tf`; `tofu validate` passes |
| INFRA-02 | 21-02 | OpenTofu manages non-secret environment variable names and structure per project | ✓ SATISFIED | `vercel_project_environment_variable` resources for `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` per project; sensitive values via `var.*` references |
| INFRA-03 | 21-01 | OpenTofu state file is gitignored; setup documented | ✓ SATISFIED | `.gitignore` lines 48-55 cover all state/plan files; `terraform.tfvars.example` documents TF_VAR_ pattern |

**Orphaned requirements:** None. All 7 requirement IDs (VERC-01 through VERC-04, INFRA-01 through INFRA-03) are mapped to Phase 21 in REQUIREMENTS.md traceability table. All appear in plan frontmatter. No orphans.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `infra/main.tf` | 41-47 | `vercel_project_domain.prod_domain` commented out | ⚠ Warning | VERC-02 requires custom domain on prod. The IaC declaration is present but inactive. Manual prerequisite blocks this. Domain may be attached via Vercel dashboard outside IaC — cannot verify programmatically. |

No stub implementations, placeholder returns, or TODO/FIXME blockers found in any CI or IaC files.

---

### Human Verification Required

#### 1. wildenflower.com domain attached to shopsite-prod

**Test:** In Vercel dashboard, navigate to shopsite-prod project > Settings > Domains
**Expected:** `wildenflower.com` appears as an attached domain on shopsite-prod (either manually added via dashboard, or the IaC domain resource was uncommented and applied after removing it from the old shop-site project)
**Why human:** The `vercel_project_domain.prod_domain` resource is commented out in `infra/main.tf`. VERC-02 specifies the prod project "has the custom domain attached." Whether this happened via the Vercel dashboard outside IaC cannot be determined from the codebase.

**Note:** This is the only automated-check gap. If the domain is confirmed attached via the dashboard, VERC-02 is satisfied. If not, the IaC domain resource must be uncommented and applied (after removing wildenflower.com from the old shop-site Vercel project) to satisfy VERC-02 fully.

#### 2. shopsite-dev auto-deploys on merge to main (no approval required)

**Test:** After any push or merge to `main`, verify the Vercel dashboard shows a new deployment auto-triggered on shopsite-dev — with no manual approval step
**Expected:** shopsite-dev deployment starts automatically; shopsite-prod deployment does NOT auto-trigger (requires CI deploy-prod job + environment gate approval)
**Why human:** Dev auto-deployment comes from Vercel's native GitHub integration configuration on the shopsite-dev project. This is a Vercel dashboard setting, not declared in the CI workflow or IaC. User confirmed working per prompt context note.

#### 3. PR preview deployments auto-generate

**Test:** Open a PR against `main` and observe GitHub PR checks or PR comment section
**Expected:** Vercel posts a preview deployment URL comment on the PR; the URL is accessible and reflects the PR's code changes
**Why human:** Preview deployment auto-generation depends on Vercel's GitHub App integration being active on the projects. Cannot verify from codebase alone. User confirmed working per prompt context note.

#### 4. Prod storefront loads at shopsite-prod deployment URL

**Test:** Navigate to the most recent shopsite-prod deployment URL in the Vercel dashboard
**Expected:** Wildenflower storefront loads — navigation, hero, and product sections are visible; Shopify data renders (products are fetched via the scoped `SHOPIFY_STOREFRONT_ACCESS_TOKEN` env var)
**Why human:** Requires a live running deployment. User confirmed this works per prompt context note.

---

### Domain Deferral — Known Gap Detail

The phase was planned with `wildenflower.com` attached to `shopsite-prod` via IaC. During execution, `tofu apply` failed with `domain_already_in_use` because the domain is bound to the pre-existing `shop-site` Vercel project (prj_R5N1uOl96Ze8e0ZS9l3Nv98vQ7cL).

**Current state of VERC-02:** The prod project (shopsite-prod) exists and deploys via manual promote — the "manual promote only" portion of VERC-02 is satisfied. The "custom domain attached" portion is unresolved in code.

**Resolution path:**
1. Go to Vercel Dashboard > `shop-site` project > Settings > Domains
2. Remove `wildenflower.com` from that project
3. Uncomment lines 44-47 in `infra/main.tf`
4. Run: `tofu apply` (with `TF_VAR_*` vars set)

Until this is confirmed, VERC-02 is partial. The user context note does not explicitly confirm the domain is attached to shopsite-prod.

---

### Gitignore Security Audit

All sensitive OpenTofu paths are confirmed gitignored and not tracked:

| Path | `.gitignore` entry | Tracked by git? |
|------|--------------------|-----------------|
| `infra/terraform.tfstate` | Line 49 | No (confirmed via `git ls-files --error-unmatch`) |
| `infra/terraform.tfstate.backup` | Line 50 | No |
| `infra/.terraform/` | Line 51 | No |
| `infra/terraform.tfvars` | Line 52 | No |
| `infra/tfplan` | Line 53 | No |
| `infra/*.tfplan` | Line 54 | No |

`terraform.tfvars.example` IS tracked (intentional — contains only placeholder values).
`infra/.terraform.lock.hcl` IS tracked (intentional — pins provider version per OpenTofu best practices).

---

### CI Deploy-Prod Job Status

The placeholder `echo "Production deployment — Phase 21 will implement Vercel deploy here"` is confirmed GONE.

Real three-step CLI deploy is present:
- `vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}`
- `vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}`
- `vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}`

Gate configuration preserved:
- `environment: production` — manual approval required (from Phase 20, CICD-07)
- `needs: [quality, e2e, secrets, audit]` — all quality checks gate the deploy
- `if: github.ref == 'refs/heads/main' && github.event_name == 'push'` — main push only

---

_Verified: 2026-02-28_
_Verifier: Claude (gsd-verifier)_
