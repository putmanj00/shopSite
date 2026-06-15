---
name: slop-detector
description: Run before marking any Wildenflower UI / email / page change "done". Catches AI-slop and brand-ban patterns — purple (#7C3AED / violet classes), blue-600, Playfair, fabricated stats, fake testimonials, off-brand "boho/cosmic/festival" voice, occult/metaphysical crystal copy, emoji decoration, generic dropship CTAs. Two tiers: a deterministic grep gate (check.sh) and a judgment-call checklist for the slop a regex can't see.
---

# Wildenflower slop-detector

The verification gate for **non-deterministic UI work**. There is no test that proves a
page "looks on-brand," so this skill is the stand-in: a fixed catalog of the patterns that
betray generic AI output or violate the field-journal brand, checked the same way every time.

Source of truth for the brand: `AGENTS.md` (chrome rules, avoid-lanes, content rules) and
`../CONTEXT.md` (glossary). The corpus evidence behind these rules:
`../docs/c2-corpus-gap-analysis-2026-06.md` (lives in the wildenflower repo root, one level
above shopSite — not under `shopSite/docs/`). This skill is the *enforcement surface* for those
docs — when they change, the patterns here change to match (via the ratification flow below,
never silently).

## When to use

- Before committing any change to `app/`, `components/`, `lib/`, `content/` that touches
  what a user sees (markup, copy, color, fonts, email templates).
- After an agent generates UI in a loop — run this as the loop's verification gate; do not
  let the agent mark the task done while the FAIL tier is non-empty.
- When reviewing existing pages for brand drift (the email/admin/account templates are known
  to carry pre-overhaul residue — see Baseline below).

## How to run

```bash
bash .claude/skills/slop-detector/check.sh
```

Two tiers:

- **FAIL tier** — unambiguous `AGENTS.md` bans (purple hex, violet/purple Tailwind classes,
  `blue-600`, Playfair, wrong-brand strings, generic-dropship voice). Any hit → exit 1.
  Treat as broken: fix or get explicit sign-off before shipping.
- **WARN tier** — judgment tells a regex can over-match (avoid-lane voice, occult framing,
  fabricated stats, emoji decoration, generic CTA verbs). Reported with `file:line`, never
  auto-fails. A human/agent reads each and decides.

The grep gate only catches what is *literally in the text*. The rest is a read-and-judge pass.

## Judgment checklist (what the regex can't see)

Read the rendered surface (or a screenshot) and check for AI-slop tells that aren't a fixed
string:

1. **Three-feature-card grid** with icon + bold + one gray sentence — the default AI layout.
   Wildenflower surfaces are catalog entries, not SaaS feature blocks.
2. **Centered-everything hero** + huge thin heading + sub + two buttons. Generic. The brand
   hero is a Deep Woods moment with maker voice, not a landing-page template.
3. **Voice drift to dropship**: "premium quality", "elevate your space", "perfect for any
   occasion", "shop the collection". The voice is a *maker telling how it was made by hand*.
4. **Crystal copy slips metaphysical** (energy / chakra / healing / cleanse) — banned lane.
   Describe color, light, formation, provenance only.
5. **Tie-dye framed as counterculture** ("trippy", "festival", "groovy") instead of craft.
6. **Two loud surfaces fighting** — saturated product photo on a non-parchment, non-forest
   ground. Register must be exactly one of Open Field (parchment) or Deep Woods (forest).
7. **Fabricated trust signals** — testimonials, stock headshots, "2,500+ customers",
   "98% recommend". Content rule: none of these exist.
8. **Emoji as decoration** in headings/body/email (✨🎁🚚). Off-brand; the brand's marks are
   the line-art poppy and `BotanicalDivider`, not emoji.
9. **Default body color** `text-gray-500` / zinc neutrals instead of the brand earth tokens
   (inkBrown #5C4033, earth #3B2F2F).

A surface that trips none of FAIL, WARN, or this checklist is the bar for "done".

## Self-improvement — ratified, never silent

The temptation (see the AI LABS "loop engineering" video) is to have the skill **rewrite
itself** every time it misses a pattern. We do **not** do that. A skill that auto-edits on its
own observation has no held-out check — frequency of a tell is not evidence it's a real tell,
and silent edits drift with no way to tell improvement from regression. This is the same
discipline as `hermes/agents/skill_eval_gate.py`: a candidate pattern ships only after a human
ratifies it, never on the agent's say-so.

So when you spot a NEW slop pattern not covered here:

1. Append it to **Candidate patterns** below with the date, a `file:line` example, and which
   doc/rule it derives from. Do **not** move it into `check.sh` or the lists above.
2. Surface it to James in the report ("found candidate slop pattern X, not yet ratified").
3. Only after James confirms does it graduate: move to the FAIL/WARN tier and add the regex to
   `check.sh`. That confirmation *is* the validation gate.

**Enforcement (honest limitation):** this is a documented review rule, not a mechanical lock —
nothing physically stops an agent editing `check.sh` directly. So the hard rule for reviewers:
**any diff that touches `FAIL_RULES` or `WARN_RULES` in `check.sh` MUST cite James's ratification
(date + what was approved) in the commit message or PR. A diff that edits those arrays without a
ratification cite is rejected on sight.** Full mechanical enforcement would need a pre-commit hook
that diffs the arrays — out of scope until the skill-eval harness exists.

### Candidate patterns (awaiting ratification)

_None yet. Add as `- YYYY-MM-DD — <pattern> — example file:line — derives from <rule> — [ ] ratified`._

## Baseline (known state, 2026-06-15)

The shipped storefront chrome (homepage, PDP, collection, cart) is clean. The gate currently
**FAILS** on pre-overhaul residue in `components/emails/*`, `app/admin/*`, `app/account/*`:
purple `#7C3AED`, `blue-600`, `artisancollective.com`, emoji decoration. This is the
already-known "emails/admin/account off-brand residue" backlog item, not new breakage. Clearing
it is a sanctioned future pass; until then a FAIL here is expected for those paths.
