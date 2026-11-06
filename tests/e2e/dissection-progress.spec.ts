import { getMessages } from "../../src/i18n/messages";
import { expect, test } from "./fixtures";
import { choose, chooseInside, openTool, setStoredTheme } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`${locale} ${theme}: dissection marks survive interruptions and clear with changed inputs or navigation`, async ({
      page,
    }, testInfo) => {
      const messages = getMessages(locale);
      const route = (locale === "zh" ? "zh/" : "") + "verity/";
      await setStoredTheme(page, theme);
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
      function selection(
        step: number,
        choice: number,
      ): ReturnType<typeof page.getByRole> {
        const prefix = messages.markSelectionDone
          .replace("{step}", String(step))
          .replace("{selection}", String(choice))
          .replace("{cut}", "");
        return page.locator(`button[aria-label^=${JSON.stringify(prefix)}]`);
      }
      const undo = page.getByRole("button", {
        name: messages.undoSwapMark,
        exact: true,
      });
      await populate();
      await expect(page.locator(".selection-marks")).toHaveCount(0);
      await expect(
        page.locator(".swap-instruction .selection-mark"),
      ).toHaveCount(6);
      await expect(mark(2)).toBeDisabled();
      await expect(selection(2, 1)).toBeDisabled();
      await selection(1, 2).focus();
      await page.keyboard.press("Space");
      await page.keyboard.press("Space");
      await expect(selection(1, 2)).toHaveAttribute("aria-pressed", "true");
      await expect(selection(1, 2).locator(".cut-number")).toHaveText("✓");
      await expect(selection(1, 1).locator(".cut-number")).toHaveText("1");
      await expect(selection(1, 1)).toHaveAttribute("aria-pressed", "false");
      await expect(progress(0)).toBeVisible();
      await expect(mark(1)).toBeEnabled();
      await page
        .getByRole("link", { name: messages.editInputs, exact: true })
        .tap();
      await page
        .getByRole("link", { name: messages.viewResult + " ↓", exact: true })
        .tap();
      await expect(selection(1, 2)).toHaveAttribute("aria-pressed", "true");
      const partial = messages.selectionProgress
        .replace("{step}", "1")
        .replace("{done}", "1");
      await expect(
        page.getByRole("status").filter({ hasText: partial }),
      ).toHaveText(partial);
      await expect(
        page.locator('.sequence > li[aria-current="step"]'),
      ).toContainText(messages.swap + " 1");
      await page.screenshot({
        path: testInfo.outputPath(`progress-${locale}-${theme}.png`),
        fullPage: true,
      });
      await mark(1).focus();
      await page.keyboard.press("Enter");
      await expect(progress(1)).toBeVisible();
      await expect(selection(1, 1)).toHaveAttribute("aria-pressed", "true");
      await expect(mark(1)).toBeDisabled();
      await undo.tap();
      await expect(selection(1, 2)).toHaveAttribute("aria-pressed", "true");
      await expect(selection(1, 1)).toHaveAttribute("aria-pressed", "false");
      await undo.tap();
      await expect(progress(0)).toBeVisible();
      await expect(undo).toBeDisabled();
      await selection(1, 1).tap();
      await selection(1, 2).tap();
      await expect(progress(1)).toBeVisible();
      for (const step of [2, 3]) {
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
      await selection(1, 1).tap();
      await choose(page, left, messages.solids.cube);
      await expect(
        page.getByRole("button", { name: messages.undoSwapMark, exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: messages.reset, exact: true })
        .tap();
      await expect(page.locator(".sequence")).toHaveCount(0);
      await populate();
      await selection(1, 2).tap();
      await page
        .getByRole("button", { name: messages.reset, exact: true })
        .tap();
      await expect(page.locator(".sequence")).toHaveCount(0);
      await populate();
      await expect(undo).toBeDisabled();
      await selection(1, 1).tap();
      await page.reload();
      await expect(page.locator(".readiness")).toHaveText(
        messages.controlsReady,
      );
      await populate();
      await expect(progress(0)).toBeVisible();
      await expect(undo).toBeDisabled();
      await selection(1, 2).tap();
      await openTool(page, (locale === "zh" ? "zh/" : "") + "verity/exercise/");
      await openTool(page, route);
      await populate();
      await expect(progress(0)).toBeVisible();
      await expect(undo).toBeDisabled();
      await expect(page.getByRole("button", { pressed: true })).toHaveCount(0);
      await expect(page.locator("html")).toHaveJSProperty(
        "scrollWidth",
        await page.locator("html").evaluate((element) => element.clientWidth),
      );
    });
  }
}
