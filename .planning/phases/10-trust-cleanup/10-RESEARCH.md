# Phase 10: Trust Cleanup - Research

**Researched:** 2026-02-25
**Domain:** Component removal, content replacement, scroll-triggered popup timing — Next.js 16 / React 19 / Tailwind CSS 4
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Testimonials section → "Find Us in the Wild" events section**
- Remove fake reviewer personas (Sarah M., Michael R., Emily L. and their stock-photo headshots) entirely
- Replace with a new "Find us in the wild" section listing upcoming events/markets for the year
- Events data stored in a JSON/config file (not hardcoded in the component) — easy to update without touching component code
- Each event entry displays: event name, date, location/venue, and an optional link/more info URL
- Empty state (no upcoming events in JSON): show a friendly message — do NOT hide the section entirely

**Stats section**
- Remove the fabricated stats block completely ("2,500+ Happy Seekers", "4.9 Average Rating", "98% Would Recommend", "50+ Artisan Partners")
- Remove from every page it appears on — not just the homepage
- No replacement — section is deleted, page flows without it

**Instagram gallery**
- Remove the fake gallery (stock Unsplash photos with overlaid fake like/comment counts)
- Do not add any replacement content — section is removed from the page
- Preserve the component structure with clear comments marking where real Instagram integration will go (future phase: real Instagram API feed)
- Do NOT delete the file wholesale — comment out/stub it so future integration has a clean starting point

**Purchase popup — fake "Someone just bought..." notification**
- Remove the fake purchase activity notification entirely — no popups showing fabricated purchase activity
- Find and remove whatever component renders this (separate from welcome-popup.tsx)

**Newsletter/Welcome popup (welcome-popup.tsx) — keep and update**
The welcome popup is real content (genuine discount offer) — it stays, but gets updated:

Copy:
- Headline: "Join the Wildenflower Inner Circle"
- Body: "Get first dibs on new hand-dyed drops, one-of-a-kind leatherwork, and rare mineral finds. Plus, we'll let you know which Covington or Cincy markets we're hitting next."
- Incentive: Keep 15% OFF, framed as "Welcome gift for your first online order"

Buttons:
- Primary CTA: "Claim My Welcome Discount"
- Secondary/dismiss: "Maybe later" (replacing "No thanks" — more legible, friendlier)

Image:
- Replace current generic POS terminal / white marble counter photo with a botanical placeholder from existing assets in public/assets/images/
- Note for future: swap placeholder with a real booth-at-market or behind-the-bench workspace photo

Timing:
- Set a 10–20 second delay OR trigger at 50% scroll depth — do NOT fire on immediate page load
- Current behavior (fires instantly at 3s) must be fixed

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
- Real Instagram API integration (Basic Display API or oEmbed) — future phase, clearly flagged in component
- Collecting and displaying actual customer reviews — would replace the removed testimonials section eventually
- Sourcing real store performance stats to replace fabricated numbers
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRST-01 | Shopper sees no fake purchase notification popup anywhere on the site | Two components identified: `SocialProofToast` (layout.tsx line 129) and `RecentPurchasePopup` (layout.tsx line 132) — both must be removed from layout.tsx and their registrations cleaned up |
| TRST-02 | Shopper sees no fake testimonials with stock headshots (Sarah M., Michael R., Emily L., etc.) | `TestimonialCarousel` in `components/homepage/testimonial-carousel.tsx` — entire component replaced with new `FindUsInTheWild` events section; homepage page.tsx import updated |
| TRST-03 | Shopper sees no fabricated stats ("2,500+ Happy Seekers", "4.9 Average Rating", "98% Would Recommend", "50+ Artisan Partners") | Stats block lives INSIDE `testimonial-carousel.tsx` (lines 138–155), not in a separate component — removing the whole testimonial section removes it. Also found a separate stats block in `app/sustainability/page.tsx` lines 100–126 with "200+ Artisan Partners" and other invented numbers |
| TRST-04 | Shopper sees no fake Instagram engagement counts — overlays removed; if photos are Unsplash stock, entire section removed | `InstagramGallery` in `components/homepage/instagram-gallery.tsx` — photos are all Unsplash stock, so entire section is removed from homepage; component file stubbed with TODO comment |
</phase_requirements>

---

