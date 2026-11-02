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
    "button:visible, select:visible, summary:visible, .page-navigation a, .language-navigation a:visible, .reference-links a, .result-links a, .result-actions a, .solo-phase a, .encounter-card, .brand",
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

async function assertMapContrast(page: Page): Promise<void> {
  const contrasts = await page
    .locator(".map-floor polygon")
    .evaluateAll((elements) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context === null) {
        throw new Error("Canvas unavailable for color measurement");
      }
      function luminance(color: string): number {
        if (context === null) {
          return 0;
        }
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const channels = Array.from(context.getImageData(0, 0, 1, 1).data)
          .slice(0, 3)
          .map((byte) => {
            const value = byte / 255;
            return value <= 0.04045
              ? value / 12.92
              : ((value + 0.055) / 1.055) ** 2.4;
          });
        return (
          (channels[0] ?? 0) * 0.2126 +
          (channels[1] ?? 0) * 0.7152 +
          (channels[2] ?? 0) * 0.0722
        );
      }
      const background = luminance(
        getComputedStyle(document.documentElement).backgroundColor,
      );
      return elements.map((element) => {
        const style = getComputedStyle(element);
        const stroke = luminance(style.stroke);
        return {
          room: element.getAttribute("data-room") ?? "Room",
          ratios: [luminance(style.fill), background].map(
            (adjacent) =>
              (Math.max(stroke, adjacent) + 0.05) /
              (Math.min(stroke, adjacent) + 0.05),
          ),
        };
      });
    });
  // WCAG 2.2 SC 1.4.11: meaningful graphical boundaries need 3:1 contrast.
  for (const room of contrasts) {
    for (const ratio of room.ratios) {
      expect(ratio, room.room + " outline contrast").toBeGreaterThanOrEqual(3);
    }
  }
}

async function exerciseSubstratum(
  page: Page,
  route: (typeof ROUTES)[number],
): Promise<void> {
  const text = getMessages(route.locale).substratumTool;
  await openTool(page, route.path);
  await choose(
    page,
    text.roomPicker.replace("{marker}", text.markers.you),
    text.rooms.banner,
  );
  await choose(page, text.markerPicker, text.markers.sender);
  await choose(
    page,
    text.roomPicker.replace("{marker}", text.markers.sender),
    text.rooms.vase,
  );
  await choose(page, text.markerPicker, text.markers.closer);
  await choose(
    page,
    text.roomPicker.replace("{marker}", text.markers.closer),
    text.rooms.glyph,
  );
  await assertMapContrast(page);
  await page.getByText(text.reference, { exact: true }).tap();
  const sources = page.locator(".map-reference .reference-links a");
  await expect(sources).toHaveCount(2);
  for (const source of await sources.all()) {
    await expect(source).toBeVisible();
  }
  const rooms = await page.locator(".map-room").evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: element.clientWidth,
        content: element.scrollWidth,
        name: element.getAttribute("aria-label"),
      };
    }),
  );
  for (const [index, room] of rooms.entries()) {
    expect(room.content, room.name ?? "Room label").toBeLessThanOrEqual(
      room.width + 1,
    );
    for (const other of rooms.slice(index + 1)) {
      expect(
        room.right <= other.left ||
          other.right <= room.left ||
          room.bottom <= other.top ||
          other.bottom <= room.top,
        `${room.name ?? "Room"} and ${other.name ?? "Room"} targets must not overlap`,
      ).toBe(true);
    }
  }
}

async function exerciseRoute(
  page: Page,
  route: (typeof ROUTES)[number],
  theme: "light" | "dark",
  height: number,
): Promise<void> {
  const messages = getMessages(route.locale);
  if (route.tool === "substratum") {
    await exerciseSubstratum(page, route);
  } else if (route.tool === "home") {
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
      // Each localized journey gets its own deadline, including on slower WebKit runners.
      for (const locale of ["en", "zh"] as const) {
        for (const group of ["existing", "substratum"] as const) {
          test(`${locale} ${String(viewport.width)}x${String(viewport.height)} ${theme} ${group}: all tools fit and remain usable`, async ({
            page,
          }, testInfo) => {
            await page.addInitScript((value) => {
              localStorage.setItem("verity-theme", value);
            }, theme);
            for (const route of ROUTES.filter(
              (route) =>
                route.locale === locale &&
                (group === "substratum"
                  ? route.tool.startsWith("substratum")
                  : !route.tool.startsWith("substratum")),
            )) {
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
                (route.locale === "en" || group === "substratum") &&
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
    }
  });
}
