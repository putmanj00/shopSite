# Codex Autofix Loop

Closes the loop on Codex's automated PR reviews so you're **notified and the
findings are triaged automatically**, without opening every PR yourself.

Shipped in two phases. **Phase 1 (this) is read-only triage.** Phase 2 (the
gated auto-fixer) is deferred — see [Phase 2](#phase-2--gated-auto-fixer-deferred).

## Why

Codex auto-reviews every PR on `putmanj00/shopSite`. Today you have to open the
PR to see the comments and trigger fixes by hand, and a stale review can sit
against an old commit after you've already fixed it (PR #24: two P1 WCAG-AA
contrast findings were fixed in `9c538f2` but the review still pointed at the old
SHA, with nothing closing the loop).

## Phase 1 — read-only triage (live)

`.github/workflows/codex-autofix.yml` + `scripts/codex-autofix/*.mjs`.

```
Codex bot comments on a PR
        │  (pull_request_review | pull_request_review_comment | issue_comment)
        ▼
[if] sender is the Codex bot (exact login + Bot type + id 199175422)
     and the comment is on a PR
        ▼
gather-findings.mjs  ── resolve PR, SAME-REPO GUARD (refuse forks),
        │                collect Codex inline findings → findings.json
        │                (stable per-finding hash, stale-SHA flag)
        ▼
adjudicate.mjs       ── per finding, ask a non-OpenAI GitHub Models judge:
        │                FIX / REJECT / ESCALATE  (finding passed as UNTRUSTED
        │                DATA; any error ⇒ ESCALATE) → adjudicated.json
        ▼
summarize.mjs        ── upsert ONE sticky comment: table of findings + verdicts,
                         stale warning, @-mention you for anything actionable
```

Phase 1 **does not** change code, push commits, or hold a `contents: write`
token. It needs **no `ANTHROPIC_API_KEY`** — the judge runs on GitHub Models via
the built-in `GITHUB_TOKEN`. Merge always stays manual, and this workflow does
**not** re-run CI.

### Security model (hardened by the Step 0 cross-vendor review)

The original single-privileged-job plan was **BLOCKED** by a Gemini→Codex→Gemini
review (7 HIGH). Phase 1 is the read-only half, which removes most of the risk
surface outright and bakes in these decisions:

| Risk | Mitigation in Phase 1 |
| --- | --- |
| Actor squatting (`startsWith` matched `…-pwn`) | **Exact** login `chatgpt-codex-connector[bot]` + `type == Bot` + id `199175422`. `[bot]` logins are reserved for GitHub Apps — humans can't register brackets. |
| Fork-PR privilege escalation (`issue_comment` has no `pull_request`) | `gather-findings.mjs` resolves the PR via the API and refuses any PR whose head repo ≠ this repo, before inference or commenting. |
| Prompt injection from reviewer text | Findings are handed to the judge as fenced JSON **data** with a system frame that forbids obeying embedded instructions; bodies are length-bounded; never interpolated into a shell or system prompt. |
| Silent mis-grade | Any judge transport/rate-limit/parse error ⇒ **ESCALATE**, never a silent FIX or dropped finding. |
| Least privilege | Top-level `permissions: contents: read`; the job grants only `contents: read, pull-requests: read, issues: write, models: read`. No write-to-contents anywhere in Phase 1. |

## Configuration

No secrets required for Phase 1. Optional repo **variables**
(Settings → Secrets and variables → Actions → Variables):

| Variable | Default | Purpose |
| --- | --- | --- |
| `CODEX_AUTOFIX_ADJUDICATOR_MODEL` | `mistral-ai/mistral-medium-2505` | GitHub Models judge id. |
| `CODEX_AUTOFIX_MAINTAINER` | `putmanj00` | Who gets @-mentioned for actionable findings. |

### Model availability (correction to the original plan)

The plan named *"Gemini 3 Flash"* and *"Claude Haiku"* as the judge. **Neither is
available on GitHub Models** — its publishers are Cohere, DeepSeek, Meta,
Microsoft, Mistral AI, and OpenAI only (verified against
`https://models.github.ai/catalog/models`). A **non-OpenAI** judge is used on
purpose so OpenAI's Codex isn't grading its own output. Working non-OpenAI
alternatives with tool-calling: `mistral-ai/mistral-medium-2505` (default,
low rate-limit tier), `deepseek/deepseek-v3-0324`, `meta/meta-llama-3.1-405b-instruct`.
On rate-limit or an unavailable model the judge fails safe to ESCALATE.

## Going live

`pull_request_review` / `issue_comment` workflows run from the **default branch**,
so Phase 1 only takes effect once `codex-autofix.yml` is merged to `main`.
Grant `models: read` is automatic via the job's `permissions:` block (a real,
current Actions permission). Open a throwaway PR with a Codex-baitable nit to
confirm one sticky comment appears and updates in place.

## Phase 2 — gated auto-fixer (deferred)

The auto-fix half carries the remaining HIGH findings from the review and is a
**separate, gated write job**. Do not bolt it onto Phase 1 without these:

1. **Out-of-model scope fence.** Compute the allowed file set from
   `gh pr diff --name-only`; after the fixer edits, assert `git diff` is a strict
   subset (plus do-not-touch paths like `app/api/auth/`, Shopify mutations) and
   reset/escalate on violation. Prompt-only "stay in the diff" is not enforcement.
2. **Deterministic gate-before-commit.** Run the fixer with **no** git/commit
   tools (edit-only); then a bash step runs the repo gates and mirrors the full
   CI gate set — `npm run lint`, `npm run typecheck`, `npm run build`
   (includes `contrast:check`), plus the changed-file slop detector
   (`.claude/skills/slop-detector/check.sh`) — and only commits/pushes on green.
3. **Stale-CI hazard.** A `GITHUB_TOKEN` push does **not** re-trigger `ci.yml`
   (incl. the Playwright matrix, gitleaks, npm audit). Either push with a GitHub
   App installation token that re-triggers CI, or `workflow_dispatch` `ci.yml`
   for the bot SHA and make missing/stale CI a **blocking** sticky status before
   merge.
4. **Round cap + durable state.** Cap autofix rounds per PR (e.g. 2),
   hash-tracked so a re-firing false positive doesn't thrash; store state in a
   signed hidden block validated by author bot id, not the mutable sticky body;
   `concurrency` serialized per PR number.
5. **Explicit terminal states.** `NO_APPROVED_FINDINGS`, `MISSING_SECRET`,
   `FORK_PR`, `DISABLED` each exit 0 with a clear sticky status.

Verify the exact `anthropics/claude-code-action@v1` tool-restriction syntax
(`settings.permissions.allow` vs CLI flags) against its `action.yml` at build.

## Review record

Step 0 cross-vendor review of the plan: **BLOCK, 7 HIGH / 3 MED / 1 NIT**
(Gemini→Codex→Gemini, converged). Notable self-correction: Gemini wrongly called
`models: read` an invalid permission and `anthropics/claude-code-action@v1`
fictional; Codex (grounded against GitHub docs + this repo) overruled both.
Phase 1 resolves the actor-filter, fork-guard, injection-containment, and
least-privilege HIGHs; the scope-fence, deterministic-gating, and stale-CI HIGHs
are Phase-2 scope.
