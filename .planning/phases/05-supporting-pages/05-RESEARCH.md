# Phase 5: Supporting Pages — Research

**Gathered:** 2026-02-24

## Target Files

### About Page
- `app/about/page.tsx` — 66 lines, Server Component, renders 8 sections:
  1. `AboutHero` → components/about/about-hero.tsx
  2. `BrandTimeline` → components/about/brand-timeline.tsx
  3. `MeetTheMakers` → components/about/meet-the-makers.tsx
  4. `VideoShowcase` → components/about/video-showcase.tsx
  5. `BehindTheScenes` → components/about/behind-the-scenes.tsx
  6. `MissionValues` → components/about/mission-values.tsx (134 lines, bg-neutral-50 section)
  7. `Sustainability` → components/about/sustainability.tsx (189 lines, bg-primary-900 dark section)
  8. `PressMentions` → components/about/press-mentions.tsx

### FAQ Page
- `app/faq/page.tsx` — 12 lines, renders `<ComingSoon title="Frequently Asked Questions" />`
- `components/coming-soon.tsx` — 42 lines, bg-neutral-50, primary-600 button

### Blog Page
- `app/blog/page.tsx` — 12 lines, renders `<ComingSoon title="Journal" />`

## Reusable Components

### BotanicalHeader (components/ui/botanical-header.tsx)
- 46 lines, Client Component
- Variants: `large`, `small`, `faq`, `blog`
- Missing: `about` variant (needs to map to `botanical-header-large-about.png`)
- Renders inside `max-w-[800px]` container with aspect ratio

### BotanicalDivider (components/ui/botanical-divider.tsx)
- 32 lines, Client Component
- Variants: fern-mushroom, wildflower, vine-trail, mushroom-cluster, fern-spiral
- Does NOT have fallen-log variant — needs to be added or use standalone Image
- Renders `h-32 my-6` container with object-contain

## Asset Inventory (confirmed on disk)

| Asset | Path | Size |
|-------|------|------|
| botanical-header-large-about.png | public/assets/images/headers/ | 1.3MB |
| botanical-header-faq.png | public/assets/images/headers/ | 893KB |
| botanical-header-blog.png | public/assets/images/headers/ | 1.3MB |
| fern-expand.png | public/assets/images/icons/ui/ | 1.8KB |
| fern-collapse.png | public/assets/images/icons/ui/ | 2.8KB |
| faq-contact-border.png | public/assets/images/faq/ | 727KB |
| divider-fallen-log.png | public/assets/images/about/ | exists |
| cartouche-frame.png | public/assets/images/about/ | exists (skipped per 05-CONTEXT) |

## Key Decisions from 05-CONTEXT.md

1. BotanicalHeader at the top of all three pages (above existing content)
2. About: divider-fallen-log between MissionValues and Sustainability; cartouche-frame skipped
3. FAQ: full accordion build replacing ComingSoon — mirrors wildenflowerShop faq.tsx
4. Blog: BotanicalHeader above existing ComingSoon — no other changes
5. No component-level color/typography sweep — trust Phase 1 globals
