import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z
    .object({
      author: z.string().optional(),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      readingTime: z.string().optional(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: z.string().optional(),
      description: z.string(),
    })
    .strict(),
});

export const collections = { blog };
