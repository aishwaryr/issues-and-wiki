import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  // First request to a route compiles it in dev, which can take several seconds.
  timeout: 60_000,
  // Matches the Cypress helpers' 20s redirect timeout; the 5s default is too short
  // while dev compiles a route for the first time.
  expect: { timeout: 20_000 },
  use: {
    baseURL: "http://localhost:3000",
    // Uses the locally installed Google Chrome rather than a downloaded Chromium build.
    channel: "chrome",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
