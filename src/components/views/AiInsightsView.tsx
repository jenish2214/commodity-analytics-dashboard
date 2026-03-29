"use client";

import { AIInsightCard } from "@/components/AIInsightCard";
import { useAiInsightsStore } from "@/store/aiInsightsStore";

export function AiInsightsView() {
  const sentimentAnalysis = useAiInsightsStore((s) => s.sentimentAnalysis);
  const predictions = useAiInsightsStore((s) => s.predictions);
  const tradingSignals = useAiInsightsStore((s) => s.tradingSignals);
  const highlights = useAiInsightsStore((s) => s.highlights);
  const loading = useAiInsightsStore((s) => s.loading);

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">AI Insights</h1>
      <p className="ca-page__lead">
        Model-driven commentary, forecasts, and executable signals.
      </p>
      {loading && predictions.length === 0 ? (
        <p style={{ color: "var(--color-label)" }}>Loading AI insights…</p>
      ) : null}
      <AIInsightCard
        title="Market sentiment analysis"
        body={sentimentAnalysis}
      />
      <AIInsightCard
        title="Precious metals — AI read"
        body={highlights.commodityInsight}
      />
      <AIInsightCard
        title="Macro highlight — energy complex"
        body={highlights.oilInsight}
      />
      <section className="ca-card" style={{ marginBottom: "1rem" }}>
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}
        >
          Commodity predictions
        </h2>
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          {predictions.map((p) => (
            <article
              key={p.id}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: "1rem",
                background: "var(--color-secondary)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>{p.commodity}</p>
              <p style={{ margin: "0.35rem 0", fontSize: "0.875rem" }}>
                Prediction:{" "}
                <span className={p.prediction === "Bearish" ? "ca-neg" : "ca-pos"}>
                  {p.prediction}
                </span>
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-label)" }}>
                Confidence {p.confidence}%
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="ca-card">
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}
        >
          AI trading signals
        </h2>
        <div className="ca-table-wrap">
          <table className="ca-table">
            <thead>
              <tr>
                <th scope="col">Commodity</th>
                <th scope="col">Signal</th>
                <th scope="col">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {tradingSignals.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.commodity}</td>
                  <td>
                    <span
                      className={
                        t.signal === "BUY"
                          ? "ca-signal ca-signal--buy"
                          : t.signal === "SELL"
                            ? "ca-signal ca-signal--sell"
                            : "ca-signal ca-signal--hold"
                      }
                    >
                      {t.signal}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "normal" }}>{t.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
