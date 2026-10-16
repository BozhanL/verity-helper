import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import { env } from "node:process";
import { getMessages } from "./src/i18n/messages";

const site = env.SITE_URL;
const chineseGlyphs = Array.from(
  new Set(
    JSON.stringify([getMessages("en"), getMessages("zh")]).match(
      /\P{ASCII}/gu,
    ) ?? [],
  ),
);

// https://astro.build/config
export default defineConfig({
  ...(site ? { site } : undefined),

  base: env.BASE_PATH ?? "/",
  trailingSlash: "always",

  integrations: [react()],
  output: "static",

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Noto Sans",
      cssVariable: "--font-noto-sans",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: "Noto Sans SC",
      cssVariable: "--font-noto-sans-sc",
      weights: ["100 900"],
      styles: ["normal"],
      options: { experimental: { glyphs: chineseGlyphs } },
      fallbacks: ["PingFang SC", "Microsoft YaHei", "sans-serif"],
    },
  ],

  i18n: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },

  vite: {
    // Production checks must not overwrite the running dev server's React runtime.
    cacheDir: `node_modules/.vite/${env.NODE_ENV ?? "development"}`,
    plugins: [tailwindcss()],
  },
});
