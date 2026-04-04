"use client";

import { useMemo } from "react";
import type { MarketRow } from "@/types/models";
import { Badge } from "@/components/ui/Badge";

type Props = {
  rows: MarketRow[];
};

function confidenceFromMove(change24h: number): number {
  const mag = Math.min(1.5, Math.abs(change24h) / 2.5);
  return Math.round(52 + mag * 38);
}

export function AIInsightsPanel({ rows }: Props) {
  const cards = useMemo(() => {
    const sorted = [...rows].sort(
      (a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)
    );
    return sorted.slice(0, 4).map((r) => {
      const up = r.change24h >= 0;
      const title = `${r.commodity} ${up ? "strength" : "pressure"}`;
      const expl =
        Math.abs(r.change24h) >= 1.2
          ? `Elevated session move (${r.change24h >= 0 ? "+" : ""}${r.change24h.toFixed(2)}% vs prior close). Cross-check inventory & USD liquidity.`
          : `Range-bound action — monitor spreads and curve structure for ${r.commodity}.`;
      const impact =
        Math.abs(r.change24h) >= 1.5 ? "high" : Math.abs(r.change24h) >= 0.6 ? "med" : "low";
      return {
        id: r.id,
        title,
        expl,
        confidence: confidenceFromMove(r.change24h),
        tone: up ? ("positive" as const) : ("negative" as const),
        impact: impact as "high" | "med" | "low",
      };
    });
  }, [rows]);

  if (cards.length === 0) return null;

  return (
    <section className="ca-card ws-panel ws-rail-card" aria-label="AI insights">
      <h2 className="ws-panel-title">AI insights</h2>
      <p
        style={{
          margin: "0 0 1rem",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        Rule-based readouts from live moves — not a generative model. Confidence is a
        heuristic from magnitude only.
      </p>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gap: "0.75rem",
        }}
      >
        {cards.map((c) => (
          <li
            key={c.id}
            style={{
              padding: "0.75rem",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-primary)",
            }}
          >
            <div className="ws-insight-card__head">
              <strong className="ws-insight-card__title">{c.title}</strong>
              <div className="ws-insight-card__meta">
                <span
                  className={`ws-insight-impact ws-insight-impact--${c.impact}`}
                  title="Market impact heuristic"
                >
                  {c.impact} impact
                </span>
                <Badge tone={c.tone === "positive" ? "positive" : "negative"}>
                  {c.confidence}%
                </Badge>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "0.8125rem", lineHeight: 1.5 }}>
              {c.expl}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
