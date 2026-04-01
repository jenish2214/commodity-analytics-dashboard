import { NextResponse } from "next/server";
import { fetchUsdFxRates } from "@/lib/fx";
import type { CurrencyCode } from "@/types/models";

const COMMODITIES = [
  { id: "gold", name: "Gold", ticker: "GC=F", unit: "troy oz" },
  { id: "silver", name: "Silver", ticker: "SI=F", unit: "troy oz" },
  { id: "crudeOil", name: "WTI Crude", ticker: "CL=F", unit: "bbl" },
  { id: "naturalGas", name: "Natural Gas", ticker: "NG=F", unit: "MMBtu" },
  { id: "copper", name: "Copper", ticker: "HG=F", unit: "lb" },
] as const;

export async function GET() {
  try {
    const [fxResult, ...quoteResults] = await Promise.all([
      fetchUsdFxRates(),
      ...COMMODITIES.map(async (commodity) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${commodity.ticker}?interval=1d&range=5d`;
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            next: { revalidate: 60 },
          });

          if (!res.ok) {
            throw new Error(`Failed to fetch ${commodity.name}`);
          }

          const json = await res.json();

          if (!json.chart?.result?.[0]) {
            throw new Error(`No data for ${commodity.name}`);
          }

          const result = json.chart.result[0];
          const meta = result.meta;
          const closes = result.indicators.quote[0].close as (number | null)[];

          const prev = closes[closes.length - 2] ?? meta.chartPreviousClose;
          const current = meta.regularMarketPrice as number;
          const change = current - prev;
          const changePct = prev ? (change / prev) * 100 : 0;

          const priceUsd = parseFloat(Number(current).toFixed(4));

          return {
            id: commodity.id,
            commodity: commodity.name,
            symbol: commodity.id,
            priceUsd,
            price: priceUsd,
            unit: commodity.unit,
            change24h: parseFloat(changePct.toFixed(2)),
            volume: formatVolume(meta.regularMarketVolume || 0),
            marketCap: formatMarketCap(commodity.name, priceUsd),
            signal: getSignal(changePct),
          };
        } catch (e) {
          console.error(`Commodity row ${commodity.id}:`, e);
          return null;
        }
      }),
    ]);

    const fxUsd: Partial<Record<CurrencyCode, number>> | null = fxResult
      ? fxResult.rates
      : null;

    const data = quoteResults.filter((r) => r != null);

    const summary = {
      portfolioValue: data.reduce((sum, item) => sum + item.priceUsd * 100, 0),
      dailyPnl: data.reduce((sum, item) => sum + item.change24h * 100, 0),
      topCommodity:
        data.reduce(
          (top, item) => (item.change24h > (top?.change24h ?? -Infinity) ? item : top),
          data[0] ?? null
        )?.commodity ?? "Gold",
      marketSentiment: "Bullish" as const,
    };

    return NextResponse.json({
      market: data,
      summary,
      fetchedAt: new Date().toISOString(),
      fx: fxUsd,
      fxAsOf: fxResult?.asOf ?? null,
      fxError: fxResult ? null : "FX rates unavailable; prices shown in USD until refreshed.",
    });
  } catch (error) {
    console.error("Failed to fetch commodity prices:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch live data",
        market: [],
        summary: {
          portfolioValue: 0,
          dailyPnl: 0,
          topCommodity: "Gold",
          marketSentiment: "Bullish" as const,
        },
        fetchedAt: new Date().toISOString(),
        fx: null,
        fxAsOf: null,
        fxError: "FX unavailable",
      },
      { status: 200 }
    );
  }
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(1)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return volume.toString();
}

function formatMarketCap(commodity: string, price: number): string {
  const multiplier = {
    Gold: 14_000_000_000_000,
    Silver: 1_600_000_000_000,
    "WTI Crude": 3_800_000_000_000,
    "Natural Gas": 610_000_000_000,
    Copper: 320_000_000_000,
  };

  const cap =
    (multiplier[commodity as keyof typeof multiplier] || 1_000_000_000) *
    (price / 100);
  return formatVolume(cap);
}

function getSignal(changePct: number): "BUY" | "SELL" | "HOLD" {
  if (changePct > 1) return "BUY";
  if (changePct < -1) return "SELL";
  return "HOLD";
}
