import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// `reuseExistingServer` will happily adopt whatever is already on this port —
// including an unrelated app, whose redirect still satisfies the readiness
// check and leaves every test failing on a missing form. Override the port when
// something else is already using the default.
const PORT = process.env.E2E_PORT ?? '3000'

export default defineConfig({
  testDir: './dev',
  testMatch: '**/e2e.spec.{ts,js}',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${PORT}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    // The test page resolves the form over HTTP against this base URL and
    // falls back to port 3000, so without this it fetches whatever unrelated
    // app happens to be on 3000 and renders "Could not load form".
    env: { NEXT_PUBLIC_SERVER_URL: `http://localhost:${PORT}` },
    reuseExistingServer: true,
    // Must match the fetch endpoint registered in src/index.ts (`/form-data/:slug`)
    // and the slug seeded by dev/seed.ts — a 404 here never reports "ready".
    url: `http://localhost:${PORT}/api/form-data/travel-enquiry`,
    timeout: 120000,
  },
})
