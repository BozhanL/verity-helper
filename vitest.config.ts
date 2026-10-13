import { getViteConfig } from "astro/config";
import type {} from "vitest/config";

export default getViteConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
