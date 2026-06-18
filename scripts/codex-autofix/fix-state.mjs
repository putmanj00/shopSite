#!/usr/bin/env node
// fix-state.mjs — Phase 2 durable round-state + sticky status for the autofixer.
//
// Requirement 4 (round cap + durable state): the round counter and the set of
// already-attempted finding hashes MUST survive between workflow runs and must
// not be forgeable, or a re-firing false positive thrashes the branch and the
// cap means nothing. State lives in its OWN PR comment (marker below), and is
// trusted ONLY when that comment was authored by `github-actions[bot]` — comment
// authorship can't be forged, so a human (or a PR author) editing the visible
// sticky cannot rewind the counter. An optional HMAC (CODEX_AUTOFIX_STATE_SECRET)
// adds defense-in-depth against another bot-authored comment reusing the marker.
//
// The state JSON is hidden inside an HTML comment so it never renders; the
// human-facing status is a SEPARATE sticky comment.
//
// Subcommands:
//   read      — fetch + verify state, write state.json {rounds, attempted,
//               shas, lastFailure}
//   finalize  — post the sticky status for OUTCOME; if OUTCOME advances state,
//               persist the state comment (round, attempted hashes, pushed SHA,
//               and — on GATE_FAILED only — a scrubbed lastFailure feedback blob)
//
// FEEDBACK LOOP (ADR 0025 B1): a GATE_FAILED round advances the round counter
// (so the cap still bounds total work) but does NOT burn the round's finding
// hashes into `attempted` — the same findings get one informed retry, carrying a
// scrubbed, bounded excerpt of the failing gate output (`lastFailure`) into the
// next fixer prompt. Scope/secret/no-changes/fixed still burn (no retry). The
// gate output is already secret-redacted by the workflow before it reaches here.
//
// Dependency-free: Node 22 + node: builtins. Pure cores exported for unit tests.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHmac } from "node:crypto";

const API = "https://api.github.com";
export const STATE_MARKER = "<!-- codex-autofix:state";
export const STATUS_MARKER = "<!-- codex-autofix:fix-status -->";
export const TRUSTED_AUTHOR = "github-actions[bot]";
const STATE_VERSION = 2;

// Max chars of (already secret-redacted) gate output carried forward as feedback.
// Bounded to respect context-rot limits and keep the hidden state comment small.
export const MAX_FAILURE_SUMMARY = 1500;

// Canonical serialization for signing — key order fixed, sig excluded.
// `lastFailure` is emitted ONLY when present, so a v1 payload (no lastFailure)
// serializes byte-identically to the pre-feedback format and old HMAC-signed
// state comments still verify (back-compat).
function canonical(payload) {
  return JSON.stringify({
    v: payload.v,
    rounds: payload.rounds,
    attempted: payload.attempted,
    shas: payload.shas,
    lastFailure: payload.lastFailure || undefined,
  });
}

function sign(payload, secret) {
  if (!secret) return "";
  return createHmac("sha256", secret).update(canonical(payload)).digest("hex");
}

// Render the hidden, signed state block. Pure.
// `lastFailure` (optional) is a { round, outcome, summary } feedback blob carried
// forward after a GATE_FAILED round; it is omitted entirely when absent so the
// serialized form is byte-identical to the pre-feedback (v1) layout.
export function renderState({ rounds, attempted, shas, lastFailure }, secret = "") {
  const payload = {
    v: STATE_VERSION,
    rounds,
    attempted: [...new Set(attempted)].sort(),
    shas: shas || [],
  };
  if (lastFailure) payload.lastFailure = lastFailure;
  const sig = sign(payload, secret);
  return `${STATE_MARKER}\n${JSON.stringify({ ...payload, sig })}\n-->`;
}

