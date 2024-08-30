import { LOCALE } from "@config";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { buildFooterHtml, colors, generateImage } from "@utils/generateImage";
import { encode } from "html-entities";

const pages = await getCollection("blog", ({ data }) => !data.draft);

export async function GET({ params }: APIContext) {
  const page = pages.find(p => p.slug === params.id);

  const title = page!.data.title;
  const pubDatetime = page!.data.pubDatetime;

  const pubDate = pubDatetime!.toLocaleDateString(LOCALE.langTag, {
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

  const image = await generateImage(markup);
  return new Response(image.body, {
    headers: { "Content-Type": image.contentType },
  });
}

export async function getStaticPaths() {
  return pages.map(p => {
    const id = p.slug;
    return { params: { id } };
  });
}
