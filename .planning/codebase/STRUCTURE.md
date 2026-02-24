# Codebase Structure

**Analysis Date:** 2026-02-23

## Directory Layout

```
shopSite/
├── app/                          # Next.js App Router pages and API routes
│   ├── api/                      # Backend API endpoints
│   │   ├── admin/                # Admin-specific endpoints
│   │   ├── auth/                 # Authentication flows
│   │   ├── email/                # Email sending endpoints
│   │   ├── search/               # Search endpoints
│   │   └── [other routes]/       # Newsletter, reviews, webhooks
│   ├── admin/                    # Admin dashboard pages
│   ├── account/                  # Customer account pages
│   ├── collections/              # Collection browsing pages
│   ├── products/                 # Product detail pages
│   ├── blog/                     # Blog post pages
│   ├── [public pages]/           # About, FAQ, Contact, Privacy, etc.
│   ├── layout.tsx                # Root layout wrapper
│   └── page.tsx                  # Homepage
├── components/                   # Reusable React components
│   ├── emails/                   # Email template components (React)
│   ├── homepage/                 # Homepage-specific components
│   ├── account/                  # Customer account components
│   ├── cart/                     # Cart-related components
│   ├── checkout/                 # Checkout flow components
│   ├── reviews/                  # Review display/submission components
│   ├── search/                   # Search UI components
│   ├── cro/                      # Conversion optimization popups
│   ├── ui/                       # Design system UI components
│   ├── about/                    # About page components
│   └── [root level components]   # Header, Footer, CartDrawer, etc.
├── lib/                          # Utility functions and state management
│   ├── hooks/                    # Custom React hooks
│   ├── *-store.ts               # Zustand state stores
│   ├── shopify*.ts              # Shopify API clients and queries
│   ├── customer-account.ts      # OAuth authentication logic
│   ├── admin-*.ts               # Admin utilities and data
│   ├── email.ts                 # Email sending utility
│   └── [other utilities]/       # Product utils, filters, currency context
├── types/                        # TypeScript type definitions
│   ├── shopify.ts               # Shopify API types
│   └── reviews.ts               # Review types
├── data/                         # Static data
│   └── blog-posts.ts            # Blog post definitions
├── public/                       # Static assets
│   ├── icons/                   # App icons (PWA)
│   ├── images/                  # Product and brand images
│   ├── videos/                  # Video files
│   └── assets/                  # Other static files
├── scripts/                      # Build and utility scripts
│   └── ralph/                   # Shopify API testing scripts
├── tasks/                        # Task/job definitions (empty)
├── .planning/                    # GSD planning documents
│   └── codebase/                # Codebase analysis docs (this directory)
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── [config files]/             # .eslintrc, .prettierrc, next.config, etc.
```

## Directory Purposes

**app/ - Next.js App Router:**
- Purpose: Page routes and API endpoints for the application
- Contains: Server/client page components (.tsx), API route handlers (route.ts), layout files
- Key files: `layout.tsx` (root wrapper), `page.tsx` (homepage), `error.tsx` (global error boundary)

**app/api/ - Backend API Endpoints:**
- Purpose: Serverless backend for authentication, emails, searches, admin functions
- Contains: POST/GET handlers organized by feature (auth, email, admin, search)
- Key files: `auth/customer/authorize/route.ts`, `auth/customer/callback/route.ts`, `email/**/route.ts`

**app/admin/ - Admin Dashboard:**
- Purpose: Private admin interface for business operations
- Contains: Admin pages behind auth protection (protected layout group), admin-only API routes
- Key files: `(protected)/page.tsx` (main dashboard), sales/inventory/customers/reviews pages

**components/ - Reusable UI Components:**
- Purpose: Modular, composable React components for UI building
- Contains: Functional components, client/server components, styled with Tailwind
- Organization: Grouped by feature (homepage/, account/, emails/) and design system (ui/)

**components/emails/ - Email Templates:**
- Purpose: React components rendered as HTML emails by Resend service
- Contains: Email layout templates, specific email types (welcome, order confirmation, shipping, etc.)
- Key files: `email-layout.tsx` (wrapper), `order-confirmation-email.tsx`, `welcome-email.tsx`

