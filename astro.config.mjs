// @ts-check
import {
  defineConfig,
  fontProviders,
  passthroughImageService,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://alexmg.dev",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Cabin",
      cssVariable: "--font-cabin",
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Nunito",
      cssVariable: "--font-nunito",
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Inconsolata",
      cssVariable: "--font-inconsolata",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  integrations: [
    sitemap(),
    icon(),
    expressiveCode({
      themes: ["night-owl", "catppuccin-latte"],
      useDarkModeMediaQuery: false,
      themeCssRoot: ":root",
      frames: {
        showCopyToClipboardButton: true,
      },
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
