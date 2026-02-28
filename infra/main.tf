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
    type              = "github"
    repo              = "putmanj00/shopSite"
    production_branch = "main"
  }
}

resource "vercel_project" "prod" {
  name      = "shopsite-prod"
  framework = "nextjs"

  # production_deployment_enabled was removed in vercel provider v1.10+.
  # Manual-promote-only behavior for prod is enforced via the Vercel dashboard
  # (Settings > Git > Disable Auto-Deploy on Production). This project is
  # connected to the same repo but production deployments require manual promotion.
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
