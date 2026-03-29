import { NextRequest, NextResponse } from "next/server";
import {
  buildChartSeries,
  dashboardSummary,
  marketRows,
} from "@/lib/mock-data";
import type { CommodityKey, TimeRange } from "@/types/models";

const KEYS = new Set<CommodityKey>([
  "gold",
  "silver",
  "crudeOil",
  "naturalGas",
  "copper",
]);

const RANGES = new Set<TimeRange>(["1D", "1W", "1M", "6M", "1Y"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chart = searchParams.get("chart");
  if (chart === "true") {
    const rawSymbol = searchParams.get("symbol") ?? "gold";
    const rawRange = searchParams.get("range") ?? "1M";
    const symbol = (KEYS.has(rawSymbol as CommodityKey)
      ? rawSymbol
      : "gold") as CommodityKey;
    const range = (RANGES.has(rawRange as TimeRange)
      ? rawRange
      : "1M") as TimeRange;
    const points = buildChartSeries(symbol, range);
    return NextResponse.json({ points });
  }

  return NextResponse.json({
    market: marketRows,
    summary: dashboardSummary,
  });
}
