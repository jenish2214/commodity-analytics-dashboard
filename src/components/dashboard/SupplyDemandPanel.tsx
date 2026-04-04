"use client";

import type { CommodityAnalytics } from "@/types/models";

type Props = {
  analytics: CommodityAnalytics;
};

export function SupplyDemandPanel({ analytics }: Props) {
  return (
    <section className="ca-card" aria-label="Supply and demand signals">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        Supply &amp; demand signals
      </h2>
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          fontSize: "0.8125rem",
        }}
      >
        {analytics.sectorRotation.length > 0 ? (
          <div>
            <p
              style={{
                margin: "0 0 0.35rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontSize: "0.6875rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Sector rotation
            </p>
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              {analytics.sectorRotation.slice(0, 4).map((s) => (
                <li key={s.sector}>
                  <strong>{s.label}</strong> — avg {s.avgChange24h >= 0 ? "+" : ""}
                  {s.avgChange24h.toFixed(2)}% (median {s.medianChange24h.toFixed(2)}%)
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {analytics.spreads.length > 0 ? (
          <div>
            <p
              style={{
                margin: "0 0 0.35rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontSize: "0.6875rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Relative value / spreads
            </p>
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              {analytics.spreads.slice(0, 5).map((sp, i) => (
                <li key={`${sp.label}-${i}`}>
                  {sp.label}: {sp.detail}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Live spread diagnostics sync with the commodity API response.
          </p>
        )}
      </div>
    </section>
  );
}
