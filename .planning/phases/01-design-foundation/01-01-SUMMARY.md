---
phase: 01-design-foundation
plan: 01
subsystem: ui
tags: [tailwind, next-font, css-variables, pwa, typography, design-system]

# Dependency graph
requires: []
provides:
  - Playfair Display and Lora loaded via next/font with CSS variables on <html>
  - Wildenflower botanical color tokens in Tailwind @theme (bg-parchment, bg-forest, text-ink-brown, etc.)
  - Parchment (#F5EDD6) background and inkBrown (#5C4033) text as global defaults
  - Forest green (#1E3B30) viewport theme color and PWA manifest theme
  - color-scheme: light enforced — no dark mode rendering
  - Botanical brand voice in metadata (title, description, OG, Twitter)
affects:
  - 02-header
  - 03-homepage
  - 04-product-detail
  - 05-supporting-pages

# Tech tracking
tech-stack:
  added:
    - Playfair_Display (next/font/google — 700 bold)
    - Lora (next/font/google — 400 regular + italic)
  patterns:
    - Font CSS variables injected on <html> element (not <body>) to avoid Tailwind font-sans specificity conflict
    - Tailwind botanical tokens defined in @theme inline block as direct hex values
    - Legacy psychedelic :root CSS variables preserved (stop Tailwind utility generation by removing from @theme, leave :root alone to avoid breaking existing var() references)
    - color-scheme: light on :root suppresses OS-level dark mode entirely

key-files:
  created: []
  modified:
    - app/layout.tsx
    - app/globals.css
    - public/manifest.json

key-decisions:
  - "Font variables on <html> not <body> — eliminates specificity conflict with Tailwind font-sans utility class (Research Pitfall 4)"
  - "Preserve old :root psychedelic color variables — removes from @theme only; existing components may reference via var() and would break if deleted"
  - "color-scheme: light on :root — hard-suppresses dark mode, ensuring parchment background renders on all systems regardless of OS preference"
  - "No font-sans utility on <body> — body font driven by globals.css font-family rule to avoid CSS specificity conflicts"

patterns-established:
  - "Botanical token pattern: --color-parchment, --color-terracotta, --color-gold, --color-sage, --color-forest, --color-dusty-rose, --color-ink-brown, --color-earth defined in @theme inline"
  - "Font pattern: --font-playfair on headings, --font-lora on body, both with Georgia/serif fallbacks"
  - "Metadata pattern: botanical brand voice — 'Made by hand. Found by heart.' — used consistently in title, description, OG, Twitter, PWA manifest"

requirements-completed: [DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05]

# Metrics
duration: 2min
completed: 2026-02-24
---

# Phase 1 Plan 1: Design Foundation — Tokens, Fonts, and Globals Summary

**Playfair Display + Lora fonts via next/font, 8 botanical Tailwind color tokens, parchment/inkBrown global defaults, and forest green PWA theme replacing the psychedelic design system**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-24T16:36:55Z
- **Completed:** 2026-02-24T16:39:23Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced Righteous/Nunito/Sacramento fonts with Playfair Display (700) + Lora (400/italic) via next/font with CSS variables on `<html>`
- Added all 8 Wildenflower botanical color tokens to Tailwind `@theme inline` (bg-parchment, bg-forest, text-ink-brown, bg-terracotta, bg-sage, bg-gold, bg-dusty-rose, bg-earth)
- Set parchment (#F5EDD6) as global background and inkBrown (#5C4033) as global foreground; dark mode suppressed via `color-scheme: light`
- Updated PWA manifest theme_color and background_color to botanical brand colors; replaced psychedelic copy with botanical brand voice

## Task Commits

Each task was committed atomically:

1. **Task 1: Fonts, @theme tokens, and globals.css botanical reset** - `34bbb49` (feat)
2. **Task 2: Update PWA manifest theme color and brand description** - `87c2561` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/layout.tsx` - Replaced 3 psychedelic fonts with Playfair Display + Lora; font variables on `<html>`; botanical metadata and forest green viewport theme color
- `app/globals.css` - Added botanical color tokens to @theme; parchment/inkBrown semantic defaults; color-scheme: light; removed dark mode media queries; updated body + heading font stacks
- `public/manifest.json` - theme_color → #1E3B30, background_color → #F5EDD6, botanical brand description

## Decisions Made
- Font variables on `<html>` (not `<body>`) — eliminates specificity conflict with Tailwind's `font-sans` utility class
- Legacy psychedelic `:root` variables preserved — only removed from `@theme inline` to stop Tailwind utility generation; existing component `var()` references remain safe
- `color-scheme: light` on `:root` — hard suppresses OS dark mode so parchment renders on all devices regardless of system preference
- No `font-sans` utility on `<body>` — font driven by CSS `font-family` rule to avoid specificity conflicts

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Design foundation complete. All phases can now consume botanical tokens via Tailwind utilities (bg-parchment, bg-forest, text-ink-brown, font-playfair, font-lora, etc.)
- Phase 2 (Header) can proceed: logo swap and botanical palette on nav components will inherit correct fonts and colors automatically
- Dev server will render parchment background and correct serif fonts on any page

---
*Phase: 01-design-foundation*
*Completed: 2026-02-24*
