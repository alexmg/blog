import { LINKS } from "@config";

type Raindrop = {
  link: string;
  title: string;
  excerpt: string;
  cover: string;
  created: Date;
};

const getLinks = async () => {
  const headers = { Authorization: `Bearer ${import.meta.env.RAINDROP_TOKEN}` };
  const url = `https://api.raindrop.io/rest/v1/raindrops/0?search=%23blog&sort=-created&page=0&perpage=${LINKS.limit}`;
  const response = await fetch(url, { headers });
  const data = await response.json();
  return data.items as Raindrop[];
};

export default getLinks;
