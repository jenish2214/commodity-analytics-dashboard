"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useNewsStore } from "@/store/newsStore";

export function TerminalNewsStrip() {
  const news = useNewsStore((s) => s.news);
  const fetchNews = useNewsStore((s) => s.fetchNews);

  useEffect(() => {
    try {
      if (news.length === 0) void fetchNews();
    } catch {
      /* ignore */
    }
  }, [news.length, fetchNews]);

  const top = news.slice(0, 5);

  if (top.length === 0) {
    return (
      <section
        className="ca-card"
        style={{ marginTop: "1rem" }}
        aria-label="News"
      >
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          No headlines yet — open{" "}
          <Link href="/market-news" style={{ color: "var(--accent)" }}>
            Market News
          </Link>{" "}
          to refresh the feed.
        </p>
      </section>
    );
  }

  return (
    <section className="ca-card" style={{ marginTop: "1rem" }} aria-label="Headlines">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        News wire
      </h2>
      <ul style={{ margin: 0, paddingLeft: "1rem", display: "grid", gap: "0.35rem", fontSize: "0.78rem" }}>
        {top.map((a) => (
          <li key={a.id}>
            {a.url ? (
              <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)" }}>
                {a.title}
              </a>
            ) : (
              a.title
            )}
            <span style={{ color: "var(--text-secondary)" }}> — {a.source}</span>
          </li>
        ))}
      </ul>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.72rem" }}>
        <Link href="/market-news" style={{ color: "var(--accent)" }}>
          All news →
        </Link>
      </p>
    </section>
  );
}
