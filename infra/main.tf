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

# DEFERRED: wildenflower.com still in use by another Vercel project.
# Once fully removed from the old project, uncomment and run `tofu apply`:
#
# resource "vercel_project_domain" "prod_domain" {
#   project_id = vercel_project.prod.id
#   domain     = "wildenflower.com"
# }

# --- Dev project environment variables ---

resource "vercel_project_environment_variable" "dev_shopify_domain" {
  project_id = vercel_project.dev.id
  key        = "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN"
  value      = "wildenflower.myshopify.com"
  target     = ["preview", "development", "production"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "dev_shopify_token" {
  project_id = vercel_project.dev.id
  key        = "SHOPIFY_STOREFRONT_ACCESS_TOKEN"
  value      = var.shopify_token_dev
  # Vercel API rejects sensitive = true when "development" is in the target list.
  # Remove "development" — the token is still available in preview and production environments.
  target    = ["preview", "production"]
  sensitive = true
}

# --- Prod project environment variables ---

resource "vercel_project_environment_variable" "prod_shopify_domain" {
  project_id = vercel_project.prod.id
  key        = "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN"
  value      = "wildenflower.myshopify.com"
  target     = ["production"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "prod_shopify_token" {
  project_id = vercel_project.prod.id
  key        = "SHOPIFY_STOREFRONT_ACCESS_TOKEN"
  value      = var.shopify_token_prod
  target     = ["production"]
  sensitive  = true
}
