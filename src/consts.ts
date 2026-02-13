import type { Site, Social } from "@/types";

export const SITE: Site = {
  title: "Alex Meyer-Gleaves",
  description: "The personal blog of Alex Meyer-Gleaves",
  author: "alexmg",
  locale: "en-AU",
  featuredPostCount: 2,
  postsPerPage: 5,
};

export const SOCIALS: Social[] = [
  {
    title: "GitHub",
    icon: "github",
    url: "https://github.com/alexmg",
  },
  {
    title: "Bluesky",
    icon: "bluesky",
    url: "https://bsky.app/profile/alexmg.dev",
  },
  {
    title: "Mastodon",
    icon: "mastodon",
    url: "https://hachyderm.io/@alexmg",
  },
  {
    title: "Twitter/X",
    icon: "x-twitter",
    url: "https://x.com/a13x_mg",
  },
  {
    title: "LinkedIn",
    icon: "linkedin",
    url: "https://www.linkedin.com/in/alexmeyergleaves",
  },
];
