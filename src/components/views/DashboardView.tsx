"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CommodityHeatmap } from "@/components/terminal/CommodityHeatmap";
import { CommodityMarketBoard } from "@/components/terminal/CommodityMarketBoard";
import { CorrelationMatrixPanel } from "@/components/terminal/CorrelationMatrixPanel";
import { AlertDock } from "@/components/terminal/AlertDock";
import { MarketInsightsPanel } from "@/components/terminal/MarketInsightsPanel";
import { OpportunityScannerPanel } from "@/components/terminal/OpportunityScannerPanel";
import { TerminalNewsStrip } from "@/components/terminal/TerminalNewsStrip";
import { VolatilityStrip } from "@/components/terminal/VolatilityStrip";
import { StatCard } from "@/components/StatCard";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUserStore } from "@/store/userStore";
import {
  formatCurrencyAmount,
  formatSignedCurrency,
} from "@/utils/format";

const ChartCard = dynamic(
  () => import("@/components/ChartCard").then((m) => m.ChartCard),
  {
    ssr: false,
    loading: () => (
      <div className="ca-card" style={{ padding: "1rem", color: "var(--text-secondary)" }}>
        Loading chart module…
      </div>
    ),
  }
);

function bestPerformerSymbol(
  market: { symbol: string; commodity: string; change24h: number }[]
): string {
  if (market.length === 0) return "—";
  const top = [...market].sort((a, b) => b.change24h - a.change24h)[0];
  return top.commodity;
}

export function DashboardView() {
  const currency = useUserStore((s) => s.currency);
  const market = useMarketDataStore((s) => s.market);
  const summary = useMarketDataStore((s) => s.summary);
  const commodityAnalytics = useMarketDataStore((s) => s.commodityAnalytics);
  const searchQuery = useMarketDataStore((s) => s.searchQuery);
  const loading = useMarketDataStore((s) => s.loading);
  const items = usePortfolioStore((s) => s.items);

  const openItems = useMemo(
    () => items.filter((i) => i.status === "Open"),
    [items]
  );

  const { portfolioValue, totalGain } = useMemo(() => {
    let pv = 0;
    let tg = 0;
    for (const i of openItems) {
      pv += i.currentPrice * i.quantity;
      tg += (i.currentPrice - i.buyPrice) * i.quantity;
    }
    return { portfolioValue: pv, totalGain: tg };
  }, [openItems]);

  const topCommodity = useMemo(
    () => bestPerformerSymbol(market),
    [market]
  );

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return market;
    return market.filter((r) => r.commodity.toLowerCase().includes(q));
  }, [market, searchQuery]);

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Commodity analytics terminal</h1>
      <p className="ca-page__lead">
        Benchmarks, vols, cross-asset correlations, and desk-style layouts — all sourced from the same live commodity API.
      </p>
      {loading && market.length === 0 ? (
        <div className="ca-dashboard-skeleton" aria-busy="true" aria-label="Loading market data">
          <div className="ca-stat-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ca-skeleton ca-skeleton--stat" />
            ))}
          </div>
          <div className="ca-skeleton ca-skeleton--chart" />
        </div>
      ) : (
        <>
          <div className="ca-stat-grid" style={{ marginBottom: "1.25rem" }}>
            <StatCard
              label="Portfolio Value"
              value={formatCurrencyAmount(portfolioValue, currency)}
            />
            <StatCard
              label="Open Positions"
              value={String(openItems.length)}
            />
            <StatCard
              label="Total Gain/Loss"
              value={formatSignedCurrency(totalGain, currency)}
            />
            <StatCard
              label="Top Commodity"
              value={topCommodity}
              hint="by 24h change"
            />
          </div>
          <div className="ca-terminal-grid">
            <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}>
              <CommodityHeatmap rows={rows} />
              <OpportunityScannerPanel rows={rows} analytics={commodityAnalytics} />
              <CommodityMarketBoard rows={rows} />
              <ChartCard title="Advanced chart workspace" />
              <VolatilityStrip rows={rows} />
              <CorrelationMatrixPanel />
              <TerminalNewsStrip />
            </div>
            <aside
              style={{
                display: "grid",
                gap: "1rem",
                position: "sticky",
                top: "0.5rem",
                alignSelf: "start",
              }}
              className="ca-terminal-aside"
            >
              <AlertDock />
              <MarketInsightsPanel rows={rows} />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
