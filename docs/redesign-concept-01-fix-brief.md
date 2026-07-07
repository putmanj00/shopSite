# Fix Brief — Wildenflower Redesign Concept 01 → revision 02

Delegated brief (worker cannot ask follow-ups). Produced 2026-07-06 from the adversarial
review of concept 01 (verdict: ADOPT-WITH-CHANGES). Full findings: memory topic
`~/.claude/projects/-home-james/memory/project_wildenflower_frontend.md` (section
"2026-07-06 — Concept 01 adversarial review").

## Objective

Revise the mockup `~/projects/wildenflower/docs/redesign-concept-01.html` in place (it is a
single self-contained HTML file; keep the embedded woff2 fonts and the 4-tab + design-notes
structure) so all 10 review work items are resolved. Deliverable = updated HTML + redeployed
artifact (same URL: https://claude.ai/code/artifact/0fe7fc99-583c-4aed-8941-81dab265be8a).
**Concept revision only — do NOT touch shopSite code.**

## Context to read first (in order)

1. This file.
2. Memory topic above — the review findings (F1–F7 factual, D1–D8 design) with file:line evidence.
3. `~/projects/wildenflower/shopSite/AGENTS.md` — brand guardrails.
4. `~/projects/wildenflower/CONTEXT.md` — glossary; note "specimen label" is an avoid-term.
5. `~/projects/wildenflower/shopSite/data/events.json` — real market schedule (venue = Pike
   Street; all 3 entries are past as of 2026-07-06).

## Work items (ordered; numbers match review)

1. **Contrast pass (blocker).** Gold `#C9A642` as small text on parchment `#F5EDD6` = 1.99:1,
   on cream `#FFFDF5` = 2.29:1; dusty-rose `#D08B7A` on cream = 2.69:1 — all fail AA 4.5:1
   and would break shopSite's `contrast:check` build gate. Add a dark ink-gold token
   (target ≥4.5:1 on BOTH parchment and cream; start near `#7d651f` and validate) and use it
   for ALL text currently gold on light grounds: `.spec-no`, `.clabel--gold`, `.roman`,
   index labels, entry counts. Keep `#C9A642` for rules/borders and for text on forest
   (5.23:1 ✓ — Deep Woods band unchanged). Recolor `.one` (dusty-rose text) to pass. Validate
   every changed pair with a WCAG relative-luminance calc (script it; don't eyeball). Add the
   ink-gold swatch to the System-tab palette with its measured ratios.
2. **Entry model fix (blocker).** Split entries into **one-of-one** vs **small-run**:
   - PDP (currently "one of one" + S/M/L/XL + 2 dye lots = contradiction): make the hoodie a
     one-of-one with FIXED attributes rendered as provenance ("Size M — the only one"; single
     dye lot stated, not selectable). Show variant chips only on a small-run example, or
     state in a design note how small-run PDPs differ.
   - Hero lede "Every piece is entered into the journal once — and never repeated" → soften
     to per-entry truth (e.g. "entered into the journal once; most are never repeated").
   - Reconcile PLP "8 are one-of-one" of 14 — fine once hero stops claiming 100%.
3. **Purge "specimen" vocabulary.** CONTEXT.md avoid-term. Replace in design-note copy
   ("Specimens, priced like craft", "hero specimen", photo briefs) and rename CSS classes
   `.spec/.specimens/.spec-no/.spec-body/.spec-card` → entry/plate terms (`.entry`,
   `.entries`, `.entry-no`, …) so the term can't leak into implementation naming. Grep the
   file for `specimen` after — zero hits.
4. **Real market data.** Replace fabricated schedule (3rd & Court St venue, Findlay July 19,
   Court Days Aug 2–3, "every 2nd Saturday") with entries shaped like `data/events.json`
   (Covington Farmers Market, Pike Street, Covington KY). All real events are past — use
   clearly-labeled placeholder dates (e.g. "«next-market-date»") or the honest empty-state,
   and add a design note stating the section binds to `data/events.json` at build time and
   James supplies the schedule. Same for the ribbon.
5. **Mobile chrome.** Bottomnav links measured 23px tall (bar 41px) — pad to ≥48px tap
   height + `env(safe-area-inset-bottom)`. Add a Search entry point on mobile (bottomnav
   slot or hamburger drawer row — currently header Search is `hide-m` and nothing replaces
   it). Keep the PDP pattern (sticky buy bar instead of bottomnav).
6. **Design the cart.** The funnel's 4th step is missing. Add a cart-drawer overlay rendering
   (open state) to one view or a 5th tab: plate language, entry №s on line items, NO discount
   input (it's dead code — review killed it), free-shipping bar at $75. Modest fidelity fine —
   enough to direct a restyle of `cart-drawer.tsx`.
7. **Reviews honesty.** PDP shows "4.9 · 12 reviews" — fabricated stats (AGENTS.md ban).
   Replace with the true launch zero-state: e.g. "No reviews yet — be the first, no account
   needed." Update the System-tab build-notes row for reviews: current storage is fs-JSON
   (`data/reviews.json`) = ephemeral on Vercel, API already auth-less server-side +
   auto-approves; real scope = storage decision (Judge.me per research, or KV/Postgres) +
   email verify + rate limit; effort M → L.
8. **Build-notes corrections (System tab).** (a) Metafields row: note that product queries
   live in `lib/shopify.ts` = AGENTS.md Do-Not-Touch → needs a sanctioned exception
   (precedent: 2026-06-12 apiVersion bump) or a separate query helper. (b) Add entry-№
   governance note: single counter, no renumbering ever, gaps fine, no uniqueness constraint
   in Shopify so assignment discipline required; numbering starts honest (store has 2
   products) or backfills legitimately from the IG archive (235 posts since 2021).
   (c) Kill-list: countdown timers are NOT mounted on the live site — reword to "delete the
   dormant component" (popups ARE mounted, `layout.tsx:140-141`; discount throw is
   `cart-drawer.tsx:63`).
9. **Lifetime-repair gate.** Keep the promise in the design but mark it in a design note as
   James-gated: policy must be adopted (and appear on /shipping-returns) before the Deep
   Woods band ships. It exists nowhere in the repo today.
10. **Token hygiene.** New derived hexes (`#A34E1E`, `#EDE3C8`, `#142821`, `#2C4A3D`…) — map
    each to the existing `primary-*` scale in `shopSite/app/globals.css` where a close match
    exists (e.g. `#A34E1E` ≈ primary-700 `#8f441c`? verify visually), else document as new
    named tokens in the System-tab palette. Note the `@theme inline` gotcha: it emits no
    :root vars, plain-CSS consumers hardcode.

## Constraints

- Review-sanctioned changes only — no new concept directions, no scope creep.
- File stays fully self-contained (fonts/data-URIs intact); works from `file://`.
- No shopSite code edits. No pushes. shopSite repo is reference-only this session.
- Keep design-note pins accurate — update note copy where items 2/4/7/8/9 change claims.
- Brand guardrails: no purple/blue-600, no boho/festival/occult framing, no fabricated
  stats/testimonials, Cormorant/Lora only.

## Verification (all before declaring done)

1. Contrast script over every changed fg/bg pair — print ratios; all text ≥4.5:1 (large-text
   ≥24px / 18.66px bold may use 3:1 — state which rule each pair passed under).
2. `grep -ci specimen redesign-concept-01.html` → 0.
3. Playwright render 390×844 + 1440×900, all 4 (or 5) tabs: no horizontal scroll from design
   elements (artifact pitchbar chrome exempt), bottomnav link boxes ≥48px tall (measure via
   `getBoundingClientRect`, don't eyeball), sticky buy bar present on mobile PDP, mobile
   search entry reachable.
4. Design-notes toggle still works on all tabs after class renames (pins position via
   `.anno-wrap` — renaming `.spec*` must not break the JS at the file's end).
5. Redeploy artifact to the SAME url (pass `url:` to Artifact tool) + save the HTML back to
   `docs/redesign-concept-01.html` (it IS the snapshot; git-ignore state: docs/ is in the
   business repo `~/projects/wildenflower`, not shopSite).
6. Report per no-silent-shortcuts: list any item skipped/deferred explicitly.

## Report

Update memory topic `project_wildenflower_frontend.md` (append revision-02 block: what
changed per item, measured ratios) + the wildenflower one-liner in
`~/SecondBrain/AI/handoffs/current.md` (keep under the 6000-char file cap). Then James
verdict: adopt → implementation phase (separate session, separate brief).