## Summary

This phase is pure surgical removal of fabricated social proof from the shopSite codebase. There are no new libraries to install, no external APIs to integrate, and no build system changes needed. The work is contained to six files: `app/layout.tsx` (remove two fake purchase popup registrations), `components/homepage/testimonial-carousel.tsx` (replace with new FindUsInTheWild component), `components/homepage/instagram-gallery.tsx` (stub/comment out), `components/cro/welcome-popup.tsx` (update copy, image, and timing), `app/page.tsx` (update section imports), and `app/sustainability/page.tsx` (remove fabricated stats block).

The most nuanced task is the welcome popup update: the current 3-second delay fires too soon; the target is a 10–20 second timer OR 50% scroll depth trigger. Scroll depth detection in React uses a `useEffect` with `window.addEventListener('scroll', ...)` comparing `window.scrollY / document.body.scrollHeight`. Both the `SocialProofToast` (`components/social-proof-toast.tsx`) and `RecentPurchasePopup` (`components/cro/recent-purchase-popup.tsx`) are redundant implementations of the same fake purchase pattern — both are imported in `app/layout.tsx` and both must be removed.

The fabricated stats block in `testimonial-carousel.tsx` (the "4.9 Average Rating / 30-day / 100% Handmade" row) is embedded at the bottom of the same component as the fake reviews. Removing the entire TestimonialCarousel from homepage removes all three. A separate fabricated stats block exists on the sustainability page ("200+ Artisan Partners", "100% Carbon Neutral Shipping", "0 Single-Use Plastics", "15 Countries Represented") — these are invented numbers and must also be removed per TRST-03.

