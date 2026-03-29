"use client";

import { AIInsightCard } from "@/components/AIInsightCard";
import { CommodityDetailCharts } from "@/components/CommodityDetailCharts";
import { useMarketDataStore } from "@/store/marketDataStore";
import type { CommodityKey } from "@/types/models";

type Props = {
  symbol: CommodityKey;
};

export function CommodityDetailView({ symbol }: Props) {
  const market = useMarketDataStore((s) => s.market);
  const currentData = market.find(item => item.symbol === symbol);
  
  const detail = {
    name: currentData?.commodity || symbol.charAt(0).toUpperCase() + symbol.slice(1),
    rsi: 58.2, // Would be calculated from real data in production
    macd: 0.42,
    trend: "Uptrend" as const,
    aiSummary: currentData ? 
      `${currentData.commodity} shows ${currentData.change24h > 0 ? 'positive' : 'negative'} momentum with ${Math.abs(currentData.change24h).toFixed(2)}% change. Current market conditions suggest ${currentData.signal === 'BUY' ? 'bullish' : currentData.signal === 'SELL' ? 'bearish' : 'neutral'} outlook.` :
      "Loading market data...",
  };

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">{detail.name}</h1>
      <p className="ca-page__lead">Technical context and AI commentary.</p>

      <div
        className="ca-stat-grid"
        style={{
          marginBottom: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}
      >
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">RSI</p>
          <p className="ca-stat-card__value">{detail.rsi.toFixed(1)}</p>
        </article>
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">MACD</p>
          <p className="ca-stat-card__value">{detail.macd.toFixed(2)}</p>
        </article>
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">Trend signal</p>
          <p className="ca-stat-card__value">{detail.trend}</p>
        </article>
      </div>

      <CommodityDetailCharts symbol={symbol} />

      <div style={{ marginTop: "1rem" }}>
        <AIInsightCard title="AI Insights" body={detail.aiSummary} />
      </div>
    </div>
  );
}
