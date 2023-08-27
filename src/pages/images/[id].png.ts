import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import slugify from "@utils/slugify";
import { buildFooterHtml, colors, generateImage } from "@utils/generateImage";
import { encode } from "html-entities";

const pages = await getCollection("blog", ({ data }) => !data.draft);

export async function get({ params }: APIContext) {
  var page = pages.find(p => slugify(p) === params.id);

  let title = page!.data.title;
  let pubDatetime = page!.data.pubDatetime;

  let pubDate = pubDatetime!.toLocaleDateString("en-AU", {
    dateStyle: "full",
  });

  const markup = `
  <div tw="bg-[${colors.black}] flex flex-col w-full h-full">
    <div tw="flex flex-col w-full h-4/5 p-10 justify-center">
      <div tw="text-zinc-400 text-2xl mb-6">${pubDate}</div>
      <div
        tw="text-6xl font-bold leading-snug tracking-tight text-transparent bg-red-400"
        style="font-family: nunito; background-clip: text; -webkit-background-clip: text; background: linear-gradient(90deg, rgb(45, 212, 191), rgb(65, 140, 216), rgb(213, 130, 241));"
      >
        ${encode(title)}
      </div>
    </div>
    ${buildFooterHtml()}
  </div>`;

  return generateImage(markup);
}

export async function getStaticPaths() {
  return pages.map(p => {
    const id = slugify(p);
    return { params: { id } };
  });
}