// Parse + verify a candidate state comment. Trust gate is author identity first;
// then shape; then HMAC iff a secret is configured. Any failure ⇒ fresh state
// (rounds 0), which is fail-SAFE for the cap only because a forged LOW-rounds
// block is exactly what authorship-trust blocks (a non-bot author is ignored).
export function parseState(body, authorLogin, secret = "") {
  const fresh = { valid: false, rounds: 0, attempted: [], shas: [], lastFailure: null };
  if (!body || authorLogin !== TRUSTED_AUTHOR) return fresh;
  if (!body.includes(STATE_MARKER)) return fresh;
  const start = body.indexOf(STATE_MARKER) + STATE_MARKER.length;
  const end = body.indexOf("-->", start);
  if (end < 0) return fresh;
  let obj;
  try {
    obj = JSON.parse(body.slice(start, end).trim());
  } catch {
    return fresh;
  }
  if (typeof obj.rounds !== "number" || !Array.isArray(obj.attempted)) return fresh;
  if (secret) {
    // Verify over the SAME canonical shape that was signed. canonical() omits
    // lastFailure when absent, so a v1 block (no lastFailure) still validates.
    const expected = sign(
      {
        v: obj.v,
        rounds: obj.rounds,
        attempted: obj.attempted,
        shas: obj.shas || [],
        lastFailure: obj.lastFailure || undefined,
      },
      secret,
    );
    if (expected !== obj.sig) return { ...fresh }; // tampered / wrong secret
  }
  return {
    valid: true,
    rounds: obj.rounds,
    attempted: obj.attempted,
    shas: obj.shas || [],
    lastFailure: obj.lastFailure || null,
  };
}

// Union of prior + this round's attempted hashes. Pure.
export function mergeAttempted(prior, next) {
  return [...new Set([...(prior || []), ...(next || [])])].sort();
}

// Advancing outcomes that ALSO BURN the round's findings into `attempted` so they
// are never retried. This is STATE_ADVANCING minus GATE_FAILED: a gate failure is
// a legitimate-but-wrong attempt that earns one informed retry (bounded by the
// round cap), whereas a scope/secret violation or a no-op/fix is terminal for
// those findings. Defined below STATE_ADVANCING; see RECORDS_ATTEMPTED.

// Clamp + normalize a (already secret-redacted) gate-failure excerpt for storage.
// Strips CR, trims, and bounds length so the hidden state comment stays small and
// the fed-back context respects context-rot limits.
//
// CRITICAL (cross-review pass 3): this summary is the FIRST untrusted free-text
// ever persisted inside the `<!-- codex-autofix:state … -->` HTML comment. A
// literal `-->` in the gate output (a tsc/lint snippet, or AI-generated code)
// would terminate the comment early — `parseState` slices at the first `-->`,
// `JSON.parse` throws, state falls back to `rounds:0`, and the ROUND_CAP guard is
// silently defeated (unbounded loop). Neutralize the sequence here, the single
// chokepoint where untrusted text enters the state JSON; inserting a space breaks
// the token without losing readability in the fed-back prompt. Pure.
export function clampFailureSummary(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/-->/g, "-- >")
    .trim()
    .slice(0, MAX_FAILURE_SUMMARY);
}

// Compute the next `attempted` set for a finalize outcome. GATE_FAILED does NOT
// burn (returns prior, normalized); every other recording outcome unions in this
// round's hashes. Pure — the branch the feedback loop hinges on, unit-tested.
export function nextAttempted(outcome, priorAttempted, roundHashes) {
  return RECORDS_ATTEMPTED.has(outcome)
    ? mergeAttempted(priorAttempted, roundHashes)
    : mergeAttempted(priorAttempted, []);
}

const STATUS_COPY = {
  DISABLED: ["⚪", "Autofixer disabled", "Set repo variable `CODEX_AUTOFIX_FIX_ENABLED=true` to enable the gated auto-fixer."],
  MISSING_SECRET: ["⚪", "Autofixer not configured", "Secret `ANTHROPIC_API_KEY` is not set — the fixer cannot run. Triage (Phase 1) is unaffected."],
  FORK_PR: ["🛑", "Fork PR — autofix refused", "Auto-fix never runs against a fork's head. Apply fixes from a same-repo branch."],
  NOT_AUTHORIZED: ["🛑", "Not authorized", "`/codex-fix` requires write access to this repository. Ask a maintainer to run it."],
  ROUND_CAP: ["🛑", "Round cap reached", "This PR hit the autofix round cap. Remaining findings need a human — see the triage summary."],
  NO_APPROVED_FINDINGS: ["✅", "Nothing to auto-fix", "No fresh, un-attempted FIX-verdict findings. (Stale or already-attempted findings are skipped.)"],
  SCOPE_VIOLATION: ["🛑", "Scope fence tripped — reset", "The fixer touched files outside the PR's changed set or a do-not-touch path. All edits were reverted; nothing pushed."],
  GATE_FAILED: ["🛑", "Gate failed — reset", "Fixes did not pass lint / typecheck / build / slop. All edits were reverted; nothing pushed. The failure detail is carried into the next `/codex-fix` round (within the round cap) so the retry can correct it."],
  SECRET_FOUND: ["🛑", "Secret detected — reset", "gitleaks flagged a potential secret in the staged fix. Nothing was committed or pushed."],
  STALE_HEAD: ["⚪", "Branch moved — not pushed", "The PR branch advanced while the fix was being prepared, so it was not pushed (no clobber). Re-run `/codex-fix` to retry against the new head."],
  INFRA_ERROR: ["⚠️", "Infrastructure error — not pushed", "A step failed for an infrastructure reason (e.g. tooling install, token mint, or a rejected push) rather than the fix itself. Nothing was pushed and the round was NOT consumed — re-run `/codex-fix` to retry."],
  NO_CHANGES: ["⚪", "Fixer made no edits", "The fixer reviewed the approved findings but produced no change. They're recorded as attempted so they won't be retried."],
  FIXED: ["🟢", "Auto-fix pushed", "Approved findings were fixed, passed the local gate, and pushed. CI must go green on the new commit before merge."],
};

