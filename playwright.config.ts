import { defineConfig, devices } from "@playwright/test";
import { env } from "node:process";

const basePath = env.BASE_PATH ?? "/";
const baseURL = `http://localhost:4322${basePath.endsWith("/") ? basePath : basePath + "/"}`;
const artifactName = basePath === "/" ? "root" : "subdirectory";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 60_000,
  workers: env.CI ? "100%" : "75%",
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
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
    {
      name: "Desktop Chrome HiDPI",
      use: devices["Desktop Chrome HiDPI"],
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
    },
    {
      name: "Desktop Firefox HiDPI",
      use: devices["Desktop Firefox HiDPI"],
    },
    {
      name: "webkit",
      use: devices["Desktop Safari"],
    },
    {
      name: "Mobile Chrome",
      use: devices["Pixel 5"],
    },
    {
      name: "Galaxy Z Fold 6 Cover landscape",
      use: devices["Galaxy Z Fold 6 Cover landscape"],
    },
    {
      name: "Mobile Safari",
      use: devices["iPhone 12"],
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host localhost --port 4322",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
