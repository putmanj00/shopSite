#!/usr/bin/env node
// select-fixable.mjs — Phase 2 gate decision for the Codex autofixer.
//
// Reads the adjudicated findings (Phase-1 reuse: gather + adjudicate run first)
// and the durable round-state, then decides whether the write job may proceed
// and which findings it may act on.
//
// Requirement 5 (explicit terminal states) + requirement 4 (round cap + hash
// dedupe) live here as a single PURE `decide()` so the branching is unit-tested
// rather than smeared across YAML `if:` expressions:
//
//   DISABLED            — kill-switch repo var not set to 'true'
//   MISSING_SECRET      — ANTHROPIC_API_KEY absent (can't run the fixer)
//   FORK_PR             — head repo ≠ base repo (never write from fork input)
//   ROUND_CAP           — autofix rounds for this PR already at the cap
//   NO_APPROVED_FINDINGS— nothing new: no FIX verdict that is fresh + un-attempted
//
// A finding is fixable iff: verdict === FIX, not stale (anchored to current
// head), and its hash was not already attempted in a prior round. Hash dedupe is
// what stops a re-firing false positive from thrashing the branch.
//
// Every terminal exits 0 (the workflow posts a sticky status); only an
// unexpected I/O error exits non-zero.
//
// Dependency-free: Node 22 + node: builtins only. `decide()` is exported + tested.

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";

export const TERMINALS = Object.freeze({
  DISABLED: "DISABLED",
  MISSING_SECRET: "MISSING_SECRET",
  FORK_PR: "FORK_PR",
  ROUND_CAP: "ROUND_CAP",
  NO_APPROVED_FINDINGS: "NO_APPROVED_FINDINGS",
});

export const DEFAULT_ROUND_CAP = 2;

// Pure decision core. `state` = { rounds, attempted: string[] }.
export function decide({
  adjudicated = [],
  state = { rounds: 0, attempted: [] },
  enabled,
  hasSecret,
  fork,
  roundCap = DEFAULT_ROUND_CAP,
}) {
  if (!enabled) return { terminal: TERMINALS.DISABLED, fixable: [], round: state.rounds };
  if (!hasSecret) return { terminal: TERMINALS.MISSING_SECRET, fixable: [], round: state.rounds };
  if (fork) return { terminal: TERMINALS.FORK_PR, fixable: [], round: state.rounds };
  if ((state.rounds || 0) >= roundCap)
    return { terminal: TERMINALS.ROUND_CAP, fixable: [], round: state.rounds };

  const attempted = new Set(state.attempted || []);
  const fixable = adjudicated.filter(
    (f) => f.verdict === "FIX" && !f.stale && !attempted.has(f.hash),
  );

  if (fixable.length === 0)
    return { terminal: TERMINALS.NO_APPROVED_FINDINGS, fixable: [], round: state.rounds };

  return { terminal: null, fixable, round: (state.rounds || 0) + 1 };
}

function setOutput(key, value) {
  const out = process.env.GITHUB_OUTPUT;
  if (out) appendFileSync(out, `${key}=${value}\n`);
  else console.log(`[output] ${key}=${value}`);
}

// Coerce a workflow string env ("true"/"false"/"") to bool.
function boolEnv(v) {
  return String(v || "").toLowerCase() === "true";
}

function main() {
  const adjudicated = existsSync("adjudicated.json")
    ? JSON.parse(readFileSync("adjudicated.json", "utf8"))
    : [];
  const state = existsSync("state.json")
    ? JSON.parse(readFileSync("state.json", "utf8"))
    : { rounds: 0, attempted: [] };

  const result = decide({
    adjudicated,
    state,
    enabled: boolEnv(process.env.FIX_ENABLED),
    hasSecret: boolEnv(process.env.HAS_ANTHROPIC_KEY),
    fork: boolEnv(process.env.IS_FORK),
    roundCap: Number(process.env.ROUND_CAP) || DEFAULT_ROUND_CAP,
  });

  writeFileSync(
    "fixable.json",
    JSON.stringify({ round: result.round, findings: result.fixable }, null, 2),
  );
  // Markdown the fixer prompt consumes as the approved finding list (data only).
  writeFileSync(
    "fixable.md",
    result.fixable.length
      ? result.fixable
          .map(
            (f, i) =>
              `${i + 1}. **[${f.severity}]** ${String(f.title || "").slice(0, 200)}\n` +
              `   - location: \`${f.line != null ? `${f.path}:${f.line}` : f.path}\`\n` +
              `   - hash: \`${f.hash}\``,
          )
          .join("\n")
      : "_(none)_",
  );

  setOutput("terminal", result.terminal || "");
  setOutput("proceed", result.terminal ? "false" : "true");
  setOutput("round", String(result.round));
  setOutput("fix_count", String(result.fixable.length));

  const label = result.terminal || `PROCEED (round ${result.round})`;
  console.log(`select-fixable: ${label} — ${result.fixable.length} finding(s) approved`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
