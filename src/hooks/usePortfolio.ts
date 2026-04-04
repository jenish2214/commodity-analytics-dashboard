import { usePortfolioStore } from "@/store/portfolioStore";

export function usePortfolio() {
  const items = usePortfolioStore((s) => s.items);
  const allocation = usePortfolioStore((s) => s.allocation);
  const totals = usePortfolioStore((s) => s.totals);
  const loading = usePortfolioStore((s) => s.loading);

  return { items, allocation, totals, loading };
}
