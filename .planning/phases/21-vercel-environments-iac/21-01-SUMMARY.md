---
phase: 21-vercel-environments-iac
plan: 01
subsystem: infra
tags: [opentofu, terraform, vercel, iac, hcl]

requires:
  - phase: 20-cicd-pipeline
    provides: CI/CD pipeline in place before Vercel IaC declares the projects it deploys to

provides:
  - infra/ directory with validated OpenTofu HCL declaring two Vercel projects
  - Gitignored terraform state before any credentials touched the filesystem
  - Placeholder tfvars.example committed for operator onboarding

affects:
  - 21-02 (tofu plan/apply requires infra/ HCL from this plan)
  - 22-error-monitoring (Sentry env vars will be added via vercel_project_environment_variable in future plan)
  - 23-shopify-go-live (prod Vercel project IaC output feeds go-live verification)

tech-stack:
  added: [opentofu >= 1.11.5, vercel/vercel provider v1.14.1]
  patterns: [local OpenTofu state gitignored before init, provider version pinned via .terraform.lock.hcl, sensitive vars via TF_VAR_ env vars not hardcoded]

key-files:
  created:
    - infra/main.tf
    - infra/variables.tf
    - infra/outputs.tf
    - infra/terraform.tfvars.example
    - infra/.terraform.lock.hcl
  modified:
    - .gitignore

key-decisions:
  - "Removed production_deployment_enabled = false from vercel_project.prod — attribute dropped in vercel provider v1.10+; manual promote is now a Vercel dashboard setting, not a Terraform attribute"
  - "Committed .terraform.lock.hcl to pin provider to v1.14.1 per OpenTofu best practices"
  - "OpenTofu installed via brew (v1.11.5) — was not present on machine"

patterns-established:
  - "Gitignore state before init: always add terraform.tfstate, .terraform/ to .gitignore BEFORE running tofu init"
  - "Secrets via TF_VAR_ env vars: all sensitive values declared as variable blocks, never hardcoded in .tf files"
  - "tfvars.example pattern: committed placeholder file; actual terraform.tfvars is gitignored"

requirements-completed: [INFRA-01, INFRA-03, VERC-01, VERC-02, VERC-03]

duration: 5min
completed: 2026-02-28
---

# Phase 21 Plan 01: OpenTofu IaC Foundation Summary

**OpenTofu HCL foundation declaring two Vercel projects (shopsite-dev + shopsite-prod) with gitignored local state and validated provider configuration**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-28T20:14:59Z
- **Completed:** 2026-02-28T20:20:15Z
- **Tasks:** 2 of 2 auto-tasks complete (checkpoint:human-verify pending)
- **Files modified:** 6 (1 modified, 5 created)

## Accomplishments

- Gitignored terraform.tfstate, .terraform/, terraform.tfvars before any tofu command ran — secrets never at risk
- Created four infra/ HCL files declaring vercel_project.dev (shopsite-dev), vercel_project.prod (shopsite-prod), and vercel_project_domain.prod_domain (wildenflower.com)
- `tofu init` downloaded vercel/vercel provider v1.14.1; `tofu validate` exits 0 with "The configuration is valid."

## Task Commits

Each task was committed atomically:

1. **Task 1: Gitignore OpenTofu state** - `7c57e4e` (chore)
2. **Task 2: Create infra/ HCL files** - `7b5275b` (feat)

## Files Created/Modified

- `.gitignore` - Added OpenTofu/Terraform section (terraform.tfstate, terraform.tfstate.backup, .terraform/, terraform.tfvars)
- `infra/main.tf` - Provider block + vercel_project.dev + vercel_project.prod + vercel_project_domain.prod_domain
- `infra/variables.tf` - vercel_api_token, shopify_token_dev, shopify_token_prod (all sensitive)
- `infra/outputs.tf` - dev_project_id, prod_project_id, dev_project_url outputs
- `infra/terraform.tfvars.example` - Committed placeholder with TF_VAR_ env var instructions
- `infra/.terraform.lock.hcl` - Provider version lock file (vercel/vercel v1.14.1)

## Decisions Made

- Removed `production_deployment_enabled = false` from vercel_project.prod — this attribute was dropped in vercel provider v1.10+. Manual-promote-only behavior is now configured via the Vercel dashboard (Settings > Git > Disable Auto-Deploy on Production).
- Committed `.terraform.lock.hcl` alongside the HCL files per OpenTofu best practices — ensures reproducible provider version selection.
- Installed OpenTofu v1.11.5 via brew — was not pre-installed on machine.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unsupported `production_deployment_enabled` attribute**
- **Found during:** Task 2 (Create infra/ HCL files)
- **Issue:** `tofu validate` exited 1 with "An argument named 'production_deployment_enabled' is not expected here." — attribute was removed from the vercel provider in v1.10+. Plan was written against an older schema from the research doc.
- **Fix:** Removed the attribute from vercel_project.prod; added a comment documenting that manual-promote behavior is now a dashboard setting.
- **Files modified:** infra/main.tf
- **Verification:** `tofu validate` exits 0 with "Success! The configuration is valid."
- **Committed in:** 7b5275b (Task 2 commit)

**2. [Rule 3 - Blocking] Installed OpenTofu (not pre-installed)**
- **Found during:** Task 2 (Create infra/ HCL files)
- **Issue:** `tofu` binary not found on PATH — tool required by the plan was not installed.
- **Fix:** `brew install opentofu` — installed v1.11.5 (took ~3 min to compile).
- **Files modified:** None (system package install)
- **Verification:** `tofu --version` reports OpenTofu v1.11.5; init and validate both pass.
- **Committed in:** 7b5275b (Task 2 commit, tool is a prerequisite)

---

**Total deviations:** 2 auto-fixed (1 bug/schema mismatch, 1 blocking/missing tool)
**Impact on plan:** Both auto-fixes necessary. Schema fix required for validate to pass. Tool install required for any tofu commands. No scope creep.

## Issues Encountered

- vercel provider installed at v1.14.1 (plan specified `~> 1.9`, resolves to latest compatible 1.x). Provider schema changed between v1.9 and v1.14.1 — `production_deployment_enabled` was removed.

## User Setup Required

Before running `tofu plan` in Plan 02, the operator must set:

```bash
export TF_VAR_vercel_api_token="<your-vercel-api-token>"
export TF_VAR_shopify_token_dev="<shopify-storefront-access-token-dev>"
export TF_VAR_shopify_token_prod="<shopify-storefront-access-token-prod>"
```

Vercel API token: create at https://vercel.com/account/tokens (account-scoped, full access).

## Next Phase Readiness

- infra/ directory committed with validated HCL — ready for Plan 02 (tofu plan + apply)
- State is gitignored — safe to run tofu commands with real credentials
- vercel/vercel provider v1.14.1 cached in .terraform/ (gitignored) — `tofu init` needed again on fresh clone
- NOTE: After tofu apply creates dev project, Shopify Customer Account API redirect URIs must be updated to include the dev Vercel URL (documented in STATE.md blockers)

---
*Phase: 21-vercel-environments-iac*
*Completed: 2026-02-28*
