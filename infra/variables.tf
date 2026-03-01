variable "vercel_api_token" {
  description = "Vercel API token (account-scoped, from vercel.com/account/tokens)"
  type        = string
  sensitive   = true
}

variable "shopify_token_dev" {
  description = "Shopify Storefront Access Token for dev project"
  type        = string
  sensitive   = true
}

variable "shopify_token_prod" {
  description = "Shopify Storefront Access Token for prod project"
  type        = string
  sensitive   = true
}
