import type { NewsArticle } from "@/types/models";

type Props = {
  article: NewsArticle;
};

export function NewsCard({ article }: Props) {
  const initial = article.source.charAt(0).toUpperCase();
  return (
    <article className="ca-card">
      <div className="ca-news-thumb" aria-hidden>
        {initial}
      </div>
      <h3
        className="ca-page__title"
        style={{ fontSize: "1rem", margin: "0.75rem 0 0.35rem" }}
      >
        {article.title}
      </h3>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-body)" }}>
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
