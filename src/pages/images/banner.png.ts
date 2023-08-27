import type { APIContext } from "astro";
import { SITE } from "@config";
import { generateImage, colors, buildFooterHtml } from "@utils/generateImage";

export async function get({ params }: APIContext) {
  const markup = `
  <div tw="bg-[${colors.black}] flex flex-col w-full h-full">
    <div tw="flex flex-col w-full h-4/5 p-10 justify-center items-center">
      <img
        src="https://avatars.githubusercontent.com/u/131293?v=4"
        tw="w-28 h-28 rounded-full"
      />
      <div
        tw="text-8xl font-bold leading-snug tracking-tight text-transparent bg-red-400"
        style="font-family: nunito; background-clip: text; -webkit-background-clip: text; background: linear-gradient(90deg, rgb(45, 212, 191), rgb(65, 140, 216), rgb(213, 130, 241));"
      >
        ${SITE.title}
      </div>
        <div tw="text-[${colors.white}] text-3xl mt-6">${SITE.domain}</div>
    </div>
    ${buildFooterHtml()}
  </div>`;

  return generateImage(markup);
}
