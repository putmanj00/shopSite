/**
 * CSP violation report parsing for /api/csp-report.
 *
 * Browsers send two shapes:
 *   - `report-uri` (legacy, Firefox + Safari): Content-Type application/csp-report,
 *     body `{ "csp-report": { "document-uri", "effective-directive", "blocked-uri", ... } }`
 *   - `report-to` (Reporting API, Chromium): Content-Type application/reports+json,
 *     body `[{ type: "csp-violation", body: { documentURL, effectiveDirective, blockedURL, ... } }]`
 *
 * Both are normalized to CspViolation. Reports are attacker-controllable input
 * (anyone can POST), so every field is shape-checked, truncated, and stripped of
 * query strings / fragments (URLs can carry tokens or emails). The `sample`
 * field (first 40 chars of the offending script/style) is dropped on purpose.
 */

export const MAX_REPORT_BYTES = 16 * 1024;
export const MAX_VIOLATIONS_PER_REQUEST = 10;
export const DEFAULT_SENTRY_SAMPLE_RATE = 0.25;
const MAX_FIELD = 200;

export type CspViolation = {
  directive: string;
  blocked: string;
  document: string;
  source: string;
  disposition: 'enforce' | 'report' | 'unknown';
};

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v.slice(0, MAX_FIELD) : '');

/** Keep scheme+host+path for URLs; keep CSP keywords ("inline", "eval", "data") as-is. */
export function sanitizeUri(value: unknown): string {
  const raw = str(value);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return `${url.origin}${url.pathname}`.slice(0, MAX_FIELD);
    }
    // data:, blob:, chrome-extension:, etc. — scheme only (payload may be large/PII).
    return url.protocol.replace(/:$/, '');
  } catch {
    // Not a URL: keyword like "inline" / "eval" / "self". Strip anything URL-ish.
    return raw.split(/[?#]/)[0];
  }
}

/** Document location as a path only (host is always ours). */
function documentPath(value: unknown): string {
  const raw = str(value);
  if (!raw) return '';
  try {
    return new URL(raw).pathname.slice(0, MAX_FIELD);
  } catch {
    return '';
  }
}

function disposition(value: unknown): CspViolation['disposition'] {
  return value === 'enforce' || value === 'report' ? value : 'unknown';
}

function fromLegacy(r: Raw): CspViolation | null {
  const directive = str(r['effective-directive']) || str(r['violated-directive']).split(' ')[0];
  if (!directive) return null;
  return {
    directive,
    blocked: sanitizeUri(r['blocked-uri']),
    document: documentPath(r['document-uri']),
    source: sanitizeUri(r['source-file']),
    disposition: disposition(r['disposition']),
  };
}

function fromReportingApi(r: Raw): CspViolation | null {
  if (r.type !== 'csp-violation' || !isObject(r.body)) return null;
  const b = r.body;
  const directive = str(b.effectiveDirective);
  if (!directive) return null;
  return {
    directive,
    blocked: sanitizeUri(b.blockedURL),
    document: documentPath(b.documentURL),
    source: sanitizeUri(b.sourceFile),
    disposition: disposition(b.disposition),
  };
}

/**
 * Parse a report body. Dispatches on body shape rather than Content-Type
 * (browsers disagree on the header). Returns [] for anything unrecognized.
 */
export function parseCspReport(body: string): CspViolation[] {
  if (!body || body.length > MAX_REPORT_BYTES) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return [];
  }

  const out: CspViolation[] = [];
  if (Array.isArray(parsed)) {
    for (const item of parsed.slice(0, MAX_VIOLATIONS_PER_REQUEST)) {
      const v = isObject(item) ? fromReportingApi(item) : null;
      if (v) out.push(v);
    }
  } else if (isObject(parsed) && isObject(parsed['csp-report'])) {
    const v = fromLegacy(parsed['csp-report']);
    if (v) out.push(v);
  }
  return out;
}

/** CSP_REPORT_SAMPLE_RATE in [0,1]; anything else falls back to the default. */
export function sentrySampleRate(env: string | undefined): number {
  if (env === undefined || env.trim() === '') return DEFAULT_SENTRY_SAMPLE_RATE;
  const n = Number(env);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : DEFAULT_SENTRY_SAMPLE_RATE;
}
