import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { MAX_REPORT_BYTES, parseCspReport, sentrySampleRate } from '@/lib/csp-report';

// CSP violation sink for the Report-Only policy in next.config.ts
// (`report-uri` + `report-to`). Collect ~1 week of real traffic, fix or
// allow-list what shows up, then flip CSP_ENFORCE.
//
// Every sanitized violation goes to the function log (free, greppable in
// Vercel); a sampled subset goes to Sentry (event quota), grouped by
// directive + blocked origin. Always answers 204 for well-sized bodies so
// browsers don't retry and probers learn nothing.
//
// simple: in-memory body cap only, no rate limit; upgrade to a Vercel Firewall
// rule on /api/csp-report if report volume or abuse shows up in Sentry quota.
export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 });
  }
  const body = await request.text();
  if (body.length > MAX_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const violations = parseCspReport(body);
  const rate = sentrySampleRate(process.env.CSP_REPORT_SAMPLE_RATE);

  for (const v of violations) {
    console.warn('[csp-report]', JSON.stringify(v));
    if (Math.random() < rate) {
      Sentry.captureMessage(`CSP ${v.disposition}: ${v.directive} blocked ${v.blocked || '(none)'}`, {
        level: 'warning',
        // Origin only ("https://host" / "inline" / "data"): one issue per source, not per file.
        fingerprint: ['csp-violation', v.directive, v.blocked.split('/').slice(0, 3).join('/')],
        tags: { csp_directive: v.directive, csp_disposition: v.disposition },
        extra: { ...v },
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}
