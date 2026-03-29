import { NextResponse } from "next/server";

const MARKET_INDICES = [
  // US Markets
  { symbol: "^GSPC", name: "S&P 500", country: "US", currency: "USD" },
  { symbol: "^DJI", name: "Dow Jones", country: "US", currency: "USD" },
  { symbol: "^IXIC", name: "NASDAQ", country: "US", currency: "USD" },
  { symbol: "^RUT", name: "Russell 2000", country: "US", currency: "USD" },
  { symbol: "^VIX", name: "VIX", country: "US", currency: "USD" },
  
  // European Markets
  { symbol: "^FTSE", name: "FTSE 100", country: "UK", currency: "GBP" },
  { symbol: "^DAX", name: "DAX", country: "Germany", currency: "EUR" },
  { symbol: "^FCHI", name: "CAC 40", country: "France", currency: "EUR" },
  { symbol: "^STOXX", name: "Euro Stoxx 50", country: "Europe", currency: "EUR" },
  { symbol: "^AEX", name: "AEX", country: "Netherlands", currency: "EUR" },
  
  // Asian Markets
  { symbol: "^N225", name: "Nikkei 225", country: "Japan", currency: "JPY" },
  { symbol: "^HSI", name: "Hang Seng", country: "Hong Kong", currency: "HKD" },
  { symbol: "000001.SS", name: "Shanghai Composite", country: "China", currency: "CNY" },
  { symbol: "^STI", name: "Straits Times", country: "Singapore", currency: "SGD" },
  { symbol: "^BSESN", name: "BSE Sensex", country: "India", currency: "INR" },
  { symbol: "^NSEI", name: "Nifty 50", country: "India", currency: "INR" },
  
  // Other Major Markets
  { symbol: "^TSX", name: "TSX", country: "Canada", currency: "CAD" },
  { symbol: "^AXJO", name: "ASX 200", country: "Australia", currency: "AUD" },
  { symbol: "^MXX", name: "IPC Mexico", country: "Mexico", currency: "MXN" },
  { symbol: "^BVSP", name: "Bovespa", country: "Brazil", currency: "BRL" },
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      MARKET_INDICES.map(async (index) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d&range=5d`;
        
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 300 }, // 5 minutes cache
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch ${index.name}`);
        }

        const json = await res.json();
        
        if (!json.chart?.result?.[0]) {
          throw new Error(`No data for ${index.name}`);
        }

        const result = json.chart.result[0];
        const meta = result.meta;
        const closes = result.indicators.quote[0].close;
        
        const prev = closes[closes.length - 2] ?? meta.chartPreviousClose;
        const current = meta.regularMarketPrice;
        const change = current - prev;
        const changePct = (change / prev) * 100;

        return {
          symbol: index.symbol,
          name: index.name,
          country: index.country,
          currency: index.currency,
          price: parseFloat(current.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePct: parseFloat(changePct.toFixed(2)),
          volume: meta.regularMarketVolume || 0,
          high: meta.regularMarketDayHigh,
          low: meta.regularMarketDayLow,
          marketCap: meta.marketCap,
          timestamp: meta.regularMarketTime,
          status: meta.marketState || "CLOSED",
        };
      })
    );

    const data = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    // Group by country for better organization
    const groupedByCountry = data.reduce((acc, item) => {
      if (!acc[item.country]) {
        acc[item.country] = [];
      }
      acc[item.country].push(item);
      return acc;
    }, {} as Record<string, typeof data[0][]>);

    return NextResponse.json({
      indices: data,
      groupedByCountry,
      summary: {
        total: data.length,
        marketsUp: data.filter(item => item.change > 0).length,
        marketsDown: data.filter(item => item.change < 0).length,
        avgChange: parseFloat((data.reduce((sum, item) => sum + item.changePct, 0) / data.length).toFixed(2)),
      },
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Failed to fetch market indices:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch market indices",
        indices: [],
        groupedByCountry: {},
        summary: { total: 0, marketsUp: 0, marketsDown: 0, avgChange: 0 },
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
