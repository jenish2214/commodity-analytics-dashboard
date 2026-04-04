"use client";

import { useMarketDataStore } from "@/store/marketDataStore";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import { formatPercent } from "@/utils/format";

export function RiskAnalyticsPanel() {
  const chartPoints = useMarketDataStore((s) => s.chartPoints);
  const market = useMarketDataStore((s) => s.market);
  const { sharpe, maxDrawdown, var95, volatilityAnn, beta } = useRiskMetrics({
    chartPoints,
    marketBenchmark: market,
  });

  const rows = [
    { label: "Sharpe (ann., heuristic)", value: sharpe.toFixed(2) },
    { label: "Volatility (ann.)", value: formatPercent(volatilityAnn * 100) },
    { label: "Beta (proxy)", value: beta.toFixed(2) },
    { label: "Max drawdown", value: formatPercent(-maxDrawdown * 100) },
    { label: "VaR 95% (daily)", value: formatPercent(var95 * 100) },
  ];

  return (
    <section className="ca-card" aria-label="Risk analytics">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        Risk analytics
      </h2>
      <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
        Derived from the active chart series and live commodity risk index — indicative only.
      </p>
      <dl
        style={{
          margin: 0,
          display: "grid",
          gap: "0.65rem",
          fontSize: "0.8125rem",
        }}
      >
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "0.5rem",
            }}
          >
            <dt style={{ color: "var(--text-secondary)", margin: 0 }}>{r.label}</dt>
            <dd
              style={{
                margin: 0,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
