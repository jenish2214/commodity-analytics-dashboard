"use client";

import type { MarketRow } from "@/types/models";

type Props = {
  rows: MarketRow[];
};

export function CommodityHeatmap({ rows }: Props) {
  try {
    return (
      <section className="ca-card" aria-label="Commodity performance heatmap">
        <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Session heatmap (24h %)
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "0.35rem",
          }}
        >
          {rows.map((r) => {
            const v = r.change24h;
            const intensity = Math.min(1, Math.abs(v) / 4);
            const green = v >= 0;
            const bg = green
              ? `rgba(34, 197, 94, ${0.12 + intensity * 0.35})`
              : `rgba(239, 68, 68, ${0.12 + intensity * 0.35})`;
            return (
              <div
                key={r.id}
                title={`${r.commodity}: ${v.toFixed(2)}%`}
                style={{
                  padding: "0.5rem 0.4rem",
                  borderRadius: 6,
                  background: bg,
                  border: "1px solid var(--border)",
                  textAlign: "center",
                  fontSize: "0.72rem",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {r.commodity}
                </div>
                <div style={{ color: green ? "var(--gain)" : "var(--loss)", fontVariantNumeric: "tabular-nums" }}>
                  {v >= 0 ? "+" : ""}
                  {v.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
