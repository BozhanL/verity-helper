import { describeExcise, getMessages } from "../../src/i18n/messages";
import type { Swap } from "../../src/lib/verity";
import { expect, test } from "./fixtures";
import { choose, openTool } from "./helpers";

test.use({ hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`${locale} ${theme}: untimed exercise completes after ten minutes and mode changes apply on restart`, async ({
      page,
    }, testInfo) => {
      const messages = getMessages(locale);
      await page.addInitScript((value) => {
        localStorage.setItem("verity-theme", value);
        Math.random = (): number => 0;
      }, theme);
      await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
      await openTool(page, (locale === "zh" ? "zh/" : "") + "verity/exercise/");
      const timed = page.getByRole("radio", {
        name: messages.practiceModes.timed,
        exact: true,
      });
      await timed.focus();
      await page.keyboard.down("ArrowRight");
      await expect(
        page.getByRole("radio", {
          name: messages.practiceModes.untimed,
          exact: true,
        }),
      ).toBeChecked();
      await page.keyboard.up("ArrowRight");
      await page
        .getByRole("button", { name: messages.start, exact: true })
        .tap();
      await page.clock.fastForward(600000);
      await expect(
        page.getByRole("heading", { name: messages.running }),
      ).toBeVisible();
      await expect(page.getByRole("timer")).toHaveCount(0);
      await expect(page.getByRole("progressbar")).toHaveCount(0);
      await expect(
        page.getByText(messages.noTimeLimit, { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("img")).toHaveCount(6);
      await page.screenshot({
        path: testInfo.outputPath(`untimed-${locale}-${theme}.png`),
        fullPage: true,
      });
      const firstCut = page.getByRole("button", {
        name: describeExcise(locale, { statue: 0, shape: "circle" }),
        exact: true,
      });
      await firstCut.tap();
      await choose(page, messages.practiceMode, messages.practiceModes.timed);
      await expect(firstCut).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("timer")).toHaveCount(0);
      await page
        .getByRole("button", { name: messages.cancel, exact: true })
        .tap();
      const swaps: readonly Swap[] = [
        [
          { statue: 0, shape: "circle" },
          { statue: 1, shape: "triangle" },
        ],
        [
          { statue: 0, shape: "circle" },
          { statue: 2, shape: "square" },
        ],
        [
          { statue: 1, shape: "triangle" },
          { statue: 2, shape: "square" },
        ],
      ];
      for (const swap of swaps) {
        for (const selection of swap) {
          await choose(
            page,
            messages.currentShape,
            messages.shapes[selection.shape],
          );
          await page
            .getByRole("button", {
              name: describeExcise(locale, selection),
              exact: true,
            })
            .tap();
        }
      }
      await expect(
        page.getByRole("heading", { name: messages.won }),
      ).toBeVisible();
      await expect(
        page.locator(".goal-board, .shape-composition, .after-swap"),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: messages.newExercise, exact: true })
        .tap();
      await expect(page.getByRole("timer")).toHaveText("3:30");
      await choose(page, messages.practiceMode, messages.practiceModes.untimed);
      await page.clock.fastForward(210000);
      await expect(
        page.getByRole("heading", { name: messages.expired }),
      ).toBeVisible();
      await expect(page.locator(".button--excise:enabled")).toHaveCount(0);
      await page
        .getByRole("button", { name: messages.newExercise, exact: true })
        .tap();
      await expect(page.getByRole("timer")).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: messages.running }),
      ).toBeVisible();
    });
  }
}
