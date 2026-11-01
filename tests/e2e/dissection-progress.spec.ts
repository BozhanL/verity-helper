import { getMessages } from "../../src/i18n/messages";
import { expect, test } from "./fixtures";
import { choose, chooseInside, openTool } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`${locale} ${theme}: dissection marks survive interruptions and clear with changed inputs or navigation`, async ({
      page,
    }, testInfo) => {
      const messages = getMessages(locale);
      const route = (locale === "zh" ? "zh/" : "") + "verity/";
      await page.addInitScript((value) => {
        localStorage.setItem("verity-theme", value);
      }, theme);
      await openTool(page, route);
      const left = messages.positions[0] + " · " + messages.outside;
      const middle = messages.positions[1] + " · " + messages.outside;
      async function populate(): Promise<void> {
        await chooseInside(page, locale);
        await choose(page, left, messages.solids.sphere);
        await choose(page, middle, messages.solids.pyramid);
      }
      function mark(step: number): ReturnType<typeof page.getByRole> {
        return page.getByRole("button", {
          name: messages.markSwapDone.replace("{step}", String(step)),
          exact: true,
        });
      }
      function progress(done: number): ReturnType<typeof page.getByText> {
        return page.getByText(
          messages.swapProgress
            .replace("{done}", String(done))
            .replace("{total}", "3"),
          { exact: true },
        );
      }
      await populate();
      await expect(mark(2)).toBeDisabled();
      await mark(1).focus();
      await page.keyboard.press("Space");
      await expect(progress(1)).toBeVisible();
      await expect(mark(1)).toBeDisabled();
      await page
        .getByRole("link", { name: messages.editInputs, exact: true })
        .tap();
      await page
        .getByRole("link", { name: messages.viewResult + " ↓", exact: true })
        .tap();
      await expect(progress(1)).toBeVisible();
      await expect(
        page.locator('.sequence > li[aria-current="step"]'),
      ).toContainText(messages.swap + " 2");
      await page.screenshot({
        path: testInfo.outputPath(`progress-${locale}-${theme}.png`),
        fullPage: true,
      });
      await page
        .getByRole("button", { name: messages.undoSwapMark, exact: true })
        .tap();
      await expect(progress(0)).toBeVisible();
      for (const step of [1, 2, 3]) {
        await mark(step).tap();
      }
      await expect(
        page.getByText(messages.allSwapsMarked, { exact: true }),
      ).toBeVisible();
      await expect(
        page.locator('.sequence > li[aria-current="step"]'),
      ).toHaveCount(0);
      await choose(page, middle, messages.solids.sphere);
      await expect(page.getByRole("alert")).toBeVisible();
      await choose(page, middle, messages.solids.pyramid);
      await expect(progress(0)).toBeVisible();
      await mark(1).tap();
      await choose(page, left, messages.solids.cube);
      await expect(
        page.getByRole("button", { name: messages.undoSwapMark, exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: messages.reset, exact: true })
        .tap();
      await expect(page.locator(".sequence")).toHaveCount(0);
      await populate();
      await mark(1).tap();
      await page.reload();
      await expect(page.locator(".readiness")).toHaveText(
        messages.controlsReady,
      );
      await populate();
      await expect(progress(0)).toBeVisible();
      await mark(1).tap();
      await openTool(page, (locale === "zh" ? "zh/" : "") + "verity/exercise/");
      await openTool(page, route);
      await populate();
      await expect(progress(0)).toBeVisible();
      await expect(page.locator("html")).toHaveJSProperty(
        "scrollWidth",
        await page.locator("html").evaluate((element) => element.clientWidth),
      );
    });
  }
}
