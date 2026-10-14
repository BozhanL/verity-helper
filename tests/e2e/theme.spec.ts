import { expect, test } from "./fixtures";
import { openTool } from "./helpers";

test("System follows device changes and manual choices take precedence", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await openTool(page, "");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("combobox", { name: "Theme" })).toHaveValue(
    "system",
  );
  await page.getByRole("combobox", { name: "Theme" }).selectOption("light");
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("combobox", { name: "Theme" }).selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#151624",
  );
});

test("saved choices survive reloads and localized tool navigation", async ({
  page,
  baseURL,
}) => {
  await openTool(page, "");
  await page.getByRole("combobox", { name: "Theme" }).selectOption("dark");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Theme" })).toHaveValue(
    "dark",
  );
  await page.getByRole("link", { name: "Solo room", exact: true }).click();
  await expect(page).toHaveURL(new URL("solo/", baseURL).href);
  await page
    .getByRole("link", { name: "\u7b80\u4f53\u4e2d\u6587", exact: true })
    .click();
  await expect(page).toHaveURL(new URL("zh/solo/", baseURL).href);
  await expect(
    page.getByRole("combobox", { name: "\u4e3b\u9898" }),
  ).toHaveValue("dark");
  await page.getByRole("link", { name: "\u7ec3\u4e60", exact: true }).click();
  await expect(page).toHaveURL(new URL("zh/exercise/", baseURL).href);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("persisted dark mode is applied before the first animation frame", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("verity-theme", "dark");
    requestAnimationFrame(() => {
      document.documentElement.dataset.firstFrameTheme =
        document.documentElement.dataset.theme ?? "";
    });
  });
  await openTool(page, "");
  await expect(page.locator("html")).toHaveAttribute(
    "data-first-frame-theme",
    "dark",
  );
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
});

test("theme choices synchronize between tabs", async ({ page, context }) => {
  await openTool(page, "");
  const other = await context.newPage();
  await openTool(other, "solo/");
  await page.getByRole("combobox", { name: "Theme" }).selectOption("dark");
  await expect(other.getByRole("combobox", { name: "Theme" })).toHaveValue(
    "dark",
  );
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await other.close();
});

test("invalid stored preferences fall back to System", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("verity-theme", "unknown");
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await openTool(page, "");
  await expect(page.getByRole("combobox", { name: "Theme" })).toHaveValue(
    "system",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("denied storage does not break theme selection or tool hydration", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get(): never {
        throw new DOMException("Denied", "SecurityError");
      },
    });
  });
  await openTool(page, "");
  await page.getByRole("combobox", { name: "Theme" }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("radiogroup", { name: "Left · Inside statues" })
    .getByRole("radio", { name: "Circle" })
    .click();
  await expect(
    page.getByRole("radio", { name: "Circle", checked: true }),
  ).toHaveCount(1);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, colorScheme: "dark" });
  test("CSS follows the device theme and keeps navigation available", async ({
    page,
  }) => {
    await page.goto("./");
    await expect(page.locator("html")).toHaveCSS(
      "background-color",
      "rgb(21, 22, 36)",
    );
    await expect(page.getByRole("combobox", { name: "Theme" })).toBeDisabled();
    await expect(page.getByRole("radio").first()).toBeDisabled();
    const warning = page.locator(".noscript-message");
    await expect(warning).toBeVisible();
    await expect(warning).toHaveJSProperty(
      "textContent",
      "JavaScript is needed to use these tools. Enable it, then reload this page.",
    );
    await page.getByRole("link", { name: "Solo room", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Solo room calculator" }),
    ).toBeVisible();
  });
});
