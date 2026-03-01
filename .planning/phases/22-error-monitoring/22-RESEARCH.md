# Phase 22: Error Monitoring - Research

**Researched:** 2026-02-28
**Domain:** Sentry SDK for Next.js App Router (production-only error capture, source maps, tunnel)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sentry account setup:**
- Creating a fresh Sentry org (new account, no existing org)
- Free tier (Developer) — 5,000 errors/month, sufficient for a boutique storefront
- Project name: `wildenflower`
- SENTRY_DSN stored only in Vercel production environment variables — not in local .env
- Local development will never send events (NODE_ENV === 'production' gate)

**Source maps:**
- Upload source maps to Sentry during `next build` via the @sentry/nextjs Webpack plugin
- Source maps deleted from public build output after upload (hidden from end users)
- SENTRY_AUTH_TOKEN needed in both GitHub Actions secrets (for CI builds) and Vercel env vars (for manual deploys)
- The existing Phase 20 CI pipeline deploy-prod job must expose SENTRY_AUTH_TOKEN during the build step

**Tunnel vs. direct ingest:**
- Use the Sentry tunnel: `/monitoring` API route proxies events to Sentry
- Tunnel prevents ad blockers from dropping error events
- CSP: tunnel only — no `*.sentry.io` added to connect-src (tunnel is same-origin, so no CSP change needed for Sentry)
- The `/monitoring` route is open (unauthenticated) — Sentry SDK validates envelope payloads internally

**Test verification:**
- Temporary `/sentry-test` page: server-side route handler throws + client-side unhandled promise rejection on page load
- Covers both capture paths from the phase success criteria
- Removal is an explicit plan task: verify events appear in Sentry dashboard, then delete the route and commit

### Claude's Discretion
- Exact Sentry SDK initialization options (tracesSampleRate, replaysSessionSampleRate, etc.)
- Error filtering / ignore rules (e.g., ignoring known Next.js hydration noise)
- Which existing `console.error` calls to supplement with `Sentry.captureException()`

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MON-01 | Sentry `@sentry/nextjs` installed and configured for Next.js 16 App Router (client + server) | @sentry/nextjs 10.x supports Next.js 13.2.0+; manual setup creates instrumentation.ts, instrumentation-client.ts, sentry.server.config.ts, sentry.edge.config.ts, and wraps next.config.ts with withSentryConfig |
| MON-02 | Sentry only active in `NODE_ENV === 'production'` — not in development | DSN-gating pattern: SENTRY_DSN set only in Vercel production env, undefined in dev causes Sentry to self-disable without error |
| MON-03 | Sentry captures unhandled errors via server instrumentation and `global-error.tsx` | onRequestError hook in instrumentation.ts captures server component errors automatically; global-error.tsx and error.tsx require explicit Sentry.captureException() in useEffect |
</phase_requirements>

---

## Summary

`@sentry/nextjs` version 10.x (latest: 10.40.0 as of March 2026) is the standard SDK for Next.js App Router projects. For Next.js 16, the SDK supports full App Router instrumentation via Next.js's built-in instrumentation hooks (no experimental flags needed — instrumentation stabilized in Next.js 15+). Setup requires four configuration files: `instrumentation.ts` (registers server/edge hooks), `instrumentation-client.ts` (client-side init), `sentry.server.config.ts`, and `sentry.edge.config.ts`. The `next.config.ts` is wrapped with `withSentryConfig()` for source map upload and tunnel routing.

The production-only gate is implemented via DSN-gating: `SENTRY_DSN` is set only in Vercel production environment variables, never in `.env.local` or `.env`. When `Sentry.init({ dsn: process.env.SENTRY_DSN })` receives `undefined`, the SDK self-disables silently — no events fire, no overhead. This is cleaner than `enabled: process.env.NODE_ENV === 'production'` because it requires no code-level environment checks and works naturally with the decision to store DSN only in Vercel prod.

