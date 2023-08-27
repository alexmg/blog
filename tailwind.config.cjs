/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    screens: {
      sm: "640px",
    },

    // Uncomment the following extend
    // if existing Tailwind color palette will be used

    // extend: {
    extend: {
      colors: {
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        stop: "rgb(var(--color-stop) / <alpha-value>)",
      },
    },

    textColor: {
      skin: {
        base: "rgb(var(--color-text-base) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        inverted: "rgb(var(--color-fill) / <alpha-value>)",
      },
      transparent: "transparent"
    },
    backgroundColor: {
      skin: {
        fill: "rgb(var(--color-fill) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        inverted: "rgb(var(--color-text-base) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        "card-muted": "rgb(var(--color-card-muted) / <alpha-value>)",
      },
    },
    outlineColor: {
      skin: {
        fill: "rgb(var(--color-accent) / <alpha-value>)",
      },
    },
    borderColor: {
      skin: {
        line: "rgb(var(--color-border) / <alpha-value>)",
        fill: "rgb(var(--color-text-base) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },
    },
    fill: {
      skin: {
        base: "rgb(var(--color-text-base) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },
      transparent: "transparent",
    },
    fontFamily: {
      body: ["Cabin"],
      heading: ["Nunito"],
      code: ["Inconsolata"]
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
