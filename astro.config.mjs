// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://alexmg.dev",
  integrations: [
    sitemap(),
    icon(),
    expressiveCode({
      themes: ["night-owl", "catppuccin-latte"],
      useDarkModeMediaQuery: false,
      themeCssRoot: ":root",
      themeCssSelector: (theme) =>
        theme.name == "night-owl" ? ":root.dark" : ":root:not(.dark)",
      styleOverrides: {
        codeFontFamily: "Inconsolata, monospace",
        frames: {
          frameBoxShadowCssValue: "none",
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    service: passthroughImageService(),
  },
});
