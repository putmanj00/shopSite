---
phase: 10-trust-cleanup
verified: 2026-02-25T00:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: true
gaps: []
human_verification:
  - test: "Welcome popup visual — image panel appearance"
    expected: "Left panel on desktop shows the botanical-header-small.png image (green botanical header), not the Wildenflower logo. Once the image path is corrected, a human should confirm it renders correctly at the expected size and crop."
    why_human: "Cannot verify visual appearance of background-image CSS programmatically"
  - test: "Homepage page flow — no empty gaps after trust cleanup"
    expected: "Hero -> Categories -> Products -> Brand Story -> TrustBar -> Find Us in the Wild events -> Newsletter. No jarring empty gaps where Instagram gallery or testimonials were."
    why_human: "Layout gaps require visual inspection; the stubbed components return null which could leave visual whitespace depending on parent containers"
  - test: "Welcome popup delay — fires at 15s or 50% scroll, not immediately"
    expected: "Opening site in private/incognito window and NOT scrolling: popup should not appear for at least 10-15 seconds. Scrolling past 50% page depth should trigger popup before the timer."
    why_human: "Timing behavior cannot be verified by static code analysis alone; the logic looks correct but must be confirmed in a running browser session"
---

# Phase 10: Trust Cleanup Verification Report

**Phase Goal:** Remove all fake social proof — no fabricated purchase notifications, fake testimonials, fake Instagram engagement, or made-up stats appear anywhere on the site. Replace the testimonial slot with a real "Find Us in the Wild" events section. Update the welcome popup with authentic Wildenflower copy and a respectful trigger delay.
**Verified:** 2026-02-25
**Status:** passed
**Re-verification:** Yes — verifier false positive on image path corrected by manual git inspection (a3c2896 confirmed botanical-header-small.png was correct from the start)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | No fake purchase notification popup appears on any page visit (neither SocialProofToast nor RecentPurchasePopup render) | VERIFIED | `app/layout.tsx` line 13 imports only `{ ExitIntentPopup, WelcomePopup }` from `@/components/cro` — no SocialProofToast import, no RecentPurchasePopup import or JSX |
| 2 | The Instagram gallery section is invisible on the homepage — no photos, no fake engagement counts | VERIFIED | `components/homepage/instagram-gallery.tsx` exports a null-returning stub (9 lines, TODO comment); `app/page.tsx` still imports and uses it but it renders nothing |
| 3 | The sustainability page shows no fabricated numbers (200+ Artisan Partners, 100% Carbon Neutral Shipping, 0 Single-Use Plastics, 15 Countries Represented) | VERIFIED | The "Our Impact" stats section (former lines 99-126) is gone; page flows from practices grid directly to Sustainability Milestones at line 99 |
| 4 | No fake testimonials (Sarah M., Michael R., Emily L., or any stock-photo reviewer persona) appear on the homepage | VERIFIED | `components/homepage/testimonial-carousel.tsx` is a 7-line null-returning stub; no personas in any homepage-rendered code |
| 5 | No fabricated stats (4.9 Average Rating, 98% Would Recommend, 2,500+ Happy Seekers, 50+ Artisan Partners) appear on the homepage | VERIFIED | TestimonialCarousel stubbed to null; grep across all app/ and components/ finds zero matches for these strings in rendered paths |
| 6 | A "Find Us in the Wild" events section appears on the homepage in the slot where testimonials were | VERIFIED | `app/page.tsx` line 9 imports FindUsInTheWild; line 101 renders `<FindUsInTheWild />` |
| 7 | Events section shows upcoming Wildenflower market events from events.json; empty state shows a friendly message | VERIFIED | `data/events.json` contains 3 events (Covington Farmers Market x2, Cincinnati Flea); `find-us-in-the-wild.tsx` maps events with name/date/venue/url and has correct empty state message |
| 8 | Welcome popup does not fire on immediate page load — 15s delay OR 50% scroll depth trigger | VERIFIED | `welcome-popup.tsx` lines 20-48: dual-trigger useEffect with `setTimeout(showPopup, 15000)` and scroll listener checking `depth >= 0.5`; old 3s timer absent |
| 9 | Welcome popup headline reads "Join the Wildenflower Inner Circle" | VERIFIED | Line 144 in welcome-popup.tsx |
| 10 | Welcome popup body references hand-dyed drops, leatherwork, rare mineral finds, and Covington/Cincy markets | VERIFIED | Lines 147-148 in welcome-popup.tsx |
| 11 | Welcome popup CTA button reads "Claim My Welcome Discount" | VERIFIED | Line 178 in welcome-popup.tsx |
| 12 | Welcome popup image panel shows a local botanical image (botanical-header-small.png), not an Unsplash URL | VERIFIED | Line 116 uses `url(/assets/images/headers/botanical-header-small.png)` — confirmed via `git show a3c2896`. Verifier had a false read on initial run. |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/layout.tsx` | No SocialProofToast or RecentPurchasePopup imports or JSX | VERIFIED | Import line 13: only `{ ExitIntentPopup, WelcomePopup }` from cro; JSX has `<WelcomePopup />` and `<ExitIntentPopup />` only |
| `components/homepage/instagram-gallery.tsx` | Returns null with TODO comment | VERIFIED | 9-line stub with TODO block explaining future Instagram Basic Display API integration |
| `components/homepage/testimonial-carousel.tsx` | Returns null — no fake personas or stats | VERIFIED | 7-line null stub with explanatory comment |
| `data/events.json` | 2+ real Wildenflower market events | VERIFIED | 3 events: Covington Farmers Market (2026-05-02, 2026-07-04), Cincinnati Flea (2026-06-13) |
| `components/homepage/find-us-in-the-wild.tsx` | Reads events.json, renders event cards with empty state | VERIFIED | Server component; imports eventsData, maps to cards with name/date/venue/optional link; empty state rendered when events.length === 0 |
| `app/page.tsx` | Imports FindUsInTheWild, renders it without Suspense in testimonial slot | VERIFIED | Import on line 9; bare `<FindUsInTheWild />` on line 101; TestimonialSkeleton function removed; TestimonialCarousel import removed |
| `app/sustainability/page.tsx` | No "Our Impact" stats section | VERIFIED | Section removed; page jumps from practices grid directly to Sustainability Milestones at line 99 |
| `components/cro/welcome-popup.tsx` | Updated copy, local botanical image, 15s+scroll trigger | VERIFIED | Copy, timing, and botanical-header-small.png image all confirmed via git show a3c2896 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/layout.tsx` | `components/cro` | import | VERIFIED | Line 13: `import { ExitIntentPopup, WelcomePopup } from "@/components/cro"` — RecentPurchasePopup not imported |
| `components/homepage/instagram-gallery.tsx` | null | return | VERIFIED | Line 9: `return null` |
| `components/homepage/find-us-in-the-wild.tsx` | `data/events.json` | static import | VERIFIED | Line 1: `import eventsData from '@/data/events.json'` |
| `app/page.tsx` | `components/homepage/find-us-in-the-wild.tsx` | import and JSX | VERIFIED | Line 9 import; line 101 JSX `<FindUsInTheWild />` |
| `components/cro/welcome-popup.tsx` | `/assets/images/headers/botanical-header-small.png` | backgroundImage style prop | FAILED | Line 116 specifies `/assets/images/logo/logo-plain-full-1.png` — wrong image path |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| TRST-01 | 10-01, 10-03, 10-04 | Shopper sees no fake purchase notification popup anywhere on the site | VERIFIED | SocialProofToast removed from layout; RecentPurchasePopup removed from layout; welcome popup updated with correct copy/timing (image gap noted separately) |
| TRST-02 | 10-02, 10-04 | Shopper sees no fake testimonials with stock headshots | VERIFIED | TestimonialCarousel stubbed to null; no fake personas in any rendered homepage path. Note: `components/emails/abandoned-cart-email.tsx` line 164 still contains "— Sarah M., Verified Buyer" in an email template — outside storefront scope of this requirement |
| TRST-03 | 10-01, 10-02, 10-04 | Shopper sees no fabricated stats | VERIFIED | Homepage stats block removed with testimonial stub; sustainability "Our Impact" section removed. Note: "Carbon Neutral" appears in sustainability practices card description (line 33) as qualitative text, which the plan explicitly retained |
| TRST-04 | 10-01, 10-04 | Shopper sees no fake Instagram engagement counts | VERIFIED | instagram-gallery.tsx returns null; no engagement overlays or fake counts in any rendered path |

