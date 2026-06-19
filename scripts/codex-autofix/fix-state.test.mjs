// node:test unit tests for fix-state pure cores. Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  renderState,
  parseState,
  mergeAttempted,
  nextAttempted,
  clampFailureSummary,
  renderStatus,
  STATE_ADVANCING,
  RECORDS_ATTEMPTED,
  MAX_FAILURE_SUMMARY,
  TRUSTED_AUTHOR,
  STATE_MARKER,
  STATUS_MARKER,
} from "./fix-state.mjs";

test("round-trip: render then parse recovers rounds + attempted", () => {
  const body = renderState({ rounds: 2, attempted: ["b", "a"], shas: ["sha1"] });
  const s = parseState(body, TRUSTED_AUTHOR);
  assert.equal(s.valid, true);
  assert.equal(s.rounds, 2);
  assert.deepEqual(s.attempted, ["a", "b"]); // sorted, deduped
  assert.deepEqual(s.shas, ["sha1"]);
});

test("state is hidden inside an HTML comment (does not render)", () => {
  const body = renderState({ rounds: 1, attempted: ["a"], shas: [] });
  assert.ok(body.startsWith(STATE_MARKER));
  assert.ok(body.trimEnd().endsWith("-->"));
});

test("TRUST ANCHOR: a non-bot author is never trusted (anti-forgery)", () => {
  const body = renderState({ rounds: 5, attempted: ["a"], shas: [] });
  // Same bytes, but authored by a human / PR author → ignored, treated as fresh.
  const s = parseState(body, "putmanj00");
  assert.equal(s.valid, false);
  assert.equal(s.rounds, 0);
  assert.deepEqual(s.attempted, []);
});

test("a forged LOW-rounds block from a non-bot cannot rewind the cap", () => {
  // Attacker pastes rounds:0 to bypass the cap; authorship gate discards it.
  const forged = `${STATE_MARKER}\n${JSON.stringify({ v: 1, rounds: 0, attempted: [], shas: [], sig: "" })}\n-->`;
  const s = parseState(forged, "random-user");
  assert.equal(s.valid, false);
  assert.equal(s.rounds, 0); // falls back to fresh; real bot-authored state elsewhere wins
});

test("HMAC: tampering with rounds under a configured secret is rejected", () => {
  const secret = "s3cr3t";
  const good = renderState({ rounds: 2, attempted: ["a"], shas: [] }, secret);
  assert.equal(parseState(good, TRUSTED_AUTHOR, secret).valid, true);

  // Flip rounds 2 -> 0 inside the JSON but keep the old sig.
  const tampered = good.replace('"rounds":2', '"rounds":0');
  const s = parseState(tampered, TRUSTED_AUTHOR, secret);
  assert.equal(s.valid, false);
  assert.equal(s.rounds, 0);
});

test("HMAC: correct secret + bot author validates", () => {
  const secret = "s3cr3t";
  const body = renderState({ rounds: 1, attempted: ["h"], shas: ["x"] }, secret);
  assert.equal(parseState(body, TRUSTED_AUTHOR, secret).valid, true);
});

test("malformed / missing block → fresh state, no throw", () => {
  assert.equal(parseState("", TRUSTED_AUTHOR).rounds, 0);
  assert.equal(parseState("no marker here", TRUSTED_AUTHOR).valid, false);
  assert.equal(parseState(`${STATE_MARKER}\n{not json\n-->`, TRUSTED_AUTHOR).valid, false);
});

test("mergeAttempted unions, dedupes, sorts", () => {
  assert.deepEqual(mergeAttempted(["b", "a"], ["a", "c"]), ["a", "b", "c"]);
  assert.deepEqual(mergeAttempted(null, ["x"]), ["x"]);
  assert.deepEqual(mergeAttempted(["x"], null), ["x"]);
});

test("renderStatus: every terminal + outcome has copy and the sticky marker", () => {
  for (const o of [
    "DISABLED",
    "MISSING_SECRET",
    "FORK_PR",
    "NOT_AUTHORIZED",
    "ROUND_CAP",
    "NO_APPROVED_FINDINGS",
    "SCOPE_VIOLATION",
    "GATE_FAILED",
    "SECRET_FOUND",
    "STALE_HEAD",
    "INFRA_ERROR",
    "NO_CHANGES",
    "FIXED",
  ]) {
    const body = renderStatus(o, { repo: "putmanj00/shopSite", prNumber: 7 });
    assert.ok(body.includes(STATUS_MARKER), `${o} missing marker`);
    assert.ok(body.includes("putmanj00/shopSite#7"), `${o} missing repo ref`);
    assert.ok(!body.includes("undefined"), `${o} leaked undefined`);
  }
});

test("STATE_ADVANCING: post-fixer attempts advance; pre-fixer terminals + stale race do not", () => {
  // The fixer actually ran against the findings ⇒ record + round++ (anti-retry).
  for (const o of ["FIXED", "NO_CHANGES", "SCOPE_VIOLATION", "GATE_FAILED", "SECRET_FOUND"]) {
    assert.ok(STATE_ADVANCING.has(o), `${o} should advance the round`);
  }
  // Never reached the fixer (or the fix was valid but the push raced) ⇒ no advance.
  for (const o of [
    "DISABLED",
    "MISSING_SECRET",
    "FORK_PR",
    "NOT_AUTHORIZED",
    "ROUND_CAP",
    "NO_APPROVED_FINDINGS",
    "STALE_HEAD",
    "INFRA_ERROR",
  ]) {
    assert.ok(!STATE_ADVANCING.has(o), `${o} should NOT advance the round`);
  }
});

