import { defineConfig } from "@playwright/test";
import { env } from "node:process";

const basePath = env.BASE_PATH ?? "/";
const baseURL = `http://127.0.0.1:4322${basePath.endsWith("/") ? basePath : basePath + "/"}`;
const artifactName = basePath === "/" ? "root" : "subdirectory";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 60_000,
  workers: 2,
  retries: env.CI ? 1 : 0,
  outputDir: `test-results/${artifactName}`,
  reporter: [
    ["list"],
    [
      "html",
      { open: "never", outputFolder: `playwright-report/${artifactName}` },
    ],
  ],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4322",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
