import { useMarketDataStore } from "@/store/marketDataStore";

/** Convenience selectors — business logic remains in the store. */
export function useMarketData() {
  const market = useMarketDataStore((s) => s.market);
  const summary = useMarketDataStore((s) => s.summary);
  const commodityAnalytics = useMarketDataStore((s) => s.commodityAnalytics);
  const loading = useMarketDataStore((s) => s.loading);
  const chartPoints = useMarketDataStore((s) => s.chartPoints);
  const fxRates = useMarketDataStore((s) => s.fxRates);
  const searchQuery = useMarketDataStore((s) => s.searchQuery);
  const setSearchQuery = useMarketDataStore((s) => s.setSearchQuery);

  return {
    market,
    summary,
    commodityAnalytics,
    loading,
    chartPoints,
    fxRates,
    searchQuery,
    setSearchQuery,
  };
}
