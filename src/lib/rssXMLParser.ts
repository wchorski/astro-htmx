export type NormalizedNewsArticle = {
  id: string;
  title: string;
  link: string;
  updated: string;
  media: {
    url: string;
    width: string | number;
    height: string | number;
  };
  excerpt: string;
  content: string;
  author: string;
  category: string;
  origin: string
};

type RSSEngadget = {
  title: string;
  link: string;
  pubDate: string;
  author: string;
  category: string;
  guid: string;
  description: string;
  "content:encoded": 'But Reuters says NVIDIA has yet to make any deliveries. <p><img src="https://www.engadget.com/img/gallery/us-reportedly-gives-10-chinese-companies-the-clearance-to-buy-nvidia-h200-chips/intro-1778753352.jpg" /></p>';
  "media:thumbnail": {
    "@_url": string;
  };
  enclosure: {
    url: string;
    type: string;
    length: string;
  };
};
type RSSTechcrunch = {
  title: string;
  link: string;
  pubDate: string;
  author: string;
  category: string;
  guid: string;
  description: string;
  "content:encoded": 'But Reuters says NVIDIA has yet to make any deliveries. <p><img src="https://www.engadget.com/img/gallery/us-reportedly-gives-10-chinese-companies-the-clearance-to-buy-nvidia-h200-chips/intro-1778753352.jpg" /></p>';
  "media:thumbnail": [Object];
  enclosure: [Object];
};

function rssEngadget(rssItem: RSSEngadget): NormalizedNewsArticle {
  const { guid, title, link, pubDate, description, author, category } = rssItem;
  return {
    id: guid,
    title: title,
    link: link,
    updated: pubDate,

    media: {
      url: rssItem["media:thumbnail"]["@_url"],
      width: 300,
      height: 300,
    },
    excerpt: description,
    content: rssItem["content:encoded"],
    author,
    category,
    origin: "https://www.engadget.com"
  };
}
function rssTechcrunch(rssItem: RSSTechcrunch): NormalizedNewsArticle {
  return rssItem;
}

export function rssXMLParser(rssItem: RSSEngadget | RSSTechcrunch) {
  
  const url = new URL(rssItem.link);

  const origin = url.origin as
    | "https://techcrunch.com"
    | "https://www.engadget.com";

  switch (origin) {
    case "https://www.engadget.com":
      return rssEngadget(rssItem);
    case "https://techcrunch.com":
      return rssTechcrunch(rssItem);

    default:
      throw new Error("RSS feed source not supported");
  }
}
