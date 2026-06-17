// node:test unit tests for scope-fence pure cores. Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  globToRegExp,
  isDenied,
  computeAllowed,
  findViolations,
  parseStatusZ,
  resolveDenyGlobs,
  DEFAULT_DENY_GLOBS,
} from "./scope-fence.mjs";

test("globToRegExp: * does not span path separators", () => {
  assert.ok(globToRegExp("lib/*.ts").test("lib/email.ts"));
  assert.ok(!globToRegExp("lib/*.ts").test("lib/sub/email.ts"));
});

test("globToRegExp: **/ spans any depth incl. zero", () => {
  const re = globToRegExp("**/*.lock");
  assert.ok(re.test("yarn.lock"));
  assert.ok(re.test("a/b/c/pnpm.lock"));
});

test("globToRegExp: dir/** matches everything under dir but not the bare dir", () => {
  const re = globToRegExp("app/api/auth/**");
  assert.ok(re.test("app/api/auth/route.ts"));
  assert.ok(re.test("app/api/auth/deep/nested.ts"));
  assert.ok(!re.test("app/api/authx.ts"));
});

test("isDenied flags every protected surface", () => {
  for (const p of [
    "app/api/auth/login/route.ts",
    "app/api/webhooks/orders-create/route.ts",
    "lib/shopify-webhook.ts",
    "lib/shopify-queries.ts",
    "lib/cart-store.ts",
    ".github/workflows/ci.yml",
    "scripts/codex-autofix/adjudicate.mjs",
    "package-lock.json",
    "package.json",
    "middleware.ts",
    ".env.local",
    "app/.env.production",
  ]) {
    assert.ok(isDenied(p), `expected denied: ${p}`);
  }
});

test("isDenied leaves ordinary UI/content files editable", () => {
  for (const p of [
    "app/page.tsx",
    "components/hero.tsx",
    "lib/email.ts",
    "content/about.mdx",
  ]) {
    assert.ok(!isDenied(p), `expected allowed: ${p}`);
  }
});

test("computeAllowed = changed minus denylisted", () => {
  const changed = ["app/page.tsx", "lib/shopify-queries.ts", "components/nav.tsx", "package.json"];
  assert.deepEqual(computeAllowed(changed), ["app/page.tsx", "components/nav.tsx"]);
});

test("findViolations: in-scope edits are clean", () => {
  const allowed = ["app/page.tsx", "components/nav.tsx"];
  assert.deepEqual(findViolations(["app/page.tsx"], allowed), []);
  assert.deepEqual(findViolations(["app/page.tsx", "components/nav.tsx"], allowed), []);
});

test("findViolations: file outside the PR's changed set is a violation", () => {
  const allowed = ["app/page.tsx"];
  const v = findViolations(["app/page.tsx", "components/other.tsx"], allowed);
  assert.equal(v.length, 1);
  assert.equal(v[0].path, "components/other.tsx");
  assert.match(v[0].reason, /outside/);
});

test("findViolations: denylisted path flagged even if (somehow) in allowed", () => {
  // Defense in depth: deny wins over the allowed set.
  const v = findViolations(["app/api/auth/route.ts"], ["app/api/auth/route.ts"]);
  assert.equal(v.length, 1);
  assert.match(v[0].reason, /denylisted/);
});

test("findViolations: newly-created file (never in PR set) is rejected", () => {
  const v = findViolations(["app/brand-new.tsx"], ["app/page.tsx"]);
  assert.equal(v.length, 1);
  assert.match(v[0].reason, /outside/);
});

test("resolveDenyGlobs: env can only ADD, never replace defaults", () => {
  const globs = resolveDenyGlobs({ CODEX_AUTOFIX_DENY_GLOBS: "content/secret/**, lib/payments.ts" });
  for (const d of DEFAULT_DENY_GLOBS) assert.ok(globs.includes(d));
  assert.ok(globs.includes("content/secret/**"));
  assert.ok(globs.includes("lib/payments.ts"));
  assert.ok(isDenied("content/secret/x.mdx", globs));
});

test("resolveDenyGlobs: empty/missing env yields exactly the defaults", () => {
  assert.deepEqual(resolveDenyGlobs({}), DEFAULT_DENY_GLOBS);
});

// ---- op-type gate (porcelain XY) -------------------------------------------

test("parseStatusZ: parses XY code + path records, skips empties", () => {
  const buf = " M app/page.tsx\0?? new.tsx\0 D gone.tsx\0";
  assert.deepEqual(parseStatusZ(buf), [
    { code: " M", path: "app/page.tsx" },
    { code: "??", path: "new.tsx" },
    { code: " D", path: "gone.tsx" },
  ]);
  assert.deepEqual(parseStatusZ(""), []);
});

test("findViolations: in-scope MODIFY record is clean", () => {
  assert.deepEqual(
    findViolations([{ code: " M", path: "app/page.tsx" }], ["app/page.tsx"]),
    [],
  );
});

test("findViolations: DELETING an allowed file is a violation (op-type, not membership)", () => {
  const v = findViolations([{ code: " D", path: "app/page.tsx" }], ["app/page.tsx"]);
  assert.equal(v.length, 1);
  assert.match(v[0].reason, /disallowed op \(D\)/);
});

test("findViolations: a rename (D old + ?? new under --no-renames) is fully rejected", () => {
  const v = findViolations(
    [
      { code: " D", path: "app/old.tsx" },
      { code: "??", path: "app/new.tsx" },
    ],
    ["app/old.tsx"],
  );
  assert.equal(v.length, 2);
  assert.match(v.find((x) => x.path === "app/old.tsx").reason, /disallowed op/);
  assert.match(v.find((x) => x.path === "app/new.tsx").reason, /outside/);
});

test("findViolations: rename/copy status codes are rejected", () => {
  assert.match(findViolations([{ code: "R ", path: "a.tsx" }], ["a.tsx"])[0].reason, /disallowed op \(R\)/);
  assert.match(findViolations([{ code: "C ", path: "a.tsx" }], ["a.tsx"])[0].reason, /disallowed op \(C\)/);
});

test("findViolations: bare path strings still work (back-compat, op-type unknown)", () => {
  assert.deepEqual(findViolations(["app/page.tsx"], ["app/page.tsx"]), []);
  const v = findViolations(["components/other.tsx"], ["app/page.tsx"]);
  assert.equal(v.length, 1);
  assert.match(v[0].reason, /outside/);
});
