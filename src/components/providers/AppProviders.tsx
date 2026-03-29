"use client";

import { useEffect } from "react";
import { useAiInsightsStore } from "@/store/aiInsightsStore";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const fetchMarket = useMarketDataStore((s) => s.fetchMarket);
  const fetchChart = useMarketDataStore((s) => s.fetchChart);
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

  // Auto-refresh commodity prices every 5 minutes
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Use the existing fetchMarket method to refresh data
        await fetchMarket();
      } catch (error) {
        console.error("Failed to refresh prices:", error);
      }
    };

    // Don't fetch immediately since fetchMarket is already called on mount
    const interval = setInterval(fetchPrices, 5 * 60 * 1000); // 5 min
    return () => clearInterval(interval);
  }, [fetchMarket]);

  return (
    <>
      {children}
    </>
  );
}
