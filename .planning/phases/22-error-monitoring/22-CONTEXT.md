# Phase 22: Error Monitoring - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Install and configure Sentry for Next.js 16 App Router. Production-only error capture — server errors, client errors, and unhandled promise rejections reach the Sentry dashboard with readable TypeScript stack traces. No Sentry events fire in development. Sentry account/project creation is a manual prerequisite task; the code wiring is what this phase implements.

</domain>

<decisions>
## Implementation Decisions

### Sentry account setup
- Creating a fresh Sentry org (new account, no existing org)
- Free tier (Developer) — 5,000 errors/month, sufficient for a boutique storefront
- Project name: `wildenflower`
- SENTRY_DSN stored only in Vercel production environment variables — not in local .env
- Local development will never send events (NODE_ENV === 'production' gate)

### Source maps
- Upload source maps to Sentry during `next build` via the @sentry/nextjs Webpack plugin
- Source maps deleted from public build output after upload (hidden from end users)
- SENTRY_AUTH_TOKEN needed in both GitHub Actions secrets (for CI builds) and Vercel env vars (for manual deploys)
- The existing Phase 20 CI pipeline deploy-prod job must expose SENTRY_AUTH_TOKEN during the build step

### Tunnel vs. direct ingest
- Use the Sentry tunnel: `/monitoring` API route proxies events to Sentry
- Tunnel prevents ad blockers from dropping error events
- CSP: tunnel only — no `*.sentry.io` added to connect-src (tunnel is same-origin, so no CSP change needed for Sentry)
- The `/monitoring` route is open (unauthenticated) — Sentry SDK validates envelope payloads internally

### Test verification
- Temporary `/sentry-test` page: server-side route handler throws + client-side unhandled promise rejection on page load
- Covers both capture paths from the phase success criteria
- Removal is an explicit plan task: verify events appear in Sentry dashboard, then delete the route and commit

### Claude's Discretion
- Exact Sentry SDK initialization options (tracesSampleRate, replaysSessionSampleRate, etc.)
- Error filtering / ignore rules (e.g., ignoring known Next.js hydration noise)
- Which existing `console.error` calls to supplement with `Sentry.captureException()`

</decisions>

<specifics>
## Specific Ideas

- `app/error.tsx` already has a `// Log exception to analytics/Sentry` comment — wire `Sentry.captureException(error)` into that existing useEffect
- `SENTRY_DSN` is already stubbed in `.env.example` — just needs a real value added to Vercel prod env
- CSP in `next.config.ts` is currently in Report-Only mode — no Sentry-related CSP changes needed since tunnel is same-origin

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/error.tsx`: Client error boundary with placeholder comment for Sentry — prime integration point for client error capture
- `.env.example`: Already has `SENTRY_DSN=your_sentry_dsn` stub — just needs real value in Vercel

### Established Patterns
- Environment gating: `process.env.NODE_ENV === 'production'` pattern used elsewhere (matches the no-dev-events requirement)
- Third-party providers initialized in `app/layout.tsx` (Vercel Analytics, Speed Insights) — Sentry provider/init follows same pattern
- GitHub Actions CI: `.github/workflows/` already exists from Phase 20 — SENTRY_AUTH_TOKEN secret to be added alongside existing secrets

### Integration Points
- `app/layout.tsx`: Where Sentry client-side initialization is registered (alongside existing Vercel Analytics)
- `next.config.ts`: Wrapped with `withSentryConfig()` for source map upload and server instrumentation
- `app/monitoring/route.ts` (new): Tunnel API route
- `app/sentry-test/page.tsx` (new, temporary): Test verification page — deleted after confirming events arrive

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 22-error-monitoring*
*Context gathered: 2026-02-28*
