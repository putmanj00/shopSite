# Codebase Concerns

**Analysis Date:** 2026-02-23

## Tech Debt

**Admin Authentication Implementation:**
- Issue: Admin authentication uses plain text password comparison and a simple cookie-based session (`authenticated_admin_user` string comparison in `lib/admin-auth.ts`). No cryptographic hashing, no token validation, no rate limiting.
- Files: `lib/admin-auth.ts`, `app/api/admin/login/route.ts`
- Impact: Admin dashboard is vulnerable to brute force attacks and session hijacking. Any attacker can forge the admin cookie.
- Fix approach: Implement proper JWT tokens with signing, add bcrypt password hashing, implement rate limiting on login attempts, add CSRF protection, use secure session middleware.

**Mock Data in Admin Dashboard:**
- Issue: Admin dashboard uses fake mock data generated with `Math.random()` rather than fetching real Shopify data. Functions like `getSalesStats()`, `getInventoryReport()`, `getOrders()`, `getCustomers()` all generate random data.
- Files: `lib/admin-data.ts` (lines 46-320)
- Impact: Admin cannot see real business metrics. Completely non-functional for business intelligence.
- Fix approach: Replace mock data generators with actual Shopify Admin API calls to fetch products, orders, customers, and sales data.

**Test Files Left in Root:**
- Issue: Two standalone test files (`test-auth-flow.js` and `test-callback.js`) remain in project root instead of being properly organized or removed.
- Files: `test-auth-flow.js`, `test-callback.js`
- Impact: Code clutter, potential confusion about testing setup, missing unit/integration test structure.
- Fix approach: Move to proper test directory structure (e.g., `__tests__/`), convert to proper test framework (Jest/Vitest), delete if deprecated.

**No Automated Testing Framework:**
- Issue: Project has no unit tests, integration tests, or E2E tests configured. No Jest, Vitest, or similar test runner configured in package.json (despite having test scripts for UI, routes, and accessibility).
- Files: `package.json`, entire codebase
- Impact: No safety net for refactoring, regressions not caught, critical paths untested.
- Fix approach: Set up Jest or Vitest, write unit tests for utility functions (auth helpers, Shopify queries), add integration tests for API routes, implement pre-commit hooks.

## Known Bugs

**Syntax Error in test-callback.js:**
- Symptoms: File contains invalid syntax that would prevent execution (`'http://localhost:3000/api/auth/customer/authorize?returnTo=/account'\;` - backslash before semicolon)
- Files: `test-callback.js` (line 3)
- Trigger: Any attempt to run this test file
- Workaround: Use `test-auth-flow.js` instead if testing auth flow

**Missing Base URL Handling in Customer Account API:**
- Symptoms: `NEXT_PUBLIC_BASE_URL` is used but not validated. If missing, falls back to unpredictable defaults.
- Files: `lib/customer-account.ts` (line 25, line 29, line 379)
- Trigger: Deployment without proper env var set
- Workaround: Always ensure `NEXT_PUBLIC_BASE_URL` is set in production

## Security Considerations

**OAuth State and PKCE Storage:**
- Risk: OAuth state and PKCE code verifier are stored in httpOnly cookies with only 10-minute expiration. No option for same-site validation beyond `lax`.
- Files: `lib/customer-account.ts` (lines 221-234, 237-252)
- Current mitigation: httpOnly, secure in production, sameSite lax
- Recommendations: Add CSRF token validation, implement state storage with server-side session/cache for longer-term validation, consider upgrading to stricter sameSite policy if possible

**Admin Password in Environment Variable:**
- Risk: Admin password stored as plain environment variable and compared as plaintext string. Easy to leak via logs or accidental commits.
- Files: `lib/admin-auth.ts` (line 16)
- Current mitigation: Loaded from environment variable only, not hardcoded
- Recommendations: Use bcrypt for password hashing, never store plaintext passwords, implement password policy, consider switching to OAuth2 for admin auth

**Redirect URI Vulnerability in OAuth:**
- Risk: `returnTo` parameter from query string is used directly in cookies without validation. Could be exploited for open redirect attacks.
- Files: `app/api/auth/customer/authorize/route.ts` (line 7), `app/api/auth/customer/callback/route.ts` (line 47)
- Current mitigation: Parameter is only used server-side in cookies, not directly in redirect URL
- Recommendations: Validate `returnTo` against a whitelist of allowed paths, ensure it starts with `/`, add security headers for redirect handling