// Outcomes that advance the durable round-state (record attempted hashes +
// round++). ANY outcome where the fixer actually RAN against these findings
// advances — including scope/gate/secret failures — so a finding that can't be
// fixed cleanly is recorded as attempted and not retried forever via repeated
// `/codex-fix`. Pre-fixer terminals (DISABLED/MISSING_SECRET/FORK_PR/
// NOT_AUTHORIZED/ROUND_CAP/NO_APPROVED_FINDINGS) and the STALE_HEAD infra race
// (the fix was valid; only the push was blocked) do NOT advance.
export const STATE_ADVANCING = new Set([
  "FIXED",
  "NO_CHANGES",
  "SCOPE_VIOLATION",
  "GATE_FAILED",
  "SECRET_FOUND",
]);

// Advancing outcomes that also BURN this round's finding hashes into `attempted`
// (never retried). = STATE_ADVANCING minus GATE_FAILED. A gate failure advances
// the round (cap still bounds total work to ROUND_CAP) but leaves the findings
// un-burned for ONE informed retry carrying the lastFailure feedback; a scope or
// secret violation, a clean no-op, or a successful fix is terminal for those
// findings. nextAttempted() reads this set.
export const RECORDS_ATTEMPTED = new Set([
  "FIXED",
  "NO_CHANGES",
  "SCOPE_VIOLATION",
  "SECRET_FOUND",
]);

// Render the human-facing sticky status body. Pure.
export function renderStatus(outcome, { repo, prNumber, round, roundCap, headSha, fixCount, pushedSha, ciNote } = {}) {
  const [emoji, title, blurb] = STATUS_COPY[outcome] || ["⚠️", outcome, ""];
  const lines = [
    STATUS_MARKER,
    `### ${emoji} Codex Autofix — Phase 2 (auto-fix)`,
    "",
    `**${title}.** ${blurb}`,
    "",
  ];
  if (headSha) lines.push(`Ran against PR head \`${String(headSha).slice(0, 10)}\`.`);
  if (round != null && roundCap != null) lines.push(`Round **${round}/${roundCap}**.`);
  if (fixCount != null) lines.push(`Findings acted on: **${fixCount}**.`);
  if (pushedSha) lines.push(`Pushed commit \`${String(pushedSha).slice(0, 10)}\`.`);
  if (ciNote) lines.push("", `> ${ciNote}`);
  lines.push(
    "",
    `<sub>Posted by \`codex-autofix-fix.yml\` · ${repo || ""}${prNumber ? `#${prNumber}` : ""} · merge stays manual.</sub>`,
  );
  return lines.join("\n");
}

// ---- GitHub I/O (thin) -----------------------------------------------------

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const secret = process.env.CODEX_AUTOFIX_STATE_SECRET || "";

