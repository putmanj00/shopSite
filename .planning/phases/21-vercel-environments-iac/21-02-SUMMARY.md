---
phase: 21-vercel-environments-iac
plan: 02
subsystem: infra
tags: [opentofu, terraform, vercel, iac, env-vars, shopify]

requires:
  - phase: 21-01
    provides: infra/ HCL foundation with vercel_project.dev and vercel_project.prod resources

provides:
  - shopsite-dev Vercel project (prj_0hEeS5coA98GGf7dxakblTTXNts5) with Shopify env vars
  - shopsite-prod Vercel project (prj_JuSM2gXMpQ1b4xKEzJRKEKvFce21) with Shopify env vars
  - dev project URL: https://shopsite-dev.vercel.app (must be added to Shopify OAuth redirect URIs)
  - Local tofu state recording all created resources (gitignored)

affects:
  - 22-error-monitoring (Sentry env vars will be added via vercel_project_environment_variable)
  - 23-shopify-go-live (prod project IaC output feeds go-live verification)

tech-stack:
  added: []
  patterns:
    - "Apply from saved tfplan: tofu apply tfplan only after sourcing TF_VAR_* vars explicitly (source ~/.zshrc not reliable in non-interactive bash subshells)"
    - "Sensitive env vars cannot target 'development' in Vercel — use target=[preview, production] only"
    - "Domain conflicts require manual resolution via Vercel dashboard before IaC can declare domain attachment"

key-files:
  created: []
  modified:
    - infra/main.tf
    - .gitignore

key-decisions:
  - "Removed 'development' from dev_shopify_token target — Vercel API rejects sensitive=true vars targeting the development environment; preview and production targets still cover deployed environments"
  - "Commented out vercel_project_domain.prod_domain — wildenflower.com is attached to pre-existing shop-site project; must be removed from that project manually before IaC can declare it on shopsite-prod"
  - "Added tfplan and *.tfplan to .gitignore — plan files embed sensitive variable values in plaintext"

patterns-established:
  - "Tofu env vars: always export TF_VAR_* explicitly in same shell (source ~/.zshrc unreliable in bash -c subshells)"
  - "Vercel sensitive vars: never include 'development' in target list for sensitive=true env vars"

requirements-completed: [VERC-01, VERC-02, VERC-03, VERC-04, INFRA-02]

duration: 12min
completed: 2026-02-28
---

# Phase 21 Plan 02: Vercel Projects Apply Summary

**Two live Vercel projects created via OpenTofu — shopsite-dev (prj_0hEeS5coA98GGf7dxakblTTXNts5) and shopsite-prod (prj_JuSM2gXMpQ1b4xKEzJRKEKvFce21) — each with scoped SHOPIFY_STOREFRONT_ACCESS_TOKEN and NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variables**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-02-28T19:45:00Z
- **Completed:** 2026-02-28T20:00:00Z
- **Tasks:** 1 of 1 auto-task (Task 4 — continuation from checkpoint:human-verify)
- **Files modified:** 2 (infra/main.tf, .gitignore)

## Accomplishments

- Both Vercel projects created: shopsite-dev and shopsite-prod visible in Vercel dashboard
- All 5 env vars created: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN (non-sensitive, both projects) + SHOPIFY_STOREFRONT_ACCESS_TOKEN (sensitive, both projects — scoped separately)
- Dev project URL captured: https://shopsite-dev.vercel.app — must be added to Shopify Customer Account API redirect URIs
- terraform.tfstate gitignored and confirmed absent from staged files

## Task Commits

1. **Task 2: Add env var resources** - `7283dad` (feat) — committed in prior session
2. **Task 4: Bug fixes + apply** - `6369ccb` (fix) — sensitive var target fix, domain resource deferred, tfplan gitignore

## Files Created/Modified

- `infra/main.tf` - Fixed sensitive env var target (removed "development"), commented out domain resource pending manual prerequisite
- `.gitignore` - Added tfplan and *.tfplan entries to prevent plan files from being committed

## Vercel Project IDs (from tofu output)

```
dev_project_id  = "prj_0hEeS5coA98GGf7dxakblTTXNts5"
dev_project_url = "https://shopsite-dev.vercel.app"
prod_project_id = "prj_JuSM2gXMpQ1b4xKEzJRKEKvFce21"
```

## Decisions Made

