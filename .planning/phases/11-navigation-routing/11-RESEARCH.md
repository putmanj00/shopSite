# Phase 11: Navigation Routing - Research

**Researched:** 2026-02-25
**Domain:** Next.js 16 proxy (middleware) redirects + link audit
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Redirect implementation:** Use `proxy.ts` (Next.js 16 name for middleware.ts) — not `next.config.js` — so query strings are preserved in the redirect
- **Both `/collections` and `/collections/` (trailing slash)** must redirect to `/collections/all`
- **Query strings must carry through:** `/collections?sort=price-asc` → `/collections/all?sort=price-asc`
- **HTTP status:** 301 Permanent (as specified in success criteria)
- **If a `/collections` page/route file exists, delete it** — the proxy redirect makes it dead code
- **Audit scope:** `.tsx`, `.ts`, `.js` source files + config files (`.json`, `.yaml`)
- **Skip `node_modules`** and vendored code — document any findings there but do not modify
- **Catch both literal `href="/collections"` and dynamic construction** (template literals, `router.push('/collections')`, `Link href={"/collections"}`)
- **Also audit `sitemap.xml` or sitemap generation code** — update any `/collections` entries to `/collections/all`
- **Plan must include a final grep verification task** that runs the exact success-criteria check: zero results for `href="/collections"` (exact, no handle suffix)
- **Scope boundary:** Strictly `/collections` only — no broader audit of other bare routes
- **Only named CTA is "Wander the Shop" button on the hero** — grep will surface any others
- **No dev server curl smoke test required** — code review + grep verification is sufficient

### Claude's Discretion

- How to structure the proxy implementation (path matching approach)
- Whether to add a comment in proxy.ts documenting the reason for the redirect

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Shopper visiting `/collections` is automatically redirected to `/collections/all` (301 permanent redirect) | proxy.ts with `NextResponse.redirect` + 301 status + query string preservation via `request.nextUrl.search` |
| NAV-02 | "Wander the Shop" hero CTA links to `/collections/all`, not `/collections` | Fix `href` prop in `app/page.tsx` line 68 (EnhancedHero ctas array) |
| NAV-03 | No stale `href="/collections"` links remain anywhere in the codebase | Audit and fix 6 source files + sitemap.ts + delete `app/collections/page.tsx` |
</phase_requirements>

---

## Summary

Phase 11 is a targeted routing fix with two distinct parts: (1) a server-side 301 redirect from `/collections` to `/collections/all`, and (2) a codebase link audit that eliminates all hardcoded `/collections` hrefs. Both parts are independently testable via grep.

**Critical discovery:** In Next.js 16.0, `middleware.ts` is **deprecated and renamed to `proxy.ts`**. The function export also changes from `export function middleware()` to `export function proxy()`. The file must be placed at the project root (same level as `app/`). No `proxy.ts` currently exists in this project — it will be created fresh. The codemod `npx @next/codemod@canary middleware-to-proxy .` exists for migration but is irrelevant here (no existing middleware.ts).

**Link audit is already well-scoped:** A grep of `href="/collections"` (exact, no handle suffix) found 7 instances across 6 files plus `sitemap.ts`. Dynamic `router.push('/collections')` patterns were checked and returned no results. The `app/collections/page.tsx` exists and must be deleted (it renders a collections grid that will never be reached after the redirect).

