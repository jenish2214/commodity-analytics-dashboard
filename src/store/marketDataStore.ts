import { create } from "zustand";
import type {
  ChartPoint,
  CommodityKey,
  MarketRow,
  TimeRange,
} from "@/types/models";
import { dashboardSummary } from "@/lib/mock-data";

type Summary = typeof dashboardSummary;

type MarketState = {
  market: MarketRow[];
  summary: Summary;
  chartPoints: ChartPoint[];
  selectedSymbol: CommodityKey;
  timeRange: TimeRange;
  searchQuery: string;
  loading: boolean;
  fetchMarket: () => Promise<void>;
  fetchChart: () => Promise<void>;
  setSelectedSymbol: (symbol: CommodityKey) => void;
  setTimeRange: (range: TimeRange) => void;
  setSearchQuery: (q: string) => void;
  applyPriceTick: () => void;
};

export const useMarketDataStore = create<MarketState>((set, get) => ({
  market: [],
  summary: dashboardSummary,
  chartPoints: [],
  selectedSymbol: "gold",
  timeRange: "1M",
  searchQuery: "",
  loading: false,
  fetchMarket: async () => {
    set({ loading: true });
    try {
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
    } catch {
      set({ loading: false });
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
}));
