# Coding Conventions

**Analysis Date:** 2026-02-23

## Naming Patterns

**Files:**
- Component files: `PascalCase` (e.g., `ProductCard.tsx`, `Header.tsx`)
- Utility/lib files: `kebab-case` (e.g., `cart-store.ts`, `product-utils.ts`, `shopify-helpers.ts`)
- API routes: `kebab-case` with descriptive directory structure (e.g., `/app/api/auth/customer/authorize/route.ts`)
- Page routes: `kebab-case` directories (e.g., `/app/collections/page.tsx`, `/app/products/[handle]/page.tsx`)

**Functions:**
- Standard functions: `camelCase` (e.g., `getProductByHandle`, `formatMoney`, `isProductOnSale`)
- React hooks (custom): `camelCase` starting with "use" (e.g., `useCartStore`, `useQuickViewStore`, `useAuthStore`)
- Handler functions: `camelCase` prefixed with "handle" (e.g., `handleQuickView`, `handleSearchWorkflow`)
- Test/script functions: `camelCase` or descriptive names (e.g., `testStaticRoutes`, `testAccessibilityFeatures`)

**Variables:**
- Standard variables: `camelCase` (e.g., `firstImage`, `minPrice`, `itemCount`, `cartButton`)
- Constants: `UPPER_SNAKE_CASE` for immutable values (e.g., `BASE_URL`, `STATIC_ROUTES`, `FALLBACK_DYNAMIC_ROUTES`)
- Boolean variables: prefixed with "is" or other boolean descriptors (e.g., `isMounted`, `isLoading`, `isAuthenticated`, `availableForSale`)

**Types:**
- Interface names: `PascalCase` (e.g., `ProductCardProps`, `ShopifyProduct`, `CartStore`, `TestResult`)
- Discriminated union types used for extensibility (e.g., variant props like `variant="dustyRose"`)

## Code Style

**Formatting:**
- Tool: Prettier v3.7.4
- Key settings from `.prettierrc`:
  - Print width: 100 characters
  - Tab width: 2 spaces
  - Single quotes: true
  - Trailing commas: es5
  - Semicolons: true
  - Arrow function parens: avoid (e.g., `x => x` not `(x) => x`)
  - Line endings: LF

**Linting:**
- Tool: ESLint v9 with flat config (`eslint.config.mjs`)
- Extends: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- Accessibility focus with strict `jsx-a11y` rules (all errors on critical issues like alt-text, labels, roles)
- Integrates: Prettier plugin for style consistency

**TypeScript:**
- Configuration: `tsconfig.json`
- Strict mode: enabled (`"strict": true`)
- Target: ES2017
- Module: esnext
- JSX: react-jsx
- Path alias: `@/*` maps to project root
- All source files typed (`**/*.ts`, `**/*.tsx`)

## Import Organization

**Order:**
1. React/Next.js built-ins (e.g., `import { useState } from 'react'`, `import type { Metadata } from 'next'`)
2. Third-party dependencies (e.g., `import { create } from 'zustand'`, `import Image from 'next/image'`)
3. Local types/interfaces (e.g., `import type { ShopifyProduct } from '@/types/shopify'`)
4. Local utilities/helpers (e.g., `import { getShopifyClient } from './shopify'`)
5. Local components (e.g., `import Header from '@/components/header'`)
6. CSS imports (e.g., `import './globals.css'`)

**Path Aliases:**
- All internal imports use `@/` prefix (e.g., `@/components/`, `@/lib/`, `@/types/`)
- No relative path imports (./ or ../) within the app structure

**Type Imports:**
- Use `import type` for TypeScript-only imports to improve build performance (e.g., `import type { ShopifyCart } from '@/types/shopify'`)

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations with specific error messaging
- Error instanceof checks used to distinguish Error types (e.g., `error instanceof Error ? error.message : String(error)`)
- Console.error logs used before throwing or returning fallback values
- Graceful degradation: failed API calls return empty arrays or null rather than throwing (e.g., `getAllProductsHandles()` returns `[]` on error)
- Shopify API errors checked for `userErrors` array and GraphQL `errors` field separately

