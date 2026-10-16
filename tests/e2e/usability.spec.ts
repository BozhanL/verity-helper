import { getMessages } from "../../src/i18n/messages";
import { expect, test } from "./fixtures";
import {
  choose,
  chooseInside,
  chooseRepository,
  chooseSelf,
  openTool,
} from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  const prefix = locale === "en" ? "" : "zh/";
  const messages = getMessages(locale);

  for (const theme of ["light", "dark"] as const) {
    test(`${locale} ${theme}: Repository callouts, resonance, and closing fit together`, async ({
      page,
    }, testInfo) => {
      await page.addInitScript((value) => {
        localStorage.setItem("verity-theme", value);
      }, theme);
      await openTool(page, prefix + "repository/");
      await chooseRepository(page, locale);
      await page.locator("#repository-callouts").evaluate((element) => {
        element.scrollIntoView({ block: "start" });
      });
      for (const choice of await page
        .locator(".conductor-card .shape-choice")
        .all()) {
        await expect(choice).toBeInViewport({ ratio: 1 });
      }
      await expect(
        page.getByRole("radiogroup", { name: messages.repositoryTool.held }),
      ).toBeInViewport({ ratio: 1 });
      await expect(
        page.getByRole("region", { name: messages.repositoryTool.closing }),
      ).toBeInViewport({ ratio: 1 });
      await page.screenshot({
        path: testInfo.outputPath(`repository-pressure-${locale}-${theme}.png`),
      });
      await page
        .getByText(messages.repositoryTool.resonanceNames, { exact: true })
        .tap();
      await expect(page.locator(".resonance-key")).toContainText(
        messages.repositoryTool.resonances.square,
      );
    });
  }

  test(`${locale}: result links preserve selections and expose corrected instructions`, async ({
    page,
  }) => {
    await openTool(page, prefix + "verity/");
    await chooseInside(page, locale);
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
    await page.getByRole("link", { name: messages.viewResult }).tap();
    await expect(page.locator(".sequence > li").first()).toBeInViewport({
      ratio: 1,
    });
    await page.getByRole("link", { name: messages.editInputs }).tap();
    await expect(
      page
        .getByRole("radiogroup", {
          name: messages.positions[0] + " · " + messages.inside,
        })
        .getByRole("radio", { name: messages.shapes.circle }),
    ).toBeChecked();
    await choose(
      page,
      messages.positions[0] + " · " + messages.outside,
      messages.solids.prism,
    );
    await choose(
      page,
      messages.positions[1] + " · " + messages.outside,
      messages.solids.cylinder,
    );
    await page.getByRole("link", { name: messages.viewResult }).tap();
    await expect(
      page.getByRole("heading", { name: messages.solved }),
    ).toBeInViewport({ ratio: 1 });

    await openTool(page, prefix + "verity/solo/");
    await chooseInside(page, locale);
    await chooseSelf(page, locale);
    await choose(page, messages.soloFirstShape, messages.shapes.circle);
    await choose(page, messages.soloSecondShape, messages.shapes.circle);
    await page.getByRole("link", { name: messages.viewResult }).tap();
    await expect(
      page.getByRole("region", { name: messages.soloDistribution }),
    ).toBeInViewport({ ratio: 1 });
    await expect(
      page.getByText(messages.soloNothingToSend, { exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: messages.editInputs }).tap();
    await expect(
      page.getByRole("radio", {
        name:
          messages.soloStatue +
          ": " +
          messages.positions[2] +
          " (" +
          messages.shapes.square +
          ")",
      }),
    ).toBeChecked();
  });

  test(`${locale}: pending practice controls stay compact and do not cover focused actions`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Math.random = (): number => 0;
    });
    await openTool(page, prefix + "verity/exercise/");
    await page.getByRole("button", { name: messages.start, exact: true }).tap();
    await page.locator(".button--excise:enabled").first().tap();
    await expect(
      page.getByRole("button", { name: messages.cancel, exact: true }),
    ).toBeVisible();
    const picker = page.locator(".exercise-controls");
    const height = await picker.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    expect(height).toBeLessThanOrEqual(844 / 4);
    await choose(page, messages.currentShape, messages.shapes.triangle);
    const action = page.locator(".button--excise:enabled").first();
    await action.focus();
    await expect(action).toBeInViewport({ ratio: 1 });
    const controls = await picker.boundingBox();
    const button = await action.boundingBox();
    expect(controls).not.toBeNull();
    expect(button).not.toBeNull();
    if (controls !== null && button !== null) {
      expect(button.y).toBeGreaterThanOrEqual(controls.y + controls.height);
    }
    await expect(
      page.locator(".goal-board, .shape-composition, .after-swap"),
    ).toHaveCount(0);
  });

  test(`${locale}: controls wait for scripts and become visibly ready`, async ({
    page,
  }) => {
    for (const path of [
      "repository/",
      "verity/",
      "verity/solo/",
      "verity/exercise/",
    ]) {
      const { promise: scripts, resolve: releaseScripts } =
        Promise.withResolvers<undefined>();
      await page.route("**/*.js", async (route) => {
        await scripts;
        await route.continue();
      });
      try {
        await page.goto(prefix + path, { waitUntil: "commit" });
        await expect(page.locator(".readiness")).toHaveText(
          messages.controlsLoading,
        );
        for (const button of await page.getByRole("button").all()) {
          await expect(button).toBeDisabled();
        }
        await expect(page.getByRole("radio").first()).toBeDisabled();
      } finally {
        releaseScripts(undefined);
      }
      await expect(page.locator(".readiness")).toHaveText(
        messages.controlsReady,
      );
      await expect(page.getByRole("radio").first()).toBeEnabled();
      await page.unroute("**/*.js");
    }
  });
}

test.describe("zoom and reflow", () => {
  test.use({ viewport: { width: 640, height: 1136 } });
  test("tools reflow at 200% without horizontal scrolling", async ({
    page,
  }) => {
    for (const path of [
      "repository/",
      "verity/",
      "verity/solo/",
      "verity/exercise/",
    ]) {
      await openTool(page, path);
      await page.locator("html").evaluate((element) => {
        element.style.zoom = "2";
      });
      const width = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(width.scroll, path).toBeLessThanOrEqual(width.viewport);
      await page.getByRole("radio").first().tap();
      await expect(page.getByRole("radio").first()).toBeChecked();
    }
  });
});
