# Phase 21: Vercel Environments & IaC - Research

**Researched:** 2026-02-28
**Domain:** Vercel project management + OpenTofu (Terraform-compatible) infrastructure as code
**Confidence:** HIGH (Vercel provider is official and well-documented; OpenTofu is drop-in compatible)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VERC-01 | Dev Vercel project exists and auto-deploys on every merge to main | `vercel_project` resource with `git_repository` block wired to GitHub repo |
| VERC-02 | Prod Vercel project exists with custom domain — deploys via manual promote only | Second `vercel_project` resource + `vercel_project_domain` resource; production branch protection prevents auto-deploy |
| VERC-03 | PR preview deployments auto-generate per PR | Vercel preview deployments are on by default for any connected GitHub repo — no extra config needed |
| VERC-04 | Dev and prod each have their own scoped environment variables | `vercel_project_environment_variable` resource with `target` set to `["preview","development"]` or `["production"]` |
| INFRA-01 | OpenTofu declares both Vercel projects as code | Two `vercel_project` resources in `infra/main.tf` |
| INFRA-02 | OpenTofu manages non-secret env var names and structure per project | `vercel_project_environment_variable` resources with `sensitive = false` for non-secrets; secrets passed via `var` referencing shell env |
| INFRA-03 | OpenTofu state file is gitignored; setup documented | `terraform.tfstate` and `terraform.tfstate.backup` in `.gitignore`; local backend (default) |
</phase_requirements>

---

## Summary

Phase 21 wires up two separate Vercel projects (dev and prod) as code using OpenTofu with the official `vercel/vercel` Terraform provider. The Vercel Terraform provider is maintained by Vercel itself, is published on both the HashiCorp Terraform Registry and the OpenTofu Registry, and is fully compatible with OpenTofu — no forks or workarounds needed.

The critical architectural decision (already locked in STATE.md) is local state only — no Terraform Cloud. This is correct for a solo-dev two-project setup. `terraform.tfstate` must be gitignored before `tofu init` is ever run. The state file will contain the Vercel API token in plaintext in some provider metadata, making gitignore non-negotiable.

The Vercel provider authenticates via a single API token (set via `VERCEL_API_TOKEN` env var or provider `api_token` attribute). Non-secret env var values go directly in `.tf` files. Secret values (Shopify token, etc.) are passed as `sensitive` variables sourced from the operator's shell environment — they appear in state but not in `.tf` source files.

**Primary recommendation:** Create `infra/` at repo root. Use `vercel_project` (x2) + `vercel_project_environment_variable` (per var per project) + `vercel_project_domain` (prod only). Run `tofu init && tofu plan` to verify before `tofu apply`.

---

## Standard Stack

### Core

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| OpenTofu | >= 1.6 | IaC runtime (Terraform-compatible) | Open-source Terraform fork; identical HCL syntax; used when avoiding BSL license |
| vercel/vercel provider | >= 1.0 (latest ~1.9) | Manages Vercel projects, env vars, domains | Official provider maintained by Vercel |

### Key Resources

| Resource | Purpose |
|----------|---------|
| `vercel_project` | Creates a Vercel project connected to a GitHub repo |
| `vercel_project_environment_variable` | Sets a single env var on a project for specified targets |
| `vercel_project_domain` | Attaches a custom domain to a project |

**Installation (macOS via brew):**
```bash
brew install opentofu
```

**Provider block:**
```hcl
terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.9"
    }
  }
  required_version = ">= 1.6"
}

provider "vercel" {
  api_token = var.vercel_api_token
}
```

---

## Architecture Patterns

### Recommended Project Structure

```
infra/
├── main.tf          # provider block, vercel_project resources
├── variables.tf     # input variable declarations
├── outputs.tf       # project IDs, URLs as outputs
└── terraform.tfvars.example  # example non-secret values (committed)
# terraform.tfvars  — NOT committed (gitignored); holds real token values
# terraform.tfstate — NOT committed (gitignored)
```

### Pattern 1: Two Projects, One GitHub Repo

Both dev and prod point at the same GitHub repo `putmanj00/shopSite`. The difference is which branch triggers auto-deploy and whether a domain is attached.

```hcl
# Source: https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project

resource "vercel_project" "dev" {
  name      = "shopsite-dev"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "putmanj00/shopSite"
  }
}

resource "vercel_project" "prod" {
  name                       = "shopsite-prod"
  framework                  = "nextjs"
  production_deployment_enabled = false   # manual promote only

  git_repository = {
    type              = "github"
    repo              = "putmanj00/shopSite"
    production_branch = "main"
  }
}
```

