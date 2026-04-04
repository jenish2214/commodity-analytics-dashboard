"use client";

import { useMemo } from "react";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { MarketInsightsPanel } from "@/components/terminal/MarketInsightsPanel";
import { useMarketDataStore } from "@/store/marketDataStore";

export function AIInsightsView() {
  const market = useMarketDataStore((s) => s.market);
  const searchQuery = useMarketDataStore((s) => s.searchQuery);

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return market;
    return market.filter((r) => r.commodity.toLowerCase().includes(q));
  }, [market, searchQuery]);

  return (
    <div className="ca-page ca-page--wide">
      <h1 className="ca-page__title">AI insights</h1>
      <p className="ca-page__lead">
        Structured narratives from live price action — deterministic, explainable, and tied to
        the same commodity feed as the rest of the terminal.
      </p>
      <div className="terminal-pro">
        <AIInsightsPanel rows={rows} />
        <MarketInsightsPanel rows={rows} />
      </div>
    </div>
  );
}
