# Phase 11: Navigation Routing - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix every internal reference to `/collections` (bare, no handle) so shoppers are never dropped on a broken or duplicate page. This means: a 301 redirect that preserves query strings, a full codebase audit that removes every hardcoded or dynamic `/collections` link, and a sitemap check. The `/collections/all` route and its UI are not touched — only routing and link correctness.

</domain>

<decisions>
## Implementation Decisions

### Redirect implementation
- Use `middleware.ts` (not `next.config.js`) so query strings are preserved in the redirect
- Both `/collections` and `/collections/` (trailing slash) must redirect to `/collections/all`
- Query strings must carry through: `/collections?sort=price-asc` → `/collections/all?sort=price-asc`
- This preserves UTM parameters and user-selected filters — important for marketing and analytics
- HTTP status: 301 Permanent (as specified in success criteria)
- If a `/collections` page/route file exists, delete it — the middleware redirect makes it dead code

### Link audit scope
- Audit: `.tsx`, `.ts`, `.js` source files + config files (`.json`, `.yaml`)
- Skip `node_modules` and vendored code — document any findings there but do not modify
- Catch both literal `href="/collections"` and dynamic construction (template literals, `router.push('/collections')`, `Link href={"/collections"}`)
- Also audit `sitemap.xml` or sitemap generation code — update any `/collections` entries to `/collections/all`
- Plan must include a final grep verification task that runs the exact success-criteria check: zero results for `href="/collections"` (exact, no handle suffix)

### Scope boundary
- Strictly `/collections` only — no broader audit of other bare routes (those are separate phases)
- Only named CTA is "Wander the Shop" button on the hero — grep will surface any others
- No dev server curl smoke test required — code review + grep verification is sufficient

### Claude's Discretion
- How to structure the middleware implementation (path matching approach)
- Whether to add a comment in middleware documenting the reason for the redirect

</decisions>

<specifics>
## Specific Ideas

- Query string preservation is non-negotiable: UTMs and filter params must survive the redirect
- The middleware approach is preferred even though it's slightly more complex than next.config.js, specifically because next.config.js redirects can't forward query strings to a different destination

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-navigation-routing*
*Context gathered: 2026-02-25*
