"use client";

import { useEffect, useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import type { NewsArticle } from "@/types/models";

export function MarketNewsView() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const data = (await res.json()) as { articles: NewsArticle[] };
        if (!cancelled) setArticles(data.articles);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Market News</h1>
      <p className="ca-page__lead">Curated headlines with source attribution.</p>
      {loading ? (
        <p style={{ color: "var(--color-label)" }}>Loading news…</p>
      ) : null}
      <div className="ca-news-grid">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
