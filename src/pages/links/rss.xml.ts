import rss from "@astrojs/rss";
import { SITE, LINKS } from "@config";
import getLinks from "@utils/getLinks";

export async function GET() {
  const links = await getLinks();
  return rss({
    title: LINKS.title,
    description: LINKS.desc,
    site: new URL("links", SITE.website).href,
    items: links.map(link => ({
      link: link.link,
      title: link.title,
      description: link.excerpt,
      pubDate: link.created,
    })),
  });
}
