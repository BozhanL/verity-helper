import { getMessages } from "../../src/i18n/messages";
import { expect, test } from "./fixtures";
import { choose, chooseInside, chooseSelf, openTool } from "./helpers";

test.use({ hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`${locale} ${theme}: solo received shapes preserve keys and flag unfinished trades`, async ({
      page,
    }, testInfo) => {
      const messages = getMessages(locale);
      await page.addInitScript((value) => {
        localStorage.setItem("verity-theme", value);
      }, theme);
      await openTool(page, (locale === "zh" ? "zh/" : "") + "verity/solo/");
      await chooseInside(page, locale);
      await chooseSelf(page, locale);
      await choose(page, messages.soloFirstShape, messages.shapes.square);
      await choose(page, messages.soloSecondShape, messages.shapes.triangle);
      const opening = page.getByRole("radio", {
        name: messages.soloPhases.opening,
        exact: true,
      });
      await opening.focus();
      await page.keyboard.down("ArrowRight");
      await expect(
        page.getByRole("radio", {
          name: messages.soloPhases.after,
          exact: true,
        }),
      ).toBeChecked();
      await page.keyboard.up("ArrowRight");
      await expect(
        page.getByRole("heading", { name: messages.soloChooseRoom }),
      ).toBeVisible();
      await choose(page, messages.soloFirstShape, messages.shapes.circle);
      await choose(page, messages.soloSecondShape, messages.shapes.triangle);
      await page.getByRole("link", { name: messages.viewResult }).click();
      const result = page.getByRole("region", {
        name: messages.soloDistribution,
      });
      await expect(
        result.getByRole("heading", { name: messages.soloKeyReady }),
      ).toBeVisible();
      await expect(result).toContainText(messages.soloKeyHint);
      await expect(
        result.getByText(messages.soloGive, { exact: true }),
      ).toHaveCount(0);
      await page.screenshot({
        path: testInfo.outputPath(`solo-key-${locale}-${theme}.png`),
        fullPage: true,
      });
      await choose(page, messages.soloSecondShape, messages.shapes.circle);
      await expect(result).toContainText(messages.soloTradeHint);
      await choose(page, messages.soloFirstShape, messages.shapes.square);
      await expect(result.getByRole("alert")).toContainText(
        messages.soloAfterInvalid,
      );
      await expect(result.getByRole("img")).toHaveCount(0);
      await page
        .getByRole("button", { name: messages.reset, exact: true })
        .click();
      await expect(opening).toBeChecked();
      await expect(
        page.getByRole("heading", { name: messages.soloChooseStatues }),
      ).toBeVisible();
    });
  }
}
