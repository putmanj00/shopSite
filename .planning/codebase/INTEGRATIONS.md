# External Integrations

**Analysis Date:** 2026-02-23

## APIs & External Services

**Shopify Storefront API:**
- Shopify - Fetch products, collections, search, cart management, customer queries
  - SDK/Client: `@shopify/storefront-api-client@1.0.9`
  - Implementation: `lib/shopify.ts`
  - Auth: `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (public access token)
  - API Version: 2025-04 (GraphQL)
  - Usage: Product catalog, inventory, storefront queries in `lib/shopify-queries.ts` and `lib/shopify-helpers.ts`

**Shopify Admin API:**
- Shopify - Manage products, inventory, orders, customers (backend operations)
  - Implementation: `lib/shopify-admin.ts`
  - Auth: Client Credentials Grant (OAuth 2.0)
    - `SHOPIFY_CLIENT_ID` - Admin API client ID
    - `SHOPIFY_CLIENT_SECRET` - Admin API client secret
  - API Version: 2026-01 (GraphQL)
  - Token caching: 24-hour tokens cached in memory with 5-minute refresh buffer
  - Used in: Admin routes (`app/api/admin/*`), inventory management, product publishing

**Shopify Customer Account API:**
- Shopify - Customer authentication and account management (OAuth2 + PKCE)
  - Implementation: `lib/customer-account.ts`
  - Auth: OAuth2 with PKCE (Proof Key for Code Exchange)
    - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` - Customer Account OAuth client ID
    - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` - Optional for confidential clients
    - `SHOPIFY_SHOP_ID` - Numeric shop ID for API endpoint construction
  - OpenID Discovery: Fetches `.well-known/openid-configuration` from store domain
  - Token Management:
    - Access tokens: HttpOnly cookies (short-lived, auto-refresh)
    - Refresh tokens: HttpOnly cookies (30-day expiration)
    - ID tokens: HttpOnly cookies (logout use)
  - Endpoints:
    - Authorization: `/api/auth/customer/authorize` (`app/api/auth/customer/authorize/route.ts`)
    - Callback: `/api/auth/customer/callback` (`app/api/auth/customer/callback/route.ts`)
    - Logout: `/api/auth/customer/logout` (`app/api/auth/customer/logout/route.ts`)
    - Current User: `/api/auth/customer/me` (not shown but referenced in `lib/auth-store.ts`)
    - Profile Update: `/api/auth/customer/update` (not shown but referenced in `lib/auth-store.ts`)
  - Scope: `openid email customer-account-api:full`

## Data Storage

**Databases:**
- Not configured - Application uses Shopify as primary data store
- No persistent database (MongoDB, PostgreSQL, etc.) detected
- Local/in-memory storage: Product data cached via Shopify queries
- TODO comments indicate future implementation needed for:
  - Newsletter subscriptions (`app/api/newsletter/route.ts`)
  - Back-in-stock notifications (`app/api/back-in-stock/route.ts`)

**File Storage:**
- Local filesystem: Images served from `public/` directory
- Remote: Shopify CDN (`cdn.shopify.com`) for product images
- Image optimization: Next.js Image component with remote domain allowlist

**Caching:**
- In-memory: Shopify Admin API token cache in `lib/shopify-admin.ts`
- Browser: Cookie-based storage for:
  - Customer Account tokens (OAuth state, access tokens, refresh tokens)
  - Return-to URLs for post-login redirects
- No Redis, Memcached, or external caching layer

## Authentication & Identity

**Auth Provider:**
- Shopify Customer Accounts - OAuth2 PKCE flow
  - Implementation: `lib/customer-account.ts`
  - Cookie-based session storage (HttpOnly, Secure in production)
  - Token refresh: Automatic when accessing `/api/auth/customer/me`
  - Logout: Redirect to Shopify OpenID end_session_endpoint + local clear

**Admin Authentication:**
- Custom password-based: `ADMIN_PASSWORD` env var
  - Implementation: `lib/admin-auth.ts` and `app/api/admin/login/route.ts`
  - Session: Cookie-based with password hash verification
  - Used for: Admin dashboard routes in `app/admin/(protected)/`

**Client-Side Auth Store:**
- Zustand store: `lib/auth-store.ts`
  - State: Customer object, authentication status, loading flags
  - Actions: `checkAuth()`, `login()`, `logout()`, `updateProfile()`
  - Hydrates on app load from `/api/auth/customer/me` endpoint

## Monitoring & Observability

**Error Tracking:**
- Error logging: Console errors only (no Sentry or external service)
- Optional Sentry DSN: `SENTRY_DSN` env var mentioned but not implemented
- TODO: Error handler in `app/error.tsx` has placeholder for analytics/Sentry logging

**Analytics:**
- Vercel Web Vitals: `@vercel/analytics/react` integrated in `app/layout.tsx`
  - Component: `<VercelAnalytics />`
  - Tracks Core Web Vitals and page performance

- Vercel Speed Insights: `@vercel/speed-insights/next` integrated in `app/layout.tsx`
  - Component: `<SpeedInsights />`
  - Real-time performance monitoring

**Custom Analytics:**
- Google Analytics 4: `NEXT_PUBLIC_GA_ID` (optional)
  - Implementation: `components/analytics.tsx` with Script injection
  - Tracking helpers: `trackGAEvent()`, `trackAddToCart()`, `trackPurchase()`, `trackViewContent()`
  - Used in: E-commerce event tracking throughout application

- Facebook Pixel: `NEXT_PUBLIC_FB_PIXEL_ID` (optional)
  - Implementation: `components/analytics.tsx` with fbq SDK
  - Tracking helpers: `trackFBEvent()`, `trackAddToCart()`, `trackPurchase()`, `trackViewContent()`
  - Used in: Conversion tracking and audience building

**Logs:**
- Console-based: `console.log()` and `console.error()` throughout application
- No structured logging framework (Winston, Pino, etc.)

## CI/CD & Deployment

**Hosting:**
- Vercel (recommended for Next.js 16)
- Alternative: Any Node.js 20+ environment

**CI Pipeline:**
- Not detected in codebase
- Potential: GitHub Actions (not configured)

**Build Process:**
- Pre-build: `npm run contrast:check` - Color contrast accessibility validation
- Build: `next build` - Next.js production build
- Dev: `next dev` - Development server with hot reload

**Local Tunneling:**
- Localtunnel: `npx localtunnel --port 3000 --subdomain new-terms-behave`
  - Purpose: Expose localhost to internet for Shopify webhooks and OAuth callback testing
  - Script: `npm run tunnel`

## Environment Configuration

**Required env vars:**
- `SHOPIFY_STORE_DOMAIN` - Store domain (e.g., store.myshopify.com)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Public storefront API token
- `SHOPIFY_SHOP_ID` - Numeric shop ID
- `SHOPIFY_CLIENT_ID` - Admin API client ID
- `SHOPIFY_CLIENT_SECRET` - Admin API client secret
- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` - Customer Account OAuth client ID
- `NEXT_PUBLIC_BASE_URL` - Application base URL (e.g., http://localhost:3000 or https://example.com)

**Optional env vars:**
- `RESEND_API_KEY` - Resend email service key (falls back to mock mode)
- `SENDGRID_API_KEY` - SendGrid API key (configured but not implemented)
- `NEXT_PUBLIC_GA_ID` - Google Analytics 4 ID
- `NEXT_PUBLIC_FB_PIXEL_ID` - Facebook Pixel ID
- `SENTRY_DSN` - Sentry error tracking (not implemented)
- `ADMIN_PASSWORD` - Password for admin dashboard access

**Secrets location:**
- `.env` file (Git-ignored, populated from `.env.example`)
- Use Vercel Secrets UI for production deployments
- All secrets transmitted via environment at runtime

## Webhooks & Callbacks

**Incoming:**
- Shopify OAuth Callback: `/api/auth/customer/callback`
  - Receives: Authorization code, state, error parameters
  - Handles: Token exchange, session setup, redirect to original URL
  - Implementation: `app/api/auth/customer/callback/route.ts`

- Newsletter Signup: `/api/newsletter` (POST)
  - Receives: Email address
  - TODO: Integrate with mailing list service (Mailchimp, SendGrid)
  - Implementation: `app/api/newsletter/route.ts`

- Back-in-Stock: `/api/back-in-stock` (POST)
  - Receives: Email, product ID, variant details
  - TODO: Database storage, inventory webhooks
  - Implementation: `app/api/back-in-stock/route.ts`

**Outgoing:**
- Shopify Admin API Webhooks: Configured in `shopify.app.toml` but not implemented in codebase
  - Scopes: read_products, write_products, read_orders, read_customers, read_inventory, write_inventory, read_locations, read_publications, write_publications
  - API Version: 2026-01
  - TODO: Webhook handlers for product updates, order events, etc.

## Email Service

**Email Provider:**
- Resend: `resend@6.7.0`
  - Implementation: `lib/email.ts`
  - Fallback: Mock mode when API key missing (logs to console)
  - Usage: Transactional emails with React component rendering
  - From: `Wildenflower <onboarding@resend.dev>`

**Configured but Not Implemented:**
- SendGrid: `SENDGRID_API_KEY` mentioned in `.env.example` but no SDK imported

## Third-Party Tools & Services

**Shopify App Configuration:**
- Shopify App CLI: `shopify.app.toml`
  - Client ID: `001080c5f19b83255358d8485ab20637`
  - App Mode: Embedded admin extension
  - Access Scopes: Products, Orders, Customers, Inventory, Publications

**Service Worker & PWA:**
- Manifest: `public/manifest.json`
  - PWA support for offline experience
  - Start URL: `/`
  - Theme Color: #7C3AED (Cosmic Purple)

---

*Integration audit: 2026-02-23*
