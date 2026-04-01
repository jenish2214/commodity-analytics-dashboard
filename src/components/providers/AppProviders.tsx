"use client";

import { useEffect } from "react";
import { useAlertStore } from "@/store/alertStore";
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
  const market = useMarketDataStore((s) => s.market);
  const evaluateMarket = useAlertStore((s) => s.evaluateMarket);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await fetchMarket();
        if (!cancelled) await fetchChart();
      } catch (e) {
        console.error("AppProviders bootstrap:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMarket, fetchChart]);

  useEffect(() => {
    try {
      startLiveUpdates(refreshRate);
    } catch (e) {
      console.error("Live updates:", e);
    }
    return () => stopLiveUpdates();
  }, [refreshRate, startLiveUpdates, stopLiveUpdates]);

  useEffect(() => {
    try {
      void fetchPortfolio();
    } catch (e) {
      console.error("Portfolio fetch:", e);
    }
  }, [fetchPortfolio]);

  useEffect(() => {
    try {
      if (market.length > 0) evaluateMarket(market);
    } catch (e) {
      console.error("Alert evaluation:", e);
    }
  }, [market, evaluateMarket]);

  return (
    <>
      {children}
    </>
  );
}
