import type { Response } from "@playwright/test";
import { expect, test } from "./fixtures";
import { openTool } from "./helpers";

test.use({ hasTouch: true });

for (const locale of ["en", "zh"] as const) {
  test(`${locale}: Noto fonts download from the site and load the UI weights`, async ({
    page,
    baseURL,
  }) => {
    if (baseURL === undefined) {
      throw new Error("The browser base URL must be configured.");
    }
    const site = new URL(baseURL);
    const fontResponses: Response[] = [];
    page.on("response", (response) => {
      if (response.request().resourceType() === "font") {
        fontResponses.push(response);
      }
    });
    await openTool(page, locale === "en" ? "repository/" : "zh/repository/");
    const fonts = await page.evaluate(async () => {
      const styles = getComputedStyle(document.documentElement);
      return Promise.all(
        [
          {
            variable: "--font-noto-sans",
            name: "Noto Sans",
            text: "Repository",
          },
          {
            variable: "--font-noto-sans-sc",
            name: "Noto Sans SC",
            text: "贮藏库共振",
          },
        ].map(async (font) => {
          const family =
            styles.getPropertyValue(font.variable).split(",").at(0)?.trim() ??
            "";
          const loaded = await Promise.all(
            [400, 650, 750, 800].map(async (weight) =>
              document.fonts.load(
                `${String(weight)} 16px ${family}`,
                font.text,
              ),
            ),
          );
          return {
            name: font.name,
            family: family.replaceAll('"', ""),
            appliedFamily: styles.fontFamily.replaceAll('"', ""),
            loaded: loaded.map((faces) =>
              faces.map((face) => ({
                family: face.family,
                status: face.status,
              })),
            ),
          };
        }),
      );
    });
    for (const font of fonts) {
      expect(font.family).toContain(font.name);
      expect(font.appliedFamily).toContain(font.family);
      for (const faces of font.loaded) {
        expect(faces.length).toBeGreaterThan(0);
        for (const face of faces) {
          expect(face.family).toContain(font.name);
          expect(face.status).toBe("loaded");
        }
      }
    }
    expect(fontResponses.length).toBeGreaterThanOrEqual(2);
    for (const response of fontResponses) {
      const url = new URL(response.url());
      expect(response.status(), response.url()).toBe(200);
      expect(url.origin).toBe(site.origin);
      expect(url.pathname.startsWith(site.pathname)).toBe(true);
      expect(url.pathname).toMatch(/\.woff2$/u);
    }
    const choice = page.getByRole("radio").first();
    await choice.tap();
    await expect(choice).toBeChecked();
  });
}
