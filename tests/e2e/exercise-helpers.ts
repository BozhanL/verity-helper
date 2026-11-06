import type { Page } from "@playwright/test";
import {
  describeExcise,
  getMessages,
  type Locale,
} from "../../src/i18n/messages";
import type { Excise, Swap } from "../../src/lib/verity";
import { choose } from "./helpers";

export async function prepareFixedExercise(
  page: Page,
  theme: string,
): Promise<void> {
  await page.addInitScript((value) => {
    localStorage.setItem("verity-theme", value);
    Math.random = (): number => 0;
  }, theme);
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
}

export async function excise(
  page: Page,
  locale: Locale,
  selection: Excise,
): Promise<void> {
  const messages = getMessages(locale);
  await choose(page, messages.currentShape, messages.shapes[selection.shape]);
  await page
    .getByRole("button", {
      name: describeExcise(locale, selection),
      exact: true,
    })
    .tap();
}

/** Complete the fixed puzzle generated when Math.random always returns zero. */
export async function completeExercise(
  page: Page,
  locale: Locale,
): Promise<void> {
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
      await excise(page, locale, selection);
    }
  }
}
