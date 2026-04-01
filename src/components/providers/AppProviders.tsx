"use client";

import { useEffect } from "react";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUserStore } from "@/store/userStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const fetchMarket = useMarketDataStore((s) => s.fetchMarket);
  const fetchChart = useMarketDataStore((s) => s.fetchChart);
  const startLiveUpdates = useMarketDataStore((s) => s.startLiveUpdates);
  const stopLiveUpdates = useMarketDataStore((s) => s.stopLiveUpdates);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const refreshRate = useUserStore((s) => s.refreshRate);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await fetchMarket();
      if (!cancelled) await fetchChart();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMarket, fetchChart]);

  useEffect(() => {
    startLiveUpdates(refreshRate);
    return () => stopLiveUpdates();
  }, [refreshRate, startLiveUpdates, stopLiveUpdates]);

  useEffect(() => {
    void fetchPortfolio();
  }, [fetchPortfolio]);

  return (
    <>
      {children}
    </>
  );
}
