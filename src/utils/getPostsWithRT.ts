import type { MarkdownInstance } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export const getReadingTime = async () => {
  // Get all posts using glob. This is to get the updated frontmatter
  const globPosts = import.meta.glob<
    MarkdownInstance<CollectionEntry<"blog">["data"]>
  >("../content/blog/*.md");

  // Get the posts collection to lookup the slug
  const posts = await getCollection("blog");

  // Then, set those frontmatter value in a JS Map with key value pair
  const mapFrontmatter = new Map();
  const globPostsValues = Object.values(globPosts);
  await Promise.all(
    globPostsValues.map(async globPost => {
      const { frontmatter, file } = await globPost();
      const filename = file.split("/").pop();
      var post = posts.find(x => x.id === filename);
      mapFrontmatter.set(post?.slug, frontmatter.readingTime);
    })
  );

  return mapFrontmatter;
};

const getPostsWithRT = async (posts: CollectionEntry<"blog">[]) => {
  const mapFrontmatter = await getReadingTime();
  return posts.map(post => {
    post.data.readingTime = mapFrontmatter.get(post.slug);
    return post;
  });
};

export default getPostsWithRT;
