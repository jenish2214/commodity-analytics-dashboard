"use client";

import { useMemo } from "react";
import { RiskAnalyticsPanel } from "@/components/dashboard/RiskAnalyticsPanel";
import { VolatilityStrip } from "@/components/terminal/VolatilityStrip";
import { OpportunityScannerPanel } from "@/components/terminal/OpportunityScannerPanel";
import { CorrelationMatrixPanel } from "@/components/terminal/CorrelationMatrixPanel";
import { AlertDock } from "@/components/terminal/AlertDock";
import { useMarketDataStore } from "@/store/marketDataStore";

export function RiskView() {
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
      <h1 className="ca-page__title">Risk analysis</h1>
      <p className="ca-page__lead">
        Volatility, opportunity scores, correlations, and desk alerts — risk-first layout for
        monitoring commodity books.
      </p>
      <div className="terminal-pro">
        <RiskAnalyticsPanel />
        <VolatilityStrip rows={rows} />
        <OpportunityScannerPanel rows={rows} analytics={analytics} />
        <div className="terminal-pro__grid2">
          <CorrelationMatrixPanel />
          <AlertDock />
        </div>
      </div>
    </div>
  );
}
