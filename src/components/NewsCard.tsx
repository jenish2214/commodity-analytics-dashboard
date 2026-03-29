import type { NewsArticle } from "@/types/models";

type Props = {
  article: NewsArticle;
};

export function NewsCard({ article }: Props) {
  const initial = article.source.charAt(0).toUpperCase();
  
  return (
    <article className="ca-card" style={{ cursor: 'pointer' }} onClick={() => window.open(article.url, '_blank')}>
      {article.image ? (
        <div 
          className="ca-news-thumb" 
          aria-hidden
          style={{
            backgroundImage: `url(${article.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7))',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '1rem',
          }}>
            <span style={{
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(0,0,0,0.5)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
            }}>
              {article.source}
            </span>
          </div>
        </div>
      ) : (
        <div className="ca-news-thumb" aria-hidden>
          {initial}
        </div>
      )}
      <h3
        className="ca-page__title"
        style={{ fontSize: "1rem", margin: "0.75rem 0 0.35rem", lineHeight: "1.4" }}
      >
        {article.title}
      </h3>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-body)", lineHeight: "1.5" }}>
        {article.excerpt}
      </p>
      <p
        style={{
          margin: "0.75rem 0 0",
          fontSize: "12px",
          color: "var(--color-label)",
        }}
      >
        {article.source} · {article.publishedAt}
      </p>
    </article>
  );
}