async function gh(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "codex-autofix-fix",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${t.slice(0, 200)}`);
  }
  return res;
}

async function findComment(owner, name, predicate) {
  let next = `/repos/${owner}/${name}/issues/${prNumber}/comments?per_page=100`;
  while (next) {
    const res = await gh(next);
    const arr = await res.json();
    const hit = arr.find(predicate);
    if (hit) return hit;
    const link = res.headers.get("link") || "";
    const m = link.match(/<([^>]+)>;\s*rel="next"/);
    next = m ? m[1].replace(API, "") : null;
  }
  return null;
}

async function upsert(owner, name, marker, body) {
  const existing = await findComment(
    owner,
    name,
    (c) => c.user?.login === TRUSTED_AUTHOR && (c.body || "").includes(marker),
  );
  if (existing) {
    await gh(`/repos/${owner}/${name}/issues/comments/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    });
    return existing.id;
  }
  const res = await gh(`/repos/${owner}/${name}/issues/${prNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return (await res.json()).id;
}

async function cmdRead() {
  const [owner, name] = repo.split("/");
  const comment = await findComment(
    owner,
    name,
    (c) => c.user?.login === TRUSTED_AUTHOR && (c.body || "").includes(STATE_MARKER),
  );
  const state = parseState(comment?.body || "", comment?.user?.login || "", secret);
  writeFileSync(
    "state.json",
    JSON.stringify(
      { rounds: state.rounds, attempted: state.attempted, shas: state.shas, lastFailure: state.lastFailure },
      null,
      2,
    ),
  );
  console.log(
    `fix-state read: rounds=${state.rounds} attempted=${state.attempted.length} valid=${state.valid} priorGateFail=${state.lastFailure ? "yes" : "no"}`,
  );
}

async function cmdFinalize() {
  const [owner, name] = repo.split("/");
  const outcome = process.env.OUTCOME;
  if (!outcome) {
    console.error("fix-state finalize: missing OUTCOME");
    process.exit(1);
  }
  const meta = {
    repo,
    prNumber,
    headSha: process.env.HEAD_SHA,
    round: process.env.ROUND ? Number(process.env.ROUND) : null,
    roundCap: Number(process.env.ROUND_CAP) || 2,
    fixCount: process.env.FIX_COUNT != null ? Number(process.env.FIX_COUNT) : null,
    pushedSha: process.env.PUSHED_SHA || "",
    ciNote: process.env.CI_NOTE || "",
  };

  await upsert(owner, name, STATUS_MARKER, renderStatus(outcome, meta));

  if (STATE_ADVANCING.has(outcome)) {
    const prior = existsSync("state.json")
      ? JSON.parse(readFileSync("state.json", "utf8"))
      : { attempted: [], shas: [] };
    const fixable = existsSync("fixable.json")
      ? JSON.parse(readFileSync("fixable.json", "utf8"))
      : { findings: [] };
    // GATE_FAILED does NOT burn this round's findings (one informed retry);
    // every other advancing outcome unions them into `attempted`.
    const attempted = nextAttempted(
      outcome,
      prior.attempted,
      (fixable.findings || []).map((f) => f.hash),
    );
    const shas = mergeAttempted(prior.shas, meta.pushedSha ? [meta.pushedSha] : []);
    // Carry a scrubbed, bounded gate-failure excerpt forward ONLY on GATE_FAILED;
    // any other advancing outcome clears stale feedback. The workflow already
    // secret-redacts the file; clampFailureSummary bounds it.
    let lastFailure = null;
    if (outcome === "GATE_FAILED") {
      const file = process.env.GATE_FAILURE_FILE || "";
      const raw = file && existsSync(file) ? readFileSync(file, "utf8") : "";
      const summary = clampFailureSummary(raw);
      if (summary) lastFailure = { round: meta.round, outcome, summary };
    }
    const body = renderState({ rounds: meta.round, attempted, shas, lastFailure }, secret);
    await upsert(owner, name, STATE_MARKER, body);
    console.log(
      `fix-state finalize: ${outcome} round=${meta.round} attempted=${attempted.length} feedback=${lastFailure ? "yes" : "no"}`,
    );
  } else {
    console.log(`fix-state finalize: ${outcome} (status posted, state unchanged)`);
  }
}

async function main() {
  if (!token || !repo || !prNumber) {
    console.error("fix-state: missing GITHUB_TOKEN/REPOSITORY/PR_NUMBER");
    process.exit(1);
  }
  const sub = process.argv[2];
  if (sub === "read") return cmdRead();
  if (sub === "finalize") return cmdFinalize();
  console.error(`fix-state: unknown subcommand '${sub}' (expected read|finalize)`);
  process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`fix-state failed: ${err.message}`);
    process.exit(1);
  });
}
