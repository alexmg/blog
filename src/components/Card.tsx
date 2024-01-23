import PostMetadata from "./PostMetadata";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, modDatetime, description, readingTime } =
    frontmatter;
  const headerClassName = "text-lg font-medium hover:underline";
  return (
    <li className="my-6 space-y-2">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 className={headerClassName}>{title}</h2>
        ) : (
          <h3 className={headerClassName}>{title}</h3>
        )}
      </a>
      <PostMetadata
        pubDatetime={pubDatetime}
        modDatetime={modDatetime}
        readingTime={readingTime}
      />
      <p>{description}</p>
    </li>
  );
}
