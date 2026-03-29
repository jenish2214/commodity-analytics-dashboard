"use client";

import { useEffect } from "react";
import { useAiInsightsStore } from "@/store/aiInsightsStore";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const fetchMarket = useMarketDataStore((s) => s.fetchMarket);
  const fetchChart = useMarketDataStore((s) => s.fetchChart);
  const applyPriceTick = useMarketDataStore((s) => s.applyPriceTick);
  const startLiveUpdates = useMarketDataStore((s) => s.startLiveUpdates);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const fetchInsights = useAiInsightsStore((s) => s.fetchInsights);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await fetchMarket();
      if (!cancelled) await fetchChart();
      // Start live price updates
      if (!cancelled) startLiveUpdates();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMarket, fetchChart, startLiveUpdates]);

  useEffect(() => {
    void fetchPortfolio();
    void fetchInsights();
  }, [fetchPortfolio, fetchInsights]);

  useEffect(() => {
    const id = window.setInterval(() => {
      applyPriceTick();
    }, 8000);
    return () => window.clearInterval(id);
  }, [applyPriceTick]);

  return (
    <>
      {children}
    </>
  );
}