**Token Handling:**
- Risk: Access tokens, refresh tokens, and ID tokens all stored in httpOnly cookies. If SameSite lax is downgraded, all tokens exposed to CSRF.
- Files: `lib/customer-account.ts` (lines 255-298)
- Current mitigation: httpOnly, secure in production, sameSite lax
- Recommendations: Consider token rotation strategy, implement token refresh endpoint, add token revocation mechanism

**Environment Variable Exposure:**
- Risk: `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` is optional for public clients but if present in code, could be accidentally logged.
- Files: `lib/customer-account.ts` (line 41)
- Current mitigation: Comments indicate it's optional
- Recommendations: Add runtime validation that client secret is never logged, consider using separate env var patterns for public vs confidential clients

## Performance Bottlenecks

**Synchronous OpenID Configuration Discovery on Every Auth:**
- Problem: `discoverEndpoints()` calls Shopify's OpenID configuration endpoint on every token exchange and authorization URL build. Makes HTTP request each time.
- Files: `lib/customer-account.ts` (lines 66-86, called from lines 91, 122, 171, 210)
- Cause: No caching of endpoint discovery results. Every OAuth flow makes a network request.
- Improvement path: Cache OpenID configuration in Redis or memory with 24-hour TTL, add cache busting mechanism, implement stale-while-revalidate pattern

**Collection Product Filtering Client-Side:**
- Problem: All filtering, sorting, and pagination happens client-side in React after loading full collection. If collection has thousands of products, performance degrades.
- Files: `components/collection-content.tsx` (lines 78-200)
- Cause: `useMemo` filters entire product array on every keystroke/filter change
- Improvement path: Implement server-side filtering with query parameters, paginate at API level, consider search service like Algolia for larger catalogs

**Repeated Token Expiration Checks:**
- Problem: `getValidAccessToken()` checks token expiration on every API call and calculates time differences repeatedly.
- Files: `lib/customer-account.ts` (lines 330-361)
- Cause: No memoization or lazy evaluation of token state
- Improvement path: Implement token state hook, cache expiration checks, use background refresh mechanism instead of on-demand checks

**Large Component Files:**
- Problem: Several components exceed 400+ lines, making them slow to parse and render.
- Files: `components/collection-content.tsx` (551 lines), `components/account/address-book.tsx` (473 lines), `components/mobile-filter-drawer.tsx` (300 lines)
- Cause: Multiple concerns bundled (state management, rendering, filtering, event handling)
- Improvement path: Extract filter logic into custom hooks, create smaller sub-components, separate concerns into hooks

## Fragile Areas

**OAuth Flow State Management:**
- Files: `lib/customer-account.ts`, `app/api/auth/customer/authorize/route.ts`, `app/api/auth/customer/callback/route.ts`
- Why fragile: Depends on precise cookie lifecycle (set, retrieve, clear). Race conditions possible if user quickly navigates between pages. Multiple `await cookies()` calls make timing assumptions.
- Safe modification: Never modify cookie logic without adding integration tests for complete OAuth flow. Test cross-tab scenarios. Consider moving state to database.
- Test coverage: No tests for OAuth flow, PKCE validation, state parameter mismatch, token refresh edge cases

**Shopify API Integration:**
- Files: `lib/shopify.ts`, `lib/shopify-admin.ts`, `lib/shopify-helpers.ts`, `lib/shopify-queries.ts`
- Why fragile: GraphQL queries are hardcoded strings with no type checking at query time. API version pinned to `2025-01` in customer account API. Changes to Shopify schema would break silently.
- Safe modification: Use GraphQL codegen to generate types from schema, implement query validation, add tests for API response parsing, handle API version deprecation.
- Test coverage: No tests for API responses, error handling, or schema validation

**Admin Authentication:**
- Files: `lib/admin-auth.ts`
- Why fragile: Entire auth logic is a single cookie comparison. No audit trail, no rate limiting, no session invalidation mechanism. Default password is hardcoded.
- Safe modification: Cannot safely modify without breaking existing deployments. Need to plan migration path first.
- Test coverage: No tests for login flow, cookie expiration, logout, parallel requests

## Scaling Limits

**Mock Data Generation in Admin:**
- Current capacity: Generates 50-item batches with random data
- Limit: Will not scale beyond mock data. Shopify API will need to replace this entirely.
- Scaling path: Replace `getSalesStats()`, `getInventoryReport()`, `getOrders()`, `getCustomers()` with proper Shopify Admin API pagination and caching

**Product Collection Filtering:**
- Current capacity: ~500 products before client-side filtering becomes noticeably slow
- Limit: Beyond 1000 products, collection page becomes sluggish
- Scaling path: Implement server-side filtering, add database caching layer, consider Algolia or Elasticsearch for search