**Note on `production_deployment_enabled = false`:** Setting this on the prod project means pushes to the production branch do NOT auto-deploy to production — a deployment must be explicitly promoted via the Vercel dashboard or CLI. This satisfies VERC-02 (manual promote only).

### Pattern 2: Per-Project Scoped Environment Variables

Each `vercel_project_environment_variable` resource is scoped to one or more deployment targets: `"production"`, `"preview"`, `"development"`.

```hcl
# Source: https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project_environment_variable

# Non-secret var on dev project (preview + development targets)
resource "vercel_project_environment_variable" "dev_next_public_api_url" {
  project_id = vercel_project.dev.id
  key        = "NEXT_PUBLIC_API_URL"
  value      = "https://shopsite-dev.vercel.app"
  target     = ["preview", "development"]
  sensitive  = false
}

# Secret var on prod — value sourced from TF variable (set via shell env TF_VAR_shopify_token)
resource "vercel_project_environment_variable" "prod_shopify_token" {
  project_id = vercel_project.prod.id
  key        = "SHOPIFY_STOREFRONT_ACCESS_TOKEN"
  value      = var.shopify_token_prod
  target     = ["production"]
  sensitive  = true
}
```

**`sensitive = true`** marks the value as a Vercel "sensitive" env var (encrypted at rest, not shown in UI after creation). It still appears in local `terraform.tfstate` — which is why gitignoring state is mandatory.

### Pattern 3: Custom Domain on Prod

```hcl
resource "vercel_project_domain" "prod_domain" {
  project_id = vercel_project.prod.id
  domain     = "wildenflower.com"
}
```

### Pattern 4: Variables for Secrets

```hcl
# variables.tf
variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "shopify_token_prod" {
  description = "Shopify Storefront Access Token for production"
  type        = string
  sensitive   = true
}
```

Operator sets before running tofu:
```bash
export TF_VAR_vercel_api_token="..."
export TF_VAR_shopify_token_prod="..."
tofu plan
```

### Anti-Patterns to Avoid

- **Hardcoding API tokens in `.tf` files** — use `variable` blocks + `TF_VAR_*` env vars instead
- **Committing `terraform.tfvars` with real secrets** — only commit `.tfvars.example` with placeholder values
- **Managing env vars both in Vercel UI and in OpenTofu** — pick one; mixing causes drift and plan noise
- **Running `tofu apply` before `tofu plan`** — always inspect the plan first

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vercel project creation | Manual UI clicks or custom API scripts | `vercel_project` resource | Reproducible, version-controlled, idempotent |
| Env var management | Bash scripts calling Vercel REST API | `vercel_project_environment_variable` | Drift detection, plan output shows changes |
| Domain attachment | Manual Vercel dashboard clicks | `vercel_project_domain` | Captured in IaC alongside the project |
| State storage | Custom backend logic | Default local backend (per locked decision) | Solo-dev setup; Terraform Cloud out of scope |

---

## Common Pitfalls

### Pitfall 1: State File Contains Secrets

**What goes wrong:** `terraform.tfstate` stores all resource attributes including sensitive values in plaintext JSON. If committed, Shopify tokens and the Vercel API token are exposed in git history.

**Why it happens:** Terraform/OpenTofu always writes full state locally by default.

**How to avoid:** Add to `.gitignore` BEFORE running `tofu init`:
```
terraform.tfstate
terraform.tfstate.backup
.terraform/
```

**Warning signs:** `git status` shows `terraform.tfstate` as an untracked file — stop and gitignore before any `git add`.

### Pitfall 2: Vercel API Token Scope

**What goes wrong:** Provider fails with 401 if the token lacks the right scope. Vercel has two token types: account-scoped and team-scoped.

**How to avoid:** Create a token at vercel.com/account/tokens with full account access. For a personal (non-team) account this is straightforward.

### Pitfall 3: Existing Projects Cause Import Conflicts

**What goes wrong:** If Vercel projects were previously created in the UI, `tofu apply` will try to create duplicates and may error or create naming conflicts.

**How to avoid:** If projects already exist in Vercel UI, use `tofu import` to bring them under IaC management before applying:
```bash
tofu import vercel_project.dev <project-id>
```
Project IDs are visible in Vercel project Settings > General.

### Pitfall 4: Preview Deployments Are On By Default

**What goes wrong:** VERC-03 (PR preview deployments) requires no special configuration — they are enabled by default for any GitHub-connected Vercel project. Accidentally disabling them in the `vercel_project` resource breaks PRs.

