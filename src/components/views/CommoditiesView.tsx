"use client";

import { useMemo } from "react";
import { ChartCard } from "@/components/ChartCard";
import { CommodityTable } from "@/components/CommodityTable";
import { IndianCommodityPanel } from "@/components/IndianCommodityPanel";
import { useMarketDataStore } from "@/store/marketDataStore";

export function CommoditiesView() {
  const market = useMarketDataStore((s) => s.market);
  const searchQuery = useMarketDataStore((s) => s.searchQuery);

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return market;
    return market.filter((r) => r.commodity.toLowerCase().includes(q));
  }, [market, searchQuery]);

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Commodities</h1>
      <p className="ca-page__lead">
        Track pricing, liquidity, and directional signals across major contracts.
      </p>
      <div style={{ display: "grid", gap: "1rem" }}>
        <IndianCommodityPanel />
        <ChartCard title="Commodity Price Chart" />
        <CommodityTable rows={rows} />
      </div>
    </div>
  );
}
