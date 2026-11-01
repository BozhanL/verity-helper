import { describeExcise, getMessages } from "../../src/i18n/messages";
import type { Excise, Swap } from "../../src/lib/verity";
import { expect, test } from "./fixtures";
import { choose, openTool } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`${locale} ${theme}: retries restore the same unaided puzzle after moves, timeout, and completion`, async ({
      page,
    }, testInfo) => {
      const messages = getMessages(locale);
      const prefix = locale === "zh" ? "zh/" : "";
      await page.addInitScript((value) => {
        localStorage.setItem("verity-theme", value);
        Math.random = (): number => 0;
      }, theme);
      await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
      await openTool(page, prefix + "verity/exercise/");
      const retry = page.getByRole("button", {
        name: messages.retryExercise,
        exact: true,
      });
      async function diagrams(): Promise<(string | null)[]> {
        return await page
          .getByRole("img")
          .evaluateAll((images) =>
            images.map((image) => image.getAttribute("aria-label")),
          );
      }
      async function excise(selection: Excise): Promise<void> {
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
      await expect(retry).toHaveCount(0);
      await page
        .getByRole("button", { name: messages.start, exact: true })
        .tap();
      const original = await diagrams();
      await choose(page, messages.currentShape, messages.shapes.triangle);
      await expect(
        page.getByRole("button", {
          name: describeExcise(locale, { statue: 0, shape: "triangle" }),
          exact: true,
        }),
      ).toBeDisabled();
      await excise({ statue: 0, shape: "circle" });
      await excise({ statue: 1, shape: "triangle" });
      await excise({ statue: 2, shape: "square" });
      await choose(page, messages.practiceMode, messages.practiceModes.untimed);
      await expect(page.getByRole("timer")).toBeVisible();
      await expect(
        page.getByRole("button", { name: messages.cancel, exact: true }),
      ).toBeVisible();
      await retry.focus();
      await page.keyboard.press("Space");
      expect(await diagrams()).toEqual(original);
      await expect(page.getByRole("timer")).toHaveCount(0);
      await expect(page.getByRole("progressbar")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: messages.cancel, exact: true }),
      ).toHaveCount(0);
      await expect(page.locator(".round-metric strong")).toHaveText("00");
      await expect(
        page
          .getByRole("radiogroup", { name: messages.currentShape, exact: true })
          .getByRole("radio", { name: messages.shapes.circle, exact: true }),
      ).toBeChecked();
      await page.clock.fastForward(600000);
      await expect(
        page.getByRole("heading", { name: messages.running }),
      ).toBeVisible();
      await retry.tap();
      expect(await diagrams()).toEqual(original);
      const actions = await page.locator(".round-actions").boundingBox();
      const status = await page.locator(".round-status").boundingBox();
      expect(actions).not.toBeNull();
      expect(status).not.toBeNull();
      if (actions !== null && status !== null) {
        expect(status.y - actions.y - actions.height).toBeGreaterThanOrEqual(8);
      }
      await page.screenshot({
        path: testInfo.outputPath(`retry-${locale}-${theme}.png`),
        fullPage: true,
      });
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
          await excise(selection);
        }
      }
      await expect(
        page.getByRole("heading", { name: messages.won }),
      ).toBeVisible();
      await choose(page, messages.practiceMode, messages.practiceModes.timed);
      await retry.tap();
      expect(await diagrams()).toEqual(original);
      await expect(page.getByRole("timer")).toHaveText("3:30");
      await page.clock.fastForward(210000);
      await expect(
        page.getByRole("heading", { name: messages.expired }),
      ).toBeVisible();
      await expect(page.locator(".button--excise:enabled")).toHaveCount(0);
      await choose(page, messages.practiceMode, messages.practiceModes.untimed);
      await retry.tap();
      expect(await diagrams()).toEqual(original);
      await expect(page.getByRole("timer")).toHaveCount(0);
      await page.evaluate(() => {
        Math.random = (): number => 0.9;
      });
      await page
        .getByRole("button", { name: messages.newExercise, exact: true })
        .tap();
      const next = await diagrams();
      expect(next).not.toEqual(original);
      await page.locator(".button--excise:enabled").first().tap();
      await retry.tap();
      expect(await diagrams()).toEqual(next);
      await expect(page.getByRole("img")).toHaveCount(6);
      await expect(
        page.locator(".goal-board, .shape-composition, .after-swap"),
      ).toHaveCount(0);
      await page.reload();
      await expect(page.locator(".readiness")).toHaveText(
        messages.controlsReady,
      );
      await expect(retry).toHaveCount(0);
      await page
        .getByRole("button", { name: messages.start, exact: true })
        .tap();
      await openTool(page, prefix + "verity/");
      await openTool(page, prefix + "verity/exercise/");
      await expect(retry).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: messages.start, exact: true }),
      ).toBeEnabled();
    });
  }
}
