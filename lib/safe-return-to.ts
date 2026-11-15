/**
 * Post-login redirect targets come from a query string / cookie the visitor
 * controls. Only same-site paths are allowed; anything else falls back.
 *
 * Rejected on purpose:
 *   - absolute URLs (`https://evil.example`) and scheme tricks (`javascript:`)
 *   - protocol-relative (`//evil.example`) and backslash variants (`/\evil.example`),
 *     which browsers normalise to another origin
 *   - control characters (header/URL smuggling)
 */
export const DEFAULT_RETURN_TO = '/account';

export function safeReturnTo(
  value: string | null | undefined,
  fallback: string = DEFAULT_RETURN_TO
): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) {
    return fallback;
  }
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  if (value.includes('\\')) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
