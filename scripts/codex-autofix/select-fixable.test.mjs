// node:test unit tests for select-fixable decide() core. Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { decide, TERMINALS, DEFAULT_ROUND_CAP } from "./select-fixable.mjs";

const FIX = (over = {}) => ({
  hash: "h1",
  verdict: "FIX",
  severity: "P1",
  title: "fix me",
  path: "app/page.tsx",
  line: 10,
  stale: false,
  ...over,
});

const base = {
  adjudicated: [FIX()],
  state: { rounds: 0, attempted: [] },
  enabled: true,
  hasSecret: true,
  fork: false,
};

test("happy path: one fresh FIX proceeds, round increments to 1", () => {
  const r = decide(base);
  assert.equal(r.terminal, null);
  assert.equal(r.fixable.length, 1);
  assert.equal(r.round, 1);
});

test("kill-switch off short-circuits before anything else", () => {
  const r = decide({ ...base, enabled: false });
  assert.equal(r.terminal, TERMINALS.DISABLED);
  assert.equal(r.fixable.length, 0);
});

test("missing secret beats fork/findings checks", () => {
  const r = decide({ ...base, hasSecret: false, fork: true });
  assert.equal(r.terminal, TERMINALS.MISSING_SECRET);
});

test("fork PR refused even with valid findings + secret", () => {
  const r = decide({ ...base, fork: true });
  assert.equal(r.terminal, TERMINALS.FORK_PR);
});

test("round cap: rounds already at cap is terminal", () => {
  const r = decide({ ...base, state: { rounds: DEFAULT_ROUND_CAP, attempted: ["x"] } });
  assert.equal(r.terminal, TERMINALS.ROUND_CAP);
});

test("round cap respects a custom lower cap", () => {
  const r = decide({ ...base, state: { rounds: 1, attempted: [] }, roundCap: 1 });
  assert.equal(r.terminal, TERMINALS.ROUND_CAP);
});

test("only FIX verdicts are selected", () => {
  const r = decide({
    ...base,
    adjudicated: [FIX({ hash: "a" }), FIX({ hash: "b", verdict: "ESCALATE" }), FIX({ hash: "c", verdict: "REJECT" })],
  });
  assert.deepEqual(r.fixable.map((f) => f.hash), ["a"]);
});

test("stale findings are skipped (anchored to old SHA)", () => {
  const r = decide({ ...base, adjudicated: [FIX({ stale: true })] });
  assert.equal(r.terminal, TERMINALS.NO_APPROVED_FINDINGS);
});

test("hash dedupe: a previously-attempted finding does not retry (anti-thrash)", () => {
  const r = decide({
    ...base,
    adjudicated: [FIX({ hash: "seen" })],
    state: { rounds: 1, attempted: ["seen"] },
  });
  assert.equal(r.terminal, TERMINALS.NO_APPROVED_FINDINGS);
});

test("hash dedupe: a NEW finding in round 2 still proceeds", () => {
  const r = decide({
    ...base,
    adjudicated: [FIX({ hash: "seen" }), FIX({ hash: "new" })],
    state: { rounds: 1, attempted: ["seen"] },
  });
  assert.equal(r.terminal, null);
  assert.deepEqual(r.fixable.map((f) => f.hash), ["new"]);
  assert.equal(r.round, 2);
});

test("empty adjudication is NO_APPROVED_FINDINGS, not a crash", () => {
  const r = decide({ ...base, adjudicated: [] });
  assert.equal(r.terminal, TERMINALS.NO_APPROVED_FINDINGS);
});

test("precedence: DISABLED > MISSING_SECRET > FORK_PR > ROUND_CAP", () => {
  // All bad at once → the earliest-listed terminal wins, deterministically.
  const allBad = {
    adjudicated: [FIX()],
    state: { rounds: 9, attempted: [] },
    enabled: false,
    hasSecret: false,
    fork: true,
  };
  assert.equal(decide(allBad).terminal, TERMINALS.DISABLED);
  assert.equal(decide({ ...allBad, enabled: true }).terminal, TERMINALS.MISSING_SECRET);
  assert.equal(decide({ ...allBad, enabled: true, hasSecret: true }).terminal, TERMINALS.FORK_PR);
  assert.equal(
    decide({ ...allBad, enabled: true, hasSecret: true, fork: false }).terminal,
    TERMINALS.ROUND_CAP,
  );
});
