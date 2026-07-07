import type { NextConfig } from "next";
import createMDX from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';

// ─────────────────────────────────────────────────────────────────────────────
// CSP ENFORCEMENT FLAG
// Currently set to false (Report-Only mode). After deploying to production and
// confirming zero violations in browser DevTools console during a full user
// session (including checkout flow), flip this to true to enforce the policy.
//
// To switch to enforcing:
//   1. Set CSP_ENFORCE = true
//   2. Deploy and test: npm run build && npm run start
//   3. Confirm checkout still works end-to-end
// ─────────────────────────────────────────────────────────────────────────────
const CSP_ENFORCE = false;

const isDev = process.env.NODE_ENV === 'development';

const cspValue = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev ? "'unsafe-eval'" : '',
    '*.shopify.com *.myshopify.com',
    '*.google-analytics.com *.googletagmanager.com',
  ].filter(Boolean).join(' '),
  // cdn.judge.me serves the review widget CSS; it 302-redirects to cdn.shopify.com
  // (Shopify app-extension asset host), so both origins are allowed for styles.
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.judge.me cdn.shopify.com",
  // data: covers Judge.me's icon-font (embedded as a data: URI in its widget CSS).
  "font-src 'self' fonts.gstatic.com data:",
  // cdn.judge.me serves reviewer avatars/photos in the Judge.me review widget.
  "img-src 'self' blob: data: cdn.shopify.com *.shopify.com cdn.judge.me *.google-analytics.com",
  "connect-src 'self' *.shopify.com *.myshopify.com checkout.shopify.com *.google-analytics.com *.googletagmanager.com",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.shopify.com checkout.shopify.com",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  {
    key: CSP_ENFORCE ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    value: cspValue,
  },
  {
    // max-age=63072000 = 2 years; includeSubDomains; preload for HSTS preload list
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // DENY: no framing allowed at all (more restrictive than SAMEORIGIN)
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      // TODO: Remove images.unsplash.com once placeholder images in instagram-gallery,
      // brand-story, testimonial-carousel, and welcome-popup are replaced with real content
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

const withMDX = createMDX({});
export default withSentryConfig(
  withMDX(nextConfig),
  {
    // Replace YOUR_ORG_SLUG with your actual Sentry org slug (visible in URL: sentry.io/organizations/YOUR-SLUG/)
    org: 'wildenflower',
    project: 'wildenflower',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    tunnelRoute: '/monitoring',  // SDK creates Next.js rewrite internally — no manual route.ts needed
    silent: !process.env.CI,    // quiet locally, verbose in CI
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    widenClientFileUpload: true,
  }
);
