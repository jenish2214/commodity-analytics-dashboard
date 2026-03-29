"use client";

import { useEffect, useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { useNewsStore } from "@/store/newsStore";
import type { NewsArticle } from "@/types/models";

const CATEGORIES = ["All", "Business", "Technology", "Political", "Commodities", "Energy", "Markets", "World"];

export function MarketNewsView() {
  const { news, loading, error, fetchNews, refreshNews } = useNewsStore();
  const [filter, setFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    // Fetch news when component mounts
    fetchNews();
    
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(() => {
      refreshNews();
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchNews, refreshNews]);

  // Fetch categories and sources when news updates
  useEffect(() => {
    // In a real app, these would come from the API response
    setCategories(["Business", "Technology", "Political", "Commodities", "Energy", "Markets", "World"]);
    setSources(["Reuters", "Bloomberg", "CNBC", "MarketWatch", "TechCrunch", "BBC", "CNN", "The Guardian"]);
  }, [news]);

  // Filter articles based on selected category and source
  useEffect(() => {
    let filtered = news;
    
    if (filter !== "All") {
      filtered = filtered.filter(article => article.category === filter);
    }
    
    if (sourceFilter !== "All") {
      filtered = filtered.filter(article => article.source === sourceFilter);
    }
    
    // Convert news store format to NewsArticle format for NewsCard component
    const convertedArticles: NewsArticle[] = filtered.map((item) => ({
      id: item.id,
      title: item.title,
      source: item.source,
      publishedAt: item.publishedAt,
      excerpt: item.summary || '',
      image: item.image,
      url: item.url,
    }));
    
    setArticles(convertedArticles);
  }, [news, filter, sourceFilter]);

  return (
    <div className="ca-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 className="ca-page__title">Market News</h1>
          <p className="ca-page__lead">Live news from top sources worldwide</p>
        </div>
        <button
          onClick={refreshNews}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Category:
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: filter === category ? 'var(--accent)' : 'var(--bg-hover)',
                border: filter === category ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: filter === category ? 'var(--bg-primary)' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Source Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Source:
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            key="All"
            onClick={() => setSourceFilter("All")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: sourceFilter === "All" ? 'var(--accent)' : 'var(--bg-hover)',
              border: sourceFilter === "All" ? '1px solid var(--accent)' : '1px solid var(--border)',
              color: sourceFilter === "All" ? 'var(--bg-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            All Sources
          </button>
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: sourceFilter === source ? 'var(--accent)' : 'var(--bg-hover)',
                border: sourceFilter === source ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: sourceFilter === source ? 'var(--bg-primary)' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filter !== "All" || sourceFilter !== "All") && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          alignItems: 'center', 
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'var(--bg-hover)',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Active filters:</span>
          {filter !== "All" && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              borderRadius: '4px',
              fontSize: '0.75rem'
            }}>
              {filter}
            </span>
          )}
          {sourceFilter !== "All" && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              borderRadius: '4px',
              fontSize: '0.75rem'
            }}>
              {sourceFilter}
            </span>
          )}
          <button
            onClick={() => {
              setFilter("All");
              setSourceFilter("All");
            }}
            style={{
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          background: 'var(--loss)',
          color: 'white',
          borderRadius: '6px',
          marginBottom: '1rem',
        }}>
          Error: {error}
        </div>
      )}

      {loading && news.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{
              padding: '1rem',
              background: 'var(--bg-hover)',
              borderRadius: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ height: '200px', borderRadius: '8px', background: 'var(--bg-card)', marginBottom: '1rem' }} />
              <div style={{ height: '20px', borderRadius: '4px', background: 'var(--bg-card)', marginBottom: '0.5rem' }} />
              <div style={{ height: '16px', borderRadius: '4px', background: 'var(--bg-card)', width: '80%' }} />
            </div>
          ))}
        </div>
      ) : null}

      <div className="ca-news-grid">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {news.length === 0 && !loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--text-secondary)',
        }}>
          <p>No news available at the moment.</p>
          <button
            onClick={fetchNews}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {articles.length === 0 && !loading && !error && news.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--text-secondary)',
        }}>
          <p>No articles found for the selected filters.</p>
          <button
            onClick={() => {
              setFilter("All");
              setSourceFilter("All");
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