The tunnel (`tunnelRoute: "/monitoring"`) is automatically handled by `withSentryConfig` — it creates a Next.js rewrite internally; no manual `app/monitoring/route.ts` file is needed. Source maps are uploaded during `next build` and `sourcemaps.deleteSourcemapsAfterUpload` defaults to `true`, removing client-side maps from `.next/static/` after upload while preserving server-side maps for runtime error reporting.

**Primary recommendation:** Install `@sentry/nextjs@latest`, manually create the four config files, wrap `next.config.ts` with `withSentryConfig`, set DSN only in Vercel prod env, and add `SENTRY_AUTH_TOKEN` to both GitHub Actions secrets and Vercel env.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @sentry/nextjs | 10.40.0 (latest) | Full Sentry SDK for Next.js with App Router, source maps, tunnel | Official Sentry-maintained package; bundles client + server + edge configs and Webpack plugin |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sentry/wizard (npx only) | @latest | Interactive setup automation | Alternative to manual setup; generates all config files |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @sentry/nextjs (manual) | npx @sentry/wizard@latest -i nextjs | Wizard is faster but less transparent; manual gives exact control over all options |
| Sentry tunnel | Direct sentry.io ingest | Direct is simpler but blocked by ad blockers — tunnel is locked decision |
| DSN-gating | enabled: process.env.NODE_ENV === 'production' | enabled: false doesn't eliminate SDK overhead; undefined DSN is the cleanest disable pattern |

**Installation:**
```bash
npm install @sentry/nextjs
```

---

## Architecture Patterns

### Recommended Project Structure
```
shopSite/
├── instrumentation.ts              # Next.js instrumentation hook — registers server/edge Sentry
├── instrumentation-client.ts       # Client-side Sentry init (browser)
├── sentry.server.config.ts         # Server Sentry.init() options
├── sentry.edge.config.ts           # Edge runtime Sentry.init() options
├── next.config.ts                  # Wrapped with withSentryConfig (existing file, modified)
├── app/
│   ├── error.tsx                   # MODIFY: add Sentry.captureException() in useEffect
│   ├── global-error.tsx            # MODIFY: add Sentry.captureException() in useEffect
│   └── sentry-test/                # TEMPORARY: test page, deleted after verification
│       └── page.tsx
```

### Pattern 1: DSN-Gating for Production-Only Events
**What:** Set `dsn: process.env.SENTRY_DSN` in all Sentry.init() calls. SENTRY_DSN is only present in Vercel production environment — absent in dev, the SDK self-disables.
**When to use:** Always — this is the locked decision for this project.
**Example:**
```typescript
// sentry.server.config.ts
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN, // undefined in dev → SDK self-disables
  tracesSampleRate: 0.1,        // 10% in production (adjust per traffic)
  environment: process.env.NODE_ENV,
});
```

### Pattern 2: instrumentation.ts — Server + Edge Registration
**What:** Next.js instrumentation hook that conditionally imports server or edge Sentry config based on runtime, and exports `onRequestError` for automatic server component error capture.
**When to use:** Required for App Router server-side error capture.
**Example:**
```typescript
// instrumentation.ts
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Automatically captures errors in Server Components, API routes, middleware
export const onRequestError = Sentry.captureRequestError;
```

### Pattern 3: instrumentation-client.ts — Browser Init
**What:** Browser-side Sentry initialization. Loaded automatically by Next.js for client components.
**When to use:** Required for client-side error capture.
**Example:**
```typescript
// instrumentation-client.ts
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, // Must be NEXT_PUBLIC_ for browser
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  // Replay is optional — skip for initial setup
});
```

**IMPORTANT:** Client-side init uses `NEXT_PUBLIC_SENTRY_DSN` (public env var). This differs from server-side `SENTRY_DSN`. For production-only gating, do NOT set `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` — only set it in Vercel production environment.

