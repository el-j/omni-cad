import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e/stories",
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    video: "on",
  },
});
