import type { NextConfig } from "next";
import createMDX from '@next/mdx';

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
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com",
  "img-src 'self' blob: data: cdn.shopify.com *.shopify.com *.google-analytics.com",
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
export default withMDX(nextConfig);
