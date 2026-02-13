import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { SITE } from "@/consts";
import { getAllPosts } from "@/utils/data-utils";

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: site!.href,
    items: posts.map(({ data, id }) => ({
      link: `posts/${id}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.updated ?? data.date),
    })),
  });
};
