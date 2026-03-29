import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch real market data to generate AI insights
    const marketRes = await fetch("http://localhost:3000/api/commodities", {
      cache: "no-store",
    });
    
    if (!marketRes.ok) {
      throw new Error("Failed to fetch market data");
    }
    
    const marketData = await marketRes.json();
    const market = marketData.market || [];
    
    // Generate real-time AI insights based on market data
    const topGainers = market.filter(item => item.change24h > 0).sort((a, b) => b.change24h - a.change24h).slice(0, 3);
    const topLosers = market.filter(item => item.change24h < 0).sort((a, b) => a.change24h - b.change24h).slice(0, 3);
    
    const sentimentAnalysis = `Market sentiment is ${market.filter(item => item.change24h > 0).length > market.length / 2 ? 'bullish' : 'bearish'} with ${market.length} commodities tracked. Top performers include ${topGainers.map(g => g.commodity).join(', ')} while ${topLosers.map(l => l.commodity).join(', ')} are under pressure.`;
    
    const predictions = topGainers.map(item => ({
      id: `pred-${item.id}`,
      commodity: item.commodity,
      prediction: item.change24h > 2 ? "Bullish" : item.change24h > 0 ? "Neutral" : "Bearish",
      confidence: Math.min(95, Math.max(60, 70 + Math.abs(item.change24h) * 10)),
    }));
    
    const tradingSignals = topGainers.slice(0, 2).map(item => ({
      id: `signal-${item.id}`,
      commodity: item.commodity,
      signal: item.change24h > 1.5 ? "BUY" : item.change24h > 0 ? "HOLD" : "SELL",
      rationale: `Based on ${item.change24h > 0 ? 'positive' : 'negative'} momentum of ${Math.abs(item.change24h).toFixed(2)}% and current market conditions.`,
    }));
    
    const highlights = {
      commodityInsight: topGainers[0]?.commodity ? `${topGainers[0].commodity} shows strong momentum with ${topGainers[0].change24h.toFixed(2)}% gain.` : "Market analysis in progress...",
      oilInsight: market.find(item => item.commodity.includes("Crude")) ? 
        `Crude oil is ${market.find(item => item.commodity.includes("Crude"))!.change24h > 0 ? 'gaining' : 'declining'} with ${Math.abs(market.find(item => item.commodity.includes("Crude"))!.change24h).toFixed(2)}% change.` :
        "Oil market data loading...",
    };

    return NextResponse.json({
      sentimentAnalysis,
      predictions,
      tradingSignals,
      highlights,
      generatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI insights",
        sentimentAnalysis: "Unable to analyze market sentiment at this time.",
        predictions: [],
        tradingSignals: [],
        highlights: { commodityInsight: "Analysis unavailable", oilInsight: "Analysis unavailable" },
      },
      { status: 200 }
    );
  }
}
