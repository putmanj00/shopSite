#!/usr/bin/env node
// summarize.mjs — Phase 1 of the Codex autofix triage loop.
//
// Upserts ONE sticky summary comment on the PR: Codex's findings, the
// adjudicator's FIX/REJECT/ESCALATE verdict for each, a stale-SHA warning, and
// @-mentions to the maintainer for anything actionable.
//
// Idempotent: finds a prior comment carrying the hidden marker (authored by the
// Actions bot) and edits it in place, so re-runs refresh rather than duplicate.
// Phase 1 = notify only; nothing is auto-applied and CI is not re-run here.
//
// Dependency-free: Node 22 global fetch + node: builtins only.

import { readFileSync } from "node:fs";

const API = "https://api.github.com";
const MARKER = "<!-- codex-autofix:summary -->";
const SELF_LOGIN = "github-actions[bot]";

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const headSha = process.env.HEAD_SHA || "";
const maintainer = (process.env.MAINTAINER || "putmanj00").replace(/^@/, "");
const model = process.env.ADJUDICATOR_MODEL || "mistral-ai/mistral-medium-2505";

const EMOJI = { FIX: "🟢", REJECT: "⚪", ESCALATE: "🟡" };

async function gh(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "codex-autofix-triage",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${t.slice(0, 200)}`);
  }
  return res;
}

// Markdown-safe single-line cell text.
function cell(s) {
  return String(s || "").replace(/\r?\n+/g, " ").replace(/\|/g, "\\|").trim();
}

function buildBody(items) {
  const [owner, name] = repo.split("/");
  const staleCount = items.filter((f) => f.stale).length;
  const counts = items.reduce((a, x) => ((a[x.verdict] = (a[x.verdict] || 0) + 1), a), {});

  const rows = items
    .map((f) => {
      const loc = f.line != null ? `${f.path}:${f.line}` : f.path;
      const link = f.html_url ? `[${cell(loc)}](${f.html_url})` : cell(loc);
      const title = cell(f.title).slice(0, 90);
      const flag = f.stale ? " ⚠️stale" : "";
      const reason = cell(f.reason);
      return `| ${f.severity} | ${link}${flag} — ${title} | ${EMOJI[f.verdict] || ""} ${f.verdict} | ${reason} |`;
    })
    .join("\n");

  const fix = counts.FIX || 0;
  const esc = counts.ESCALATE || 0;
  const rej = counts.REJECT || 0;
  const mention = fix + esc > 0 ? ` — @${maintainer}` : "";

  const staleLine = staleCount
    ? `\n> ⚠️ ${staleCount} finding(s) are anchored to an older commit than the current head — Codex may have already been addressed; re-review to confirm.\n`
    : "";

  return [
    MARKER,
    `### 🤖 Codex Autofix — triage`,
    "",
    `**Phase 1 (notify only).** Read-only triage of Codex's review — no code is changed, nothing is pushed, and CI is **not** re-run by this bot. Merge stays manual.`,
    "",
    `Reviewed against PR head \`${headSha.slice(0, 10)}\`.`,
    staleLine,
    `| Severity | Finding | Adjudicator | Why |`,
    `| --- | --- | --- | --- |`,
    rows,
    "",
    `**Recommended fixes** (not auto-applied in Phase 1): ${fix}${fix ? mention : ""}`,
    `**Escalations** (need a human): ${esc}${esc ? ` — @${maintainer}` : ""}`,
    `**Dismissed** (REJECT): ${rej}`,
    "",
    `<sub>Adjudicated by \`${model}\` via GitHub Models · posted by \`codex-autofix.yml\` · ${repo}#${prNumber} · finding hashes tracked for Phase 2 dedupe.</sub>`,
  ].join("\n");
}

async function findExisting(owner, name) {
  let next = `/repos/${owner}/${name}/issues/${prNumber}/comments?per_page=100`;
  while (next) {
    const res = await gh(next);
    const arr = await res.json();
    const hit = arr.find((c) => c.user?.login === SELF_LOGIN && (c.body || "").includes(MARKER));
    if (hit) return hit;
    const link = res.headers.get("link") || "";
    const m = link.match(/<([^>]+)>;\s*rel="next"/);
    next = m ? m[1].replace(API, "") : null;
  }
  return null;
}

async function main() {
  if (!token || !repo || !prNumber) {
    console.error("summarize: missing GITHUB_TOKEN/REPOSITORY/PR_NUMBER");
    process.exit(1);
  }
  const [owner, name] = repo.split("/");
  const items = JSON.parse(readFileSync("adjudicated.json", "utf8"));
  const body = buildBody(items);

  if (process.env.DRY_RUN) {
    console.log(body);
    return;
  }

  try {
    const existing = await findExisting(owner, name);
    if (existing) {
      await gh(`/repos/${owner}/${name}/issues/comments/${existing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ body }),
      });
      console.log(`summarize: updated sticky comment ${existing.id}`);
    } else {
      const res = await gh(`/repos/${owner}/${name}/issues/${prNumber}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      const created = await res.json();
      console.log(`summarize: created sticky comment ${created.id}`);
    }
  } catch (err) {
    // A bot-triggered pull_request_review run gets a read-only GITHUB_TOKEN, so
    // the comment write 403s unless a GitHub App token is supplied (APP_ID /
    // APP_PRIVATE_KEY -> create-github-app-token). Triage itself (gather +
    // adjudicate) already succeeded; the sticky is advisory. Treat a
    // permission failure as a soft-warn (exit 0) so it does not show a phantom
    // red check; any other failure is real and still fails the job.
    if (/ -> (401|403) /.test(err.message)) {
      console.warn(
        `summarize: comment write not permitted (${err.message}). Triage ran; ` +
          `sticky comment skipped. Configure the APP_ID/APP_PRIVATE_KEY secrets ` +
          `to post the summary from a GitHub App token.`,
      );
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(`summarize failed: ${err.message}`);
  process.exit(1);
});