**Token Refresh Rate:**
- Current capacity: Handles multiple concurrent requests with token expiration checks
- Limit: If many users make simultaneous requests near token expiration, could trigger many refresh requests to Shopify
- Scaling path: Implement distributed token refresh queue, add refresh request deduplication, use Redis for token cache

## Dependencies at Risk

**Shopify Storefront API Client:**
- Risk: Using v1.0.9 of `@shopify/storefront-api-client`. Shopify frequently updates API versions and deprecates endpoints.
- Impact: Queries may break with Shopify schema changes, API endpoint changes not backwards compatible
- Migration plan: Implement GraphQL codegen for type safety, monitor Shopify API changelog, plan version upgrades quarterly

**Next.js 16.1.1 with React 19:**
- Risk: Using very recent versions that may have undiscovered bugs or incompatibilities
- Impact: Potential breaking changes in minor updates, ecosystem packages may not be compatible
- Migration plan: Pin to stable versions, test thoroughly before upgrading, consider using LTS patterns

**Zustand 5.0.10:**
- Risk: State management library version may have breaking changes in future releases
- Impact: State updates could behave differently with lib changes
- Migration plan: Document all zustand patterns used, implement tests for state updates, consider migration path to React Context if needed

## Missing Critical Features

**No Error Tracking/Monitoring:**
- Problem: `SENTRY_DSN` configured in env example but not integrated anywhere in code. No error tracking, no performance monitoring.
- Blocks: Cannot see production errors or performance issues
- Recommendation: Integrate Sentry client into API routes and React components, add performance monitoring for critical paths

**No Request Logging or Audit Trail:**
- Problem: API requests have no logging for compliance or debugging
- Blocks: Cannot audit who accessed what, difficult to debug production issues
- Recommendation: Implement request/response logging middleware, audit trail for admin actions, structured logging with context

**No Rate Limiting:**
- Problem: API routes have no rate limiting
- Blocks: Vulnerable to DOS attacks, uncontrolled API usage
- Recommendation: Add rate limiting middleware, implement per-IP limits for login endpoint, add queue limits for email sending

**No Caching Strategy:**
- Problem: No caching for Shopify queries, OpenID configuration, or collection data
- Blocks: Unnecessary API calls, slower response times, higher Shopify costs
- Recommendation: Implement Redis caching layer, add cache invalidation strategy, use HTTP caching headers

## Test Coverage Gaps

**Authentication Routes (OAuth):**
- What's not tested: Authorization flow, callback validation, state parameter verification, PKCE validation, token exchange, token refresh, logout flow
- Files: `app/api/auth/customer/authorize/route.ts`, `app/api/auth/customer/callback/route.ts`, `app/api/auth/customer/logout/route.ts`, `app/api/auth/customer/update/route.ts`
- Risk: Breaking changes go unnoticed, security vulnerabilities in auth flow undetected, state attacks possible
- Priority: High

**Admin Authentication:**
- What's not tested: Login endpoint, password validation, cookie creation, session persistence, admin-only route protection
- Files: `app/api/admin/login/route.ts`, `lib/admin-auth.ts`, `app/admin/(protected)/layout.tsx`
- Risk: Admin dashboard could be accessible without authentication, privilege escalation possible
- Priority: High

**Email API Routes:**
- What's not tested: Email sending, template rendering, error handling, invalid email validation, rate limiting
- Files: `app/api/email/*/route.ts` (10+ email route files)
- Risk: Emails could fail silently, invalid emails sent, service overloaded
- Priority: Medium

**Product & Collection Queries:**
- What's not tested: GraphQL query parsing, error handling, null/missing data handling, pagination
- Files: `lib/shopify-queries.ts`, `lib/shopify-helpers.ts`, `lib/shopify.ts`
- Risk: Malformed Shopify responses cause crashes, incorrect product data displayed
- Priority: Medium

**Collection Content Component:**
- What's not tested: Filtering logic, sorting, search functionality, pagination state management, ARIA announcements
- Files: `components/collection-content.tsx`
- Risk: Filters could behave unexpectedly, accessibility features not working, UI state inconsistencies
- Priority: Medium

**Client Account Operations:**
- What's not tested: Address creation/update/delete, customer info updates, error scenarios
- Files: `app/api/customer/addresses/route.ts`, `app/api/auth/customer/me/route.ts`, `components/account/address-book.tsx`
- Risk: Data loss, corrupted customer records, incomplete updates not caught
- Priority: High

---

*Concerns audit: 2026-02-23*