### Pattern 4: withSentryConfig — Wrapping next.config.ts
**What:** Wraps the existing Next.js config to add source map upload and tunnel rewrite.
**When to use:** Required — goes in next.config.ts.
**Example:**
```typescript
// next.config.ts
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/
import { withSentryConfig } from '@sentry/nextjs';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  // ... existing config unchanged ...
};

const withMDX = createMDX({});

export default withSentryConfig(
  withMDX(nextConfig),
  {
    org: 'wildenflower-org-slug',     // Sentry org slug (from sentry.io URL)
    project: 'wildenflower',          // Sentry project slug
    authToken: process.env.SENTRY_AUTH_TOKEN,
    tunnelRoute: '/monitoring',       // Creates rewrite internally — no manual route.ts needed
    silent: !process.env.CI,          // Quiet locally, verbose in CI
    sourcemaps: {
      deleteSourcemapsAfterUpload: true, // Default true — removes from .next/static/
    },
    widenClientFileUpload: true,      // Upload more chunk files for better coverage
  }
);
```

**Note on MDX + Sentry wrapper order:** `withSentryConfig(withMDX(nextConfig), sentryOptions)` — Sentry wraps outermost so it can intercept the full Webpack config.

### Pattern 5: Error Boundaries — Manual captureException
**What:** Next.js error boundaries (error.tsx, global-error.tsx) intercept rendering errors before they bubble to Sentry's global handler. Must call `Sentry.captureException()` explicitly.
**When to use:** Both error.tsx (segment-level) and global-error.tsx (root-level) need this.
**Example:**
```typescript
// app/error.tsx (and app/global-error.tsx similarly)
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/capturing-errors/
'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error); // Replaces existing console.error placeholder
  }, [error]);
  // ... existing JSX unchanged ...
}
```

### Pattern 6: Temporary Sentry Test Page
**What:** Temporary route that triggers both server-side and client-side errors for dashboard verification.
**When to use:** Created for verification, deleted after confirming events appear in Sentry dashboard.
**Example:**
```typescript
// app/sentry-test/page.tsx (TEMPORARY — deleted after verification)
'use client';
import { useEffect } from 'react';

// Server error: make a separate route handler at app/sentry-test/route.ts
// Client error: unhandled promise rejection fires on page load
export default function SentryTestPage() {
  useEffect(() => {
    // Client-side unhandled promise rejection
    Promise.reject(new Error('Sentry client test — delete this page'));
  }, []);
  return <p>Sentry test page — delete after verifying dashboard events</p>;
}
```

```typescript
// app/sentry-test/route.ts (TEMPORARY — server error test)
export async function GET() {
  throw new Error('Sentry server test — delete this route');
}
```

### Anti-Patterns to Avoid
- **Using `SENTRY_DSN` (without NEXT_PUBLIC_) for client init:** Browser cannot read non-public env vars — events silently fail on client side. Use `NEXT_PUBLIC_SENTRY_DSN` for `instrumentation-client.ts`.
- **Setting `enabled: false` instead of DSN-gating:** `enabled: false` still instruments code; undefined DSN is the clean disable pattern.
- **Manual `/monitoring/route.ts` file:** The tunnel is created via Next.js rewrites by `withSentryConfig` — adding a manual route.ts causes conflicts.
- **Committing SENTRY_AUTH_TOKEN:** Auth token goes in GitHub Secrets and Vercel env vars only; never `.env` files or code.
- **source-map-support package:** If `source-map-support` is installed, it overwrites stack traces and breaks Sentry's source map processing. Verify it is not present.
- **Using `next dev` for Sentry testing:** Source maps are only uploaded during `next build` (production builds). Dev-mode errors sent to Sentry show minified traces.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sentry tunnel API route | Custom proxy API route | `tunnelRoute: "/monitoring"` in withSentryConfig | SDK creates rewrite internally via Next.js rewrites; manual route.ts causes routing conflicts |
| Source map upload | Shell scripts calling sentry-cli | `authToken` in withSentryConfig | SDK handles upload, debug ID injection, and deletion automatically during `next build` |
| Error deduplication | Custom fingerprinting logic | Sentry's built-in issue grouping | Sentry groups by stack trace + error message automatically; custom grouping only needed for specific overrides |
| Development vs. production split | `if (process.env.NODE_ENV === 'production')` guards everywhere | DSN-gating (undefined DSN = disabled) | Single configuration point; no scattered conditionals; SDK handles gracefully |

