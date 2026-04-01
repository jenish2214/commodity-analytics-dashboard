import { NextRequest, NextResponse } from "next/server";
import { yahooIntervalForRange } from "@/lib/chartRange";
import { tickerMapByCommodityId } from "@/services/commodities/definitions";

export const dynamic = "force-dynamic";

const TICKER_MAP = tickerMapByCommodityId();

/** Client sends Yahoo-style range tokens (1d, 5d, 1mo, …). */
const RANGE_ALIASES: Record<string, string> = {
  "1w": "5d",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") ?? "gold";
    let range = searchParams.get("range") ?? "1mo";
    range = RANGE_ALIASES[range] ?? range;

    const ticker = TICKER_MAP[symbol] ?? "GC=F";
    const interval = yahooIntervalForRange(range);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch chart data for ${symbol}`);
    }

    const json = await res.json();

    if (!json.chart?.result?.[0]) {
      throw new Error(`No chart data for ${symbol}`);
    }

    const result = json.chart.result[0];
    const timestamps = result.timestamp as number[];
    const quote = result.indicators.quote[0];
    const closes = quote.close as (number | null)[];
    const volumes = (quote.volume ?? []) as (number | null)[];

    const points = timestamps
      .map((t: number, i: number) => {
        const c = closes[i];
        if (c == null || Number.isNaN(c)) return null;
        const v = volumes[i];
        return {
          period: formatPeriod(t, range),
          price: parseFloat(c.toFixed(4)),
          volume: v != null && Number.isFinite(v) ? v : null,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p != null);

    return NextResponse.json({
      points,
      symbol,
      range,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chart request failed",
        points: [],
        symbol: searchParamsGet(request, "symbol") ?? "gold",
        range: searchParamsGet(request, "range") ?? "1mo",
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

function searchParamsGet(request: NextRequest, key: string): string | null {
  try {
    return new URL(request.url).searchParams.get(key);
  } catch {
    return null;
  }
}

function formatPeriod(timestamp: number, range: string): string {
  const date = new Date(timestamp * 1000);

  switch (range) {
    case "1d":
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    case "5d":
      return date.toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    case "1mo":
    case "3mo":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "6mo":
    case "1y":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "2y":
    case "5y":
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    default:
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}
