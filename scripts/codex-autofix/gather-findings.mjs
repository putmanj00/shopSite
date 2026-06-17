#!/usr/bin/env node
// gather-findings.mjs — Phase 1 of the Codex autofix triage loop.
//
// Resolves the PR for the triggering event, enforces the same-repo guard
// (refuse fork PRs before any inference/comment step), then collects the Codex
// review bot's inline findings into a typed JSON array with stable per-finding
// hashes and a stale-SHA flag.
//
// Outputs (to $GITHUB_OUTPUT): proceed, pr_number, head_sha, count, skip_reason.
// Writes the findings array to findings.json in the workspace for the next step.
//
// Dependency-free: Node 22 global fetch + node: builtins only.
// Untrusted-input note: finding BODIES are attacker-influenceable (a PR author
// shapes the diff Codex reviews). They are stored as DATA fields and never
// interpolated into a shell command or model instruction here.

import { appendFileSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const API = "https://api.github.com";
const CODEX_LOGIN = "chatgpt-codex-connector[bot]";
const CODEX_ID = 199175422;

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY; // "owner/name"
const eventPath = process.env.GITHUB_EVENT_PATH;
const outPath = process.env.GITHUB_OUTPUT;

function setOutput(key, value) {
  if (outPath) appendFileSync(outPath, `${key}=${value}\n`);
  else console.log(`[output] ${key}=${value}`);
}

function finish({
  proceed,
  pr_number = "",
  head_sha = "",
  count = 0,
  skip_reason = "",
  // Phase-2 extras (Phase-1 steps ignore these): the merge base SHA and head
  // branch the gated fixer checks out + scopes its diff against.
  base_sha = "",
  head_ref = "",
}) {
  setOutput("proceed", proceed ? "true" : "false");
  setOutput("pr_number", pr_number);
  setOutput("head_sha", head_sha);
  setOutput("count", String(count));
  setOutput("skip_reason", skip_reason);
  setOutput("base_sha", base_sha);
  setOutput("head_ref", head_ref);
  console.log(
    `gather: proceed=${proceed} pr=${pr_number} sha=${head_sha} count=${count} skip=${skip_reason || "-"}`,
  );
  process.exit(0);
}

async function gh(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "codex-autofix-triage",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} -> ${res.status} ${text.slice(0, 200)}`);
  }
  return res;
}

// Paginate a list endpoint via the Link header.
async function ghAll(path) {
  const items = [];
  let next = `${path}${path.includes("?") ? "&" : "?"}per_page=100`;
  while (next) {
    const res = await gh(next);
    items.push(...(await res.json()));
    const link = res.headers.get("link") || "";
    const m = link.match(/<([^>]+)>;\s*rel="next"/);
    next = m ? m[1].replace(API, "") : null;
  }
  return items;
}

function isCodex(user) {
  return !!user && user.login === CODEX_LOGIN && user.id === CODEX_ID && user.type === "Bot";
}

// Pull a human-readable title + severity (P1/P2/P3) out of a Codex comment body.
function parseFinding(body) {
  const text = String(body || "");
  const sevMatch =
    text.match(/!\[P([123])\s*Badge\]/i) || text.match(/\bP([123])\b/);
  const severity = sevMatch ? `P${sevMatch[1]}` : "P?";
  // First bold line, with badge image markdown and HTML tags (<sub> etc.) stripped.
  const clean = (s) =>
    String(s)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // image markdown (severity badges)
      .replace(/<[^>]+>/g, "") // html tags
      .replace(/\s+/g, " ")
      .trim();
  let title = "";
  const bold = text.match(/\*\*(.+?)\*\*/s);
  if (bold) title = clean(bold[1]);
  if (!title) title = clean(text).slice(0, 120);
  return { severity, title };
}

function hashFinding(path, line, title) {
  return createHash("sha256").update(`${path}|${line}|${title}`).digest("hex").slice(0, 12);
}

async function main() {
  if (!token || !repo || !eventPath) {
    return finish({ proceed: false, skip_reason: "MISSING_ENV" });
  }
  const [owner, name] = repo.split("/");
  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  const prNumber = event.pull_request?.number ?? event.issue?.number;
  if (!prNumber) return finish({ proceed: false, skip_reason: "NOT_A_PR" });

  // Resolve the PR fresh from the API (issue_comment payloads carry no PR head).
  const pr = await (await gh(`/repos/${owner}/${name}/pulls/${prNumber}`)).json();
  const headSha = pr.head?.sha || "";
  const headRepo = pr.head?.repo?.full_name || "";
  const baseSha = pr.base?.sha || "";
  const headRef = pr.head?.ref || "";

  // Same-repo guard — refuse fork PRs before any inference/comment step.
  if (headRepo !== repo) {
    return finish({ proceed: false, pr_number: prNumber, head_sha: headSha, skip_reason: "FORK_PR" });
  }

  // Codex's actionable findings are its inline review comments (path + line).
  const inline = await ghAll(`/repos/${owner}/${name}/pulls/${prNumber}/comments`);
  const findings = [];
  for (const c of inline) {
    if (!isCodex(c.user)) continue;
    const path = c.path || "";
    const line = c.line ?? c.original_line ?? null;
    const { severity, title } = parseFinding(c.body);
    findings.push({
      hash: hashFinding(path, line, title),
      severity,
      title,
      path,
      line,
      comment_id: c.id,
      commit_id: c.commit_id || "",
      stale: !!headSha && c.commit_id !== headSha,
      // Bounded raw body kept as DATA for the judge; never executed as prose.
      body: String(c.body || "").slice(0, 4000),
      html_url: c.html_url || "",
    });
  }

  if (findings.length === 0) {
    return finish({
      proceed: false,
      pr_number: prNumber,
      head_sha: headSha,
      base_sha: baseSha,
      head_ref: headRef,
      skip_reason: "NO_FINDINGS",
    });
  }

  writeFileSync("findings.json", JSON.stringify(findings, null, 2));
  return finish({
    proceed: true,
    pr_number: prNumber,
    head_sha: headSha,
    base_sha: baseSha,
    head_ref: headRef,
    count: findings.length,
  });
}

main().catch((err) => {
  // Unexpected API failure: surface it (non-clean exit) rather than pretend OK.
  console.error(`gather-findings failed: ${err.message}`);
  process.exit(1);
});
