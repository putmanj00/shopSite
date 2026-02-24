# Architecture

**Analysis Date:** 2026-02-23

## Pattern Overview

**Overall:** Next.js 16 App Router with Client/Server hybrid, Shopify Storefront API integration, Client-side state management via Zustand

**Key Characteristics:**
- App Router pages (server-side rendering by default, opt-in client components)
- Shopify Storefront GraphQL API as primary data source
- Client-side state stores (Zustand) for cart, auth, wishlist, search
- API routes for backend operations (auth, emails, admin functions)
- React 19 with Suspense boundaries for progressive rendering
- Tailwind CSS 4 for styling with custom brand theming

## Layers

**Presentation Layer (Pages & Components):**
- Purpose: Render UI and handle user interactions
- Location: `app/` (pages), `components/` (reusable components)
- Contains: Server Components, Client Components (marked with 'use client'), UI components
- Depends on: Client stores (Zustand), API routes, data fetching functions
- Used by: Next.js App Router renderer

**State Management Layer:**
- Purpose: Manage application state across pages without prop drilling
- Location: `lib/*-store.ts` files (cart-store, auth-store, wishlist-store, search-store, quick-view-store, recently-viewed-store)
- Contains: Zustand store definitions with persist middleware
- Depends on: Shopify API client for cart operations
- Used by: Client components that read/update state

**Data Fetching & API Integration Layer:**
- Purpose: Handle all external API calls and query construction
- Location: `lib/shopify*.ts` (shopify.ts, shopify-queries.ts, shopify-helpers.ts, shopify-admin.ts), `lib/customer-account.ts`
- Contains: GraphQL query definitions, Shopify client initialization, token management, OAuth flows
- Depends on: Shopify Storefront API, Shopify Admin API, environment variables
- Used by: Components, stores, API routes

**API Routes Layer:**
- Purpose: Serverless backend endpoints for auth, email, admin operations
- Location: `app/api/` subdirectories (auth/, email/, admin/, search/, newsletter/)
- Contains: Next.js route handlers (GET/POST methods), request validation, business logic
- Depends on: Data fetching layer, email service (Resend), Shopify APIs
- Used by: Client-side fetch calls, webhooks, external services

**Utilities & Data Layer:**
- Purpose: Shared helper functions, data transformations, constants
- Location: `lib/` directory (product-utils.ts, category-filters.ts, email.ts, etc.), `data/` (static data like blog posts)
- Contains: Type definitions, transforms, mock data, constants
- Depends on: Types from `types/` directory
- Used by: All other layers

**Type Definition Layer:**
- Purpose: Central type definitions for Shopify models and custom types
- Location: `types/shopify.ts`, `types/reviews.ts`
- Contains: Interfaces for Product, Collection, Cart, Money, Variant, etc.
- Depends on: GraphQL schema knowledge (Shopify API)
- Used by: All layers that handle Shopify data

## Data Flow

**Product Browsing Flow:**

1. User visits `/products/[handle]` page (server component)
2. Server fetches product data from Shopify via `shopifyFetch()` + `shopify-queries.ts`
3. Page renders with `<Suspense>` boundaries for product info and reviews
4. Client components (AddToCartButton) use `useCartStore` to add items
5. Cart store calls Shopify Storefront API via GraphQL mutations
6. UI updates via Zustand subscription to store changes

**Authentication Flow (OAuth + PKCE):**

1. User clicks "Login" → redirects to `/api/auth/customer/authorize`
2. Route builds OAuth URL with PKCE code verifier/challenge via `customer-account.ts`
3. User auth state stored in cookies (httpOnly, secure)
4. Shopify redirects back to `/api/auth/customer/callback` with code
5. Route exchanges code for tokens via `exchangeCodeForTokens()`
6. Tokens stored in cookies, user redirected to `/account`
7. Client component calls `useAuthStore.checkAuth()` to fetch `/api/auth/customer/me`
8. Auth state updates in store

**Add to Cart Flow:**

1. Client clicks "Add to Cart" button
2. `AddToCartButton` component calls `useCartStore.addToCart(variantId)`
3. Store checks if cart exists (via `cart` state)
4. If no cart: calls `CREATE_CART_MUTATION` to create new cart on Shopify
5. Mutation response includes new cart ID
6. Then calls `ADD_TO_CART_MUTATION` with variant and quantity
7. Cart state updates in Zustand, triggering re-render
8. Cart drawer or badge updates to show new item count

**Email Workflow:**

1. External event triggers (order confirmation, welcome email, etc.)
2. API route receives POST request (e.g., `/api/email/order-confirmation`)
3. Route validates payload and constructs React email component
4. Calls `sendEmail()` from `lib/email.ts` with component
5. Email utility instantiates Resend client and sends via `resend.emails.send()`
6. If no API key or mock mode: logs to console instead
7. Returns success/error response to caller

**Search & Filtering Flow:**

1. User enters search query in `SearchBar` component
2. Component updates `useSearchStore` (search query state)
3. Updates call `/api/search/predictive` with query
4. Route fetches products matching query via Shopify GraphQL
5. Results stored in search store
6. UI renders filtered results with highlighted matches
7. Category and price filters update `useCategoryFiltersStore`
8. New query made with filter variables applied

