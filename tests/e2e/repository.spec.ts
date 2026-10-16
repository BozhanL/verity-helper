import { getMessages } from "../../src/i18n/messages";
import { expect, test } from "./fixtures";
import {
  choose,
  chooseRepository,
  openPage,
  openTool,
  ROUTES,
} from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  const prefix = locale === "en" ? "" : "zh/";
  const messages = getMessages(locale);
  const text = messages.repositoryTool;

  test(`${locale}: Repository receives, infers, closes, corrects, and resets`, async ({
    page,
  }) => {
    await openTool(page, prefix + "repository/");
    await chooseRepository(page, locale);
    const receive = page.getByRole("region", { name: text.receive });
    const closing = page.getByRole("region", { name: text.closing });
    await expect(receive).toContainText(
      text.receiveAt.replace("{position}", messages.positions[1]),
    );
    await expect(receive).toContainText(
      text.askSender.replace("{position}", messages.positions[0]),
    );
    await expect(closing).toContainText(
      text.closeAt.replace("{position}", messages.positions[2]),
    );
    await expect(closing).toContainText(
      text.askSender.replace("{position}", messages.positions[1]),
    );
    await expect(page.getByRole("img")).toHaveCount(1);
    const middle = page.getByRole("radiogroup", {
      name: messages.positions[1] + " · " + text.conductor,
    });
    await expect(
      middle.getByRole("radio", { name: text.resonances.square }),
    ).toBeDisabled();
    await choose(
      page,
      messages.positions[0] + " · " + text.conductor,
      text.resonances.triangle,
    );
    await expect(page.getByRole("img")).toHaveAccessibleName(
      new RegExp(text.resonances.square),
    );
    await expect(closing).toContainText(
      text.closeAt.replace("{position}", messages.positions[0]),
    );
    await page
      .getByRole("button", {
        name: text.clearConductor.replace("{position}", messages.positions[0]),
      })
      .tap();
    await expect(page.getByRole("img")).toHaveCount(0);
    await expect(closing).toContainText(text.chooseClosing);
    await choose(
      page,
      messages.positions[2] + " · " + text.conductor,
      text.resonances.triangle,
    );
    await expect(page.getByRole("img")).toHaveAccessibleName(
      new RegExp(text.resonances.square),
    );
    await choose(page, text.held, text.resonances.circle);
    await expect(closing).toContainText(
      text.stayAt.replace("{position}", messages.positions[1]),
    );
    await choose(page, text.startPlate, messages.positions[1]);
    await expect(closing).toContainText(
      text.closeAt.replace("{position}", messages.positions[1]),
    );
    await expect(closing).toContainText(
      text.askSender.replace("{position}", messages.positions[0]),
    );
    await choose(page, text.room, text.rooms[2]);
    await expect(
      page
        .getByRole("radiogroup", { name: text.startPlate })
        .getByRole("radio", { name: messages.positions[1] }),
    ).toBeChecked();
    await expect(page.getByRole("img")).toHaveCount(0);
    await expect(
      page
        .getByRole("radiogroup", { name: text.held })
        .getByRole("radio", { checked: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: messages.reset, exact: true }).tap();
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(receive).toContainText(text.chooseRoute);
  });

  test(`${locale}: home groups encounter 4 tools and preserves the selected page across languages`, async ({
    page,
    baseURL,
  }) => {
    await openPage(page, prefix);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      messages.homeTitle,
    );
    await page
      .locator(".encounter-card")
      .filter({
        has: page.getByRole("heading", { name: messages.verityEncounter }),
      })
      .tap();
    await expect(page).toHaveURL(new URL(prefix + "verity/", baseURL).href);
    const tools = page.getByRole("navigation", {
      name: messages.toolNavigation,
    });
    await tools.getByRole("link", { name: messages.solo, exact: true }).tap();
    await expect(page).toHaveURL(
      new URL(prefix + "verity/solo/", baseURL).href,
    );
    await tools
      .getByRole("link", { name: messages.exercise, exact: true })
      .tap();
    await expect(page).toHaveURL(
      new URL(prefix + "verity/exercise/", baseURL).href,
    );
    await page
      .getByRole("navigation", { name: messages.navigation })
      .getByRole("link", { name: messages.repositoryEncounter })
      .tap();
    await expect(page).toHaveURL(new URL(prefix + "repository/", baseURL).href);
    await chooseRepository(page, locale);
    await expect(
      page.getByRole("navigation", { name: messages.toolNavigation }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: locale === "en" ? "简体中文" : "English",
        exact: true,
      })
      .tap();
    const oppositePrefix = locale === "en" ? "zh/" : "";
    await expect(page).toHaveURL(
      new URL(oppositePrefix + "repository/", baseURL).href,
    );
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
    await page.locator(".brand").tap();
    await expect(page).toHaveURL(new URL(oppositePrefix, baseURL).href);
  });
}

test("every page has the correct localized metadata and alternate links", async ({
  page,
  baseURL,
}) => {
  for (const route of ROUTES) {
    await openPage(page, route.path);
    const messages = getMessages(route.locale);
    const heading = {
      home: messages.homeTitle,
      repository: messages.repositoryTool.title,
      calculator: messages.calculatorTitle,
      solo: messages.soloTitle,
      exercise: messages.exerciseTitle,
    }[route.tool];
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      route.locale === "en" ? "en" : "zh-Hans",
    );
    const enPath = route.path.replace(/^zh\//u, "");
    const zhPath = "zh/" + enPath;
    for (const [language, path] of [
      ["en", enPath],
      ["zh-Hans", zhPath],
    ] as const) {
      const href = await page
        .locator(`link[rel="alternate"][hreflang="${language}"]`)
        .getAttribute("href");
      expect(new URL(href ?? "", baseURL).pathname).toBe(
        new URL(path, baseURL).pathname,
      );
    }
    const canonical = page.locator('link[rel="canonical"]');
    if (await canonical.count()) {
      const href = await canonical.getAttribute("href");
      expect(new URL(href ?? "", baseURL).pathname).toBe(
        new URL(route.path, baseURL).pathname,
      );
    }
  }
});

test("Repository plate and resonance controls support keyboard selection", async ({
  page,
}) => {
  await openTool(page, "repository/");
  const text = getMessages("en").repositoryTool;
  const start = page.getByRole("radiogroup", { name: text.startPlate });
  const left = start.getByRole("radio", { name: "Left" });
  await left.focus();
  await page.keyboard.press("Space");
  await expect(left).toBeChecked();
  await page.keyboard.down("ArrowRight");
  await expect(start.getByRole("radio", { name: "Middle" })).toBeChecked();
  await page.keyboard.up("ArrowRight");
  await page
    .getByRole("radiogroup", { name: text.room })
    .getByRole("radio", { name: text.rooms[3] })
    .focus();
  await page.keyboard.press("Space");
  const resonance = page.getByRole("radiogroup", { name: text.held });
  await resonance.getByRole("radio", { name: text.resonances.circle }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.down("ArrowRight");
  await expect(
    resonance.getByRole("radio", { name: text.resonances.triangle }),
  ).toBeChecked();
  await page.keyboard.up("ArrowRight");
});