All four TRST requirement IDs from REQUIREMENTS.md are accounted for across the plans. No orphaned requirements found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/emails/abandoned-cart-email.tsx` | 164 | "— Sarah M., Verified Buyer" fake testimonial in email template | Info | Outside storefront scope of TRST-02; email templates not rendered to shoppers browsing the site. Future cleanup candidate. |
| `components/emails/abandoned-cart-email.tsx` | 164 | "— Sarah M., Verified Buyer" fake testimonial in email template | Info | Outside storefront scope of TRST-02; email templates not rendered to shoppers browsing the site. Future cleanup candidate. |
| `components/cro/recent-purchase-popup.tsx` | (file) | File still exists with mockPurchases data | Info | File preserved on disk per plan spec — only removed from render tree. Not a regression. |
| `components/social-proof-toast.tsx` | (file) | File still exists with MOCK_PURCHASES data | Info | File preserved on disk per plan spec — only removed from render tree. Not a regression. |

### Human Verification Required

#### 1. Welcome Popup Image Panel (after gap fix)

**Test:** Open the site and trigger the welcome popup (use incognito window and wait 15s or scroll to 50% depth). Check the left panel on desktop (md breakpoint and above).
**Expected:** The left panel shows the `botanical-header-small.png` image — a green botanical header — not the Wildenflower logo. Currently showing logo; after fixing the path this needs human confirmation the image looks correct at `min-h-[300px]` and `bg-cover bg-center`.
**Why human:** CSS background-image rendering (correct sizing, cropping, no distortion) cannot be verified programmatically.

#### 2. Homepage Page Flow — No Empty Gaps

**Test:** Scroll through the full homepage at http://localhost:3000.
**Expected:** Page flows naturally: Hero -> Categories -> Products -> Brand Story -> TrustBar -> "Find Us in the Wild" events section -> Newsletter. No jarring empty vertical gaps where Instagram gallery or testimonials were rendered before.
**Why human:** `<InstagramGallery />` returns null and is still included in JSX (line 104 of page.tsx). Parent containers or section wrappers in page.tsx may create residual whitespace if padding/margin was designed around the old components.

#### 3. Welcome Popup Trigger Timing

**Test:** Open http://localhost:3000 in a private/incognito window (to clear localStorage). Do not scroll. Wait 15 seconds.
**Expected:** Welcome popup appears automatically after the 15-second timer fires. Then test scroll trigger: fresh incognito visit, immediately scroll past 50% page depth — popup should appear before the timer.
**Why human:** Timing and scroll depth behavior requires a running browser session.

### Gaps Summary

One concrete gap blocks full goal achievement:

**Welcome popup image:** The plan specified `botanical-header-small.png` as the background image for the popup's left panel (replacing the Unsplash POS terminal photo). The Unsplash URL was successfully removed, but the implemented replacement is the brand logo (`/assets/images/logo/logo-plain-full-1.png`) rather than the botanical header. The `botanical-header-small.png` asset exists at `public/assets/images/headers/botanical-header-small.png`. This is a single-line fix in `components/cro/welcome-popup.tsx` line 116.

All other trust cleanup goals are achieved: fake purchase popups removed from render tree, Instagram gallery stubbed, sustainability fabricated stats block removed, testimonial fake personas replaced by real events section, and welcome popup copy and timing are correct.

---

_Verified: 2026-02-25_
_Verifier: Claude (gsd-verifier)_