**Key insight:** The Sentry Next.js SDK is highly automated — tunnel routing, source map upload, debug ID injection, and Next.js instrumentation hook wiring are all handled by `withSentryConfig`. The primary manual work is writing four init files and wiring `captureException` into existing error boundaries.

---

## Common Pitfalls

### Pitfall 1: Client vs Server DSN Environment Variable Names
**What goes wrong:** `instrumentation-client.ts` uses `process.env.SENTRY_DSN` (without `NEXT_PUBLIC_` prefix), so the DSN is `undefined` in the browser and client-side events never fire — even in production.
**Why it happens:** Next.js only exposes `NEXT_PUBLIC_*` prefixed variables to browser bundles. Server-only vars are stripped from client code at build time.
**How to avoid:** Use `NEXT_PUBLIC_SENTRY_DSN` in `instrumentation-client.ts` and `SENTRY_DSN` in `sentry.server.config.ts` and `sentry.edge.config.ts`. Set both env var names in Vercel production environment.
**Warning signs:** Server errors appear in Sentry dashboard but client errors never do.

### Pitfall 2: withSentryConfig Wrapper Order with MDX
**What goes wrong:** `withSentryConfig(nextConfig, opts)` then `withMDX(...)` applied after — Sentry cannot intercept MDX's Webpack modifications, causing source map upload issues or build errors.
**Why it happens:** Each wrapper modifies the Webpack config. If Sentry is not the outermost wrapper, it may miss chunks added by inner wrappers.
**How to avoid:** `withSentryConfig(withMDX(nextConfig), sentryOptions)` — Sentry wraps outermost.
**Warning signs:** Build succeeds but source maps fail to upload; MDX content not visible in Sentry traces.

### Pitfall 3: Tunnel Route Blocked by Missing Exclusion
**What goes wrong:** Client-side errors are captured locally but never reach Sentry in production. Browser Network tab shows 404 or 500 on POST `/monitoring`.
**Why it happens:** No custom middleware in this project, but the tunnel is a Next.js rewrite — if the project ever adds middleware, `/monitoring` must be excluded from the middleware matcher.
**How to avoid:** If middleware is ever added to this project, add `monitoring` to the negative matcher pattern.
**Warning signs:** Events visible in browser Network tab as POST to `/monitoring` returning non-200.

### Pitfall 4: Source Maps Require SENTRY_AUTH_TOKEN at Build Time
**What goes wrong:** Stack traces in Sentry show minified code (`chunk.js:1:23942`) instead of readable TypeScript source.
**Why it happens:** `SENTRY_AUTH_TOKEN` was not present as an environment variable during `next build` — the source map upload step silently skips (unless `silent: false`).
**How to avoid:** Add `SENTRY_AUTH_TOKEN` to the CI workflow's build step env block. Add it to Vercel project environment variables (production only). Verify by checking Settings > Projects > Source Maps in Sentry dashboard after first build.
**Warning signs:** Stack traces show minified file paths in Sentry issue view.

### Pitfall 5: Error Boundaries Swallow Errors Without captureException
**What goes wrong:** A React rendering error shows the error.tsx fallback UI, but Sentry never receives an event. The failure is invisible in the dashboard.
**Why it happens:** Next.js error boundaries intercept the error before it propagates to Sentry's global unhandled error handler. The error is "handled" from Sentry's perspective.
**How to avoid:** Always call `Sentry.captureException(error)` in `useEffect` inside both `app/error.tsx` and `app/global-error.tsx`. This project already has placeholder comments in both files — just add the actual call.
**Warning signs:** Error boundary UI shows but Sentry dashboard receives no event.

