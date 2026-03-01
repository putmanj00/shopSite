output "dev_project_id" {
  description = "Vercel project ID for shopsite-dev"
  value       = vercel_project.dev.id
}

output "prod_project_id" {
  description = "Vercel project ID for shopsite-prod"
  value       = vercel_project.prod.id
}

output "dev_project_url" {
  description = "Default Vercel URL for dev project"
  value       = "https://${vercel_project.dev.name}.vercel.app"
}