**State Management:**

- **Cart State**: Persistent (localStorage via Zustand persist middleware), contains line items, totals, checkout URL
- **Auth State**: Non-persistent (cleared on browser close), stores customer ID, email, name
- **Wishlist State**: Persistent, array of product handles
- **Search State**: Ephemeral, cleared when search input changes
- **Recently Viewed**: Persistent, array of product handles with timestamps

## Key Abstractions

**ShopifyClient:**
- Purpose: Singleton GraphQL client for Shopify Storefront API
- Examples: `lib/shopify.ts` exports `getShopifyClient()`, `shopifyFetch()`
- Pattern: Lazy initialization, cached instance, generic fetch wrapper with error handling

**Zustand Stores:**
- Purpose: Centralized, reactive state management
- Examples: `useCartStore`, `useAuthStore`, `useWishlistStore`, `useSearchStore`
- Pattern: Create store with actions and state, persist middleware for localStorage, hookable in components

**GraphQL Query Manager:**
- Purpose: Centralize all GraphQL query strings and mutations
- Examples: `lib/shopify-queries.ts` contains 547 lines of queries/mutations
- Pattern: Export constants (CREATE_CART_MUTATION, ADD_TO_CART_MUTATION, etc.), import into stores/pages

**Email Component System:**
- Purpose: React components rendered to email HTML by Resend
- Examples: `components/emails/order-confirmation-email.tsx`, `welcome-email.tsx`
- Pattern: Functional React components with props, rendered by `sendEmail()` utility, styled with inline CSS

**OAuth + PKCE Handler:**
- Purpose: Secure passwordless auth with Shopify Customer Account API
- Examples: `lib/customer-account.ts` with 412 lines
- Pattern: Cookie-based state storage, code verifier generation, token exchange, refresh token handling

## Entry Points

**Web Application:**
- Location: `app/layout.tsx`
- Triggers: Server startup (Next.js dev/build)
- Responsibilities: Root layout wrapping all pages, sets up providers (CurrencyProvider), registers service worker, initializes analytics

**Homepage:**
- Location: `app/page.tsx`
- Triggers: GET request to `/`
- Responsibilities: Renders featured products, category cards, testimonials, brand story, newsletter signup (all wrapped in Suspense)

**Product Page:**
- Location: `app/products/[handle]/page.tsx`
- Triggers: GET request to `/products/:handle`
- Responsibilities: Fetches product by handle from Shopify, displays images, variants, reviews, recommendations

**Collection Page:**
- Location: `app/collections/[handle]/page.tsx`
- Triggers: GET request to `/collections/:handle`
- Responsibilities: Fetches collection products, applies filters/sorting, paginated grid layout

**Admin Dashboard:**
- Location: `app/admin/(protected)/page.tsx`
- Triggers: GET request to `/admin` (redirects to login if not authenticated)
- Responsibilities: Displays sales stats, inventory, orders, customer data (mock data for now)

**API: Customer Authorization:**
- Location: `app/api/auth/customer/authorize/route.ts`
- Triggers: GET request with optional returnTo query param
- Responsibilities: Initiates OAuth flow by building auth URL, storing state in cookies, redirecting to Shopify

**API: Auth Callback:**
- Location: `app/api/auth/customer/callback/route.ts`
- Triggers: GET request from Shopify with code and state
- Responsibilities: Validates state, exchanges code for tokens, stores tokens in cookies, redirects to dashboard

**API: Send Email:**
- Location: `app/api/email/**/route.ts` (multiple endpoints for different email types)
- Triggers: POST request with email payload (from webhooks or internal calls)
- Responsibilities: Validates payload, constructs email component, calls sendEmail utility, returns response

## Error Handling

**Strategy:** Try/catch blocks at API route and data fetching layer, console errors logged, user-friendly error messages returned

**Patterns:**
- API routes catch errors and return NextResponse with appropriate status code (400, 401, 500)
- GraphQL errors from Shopify inspected and serialized to console for debugging
- Client-side errors stored in Zustand stores (e.g., `auth.error` field), displayed in UI
- OAuth errors passed via URL query params (e.g., `/login?error=Invalid+state`)
- Fallback values used when API calls fail (e.g., empty arrays for products)

## Cross-Cutting Concerns

**Logging:** Console logging in development, error tracking via Vercel Analytics and SpeedInsights (monitoring, not logging)

**Validation:**
- API routes validate request bodies with basic presence checks
- Zustand stores validate state updates (type-safe via TypeScript)
- GraphQL schema enforces field types on Shopify side

**Authentication:**
- OAuth2 with PKCE via Shopify Customer Account API
- Access tokens stored in httpOnly cookies for security
- Refresh token logic handled in `customer-account.ts`
- Protected routes check auth state before rendering (e.g., admin dashboard checks login)

**Caching:**
- Shopify Storefront API responses cached by Next.js (default ISR)
- Cart state persisted to localStorage via Zustand
- Recent views, wishlist persisted to localStorage
- Cookies used for OAuth state validation and token storage

**Internationalization/Localization:**
- CurrencyProvider in `lib/currency-context.tsx` manages selected currency
- Dynamic currency selector component available in header

---

*Architecture analysis: 2026-02-23*
