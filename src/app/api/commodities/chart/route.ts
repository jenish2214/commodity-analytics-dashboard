import { NextRequest, NextResponse } from "next/server";

const TICKER_MAP: Record<string, string> = {
  gold: "GC=F",
  silver: "SI=F", 
  crudeOil: "CL=F",
  naturalGas: "NG=F",
  copper: "HG=F",
};

const INTERVAL_MAP: Record<string, string> = {
  "1d": "5m",
  "5d": "15m", 
  "1mo": "1d",
  "3mo": "1d",
  "6mo": "1wk",
  "1y": "1wk",
  "2y": "1mo",
  "5y": "1mo",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") ?? "gold";
    const range = searchParams.get("range") ?? "1mo";

    const ticker = TICKER_MAP[symbol] ?? "GC=F";
    const interval = INTERVAL_MAP[range] ?? "1d";

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 }, // 1 hour cache
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch chart data for ${symbol}`);
    }

    const json = await res.json();

    if (!json.chart?.result?.[0]) {
      throw new Error(`No chart data for ${symbol}`);
    }

    const result = json.chart.result[0];
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    const points = timestamps.map((t: number, i: number) => ({
      period: formatPeriod(t, range),
      price: closes[i] ? parseFloat(closes[i].toFixed(2)) : null,
    })).filter((p: any) => p.price !== null);

    return NextResponse.json({
      points,
      symbol,
      range,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    
    // Return fallback data if API fails
    const fallbackPoints = generateFallbackData();
    
    return NextResponse.json(
      { 
        error: "Failed to fetch chart data, using fallback", 
        points: fallbackPoints,
        symbol: "gold",
        range: "1mo",
        fetchedAt: new Date().toISOString()
      },
      { status: 200 }
    );
  }
}

function generateFallbackData() {
  const now = new Date();
  const points = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const basePrice = 2300;
    const variation = Math.sin(i / 5) * 50 + Math.random() * 20 - 10;
    
    points.push({
      period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat((basePrice + variation).toFixed(2))
    });
  }
  
  return points;
}

function formatPeriod(timestamp: number, range: string): string {
  const date = new Date(timestamp * 1000);
  
  switch (range) {
    case "1d":
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case "5d":
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    case "1mo":
    case "3mo":
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case "6mo":
    case "1y":
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case "2y":
    case "5y":
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
