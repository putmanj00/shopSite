#!/usr/bin/env bash
# Wildenflower slop-detector — deterministic verification gate.
#
# Run from anywhere:  bash .claude/skills/slop-detector/check.sh
#
# FAIL tier = unambiguous AGENTS.md bans. Any hit -> exit 1.
# WARN tier = judgment tells a regex can over-match. Reported, never fails.
#
# Patterns are RATIFIED only. Add a new one via the "Candidate patterns" flow in
# SKILL.md after James confirms it — never append to the arrays silently. The
# confirmation is the validation gate (mirrors hermes skill_eval_gate discipline).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT" || { echo "cannot cd to repo root from $0"; exit 2; }

DIRS="app components lib content"
EXC="--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=_archive --exclude-dir=test-results --exclude-dir=coverage"

# Scan targets. With NO args, scan the whole tree ($DIRS) — the default for
# local runs and the hermes parity mirror. With path args, scan only those
# (the CI merge-gate passes the PR's changed in-scope files). FAIL_RULES /
# WARN_RULES are identical either way; args only narrow WHAT is scanned, not the
# patterns, so this stays within the ratified-pattern flow.
# Touched-file ratchet: a passed file must be fully slop-clean, so editing a
# file that still carries pre-existing residue surfaces it. That is intended —
# it cleans residue at the point it is next touched, never blocking PRs that
# leave dirty files alone. See SKILL.md "CI merge-gate".
if [ "$#" -gt 0 ]; then
  TARGETS=("$@")
  SCAN_LABEL="$# changed file(s)"
else
  read -r -a TARGETS <<< "$DIRS"
  SCAN_LABEL="$DIRS"
fi

# Each rule is  "label|extended-regex".  Split on the FIRST '|' only, so the
# regex itself may contain alternation.
# Purple/violet hexes: the full Tailwind violet+purple ramps, not just #7C3AED.
# Ratified finite set (Tailwind palette) — grep can't compute hue, so we enumerate.
# -i is on, so case folds. Catches the #5B21B6 / #a855f7 residue the single-hex
# rule was silently missing (Codex review 2026-06-15, HIGH).
FAIL_RULES=(
  "purple/violet hex (Tailwind ramp + #7C3AED)|#7C3AED|#5B21B6|#6D28D9|#8B5CF6|#A78BFA|#C4B5FD|#A855F7|#9333EA|#7E22CE|#6B21A8|#581C87|#C084FC|#D8B4FE|#DDD6FE|#EDE9FE"
  "purple/violet tailwind class|\\b(bg|text|border|from|via|to|ring|fill|stroke|decoration)-(purple|violet)-[0-9]"
  "banned blue-600|\\bblue-600\\b"
  "rejected font Playfair|playfair"
  "wrong-brand domain/email residue|artisancollective\\.com|@artisancollective"
  "generic dropship voice|Discover Your Perfect|delivered to your door|premium products,? delivered"
)

WARN_RULES=(
  # Bare old brand name — WARN not FAIL: lib/product-filters.ts legitimately maps
  # "Artisan Collective" -> "Wildenflower". Human confirms map vs rendered residue.
  "old brand name (legit in rename map; residue elsewhere)|Artisan Collective"
  "avoid-lane voice (other shops own these)|\\b(boho|trippy|cosmic|groovy|wunderkammer|festival brand|seekers)\\b"
  "occult/metaphysical framing|\\b(metaphysical|chakra|crystal healing|healing (energ|propert)|spiritual cleans|cleanse your)\\b"
  "cabinet-of-curiosities lane|cabinet of curiosit"
  "fabricated stat|[0-9][0-9,]*\\+ *(artisan|customer|maker|review|happy|sold)|[0-9]{2,}% *(recommend|satisfied|happy)"
  # Curated set, NOT exhaustive (grep -E has no unicode class). Judgment checklist
  # item 8 is the backstop for emoji this list misses.
  "emoji decoration|✨|🎁|🚚|🌟|💫|🔥|🛍|🌈|🙌|📖|💝|🎈|🎂|🎉|📦|❤|💌|🌸|🪻|🌿|🍄"
  "generic CTA verb|\\b(Unlock|Elevate|Supercharge|Transform) [Yy]our\\b"
)

# Drop known-OK self-references (the AGENTS comment that says "NOT Playfair", etc.)
filt() { grep -viE 'NOT Playfair|slop-detector'; }

run_rule() {
  local label="${1%%|*}" pat="${1#*|}" hits
  hits=$(grep -rniE $EXC "$pat" "${TARGETS[@]}" 2>/dev/null | filt)
  [ -z "$hits" ] && return 0
  echo "  -- $label"
  printf '%s\n' "$hits" | sed 's/^/     /'
  echo
  return 1
}

echo "Wildenflower slop-detector — scanning: $SCAN_LABEL"
echo

fails=0
echo "FAIL tier (brand bans):"
for r in "${FAIL_RULES[@]}"; do run_rule "$r" || fails=$((fails+1)); done
[ "$fails" -eq 0 ] && echo "  clean ✓"
echo

warns=0
echo "WARN tier (review by hand):"
for r in "${WARN_RULES[@]}"; do run_rule "$r" || warns=$((warns+1)); done
[ "$warns" -eq 0 ] && echo "  clean ✓"
echo

echo "summary: $fails fail-rule(s) hit, $warns warn-rule(s) hit"
if [ "$fails" -gt 0 ]; then
  echo "GATE: FAIL"
  exit 1
fi
echo "GATE: PASS (warns are advisory)"
exit 0
