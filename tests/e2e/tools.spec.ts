import { describeExcise, getMessages } from "../../src/i18n/messages";
import type { Swap } from "../../src/lib/verity";
import { expect, test } from "./fixtures";
import { choose, chooseInside, chooseSelf, openTool } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  const prefix = locale === "en" ? "" : "zh/";
  const messages = getMessages(locale);

  test(`${locale}: calculator handles invalid, solved, duplicate, and reset states`, async ({
    page,
  }) => {
    await openTool(page, prefix + "verity/");
    await expect(
      page.getByRole("heading", { name: messages.incomplete }),
    ).toBeVisible();
    await chooseInside(page, locale);
    await expect(
      page
        .getByRole("radiogroup", {
          name: messages.positions[1] + " · " + messages.inside,
        })
        .getByRole("radio", { name: messages.shapes.circle }),
    ).toBeDisabled();
    const left = messages.positions[0] + " · " + messages.outside;
    const middle = messages.positions[1] + " · " + messages.outside;
    await choose(page, left, messages.solids.sphere);
    await choose(page, middle, messages.solids.sphere);
    await expect(page.getByRole("alert")).toContainText(messages.invalid);
    await choose(page, middle, messages.solids.pyramid);
    await expect(
      page.getByRole("heading", { name: messages.swap + " 3", exact: true }),
    ).toBeVisible();
    await choose(page, left, messages.solids.cone);
    await choose(page, middle, messages.solids.cone);
    await expect(
      page.getByText("2 " + messages.swaps, { exact: true }),
    ).toBeVisible();
    await choose(page, left, messages.solids.prism);
    await choose(page, middle, messages.solids.cylinder);
    await expect(
      page.getByText(messages.solved, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: messages.resetOutside, exact: true })
      .tap();
    await expect(
      page.getByRole("heading", { name: messages.outsideIncomplete }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("radiogroup", { name: left })
        .getByRole("radio", { checked: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: messages.reset, exact: true }).tap();
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  });

  test(`${locale}: solo transfers and retention work with touch controls`, async ({
    page,
  }) => {
    await openTool(page, prefix + "verity/solo/");
    await expect(
      page.getByRole("radio", {
        name: messages.soloStatue + ": " + messages.positions[2],
        exact: true,
      }),
    ).toBeDisabled();
    await chooseInside(page, locale);
    await chooseSelf(page, locale);
    const cases = [
      { first: "triangle", second: "square", keep: false },
      { first: "square", second: "square", keep: false },
      { first: "circle", second: "circle", keep: true },
    ] as const;
    for (const room of cases) {
      await choose(page, messages.soloFirstShape, messages.shapes[room.first]);
      await choose(
        page,
        messages.soloSecondShape,
        messages.shapes[room.second],
      );
      const result = page.getByRole("region", {
        name: messages.soloDistribution,
      });
      await expect(result.getByRole("img")).toHaveCount(3);
      const keep = room.keep
        ? messages.soloKeep + " " + messages.shapes.circle
        : messages.soloNothingToKeep;
      await expect(
        result.getByRole("img", {
          name:
            messages.soloYou +
            "; " +
            messages.positions[2] +
            ": " +
            messages.shapes.square +
            "; " +
            keep,
        }),
      ).toBeVisible();
      const recipient = room.keep ? 1 : 0;
      const instruction = messages.soloGiveInstruction
        .replace("{shape}", messages.shapes[room.first])
        .replace("{position}", messages.positions[recipient])
        .replace(
          "{symbol}",
          messages.shapes[recipient === 0 ? "circle" : "triangle"],
        );
      await expect(
        result.getByRole("img", { name: instruction, exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: messages.soloResetRoom }).tap();
      await expect(
        page.getByRole("heading", { name: messages.soloChooseRoom }),
      ).toBeVisible();
    }
    await page
      .getByRole("button", { name: messages.resetInside, exact: true })
      .tap();
    await expect(
      page.getByRole("radio", {
        name: messages.soloStatue + ": " + messages.positions[2],
        exact: true,
      }),
    ).toBeDisabled();
  });

  test(`${locale}: unaided exercise supports cancel, completion, expiry, and restart`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Math.random = (): number => 0;
    });
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await openTool(page, prefix + "verity/exercise/");
    await expect(page.getByRole("img")).toHaveCount(6);
    await page.getByRole("button", { name: messages.start, exact: true }).tap();
    await page
      .getByRole("button", {
        name: describeExcise(locale, { statue: 0, shape: "circle" }),
      })
      .tap();
    await page
      .getByRole("button", { name: messages.cancel, exact: true })
      .tap();
    await expect(
      page.getByRole("button", { name: messages.cancel, exact: true }),
    ).toHaveCount(0);
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
    await expect(page.getByRole("img")).toHaveCount(6);
    await expect(
      page.getByRole("img", { name: new RegExp(messages.target) }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: messages.newExercise, exact: true })
      .tap();
    await page.clock.fastForward(210_000);
    await expect(
      page.getByRole("heading", { name: messages.expired }),
    ).toBeVisible();
    await expect(page.getByRole("timer")).toHaveText("0:00");
    await expect(page.locator(".button--excise:enabled")).toHaveCount(0);
    await page
      .getByRole("button", { name: messages.newExercise, exact: true })
      .tap();
    await expect(
      page.getByRole("heading", { name: messages.running }),
    ).toBeVisible();
  });
}

test("radio controls support Tab, arrow keys, and Space", async ({ page }) => {
  await openTool(page, "verity/");
  const left = page.getByRole("radiogroup", { name: "Left · Inside statues" });
  const circle = left.getByRole("radio", { name: "Circle" });
  await circle.focus();
  await page.keyboard.press("Space");
  await expect(circle).toBeChecked();
  await page.keyboard.down("ArrowRight");
  await expect(left.getByRole("radio", { name: "Triangle" })).toBeChecked();
  await page.keyboard.up("ArrowRight");
  await page.keyboard.press("Tab");
  const middle = page.getByRole("radiogroup", {
    name: "Middle · Inside statues",
  });
  await expect(middle.getByRole("radio", { name: "Circle" })).toBeFocused();
  await page.keyboard.down("ArrowRight");
  await expect(middle.getByRole("radio", { name: "Square" })).toBeChecked();
  await page.keyboard.up("ArrowRight");
});

test("skip link appears on focus and activates with Enter", async ({
  page,
}) => {
  await openTool(page, "verity/");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toHaveCSS("clip-path", "inset(50%)");
  await skip.focus();
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS("clip-path", "none");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/u);
});
