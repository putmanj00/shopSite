// Regression tests for the Codex autofix workflow wiring.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/codex-autofix-fix.yml"),
  "utf8",
);

test("autofix scope is computed from gathered base/head SHAs, not live PR diff", () => {
  assert.match(
    workflow,
    /compare\/\$\{BASE_SHA\}\.\.\.\$\{HEAD_SHA\}/,
  );
  assert.match(workflow, /BASE_SHA: \$\{\{ steps\.gather\.outputs\.base_sha \}\}/);
  assert.match(workflow, /HEAD_SHA: \$\{\{ steps\.gather\.outputs\.head_sha \}\}/);
  assert.doesNotMatch(workflow, /gh pr diff .*--name-only > changed-files\.txt/);
});

test("autofix performs stale-head check before model adjudication", () => {
  const stale = workflow.indexOf("Verify branch still at gathered head");
  const adjudicate = workflow.indexOf("Adjudicate findings");
  assert.notEqual(stale, -1);
  assert.notEqual(adjudicate, -1);
  assert.ok(stale < adjudicate);
  assert.match(
    workflow,
    /steps\.flags\.outputs\.attempt == 'true' && steps\.stale\.outputs\.fresh == 'true'/,
  );
});

test("autofix reports stale head before generic select-fixable terminals", () => {
  const staleOutcome = workflow.indexOf("steps.stale.outputs.fresh == 'false' && 'STALE_HEAD'");
  const selectTerminal = workflow.indexOf("steps.select.outputs.terminal != '' && steps.select.outputs.terminal");
  assert.notEqual(staleOutcome, -1);
  assert.notEqual(selectTerminal, -1);
  assert.ok(staleOutcome < selectTerminal);
});
