import type { Page } from "@playwright/test";
import { getMessages } from "../../src/i18n/messages";
import { expect, test } from "./fixtures";
import {
  choose,
  chooseInside,
  chooseRepository,
  chooseSelf,
  openPage,
  openTool,
  ROUTES,
} from "./helpers";

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
    "button:visible, select:visible, summary:visible, .page-navigation a, .language-navigation a:visible, .reference-links a, .result-links a, .result-actions a, .encounter-card, .brand",
  );
  const targets = await controls.evaluateAll((elements) =>
    elements.map((element) => {
      const { width, height } = element.getBoundingClientRect();
      return {
        width,
        height,
        label: element.textContent.trim() || "Control",
        primary: element.matches('[role="radio"], .button'),
      };
    }),
  );
  for (const target of targets) {
    // Round away Firefox's floating-point noise (44px can be 43.99997px).
    expect(
      Number(target.width.toFixed(3)),
      target.label,
    ).toBeGreaterThanOrEqual(target.primary ? 48 : 44);
    expect(
      Number(target.height.toFixed(3)),
      target.label,
    ).toBeGreaterThanOrEqual(target.primary ? 48 : 44);
  }
}

async function assertNavigationLayout(page: Page): Promise<void> {
  const rows = await page.locator(".page-navigation").evaluateAll((elements) =>
    elements.map((element) => {
      const row = element.getBoundingClientRect();
      const links = Array.from(element.querySelectorAll("a"), (link) =>
        link.getBoundingClientRect(),
      );
      const first = links.at(0);
      const last = links.at(-1);
      return {
        label: element.getAttribute("aria-label") ?? "Navigation",
        widths: links.map((link) => link.width),
        leftInset: first === undefined ? 0 : first.left - row.left,
        rightInset: last === undefined ? 0 : row.right - last.right,
      };
    }),
  );
  for (const row of rows) {
    expect(
      Math.max(...row.widths) - Math.min(...row.widths),
      row.label + " tabs must have equal widths",
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(row.leftInset - row.rightInset),
      row.label + " tabs must fill the bar evenly",
    ).toBeLessThanOrEqual(1);
  }
}

async function exerciseRoute(
  page: Page,
  route: (typeof ROUTES)[number],
  theme: "light" | "dark",
  height: number,
): Promise<void> {
  const messages = getMessages(route.locale);
  if (route.tool === "home") {
    await openPage(page, route.path);
    await page
      .getByRole("combobox")
      .selectOption(theme === "dark" ? "light" : "dark");
    await page.getByRole("combobox").selectOption(theme);
    await expect(
      page.getByRole("heading", { name: messages.homeTitle }),
    ).toBeVisible();
  } else {
    await openTool(page, route.path);
  }
  if (route.tool === "repository") {
    await chooseRepository(page, route.locale);
    const choices = await page
      .locator(".conductor-card .shape-choice")
      .evaluateAll((buttons) =>
        buttons.map((button) => ({
          label: button.textContent,
          width: button.clientWidth,
          content: button.scrollWidth,
        })),
      );
    for (const choice of choices) {
      expect(
        choice.content,
        choice.label + " must fit inside its button",
      ).toBeLessThanOrEqual(choice.width + 1);
    }
    await expect(
      page.getByRole("heading", {
        name: messages.repositoryTool.closeAt.replace(
          "{position}",
          messages.positions[2],
        ),
      }),
    ).toBeVisible();
  } else if (route.tool === "calculator") {
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
  } else if (route.tool === "exercise") {
    await page.getByRole("button", { name: messages.start, exact: true }).tap();
    await page.locator(".button--excise:enabled").first().tap();
    await expect(
      page.getByRole("button", { name: messages.cancel, exact: true }),
    ).toBeVisible();
    if (height < 600) {
      await expect(page.locator(".exercise-controls")).toHaveCSS(
        "position",
        "static",
      );
    }
  }
}

for (const viewport of VIEWPORTS) {
  test.describe(() => {
    test.use({ viewport });
    for (const theme of ["light", "dark"] as const) {
      test(`${String(viewport.width)}x${String(viewport.height)} ${theme}: all localized tools fit and remain usable`, async ({
        page,
      }, testInfo) => {
        await page.addInitScript((value) => {
          localStorage.setItem("verity-theme", value);
        }, theme);
        for (const route of ROUTES) {
          await exerciseRoute(page, route, theme, viewport.height);
          const width = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            viewport: document.documentElement.clientWidth,
            inner: window.innerWidth,
          }));
          expect(
            width.inner,
            route.path + " must use the requested viewport",
          ).toBe(viewport.width);
          expect(
            width.scroll,
            route.path + " must not overflow horizontally",
          ).toBeLessThanOrEqual(width.viewport);
          await assertTouchTargets(page);
          await assertNavigationLayout(page);
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
  });
}
