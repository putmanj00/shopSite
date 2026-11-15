/**
 * Guard for the post-login open-redirect fix (lib/safe-return-to.ts).
 *
 * Pure logic assertions in the self-contained tsx style of the other
 * scripts/*.test.ts files. Run: npm run test:return-to
 */
import assert from 'node:assert/strict';
import { safeReturnTo, DEFAULT_RETURN_TO } from '../lib/safe-return-to';

let passed = 0;
const check = (input: string | null | undefined, expected: string, label: string) => {
  assert.equal(safeReturnTo(input), expected, label);
  passed++;
};

// Same-site paths pass through untouched.
check('/account', '/account', 'plain path');
check('/account?tab=orders#latest', '/account?tab=orders#latest', 'path with query + hash');
check('/products/some-handle', '/products/some-handle', 'nested path');

// Everything that could leave the site falls back.
check('https://evil.example', DEFAULT_RETURN_TO, 'absolute https URL');
check('http://evil.example/account', DEFAULT_RETURN_TO, 'absolute http URL');
check('//evil.example', DEFAULT_RETURN_TO, 'protocol-relative');
check('/\\evil.example', DEFAULT_RETURN_TO, 'backslash variant');
check('\\\\evil.example', DEFAULT_RETURN_TO, 'double backslash');
check('javascript:alert(1)', DEFAULT_RETURN_TO, 'javascript scheme');
check('evil.example', DEFAULT_RETURN_TO, 'bare host');
check('/account\r\nSet-Cookie: x=1', DEFAULT_RETURN_TO, 'CRLF injection');
check('/\t/evil.example', DEFAULT_RETURN_TO, 'tab smuggling');

// Empty / missing / oversized.
check('', DEFAULT_RETURN_TO, 'empty string');
check(null, DEFAULT_RETURN_TO, 'null');
check(undefined, DEFAULT_RETURN_TO, 'undefined');
check('/' + 'a'.repeat(3000), DEFAULT_RETURN_TO, 'oversized');

// Accepted values must stay on the origin when resolved the way the callback does.
for (const ok of ['/account', '/account?tab=orders', '/products/x']) {
  const resolved = new URL(safeReturnTo(ok), 'https://wildenflower.com');
  assert.equal(resolved.origin, 'https://wildenflower.com', `resolves same-origin: ${ok}`);
  passed++;
}

// Custom fallback is honoured.
assert.equal(safeReturnTo('https://evil.example', '/'), '/', 'custom fallback');
passed++;

console.log(`safe-return-to: ${passed} assertions passed`);