- Removed "development" from `dev_shopify_token` target list. Vercel API rejects `sensitive = true` combined with the "development" target. Preview and production targets are sufficient — the development target is for local dev via Vercel CLI, which is not used in this workflow.
- Commented out `vercel_project_domain.prod_domain` rather than destroying and recreating. `wildenflower.com` is currently bound to the pre-existing `shop-site` project (prj_R5N1uOl96Ze8e0ZS9l3Nv98vQ7cL). Vercel's API rejects adding a domain already in use. Manual prerequisite: remove wildenflower.com from shop-site in Vercel dashboard, then uncomment the resource block and run `tofu apply`.
- Added `tfplan` and `*.tfplan` to `.gitignore`. Plan files produced by `tofu plan -out=tfplan` embed sensitive variable values. This was an oversight in the original gitignore setup.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed sensitive env var target — removed "development"**
- **Found during:** Task 4 (tofu apply)
- **Issue:** `tofu apply` failed with `BAD_REQUEST - You cannot set a Sensitive Environment Variable's target to development.` The dev_shopify_token resource had `target = ["preview", "development", "production"]` with `sensitive = true`. Vercel's API prohibits this combination.
- **Fix:** Changed target to `["preview", "production"]` for the dev_shopify_token resource. Added comment explaining the constraint.
- **Files modified:** infra/main.tf
- **Verification:** `tofu plan` shows 1 resource to add (the corrected env var), `tofu apply` exits 0.
- **Committed in:** 6369ccb

**2. [Rule 1 - Bug] Deferred vercel_project_domain.prod_domain — domain already in use**
- **Found during:** Task 4 (tofu apply)
- **Issue:** `tofu apply` failed with `domain_already_in_use — Cannot add wildenflower.com since it's already in use by one of your projects.` The domain is attached to the pre-existing `shop-site` Vercel project (prj_R5N1uOl96Ze8e0ZS9l3Nv98vQ7cL).
- **Fix:** Commented out the `vercel_project_domain.prod_domain` resource block. Documented the manual prerequisite (remove domain from shop-site project) and left re-activation instructions in main.tf comments.
- **Files modified:** infra/main.tf
- **Verification:** `tofu validate` passes. `tofu plan` shows 0 domain resources to create.
- **Committed in:** 6369ccb

**3. [Rule 2 - Missing Critical] Added tfplan to .gitignore**
- **Found during:** Task 4 (git status)
- **Issue:** `tfplan` appeared as untracked in git status. Plan files produced by `tofu plan -out=tfplan` embed sensitive variable values. Not gitignoring them is a security oversight.
- **Fix:** Added `tfplan` and `*.tfplan` to the OpenTofu / Terraform section of .gitignore.
- **Files modified:** .gitignore
- **Verification:** `git check-ignore -v infra/tfplan` confirms it is now gitignored.
- **Committed in:** 6369ccb

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing critical security)
**Impact on plan:** All auto-fixes were necessary. Sensitive var target error and domain conflict were API-enforced constraints. tfplan gitignore was a security correctness requirement. No scope creep.

## Issues Encountered

- `source /Users/jamesputman/.zshrc` inside a single-line bash command does not export environment variables into the subshell that runs subsequent commands. All TF_VAR_* variables had to be exported explicitly using `export VAR=value` in the same command chain.

## User Setup Required

**Manual prerequisites remaining before wildenflower.com can be attached to shopsite-prod via IaC:**

1. Go to Vercel Dashboard -> shop-site project -> Settings -> Domains
2. Remove wildenflower.com from the shop-site project
3. Then uncomment the `vercel_project_domain.prod_domain` resource in `infra/main.tf`
4. Run:
   ```bash
   export TF_VAR_vercel_api_token="..."  # from ~/.zshrc
   export TF_VAR_shopify_token_dev="..."
   export TF_VAR_shopify_token_prod="..."
   cd /Users/jamesputman/SRC/shopSite/infra
   tofu plan -out=tfplan
   tofu apply tfplan
   ```

**Required before Phase 23 (Go-Live Verification):**

Add the dev project URL to Shopify Customer Account API OAuth redirect URIs:
- URL to add: `https://shopsite-dev.vercel.app`
- Location: Shopify Admin -> Customer accounts -> OAuth redirect URIs

## Next Phase Readiness

- Both Vercel projects live with scoped Shopify env vars — Phase 22 (Error Monitoring) can add Sentry env vars via `vercel_project_environment_variable` resources in main.tf
- Phase 23 (Go-Live Verification) has prod project ID: prj_JuSM2gXMpQ1b4xKEzJRKEKvFce21
- Blocker: dev project URL must be added to Shopify OAuth redirect URIs (manual step) before OAuth flows work on the dev Vercel deployment

---
*Phase: 21-vercel-environments-iac*
*Completed: 2026-02-28*
