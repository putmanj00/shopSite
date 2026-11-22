import type { NextConfig } from "next";
import createMDX from '@next/mdx';
// v11 moved the build wrapper to the /config entry point.
import { withSentryConfig } from '@sentry/nextjs/config';

// ─────────────────────────────────────────────────────────────────────────────
// CSP ENFORCEMENT FLAG
// Currently false (Report-Only). Violations are POSTed to /api/csp-report
// and land in the Vercel function log ("[csp-report]") + sampled Sentry
// issues ("CSP report: <directive> blocked <origin>").
//
// To switch to enforcing:
//   1. Collect ~1 week of production reports; fix or allow-list each source
//   2. Set CSP_ENFORCE = true
//   3. Deploy and test: npm run build && npm run start
//   4. Confirm checkout still works end-to-end
// ─────────────────────────────────────────────────────────────────────────────
const CSP_ENFORCE = false;

const isDev = process.env.NODE_ENV === 'development';

const CSP_REPORT_PATH = '/api/csp-report';

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
  // Ignored (with a console error) in Report-Only; X-Frame-Options: DENY
  // below already blocks framing until the policy is enforced.
  CSP_ENFORCE ? "frame-ancestors 'none'" : '',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.shopify.com checkout.shopify.com",
  // Same: ignored in Report-Only (console error on every page, caught by the
  // E2E page-error guard). HSTS already covers https until enforcement.
  CSP_ENFORCE ? "upgrade-insecure-requests" : '',
  // report-uri only. report-to (Reporting API) was tried in #113: violations
  // fired in Chromium and WebKit on www, but no report ever reached the
  // endpoint, while report-uri delivers. Browsers that see report-to ignore
  // report-uri, so having both cost Chrome/Safari reports. Revisit only with
  // a real-browser delivery check against prod logs.
  `report-uri ${CSP_REPORT_PATH}`,
].filter(Boolean).join('; ');

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
  {
    // The storefront uses none of these browser features; deny them outright.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
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