### Pitfall 6: Test Page Left in Production
**What goes wrong:** The temporary `/sentry-test` page is forgotten and remains live. Any user who visits generates noise in the Sentry dashboard and potentially reveals server-side error stacks.
**Why it happens:** Test pages added during development are easy to forget.
**How to avoid:** Make deletion an explicit plan task with its own commit. The phase is not complete until the test page is removed and the deletion is committed.
**Warning signs:** Sentry dashboard shows repeated identical errors from "Sentry client test" or "Sentry server test".

---

## Code Examples

Verified patterns from official sources:

### sentry.server.config.ts (complete)
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,            // 10% of requests traced in production
  environment: process.env.NODE_ENV ?? 'production',
  // If SENTRY_DSN is undefined (development), SDK self-disables silently
});
```

### instrumentation.ts (complete)
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Captures errors thrown in Server Components, API routes, middleware
export const onRequestError = Sentry.captureRequestError;
```

### instrumentation-client.ts (complete)
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,  // NEXT_PUBLIC_ required for browser
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV ?? 'production',
  // Session replay omitted — not needed for v1.2
});
```

### sentry.edge.config.ts (complete)
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV ?? 'production',
});
```

### withSentryConfig in next.config.ts (complete, with MDX)
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/
import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';

// ... existing CSP and security headers unchanged ...

const nextConfig: NextConfig = {
  // ... all existing config unchanged ...
};

const withMDX = createMDX({});

