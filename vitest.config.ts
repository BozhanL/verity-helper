import { getViteConfig } from "astro/config";
import type {} from "vitest/config";

export default getViteConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.d.ts"],
      reporter: ["text-summary", "json-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
    },
  },
});
