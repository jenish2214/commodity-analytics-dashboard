import { NextResponse } from "next/server";

const COMMODITIES = [
  { id: "gold", name: "Gold", ticker: "GC=F", unit: "oz" },
  { id: "silver", name: "Silver", ticker: "SI=F", unit: "oz" },
  { id: "crudeOil", name: "WTI Crude", ticker: "CL=F", unit: "bbl" },
  { id: "naturalGas", name: "Natural Gas", ticker: "NG=F", unit: "MMBtu" },
  { id: "copper", name: "Copper", ticker: "HG=F", unit: "lb" },
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      COMMODITIES.map(async (commodity) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${commodity.ticker}?interval=1d&range=5d`;
        
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 300 }, // cache 5 minutes
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
        const closes = result.indicators.quote[0].close;
        
        const prev = closes[closes.length - 2] ?? meta.chartPreviousClose;
        const current = meta.regularMarketPrice;
        const change = current - prev;
        const changePct = (change / prev) * 100;

        return {
          id: commodity.id,
          commodity: commodity.name,
          symbol: commodity.id as any,
          price: parseFloat(current.toFixed(2)),
          change24h: parseFloat(changePct.toFixed(2)),
          volume: formatVolume(meta.regularMarketVolume || 0),
          marketCap: formatMarketCap(commodity.name, current),
          signal: getSignal(changePct),
        };
      })
    );

    const data = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const summary = {
      portfolioValue: data.reduce((sum, item) => sum + item.price * 100, 0),
      dailyPnl: data.reduce((sum, item) => sum + item.change24h * 100, 0),
      topCommodity: data.reduce((top, item) => 
        item.change24h > (top?.change24h || -Infinity) ? item : top
      )?.commodity || "Gold",
      aiSentiment: "Bullish" as const,
    };

    return NextResponse.json({
      market: data,
      summary,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Failed to fetch commodity prices:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch live data", 
        market: [], 
        summary: { portfolioValue: 0, dailyPnl: 0, topCommodity: "Gold", aiSentiment: "Bullish" as const },
        fetchedAt: new Date().toISOString()
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
  // Rough market cap estimates based on commodity type and price
  const multiplier = {
    "Gold": 14_000_000_000_000, // ~$14T
    "Silver": 1_600_000_000_000,  // ~$1.6T
    "WTI Crude": 3_800_000_000_000, // ~$3.8T
    "Natural Gas": 610_000_000_000,  // ~$610B
    "Copper": 320_000_000_000,     // ~$320B
  };
  
  const cap = (multiplier[commodity as keyof typeof multiplier] || 1_000_000_000) * (price / 100);
  return formatVolume(cap);
}

function getSignal(changePct: number): "BUY" | "SELL" | "HOLD" {
  if (changePct > 1) return "BUY";
  if (changePct < -1) return "SELL";
  return "HOLD";
}
