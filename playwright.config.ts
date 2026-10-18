import { defineConfig } from "@playwright/test";

// Port for the production server the tests run against; :3000 stays free for `npm run dev`.
const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  // Leaves room for a sleeping Neon database to wake up on the first query.
  expect: { timeout: 10_000 },
  // `list` for the terminal; `html` feeds `npx playwright show-report`.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the locally installed Google Chrome rather than a downloaded Chromium build.
    channel: "chrome",
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