export default withSentryConfig(
  withMDX(nextConfig),
  {
    org: 'your-sentry-org-slug',       // From sentry.io URL: sentry.io/organizations/YOUR-ORG/
    project: 'wildenflower',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    tunnelRoute: '/monitoring',         // SDK creates rewrite — no manual route.ts
    silent: !process.env.CI,
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    widenClientFileUpload: true,        // Uploads static/chunks/* for fuller coverage
  }
);
```

### CI workflow — add SENTRY_AUTH_TOKEN to build step
```yaml
# .github/workflows/ci.yml — modify existing Build step in quality job
- name: Build
  run: npm run build
  env:
    SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_ACCESS_TOKEN }}
    SHOPIFY_SHOP_ID: ${{ secrets.SHOPIFY_SHOP_ID }}
    NEXT_PUBLIC_BASE_URL: https://wildenflower.com
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    # Source: phase 22 — enables source map upload during CI build
```

### app/error.tsx — add captureException (modify existing file)
```typescript
// app/error.tsx — replace existing console.error placeholder
'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error); // was: console.error('Page Error:', error)
  }, [error]);
  // JSX unchanged
}
```

### app/global-error.tsx — add captureException (modify existing file)
```typescript
// app/global-error.tsx — replace commented Sentry.captureException placeholder
useEffect(() => {
  Sentry.captureException(error); // was: // Sentry.captureException(error);
}, [error]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| sentry.client.config.ts (Pages Router) | instrumentation-client.ts | @sentry/nextjs v8 (2024) | New file name required for App Router / Turbopack compat |
| sentry.server.config.ts imported directly | instrumentation.ts → dynamic import | @sentry/nextjs v8 (2024) | Server config loaded via Next.js instrumentation hook, not directly |
| withSentryConfig + manual API tunnel route | tunnelRoute: "/monitoring" creates rewrite automatically | @sentry/nextjs v7+ | No manual route.ts needed |
| Source maps via .sentryclirc | authToken in withSentryConfig + .env.sentry-build-plugin | @sentry/nextjs v7+ | Token passed programmatically; .sentryclirc still works but programmatic is preferred |
| Sentry v9 + OpenTelemetry v1 | Sentry v10 + OpenTelemetry v2 | @sentry/nextjs v10 (2025) | Breaking change in OTel deps; v10 is current recommendation |

**Deprecated/outdated:**
- `sentry.client.config.ts`: Renamed to `instrumentation-client.ts` in SDK v8 for App Router. The old name still works in some contexts but the wizard generates the new name.
- `experimental.instrumentationHook: true` in next.config.ts: Was required for Next.js <15. Removed and stabilized in Next.js 15. Not needed for Next.js 16.
- `enabled: false` pattern: Officially not recommended — docs say to use DSN-gating or conditional `Sentry.init()` instead.

---

## Open Questions

1. **Sentry org slug format**
   - What we know: The `org` field in withSentryConfig must match the slug in the Sentry URL (sentry.io/organizations/YOUR-SLUG/)
   - What's unclear: The exact slug is not known until the Sentry account is created — it's a manual prerequisite
   - Recommendation: Plan task 1 is Sentry account creation (manual human task); org slug and DSN values are captured then and used in subsequent plan tasks

2. **NEXT_PUBLIC_SENTRY_DSN vs SENTRY_DSN**
   - What we know: Server init uses `SENTRY_DSN`, client init requires `NEXT_PUBLIC_SENTRY_DSN`
   - What's unclear: Context.md only mentions `SENTRY_DSN` — the `NEXT_PUBLIC_` variant needs to be set in Vercel as well
   - Recommendation: Add both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` to Vercel production environment in the account-setup task. Both should have the same DSN value.

3. **Vercel deployment SENTRY_AUTH_TOKEN**
   - What we know: Auth token needed during `next build` for source map upload; CI build step needs it via GitHub Secret
   - What's unclear: Context.md mentions adding to Vercel env vars "for manual deploys" — the three-step vercel CLI deploy in deploy-prod already runs `vercel build --prod` which pulls Vercel env vars via `vercel pull`. If SENTRY_AUTH_TOKEN is in Vercel prod env, it's available during that build automatically.
   - Recommendation: Add SENTRY_AUTH_TOKEN to Vercel prod env variables AND as a GitHub Secret. The CI job's `vercel build` step pulls Vercel env, so SENTRY_AUTH_TOKEN would be available there too. Adding it explicitly to the `vercel build` step env block is belt-and-suspenders but ensures it's always present regardless of `vercel pull` behavior.

---

## Sources

### Primary (HIGH confidence)
- https://docs.sentry.io/platforms/javascript/guides/nextjs/ — official Next.js guide, current setup overview
- https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/ — exact file contents and configuration
- https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/ — withSentryConfig options including sourcemaps.deleteSourcemapsAfterUpload
- https://docs.sentry.io/platforms/javascript/guides/nextjs/capturing-errors/ — automatic vs. manual capture, error boundary requirements
- https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/troubleshooting_js/ — source map pitfalls

### Secondary (MEDIUM confidence)
- https://github.com/getsentry/sentry-javascript/discussions/15013 — disable in development: maintainer confirmed `enabled: process.env.NODE_ENV !== 'development'` pattern
- https://github.com/getsentry/sentry-javascript/discussions/8546 — production-only gate: maintainer confirmed DSN-gating as recommended pattern
- https://sentry.zendesk.com/hc/en-us/articles/21686106000667 — tunnel route is automatic (rewrite), no manual route.ts
- https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v9-to-v10/ — v10 breaking changes: OpenTelemetry v2, removed APIs

### Tertiary (LOW confidence)
- https://github.com/getsentry/sentry-javascript/discussions/9455 — tunnel route auto-creation confirmation from community
- WebSearch result: @sentry/nextjs latest version 10.40.0 (as of March 2026) — not verified via official source, but consistent with changelog references

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official docs confirmed, version verified via search cross-reference
- Architecture: HIGH — all four file patterns from official manual setup guide
- Pitfalls: HIGH — sourced from official troubleshooting docs and SDK maintainer discussions
- Tunnel behavior: MEDIUM — confirmed automatic via maintainer comment, cross-verified with zendesk article

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (Sentry SDK updates frequently; verify latest version before install)
