import type { Page } from "@playwright/test";
import { getMessages, type Locale } from "../../src/i18n/messages";
import { expect } from "./fixtures";

export const ROUTES = [
  { locale: "en", tool: "calculator", path: "" },
  { locale: "en", tool: "solo", path: "solo/" },
  { locale: "en", tool: "exercise", path: "exercise/" },
  { locale: "zh", tool: "calculator", path: "zh/" },
  { locale: "zh", tool: "solo", path: "zh/solo/" },
  { locale: "zh", tool: "exercise", path: "zh/exercise/" },
] as const;

export async function openTool(page: Page, path: string): Promise<void> {
  await page.goto(path || "./");
  await expect(page.getByRole("combobox")).toBeEnabled();
  await expect(page.getByRole("radio").first()).toBeEnabled();
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
