import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config";
import getSortedPosts from "@utils/getSortedPosts";

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = await getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(post => ({
      link: `posts/${post.slug}/`,
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.modDatetime ?? post.data.pubDatetime),
    })),
  });
}
