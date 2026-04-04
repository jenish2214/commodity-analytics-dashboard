import { useMemo } from "react";
import type { ChartPoint, MarketRow } from "@/types/models";
import {
  dailyReturns,
  maxDrawdown,
  sharpeFromDailyReturns,
  valueAtRisk95,
} from "@/lib/calculations/riskMetrics";

type Args = {
  chartPoints: ChartPoint[];
  marketBenchmark: MarketRow[];
};

/**
 * Desk-style risk metrics from the same chart + quote feeds (no new APIs).
 */
export function useRiskMetrics({ chartPoints, marketBenchmark }: Args) {
  return useMemo(() => {
    const prices = chartPoints.map((p) => p.price).filter((n) => Number.isFinite(n));
    const ret = dailyReturns(prices);
    const sharpe = sharpeFromDailyReturns(ret);
    const mdd = maxDrawdown(prices);
    const var95 = valueAtRisk95(ret);
    const volAnn =
      ret.length >= 5
        ? Math.sqrt((ret.reduce((s, x) => s + x * x, 0) / ret.length) * 252)
        : 0;

    const ris = marketBenchmark
      .map((r) => r.riskIndex)
      .filter((x): x is number => x != null && Number.isFinite(x));
    const avgRisk = ris.length ? ris.reduce((a, b) => a + b, 0) / ris.length : 50;
    const beta = 0.55 + (avgRisk / 100) * 0.85;

    return {
      sharpe,
      maxDrawdown: mdd,
      var95,
      volatilityAnn: volAnn,
      beta: Number.isFinite(beta) ? beta : 1,
    };
  }, [chartPoints, marketBenchmark]);
}
