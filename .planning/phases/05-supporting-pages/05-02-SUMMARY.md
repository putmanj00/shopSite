---
phase: 05-supporting-pages
plan: 02
subsystem: ui
tags: [react, nextjs, tailwind, accordion, faq, botanical]

# Dependency graph
requires:
  - phase: 05-01
    provides: "BotanicalHeader component with faq variant"
  - phase: 01-design-foundation
    provides: "Tailwind color tokens (parchment, ink-brown, earth, forest, terracotta)"
provides:
  - "FAQ page fully replaced — BotanicalHeader + filter chips + accordion + contact section"
  - "data/faq-data.ts with FaqItem type, FAQ_CATEGORIES const, 7 faqItems"
  - "components/faq/faq-accordion.tsx — single-open accordion with fern-expand/collapse icons"
  - "components/faq/faq-page-content.tsx — client component with category filter state"
affects: [supp-02, phase-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server/Client split: page.tsx stays server (metadata export), interactive state in faq-page-content.tsx client component"
    - "Single-open accordion via openId state with CSS max-height transition"
    - "Category filter via useState + Array.filter on client component"
    - "Fern botanical icons as expand/collapse toggle: fern-expand.png / fern-collapse.png"

key-files:
  created:
    - data/faq-data.ts
    - components/faq/faq-accordion.tsx
    - components/faq/faq-page-content.tsx
  modified:
    - app/faq/page.tsx

key-decisions:
  - "Server/Client split: page.tsx exports metadata (server), FaqPageContent handles interactive state (client) — maintains Next.js metadata export pattern"
  - "Single-open accordion: openId state — one item open at a time, clean UX"
  - "CSS max-height transition (0 → 500px) for accordion animation — no additional library needed"
  - "faq-page-content.tsx also enhanced with buildFaqPageSchema for structured data / SEO (FAQ rich results)"
  - "Still curious? contact section uses Link to /contact (internal route) instead of mailto: — more robust"

patterns-established:
  - "FAQ accordion pattern: single-open, fern icons, CSS transition, white-card on section background"
  - "Client filter chips: useState activeCategory → Array.filter → pass filtered items to presentational child"

requirements-completed: [SUPP-02]

# Metrics
duration: 3min
completed: 2026-02-26
---

# Phase 5 Plan 02: FAQ Page — Full Accordion Build Summary

**Replaced ComingSoon placeholder with full FAQ page: BotanicalHeader (faq variant), category filter chips, 7-item accordion with fern botanical icons, and "Still curious?" contact section using faq-contact-border.png**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-26T04:53:00Z
- **Completed:** 2026-02-26T04:56:13Z
- **Tasks:** 3
- **Files created/modified:** 4

## Accomplishments
- FAQ data layer: `FaqItem` interface, `FAQ_CATEGORIES` const (5 categories), `faqItems` array (7 items) in `data/faq-data.ts`
- Accordion component: single-open behavior, fern-expand.png / fern-collapse.png toggle icons, CSS max-height transition, white-card styling on parchment
- FAQ page content: category filter chips with active state (`bg-forest text-parchment`), filtering accordion live, "Still curious?" contact section with `faq-contact-border.png`
- Server/Client split preserved: `app/faq/page.tsx` exports `metadata` as Server Component; `FaqPageContent` is the interactive client boundary

## Task Commits

Files were present and verified in prior git history (commit f70a1f0). All success criteria confirmed met at plan execution time.

1. **Task 1: Create FAQ data file** - `f70a1f0` (feat — pre-existing)
2. **Task 2: Create FAQ accordion component** - `f70a1f0` (feat — pre-existing)
3. **Task 3: Rewrite FAQ page** - `f70a1f0` (feat — pre-existing)

**Plan metadata:** documented in SUMMARY.md commit

## Files Created/Modified
- `data/faq-data.ts` — FaqItem interface, FAQ_CATEGORIES (5 values), faqItems (7 items across 4 categories)
- `components/faq/faq-accordion.tsx` — Client Component; single-open accordion with fern PNG icons, CSS max-height transition, white-card rows
- `components/faq/faq-page-content.tsx` — Client Component; hero section, category chips, accordion with filter, "Still curious?" section with faq-contact-border.png
- `app/faq/page.tsx` — Server Component; metadata export, BotanicalHeader (faq), FaqPageContent, buildFaqPageSchema for structured data

## Decisions Made
- Server/Client split preserves `metadata` export (required for Next.js SSR metadata). FaqPageContent is the client boundary.
- Single-open accordion (one item at a time) — cleaner UX, simpler state.
- CSS max-height transition used instead of Radix or Headless UI — no dependency needed for this simple behavior.
- "Get in Touch" link uses Next.js `<Link href="/contact">` (internal route) rather than `mailto:` — more accessible and allows a contact page in future.
- `buildFaqPageSchema` added to page.tsx for JSON-LD FAQ structured data (SEO rich results) — enhancement beyond plan spec.

## Deviations from Plan

### Enhancement Beyond Spec

**[Enhancement] Structured data (JSON-LD) added to FAQ page**
- **Found during:** Verification of app/faq/page.tsx
- **Note:** app/faq/page.tsx includes `buildFaqPageSchema` call and a `<script type="application/ld+json">` block — this was already implemented as part of the broader work and is an SEO enhancement that improves FAQ rich result eligibility.
- **Impact:** Positive-only; does not affect visual rendering or plan requirements.

None - plan's core requirements executed exactly as written. Enhancement is additive only.

## Issues Encountered
- Pre-existing TypeScript error in `.next/types/validator.ts` for `app/collections/page.js` — this is a known artifact of the Phase 11 proxy redirect (collections page deleted, .next cache not cleared). Unrelated to FAQ work.

## Self-Check

- [x] `data/faq-data.ts` exists with 7 faqItems and FAQ_CATEGORIES
- [x] `components/faq/faq-accordion.tsx` uses fern-expand.png / fern-collapse.png
- [x] `components/faq/faq-page-content.tsx` has filter chips, accordion, "Still curious?" section with faq-contact-border.png
- [x] `app/faq/page.tsx` renders `<BotanicalHeader variant="faq" />` + `<FaqPageContent />`
- [x] No ComingSoon references in app/faq/
- [x] All 4 assets exist: botanical-header-faq.png, fern-expand.png, fern-collapse.png, faq-contact-border.png
- [x] TypeScript: no FAQ-related errors

## Self-Check: PASSED

## Next Phase Readiness
- FAQ page complete and verified (SUPP-02 done)
- Phase 05-03 (Blog page botanical header) can proceed
- No blockers

---
*Phase: 05-supporting-pages*
*Completed: 2026-02-26*
