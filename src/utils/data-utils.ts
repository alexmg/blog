import { getCollection, type CollectionEntry } from "astro:content";

export async function getAllPosts(): Promise<CollectionEntry<"posts">[]> {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();

  // Extract all tags from all posts
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    const tags = post.data.tags || [];
    tags.forEach((tag) => tagSet.add(tag));
  });

  // Convert Set to sorted array
  return Array.from(tagSet).sort();
}

export async function getPostsByTag(
  tag: string,
): Promise<CollectionEntry<"posts">[]> {
  const allPosts = await getAllPosts();

  return allPosts.filter((post) => post.data.tags?.includes(tag));
}

export interface TagWithCount {
  name: string;
  count: number;
}

export async function getAllTagsWithCount(): Promise<TagWithCount[]> {
  const posts = await getAllPosts();

  // Count posts for each tag
  const tagCountMap = new Map<string, number>();
  posts.forEach((post) => {
    const tags = post.data.tags || [];
    tags.forEach((tag) => {
      tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
    });
  });

  // Convert Map to array of TagWithCount
  const tagCounts: TagWithCount[] = Array.from(tagCountMap.entries()).map(
    ([name, count]) => ({
      name,
      count,
    }),
  );

  // Sort by name
  return tagCounts.sort((a, b) => a.name.localeCompare(b.name));
}
