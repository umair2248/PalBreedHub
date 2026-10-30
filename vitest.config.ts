import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Component tests render all ~290 Pals in jsdom, which can take a few seconds per test
    // when several test files run in parallel
    testTimeout: 30_000,
  },
});
