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
  name: SocialMedia;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

export type SocialIcons = {
  [social in SocialMedia]: string;
};

export type SocialMedia =
  | "Github"
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "Mail"
  | "Twitter"
  | "Twitch"
  | "YouTube"
  | "WhatsApp"
  | "Snapchat"
  | "Pinterest"
  | "TikTok"
  | "CodePen"
  | "Discord"
  | "GitLab"
  | "Reddit"
  | "Skype"
  | "Steam"
  | "Telegram"
  | "Mastodon";