**components/cro/ - Conversion Optimization:**
- Purpose: Behavioral UI elements to increase sales (popups, notifications)
- Contains: ExitIntentPopup, WelcomePopup, RecentPurchasePopup, SocialProofToast
- Key files: Organized as individual component files in `cro/` directory

**components/ui/ - Design System:**
- Purpose: Fundamental, reusable UI building blocks
- Contains: Generic components (buttons, cards, modals, inputs) + brand-specific components (BotanicalDivider, WatercolorWash)
- Pattern: Heavily styled with Tailwind, some use Framer Motion for animation

**lib/ - State Management & Utilities:**
- Purpose: Centralized logic for state, API integration, and data transformation
- Contains: Zustand stores (cart, auth, wishlist, search), Shopify API clients, OAuth helpers, utilities
- Key files: `*-store.ts` (state), `shopify*.ts` (API), `customer-account.ts` (auth), `email.ts` (email sending)

**lib/hooks/ - Custom Hooks:**
- Purpose: Encapsulate reusable React logic
- Contains: Custom hooks like `use-focus-trap.ts` for accessibility
- Key files: Hooks for UI patterns and Zustand store access

**types/ - Type Definitions:**
- Purpose: Central location for TypeScript interfaces and types
- Contains: Shopify API response types, custom application types
- Key files: `shopify.ts` (Product, Cart, Collection, Variant, etc.), `reviews.ts` (Review type)

**data/ - Static Data:**
- Purpose: Non-API data like content, blog posts, constants
- Contains: Hardcoded data structures for blogs, FAQs, testimonials
- Key files: `blog-posts.ts` (blog post definitions with frontmatter), `reviews.json` (mock reviews)

**public/ - Static Assets:**
- Purpose: Assets served directly by Next.js without processing
- Contains: Images, icons (PWA), videos, brand assets
- Key files: `/icons/` (PWA manifest icons), `/images/` (product photos), `/assets/` (misc files)

**scripts/ - Build & Utility Scripts:**
- Purpose: Development and build automation scripts
- Contains: TypeScript/Node scripts for testing, validation, accessibility checking
- Key files: `accessibility-test.ts`, `color-contrast-checker.ts`, `ui-tests.ts`, `validate-routes.ts`

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout, providers setup (CurrencyProvider), global components (Header, Footer, Modals, Analytics)
- `app/page.tsx`: Homepage with featured products, categories, testimonials, brand story
- `app/admin/(protected)/page.tsx`: Admin dashboard (requires login)

**Configuration:**
- `tsconfig.json`: TypeScript compiler options, path aliases (`@/*` → project root)
- `package.json`: Dependencies (Next.js 16, React 19, Zustand, Resend, Tailwind 4)
- `.eslintrc` (implied): Linting configuration
- `.prettierrc` (implied): Code formatting configuration

**Core Logic:**
- `lib/shopify.ts`: Shopify Storefront API client singleton (getShopifyClient, shopifyFetch)
- `lib/shopify-queries.ts`: 547 lines of GraphQL query/mutation strings for Shopify
- `lib/customer-account.ts`: 412 lines of OAuth2 + PKCE authentication logic
- `lib/cart-store.ts`: Zustand store for cart state (add/remove items, checkout)
- `lib/auth-store.ts`: Zustand store for customer authentication state
- `lib/admin-data.ts`: Admin data fetching (sales stats, inventory, customers)
- `lib/email.ts`: Email sending utility via Resend (with mock mode fallback)

**Testing:**
- `scripts/accessibility-test.ts`: Runs Playwright AXE tests for a11y violations
- `scripts/color-contrast-checker.ts`: Validates color contrast ratios meet WCAG standards
- `scripts/ui-tests.ts`: UI testing script for component validation
- `scripts/validate-routes.ts`: Validates app routes are correctly configured

