import { defineConfig, devices } from "@playwright/test";

/*
 * Real-browser tests for the primitives, beside the jsdom unit tests.
 *
 * Browser: Playwright's own Chromium by default (`npx playwright install
 * chromium`). Where that download is not possible, point CHROMIUM_PATH at any
 * Chromium executable; the launch then adds the flags a root, GPU-less
 * container needs. See the README, "Browser tests".
 */

const port = Number(process.env.PORT ?? 4317);
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  outputDir: "./e2e/.results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries: a browser test that needs one is reporting a race.
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        launchOptions: executablePath
          ? { executablePath, args: ["--no-sandbox", "--disable-gpu"] }
          : {},
      },
    },
  ],
  webServer: {
    command: "node e2e/serve.mjs",
    url: `http://127.0.0.1:${port}/`,
    env: { PORT: String(port) },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
