"use client";

import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { MarketOverviewCards } from "@/components/dashboard/MarketOverviewCards";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { RiskAnalyticsPanel } from "@/components/dashboard/RiskAnalyticsPanel";
import { SeasonalityPanel } from "@/components/dashboard/SeasonalityPanel";
import { SupplyDemandPanel } from "@/components/dashboard/SupplyDemandPanel";
import { MacroIndicatorsPanel } from "@/components/dashboard/MacroIndicatorsPanel";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CommodityHeatmap } from "@/components/terminal/CommodityHeatmap";
import { CorrelationMatrixPanel } from "@/components/terminal/CorrelationMatrixPanel";
import { AlertDock } from "@/components/terminal/AlertDock";
import { CommodityTable } from "@/components/CommodityTable";
import { PortfolioPieChart } from "@/components/PortfolioPieChart";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";

const ChartCard = dynamic(
  () => import("@/components/ChartCard").then((m) => m.ChartCard),
  {
    ssr: false,
    loading: () => (
      <div className="ca-card ws-panel ws-panel--chart-skel" aria-busy="true">
        <div className="ca-skeleton" style={{ height: "min(420px, 50vh)" }} />
      </div>
    ),
  }
);

function PanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="ws-panel-title">{children}</h2>;
}

export function DashboardView() {
  const market = useMarketDataStore((s) => s.market);
  const commodityAnalytics = useMarketDataStore((s) => s.commodityAnalytics);
  const searchQuery = useMarketDataStore((s) => s.searchQuery);
  const loading = useMarketDataStore((s) => s.loading);
  const allocation = usePortfolioStore((s) => s.allocation);

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return market;
    return market.filter((r) => r.commodity.toLowerCase().includes(q));
  }, [market, searchQuery]);

  return (
    <div className="ca-page ca-page--wide ws-page">
      <header className="ca-dashboard-hero ws-page-hero ca-motion-hero">
        <h1 className="ca-page__title">Intelligence workspace</h1>
        <p className="ca-page__lead">
          Modular analytics surface — benchmarks, book context, and risk in one glance. Filters
          follow the global search.
        </p>
      </header>

      {loading && market.length === 0 ? (
        <div className="ca-dashboard-skeleton" aria-busy="true" aria-label="Loading market data">
          <div className="kpi-stack">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ca-skeleton ca-skeleton--stat" />
            ))}
          </div>
          <div className="ca-skeleton ca-skeleton--chart" />
        </div>
      ) : (
        <div className="ws-dashboard">
          <div className="ws-dashboard__main">
            <section className="ws-hero-grid" aria-label="Portfolio chart and KPIs">
              <div className="ws-hero-grid__chart ws-panel">
                <PanelTitle>Performance &amp; price</PanelTitle>
                <p className="ws-panel-lead">
                  Live series with desk indicators — brush and tooltips enabled in-panel.
                </p>
                <div className="ws-chart-host">
                  <ChartCard title="Cross-asset chart" />
                </div>
              </div>
              <div className="ws-hero-grid__kpis">
                <KPIGrid layout="stack" />
              </div>
            </section>

            <MarketOverviewCards
              rows={rows}
              symbols={["gold", "crudeOil", "silver", "naturalGas"]}
            />

            <section className="ws-analytics-row">
              <div className="ws-analytics-cell">
                <CommodityHeatmap rows={rows} />
              </div>
              <div className="ws-panel ws-analytics-cell">
                <PanelTitle>Allocation</PanelTitle>
                <p className="ws-panel-lead">Sleeve mix from portfolio service.</p>
                {allocation.length > 0 ? (
                  <PortfolioPieChart data={allocation} />
                ) : (
                  <p className="ws-empty-hint">
                    Connect holdings to visualize sleeve weights.
                  </p>
                )}
              </div>
            </section>

            <div className="ws-analytics-row ws-analytics-row--tight">
              <CorrelationMatrixPanel />
              <SeasonalityPanel analytics={commodityAnalytics} />
            </div>

            <div className="ws-analytics-row">
              <SupplyDemandPanel analytics={commodityAnalytics} />
              <RiskAnalyticsPanel />
            </div>

            <CommodityTable rows={rows} variant="watchlist" title="Watchlist" expandable />

            <div className="ws-analytics-row">
              <AlertDock />
              <MacroIndicatorsPanel />
            </div>
          </div>

          <aside className="ws-dashboard__rail" aria-label="Insights">
            <div className="ws-rail-sticky">
              <AIInsightsPanel rows={rows} />
              <ActivityFeed />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
