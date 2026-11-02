import { getMessages } from "../../src/i18n/messages";
import { ENDPOINTS, MAP_ROOMS, MARKERS } from "../../src/lib/substratum";
import { expect, test } from "./fixtures";
import { choose, openPage, openTool } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  const prefix = locale === "en" ? "" : "zh/";
  const messages = getMessages(locale);
  const text = messages.substratumTool;

  test(`${locale}: map navigation, references, language and preserved Verity tools`, async ({
    page,
    baseURL,
  }) => {
    await openPage(page, prefix);
    await page
      .locator(".encounter-card")
      .filter({ hasText: messages.substratumEncounter })
      .tap();
    await expect(page).toHaveURL(new URL(prefix + "substratum/", baseURL).href);
    await expect(page.locator(".readiness")).toHaveText(messages.controlsReady);
    await choose(
      page,
      text.roomPicker.replace("{marker}", text.markers.you),
      text.rooms.banner,
    );
    await page.getByText(text.reference, { exact: true }).tap();
    await expect(
      page.getByRole("link", { name: text.mapSource }),
    ).toHaveAttribute(
      "href",
      "https://www.reddit.com/r/raidsecrets/comments/1dnz91q/salvations_edge_map/",
    );
    await page
      .getByRole("link", {
        name: locale === "en" ? "简体中文" : "English",
        exact: true,
      })
      .tap();
    const opposite = getMessages(locale === "en" ? "zh" : "en");
    await expect(page).toHaveURL(
      new URL((locale === "en" ? "zh/" : "") + "substratum/", baseURL).href,
    );
    await expect(page.locator(".map-assignment")).toHaveText(
      MARKERS.map(() => opposite.substratumTool.unset),
    );
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
    await page
      .getByRole("navigation", { name: opposite.navigation })
      .getByRole("link", { name: opposite.substratumEncounter })
      .tap();
    await expect(page.locator(".map-assignment")).toHaveText(
      MARKERS.map(() => opposite.substratumTool.unset),
    );
    await expect(page.locator('a[href*="/checklist"]')).toHaveCount(0);
  });

  test(`${locale}: touch markers move independently through repeats, interruptions, clear and reset`, async ({
    page,
  }) => {
    await openTool(page, prefix + "substratum/");
    for (const room of MAP_ROOMS) {
      await choose(
        page,
        text.roomPicker.replace("{marker}", text.markers.you),
        text.rooms[room],
      );
    }
    const positions = {
      senderA: "vase",
      closerA: "glyph",
      senderB: "bones",
      closerB: "halo",
    } as const;
    for (const marker of ENDPOINTS) {
      await choose(page, text.markerPicker, text.markers[marker]);
      await expect(
        page.getByRole("radio", { name: text.rooms.main, exact: true }),
      ).toBeDisabled();
      await choose(
        page,
        text.roomPicker.replace("{marker}", text.markers[marker]),
        text.rooms[positions[marker]],
      );
    }
    for (const marker of ENDPOINTS) {
      await choose(page, text.markerPicker, text.markers[marker]);
      for (const other of ENDPOINTS.filter((endpoint) => endpoint !== marker)) {
        await expect(
          page.getByRole("radio", {
            name: text.rooms[positions[other]],
            exact: true,
          }),
        ).toBeDisabled();
      }
    }
    await choose(page, text.markerPicker, text.markers.you);
    for (const marker of ENDPOINTS) {
      await choose(
        page,
        text.roomPicker.replace("{marker}", text.markers.you),
        text.rooms[positions[marker]],
      );
      await expect(
        page
          .getByRole("radio", {
            name: text.rooms[positions[marker]],
            exact: true,
          })
          .locator(".map-badge"),
      ).toHaveText([text.symbols.you, text.symbols[marker]]);
    }
    for (let repeat = 0; repeat < 2; repeat++) {
      await choose(
        page,
        text.roomPicker.replace("{marker}", text.markers.you),
        text.rooms.vase,
      );
    }
    await expect(
      page
        .getByRole("radio", { name: text.rooms.vase, exact: true })
        .locator(".map-badge"),
    ).toHaveCount(2);
    await page.getByRole("combobox").selectOption("dark");
    await page.getByText(text.reference, { exact: true }).tap();
    await expect(page.locator(".map-assignment")).toHaveText([
      text.rooms.vase,
      text.rooms.vase,
      text.rooms.glyph,
      text.rooms.bones,
      text.rooms.halo,
    ]);
    await page.getByRole("button", { name: text.clear, exact: true }).tap();
    await expect(page.locator(".map-assignment")).toHaveText([
      text.unset,
      text.rooms.vase,
      text.rooms.glyph,
      text.rooms.bones,
      text.rooms.halo,
    ]);
    await expect(
      page.getByRole("button", { name: text.clear, exact: true }),
    ).toBeDisabled();
    await choose(page, text.markerPicker, text.markers.closerA);
    await page.getByRole("button", { name: text.clear, exact: true }).tap();
    await choose(page, text.markerPicker, text.markers.senderB);
    await choose(
      page,
      text.roomPicker.replace("{marker}", text.markers.senderB),
      text.rooms.glyph,
    );
    await choose(page, text.markerPicker, text.markers.closerB);
    await choose(
      page,
      text.roomPicker.replace("{marker}", text.markers.closerB),
      text.rooms.basement,
    );
    await expect(page.locator(".map-assignment")).toHaveText([
      text.unset,
      text.rooms.vase,
      text.unset,
      text.rooms.glyph,
      text.rooms.basement,
    ]);
    await page.getByRole("button", { name: text.reset }).tap();
    await expect(page.locator(".map-assignment")).toHaveText(
      MARKERS.map(() => text.unset),
    );
    await expect(
      page.getByRole("radio", { name: text.markers.you, exact: true }),
    ).toBeChecked();
    await expect(page.getByRole("button", { name: text.reset })).toBeDisabled();
    await choose(
      page,
      text.roomPicker.replace("{marker}", text.markers.you),
      text.rooms.banner,
    );
    await page.reload();
    await expect(page.locator(".readiness")).toHaveText(messages.controlsReady);
    await expect(page.locator(".map-assignment")).toHaveText(
      MARKERS.map(() => text.unset),
    );
  });

  test(`${locale}: keyboard role and room selection keeps focus visible and announces positions`, async ({
    page,
  }) => {
    await openTool(page, prefix + "substratum/");
    await page
      .getByRole("radio", { name: text.markers.you, exact: true })
      .focus();
    await page.keyboard.down("ArrowRight");
    await expect(
      page.getByRole("radio", { name: text.markers.senderA, exact: true }),
    ).toBeChecked();
    await page.keyboard.up("ArrowRight");
    const vase = page.getByRole("radio", {
      name: text.rooms.vase,
      exact: true,
    });
    await vase.focus();
    await page.keyboard.press("Space");
    await expect(vase).toBeChecked();
    await page.keyboard.down("ArrowRight");
    const glyph = page.getByRole("radio", {
      name: text.rooms.glyph,
      exact: true,
    });
    await expect(glyph).toBeFocused();
    await expect(glyph).toBeChecked();
    await page.keyboard.up("ArrowRight");
    await expect(glyph).toHaveCSS("outline-style", "solid");
    await expect(page.locator('.sr-only[role="status"]')).toContainText(
      `${text.markers.senderA}: ${text.rooms.glyph}`,
    );
    await page
      .getByRole("radio", { name: text.markers.senderA, exact: true })
      .focus();
    for (const marker of ["closerA", "senderB", "closerB"] as const) {
      await page.keyboard.down("ArrowRight");
      await expect(
        page.getByRole("radio", { name: text.markers[marker], exact: true }),
      ).toBeChecked();
      await page.keyboard.up("ArrowRight");
    }
    await vase.focus();
    await page.keyboard.press("Space");
    await page.keyboard.down("ArrowRight");
    const shell = page.getByRole("radio", {
      name: text.rooms.shell,
      exact: true,
    });
    await expect(shell).toBeFocused();
    await expect(shell).toBeChecked();
    await page.keyboard.up("ArrowRight");
    await expect(page.locator('.sr-only[role="status"]')).toContainText(
      `${text.markers.closerB}: ${text.rooms.shell}`,
    );
    await expect(page.locator('.sr-only[role="status"]')).toContainText(
      `${text.markers.senderA}: ${text.rooms.glyph}`,
    );
    await page.getByRole("button", { name: text.reset }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".map-assignment")).toHaveText(
      MARKERS.map(() => text.unset),
    );
  });

  test(`${locale}: fresh and reloaded map waits for scripts`, async ({
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
          await page.goto(prefix + "substratum/", { waitUntil: "commit" });
        }
        await expect(page.locator(".readiness")).toHaveText(
          messages.controlsLoading,
        );
        await expect(
          page.getByRole("img", { name: text.mapDescription }),
        ).toBeVisible();
        for (const control of await page.locator("button").all()) {
          await expect(control).toBeDisabled();
        }
      } finally {
        resolve(undefined);
      }
      await expect(page.locator(".readiness")).toHaveText(
        messages.controlsReady,
      );
      await page.unroute("**/*.js");
      await choose(
        page,
        text.roomPicker.replace("{marker}", text.markers.you),
        text.rooms.banner,
      );
    }
  });
}

test.describe("static map", () => {
  test.use({ javaScriptEnabled: false });
  for (const locale of ["en", "zh"] as const) {
    test(`${locale}: room landmarks, orientation and references remain visible without JavaScript`, async ({
      page,
    }) => {
      const text = getMessages(locale).substratumTool;
      await page.goto((locale === "en" ? "" : "zh/") + "substratum/");
      await expect(
        page.getByRole("img", { name: text.mapDescription }),
      ).toBeVisible();
      for (const room of MAP_ROOMS) {
        await expect(
          page.getByRole("radio", { name: text.rooms[room], exact: true }),
        ).toBeDisabled();
      }
      await expect(
        page.getByText(text.orientation, { exact: true }),
      ).toBeVisible();
      for (const marker of MARKERS) {
        await expect(
          page.getByRole("radio", { name: text.markers[marker], exact: true }),
        ).toBeDisabled();
      }
      await page.getByText(text.reference, { exact: true }).tap();
      await expect(
        page.getByRole("link", { name: text.topologySource }),
      ).toBeVisible();
    });
  }
});
