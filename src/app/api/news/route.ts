import { NextResponse } from "next/server";

const RSS_FEEDS = [
  // Business & Financial News
  {
    source: "Reuters",
    url: "https://feeds.reuters.com/reuters/businessNews",
    category: "Business",
  },
  {
    source: "Bloomberg",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    category: "Business",
  },
  {
    source: "CNBC",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    category: "Business",
  },
  {
    source: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/marketpulse/",
    category: "Business",
  },
  {
    source: "Financial Times",
    url: "https://www.ft.com/rss/home/europe",
    category: "Business",
  },
  {
    source: "Wall Street Journal",
    url: "https://feeds.wsjonline.com/wsj/xml/rss/10_7014.xml",
    category: "Business",
  },

  // Technology News
  {
    source: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "Technology",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "Technology",
  },
  {
    source: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    category: "Technology",
  },
  {
    source: "Wired",
    url: "https://www.wired.com/feed/rss",
    category: "Technology",
  },

  // Political News
  {
    source: "BBC Politics",
    url: "https://feeds.bbci.co.uk/news/politics/rss.xml",
    category: "Political",
  },
  {
    source: "CNN Politics",
    url: "http://rss.cnn.com/rss/edition_politics.rss",
    category: "Political",
  },
  {
    source: "Politico",
    url: "https://www.politico.com/rss/politics.xml",
    category: "Political",
  },
  {
    source: "The Hill",
    url: "https://thehill.com/feed/",
    category: "Political",
  },

  // Commodities & Energy
  {
    source: "Investing.com",
    url: "https://www.investing.com/rss/news_301.rss",
    category: "Commodities",
  },
  {
    source: "Kitco",
    url: "https://www.kitco.com/rss/kitco-news.xml",
    category: "Commodities",
  },
  {
    source: "OilPrice.com",
    url: "https://oilprice.com/rss/main",
    category: "Energy",
  },

  // General Markets
  {
    source: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    category: "Markets",
  },
  {
    source: "Seeking Alpha",
    url: "https://seekingalpha.com/rss.xml",
    category: "Markets",
  },

  // International News
  {
    source: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "World",
  },
  {
    source: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    category: "World",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    category: "World",
  },
];

function parseRSS(xml: string, source: string, category: string) {
  const items: any[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  
  for (const match of itemMatches) {
    const block = match[1];
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([^<]*)<\/${tag}>`));
      return (m?.[1] ?? m?.[2] ?? "").trim();
    };
    
    const title = get("title");
    const link = get("link");
    const pubDate = get("pubDate");
    const descContent = get("description");
    const desc = descContent.replace(/<[^>]+>/g, "").slice(0, 200);

    let image = null;
    const mediaContent = block.match(/<media:content[^>]*url="([^"]+)"/i);
    const enclosure = block.match(/<enclosure[^>]*url="([^"]+)"/i);
    const imgInDesc = descContent.match(/<img[^>]*src="([^"]+)"/i);
    if (mediaContent) image = mediaContent[1];
    else if (enclosure) image = enclosure[1];
    else if (imgInDesc) image = imgInDesc[1];
    
    if (title && link) {
      items.push({
        id: Buffer.from(link).toString("base64").slice(0, 16),
        title,
        source,
        category,
        publishedAt: formatDate(pubDate),
        url: link,
        excerpt: desc,
        image,
      });
    }
  }
  return items;
}

function formatDate(pubDate: string): string {
  const date = new Date(pubDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 900 }, // 15 minutes cache
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch ${feed.source}`);
        }

        const xml = await res.text();
        return parseRSS(xml, feed.source, feed.category);
      })
    );

    const allNews = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<any[]>).value)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 100); // Latest 100 articles

    // Group by category
    const groupedByCategory = allNews.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof allNews>);

    // Group by source
    const groupedBySource = allNews.reduce((acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = [];
      }
      acc[item.source].push(item);
      return acc;
    }, {} as Record<string, typeof allNews>);

    return NextResponse.json({
      articles: allNews,
      groupedByCategory,
      groupedBySource,
      categories: Object.keys(groupedByCategory),
      sources: Object.keys(groupedBySource),
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Failed to fetch news:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch news",
        articles: [],
        groupedByCategory: {},
        groupedBySource: {},
        categories: [],
        sources: [],
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
