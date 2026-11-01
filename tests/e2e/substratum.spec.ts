import { getMessages } from "../../src/i18n/messages";
import { CHECKPOINTS } from "../../src/lib/substratum";
import { expect, test } from "./fixtures";
import { openPage } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  const prefix = locale === "en" ? "" : "zh/";
  const messages = getMessages(locale);
  const text = messages.substratumTool;

  test(`${locale}: guide navigation, sources, language, and preserved Verity tools`, async ({
    page,
    baseURL,
  }) => {
    await openPage(page, prefix);
    await page
      .locator(".encounter-card")
      .filter({ hasText: messages.substratumEncounter })
      .tap();
    await expect(page).toHaveURL(new URL(prefix + "substratum/", baseURL).href);
    await page.getByText(text.sources, { exact: true }).tap();
    await expect(
      page.getByRole("link", { name: text.walkthrough }),
    ).toHaveAttribute(
      "href",
      "https://www.shacknews.com/article/140025/salvations-edge-raid-guide-destiny-2",
    );
    await page.getByText(text.optionalTitle, { exact: true }).tap();
    await expect(
      page.getByText(text.scenicDetail, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: text.navigation })
      .getByRole("link", { name: messages.substratumChecklist })
      .tap();
    await expect(page).toHaveURL(
      new URL(prefix + "substratum/checklist/", baseURL).href,
    );
    await page.getByRole("button", { name: text.marks.tormentor1 }).tap();
    await page
      .getByRole("link", {
        name: locale === "en" ? "简体中文" : "English",
        exact: true,
      })
      .tap();
    const opposite = getMessages(locale === "en" ? "zh" : "en");
    await expect(page).toHaveURL(
      new URL((locale === "en" ? "zh/" : "") + "substratum/checklist/", baseURL)
        .href,
    );
    await expect(
      page.getByRole("button", {
        name: opposite.substratumTool.marks.tormentor1,
      }),
    ).toHaveAttribute("aria-pressed", "false");
    await page
      .getByRole("navigation", { name: opposite.navigation })
      .getByRole("link", { name: opposite.verityEncounter })
      .tap();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      opposite.calculatorTitle,
    );
    const choice = page.getByRole("radio").first();
    await choice.tap();
    await expect(choice).toBeChecked();
  });

  test(`${locale}: keyboard and touch marks survive interruptions, undo, completion, and reset`, async ({
    page,
  }) => {
    await openPage(page, prefix + "substratum/checklist/");
    await expect(page.locator(".readiness")).toHaveText(messages.controlsReady);
    const first = page.getByRole("button", { name: text.marks.tormentor1 });
    const bank = page.getByRole("button", { name: text.bank, exact: true });
    await expect(bank).toBeDisabled();
    await first.focus();
    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-pressed", "true");
    // Reading other instructions and changing theme must not discard a partial cycle.
    await page.getByRole("combobox").selectOption("dark");
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: text.undo }).tap();
    await expect(first).toHaveAttribute("aria-pressed", "false");
    for (const key of CHECKPOINTS) {
      await page.getByRole("button", { name: text.marks[key] }).tap();
    }
    await bank.tap();
    await expect(
      page.getByRole("heading", { name: text.cycle.replace("{cycle}", "2") }),
    ).toBeVisible();
    await page.getByRole("button", { name: text.undo }).tap();
    await expect(
      page.getByRole("heading", { name: text.cycle.replace("{cycle}", "1") }),
    ).toBeVisible();
    for (const key of CHECKPOINTS) {
      await expect(
        page.getByRole("button", { name: text.marks[key] }),
      ).toHaveAttribute("aria-pressed", "true");
    }
    await bank.tap();
    for (let cycle = 1; cycle < 3; cycle++) {
      for (const key of CHECKPOINTS) {
        await page.getByRole("button", { name: text.marks[key] }).tap();
      }
      await bank.tap();
    }
    await expect(
      page.getByRole("heading", { name: text.complete }),
    ).toBeVisible();
    await expect(bank).toBeDisabled();
    await page.getByRole("button", { name: text.reset }).tap();
    await expect(first).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button", { name: text.undo })).toBeDisabled();
    await first.tap();
    await page.reload();
    await expect(first).toBeEnabled();
    await expect(first).toHaveAttribute("aria-pressed", "false");
  });

  test(`${locale}: fresh and reloaded checklist waits for scripts`, async ({
    page,
  }) => {
    for (const reload of [false, true]) {
      const { promise, resolve } = Promise.withResolvers<undefined>();
      await page.route("**/*.js", async (route) => {
        await promise;
        await route.continue();
      });
      try {
        if (reload) {
          await page.reload({ waitUntil: "commit" });
        } else {
          await page.goto(prefix + "substratum/checklist/", {
            waitUntil: "commit",
          });
        }
        await expect(page.locator(".readiness")).toHaveText(
          messages.controlsLoading,
        );
        for (const button of await page.getByRole("button").all()) {
          await expect(button).toBeDisabled();
        }
      } finally {
        resolve(undefined);
      }
      await expect(page.locator(".readiness")).toHaveText(
        messages.controlsReady,
      );
      await page.unroute("**/*.js");
      const first = page.getByRole("button", { name: text.marks.tormentor1 });
      await first.tap();
      await expect(first).toHaveAttribute("aria-pressed", "true");
    }
  });
}

test.describe("static guide", () => {
  test.use({ javaScriptEnabled: false });
  test("the encounter instructions and references work without JavaScript", async ({
    page,
  }) => {
    const text = getMessages("en").substratumTool;
    await page.goto("substratum/");
    await expect(
      page.getByRole("heading", {
        name: text.steps[0]?.title ?? "",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByText(text.mechanicsTitle, { exact: true }).click();
    await expect(
      page.getByText(text.steps[2]?.detail ?? "", { exact: true }),
    ).toBeVisible();
    await page.getByText(text.recoveryTitle, { exact: true }).click();
    await expect(
      page.getByText(text.recovery[0] ?? "", { exact: true }),
    ).toBeVisible();
    await page.getByText(text.sources, { exact: true }).click();
    await expect(
      page.getByRole("link", { name: text.walkthrough }),
    ).toBeVisible();
  });
});
