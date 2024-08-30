import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import fs from "node:fs";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";
import icon from "astro-icon";
import type { RemarkPlugin } from "node_modules/@astrojs/markdown-remark/dist/types";

// https://astro.build/config
export default defineConfig({
  scopedStyleStrategy: "where",
  experimental: {
    contentLayer: true,
  },
  site: SITE.website,
  integrations: [
    tailwind({
      // Example: Disable injecting a basic `base.css` import on every page.
      // Useful if you need to define and/or import your own custom `base.css`.
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
    icon({
      include: {
        tabler: ["rss", "search", "arrow-narrow-left", "arrow-narrow-right"],
        mdi: ["github", "paper-text-outline"],
        logos: [
          "astro-icon",
          "typescript-icon-round",
          "react",
          "eslint",
          "prettier",
        ],
        devicon: ["tailwindcss", "vercel-wordmark"],
      },
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc as RemarkPlugin,
      remarkReadingTime,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      theme: "github-dark",
      wrap: false,
    },
  },
  vite: {
    plugins: [rawFonts([".ttf", ".woff"])],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});

function rawFonts(ext: string[]) {
  return {
    name: "vite-plugin-raw-fonts",
    transform(_: string, id: string) {
      if (ext.some(e => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null,
        };
      }
    },
  };
}
