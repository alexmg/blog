import { slug as slugger } from "github-slugger";
import type { CollectionEntry } from "astro:content";
import type { BlogFrontmatter } from "@content/_schemas";

export const slugifyStr = (str: string) => slugger(str);

export const slugifyFrontmatter = (post: BlogFrontmatter) =>
  post?.postSlug ? slugger(post.postSlug) : slugger(post.title);

const slugify = (post: CollectionEntry<"blog">) =>
  post.data.postSlug ? slugger(post.data.postSlug) : post.slug;

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

export default slugify;
