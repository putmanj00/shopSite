# Implementation Brief — "The Journal, Opened" (redesign concept 01, rev-02)

Status: **ADOPTED by James 2026-07-07.** Concept + rationale: `docs/redesign-concept-01.html`
(shopSite repo, merged PR #50 `272672d`; live artifact
https://claude.ai/code/artifact/0fe7fc99-583c-4aed-8941-81dab265be8a). Prior briefs:
`redesign-concept-01-review-brief.md`, `redesign-concept-01-fix-brief.md`.

Delegated brief — worker cannot ask follow-ups. Run each slice in a FRESH session.
One slice = one branch = one PR. Read the concept's "System & Rationale" tab
(build-notes table, kill-list, derived-tokens table) before coding.

## Objective

Implement the adopted redesign on `~/projects/wildenflower/shopSite` (Next 16 + React 19 +
Tailwind v4 `@theme`, headless Shopify), in the slice order below, without breaking the
live funnel.

## Hard constraints (all slices)

- **Vercel auto-deploys PROD on main merge.** All work on feature branches; judge visuals
  on Vercel preview URLs; merge only green + James-eyeballed.
- **AGENTS.md Do-Not-Touch** applies. `lib/shopify.ts` product queries need the sanctioned
  exception James already anticipates (precedent: 2026-06-12 apiVersion bump) — get explicit
  ACK in the PR description, or use a separate query helper module instead.
- Keep add→cart→checkout intact: e2e suite must stay 33/33 across chromium/firefox/webkit
  (PR #41 lesson: drive the real customer flow at mobile viewport, not static pages).
- Brand: two registers only. Open Field = parchment, Deep Woods = forest brand moments.
  **No OS dark-mode inversion** (codex-confirmed rule, stated in concept palette rationale).
- No fabricated stats/urgency: no fake review counts, no invented market dates (events come
  from `data/events.json` + honest empty state), no countdowns.
- Contrast: every new fg/bg pair ≥4.5:1 normal text (≥3:1 large/non-text); repo's contrast
  gate + `CONTRAST_STRICT=1` must pass.
- Commit style: conventional commits, as in repo history.

## Slice order

**S0 — tokens (no visual change).** Add to `globals.css @theme` per concept derived-tokens
table: `gold-ink #786222`, `rose-ink #A8513B`, `parchment-deep #EDE3C8`, `forest-mid #2C4A3D`,
`forest-deep #142821`, `woods-bg #1B3329`, `woods-ink #E9DFC8`, `ink-strong #3B2F2F`.
Reconcile, don't duplicate: concept's terracotta-ink → existing `primary-700 #8f441c`;
concept's plate → existing `cream #FDF8F3`. Verify: build green, zero rendered diff.

**S1 — kill-list (dead weight).** Delete dormant `cro/countdown-timer.tsx` (never mounted);
remove welcome/exit popup mounts (`layout.tsx:140-141` at time of review — re-locate first);
remove dead discount input (`cart-drawer.tsx:63` throws "coming soon"). Review sign-in wall
stays until S5 (storage first). Verify: e2e green, popups gone on preview.

**S2 — journal chrome.** Market ribbon bound to `data/events.json` (upcoming → date; none →
"next market posts here first" empty state — NEVER hand-typed dates; James supplies real
schedule as data); header/footer catalog-label styling; mobile: bottom-nav tap targets ≥48px
(concept uses 52px), Search in header at all widths + first in drawer, Booth tab. Maps onto
existing `mobile-bottom-nav.tsx`, `find-us-in-the-wild.tsx` promoted. Verify: playwright
390×844 tap-target measure via getBoundingClientRect, e2e green.

**S3 — entry model (the core).** Shopify metafields `entry_no`, `technique`, `maker`,
`gathered` (+ edition type); PLP entry cards (№, technique-first title, materials italic,
borderless plates); PDP provenance block above CTA; one-of-one PDPs show fixed facts
("Size — M, the only one"), NO pickers; small-run PDPs keep variant chips + "returns to the
field"; one-of-one sold state = "Sold — one of one", never restock language.
Entry-№ governance (enforce by convention, Shopify has no uniqueness): single counter, never
renumber, gaps fine; numbering starts honest (store has 2 products) or backfills from IG
archive (235 posts since 2021) — James picks at slice start. Requires the lib/shopify.ts
exception or helper (see constraints). Verify: e2e green incl. zero-metafield fallback
(products without entry_no must render sanely — catalog is 2 seed products today, SHOP-01
real inventory still pending).

**S4 — homepage.** Journal-spread hero (photo brief in concept), catalog strip, field-log
market section, Inner Circle signup, editorial plates. **Deep Woods band is JAMES-GATED:**
lifetime-repair policy must be adopted + published on `/shipping-returns` BEFORE the band
ships; if not adopted yet, ship homepage without the band. Verify: e2e, contrast gate,
mobile playwright.

**S5 — reviews.** JAMES DECISION FIRST: storage = Judge.me (per research) vs KV/Postgres.
Today's `data/reviews.json` fs-store is ephemeral on Vercel — do NOT build on it. Then:
email verification + rate limiting + honest zero-state ("no account needed"), drop the
UI-only wall (`review-form.tsx:25`), fix server auto-approve. Effort L. Verify: submit flow
e2e, abuse-path checks (unverified/ratelimited rejected).

**S6 — cart.** Restyle `cart-drawer.tsx` to plate language + forest backdrop AND design the
open-drawer state (line items with entry №s, no discount input, $75 free-shipping bar) —
this closes the codex P1 deliberately deferred from the concept phase. Verify: PR #41-style
real flow add→open drawer→remove at 390px, e2e green.

**S7 — contrast sweep.** Sitewide pass incl. the known residue: ink-faint-style muted text
≈3.3:1 on parchment (concept + current site both). All meta text to AA or to large-text
sizes. Verify: contrast gate strict, print every changed pair's ratio in the PR.

## James gates (ask, don't assume)

1. lib/shopify.ts sanctioned exception vs separate helper (S3).
2. Entry-№ start: honest-low vs IG backfill (S3).
3. Lifetime-repair policy adoption + /shipping-returns copy (S4 band).
4. Review storage choice (S5).
5. Real market schedule data (S2 — data entry, not code).
6. SHOP-01 real inventory (launch gate, not a code slice).

## Success criteria (program level)

Live site presents as the field journal per concept; funnel intact (e2e 33/33); no
fabricated content anywhere; contrast gates pass strict; every James gate explicitly
resolved in a PR description, never silently assumed.
