import type { Page } from "@playwright/test";
import { getMessages } from "../../src/i18n/messages";
import { expect, test } from "./fixtures";
import { choose, chooseInside, chooseSelf, openTool, ROUTES } from "./helpers";

test.use({ hasTouch: true });
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 844, height: 390 },
  { width: 1180, height: 820 },
];

async function assertTouchTargets(page: Page): Promise<void> {
  const controls = page.locator(
    "button:visible, select:visible, .page-navigation a, .language-navigation a, .reference-links a, .brand",
  );
  for (const control of await controls.all()) {
    const box = await control.boundingBox();
    expect(
      box,
      "Visible controls need a measurable touch target",
    ).not.toBeNull();
    if (box !== null) {
      expect(
        box.width,
        (await control.textContent()) ?? "Control",
      ).toBeGreaterThanOrEqual(44);
      expect(
        box.height,
        (await control.textContent()) ?? "Control",
      ).toBeGreaterThanOrEqual(44);
    }
  }
}

for (const viewport of VIEWPORTS) {
  for (const theme of ["light", "dark"] as const) {
    test(`${String(viewport.width)}x${String(viewport.height)} ${theme}: all localized tools fit and remain usable`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.addInitScript((value) => {
        localStorage.setItem("verity-theme", value);
      }, theme);
      for (const route of ROUTES) {
        const messages = getMessages(route.locale);
        await openTool(page, route.path);
        if (route.tool === "calculator") {
          await chooseInside(page, route.locale);
          await choose(
            page,
            messages.positions[0] + " · " + messages.outside,
            messages.solids.sphere,
          );
          await choose(
            page,
            messages.positions[1] + " · " + messages.outside,
            messages.solids.pyramid,
          );
          await expect(
            page.getByRole("heading", {
              name: messages.swap + " 3",
              exact: true,
            }),
          ).toBeVisible();
        } else if (route.tool === "solo") {
          await chooseInside(page, route.locale);
          await chooseSelf(page, route.locale);
          await choose(page, messages.soloFirstShape, messages.shapes.circle);
          await choose(page, messages.soloSecondShape, messages.shapes.circle);
          await expect(
            page
              .getByRole("region", { name: messages.soloDistribution })
              .getByRole("img"),
          ).toHaveCount(3);
        } else {
          await page
            .getByRole("button", { name: messages.start, exact: true })
            .tap();
          await page.locator(".button--excise:enabled").first().tap();
          await expect(
            page.getByRole("button", { name: messages.cancel, exact: true }),
          ).toBeVisible();
          if (viewport.height < 600) {
            await expect(page.locator(".exercise-controls")).toHaveCSS(
              "position",
              "static",
            );
          }
        }
        const width = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
        }));
        expect(
          width.scroll,
          route.path + " must not overflow horizontally",
        ).toBeLessThanOrEqual(width.viewport);
        await assertTouchTargets(page);
        if (
          route.locale === "en" &&
          [390, 820, 1440].includes(viewport.width)
        ) {
          await page.evaluate(() => {
            window.scrollTo(0, 0);
          });
          await page.screenshot({
            animations: "disabled",
            path: testInfo.outputPath(
              `${route.tool}-${String(viewport.width)}-${theme}.png`,
            ),
            fullPage: true,
          });
        }
      }
    });
  }
}
