# Phase 10: Trust Cleanup - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove all fabricated social proof from the site. Every shopper sees only real content — no fake purchase notifications, no invented reviewer personas, no made-up statistics, no fake engagement counts. Replace removed sections with either nothing or authentic content.

This phase does NOT include: integrating real Instagram API, collecting actual customer reviews, or sourcing real performance data. Those are future phases.

</domain>

<decisions>
## Implementation Decisions

### Testimonials section → "Find Us in the Wild" events section
- Remove fake reviewer personas (Sarah M., Michael R., Emily L. and their stock-photo headshots) entirely
- Replace with a new "Find us in the wild" section listing upcoming events/markets for the year
- Events data stored in a JSON/config file (not hardcoded in the component) — easy to update without touching component code
- Each event entry displays: event name, date, location/venue, and an optional link/more info URL
- Empty state (no upcoming events in JSON): show a friendly message — do NOT hide the section entirely

### Stats section
- Remove the fabricated stats block completely ("2,500+ Happy Seekers", "4.9 Average Rating", "98% Would Recommend", "50+ Artisan Partners")
- Remove from every page it appears on — not just the homepage
- No replacement — section is deleted, page flows without it

### Instagram gallery
- Remove the fake gallery (stock Unsplash photos with overlaid fake like/comment counts)
- Do not add any replacement content — section is removed from the page
- Preserve the component structure with clear comments marking where real Instagram integration will go (future phase: real Instagram API feed)
- Do NOT delete the file wholesale — comment out/stub it so future integration has a clean starting point

### Purchase popup — fake "Someone just bought..." notification
- Remove the fake purchase activity notification entirely — no popups showing fabricated purchase activity
- Find and remove whatever component renders this (separate from welcome-popup.tsx)

### Newsletter/Welcome popup (welcome-popup.tsx) — keep and update
The welcome popup is real content (genuine discount offer) — it stays, but gets updated:

**Copy:**
- Headline: "Join the Wildenflower Inner Circle"
- Body: "Get first dibs on new hand-dyed drops, one-of-a-kind leatherwork, and rare mineral finds. Plus, we'll let you know which Covington or Cincy markets we're hitting next."
- Incentive: Keep 15% OFF, framed as "Welcome gift for your first online order"

**Buttons:**
- Primary CTA: "Claim My Welcome Discount"
- Secondary/dismiss: "Maybe later" (replacing "No thanks" — more legible, friendlier)

**Image:**
- Replace current generic POS terminal / white marble counter photo with a botanical placeholder from existing assets in public/assets/images/
- Note for future: swap placeholder with a real booth-at-market or behind-the-bench workspace photo

**Timing:**
- Set a 10–20 second delay OR trigger at 50% scroll depth — do NOT fire on immediate page load
- Current behavior (fires instantly) must be fixed

</decisions>

<specifics>
## Specific Ideas

- "Find us in the wild" section name — captures the market/event energy; matches the botanical/authentic brand voice
- Events should show Covington and Cincinnati markets specifically (those are real Wildenflower venues)
- Popup tone: "an invitation to a community rather than a generic marketing trap" — warm, specific, local
- Popup copy references specific product types: "hand-dyed drops, one-of-a-kind leatherwork, rare mineral finds" — not generic "products"
- Instagram component: comment it out cleanly with a TODO block so a future phase can wire up the real feed without archaeology

</specifics>

<deferred>
## Deferred Ideas

- Real Instagram API integration (Basic Display API or oEmbed) — future phase, clearly flagged in component
- Collecting and displaying actual customer reviews — would replace the removed testimonials section eventually
- Sourcing real store performance stats to replace fabricated numbers

</deferred>

---

*Phase: 10-trust-cleanup*
*Context gathered: 2026-02-25*