**API Route Patterns:**
- NextResponse used to handle redirects with error URL parameters (e.g., `/login?error=${encodeURIComponent(errorMessage)}`)
- Error logging includes context and user-friendly messages
- PKCE flow errors caught and redirected to login with meaningful message

**Frontend Patterns:**
- Error boundaries defined at layout level (`app/error.tsx`)
- Client-side error logging to console with `useEffect` in error boundary
- Errors in async store actions throw after logging to console
- Search endpoints return empty results instead of throwing to prevent UI crashes

## Logging

**Framework:** Console object (native browser/Node.js logging)

**Patterns:**
- `console.error()` for errors with context (e.g., `console.error('Error adding to cart:', error)`)
- `console.log()` for informational messages in scripts and tests
- Error context included (file/operation name + error object)
- No logging in production optimizations applied (no debug logs in hot paths)

## Comments

**When to Comment:**
- JSDoc comments for exported functions explaining parameters and purpose
- Inline comments for non-obvious business logic (e.g., "// Create new cart" when branching on cart existence)
- Comments explaining **why** not **what** the code does
- Accessibility comments noting design decisions (e.g., `// Decorative Corners`)
- Comments for feature flags or temporarily disabled code

**JSDoc/TSDoc:**
- Used on utility functions (e.g., `getProductByHandle()`, `formatMoney()`)
- Format: `/** \n * Description\n */` for multi-line, one-liner for simple functions
- Include parameter names and return type in comments for complex functions
- No automatic type documentation (relies on TypeScript for type clarity)

**Example JSDoc:**
```typescript
/**
 * Fetch a single product by handle with error handling
 */
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null>
```

## Function Design

**Size:**
- Functions typically 20-40 lines in utility files
- Component rendering functions: 30-80 lines depending on complexity
- Zustand store actions: 20-50 lines for async operations with error handling
- Store files reach 230 lines with multiple action methods

**Parameters:**
- Single object parameter for options/configuration (e.g., `getProducts(options: GetProductsOptions = {})`)
- Destructured options with defaults in function body (e.g., `const { first = 20, after } = options`)
- React component props always as single typed object parameter

**Return Values:**
- Functions return typed data or void
- Async functions always return Promise (e.g., `Promise<ShopifyProduct | null>`)
- Nullable returns used when data may not exist (e.g., `ShopifyProduct | null`)
- Generic types used in store mutations (e.g., `request<{ cartCreate: { cart: ShopifyCart } }>()`)

## Module Design

**Exports:**
- Named exports for utilities (e.g., `export function getProducts()`)
- Default export for React components (e.g., `export default function Header()`)
- Type exports separately (e.g., `export interface CartStore`)
- Zustand stores exported as named hooks (e.g., `export const useCartStore = create<CartStore>()`)

**Barrel Files:**
- Not heavily used; imports typically direct to source files
- Preference for specific imports over barrel re-exports

**File Organization:**
- Each major feature has dedicated directory (e.g., `lib/`, `components/`, `app/api/`)
- Zustand stores colocated in `lib/` as separate files (`cart-store.ts`, `auth-store.ts`, `wishlist-store.ts`)
- Types organized in `types/` directory by domain (`shopify.ts`, `reviews.ts`)
- API routes organized by feature in `app/api/` (e.g., `auth/customer/`, `email/`)

## Client/Server Boundaries

**Client Components:**
- Marked with `'use client'` directive at file top
- Used for interactive components (stores, event handlers, state)
- Example: `ProductCard.tsx`, `Header.tsx`, all components using Zustand

**Server Components:**
- Default in Next.js 13+ app directory
- Used for data fetching and metadata
- Example: `app/layout.tsx` (root), page components using `getProductByHandle()`

**Hydration Handling:**
- Components using Zustand stores use `isMounted` flag to prevent hydration mismatches
- Check pattern:
  ```typescript
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  ```
- Conditional rendering: `{isMounted && <StoreContent />}`

---

*Convention analysis: 2026-02-23*
