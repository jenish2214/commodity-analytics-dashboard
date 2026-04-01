"use client";

import type { MarketRow } from "@/types/models";

type Props = {
  rows: MarketRow[];
};

export function VolatilityStrip({ rows }: Props) {
  try {
    const withVol = rows.filter(
      (r) => r.volatility30dAnn != null && r.riskIndex != null
    );
    if (withVol.length === 0) return null;

    return (
      <section className="ca-card" aria-label="Volatility snapshot">
        <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Volatility & risk index
        </h2>
        <p
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
          }}
        >
          Annualized σ from ~30 daily closes (contract). Risk index caps at 100.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {withVol.slice(0, 12).map((r) => (
            <div
              key={r.id}
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-hover)",
                fontSize: "0.72rem",
              }}
            >
              <strong>{r.commodity}</strong>
              <div style={{ color: "var(--text-secondary)" }}>
                7d ann:{" "}
                {r.volatility7dAnn != null
                  ? `${(r.volatility7dAnn * 100).toFixed(1)}%`
                  : "—"}
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                30d ann: {(r.volatility30dAnn! * 100).toFixed(1)}%
              </div>
              <div>Risk {r.riskIndex ?? "—"}</div>
            </div>
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
