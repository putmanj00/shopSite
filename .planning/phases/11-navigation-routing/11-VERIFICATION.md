---
phase: 11-navigation-routing
verified: 2026-02-25T00:00:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "NAV-01 — 301 redirect fires in browser"
    expected: "Visiting http://localhost:3000/collections lands on /collections/all (address bar confirms)"
    why_human: "proxy.ts redirect behavior requires a live dev server; curl may not follow redirects the same way Next.js handles them"
  - test: "NAV-01 — Query string survives redirect"
    expected: "Visiting /collections?sort=price-asc shows /collections/all?sort=price-asc in address bar"
    why_human: "Query string preservation cannot be confirmed without a live server request cycle"
  - test: "NAV-02 — Wander the Shop CTA navigates to /collections/all"
    expected: "Clicking the hero CTA on the homepage routes to /collections/all, not a redirect chain"
    why_human: "Client-side navigation behavior requires browser or test runner"
---

# Phase 11: Navigation Routing Verification Report

**Phase Goal:** Fix the /collections bare route — add a 301 redirect to /collections/all, update all internal links to point directly to /collections/all, and remove stale dead code.
**Verified:** 2026-02-25
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visiting /collections results in a 301 redirect to /collections/all | VERIFIED | `proxy.ts` line 13-15: exact pathname check, `NextResponse.redirect(destination, { status: 301 })` |
| 2 | Visiting /collections/ (trailing slash) also 301 redirects to /collections/all | VERIFIED | `proxy.ts` line 13: `pathname === '/collections/'` branch, same redirect |
| 3 | Query strings survive the redirect | VERIFIED | `proxy.ts` line 9: destructures `search` from `request.nextUrl`; line 14: `\`/collections/all${search}\`` appended to destination URL |
| 4 | /collections/all and /collections/[handle] are NOT intercepted | VERIFIED | `proxy.ts` config line 23: `matcher: ['/collections', '/collections/']` — exact paths only, no wildcard |
| 5 | "Wander the Shop" hero CTA navigates to /collections/all | VERIFIED | `app/page.tsx` line 68: `{ label: 'Wander the Shop', href: '/collections/all', variant: 'primary' }` |
| 6 | Grep for href="/collections" across all source files returns zero results | VERIFIED | Grep across all *.tsx, *.ts, *.js, *.jsx files (excluding node_modules, .next): zero matches |
| 7 | The /collections bare route has no page.tsx file (dead code removed) | VERIFIED | `app/collections/page.tsx` does not exist; `app/collections/[handle]/` directory is intact |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `proxy.ts` | Next.js 16 proxy redirect — intercepts /collections and /collections/ exactly, exports `proxy` and `config` | VERIFIED | File exists at project root; 25 lines; exports named function `proxy` and `config` with exact matcher |
| `app/page.tsx` | Homepage with corrected hero CTA href: `/collections/all` | VERIFIED | Line 68 confirmed: `href: '/collections/all'` |
| `app/sitemap.ts` | Sitemap without /collections redirect entry | VERIFIED | Static routes array contains `/collections/all` but no bare `/collections` entry |
| `components/hero.tsx` | Both Shop Now and Browse Collections buttons: `/collections/all` | VERIFIED | Lines 20, 26: both `href="/collections/all"` |
| `components/homepage/brand-story.tsx` | Explore the Collection link updated | VERIFIED | Line 62: `href="/collections/all"` |
| `components/collection-breadcrumbs.tsx` | Collections breadcrumb middle step updated | VERIFIED | Line 63: `href="/collections/all"` |
| `components/account/wishlist-preview.tsx` | Browse Products empty-state button updated | VERIFIED | Line 46: `href="/collections/all"` |
| `components/account/order-history.tsx` | Start Shopping empty-state button updated | VERIFIED | Line 269: `href="/collections/all"` |
| `app/local/page.tsx` | Shop Online button updated | VERIFIED | Line 95: `href="/collections/all"` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `proxy.ts` | `/collections/all` | `NextResponse.redirect` with `{ status: 301 }` | WIRED | Line 15: `return NextResponse.redirect(destination, { status: 301 })` confirmed |
| `proxy.ts` | query string preservation | `request.nextUrl.search` destructured into destination URL | WIRED | Line 9 destructures `search`; line 14 appends it to `/collections/all${search}` |
| `app/page.tsx` | `/collections/all` | `EnhancedHero` ctas array `href` prop | WIRED | Line 68: `href: '/collections/all'` in ctas array passed to hero |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| NAV-01 | 11-01-PLAN.md | Shopper visiting `/collections` is automatically redirected to `/collections/all` (301 permanent redirect) | SATISFIED | `proxy.ts` implements exact-match 301 redirect with query string preservation; committed in `8315160` |
| NAV-02 | 11-02-PLAN.md | "Wander the Shop" hero CTA links to `/collections/all`, not `/collections` | SATISFIED | `app/page.tsx` line 68 confirmed; committed in `8315160` |
| NAV-03 | 11-02-PLAN.md | No stale `href="/collections"` links remain anywhere in the codebase | SATISFIED | Grep across all *.tsx, *.ts, *.js, *.jsx returns zero matches; all 8 instances updated across 7 files |

