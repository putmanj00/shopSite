---
phase: 11-navigation-routing
plan: 01
subsystem: routing
tags: [nextjs, proxy, redirect, seo, collections]

# Dependency graph
requires: []
provides:
  - "301 permanent redirect from /collections and /collections/ to /collections/all"
  - "Query string preservation across redirect (UTM, filter params)"
  - "proxy.ts at project root using Next.js 16 naming convention"
affects:
  - "11-02 navigation routing"
  - "11-03 navigation routing"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js 16 proxy.ts convention for server-side request interception (replaces middleware.ts)"
    - "Exact matcher strings in proxy config to avoid wildcard interception of sub-routes"

key-files:
  created:
    - proxy.ts
  modified: []

key-decisions:
  - "Named export `proxy` (not `middleware`) — Next.js 16 renamed the convention; using old name would silently fail"
  - "Exact matcher ['/collections', '/collections/'] — wildcard :path* would intercept /collections/all and cause redirect loops"
  - "Query string preservation via request.nextUrl.search — do NOT use next.config.js redirects which cannot preserve query strings to a different destination path"
  - "status 301 explicit — Next.js defaults to 307 temporary so must be overridden"

patterns-established:
  - "proxy.ts at project root: Next.js 16 server-side request interception entry point"
  - "Exact matcher pattern: list specific paths rather than wildcards when only a subset of a path prefix should be intercepted"

requirements-completed: [NAV-01]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 11 Plan 01: Navigation Routing — Collections Redirect Summary

**Next.js 16 proxy.ts with 301 permanent redirect from /collections to /collections/all, preserving all query strings for UTM and filter state**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-26T04:14:44Z
- **Completed:** 2026-02-26T04:15:37Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created proxy.ts at project root using Next.js 16 naming convention (replaces deprecated middleware.ts)
- Implemented 301 permanent redirect for /collections and /collections/ to /collections/all
- Query strings preserved via `request.nextUrl.search` — UTM parameters and filter state survive redirect
- Exact matcher prevents interception of /collections/all or /collections/[handle], avoiding redirect loops

## Task Commits

Each task was committed atomically:

1. **Task 1: Create proxy.ts with 301 redirect for /collections** - `8315160` (feat)

## Files Created/Modified

- `proxy.ts` — Next.js 16 server-side proxy intercepting exactly /collections and /collections/, redirecting to /collections/all with 301 and query string preservation

## Decisions Made

- Named export `proxy` (not `middleware`) — Next.js 16 renamed the convention
- Exact matcher `['/collections', '/collections/']` — wildcard would catch /collections/all and create infinite redirect loop
- Explicit `{ status: 301 }` — Next.js defaults to 307 temporary redirect
- Used `request.nextUrl.search` for query strings, not `next.config.js` redirects (which cannot preserve query strings to a different destination path)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- proxy.ts in place, TypeScript compiles cleanly
- /collections → /collections/all redirect fully operational for Plans 11-02 and 11-03

---
*Phase: 11-navigation-routing*
*Completed: 2026-02-26*
