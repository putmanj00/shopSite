import { defineConfig, devices } from 'playwright/test';

// Three ways to run:
//   - local (default):   `next dev` on 127.0.0.1:3000
//   - CI:                tests the PRODUCTION build (`next start`); the CI job
//                        runs `next build` first so build time is not spent
//                        inside the webServer timeout
//   - BASE_URL=<url>:    no local server; target a deployed preview or prod.
//                        Use `--grep @smoke` against prod (read-only specs).
const BASE_URL = process.env.BASE_URL;
const LOCAL_URL = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/support/require-shopify-env.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: BASE_URL || LOCAL_URL,
    trace: 'on-first-retry',
  },
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: BASE_URL
    ? undefined
    : {
        command: process.env.CI
          ? 'next start -H 127.0.0.1 -p 3000'
          : 'next dev --webpack -H 127.0.0.1 -p 3000',
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
