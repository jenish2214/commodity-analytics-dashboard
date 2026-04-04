"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { CommodityHeatmap } from "@/components/terminal/CommodityHeatmap";
import { CorrelationMatrixPanel } from "@/components/terminal/CorrelationMatrixPanel";
import { SeasonalityPanel } from "@/components/dashboard/SeasonalityPanel";
import { SupplyDemandPanel } from "@/components/dashboard/SupplyDemandPanel";
import { MacroIndicatorsPanel } from "@/components/dashboard/MacroIndicatorsPanel";
import { useMarketDataStore } from "@/store/marketDataStore";

const ChartCard = dynamic(
  () => import("@/components/ChartCard").then((m) => m.ChartCard),
  { ssr: false, loading: () => <div className="ca-card ca-skeleton" style={{ height: 360 }} /> }
);

export function AnalyticsView() {
  const market = useMarketDataStore((s) => s.market);
  const analytics = useMarketDataStore((s) => s.commodityAnalytics);
  const searchQuery = useMarketDataStore((s) => s.searchQuery);

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return market;
    return market.filter((r) => r.commodity.toLowerCase().includes(q));
  }, [market, searchQuery]);

  return (
    <div className="ca-page ca-page--wide">
      <h1 className="ca-page__title">Analytics</h1>
      <p className="ca-page__lead">
        Seasonality, correlations, heatmaps, and macro context — same data bundle as the home
        terminal.
      </p>
      <div className="terminal-pro">
        <CommodityHeatmap rows={rows} />
        <div className="terminal-pro__grid2">
          <CorrelationMatrixPanel />
          <SeasonalityPanel analytics={analytics} />
        </div>
        <ChartCard title="Cross-section chart workspace" />
        <SupplyDemandPanel analytics={analytics} />
        <MacroIndicatorsPanel />
      </div>
    </div>
  );
}
