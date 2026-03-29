import { create } from "zustand";
import type { AiPrediction, AiTradingSignal } from "@/types/models";

type Highlights = {
  commodityInsight: string;
  oilInsight: string;
};

type AiState = {
  sentimentAnalysis: string;
  predictions: AiPrediction[];
  tradingSignals: AiTradingSignal[];
  highlights: Highlights;
  loading: boolean;
  fetchInsights: () => Promise<void>;
};

export const useAiInsightsStore = create<AiState>((set) => ({
  sentimentAnalysis: "",
  predictions: [],
  tradingSignals: [],
  highlights: {
    commodityInsight: "",
    oilInsight: "",
  },
  loading: false,
  fetchInsights: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/ai-insights", { cache: "no-store" });
      const data = (await res.json()) as {
        sentimentAnalysis: string;
        predictions: AiPrediction[];
        tradingSignals: AiTradingSignal[];
        highlights: Highlights;
      };
      set({
        sentimentAnalysis: data.sentimentAnalysis,
        predictions: data.predictions,
        tradingSignals: data.tradingSignals,
        highlights: data.highlights,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