**API Routes:**
- `app/api/auth/customer/authorize/route.ts`: Initiates OAuth login flow
- `app/api/auth/customer/callback/route.ts`: Handles OAuth callback, exchanges code for tokens
- `app/api/auth/customer/me/route.ts`: Returns current authenticated customer (used to check auth status)
- `app/api/auth/customer/logout/route.ts`: Clears auth cookies
- `app/api/email/order-confirmation/route.ts`: Sends order confirmation emails
- `app/api/email/welcome/route.ts`: Sends welcome email to new customers
- `app/api/admin/login/route.ts`: Admin login endpoint (password-based)
- `app/api/search/predictive/route.ts`: Returns search suggestions

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Components: `PascalCase.tsx` (e.g., `CartDrawer.tsx`, `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `shopify-helpers.ts`, `product-utils.ts`)
- Stores: `*-store.ts` (e.g., `cart-store.ts`, `auth-store.ts`)
- Hooks: `use-*.ts` (e.g., `use-focus-trap.ts`)
- Email components: `*-email.tsx` (e.g., `order-confirmation-email.tsx`)
- Queries/mutations: Named constants in ALL_CAPS (e.g., `CREATE_CART_MUTATION`, `GET_PRODUCT_QUERY`)

**Directories:**
- Feature directories: lowercase plural (e.g., `components/emails/`, `app/api/auth/`)
- Protected route groups: parentheses (e.g., `app/admin/(protected)/`)
- Dynamic routes: brackets (e.g., `products/[handle]/`, `collections/[handle]/`)
- UI library: `ui/` for design system components
- Store files: Root-level in `lib/` with `*-store.ts` pattern

**Identifiers:**
- State properties: camelCase (e.g., `isLoading`, `cartId`, `customerEmail`)
- Component props: camelCase (e.g., `onClose`, `isVisible`, `product`)
- Shopify IDs: PascalCase only in type names (ShopifyProduct, ShopifyVariant), used as strings in runtime
- Environment vars: SCREAMING_SNAKE_CASE (e.g., `SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_BASE_URL`)

## Where to Add New Code

**New Feature:**
- Primary code: `app/` for pages, `components/` for UI, `lib/` for business logic
- API endpoints: `app/api/[feature]/route.ts`
- State: `lib/[feature]-store.ts` if Zustand store needed
- Types: `types/[feature].ts` if new data models
- Tests: Co-locate with component files as `[component].test.tsx`

**New Component/Module:**
- Reusable component: `components/[feature]/ComponentName.tsx` (PascalCase)
- Feature-specific: `components/[feature]/` subdirectory if 3+ related components
- Design system component: `components/ui/ComponentName.tsx`
- Email template: `components/emails/[type]-email.tsx`

**Utilities:**
- Shared helpers: `lib/[utility-name].ts` (kebab-case)
- API-specific: `lib/shopify-*.ts` pattern for Shopify helpers
- Store-related: `lib/*-store.ts` for Zustand stores
- Hooks: `lib/hooks/use-[name].ts` for custom React hooks

**Styling:**
- Tailwind classes in JSX: Inline in `className` prop (Tailwind 4 recommends this over CSS files)
- Global styles: `app/globals.css` for root styles
- Font imports: Done in `app/layout.tsx` (Google Fonts via Next.js `next/font`)

## Special Directories

**app/admin/(protected)/ - Protected Routes:**
- Purpose: Admin dashboard behind authentication wall
- Generated: No (manually structured)
- Committed: Yes
- Pattern: Parentheses syntax groups routes logically without creating URL segment

**public/ - Static Assets:**
- Purpose: Unprocessed files served by CDN
- Generated: No (manually maintained)
- Committed: Yes (excluding large binaries if using Git LFS)
- Do not process through build pipeline

**types/ - Type Definitions Only:**
- Purpose: Single source of truth for TypeScript interfaces
- Generated: No
- Committed: Yes
- Export-only, no runtime code

**data/ - Static Content:**
- Purpose: Content like blog posts, testimonials, hardcoded lists
- Generated: No
- Committed: Yes
- Can be replaced with API calls in future

**.next/ - Build Output (Auto-generated):**
- Purpose: Compiled Next.js output
- Generated: Yes (by `npm run build` or `next build`)
- Committed: No (in .gitignore)

**node_modules/ - Dependencies:**
- Purpose: Installed npm packages
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-02-23*
