#!/usr/bin/env node
// scope-fence.mjs — Phase 2 out-of-model scope fence for the Codex autofixer.
//
// Requirement 1 of docs/codex-autofix-loop.md "Phase 2": the model is told to
// "stay in the diff", but prompt-only containment is NOT enforcement. This
// computes the allowed file set deterministically and, after the fixer edits,
// asserts the working-tree diff is a strict subset of it — resetting and
// failing on any violation.
//
//   allowed set = (PR's changed files: `git diff --name-only base...head`)
//                 MINUS a hard do-not-touch denylist (auth, webhooks, Shopify
//                 mutations, CI, the autofix scripts themselves, lockfiles).
//
// The denylist is ADDITIVE-only via env (CODEX_AUTOFIX_DENY_GLOBS appends, never
// replaces) so a misconfigured variable can only TIGHTEN the fence, never widen
// it. A newly-created file is never in the PR's changed set, so it is always a
// violation — the fixer may only edit files the PR already touched.
//
// Subcommands:
//   compute  — write allowed-paths.json (+ a markdown bullet list for the prompt)
//   enforce  — diff the working tree; on any out-of-scope / denied path, hard
//              reset and exit 1 (the workflow then posts SCOPE_VIOLATION).
//
// Dependency-free: Node 22 + node: builtins only. Pure cores are exported for
// unit tests; git is shelled via execFileSync (argv array, never a shell string).

import { writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Hard do-not-touch paths. The autofixer must never edit auth, payment/cart or
// webhook-verification code, CI workflows, its own scripts, or dependency
// manifests — a wrong "fix" there is high-blast-radius and bypasses review.
export const DEFAULT_DENY_GLOBS = [
  "app/api/auth/**",
  "app/api/webhooks/**",
  "lib/shopify-webhook.ts",
  "lib/shopify-queries.ts",
  "lib/cart-store.ts",
  ".github/**",
  "scripts/codex-autofix/**",
  "package.json",
  "package-lock.json",
  "**/*.lock",
  ".env*",
  "**/.env*",
  "middleware.ts",
];

// Translate a restricted glob (`*`, `**`, exact) to an anchored RegExp.
// `**` spans path separators; `*` does not. Everything else is literal.
export function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        // `**/` -> optional any-depth prefix; bare `**` -> any chars
        if (glob[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 2;
        } else {
          re += ".*";
          i += 1;
        }
      } else {
        re += "[^/]*";
      }
    } else if ("\\^$.|?+()[]{}".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp(`^${re}$`);
}

export function isDenied(path, denyGlobs = DEFAULT_DENY_GLOBS) {
  return denyGlobs.some((g) => globToRegExp(g).test(path));
}

// Allowed = changed files that are not on the denylist. Pure.
export function computeAllowed(changedFiles, denyGlobs = DEFAULT_DENY_GLOBS) {
  return changedFiles.filter((f) => f && !isDenied(f, denyGlobs));
}

// Every touched path must be BOTH non-denied AND already in the allowed set.
// Returns [{ path, reason }] — empty array means the edits are in-bounds. Pure.
export function findViolations(touched, allowed, denyGlobs = DEFAULT_DENY_GLOBS) {
  const allowedSet = new Set(allowed);
  const out = [];
  for (const p of touched) {
    if (!p) continue;
    if (isDenied(p, denyGlobs)) out.push({ path: p, reason: "denylisted (do-not-touch)" });
    else if (!allowedSet.has(p)) out.push({ path: p, reason: "outside PR's changed-file set" });
  }
  return out;
}

// Merge default + env-supplied deny globs (env can only ADD).
export function resolveDenyGlobs(env = process.env) {
  const extra = (env.CODEX_AUTOFIX_DENY_GLOBS || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_DENY_GLOBS, ...extra];
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

// Tracked-modified ∪ newly-added (untracked) paths in the working tree.
function touchedPaths() {
  const out = git(["status", "--porcelain=v1", "--no-renames", "-z"]).split("\0").filter(Boolean);
  const paths = [];
  for (const entry of out) {
    // porcelain -z record: 2 status chars + space + path
    const path = entry.slice(3);
    if (path) paths.push(path);
  }
  return paths;
}

function cmdCompute() {
  // Authoritative PR changed-file list — written by the workflow via
  // `gh pr diff <n> --name-only` (the requirement's exact source). Reading a
  // file instead of a local `git diff base...head` sidesteps base-SHA
  // reachability problems under a shallow checkout when the base branch moved.
  const listPath = process.env.CHANGED_FILES_FILE || "changed-files.txt";
  if (!existsSync(listPath)) {
    console.error(`scope-fence compute: missing ${listPath}`);
    process.exit(1);
  }
  const denyGlobs = resolveDenyGlobs();
  const changed = readFileSync(listPath, "utf8")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = computeAllowed(changed, denyGlobs);
  const denied = changed.filter((f) => !allowed.includes(f));

  writeFileSync("allowed-paths.json", JSON.stringify({ allowed, denied }, null, 2));
  // Markdown list handed to the fixer prompt as the ONLY editable surface.
  writeFileSync(
    "allowed-paths.md",
    allowed.length ? allowed.map((p) => `- \`${p}\``).join("\n") : "_(none)_",
  );
  console.log(
    `scope-fence compute: ${allowed.length} allowed, ${denied.length} denied of ${changed.length} changed`,
  );
  if (denied.length) console.log("  denied:\n" + denied.map((p) => "    " + p).join("\n"));
}

function cmdEnforce() {
  const { allowed } = JSON.parse(readFileSync("allowed-paths.json", "utf8"));
  const denyGlobs = resolveDenyGlobs();
  const touched = touchedPaths();
  const violations = findViolations(touched, allowed, denyGlobs);

  if (violations.length === 0) {
    console.log(`scope-fence enforce: OK — ${touched.length} touched path(s), all in-bounds`);
    return;
  }

  // Reset everything the fixer did: drop tracked edits, delete untracked adds.
  console.error(`scope-fence enforce: ${violations.length} VIOLATION(S) — resetting:`);
  for (const v of violations) console.error(`    ${v.path} — ${v.reason}`);
  try {
    git(["reset", "--hard", "HEAD"]);
    for (const p of touched) {
      // Remove untracked files the reset didn't (best-effort, bounded to touched).
      try {
        rmSync(p, { force: true });
      } catch {
        /* tracked file already restored by reset */
      }
    }
  } catch (e) {
    console.error(`scope-fence enforce: reset failed: ${e.message}`);
  }
  // Surface the violating paths for the sticky status.
  writeFileSync("scope-violations.json", JSON.stringify(violations, null, 2));
  process.exit(1);
}

function main() {
  const sub = process.argv[2];
  if (sub === "compute") return cmdCompute();
  if (sub === "enforce") return cmdEnforce();
  console.error(`scope-fence: unknown subcommand '${sub}' (expected compute|enforce)`);
  process.exit(2);
}

// Run only as a CLI; stays importable (no side effects) for unit tests.
if (import.meta.url === `file://${process.argv[1]}`) main();
