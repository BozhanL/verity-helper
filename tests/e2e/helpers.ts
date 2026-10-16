import type { Page } from "@playwright/test";
import { getMessages, PAGES, type Locale } from "../../src/i18n/messages";
import { PAGE_PATHS } from "../../src/lib/navigation";
import { expect } from "./fixtures";

export const ROUTES = (["en", "zh"] as const).flatMap((locale) =>
  PAGES.map((tool) => ({
    locale,
    tool,
    path:
      (locale === "zh" ? "zh/" : "") +
      (PAGE_PATHS[tool] ? PAGE_PATHS[tool] + "/" : ""),
  })),
);

export async function openPage(page: Page, path: string): Promise<void> {
  await page.goto(path || "./");
  await expect(page.getByRole("combobox")).toBeEnabled();
}

export async function openTool(page: Page, path: string): Promise<void> {
  await openPage(page, path);
  await expect(page.locator(".readiness")).toHaveText(
    /Controls ready\.|控件已就绪。/u,
  );
  await expect(page.getByRole("radio").first()).toBeEnabled();
}

export async function chooseRepository(
  page: Page,
  locale: Locale,
): Promise<void> {
  const messages = getMessages(locale);
  const text = messages.repositoryTool;
  await expect(page.getByRole("status")).toHaveText(text.ready);
  await choose(page, text.startPlate, messages.positions[0]);
  await choose(page, text.room, text.rooms[3]);
  await choose(
    page,
    messages.positions[0] + " · " + text.conductor,
    text.resonances.square,
  );
  await choose(
    page,
    messages.positions[1] + " · " + text.conductor,
    text.resonances.circle,
  );
  await choose(page, text.held, text.resonances.triangle);
}

export async function choose(
  page: Page,
  group: string,
  name: string,
): Promise<void> {
  const choice = page
    .getByRole("radiogroup", { name: group, exact: true })
    .getByRole("radio", { name, exact: true });
  await choice.tap();
  await expect(choice).toBeChecked();
}

export async function chooseInside(page: Page, locale: Locale): Promise<void> {
  const messages = getMessages(locale);
  await choose(
    page,
    messages.positions[0] + " · " + messages.inside,
    messages.shapes.circle,
  );
  await choose(
    page,
    messages.positions[1] + " · " + messages.inside,
    messages.shapes.triangle,
  );
}

export async function chooseSelf(page: Page, locale: Locale): Promise<void> {
  const messages = getMessages(locale);
  await page
    .getByRole("radio", {
      name:
        messages.soloStatue +
        ": " +
        messages.positions[2] +
        " (" +
        messages.shapes.square +
        ")",
    })
    .tap();
}
