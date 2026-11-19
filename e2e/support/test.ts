import { test as base, expect, type ConsoleMessage } from 'playwright/test';

// Shared Playwright fixture for every spec. Import `test`/`expect` from here,
// not from 'playwright/test', so each page gets the same guards:
//
//   0. Vercel analytics scripts stubbed (see the `page` fixture).
//   1. Cookie banner pre-dismissed. It is fixed to the bottom of the viewport
//      and overlaps the mobile bottom nav / cart footer. Specs that test the
//      banner itself opt out with `test.use({ cookieConsent: null })`.
//   2. The test fails if the page logs a console error, throws an uncaught
//      exception, or React reports a hydration mismatch. Known third-party or
//      environment noise goes in IGNORED_CONSOLE_ERRORS with a reason; a spec
//      that expects an error can extend it via `test.use({ allowedConsoleErrors })`.

const CONSENT_KEY = 'wildenflower_cookie_consent';

// Each entry needs a reason. Keep this short: a growing list means the guard
// stops guarding.
const IGNORED_CONSOLE_ERRORS: ReadonlyArray<RegExp> = [
  // CSP is Report-Only while violations are collected (next.config.ts
  // CSP_ENFORCE=false). Reports are the point; they are not app errors.
  /\[Report Only\]/i,
  // WebKit: the Report-Only policy has no report-to endpoint, so it collects
  // nothing (Phase-1 leftover: add an endpoint before "collect then enforce").
  // Remove this entry when report-to lands.
  /delivered in report-only mode, but does not specify a 'report-to'/,
  // Vercel analytics scripts exist only on Vercel's edge. The `page` fixture
  // stubs them, but public/sw.js re-fetches same-origin requests itself, and
  // service-worker fetches bypass page.route(), so on reload the 404 can still
  // surface (seen in Firefox). Off-Vercel CI noise only.
  /\/_vercel\/(speed-)?insights\//,
];

const HYDRATION_PATTERNS: ReadonlyArray<RegExp> = [
  /hydrat/i,
  /did not match/i,
  /server rendered (HTML|text) didn't match/i,
];

type Fixtures = {
  cookieConsent: 'accepted' | 'rejected' | null;
  allowedConsoleErrors: ReadonlyArray<RegExp>;
  pageErrorGuard: void;
};

export const test = base.extend<Fixtures>({
  cookieConsent: ['accepted', { option: true }],
  allowedConsoleErrors: [[], { option: true }],

  // Playwright's fixture callback is conventionally `use`; named `provide` so
  // eslint's react-hooks rule does not mistake it for React's use().
  page: async ({ page, cookieConsent }, provide) => {
    // Vercel Web Analytics / Speed Insights scripts only exist on Vercel's
    // edge; off-Vercel (`next start` in CI) they 404 and log console errors.
    // Stubbing them also keeps test traffic out of real analytics when a
    // smoke run targets a deployed BASE_URL.
    await page.route('**/_vercel/{insights,speed-insights}/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    );
    if (cookieConsent) {
      await page.addInitScript(
        ([key, value]) => {
          try {
            window.localStorage.setItem(key, value);
          } catch {
            // Opaque origins (about:blank, data:) have no localStorage.
          }
        },
        [CONSENT_KEY, cookieConsent] as const,
      );
    }
    await provide(page);
  },

  pageErrorGuard: [
    async ({ page, allowedConsoleErrors, baseURL }, provide, testInfo) => {
      const problems: string[] = [];
      const ignored = [...IGNORED_CONSOLE_ERRORS, ...allowedConsoleErrors];
      // Only judge our own pages: once a test hands off to Shopify checkout,
      // that page's console is Shopify's problem.
      const appOrigin = baseURL ? new URL(baseURL).origin : null;
      const onAppPage = () => !appOrigin || page.url().startsWith(appOrigin);

      const onConsole = (msg: ConsoleMessage) => {
        if (!onAppPage()) return;
        const text = msg.text();
        const isError = msg.type() === 'error';
        const isHydration =
          (isError || msg.type() === 'warning') &&
          HYDRATION_PATTERNS.some((re) => re.test(text));
        if (!isError && !isHydration) return;
        if (ignored.some((re) => re.test(text))) return;
        const where = msg.location().url;
        problems.push(
          `${isHydration ? 'hydration' : 'console.error'}: ${text}${where ? ` (${where})` : ''}`,
        );
      };
      const onPageError = (err: Error) => {
        if (!onAppPage()) return;
        problems.push(`uncaught: ${err.message}`);
      };

      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      await provide();
      page.off('console', onConsole);
      page.off('pageerror', onPageError);

      if (problems.length > 0) {
        await testInfo.attach('page-errors', {
          body: problems.join('\n'),
          contentType: 'text/plain',
        });
      }
      expect(problems, 'page logged errors during the test').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
