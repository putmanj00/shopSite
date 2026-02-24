# Technology Stack

**Analysis Date:** 2026-02-23

## Languages

**Primary:**
- TypeScript 5 - Full type safety across application
- JavaScript (React 19) - Client-side UI and browser APIs

**Secondary:**
- CSS with Tailwind - Styling and theming

## Runtime

**Environment:**
- Node.js - Server runtime for Next.js 16 and API routes
- Browser (modern ES2017+) - Client-side execution

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` - Present and committed

## Frameworks

**Core:**
- Next.js 16.1.1 - Full-stack React framework with App Router
- React 19.2.3 - UI component library and hooks
- React DOM 19.2.3 - DOM rendering for React

**Styling & UI:**
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS integration for Tailwind

**State Management:**
- Zustand 5.0.10 - Lightweight client state management store
  - Used in: `lib/auth-store.ts`, `lib/cart-store.ts`, `lib/quick-view-store.ts`, `lib/wishlist-store.ts`, `lib/search-store.ts`, `lib/recently-viewed-store.ts`

**Animation & Motion:**
- Framer Motion 12.26.2 - React animation library for UI transitions

**Testing:**
- Playwright 1.40.0 - End-to-end testing framework
- @axe-core/playwright 4.9.0 - Accessibility testing with Playwright

**Dev Tools & Build:**
- ESLint 9 - Code linting and quality
- Prettier 3.7.4 - Code formatting
- TypeScript 5 - Type checking compiler
- ts-node 10.9.2 - TypeScript execution for scripts
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions

## Key Dependencies

**Critical:**
- @shopify/storefront-api-client 1.0.9 - Shopify Storefront GraphQL API client
  - Used in: `lib/shopify.ts` for product queries and customer data
- graphql 16.12.0 - GraphQL query execution library

**Email & Communication:**
- resend 6.7.0 - Email service for transactional emails
  - Configured in: `lib/email.ts` with React component rendering
  - Mock mode fallback when API key missing

**Analytics & Monitoring:**
- @vercel/analytics 1.6.1 - Web vitals and performance analytics
- @vercel/speed-insights 1.3.1 - Core Web Vitals monitoring
- Vercel deployment integration

**Configuration Management:**
- dotenv 17.2.3 - Environment variable loading

## Configuration

**Environment:**
- Environment variables loaded via `.env` file (must be created from `.env.example`)
- Runtime environment: NODE_ENV (development/production)
- Critical vars required:
  - `SHOPIFY_STORE_DOMAIN` - Shopify store URL
  - `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Public storefront token
  - `SHOPIFY_SHOP_ID` - Numeric shop identifier
  - `SHOPIFY_CLIENT_ID` - Admin API client ID
  - `SHOPIFY_CLIENT_SECRET` - Admin API client secret
  - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` - Customer Account API client ID
  - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` - Customer Account API secret
  - `NEXT_PUBLIC_BASE_URL` - Application base URL (for email links, OAuth callbacks)
  - `RESEND_API_KEY` - Email service API key (optional, mock mode if missing)
  - `NEXT_PUBLIC_GA_ID` - Google Analytics 4 ID (optional)
  - `NEXT_PUBLIC_FB_PIXEL_ID` - Facebook Pixel ID (optional)
  - `ADMIN_PASSWORD` - Admin panel security key

**Build:**
- `tsconfig.json` - TypeScript compiler configuration with strict mode enabled
- `next.config.ts` - Next.js build configuration
- `postcss.config.mjs` - PostCSS/Tailwind configuration
- `.prettierrc` - Code formatting rules (100 char line width, 2 space indent)
- `eslint.config.mjs` - ESLint rules with strict accessibility requirements

**Image Optimization:**
- Remote image domains configured in `next.config.ts`:
  - `cdn.shopify.com` - Shopify product images
  - `images.unsplash.com` - Fallback stock images
  - `upload.wikimedia.org` - Wikipedia commons images

## Build & Dev Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production (includes color contrast check)
npm start            # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
npm run test:all     # Run all tests (typecheck + lint + ui tests)
npm run test:ui      # Run UI tests with Playwright
npm run test:routes  # Validate route configuration
npm run a11y:all     # Run accessibility tests (contrast + wcag)
npm run tunnel       # Expose localhost via localtunnel for webhooks/testing
```

## Platform Requirements

**Development:**
- Node.js 20+ (per @types/node)
- npm or compatible package manager
- Modern browser for client-side testing

**Production:**
- Node.js 20+ runtime environment
- Deployment platform: Vercel recommended (native Next.js 16 support)
- Domain configured for OAuth callbacks
- SSL/TLS certificate for HTTPS (required for Shopify OAuth)

## Git Tracking

- Source files tracked in git
- `node_modules/` excluded via `.gitignore`
- `.next/` build artifacts excluded
- `.env` environment config excluded (use `.env.example` as template)

---

*Stack analysis: 2026-02-23*
