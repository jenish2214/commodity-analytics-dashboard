"use client";

import { useMemo } from "react";
import type { MarketRow } from "@/types/models";

type Props = {
  rows: MarketRow[];
};

function insightSentence(row: MarketRow): string {
  try {
    const up = row.change24h > 0;
    const big = Math.abs(row.change24h) >= 1.5;
    if (row.symbol === "gold") {
      if (up && big) {
        return "Gold is bid: often supported when real yields dip or the dollar softens — watch DXY and front-end Treasury yields.";
      }
      if (!up && big) {
        return "Gold is offered: strength in USD or higher real rates can weigh on the complex — confirm with USD/JPY and TIPS.";
      }
    }
    if (row.symbol === "crudeOil") {
      if (!up && big) {
        return "Crude is softer: inventory builds or risk-off in energy often follow bearish inventory surprises or demand jitters.";
      }
      if (up && big) {
        return "Crude is firmer: supply risks or USD weakness can lift WTI — check inventories and OPEC headlines.";
      }
    }
    if (row.symbol === "silver") {
      return `Silver ${up ? "outperforms" : "lags"} vs prior close; industrial demand and gold-beta both matter for continuation.`;
    }
    if (row.symbol === "copper") {
      return `Copper ${up ? "shows" : "lacks"} risk-on tone; Dr. Copper often tracks global PMI / China activity expectations.`;
    }
    return `${row.commodity} is ${up ? "up" : "down"} ${Math.abs(row.change24h).toFixed(2)}% — cross-check with your macro dashboard.`;
  } catch {
    return "—";
  }
}

export function MarketInsightsPanel({ rows }: Props) {
  const bullets = useMemo(() => {
    try {
      const movers = [...rows].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
      return movers.slice(0, 5).map((r) => ({
        key: r.id,
        title: r.commodity,
        text: insightSentence(r),
      }));
    } catch {
      return [];
    }
  }, [rows]);

  if (bullets.length === 0) return null;

  return (
    <section className="ca-card" aria-label="Market insights">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        AI-style insight strip
      </h2>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
        Rule-based explanations from live % moves — not generative AI. Tune with your desk&apos;s macro inputs.
      </p>
      <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.5rem", fontSize: "0.8rem" }}>
        {bullets.map((b) => (
          <li key={b.key}>
            <strong>{b.title}:</strong> {b.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
