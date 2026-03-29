"use client";

import { useMemo } from "react";
import { ChartCard } from "@/components/ChartCard";
import { CommodityTable } from "@/components/CommodityTable";
import { StatCard } from "@/components/StatCard";
import { useMarketDataStore } from "@/store/marketDataStore";
import { formatSignedUsd, formatUsd } from "@/utils/format";

export function DashboardView() {
  const market = useMarketDataStore((s) => s.market);
  const summary = useMarketDataStore((s) => s.summary);
  const searchQuery = useMarketDataStore((s) => s.searchQuery);
  const loading = useMarketDataStore((s) => s.loading);

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return market;
    return market.filter((r) => r.commodity.toLowerCase().includes(q));
  }, [market, searchQuery]);

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Commodity Market Overview</h1>
      <p className="ca-page__lead">
        Benchmarks, flows, and AI-assisted market sentiment.
      </p>
      {loading && market.length === 0 ? (
        <p style={{ color: "var(--color-label)" }}>Loading market data…</p>
      ) : null}
      <div className="ca-stat-grid" style={{ marginBottom: "1.25rem" }}>
        <StatCard
          label="Total Portfolio Value"
          value={formatUsd(summary.portfolioValue)}
        />
        <StatCard
          label="Daily Profit Loss"
          value={formatSignedUsd(summary.dailyPnl)}
          hint="vs prior close"
        />
        <StatCard
          label="Top Performing Commodity"
          value={summary.topCommodity}
        />
        <StatCard label="AI Market Sentiment" value={summary.aiSentiment} />
      </div>
      <div style={{ display: "grid", gap: "1rem" }}>
        <ChartCard />
        <CommodityTable rows={rows} />
      </div>
    </div>
  );
}
