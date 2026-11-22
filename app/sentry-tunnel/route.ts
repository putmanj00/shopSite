// Sentry tunnel handler (next.config.ts tunnelRoute: '/monitoring').
//
// @sentry/nextjs generates this exact file during Vercel builds when the app
// has none; owning it lets us cap the duration. Without a cap, an envelope
// upload cut off mid-body (tab closed during a keepalive send) left the
// function waiting for the rest until Vercel's 300s limit — billed time per
// hang (seen 2026-11-22: two "Task timed out after 300 seconds" on POST
// /monitoring). Envelopes are small; 10s is plenty.
export { POST } from '@sentry/nextjs/tunnel';

export const maxDuration = 10;
