# Codex Autofix Loop

Closes the loop on Codex's automated PR reviews so you're **notified and the
findings are triaged automatically**, without opening every PR yourself.

Shipped in two phases. **Phase 1 is read-only triage** (always on). **Phase 2 is
the gated, opt-in auto-fixer** — built but disabled by default until configured;
see [Phase 2](#phase-2--gated-auto-fixer-live-opt-in).

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

## Phase 2 — gated auto-fixer (live, opt-in)

`.github/workflows/codex-autofix-fix.yml` + `scripts/codex-autofix/{scope-fence,select-fixable,fix-state}.mjs`
(it reuses Phase-1 `gather-findings.mjs` + `adjudicate.mjs`).

A **separate, gated write job**, triggered by **human authorization only**: a
maintainer (write access) comments `/codex-fix` on the PR. The bot never
self-triggers it, and **merge always stays human**.

```
maintainer comments `/codex-fix` on a PR
        ▼
gather (same-repo guard) → read durable state → adjudicate → select-fixable
        │   (FIX + fresh + un-attempted; round cap; → terminal or proceed)
        ▼ proceed
checkout PR head · compute scope fence (gh pr diff − denylist)
        ▼
claude-code-action  ── EDIT-ONLY (Bash denied ⇒ no git/commit), scoped to allowed files
        ▼
git reset --mixed head  ── re-own the commit if the action self-committed
        ▼
enforce scope fence ── any out-of-scope / denylisted edit ⇒ hard reset ⇒ SCOPE_VIOLATION
        ▼
gate: npm ci · lint · typecheck · build (incl. contrast:check) · slop ── red ⇒ GATE_FAILED
        ▼ green
commit + push (App token re-triggers CI; else workflow_dispatch fallback) ── FIXED
        ▼
finalize: sticky status + advance durable, bot-signed round state
```

How each Phase-2 requirement is satisfied:

1. **Out-of-model scope fence** — `scope-fence.mjs`. Allowed set = the PR's
   changed files (`gh pr diff --name-only`) minus an **additive-only** denylist
   (`app/api/auth/**`, `app/api/webhooks/**`, the Shopify mutation/cart files,
   `.github/**`, `scripts/codex-autofix/**`, lockfiles, `middleware.ts`, env).
   After the fixer runs, `enforce` asserts the working-tree diff is a strict
   subset and **hard-resets** on any violation. A new file is never in the PR's
   set, so it is always rejected. Env can only *tighten* the fence.
2. **Deterministic gate-before-commit** — the fixer runs with `Bash` denied via
   `claude_args --settings` (edit-only; it cannot git/commit/push). A bash step
   then mirrors the full CI gate set — `npm run lint`, `npm run typecheck`,
   `npm run build` (incl. `contrast:check`), plus the **trusted** slop detector
   run against absolute PR-file paths — and commits **only on green**.
3. **Stale-CI hazard** — a `GITHUB_TOKEN` push does not re-trigger `ci.yml`. The
   workflow prefers a **GitHub App token** (`APP_ID`/`APP_PRIVATE_KEY` secrets,
   via `actions/create-github-app-token`) whose push re-runs the full PR CI. With
   no App configured it pushes with `GITHUB_TOKEN` and `workflow_dispatch`es
   `ci.yml` as a **partial** fallback (the PR-only `slop` job is skipped), and the
   sticky status flags CI as needing manual confirmation before merge.
4. **Round cap + durable state** — `fix-state.mjs`. State lives in its **own**
   hidden PR comment, trusted only when authored by `github-actions[bot]`
   (authorship is unforgeable) and optionally HMAC-signed
   (`CODEX_AUTOFIX_STATE_SECRET`). Rounds are capped (`ROUND_CAP`, default 2) and
   acted-on findings are **hash-tracked** so a re-firing false positive can't
   thrash; a no-edit round still records the hashes. `concurrency` is serialized
   per PR number.
5. **Terminal states** — every exit is a clear sticky status, exit 0:
   `DISABLED`, `MISSING_SECRET`, `FORK_PR`, `ROUND_CAP`, `NO_APPROVED_FINDINGS`
   (the doc's four + the cap), plus operational `SCOPE_VIOLATION`, `GATE_FAILED`,
   `NO_CHANGES`.

**Verified action syntax (`anthropics/claude-code-action@v1`):** there is **no**
`allowed_tools` input. Tool restriction goes through `claude_args` (CLI flags) or
a `--settings` JSON (`permissions.allow`/`deny`); the model via `claude_args
--model`; the key via `anthropic_api_key`; the instructions via `prompt`. We deny
`Bash`/`WebFetch`/`WebSearch`/`Task` and allow only `Read`/`Edit`/`Write`/`Grep`/`Glob`.

### Going live (Phase 2)

Like Phase 1, `issue_comment` workflows run from the **default branch**, so this
takes effect once `codex-autofix-fix.yml` is on `main`. It is **disabled by
default** and stays inert until configured:

- Repo **variable** `CODEX_AUTOFIX_FIX_ENABLED=true` — the kill switch (absent ⇒
  `DISABLED` sticky).
- Repo **secret** `ANTHROPIC_API_KEY` — the fixer (absent ⇒ `MISSING_SECRET`).
- *(Recommended)* secrets `APP_ID` + `APP_PRIVATE_KEY` — a GitHub App install so
  the push re-triggers CI. Without them, CI re-run is a partial dispatch only.
- *(Optional)* secret `CODEX_AUTOFIX_STATE_SECRET` (HMAC the round state),
  variables `CODEX_AUTOFIX_FIXER_MODEL` (default `claude-sonnet-4-6`),
  `CODEX_AUTOFIX_ADJUDICATOR_MODEL`.

Unit tests for the gate logic: `npm run test:autofix` (node:test, dependency-free).

> **Not yet smoke-tested live.** The `.mjs` decision cores are unit-tested and the
> YAML is schema-valid, but the end-to-end Actions run (esp. claude-code-action's
> commit behavior and the App-token push re-triggering CI) has not been exercised
> against a real PR. First enablement should be a throwaway PR with a small,
> Codex-baitable nit, watched through to a green CI on the bot's commit.

## Review record

Step 0 cross-vendor review of the plan: **BLOCK, 7 HIGH / 3 MED / 1 NIT**
(Gemini→Codex→Gemini, converged). Notable self-correction: Gemini wrongly called
`models: read` an invalid permission and `anthropics/claude-code-action@v1`
fictional; Codex (grounded against GitHub docs + this repo) overruled both.
Phase 1 resolves the actor-filter, fork-guard, injection-containment, and
least-privilege HIGHs; the scope-fence, deterministic-gating, and stale-CI HIGHs
are Phase-2 scope.