**Orphaned requirements check:** REQUIREMENTS.md maps only NAV-01, NAV-02, NAV-03 to Phase 11. No orphaned requirements.

**NAV-04 and NAV-05** are mapped to Phase 12 and are correctly out of scope for Phase 11.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | None found |

No TODO, FIXME, placeholder, or stub patterns detected in any files modified by this phase.

---

### Human Verification Required

The automated checks fully confirm the code is correct. The following items were approved by the developer during Plan 03 execution (recorded in `11-03-SUMMARY.md` with response "approved" on 2026-02-25). They are noted here for completeness:

#### 1. NAV-01 — 301 redirect fires in browser

**Test:** Start dev server (`npm run dev`), visit `http://localhost:3000/collections`
**Expected:** Browser address bar shows `http://localhost:3000/collections/all` after redirect
**Why human:** Next.js proxy.ts redirect behavior requires a live request cycle to confirm the 301 status code fires correctly

#### 2. NAV-01 — Query string survival

**Test:** Visit `http://localhost:3000/collections?sort=price-asc`
**Expected:** Address bar shows `http://localhost:3000/collections/all?sort=price-asc`
**Why human:** Query string preservation requires observing actual request/response headers

#### 3. NAV-02 — Wander the Shop CTA click behavior

**Test:** Visit homepage, click "Wander the Shop" button in hero
**Expected:** Navigates directly to `/collections/all` without passing through a redirect
**Why human:** Client-side navigation routing requires browser interaction

**Developer approval status:** All three criteria confirmed "approved" by developer on 2026-02-25 (recorded in `11-03-SUMMARY.md`).

---

### Commit Verification

| Commit | Description | Verified |
|--------|-------------|---------|
| `8315160` | feat(11-01): create proxy.ts with 301 redirect for /collections (also included all 8 href fixes) | EXISTS |
| `4d84f96` | feat(11-02): remove dead /collections route and clean sitemap | EXISTS |
| `412cf49` | docs(11-03): complete navigation routing verification plan | EXISTS |

---

### Summary

Phase 11 achieved its goal completely. All three requirements (NAV-01, NAV-02, NAV-03) are satisfied:

1. **NAV-01 (301 redirect):** `proxy.ts` is substantive and correctly implemented. It uses the Next.js 16 `proxy` function convention, matches only the exact paths `/collections` and `/collections/` (preventing interception of sub-routes), redirects with `{ status: 301 }`, and preserves query strings via `request.nextUrl.search`.

2. **NAV-02 (Wander the Shop CTA):** `app/page.tsx` line 68 confirms the named CTA links to `/collections/all`.

3. **NAV-03 (zero stale links):** All 8 bare `href="/collections"` instances across 7 source files were updated to `href="/collections/all"`. A codebase-wide grep returns zero matches. `app/collections/page.tsx` (dead code) was deleted while `app/collections/[handle]/` was preserved. The sitemap no longer lists bare `/collections` as a canonical URL.

No anti-patterns, no stubs, no orphaned requirements. Human verification was completed and approved during Phase 11 Plan 03 execution.

---

_Verified: 2026-02-25_
_Verifier: Claude (gsd-verifier)_
