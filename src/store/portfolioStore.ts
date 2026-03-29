import { create } from "zustand";
import type { AllocationSlice, PortfolioHolding } from "@/types/models";

type Totals = { value: number; pnl: number };

type PortfolioState = {
  holdings: PortfolioHolding[];
  allocation: AllocationSlice[];
  totals: Totals;
  loading: boolean;
  fetchPortfolio: () => Promise<void>;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: [],
  allocation: [],
  totals: { value: 0, pnl: 0 },
  loading: false,
  fetchPortfolio: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const data = (await res.json()) as {
        holdings: PortfolioHolding[];
        allocation: AllocationSlice[];
        totals: Totals;
      };
      set({
        holdings: data.holdings,
        allocation: data.allocation,
        totals: data.totals,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
