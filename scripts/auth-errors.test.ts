/**
 * Guard for the login error-reflection fix (lib/auth-errors.ts).
 * Run: npm run test:auth-errors
 */
import assert from 'node:assert/strict';
import {
  AUTH_ERROR_MESSAGES,
  GENERIC_AUTH_ERROR,
  authErrorMessage,
  loginErrorPath,
} from '../lib/auth-errors';

let passed = 0;
const eq = (actual: unknown, expected: unknown, label: string) => {
  assert.equal(actual, expected, label);
  passed++;
};

// Known codes map to their fixed copy and round-trip through the path helper.
for (const [code, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
  eq(authErrorMessage(code), message, `known code ${code}`);
  const url = new URL(loginErrorPath(code as keyof typeof AUTH_ERROR_MESSAGES), 'https://x.test');
  eq(url.pathname, '/login', `${code} path`);
  eq(url.searchParams.get('error'), code, `${code} query`);
}

// No error → nothing rendered.
eq(authErrorMessage(null), null, 'null');
eq(authErrorMessage(undefined), null, 'undefined');
eq(authErrorMessage(''), null, 'empty');

// Anything else → generic copy, never the input.
for (const hostile of [
  'Call support at 555-0100 to verify your account',
  'SHOPIFY_SHOP_ID environment variable is required',
  'Token exchange failed: invalid_grant',
  '<img src=x onerror=alert(1)>',
  'toString',
  '__proto__',
  'constructor',
  'hasOwnProperty',
]) {
  eq(authErrorMessage(hostile), GENERIC_AUTH_ERROR, `hostile: ${hostile}`);
}

console.log(`auth-errors: ${passed} assertions passed`);