**Primary recommendation:** Create `proxy.ts` at project root with a 301 redirect matching `/collections` and `/collections/` (exact paths, not wildcard), preserving query strings via `request.nextUrl.search`. Then fix all 7 `href="/collections"` instances across the codebase. Delete `app/collections/page.tsx`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/server` | 16.1.1 (bundled) | `NextRequest`, `NextResponse` for proxy redirects | Built into Next.js, no install needed |

### No Additional Libraries Needed

This phase uses only built-in Next.js APIs. No npm installs required.

---

## Architecture Patterns

### Recommended File Structure

```
/                          # project root
├── proxy.ts               # NEW — server redirect (Next.js 16 convention)
├── app/
│   ├── collections/
│   │   ├── [handle]/      # keep — collection detail pages
│   │   └── page.tsx       # DELETE — dead code after redirect
│   └── page.tsx           # fix line 68 href
├── components/
│   ├── hero.tsx            # fix lines 20, 26
│   ├── collection-breadcrumbs.tsx  # fix line 63
│   ├── homepage/
│   │   └── brand-story.tsx          # fix line 62
│   └── account/
│       ├── wishlist-preview.tsx     # fix line 46
│       └── order-history.tsx        # fix line 269
├── app/
│   ├── local/page.tsx               # fix line 95
│   └── sitemap.ts                   # fix line 12 (remove '/collections' static entry)
```

### Pattern 1: Next.js 16 Proxy Redirect with Query String Preservation

**What:** A `proxy.ts` file at the project root that intercepts requests to `/collections` and `/collections/` and issues a 301 redirect to `/collections/all`, carrying forward any query parameters.

**When to use:** Any time a permanent URL redirect must preserve query strings. `next.config.js` redirects cannot forward query strings to a different destination path — proxy is the only option.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
// proxy.ts — project root
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Redirect /collections (bare, no handle) to /collections/all
// Uses proxy.ts (Next.js 16 name for middleware.ts)
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Match exact /collections and /collections/ (trailing slash)
  if (pathname === '/collections' || pathname === '/collections/') {
    const destination = new URL(`/collections/all${search}`, request.url);
    return NextResponse.redirect(destination, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  // Only run on /collections (exact) and /collections/ (trailing slash)
  // Does NOT match /collections/[handle] — those pass through untouched
  matcher: ['/collections', '/collections/'],
};
```

**Key details:**
- `request.nextUrl.search` is the full query string including the `?` — e.g., `?sort=price-asc`. Appending it to the destination URL preserves all query parameters.
- `{ status: 301 }` is passed as the second argument to `NextResponse.redirect()` to override the default 307.
- The `matcher` config uses exact paths (no `:path*` wildcard) so `/collections/all` and `/collections/[handle]` are never intercepted.
- The function is named `proxy` (not `middleware`) — this is the Next.js 16 convention.

### Pattern 2: Static Link Fix (href update)

**What:** Change `href="/collections"` to `href="/collections/all"` in source files.

**When to use:** All `<Link>` components and `<a>` tags that reference `/collections` bare.

**Example (app/page.tsx):**
```typescript
// Before (line 68):
{ label: 'Wander the Shop', href: '/collections', variant: 'primary' },

// After:
{ label: 'Wander the Shop', href: '/collections/all', variant: 'primary' },
```

**Example (breadcrumbs — special consideration):**
```typescript
// components/collection-breadcrumbs.tsx line 63
// The "Collections" breadcrumb middle-step currently links to /collections
// After fix — link to /collections/all (the canonical shop page):
<Link href="/collections/all" ...>
  <span itemProp="name">Collections</span>
</Link>
```

### Pattern 3: Sitemap Update

**What:** Remove `/collections` from the static routes array in `app/sitemap.ts` since it will 301 redirect (search engines should not index redirect targets).

**When to use:** Any route that is a redirect should not appear in the sitemap as a URL.

```typescript
// app/sitemap.ts — BEFORE (line 9-17):
const routes = [
  '',
  '/about',
  '/collections',        // <- REMOVE THIS LINE
  '/accessibility',
  '/collections/all',    // this stays
  ...
]

// AFTER:
const routes = [
  '',
  '/about',
  '/accessibility',
  '/collections/all',
  ...
]
```

### Anti-Patterns to Avoid

- **Using `next.config.js` redirects instead of proxy.ts:** `next.config.js` `redirects()` uses a `permanent: true` flag which emits 308, not 301. More critically, it cannot preserve query strings when redirecting to a different path. Use proxy.ts.
- **Using `redirect()` from `next/navigation` in a page component:** This function issues a 307/303 from server components, not a 301, and only fires after the route renders — not at the network edge.
- **Using `:path*` wildcard in matcher:** `matcher: '/collections/:path*'` would intercept `/collections/all` and `/collections/[handle]` — those must NOT be redirected. Use exact matchers.
- **Forgetting the trailing slash variant:** `/collections/` (with trailing slash) is a distinct path that needs its own matcher entry.
- **Leaving `app/collections/page.tsx` in place:** After the proxy redirect, this file is dead code. In some Next.js builds it can cause route conflicts. Delete it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 301 with query string forwarding | Custom API route or page-level redirect | `proxy.ts` with `NextResponse.redirect` | Built-in, runs at network edge before rendering, zero latency |
| Finding all `/collections` hrefs | Manual file-by-file inspection | `grep -r 'href="/collections"'` | Fast, auditable, forms the success-criteria verification |

**Key insight:** Query string preservation is the one reason proxy.ts is required over `next.config.js`. The CONTEXT.md explicitly calls this out. Don't use `next.config.js` redirects for this.

