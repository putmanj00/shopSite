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
//   read      — fetch + verify state, write state.json {rounds, attempted}
//   finalize  — post the sticky status for OUTCOME; if OUTCOME=FIXED, advance +
//               persist the state comment (round, attempted hashes, pushed SHA)
//
// Dependency-free: Node 22 + node: builtins. Pure cores exported for unit tests.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHmac } from "node:crypto";

const API = "https://api.github.com";
export const STATE_MARKER = "<!-- codex-autofix:state";
export const STATUS_MARKER = "<!-- codex-autofix:fix-status -->";
export const TRUSTED_AUTHOR = "github-actions[bot]";
const STATE_VERSION = 1;

// Canonical serialization for signing — key order fixed, sig excluded.
function canonical(payload) {
  return JSON.stringify({
    v: payload.v,
    rounds: payload.rounds,
    attempted: payload.attempted,
    shas: payload.shas,
  });
}

function sign(payload, secret) {
  if (!secret) return "";
  return createHmac("sha256", secret).update(canonical(payload)).digest("hex");
}

// Render the hidden, signed state block. Pure.
export function renderState({ rounds, attempted, shas }, secret = "") {
  const payload = {
    v: STATE_VERSION,
    rounds,
    attempted: [...new Set(attempted)].sort(),
    shas: shas || [],
  };
  const sig = sign(payload, secret);
  return `${STATE_MARKER}\n${JSON.stringify({ ...payload, sig })}\n-->`;
}

// Parse + verify a candidate state comment. Trust gate is author identity first;
// then shape; then HMAC iff a secret is configured. Any failure ⇒ fresh state
// (rounds 0), which is fail-SAFE for the cap only because a forged LOW-rounds
// block is exactly what authorship-trust blocks (a non-bot author is ignored).
export function parseState(body, authorLogin, secret = "") {
  const fresh = { valid: false, rounds: 0, attempted: [], shas: [] };
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
    const expected = sign(
      { v: obj.v, rounds: obj.rounds, attempted: obj.attempted, shas: obj.shas || [] },
      secret,
    );
    if (expected !== obj.sig) return { ...fresh }; // tampered / wrong secret
  }
  return {
    valid: true,
    rounds: obj.rounds,
    attempted: obj.attempted,
    shas: obj.shas || [],
  };
}

// Union of prior + this round's attempted hashes. Pure.
export function mergeAttempted(prior, next) {
  return [...new Set([...(prior || []), ...(next || [])])].sort();
}

const STATUS_COPY = {
  DISABLED: ["⚪", "Autofixer disabled", "Set repo variable `CODEX_AUTOFIX_FIX_ENABLED=true` to enable the gated auto-fixer."],
  MISSING_SECRET: ["⚪", "Autofixer not configured", "Secret `ANTHROPIC_API_KEY` is not set — the fixer cannot run. Triage (Phase 1) is unaffected."],
  FORK_PR: ["🛑", "Fork PR — autofix refused", "Auto-fix never runs against a fork's head. Apply fixes from a same-repo branch."],
  NOT_AUTHORIZED: ["🛑", "Not authorized", "`/codex-fix` requires write access to this repository. Ask a maintainer to run it."],
  ROUND_CAP: ["🛑", "Round cap reached", "This PR hit the autofix round cap. Remaining findings need a human — see the triage summary."],
  NO_APPROVED_FINDINGS: ["✅", "Nothing to auto-fix", "No fresh, un-attempted FIX-verdict findings. (Stale or already-attempted findings are skipped.)"],
  SCOPE_VIOLATION: ["🛑", "Scope fence tripped — reset", "The fixer touched files outside the PR's changed set or a do-not-touch path. All edits were reverted; nothing pushed."],
  GATE_FAILED: ["🛑", "Gate failed — reset", "Fixes did not pass lint / typecheck / build / slop. All edits were reverted; nothing pushed."],
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
  writeFileSync("state.json", JSON.stringify({ rounds: state.rounds, attempted: state.attempted, shas: state.shas }, null, 2));
  console.log(`fix-state read: rounds=${state.rounds} attempted=${state.attempted.length} valid=${state.valid}`);
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
    const attempted = mergeAttempted(
      prior.attempted,
      (fixable.findings || []).map((f) => f.hash),
    );
    const shas = mergeAttempted(prior.shas, meta.pushedSha ? [meta.pushedSha] : []);
    const body = renderState({ rounds: meta.round, attempted, shas }, secret);
    await upsert(owner, name, STATE_MARKER, body);
    console.log(`fix-state finalize: ${outcome} round=${meta.round} attempted=${attempted.length}`);
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
