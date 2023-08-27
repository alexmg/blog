import PostMetadata from "./PostMetadata";
import type { BlogFrontmatter } from "@content/_schemas";

export interface Props {
  href?: string;
  frontmatter: BlogFrontmatter;
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, description, readingTime } = frontmatter;
  return (
    <li className="my-6 space-y-2">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 className="text-lg font-medium hover:underline">{title}</h2>
        ) : (
          <h3 className="text-lg font-medium hover:underline">{title}</h3>
        )}
      </a>
      <PostMetadata datetime={pubDatetime} readingTime={readingTime} />
      <p>{description}</p>
    </li>
  );
}
