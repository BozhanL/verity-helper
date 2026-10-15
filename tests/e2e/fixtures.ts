import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ browserErrors: string[] }>({
  browserErrors: [
    async ({ page }, use): Promise<void> => {
      const errors: string[] = [];
      page.on("pageerror", (error) => {
        errors.push(error.message);
      });
      page.on("console", (message) => {
        if (message.type() === "error") {
          const { url } = message.location();
          errors.push(url ? message.text() + " (" + url + ")" : message.text());
        }
      });
      await use(errors);
      expect(
        errors,
        "Browser startup and interactions must not produce errors",
      ).toEqual([]);
    },
    { auto: true },
  ],
});
export { expect } from "@playwright/test";