**Primary recommendation:** Work in one logical sequence — remove fake purchase popups from layout first (TRST-01), then replace testimonials with events section (TRST-02 + TRST-03), then stub Instagram gallery (TRST-04), then update welcome popup copy/timing last (it's independent of the removals).

---

## Standard Stack

No new libraries needed. Everything is handled with existing project stack.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.1 | App router, pages, layout | Already in use |
| React | 19 | `useEffect`, `useState`, `useCallback` | Already in use |
| Tailwind CSS | 4 | All styling | Already in use |
| TypeScript | (project) | Type-safe data models | Already in use |

### No New Installs Required
All work is component editing and file restructuring within existing conventions.

---

## Architecture Patterns

### Recommended File Structure After Phase 10

```
data/
└── events.json                           # NEW — Wildenflower market events data

components/
├── cro/
│   ├── welcome-popup.tsx                 # MODIFIED — updated copy, image, timing
│   ├── recent-purchase-popup.tsx         # UNCHANGED file (not deleted), but removed from layout
│   ├── exit-intent-popup.tsx             # UNCHANGED
│   └── index.ts                          # MODIFIED — remove RecentPurchasePopup export OR keep for file integrity
│
├── homepage/
│   ├── testimonial-carousel.tsx          # REPLACED — becomes FindUsInTheWild
│   ├── instagram-gallery.tsx             # STUBBED — commented out body, TODO block added
│   └── [others unchanged]
│
└── social-proof-toast.tsx                # UNCHANGED file, but removed from layout

app/
├── layout.tsx                            # MODIFIED — remove SocialProofToast and RecentPurchasePopup
├── page.tsx                              # MODIFIED — replace TestimonialCarousel with FindUsInTheWild
└── sustainability/page.tsx               # MODIFIED — remove fabricated stats block
```

### Pattern 1: Removing a Global Component from Layout

The two fake purchase popups (`SocialProofToast` and `RecentPurchasePopup`) are registered globally in `app/layout.tsx`. Removal is a two-step edit to `layout.tsx`:

1. Remove the import lines (lines 13–14)
2. Remove the JSX tags from the body (lines 129 and 132)

The `cro/index.ts` barrel export can optionally have `RecentPurchasePopup` removed, but since the file itself is not deleted (it's just not rendered), the export can stay as-is without causing runtime issues.

```typescript
// app/layout.tsx — BEFORE (lines to remove)
import SocialProofToast from "@/components/social-proof-toast";
import { ExitIntentPopup, WelcomePopup, RecentPurchasePopup } from "@/components/cro";
// ...
<SocialProofToast />
<WelcomePopup />
<ExitIntentPopup />
<RecentPurchasePopup />

// app/layout.tsx — AFTER
import { ExitIntentPopup, WelcomePopup } from "@/components/cro";
// ...
<WelcomePopup />
<ExitIntentPopup />
```

### Pattern 2: Events Data File (JSON, not TypeScript)

Store events as a JSON file in `data/` to match the existing data pattern and make updates easy without touching component code:

```json
// data/events.json
[
  {
    "id": "1",
    "name": "Covington Farmers Market",
    "date": "2026-05-03",
    "venue": "Pike Street, Covington, KY",
    "url": "https://www.covingtonkyfarmersmarket.com"
  },
  {
    "id": "2",
    "name": "Cincinnati Flea",
    "date": "2026-06-14",
    "venue": "Oakley Square, Cincinnati, OH",
    "url": null
  }
]
```

Import in the component as a static import (no fetch needed — JSON is bundled at build time by Next.js):

```typescript
import eventsData from '@/data/events.json';
```

### Pattern 3: FindUsInTheWild Component

Replaces `testimonial-carousel.tsx`. The new component lives at the same path (`components/homepage/find-us-in-the-wild.tsx`) and is imported from `app/page.tsx` in the same slot where `TestimonialCarousel` was.

```typescript
// components/homepage/find-us-in-the-wild.tsx
import eventsData from '@/data/events.json';

interface WildenflowerEvent {
  id: string;
  name: string;
  date: string;         // ISO 8601 string "YYYY-MM-DD"
  venue: string;
  url: string | null;
}

const events: WildenflowerEvent[] = eventsData;

// Empty state: show friendly message, never hide section
// Date formatting: use Intl.DateTimeFormat for human-readable dates
// Styling: bg-parchment, text-ink-brown, text-earth — matches homepage section pattern
```

### Pattern 4: Stubbing Instagram Gallery (Not Deleting)

The Instagram gallery component becomes a no-op that renders nothing, but preserves all the original code in comments with a clear TODO block:

```typescript
// components/homepage/instagram-gallery.tsx
// TODO: Real Instagram integration — future phase
// Connect to Instagram Basic Display API or oEmbed
// When ready, uncomment the component below and wire up real data
//
// [original component code commented out]

export default function InstagramGallery() {
  return null;
}
```

In `app/page.tsx`, the `<InstagramGallery />` import and usage can STAY — it renders null cleanly. This avoids touching the import line. The `<Suspense>` wrapper around it (if any) can stay or be removed — check app/page.tsx: the gallery is NOT wrapped in Suspense (only FeaturedProducts and TestimonialCarousel are), so it can be left as-is.

### Pattern 5: Scroll Depth Trigger for Welcome Popup

Current behavior: fires after 3-second timeout. Decision requires: 10–20 second delay OR 50% scroll depth, whichever comes first.

Implementing scroll depth in React with a `useEffect` cleanup:

```typescript
// In welcome-popup.tsx useEffect
useEffect(() => {
  const alreadyShown = localStorage.getItem('welcomePopupShown');
  if (alreadyShown) return;

  let shown = false;

  const showPopup = () => {
    if (shown) return;
    shown = true;
    setIsVisible(true);
    localStorage.setItem('welcomePopupShown', 'true');
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(timer);
  };

  // Option A: 15-second timer (midpoint of 10-20s range)
  const timer = setTimeout(showPopup, 15000);

  // Option B: 50% scroll depth
  const handleScroll = () => {
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (scrolled >= 0.5) showPopup();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    clearTimeout(timer);
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

### Pattern 6: Welcome Popup Botanical Image

Replace the Unsplash POS terminal photo with a local botanical asset. Best candidates from `public/assets/images/`:

- `headers/botanical-hero2.png` — the hero image already used on homepage; has the right warmth but may be too large
- `headers/botanical-header-small.png` — better fit for the popup left-panel slot (300px min-height)
- `splash/splash-bloom-elements.png` — botanical elements, floral

**Recommended:** Use `headers/botanical-header-small.png` as the popup image — it's portrait-oriented, botanical, and sized appropriately for the modal panel. Update the `style={{ backgroundImage: ... }}` div in welcome-popup.tsx to reference the local path:

```typescript
// Replace:
style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=600&fit=crop)' }}

// With:
style={{ backgroundImage: 'url(/assets/images/headers/botanical-header-small.png)' }}
```

### Anti-Patterns to Avoid

- **Deleting component files:** Keep `social-proof-toast.tsx` and `recent-purchase-popup.tsx` as files — just stop rendering them. They may be referenced by import checkers or future decisions.
- **Hiding with CSS only:** Using `display: none` or `opacity: 0` instead of removing from the render tree — the fake popups must not exist in the DOM.
- **Forgetting sustainability page:** The stats removal requirement (TRST-03) extends beyond the homepage. The sustainability page (`app/sustainability/page.tsx` lines 100–126) has a fabricated "Our Impact" stats block with "200+ Artisan Partners", "0 Single-Use Plastics", etc.
- **Removing the whole TestimonialCarousel Suspense wrapper in page.tsx without updating:** The `TestimonialSkeleton` fallback and Suspense wrapper in `app/page.tsx` should be cleaned up when the component is swapped — the new events section doesn't need Suspense since it reads from a local JSON file.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll percentage calculation | A complex IntersectionObserver setup | Simple `window.scrollY / (document.body.scrollHeight - window.innerHeight)` | Sufficient for this use case; no library needed |
| Date formatting for events | A custom date formatter | `Intl.DateTimeFormat` (built-in JS) | Handles locale, no dependency |
| Events data fetching | An API route | Static JSON import via `import eventsData from '@/data/events.json'` | Build-time bundling, zero runtime cost |

**Key insight:** This entire phase is deletions and edits. The only "new" code is the `FindUsInTheWild` component and events JSON — both are simple and self-contained.

---

## Common Pitfalls

### Pitfall 1: Only Removing the Visible Component, Missing the Second Fake Popup
**What goes wrong:** Developer removes `RecentPurchasePopup` from layout.tsx but misses `SocialProofToast` — or vice versa. Both remain active because both run independently.
**Why it happens:** Two separate files implement the same pattern; `SocialProofToast` lives at the root `components/` level while `RecentPurchasePopup` is in `components/cro/`.
**How to avoid:** The removal task must explicitly target BOTH: `components/social-proof-toast.tsx` import AND `components/cro/recent-purchase-popup.tsx` import in `app/layout.tsx`. Verify layout.tsx has zero references to fake purchase content after the edit.
**Warning signs:** Running the app and seeing a "SOLD" badge toast appear in the bottom-left after 5 seconds — that's `SocialProofToast`.

### Pitfall 2: Stats Block in Two Places, Not One
**What goes wrong:** Developer removes the stats from `testimonial-carousel.tsx` (which is the "4.9 Average Rating / 30-day / 100% Handmade" block) but doesn't check `app/sustainability/page.tsx` — which has its own separate fabricated stats block ("200+ Artisan Partners", "100% Carbon Neutral Shipping").
**Why it happens:** TRST-03 mentions stats that appear on the homepage, so devs focus there. The sustainability page was not mentioned explicitly in requirements but contains fabricated numbers.
**How to avoid:** Grep for fabricated stat text and check all pages. The sustainability page stats block is at lines 100–126 of `app/sustainability/page.tsx`.
**Warning signs:** A shopper visiting `/sustainability` sees invented environmental numbers.

### Pitfall 3: Welcome Popup Fires on Every Page Load After Session Clears
**What goes wrong:** The `localStorage.setItem('welcomePopupShown', 'true')` fires before the popup is shown (at timer setup time), meaning if the tab is refreshed during the delay window, the popup never shows. Alternatively, setting it only on show means it shows every session if storage is cleared.
**Why it happens:** Current code sets the localStorage flag at `setTimeout` callback time — which is correct. But verifying this is preserved in the rewrite is important.
**How to avoid:** Set `localStorage.setItem('welcomePopupShown', 'true')` inside the `showPopup()` function (when actually showing), not in the setup. The current implementation already does this correctly at line 28 of welcome-popup.tsx — preserve this behavior.

### Pitfall 4: Instagram Gallery Import Stays But Returns Null — Suspense Mismatch
**What goes wrong:** `InstagramGallery` is not wrapped in Suspense in `app/page.tsx`, so there's no mismatch. But the `TestimonialCarousel` IS wrapped in Suspense — replacing it with `FindUsInTheWild` (which reads static JSON, not async) means the Suspense wrapper and `TestimonialSkeleton` fallback become unnecessary.
**Why it happens:** Developers swap the component without updating the Suspense boundary, leaving dead skeleton UI code.
**How to avoid:** When replacing `TestimonialCarousel` in `app/page.tsx`, remove the `<Suspense fallback={<TestimonialSkeleton />}>` wrapper and the `TestimonialSkeleton` function. The `FindUsInTheWild` component uses static JSON — it renders synchronously.

### Pitfall 5: next.config.ts Unsplash Domain Can Be Cleaned Up
**What goes wrong:** After removing all Unsplash image references, the `images.unsplash.com` remote pattern in `next.config.ts` becomes stale. This is low risk (it just allows a domain that's no longer used) but the TODO comment in `next.config.ts` explicitly flags this for cleanup.
**Why it happens:** The comment already says "TODO: Remove images.unsplash.com once placeholder images in instagram-gallery, brand-story, testimonial-carousel, and welcome-popup are replaced."
**How to avoid:** After replacing the welcome popup image with a local asset and stubbing the Instagram gallery, the only remaining Unsplash user would be `brand-story.tsx` (if it still uses Unsplash). Check `brand-story.tsx` before removing the domain config. If brand-story still uses Unsplash, leave the config entry — don't break it.

---

## Code Examples

### Removing Fake Popup Imports from layout.tsx
```typescript
// Source: Direct codebase inspection — app/layout.tsx

// BEFORE (lines 13-14):
import SocialProofToast from "@/components/social-proof-toast";
import { ExitIntentPopup, WelcomePopup, RecentPurchasePopup } from "@/components/cro";

// AFTER:
import { ExitIntentPopup, WelcomePopup } from "@/components/cro";

// BEFORE (layout body, lines 129-132):
<SocialProofToast />
<WelcomePopup />
<ExitIntentPopup />
<RecentPurchasePopup />

// AFTER:
<WelcomePopup />
<ExitIntentPopup />
```

### Stubbing Instagram Gallery
```typescript
// Source: Direct codebase inspection — components/homepage/instagram-gallery.tsx

// TODO: Real Instagram integration — future phase
// This section will show a live Instagram feed when wired up to the
// Instagram Basic Display API or oEmbed endpoint.
// Original placeholder implementation has been removed (fake stock photos
// with fabricated like counts). Restore this component when real API is available.

export default function InstagramGallery() {
  return null;
}
```

### Events JSON Data Structure
```json
// data/events.json
[
  {
    "id": "1",
    "name": "Covington Farmers Market",
    "date": "2026-05-03",
    "venue": "Pike Street, Covington, KY",
    "url": "https://www.covingtonkyfarmersmarket.com"
  }
]
```

### FindUsInTheWild Empty State
```typescript
// components/homepage/find-us-in-the-wild.tsx
// When events array is empty:
{events.length === 0 && (
  <p className="text-earth text-center py-8">
    No upcoming events right now — check back soon.
    In the meantime, browse the shop or follow us on Instagram.
  </p>
)}
```

### Welcome Popup Updated Timing
```typescript
// components/cro/welcome-popup.tsx — updated useEffect
useEffect(() => {
  const alreadyShown = localStorage.getItem('welcomePopupShown');
  if (alreadyShown) return;

  let shown = false;

  const showPopup = () => {
    if (shown) return;
    shown = true;
    setIsVisible(true);
    localStorage.setItem('welcomePopupShown', 'true');
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(timer);
  };

  const timer = setTimeout(showPopup, 15000); // 15s — midpoint of 10-20s range

  const handleScroll = () => {
    const depth = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (depth >= 0.5) showPopup();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    clearTimeout(timer);
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

---

## State of the Art

This is a content cleanup phase. No meaningful "state of the art" considerations apply — the techniques used (component removal, static JSON data, scroll event listeners, localStorage flags) are all baseline React/Next.js patterns stable for years.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fake purchase notifications via setInterval | Removed entirely | Phase 10 | Trust restored |
| Unsplash stock photos with fabricated like counts | Component stubbed for future real API | Phase 10 | Trust restored |
| Fabricated reviewer personas (Sarah M., etc.) | Replaced with real-data events section | Phase 10 | Trust restored |
| Fabricated stats block (4.9 rating, 98% recommend) | Removed, no replacement | Phase 10 | Trust restored |

---

## Open Questions

1. **Brand Story component — also uses Unsplash?**
   - What we know: `next.config.ts` comment mentions `brand-story` as one of the Unsplash users. The `components/homepage/brand-story.tsx` was not read during this research.
   - What's unclear: Does `brand-story.tsx` have any fake engagement counts or fabricated stats? Or just a generic background image?
   - Recommendation: Inspect `brand-story.tsx` at the start of the plan. If it only uses Unsplash for a decorative background (no fake counts), it's out of scope for TRST-04 and can be left for a future visual phase. If it has fabricated social proof, address it here.

2. **Testimonial-carousel.tsx — rename or replace?**
   - What we know: The decision says "remove fake reviewer personas" and "replace with Find us in the Wild section." The file is currently `testimonial-carousel.tsx`.
   - What's unclear: Should the new component live in the same file (renamed) or as a new file alongside the old one?
   - Recommendation: Create a new file `components/homepage/find-us-in-the-wild.tsx`. Leave `testimonial-carousel.tsx` in place but strip its content to just `export default function TestimonialCarousel() { return null; }` — or delete it if no other files reference it. Check for any imports before deleting.

3. **next.config.ts Unsplash domain — remove after this phase?**
   - What we know: The TODO comment in next.config.ts lists the components that use Unsplash. After this phase, welcome-popup, instagram-gallery, and testimonial-carousel will be cleaned. Brand-story may still use Unsplash.
   - Recommendation: Do NOT remove the Unsplash domain from next.config.ts during this phase. Check brand-story first; only remove if all Unsplash references are gone. This is a low-priority cleanup that can happen whenever brand-story gets real photography.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — all findings are from reading the actual source files

### Files Inspected
| File | What Was Checked |
|------|-----------------|
| `app/layout.tsx` | Confirmed both `SocialProofToast` and `RecentPurchasePopup` imported and rendered globally |
| `components/social-proof-toast.tsx` | Confirmed: fake purchase toast with `MOCK_PURCHASES`, framer-motion, fires after 5s |
| `components/cro/recent-purchase-popup.tsx` | Confirmed: second fake purchase popup with `mockPurchases`, fires after 10s |
| `components/cro/welcome-popup.tsx` | Confirmed: fires at 3s, uses Unsplash image, "No thanks" dismiss text |
| `components/homepage/instagram-gallery.tsx` | Confirmed: all 8 photos are Unsplash stock, each with fake `likes` count on hover overlay |
| `components/homepage/testimonial-carousel.tsx` | Confirmed: Sarah M., Michael R., Emily L. personas with Unsplash headshots; stats block embedded at bottom (4.9 rating) |
| `components/homepage/trust-bar.tsx` | Inspected — this is the "Free Shipping / Crafted with Intention / Secure Checkout / Easy Returns" bar, NOT the fabricated stats. This is real policy content and is NOT removed. |
| `app/page.tsx` | Confirmed component import structure; TestimonialCarousel in Suspense; InstagramGallery not in Suspense |
| `app/sustainability/page.tsx` | Confirmed: fabricated "Our Impact" stats block lines 100–126 ("200+ Artisan Partners", etc.) |
| `next.config.ts` | Confirmed: TODO comment already flags Unsplash images for removal in instagram-gallery, brand-story, testimonial-carousel, welcome-popup |
| `data/faq-data.ts` | Inspected as reference pattern for new events.json structure |
| `public/assets/images/` | Full inventory of available botanical assets for welcome popup image replacement |

---

## Metadata

**Confidence breakdown:**
- Component identification: HIGH — all components read directly from source
- Removal approach: HIGH — standard React/Next.js patterns, no external dependencies
- Events data structure: HIGH — matches existing `data/` file conventions
- Welcome popup scroll trigger: HIGH — native browser APIs, well-established pattern
- Botanical image selection: MEDIUM — best candidate identified (`botanical-header-small.png`) but visual review needed to confirm fit

**Research date:** 2026-02-25
**Valid until:** N/A — this phase is pure code cleanup with no external dependencies or fast-moving ecosystem concerns
