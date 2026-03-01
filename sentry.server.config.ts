import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Undefined in dev (SENTRY_DSN not set locally) → SDK self-disables silently
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV ?? 'production',
});
