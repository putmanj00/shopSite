// node:test unit tests for scope-fence pure cores. Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  globToRegExp,
  isDenied,
  computeAllowed,
  findViolations,
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
