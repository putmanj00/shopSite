import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // NEXT_PUBLIC_ prefix required — browser cannot read non-public env vars
  // Undefined in dev (not set in Vercel dev env) → SDK self-disables
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV ?? 'production',
  // Session replay omitted — not needed for v1.2
});
