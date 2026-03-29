"use client";

import { useEffect } from "react";
import { useAiInsightsStore } from "@/store/aiInsightsStore";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUserStore } from "@/store/userStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useUserStore((s) => s.hydrateFromStorage);
  const fetchMarket = useMarketDataStore((s) => s.fetchMarket);
  const fetchChart = useMarketDataStore((s) => s.fetchChart);
  const applyPriceTick = useMarketDataStore((s) => s.applyPriceTick);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const fetchInsights = useAiInsightsStore((s) => s.fetchInsights);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

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
    void fetchPortfolio();
    void fetchInsights();
  }, [fetchPortfolio, fetchInsights]);

  useEffect(() => {
    const id = window.setInterval(() => {
      applyPriceTick();
    }, 8000);
    return () => window.clearInterval(id);
  }, [applyPriceTick]);

  return <>{children}</>;
}
