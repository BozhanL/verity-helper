import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { env } from "node:process";

const site = env.SITE_URL;

// https://astro.build/config
export default defineConfig({
  ...(site ? { site } : undefined),

  base: env.BASE_PATH ?? "/",
  trailingSlash: "always",

  integrations: [react()],
  output: "static",

  i18n: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
