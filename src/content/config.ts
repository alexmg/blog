import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z
    .object({
      author: z.string().optional(),
      pubDatetime: z.date(),
      modDatetime: z.date().optional(),
      readingTime: z.string().optional(),
      title: z.string(),
      postSlug: z.string().optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: z.string().optional(),
      description: z.string(),
    })
    .strict(),
});

export const collections = { blog };
