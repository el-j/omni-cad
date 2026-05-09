import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./src/test/e2e/stories",
  // CI environments need more time due to headless/xvfb-run startup overhead
  timeout: isCI ? 180000 : 120000,
  expect: {
    timeout: 20000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    video: "on",
  },
});
