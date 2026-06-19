// Regression tests for the Codex autofix workflow wiring.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/codex-autofix-fix.yml"),
  "utf8",
);

const triage = readFileSync(
  join(process.cwd(), ".github/workflows/codex-autofix.yml"),
  "utf8",
);

const summarize = readFileSync(
  join(process.cwd(), "scripts/codex-autofix/summarize.mjs"),
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

// ---- B1: gate failure captured + scrubbed + fed back into the next prompt ----

test("gate step captures a redacted failure excerpt to the runner temp file", () => {
  assert.match(workflow, /GATE_FAIL="\$RUNNER_TEMP\/gate-failure\.txt"/);
  // A redaction helper masks known secret env values before persistence.
  assert.match(workflow, /redact\(\)/);
  assert.match(workflow, /SHOPIFY_STOREFRONT_ACCESS_TOKEN/);
});

test("finalize step is handed the gate-failure file for GATE_FAILED feedback", () => {
  assert.match(workflow, /GATE_FAILURE_FILE: \$\{\{ runner\.temp \}\}\/gate-failure\.txt/);
});

test("fixer prompt injects prior-attempt feedback before the approved findings", () => {
  const prior = workflow.indexOf('cat "$RUNNER_TEMP/bot/prior-failure.md"');
  const findings = workflow.indexOf('cat "$RUNNER_TEMP/bot/fixable.md"');
  assert.notEqual(prior, -1, "prompt must cat prior-failure.md");
  assert.notEqual(findings, -1);
  assert.ok(prior < findings, "feedback must precede the findings list");
});

test("fixer prompt uses a random $GITHUB_OUTPUT delimiter (untrusted content embedded)", () => {
  // A static delimiter can be closed early by a content line equal to it; the
  // composed value embeds untrusted reviewer-note + gate output. (Codex pass-2.)
  assert.match(workflow, /DELIM="PROMPT_EOF_\$\(openssl rand -hex 16\)"/);
  assert.match(workflow, /echo "text<<\$\{DELIM\}"/);
  assert.match(workflow, /echo "\$\{DELIM\}"/);
  assert.doesNotMatch(workflow, /echo 'text<<PROMPT_EOF'/);
  assert.doesNotMatch(workflow, /^\s*echo PROMPT_EOF\s*$/m);
});

// ---- Phase-1 triage: App-token path for the sticky comment ------------------

test("triage mints a comment-scoped App token, gated on both App secrets", () => {
  assert.match(triage, /HAS_APP: \$\{\{ secrets\.APP_ID != '' && secrets\.APP_PRIVATE_KEY != '' \}\}/);
  assert.match(triage, /uses: actions\/create-github-app-token@[0-9a-f]{40} # v1/);
  assert.match(triage, /id: app-token/);
  assert.match(triage, /env\.HAS_APP == 'true'/);
  // Mint failure must not abort the read-only triage job.
  assert.match(triage, /continue-on-error: true/);
});

test("triage summarize posts with the App token, falling back to GITHUB_TOKEN", () => {
  assert.match(
    triage,
    /GITHUB_TOKEN: \$\{\{ steps\.app-token\.outputs\.token \|\| github\.token \}\}/,
  );
});

test("summarize soft-warns (exit 0) on a 401/403 comment-write denial", () => {
  assert.match(summarize, /\/ -> \(401\|403\) \//);
  // The soft path returns instead of throwing; real errors still rethrow.
  assert.match(summarize, /throw err;/);
});
