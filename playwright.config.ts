import { defineConfig } from "@playwright/test";

// Port for the production server the tests run against; :3000 stays free for `npm run dev`.
const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  // In CI (GitHub Actions sets CI=true): a stray test.only fails the run, and a failed
  // test gets one retry with a trace, so the report shows what happened.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Leaves room for a sleeping Neon database to wake up on the first query.
  expect: { timeout: 10_000 },
  // `list` for the terminal; `html` feeds `npx playwright show-report`.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the locally installed Google Chrome rather than a downloaded Chromium build.
    channel: "chrome",
    trace: "on-first-retry",
  },
  // A production build, not `next dev`: no compile on first hit and no Fast Refresh
  // reloads from parallel tests, so results don't depend on what dev compiled before.
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
