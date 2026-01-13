# Agent Knowledge Base

This file contains important context and patterns for AI agents working on this project. Ralph will update this file as it discovers useful patterns and conventions.

## Project Overview

**Type**: Headless Shopify E-commerce Storefront
**Tech Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shopify Storefront API
**Purpose**: Modern, high-performance custom storefront for both physical and digital products

## Architecture

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS (utility-first approach)
- **Type Safety**: TypeScript with strict mode
- **State Management**: React Context API / Zustand (TBD during implementation)

### Backend Integration
- **Primary Data Source**: Shopify Storefront API (GraphQL)
- **Admin Operations**: Shopify Admin API (REST/GraphQL)
- **Authentication**: Shopify Customer API + NextAuth.js or Multipass
- **Payments**: Shopify Checkout (hosted)

## Directory Structure

```
shopSite/
├── app/                    # Next.js App Router pages
│   ├── (shop)/            # Main storefront routes
│   ├── account/           # User account pages
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions and configurations
│   ├── shopify/         # Shopify API client and queries
│   └── utils/           # Helper functions
├── types/               # TypeScript type definitions
├── public/              # Static assets
├── scripts/ralph/       # Ralph automation scripts
└── tasks/               # PRD and planning documents
```

## Coding Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Avoid `any` type; use `unknown` if necessary
- Export types alongside implementations

### React/Next.js
- Use Server Components by default (Next.js 14 App Router)
- Mark Client Components explicitly with 'use client'
- Implement proper error boundaries
- Use Suspense for async operations
- Prefer server-side data fetching

### Styling
- Use Tailwind utility classes
- Create custom components for repeated patterns
- Use Tailwind config for theme customization
- Mobile-first responsive design
- Follow consistent spacing scale (Tailwind defaults)

### API Integration
- Cache Shopify API responses appropriately
- Implement retry logic for failed requests
- Handle rate limiting gracefully
- Use GraphQL fragments for reusable queries
- Type all API responses

## Common Patterns

(This section will be populated by Ralph as it discovers patterns during implementation)

### Example Pattern Template:
```
**Pattern Name**: [Brief description]
**When to use**: [Scenario]
**Implementation**: [Code example or reference]
**Gotchas**: [Common mistakes to avoid]
```

## Testing Strategy

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright (optional, based on implementation needs)
- **Type Checking**: `npm run type-check` before commits
- **Linting**: ESLint with Next.js recommended config

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_access_token (if needed)

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email Service
EMAIL_API_KEY=your_email_service_api_key

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Dependencies

### Core
- `next` - React framework
- `react`, `react-dom` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling

### Shopify
- `@shopify/hydrogen` or `shopify-buy` - Shopify API client
- `graphql` - Query language

### Authentication
- `next-auth` - Authentication solution

### Email
- `resend` or `@sendgrid/mail` - Transactional emails

### State Management
- TBD based on complexity needs

## Known Issues & Gotchas

(This section will be populated during implementation)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shopify Hydrogen](https://hydrogen.shopify.dev/)

---

**Note**: This file should be updated by agents as they discover patterns, conventions, and important context during development. Keep it concise and actionable.
