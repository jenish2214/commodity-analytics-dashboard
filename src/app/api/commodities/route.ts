import { NextResponse } from "next/server";
import { buildCommodityMarketPayload } from "@/services/commodities/engine";

export async function GET() {
  try {
    const payload = await buildCommodityMarketPayload();
    return NextResponse.json(payload);
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
          marketSentiment: "Neutral" as const,
        },
        analytics: {
          sectorRotation: [],
          spreads: [],
          marketBreadth: { advancers: 0, decliners: 0, neutral: 0 },
          sentiment: "Neutral" as const,
          seasonalityHints: [],
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
