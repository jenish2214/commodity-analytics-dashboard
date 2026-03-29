import { create } from "zustand";
import type {
  ChartPoint,
  CommodityKey,
  MarketRow,
  TimeRange,
} from "@/types/models";
import { dashboardSummary } from "@/lib/mock-data";
import { metalsDevService } from "@/lib/metalsDevApi";

type Summary = typeof dashboardSummary;

type MarketState = {
  market: MarketRow[];
  summary: Summary;
  chartPoints: ChartPoint[];
  selectedSymbol: CommodityKey;
  timeRange: TimeRange;
  searchQuery: string;
  loading: boolean;
  lastLiveUpdate: number;
  fetchMarket: () => Promise<void>;
  fetchChart: () => Promise<void>;
  fetchLivePrices: () => Promise<void>;
  setSelectedSymbol: (symbol: CommodityKey) => void;
  setTimeRange: (range: TimeRange) => void;
  setSearchQuery: (q: string) => void;
  applyPriceTick: () => void;
  startLiveUpdates: () => void;
  stopLiveUpdates: () => void;
};

export const useMarketDataStore = create<MarketState>((set, get) => {
  let liveUpdateInterval: NodeJS.Timeout | null = null;

  return {
    market: [],
    summary: dashboardSummary,
    chartPoints: [],
    selectedSymbol: "gold",
    timeRange: "1M",
    searchQuery: "",
    loading: false,
    lastLiveUpdate: 0,
  fetchMarket: async () => {
      set({ loading: true });
      try {
        // Try to fetch live prices first
        try {
          const liveData = await metalsDevService.fetchLatestRates();
          const commodityData = metalsDevService.mapToCommodityData(liveData);
          
          // Convert to MarketRow format
          const marketRows: MarketRow[] = Object.entries(commodityData).map(([symbol, data]) => ({
            id: `m${symbol}`,
            commodity: symbol.charAt(0).toUpperCase() + symbol.slice(1),
            symbol: symbol as CommodityKey,
            price: data.price,
            change24h: data.change24h,
            volume: data.volume,
            marketCap: data.marketCap,
            signal: data.signal,
          }));

          set({
            market: marketRows,
            summary: {
              ...dashboardSummary,
              portfolioValue: marketRows.reduce((sum, row) => sum + row.price * 100, 0),
            },
            lastLiveUpdate: Date.now(),
            loading: false,
          });
        } catch (liveError) {
          // Fallback to mock data if live API fails
          console.warn('Live API failed, using mock data:', liveError);
          const res = await fetch("/api/commodities", { cache: "no-store" });
          const data = (await res.json()) as {
            market: MarketRow[];
            summary: Summary;
          };
          set({
            market: data.market,
            summary: data.summary,
            loading: false,
          });
        }
      } catch {
        set({ loading: false });
      }
    },

    fetchLivePrices: async () => {
      try {
        const liveData = await metalsDevService.fetchLatestRates();
        const commodityData = metalsDevService.mapToCommodityData(liveData);
        
        // Calculate price changes
        const currentMarket = get().market;
        const updatedMarket = currentMarket.map(row => {
          const commodity = commodityData[row.symbol as keyof typeof commodityData];
          if (commodity) {
            const previousPrice = row.price;
            const priceChange = commodity.price - previousPrice;
            const changePercent = (priceChange / previousPrice) * 100;
            
            return {
              ...row,
              price: commodity.price,
              change24h: Math.round(changePercent * 100) / 100,
            };
          }
          return row;
        });

        set({
          market: updatedMarket,
          lastLiveUpdate: Date.now(),
        });
      } catch (error) {
        console.error('Failed to fetch live prices:', error);
      }
    },

    startLiveUpdates: () => {
      // Clear existing interval
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
      }

      // Fetch immediately
      void get().fetchLivePrices();

      // Set up interval for live updates (every 30 seconds)
      liveUpdateInterval = setInterval(() => {
        void get().fetchLivePrices();
      }, 30000);
    },

    stopLiveUpdates: () => {
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        liveUpdateInterval = null;
      }
    },

    fetchChart: async () => {
      const { selectedSymbol, timeRange } = get();
      const params = new URLSearchParams({
        chart: "true",
        symbol: selectedSymbol,
        range: timeRange,
      });
      const res = await fetch(`/api/commodities?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as { points: ChartPoint[] };
      set({ chartPoints: data.points });
    },
    setSelectedSymbol: (symbol) => {
      set({ selectedSymbol: symbol });
      void get().fetchChart();
    },
    setTimeRange: (range) => {
      set({ timeRange: range });
      void get().fetchChart();
    },
    setSearchQuery: (q) => set({ searchQuery: q }),
    applyPriceTick: () =>
      set((state) => ({
        market: state.market.map((row) => {
          const delta = (Math.random() - 0.5) * row.price * 0.0008;
          const price = Math.max(0.01, row.price + delta);
          const change =
            row.change24h + (Math.random() - 0.5) * 0.05;
          return {
            ...row,
            price: Math.round(price * 100) / 100,
            change24h: Math.round(change * 100) / 100,
          };
        }),
      })),
  };
});
