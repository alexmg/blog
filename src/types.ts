import type socialIcons from "@assets/socialIcons";

export type Site = {
  website: string;
  domain: string;
  author: string;
  desc: string;
  title: string;
  lightAndDarkMode: boolean;
  postPerPage: number;
  socials: Socials;
};

export type Socials = {
  mastodon: string;
  twitter: string;
  linkedIn: string;
  gitHub: string;
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
}[];
