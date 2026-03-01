'use client';
import { useEffect } from 'react';

// TEMPORARY — delete after confirming Sentry dashboard shows both events (Phase 22 Plan 04)
export default function SentryTestPage() {
  useEffect(() => {
    // Client-side unhandled promise rejection
    Promise.reject(new Error('Sentry client test — delete this page after verifying dashboard'));
  }, []);
  return (
    <p style={{ padding: '2rem' }}>
      Sentry test page — client error fires on load. Check dashboard, then delete this route.
    </p>
  );
}