// ---- B1 feedback loop: lastFailure + no-burn on GATE_FAILED -----------------

test("lastFailure round-trips and is covered by the signature", () => {
  const secret = "s3cr3t";
  const lf = { round: 1, outcome: "GATE_FAILED", summary: "typecheck failed at price.tsx:12" };
  const body = renderState({ rounds: 1, attempted: ["a"], shas: [], lastFailure: lf }, secret);
  const s = parseState(body, TRUSTED_AUTHOR, secret);
  assert.equal(s.valid, true);
  assert.deepEqual(s.lastFailure, lf);
  // Tampering the carried summary while keeping the old sig must be rejected.
  const tampered = body.replace("price.tsx", "evil.tsx");
  assert.equal(parseState(tampered, TRUSTED_AUTHOR, secret).valid, false);
});

test("no prior failure → lastFailure is null and the key is omitted from the block", () => {
  const body = renderState({ rounds: 1, attempted: ["a"], shas: [] });
  assert.ok(!body.includes("lastFailure"), "absent lastFailure must not serialize");
  assert.equal(parseState(body, TRUSTED_AUTHOR).lastFailure, null);
});

test("back-compat: a v1 HMAC-signed block (no lastFailure) still validates", () => {
  // Reproduce exactly what the pre-feedback (v1) code would have written: the sig
  // is computed over a canonical form that omits lastFailure. The new parser must
  // still accept it, or every in-flight PR's state comment would reset.
  const secret = "s3cr3t";
  const payload = { v: 1, rounds: 1, attempted: ["a"], shas: ["x"] };
  const canonical = JSON.stringify({
    v: 1,
    rounds: 1,
    attempted: ["a"],
    shas: ["x"],
    lastFailure: undefined,
  });
  const sig = createHmac("sha256", secret).update(canonical).digest("hex");
  const body = `${STATE_MARKER}\n${JSON.stringify({ ...payload, sig })}\n-->`;
  const s = parseState(body, TRUSTED_AUTHOR, secret);
  assert.equal(s.valid, true);
  assert.equal(s.rounds, 1);
  assert.equal(s.lastFailure, null);
});

test("RECORDS_ATTEMPTED burns every advancing outcome EXCEPT GATE_FAILED", () => {
  for (const o of ["FIXED", "NO_CHANGES", "SCOPE_VIOLATION", "SECRET_FOUND"]) {
    assert.ok(RECORDS_ATTEMPTED.has(o), `${o} should burn its findings`);
  }
  assert.ok(!RECORDS_ATTEMPTED.has("GATE_FAILED"), "GATE_FAILED must NOT burn (one informed retry)");
  // Burning is a strict subset of advancing — you can't burn without advancing.
  for (const o of RECORDS_ATTEMPTED) assert.ok(STATE_ADVANCING.has(o), `${o} must also advance`);
});

test("nextAttempted: GATE_FAILED keeps prior (no burn); other outcomes union the round", () => {
  assert.deepEqual(nextAttempted("GATE_FAILED", ["a"], ["b", "c"]), ["a"]);
  assert.deepEqual(nextAttempted("FIXED", ["a"], ["b"]), ["a", "b"]);
  assert.deepEqual(nextAttempted("SCOPE_VIOLATION", [], ["x"]), ["x"]);
  // Even the no-burn path normalizes (dedupe + sort) for stable round-trips.
  assert.deepEqual(nextAttempted("GATE_FAILED", ["b", "a", "a"], []), ["a", "b"]);
});

test("clampFailureSummary strips CR, trims, and bounds to MAX_FAILURE_SUMMARY", () => {
  assert.equal(clampFailureSummary("  hi\r\nthere  "), "hi\nthere");
  assert.equal(clampFailureSummary("Z".repeat(5000)).length, MAX_FAILURE_SUMMARY);
  assert.equal(clampFailureSummary(null), "");
  assert.equal(clampFailureSummary(undefined), "");
});

test("clampFailureSummary neutralizes the HTML-comment terminator (no '-->')", () => {
  assert.ok(!clampFailureSummary("oops a-->b in code").includes("-->"));
  assert.ok(!clampFailureSummary("--->").includes("-->"));
  assert.ok(!clampFailureSummary("a---->b").includes("-->"));
});

test("a '-->' in gate output cannot break the state comment / reset the round cap", () => {
  // Cross-review pass 3 HIGH: an un-neutralized terminator would slice the JSON
  // early in parseState → JSON.parse throws → fresh state (rounds 0) → cap defeat.
  const secret = "s3cr3t";
  const summary = clampFailureSummary("tsc error near `<div -->` snippet");
  const lf = { round: 2, outcome: "GATE_FAILED", summary };
  const body = renderState({ rounds: 2, attempted: ["h"], shas: [], lastFailure: lf }, secret);
  const s = parseState(body, TRUSTED_AUTHOR, secret);
  assert.equal(s.valid, true, "state must still parse with a terminator-bearing summary");
  assert.equal(s.rounds, 2, "round counter must NOT reset (cap intact)");
  assert.equal(s.lastFailure.summary, summary);
});

test("renderStatus FIXED surfaces pushed SHA + CI note", () => {
  const body = renderStatus("FIXED", {
    repo: "r",
    prNumber: 1,
    round: 1,
    roundCap: 2,
    fixCount: 3,
    pushedSha: "deadbeefcafe",
    ciNote: "CI re-triggered via app token.",
  });
  assert.ok(body.includes("deadbeef"));
  assert.ok(body.includes("Round **1/2**"));
  assert.ok(body.includes("acted on: **3**"));
  assert.ok(body.includes("CI re-triggered"));
});
