/**
 * Guard for CSP report parsing (lib/csp-report.ts → /api/csp-report).
 *
 * Pure logic assertions in the self-contained tsx style of the other
 * scripts/*.test.ts files. Run: npm run test:csp-report
 */
import assert from 'node:assert/strict';
import {
  parseCspReport,
  sanitizeUri,
  sentrySampleRate,
  DEFAULT_SENTRY_SAMPLE_RATE,
  MAX_REPORT_BYTES,
  MAX_VIOLATIONS_PER_REQUEST,
} from '../lib/csp-report';

let passed = 0;
const ok = (fn: () => void) => {
  fn();
  passed++;
};

// Legacy report-uri shape (Firefox/Safari).
ok(() => {
  const body = JSON.stringify({
    'csp-report': {
      'document-uri': 'https://www.wildenflower.com/account?token=secret#x',
      'violated-directive': 'script-src-elem',
      'effective-directive': 'script-src-elem',
      'blocked-uri': 'https://evil.example/x.js?email=a@b.c',
      'source-file': 'https://www.wildenflower.com/_next/static/chunk.js?v=1',
      disposition: 'report',
      'script-sample': 'alert(document.cookie)',
    },
  });
  assert.deepEqual(parseCspReport(body), [
    {
      directive: 'script-src-elem',
      blocked: 'https://evil.example/x.js',
      document: '/account',
      source: 'https://www.wildenflower.com/_next/static/chunk.js',
      disposition: 'report',
    },
  ]);
});

// Legacy without effective-directive falls back to first token of violated-directive.
ok(() => {
  const body = JSON.stringify({
    'csp-report': { 'violated-directive': "img-src 'self' cdn.shopify.com", 'blocked-uri': 'data' },
  });
  const [v] = parseCspReport(body);
  assert.equal(v.directive, 'img-src');
  assert.equal(v.blocked, 'data');
  assert.equal(v.disposition, 'unknown');
});

// Reporting API shape (Chromium), non-CSP entries ignored, sample dropped.
ok(() => {
  const body = JSON.stringify([
    {
      type: 'csp-violation',
      url: 'https://www.wildenflower.com/',
      body: {
        documentURL: 'https://www.wildenflower.com/products/tee?variant=1',
        effectiveDirective: 'style-src-elem',
        blockedURL: 'inline',
        disposition: 'report',
        sample: 'body{background:url(x)}',
      },
    },
    { type: 'deprecation', body: { id: 'x' } },
  ]);
  const out = parseCspReport(body);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0], {
    directive: 'style-src-elem',
    blocked: 'inline',
    document: '/products/tee',
    source: '',
    disposition: 'report',
  });
  assert.ok(!JSON.stringify(out).includes('background'), 'sample must not survive');
});

// Per-request cap.
ok(() => {
  const one = { type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'data' } };
  const body = JSON.stringify(Array.from({ length: 50 }, () => one));
  assert.equal(parseCspReport(body).length, MAX_VIOLATIONS_PER_REQUEST);
});

// Junk → [] (never throws).
ok(() => {
  for (const junk of ['', 'not json', 'null', '42', '"x"', '{}', '[1,2]', '{"csp-report":"x"}',
    '{"csp-report":{}}', '[{"type":"csp-violation","body":"x"}]', '[{"type":"csp-violation","body":{}}]',
    JSON.stringify({ 'csp-report': { 'effective-directive': 123 } })]) {
    assert.deepEqual(parseCspReport(junk), [], `junk: ${junk}`);
  }
});

// Oversized body → [].
ok(() => {
  const big = JSON.stringify({ 'csp-report': { 'effective-directive': 'img-src', pad: 'x'.repeat(MAX_REPORT_BYTES) } });
  assert.deepEqual(parseCspReport(big), []);
});

// Field truncation.
ok(() => {
  const body = JSON.stringify({ 'csp-report': { 'effective-directive': 'a'.repeat(5000) } });
  assert.ok(parseCspReport(body)[0].directive.length <= 200);
});

// sanitizeUri: schemes collapse, keywords keep, query/fragment stripped.
ok(() => {
  assert.equal(sanitizeUri('data:image/png;base64,AAAA'), 'data');
  assert.equal(sanitizeUri('blob:https://www.wildenflower.com/uuid'), 'blob');
  assert.equal(sanitizeUri('chrome-extension://abc/x.js'), 'chrome-extension');
  assert.equal(sanitizeUri('eval'), 'eval');
  assert.equal(sanitizeUri('weird?q=1#f'), 'weird');
  assert.equal(sanitizeUri(undefined), '');
  assert.equal(sanitizeUri({}), '');
});

// sentrySampleRate.
ok(() => {
  assert.equal(sentrySampleRate(undefined), DEFAULT_SENTRY_SAMPLE_RATE);
  assert.equal(sentrySampleRate(''), DEFAULT_SENTRY_SAMPLE_RATE);
  assert.equal(sentrySampleRate('1'), 1);
  assert.equal(sentrySampleRate('0'), 0);
  assert.equal(sentrySampleRate('0.5'), 0.5);
  assert.equal(sentrySampleRate('2'), DEFAULT_SENTRY_SAMPLE_RATE);
  assert.equal(sentrySampleRate('-1'), DEFAULT_SENTRY_SAMPLE_RATE);
  assert.equal(sentrySampleRate('abc'), DEFAULT_SENTRY_SAMPLE_RATE);
});

console.log(`csp-report: ${passed} checks passed`);
