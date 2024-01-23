import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";

export type TagsWithCount = {
  tag: string;
  tagName: string;
  count: number;
};

const getTagsWithCount = (posts: CollectionEntry<"blog">[]) => {
  const filteredPosts = posts.filter(({ data }) => !data.draft);
  var uniqueTags = new Set(filteredPosts.flatMap(p => p.data.tags));
  const list: TagsWithCount[] = [];
  uniqueTags.forEach(tag => {
    const result: TagsWithCount = {
      tag: slugifyStr(tag),
      tagName: tag,
      count: posts.filter(p => p.data.tags.includes(tag)).length,
    };
    list.push(result);
  });
  return list.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
};

export default getTagsWithCount;
