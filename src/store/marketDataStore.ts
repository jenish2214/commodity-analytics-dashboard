import { create } from "zustand";
import type {
  ChartPoint,
  CommodityKey,
  MarketRow,
  TimeRange,
} from "@/types/models";

type Summary = {
  portfolioValue: number;
  dailyPnl: number;
  topCommodity: string;
  aiSentiment: "Bullish" | "Bearish" | "Neutral";
};

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
    summary: { portfolioValue: 0, dailyPnl: 0, topCommodity: "Gold", aiSentiment: "Bullish" },
    chartPoints: [],
    selectedSymbol: "gold",
    timeRange: "1M",
    searchQuery: "",
    loading: false,
    lastLiveUpdate: 0,

    fetchMarket: async () => {
      set({ loading: true });
      try {
        // Fetch real market data from our API
        const res = await fetch("/api/commodities", { cache: "no-store" });
        
        if (!res.ok) {
          throw new Error("Failed to fetch market data");
        }
        
        const data = await res.json();
        set({
          market: data.market || [],
          summary: data.summary || { portfolioValue: 0, dailyPnl: 0, topCommodity: "Gold", aiSentiment: "Bullish" },
          loading: false,
          lastLiveUpdate: Date.now(),
        });
      } catch {
        // If API fails, return empty state with error
        set({
          market: [],
          summary: { portfolioValue: 0, dailyPnl: 0, topCommodity: "Gold", aiSentiment: "Bullish" },
          loading: false,
        });
      }
    },

    fetchLivePrices: async () => {
      try {
        // Fetch real market data from our API
        const res = await fetch("/api/commodities", { cache: "no-store" });
        
        if (!res.ok) {
          throw new Error("Failed to fetch live prices");
        }
        
        const data = await res.json();
        
        set({
          market: data.market || [],
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
        symbol: selectedSymbol,
        range: timeRange.toLowerCase(),
      });
      
      try {
        const res = await fetch(`/api/commodities/chart?${params.toString()}`, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch chart data: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.points || data.points.length === 0) {
          console.warn('No chart points returned for', selectedSymbol, timeRange);
          set({ chartPoints: [] });
          return;
        }
        
        set({ chartPoints: data.points });
        console.log('Chart data loaded:', data.points.length, 'points for', selectedSymbol);
        
      } catch (error) {
        console.error('Failed to fetch chart:', error);
        set({ chartPoints: [] });
      }
    },

    setSelectedSymbol: (symbol) => {
      set({ selectedSymbol: symbol });
      void get().fetchChart();
    },

    setTimeRange: (range) => {
      set({ timeRange: range });
      void get().fetchChart();
    },

    setSearchQuery: (q) => {
      const normalizedQuery = q.trim();
      set({ searchQuery: normalizedQuery });
    },

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