---

## Common Pitfalls

### Pitfall 1: middleware.ts vs proxy.ts in Next.js 16

**What goes wrong:** Writing `export function middleware()` in `middleware.ts` — this is the deprecated pattern as of Next.js 16.0.
**Why it happens:** Training data and most tutorials still show `middleware.ts`. Next.js 16 renamed the file and function.
**How to avoid:** Create `proxy.ts` at project root. Export `proxy` function (named export, not default). Verify using the official docs at https://nextjs.org/docs/app/api-reference/file-conventions/proxy.
**Warning signs:** TypeScript compiler may not error (both work for now during deprecation period), but the preferred convention for this codebase running Next.js 16.1.1 is `proxy.ts`.

**Note on backward compatibility:** The Next.js 16 docs state `middleware` is deprecated but the version history shows the rename happened at v16.0.0. The installed version is 16.1.1. The codemod exists (`npx @next/codemod@canary middleware-to-proxy .`) which confirms this is the current convention. Use `proxy.ts`.

### Pitfall 2: 301 vs 308 Status Code

**What goes wrong:** Using `NextResponse.redirect(url)` without specifying status — defaults to 307 (temporary), not 301.
**Why it happens:** Next.js defaults to 307/308 to preserve request method. For a GET-only page redirect, 301 is correct per the success criteria.
**How to avoid:** Always pass `{ status: 301 }` as the second argument: `NextResponse.redirect(url, { status: 301 })`.
**Warning signs:** Browser DevTools Network tab shows 307 instead of 301.

### Pitfall 3: Matcher Wildcard Catching Too Much

**What goes wrong:** `matcher: '/collections/:path*'` also matches `/collections/all` and `/collections/[handle]`, causing redirect loops or broken collection pages.
**Why it happens:** Trying to be DRY with a single wildcard pattern.
**How to avoid:** Use exact matchers for the two redirect targets: `matcher: ['/collections', '/collections/']`.
**Warning signs:** Visiting `/collections/all` also redirects — infinite redirect loop.

### Pitfall 4: Missing the Search String in Redirect URL

**What goes wrong:** `new URL('/collections/all', request.url)` — drops query parameters because the path is hardcoded without `search`.
**Why it happens:** Constructing the URL from path alone.
**How to avoid:** Append `request.nextUrl.search` to the destination path: `new URL(\`/collections/all${request.nextUrl.search}\`, request.url)`.
**Warning signs:** UTM params and sort filters disappear after redirect.

### Pitfall 5: Leaving `/collections` in sitemap.ts

**What goes wrong:** Search engines index the redirect URL `/collections`, which scores a 301 and may split link equity.
**Why it happens:** Forgetting that the sitemap needs to reflect canonical URLs only.
**How to avoid:** Remove `/collections` from the static routes array in `app/sitemap.ts`. Keep `/collections/all`.
**Warning signs:** Google Search Console reports `/collections` as a redirect.

---

## Code Examples

Verified patterns from official sources:

### Complete proxy.ts Implementation

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
// File: proxy.ts (project root, same level as app/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Redirect bare /collections to /collections/all
// Preserves query strings: /collections?sort=price-asc → /collections/all?sort=price-asc
// Uses 301 (Permanent) as required by NAV-01 success criteria
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/collections' || pathname === '/collections/') {
    const destination = new URL(`/collections/all${search}`, request.url);
    return NextResponse.redirect(destination, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  // Exact match only — does NOT intercept /collections/all or /collections/[handle]
  matcher: ['/collections', '/collections/'],
};
```

### Link Fix Pattern (all 7 instances)

```typescript
// Source: grep results from codebase audit
// Change: href="/collections" → href="/collections/all"
// Files:
//   app/page.tsx:68              EnhancedHero "Wander the Shop" CTA (NAV-02)
//   components/hero.tsx:20       "Shop Now" button (legacy hero)
//   components/hero.tsx:26       "Browse Collections" button (legacy hero)
//   components/homepage/brand-story.tsx:62   "Explore the Collection" link
//   components/collection-breadcrumbs.tsx:63  "Collections" breadcrumb link
//   components/account/wishlist-preview.tsx:46  "Browse Products" button
//   components/account/order-history.tsx:269   "Start Shopping" button
//   app/local/page.tsx:95         "Shop Online" button
```

### Grep Verification Command (Success Criteria Check)

```bash
# This grep must return zero results after all fixes are applied
# Matches: href="/collections" (exact, no handle suffix)
grep -r 'href="/collections"' \
  --include="*.tsx" \
  --include="*.ts" \
  --include="*.js" \
  --include="*.jsx" \
  /path/to/shopSite \
  --exclude-dir=node_modules