**How to avoid:** Do not set any attribute that disables preview deployments. The default behavior satisfies VERC-03.

### Pitfall 5: Shopify OAuth Redirect URI

**What goes wrong:** The dev project URL (e.g., `https://shopsite-dev.vercel.app`) must be added to Shopify Customer Account API allowed redirect URIs, or OAuth login will fail on the dev deployment.

**How to avoid:** After `tofu apply` creates the dev project and its URL is known, update the Shopify OAuth redirect URI list. This is called out in STATE.md as a known blocker.

---

## Code Examples

### Minimal Working `main.tf`

```hcl
# Source: https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project

terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.9"
    }
  }
  required_version = ">= 1.6"
}

provider "vercel" {
  api_token = var.vercel_api_token
}

resource "vercel_project" "dev" {
  name      = "shopsite-dev"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "putmanj00/shopSite"
  }
}

resource "vercel_project" "prod" {
  name                          = "shopsite-prod"
  framework                     = "nextjs"
  production_deployment_enabled = false

  git_repository = {
    type              = "github"
    repo              = "putmanj00/shopSite"
    production_branch = "main"
  }
}

resource "vercel_project_domain" "prod_domain" {
  project_id = vercel_project.prod.id
  domain     = "wildenflower.com"
}
```

### `outputs.tf`

```hcl
output "dev_project_id" {
  value = vercel_project.dev.id
}

output "prod_project_id" {
  value = vercel_project.prod.id
}
```

### `.gitignore` additions

```
# OpenTofu / Terraform
terraform.tfstate
terraform.tfstate.backup
.terraform/
terraform.tfvars
```

### Workflow Commands

```bash
cd infra/
tofu init          # download provider
tofu validate      # syntax check
tofu plan          # preview changes (no apply yet)
tofu apply         # create/update resources
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|-----------------|-------|
| Manage Vercel projects via dashboard UI | `vercel_project` resource in IaC | Provider v1.x stable since 2023 |
| Terraform (HashiCorp) | OpenTofu (drop-in fork) | BSL license change in Aug 2023 led to OpenTofu fork; HCL syntax identical |
| Separate env var resources per variable | Can also inline in `vercel_project.environment` block | Separate resources are easier to maintain and diff |

---

## Open Questions

1. **Do Vercel projects already exist in the UI?**
   - What we know: Phase 21 is the first IaC setup; projects may or may not pre-exist
   - What's unclear: If projects exist, `tofu import` is needed before `tofu apply`
   - Recommendation: Check Vercel dashboard at plan time; add import commands to Wave 0 if needed

2. **Custom domain DNS setup**
   - What we know: `vercel_project_domain` attaches the domain; DNS must point to Vercel
   - What's unclear: Whether DNS is already configured or needs external DNS changes
   - Recommendation: Document as a manual step outside IaC scope (DNS registrar is not Terraform-managed here)

3. **Vercel team vs personal account**
   - What we know: Solo developer — likely personal account
   - What's unclear: Token type needed (account vs team token)
   - Recommendation: Use account-level token from vercel.com/account/tokens; no `team_id` needed for personal

---

## Sources

### Primary (HIGH confidence)
- [Terraform Registry — vercel_project resource](https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project) — resource schema
- [Terraform Registry — vercel_project_environment_variable](https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project_environment_variable) — env var resource schema
- [Vercel KB — Integrating Terraform with Vercel](https://vercel.com/kb/guide/integrating-terraform-with-vercel) — official setup guide
- [GitHub — vercel/terraform-provider-vercel](https://github.com/vercel/terraform-provider-vercel) — official provider source
- [OpenTofu Registry — vercel/vercel](https://search.opentofu.org/provider/vercel/vercel/latest) — OpenTofu compatibility confirmed

### Secondary (MEDIUM confidence)
- [HashiCorp Tutorial — Preview Environments with Vercel](https://developer.hashicorp.com/terraform/tutorials/applications/preview-environments-vercel) — pattern reference
- [Vercel Changelog — Terraform Provider v1.9](https://vercel.com/changelog/vercel-terraform-provider-v1-9) — version currency

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Official Vercel provider, OpenTofu is identical HCL to Terraform
- Architecture: HIGH — Two-project pattern is the canonical Vercel dev/prod split
- Pitfalls: HIGH — State file secrets risk is well-documented; import risk is standard IaC concern

**Research date:** 2026-02-28
**Valid until:** 2026-08-28 (provider API is stable; Vercel changes versions slowly)
