"use client";

import { useMemo } from "react";
import { CommodityTable } from "@/components/CommodityTable";
import { StatCard } from "@/components/StatCard";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUserStore } from "@/store/userStore";
import {
  formatCurrencyAmount,
  formatSignedCurrency,
} from "@/utils/format";

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
      <h1 className="ca-page__title">Commodity Market Overview</h1>
      <p className="ca-page__lead">
        Benchmarks, flows, and AI-assisted market sentiment.
      </p>
      {loading && market.length === 0 ? (
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div className="ca-stat-grid" style={{ marginBottom: "1.25rem" }}>
             {[1, 2, 3, 4].map(i => (
               <div key={i} style={{ height: '104px', borderRadius: '12px', background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
             ))}
          </div>
          <div style={{ height: '400px', borderRadius: '12px', background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
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
          <div style={{ display: "grid", gap: "1rem" }}>
            <CommodityTable rows={rows} />
          </div>
        </>
      )}
    </div>
  );
}