```

### Sitemap Fix

```typescript
// app/sitemap.ts — remove '/collections' from static routes array
// BEFORE:
const routes = [
  '',
  '/about',
  '/collections',    // DELETE this line
  '/accessibility',
  '/collections/all',
  ...
]

// AFTER:
const routes = [
  '',
  '/about',
  '/accessibility',
  '/collections/all',
  ...
]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` with `export function middleware()` | `proxy.ts` with `export function proxy()` | Next.js v16.0.0 | File and function must be renamed; codemod available |
| `next.config.js` `redirects()` for query-preserving redirects | `proxy.ts` with `NextResponse.redirect` | Best practice clarified | `next.config.js` redirects cannot forward query strings to different paths |

**Deprecated/outdated:**
- `middleware.ts` / `export function middleware()`: Deprecated in Next.js v16.0.0. Renamed to `proxy.ts` / `export function proxy()`. Backward compatibility may persist during deprecation window but `proxy.ts` is the correct convention for this project (Next.js 16.1.1).

---

## Open Questions

1. **backward compatibility of `middleware.ts` during deprecation**
   - What we know: Next.js 16.0 deprecated `middleware.ts` in favor of `proxy.ts`. The installed version is 16.1.1.
   - What's unclear: Whether `middleware.ts` still works at runtime in 16.1.1 (likely yes during deprecation period).
   - Recommendation: Use `proxy.ts` regardless — it is the documented convention for the installed version.

2. **`app/collections/page.tsx` deletion scope**
   - What we know: The file renders a full collections grid and is now dead code if proxy redirect is in place.
   - What's unclear: Whether any other part of the Next.js router or build process references it.
   - Recommendation: Delete it. The `[handle]` subdirectory is unaffected. The proxy fires before the file system router, so the page would never render.

---

## Codebase Audit Summary

**All `href="/collections"` instances found (7 links across 6 files + 1 config file):**

| File | Line | Context | Fix |
|------|------|---------|-----|
| `app/page.tsx` | 68 | EnhancedHero "Wander the Shop" CTA (NAV-02) | `href="/collections/all"` |
| `components/hero.tsx` | 20 | "Shop Now" button (legacy hero, not rendered by default) | `href="/collections/all"` |
| `components/hero.tsx` | 26 | "Browse Collections" button (legacy hero) | `href="/collections/all"` |
| `components/homepage/brand-story.tsx` | 62 | "Explore the Collection" link | `href="/collections/all"` |
| `components/collection-breadcrumbs.tsx` | 63 | "Collections" breadcrumb middle step | `href="/collections/all"` |
| `components/account/wishlist-preview.tsx` | 46 | "Browse Products" empty-state button | `href="/collections/all"` |
| `components/account/order-history.tsx` | 269 | "Start Shopping" empty-state button | `href="/collections/all"` |
| `app/local/page.tsx` | 95 | "Shop Online" button | `href="/collections/all"` |
| `app/sitemap.ts` | 12 | Static route entry | Remove `/collections` entry |

**Also:**
- `app/collections/page.tsx` — exists, must be deleted (dead code post-redirect)
- `router.push('/collections')` — searched, zero instances found
- Config files (.json, .yaml) — searched, zero instances found

---

## Sources

### Primary (HIGH confidence)
- `https://nextjs.org/docs/app/api-reference/file-conventions/proxy` — Next.js 16 proxy.ts conventions, migration from middleware.ts, matcher config, NextResponse.redirect with status codes; version 16.1.6, lastUpdated 2026-02-24
- `https://nextjs.org/docs/app/guides/redirecting` — Redirect method comparison table, NextResponse.redirect vs next.config.js vs redirect() function; version 16.1.6, lastUpdated 2026-02-24

### Secondary (MEDIUM confidence)
- Codebase grep results — direct inspection of all `href="/collections"` instances in project source files (7 links, 6 files + sitemap.ts confirmed)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official Next.js 16.1.6 docs (lastUpdated 2026-02-24)
- Architecture: HIGH — proxy.ts pattern confirmed in official docs; codebase audit confirmed via grep
- Pitfalls: HIGH — middleware.ts deprecation confirmed in version history table in official docs; other pitfalls from direct code inspection

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable Next.js docs; proxy.ts convention is settled)
