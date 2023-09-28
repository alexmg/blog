import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://alexmg.dev/",
  domain: "alexmg.dev",
  author: "Alex Meyer-Gleaves",
  desc: "The personal blog of Alex Meyer-Gleaves",
  title: "Alex Meyer-Gleaves",
  socials: {
    mastodon: "@alexmg@hachyderm.io",
    twitter: "@a13x_mg",
    linkedIn: "ameyergleaves",
    gitHub: "alexmg",
  },
  lightAndDarkMode: false,
  postPerPage: 10,
};

export const LINKS = {
  title: `${SITE.title} | Links`,
  desc: "Recent content from across the web that has caught my attention",
  limit: 20,
};

export const LOCALE = ["en-AU"]; // set to [] to use the environment default

export const GISCUS = {
  repo: "alexmg/blog-comments",
  repoId: "R_kgDOKK8C0A",
  category: "Announcements",
  categoryId: "DIC_kwDOKK8C0M4CY1Jl",
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/alexmg",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Facebook",
    href: "",
    linkTitle: `${SITE.title} on Facebook`,
    active: false,
  },
  {
    name: "Instagram",
    href: "",
    linkTitle: `${SITE.title} on Instagram`,
    active: false,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/alexmeyergleaves",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:yourmail@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/a13x_mg",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "Twitch",
    href: "",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "",
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: false,
  },
  {
    name: "Snapchat",
    href: "",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false,
  },
  {
    name: "Pinterest",
    href: "",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false,
  },
  {
    name: "TikTok",
    href: "",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "CodePen",
    href: "",
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: "Discord",
    href: "",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: "Skype",
    href: "",
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: "Steam",
    href: "",
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: "Telegram",
    href: "",
    linkTitle: `${SITE.title} on Telegram`,
    active: false,
  },
  {
    name: "Mastodon",
    href: "https://hachyderm.io/@alexmg",
    linkTitle: `${SITE.title} on Mastodon`,
    active: true,
  },
];
