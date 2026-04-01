import { create } from "zustand";
import { timeRangeToYahooRange } from "@/lib/chartRange";
import type {
  ChartPoint,
  CommodityKey,
  CurrencyCode,
  MarketRow,
  TimeRange,
} from "@/types/models";

type Summary = {
  portfolioValue: number;
  dailyPnl: number;
  topCommodity: string;
  marketSentiment: "Bullish" | "Bearish" | "Neutral";
};

const DEFAULT_SUMMARY: Summary = {
  portfolioValue: 0,
  dailyPnl: 0,
  topCommodity: "Gold",
  marketSentiment: "Bullish",
};

function normalizeSummary(raw: unknown): Summary {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SUMMARY };
  const o = raw as Record<string, unknown>;
  const sRaw = o.marketSentiment ?? o.aiSentiment;
  const sentiment: Summary["marketSentiment"] =
    sRaw === "Bullish" || sRaw === "Bearish" || sRaw === "Neutral"
      ? sRaw
      : DEFAULT_SUMMARY.marketSentiment;
  return {
    portfolioValue:
      typeof o.portfolioValue === "number"
        ? o.portfolioValue
        : DEFAULT_SUMMARY.portfolioValue,
    dailyPnl: typeof o.dailyPnl === "number" ? o.dailyPnl : DEFAULT_SUMMARY.dailyPnl,
    topCommodity:
      typeof o.topCommodity === "string" ? o.topCommodity : DEFAULT_SUMMARY.topCommodity,
    marketSentiment: sentiment,
  };
}

type MarketState = {
  market: MarketRow[];
  summary: Summary;
  chartPoints: ChartPoint[];
  selectedSymbol: CommodityKey;
  timeRange: TimeRange;
  searchQuery: string;
  loading: boolean;
  lastLiveUpdate: number;
  fxRates: Partial<Record<CurrencyCode, number>> | null;
  fxAsOf: string | null;
  fxError: string | null;
  commoditiesFetchedAt: string | null;
  chartError: string | null;
  chartFetchedAt: string | null;
  fetchMarket: () => Promise<void>;
  fetchChart: () => Promise<void>;
  fetchLivePrices: () => Promise<void>;
  setSelectedSymbol: (symbol: CommodityKey) => void;
  setTimeRange: (range: TimeRange) => void;
  setChartContext: (symbol: CommodityKey, range: TimeRange) => void;
  setSearchQuery: (q: string) => void;
  startLiveUpdates: (intervalSeconds?: number) => void;
  stopLiveUpdates: () => void;
};

export const useMarketDataStore = create<MarketState>((set, get) => {
  let liveUpdateInterval: NodeJS.Timeout | null = null;

  const applyCommodityPayload = (data: Record<string, unknown>) => {
    const market = (data.market as MarketRow[]) || [];
    set({
      market,
      summary: normalizeSummary(data.summary),
      fxRates: (data.fx as Partial<Record<CurrencyCode, number>>) ?? null,
      fxAsOf: typeof data.fxAsOf === "string" ? data.fxAsOf : null,
      fxError: typeof data.fxError === "string" ? data.fxError : null,
      commoditiesFetchedAt:
        typeof data.fetchedAt === "string" ? data.fetchedAt : null,
    });
  };

  return {
    market: [],
    summary: { ...DEFAULT_SUMMARY },
    chartPoints: [],
    selectedSymbol: "gold",
    timeRange: "1M",
    searchQuery: "",
    loading: false,
    lastLiveUpdate: 0,
    fxRates: null,
    fxAsOf: null,
    fxError: null,
    commoditiesFetchedAt: null,
    chartError: null,
    chartFetchedAt: null,

    fetchMarket: async () => {
      set({ loading: true });
      try {
        const res = await fetch("/api/commodities", { cache: "no-store" });

        if (!res.ok) {
          throw new Error("Failed to fetch market data");
        }

        const data = (await res.json()) as Record<string, unknown>;
        applyCommodityPayload(data);
        set({
          loading: false,
          lastLiveUpdate: Date.now(),
        });
      } catch (e) {
        console.error(e);
        set({
          market: [],
          summary: { ...DEFAULT_SUMMARY },
          loading: false,
          fxRates: null,
          fxAsOf: null,
          fxError: "Could not load FX or quotes.",
          commoditiesFetchedAt: null,
        });
      }
    },

    fetchLivePrices: async () => {
      try {
        const res = await fetch("/api/commodities", { cache: "no-store" });

        if (!res.ok) {
          throw new Error("Failed to fetch live prices");
        }

        const data = (await res.json()) as Record<string, unknown>;
        applyCommodityPayload(data);
        set({
          lastLiveUpdate: Date.now(),
        });
      } catch (error) {
        console.error("Failed to fetch live prices:", error);
      }
    },

    startLiveUpdates: (intervalSeconds = 30) => {
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
      }

      const ms = Math.max(5000, Math.floor(intervalSeconds * 1000));

      void get().fetchLivePrices();

      liveUpdateInterval = setInterval(() => {
        void get().fetchLivePrices();
      }, ms);
    },

    stopLiveUpdates: () => {
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        liveUpdateInterval = null;
      }
    },

    fetchChart: async () => {
      const { selectedSymbol, timeRange } = get();
      const yahoo = timeRangeToYahooRange(timeRange);
      const params = new URLSearchParams({
        symbol: selectedSymbol,
        range: yahoo,
      });

      try {
        const res = await fetch(`/api/commodities/chart?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch chart data: ${res.status}`);
        }

        const data = (await res.json()) as {
          points?: ChartPoint[];
          error?: string;
          fetchedAt?: string;
        };

        if (data.error && (!data.points || data.points.length === 0)) {
          set({
            chartPoints: [],
            chartError: data.error,
            chartFetchedAt: data.fetchedAt ?? null,
          });
          return;
        }

        if (!data.points || data.points.length === 0) {
          set({
            chartPoints: [],
            chartError: "No chart points returned",
            chartFetchedAt: data.fetchedAt ?? null,
          });
          return;
        }

        set({
          chartPoints: data.points,
          chartError: null,
          chartFetchedAt: data.fetchedAt ?? null,
        });
      } catch (error) {
        console.error("Failed to fetch chart:", error);
        set({
          chartPoints: [],
          chartError: error instanceof Error ? error.message : "Chart failed",
          chartFetchedAt: null,
        });
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

    setChartContext: (symbol, range) => {
      set({ selectedSymbol: symbol, timeRange: range });
      void get().fetchChart();
    },

    setSearchQuery: (q: string) => {
      const normalizedQuery = q.trim();
      set({ searchQuery: normalizedQuery });
    },
  };
});
