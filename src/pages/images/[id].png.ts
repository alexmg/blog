import { SITE } from "@/consts";
import type { APIContext } from "astro";
import { getAllPosts } from "@/utils/data-utils";
import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js";
import { encode } from "html-entities";
import fs from "node:fs/promises";
import path from "node:path";

const dimensions = {
  width: 1200,
  height: 630,
};

// Enable static pre-rendering for OG images
export const prerender = true;

// Define paths for static pre-rendering
export async function getStaticPaths() {
  const posts = await getAllPosts();
  return [
    // Default site path
    { params: { id: "og" } },
    // Path for each post
    ...posts.map((post) => ({
      params: { id: post.id },
    })),
  ];
}

// Get the post title from the URL parameter
export async function GET({ params, site }: APIContext) {
  // Get post info from the params
  const postId = params.id;

  let title = SITE.title;
  let titleSize = 72;

  // If a post ID is provided, find the post and use its title
  if (postId !== "og") {
    const posts = await getAllPosts();
    const post = posts.find((post) => post.id === postId);
    if (post) {
      title = encode(post.data.title);
      titleSize = 64;
    }
  }

  // Create the OG image
  const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <clipPath id="circleClip">
          <circle cx="0" cy="0" r="100" />
        </clipPath>
      </defs>
      
      <!-- Background image -->
      <image xlink:href="/banner.png" width="${dimensions.width}" height="${dimensions.height}" preserveAspectRatio="xMidYMid slice" />
      
      <!-- Semi-transparent overlay -->
      <rect width="${dimensions.width}" height="${dimensions.height}" fill="black" opacity="0.5" />
      
      <!-- Logo with proper centering -->
      <g transform="translate(600, 180)">
        <!-- White circle background -->
        <circle cx="0" cy="0" r="100" fill="white" stroke="#218676" stroke-width="10" />
        <!-- Logo image properly centered -->
        <image xlink:href="/logo.png" x="-100" y="-100" width="200" height="200" preserveAspectRatio="xMidYMid slice" clip-path="url(#circleClip)" />
      </g>
      <!-- Title with text wrapping for long titles -->
      ${(() => {
        // Handle title text wrapping for better readability
        if (title.length <= 40) {
          // Short titles - single line
          return `<text 
            x="600" 
            y="420"
            font-family="Nunito" 
            font-size="${titleSize}" 
            font-weight="bold" 
            text-anchor="middle" 
            fill="white"
          >
            ${title}
          </text>`;
        } else {
          // Long titles - wrap to two lines
          const words = title.split(" ");
          let firstLine = "";
          let secondLine = "";

          // Distribute words to achieve roughly equal line lengths
          const midpoint = Math.ceil(title.length / 2);
          let currentLength = 0;

          for (const word of words) {
            if (currentLength + word.length <= midpoint) {
              firstLine += (firstLine ? " " : "") + word;
              currentLength += word.length + 1;
            } else {
              secondLine += (secondLine ? " " : "") + word;
            }
          }

          // Trim and add ellipsis if second line is too long
          if (secondLine.length > 45) {
            secondLine = secondLine.substring(0, 42) + "...";
          }

          return `
          <text 
            x="600" 
            y="380" 
            font-family="Nunito" 
            font-size="60" 
            font-weight="bold" 
            text-anchor="middle" 
            fill="white"
          >
            ${firstLine}
          </text>
          <text 
            x="600" 
            y="450" 
            font-family="Nunito" 
            font-size="60" 
            font-weight="bold" 
            text-anchor="middle" 
            fill="white"
          >
            ${secondLine}
          </text>`;
        }
      })()}
      
      <!-- Site name at the bottom (only for post images) -->
      <text 
        x="600" 
        y="550" 
        font-family="Nunito" 
        font-size="38" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="#41d1aa"
      >
        ${new URL(site!.href).hostname}
      </text>
    </svg>
  `;

  // Read local .ttf font file to use with resvg
  const fontPath = path.join(process.cwd(), "fonts", "Nunito-Bold.ttf");

  // Read local image files
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoData = await fs.readFile(logoPath);
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  const bannerPath = path.join(process.cwd(), "public", "banner.png");
  const bannerData = await fs.readFile(bannerPath);
  const bannerBase64 = `data:image/png;base64,${bannerData.toString("base64")}`;

  // Update svg to use embedded base64 images
  const svgWithEmbeddedImages = svg
    .replace("/logo.png", logoBase64)
    .replace("/banner.png", bannerBase64);

  // Configure resvg with font and size options
  const opts: ResvgRenderOptions = {
    font: {
      fontFiles: [fontPath],
      loadSystemFonts: false, // Fall back to system fonts if needed
      defaultFontFamily: "Nunito",
    },
    background: "transparent",
    fitTo: {
      mode: "width" as const,
      value: dimensions.width,
    },
  };

  // Render SVG to PNG
  const resvg = new Resvg(svgWithEmbeddedImages, opts);
  const pngData = resvg.render().asPng();

  // Return PNG with proper headers
  return new Response(pngData, {
    headers: { "Content-Type": "image/png" },
  });
}
