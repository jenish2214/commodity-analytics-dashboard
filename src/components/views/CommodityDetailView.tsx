"use client";

import { useMemo } from "react";
import { CommodityDetailCharts } from "@/components/CommodityDetailCharts";
import { GoldCaratPanel } from "@/components/GoldCaratPanel";
import { useMarketDataStore } from "@/store/marketDataStore";
import type { CommodityKey } from "@/types/models";
import { lastMacd, lastRsi } from "@/utils/indicators";

type Props = {
  symbol: CommodityKey;
};

export function CommodityDetailView({ symbol }: Props) {
  const market = useMarketDataStore((s) => s.market);
  const chartPoints = useMarketDataStore((s) => s.chartPoints);
  const currentData = market.find((item) => item.symbol === symbol);

  const closes = useMemo(() => chartPoints.map((p) => p.price), [chartPoints]);

  const detail = useMemo(() => {
    const rsiVal = lastRsi(closes, 14);
    const macd = lastMacd(closes);
    let trend: "Uptrend" | "Downtrend" | "Neutral" = "Neutral";
    if (macd) {
      if (macd.histogram > 0) trend = "Uptrend";
      else if (macd.histogram < 0) trend = "Downtrend";
    }
    return {
      rsi: rsiVal ?? null,
      macd: macd?.histogram ?? null,
      macdLine: macd?.line ?? null,
      macdSignal: macd?.signal ?? null,
      trend,
      snapshot: currentData
        ? `${currentData.commodity} is ${currentData.change24h > 0 ? "up" : "down"} ${Math.abs(currentData.change24h).toFixed(2)}% vs prior close. Signal: ${currentData.signal}.`
        : "Loading market data…",
    };
  }, [closes, currentData]);

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">
        {currentData?.commodity ?? symbol.charAt(0).toUpperCase() + symbol.slice(1)}
      </h1>
      <p className="ca-page__lead">Technical context from the same closes as the chart (no simulated ticks).</p>

      {symbol === "gold" ? <GoldCaratPanel /> : null}

      <div
        className="ca-stat-grid"
        style={{
          marginBottom: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}
      >
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">RSI (14)</p>
          <p className="ca-stat-card__value">
            {detail.rsi != null ? detail.rsi.toFixed(1) : "—"}
          </p>
        </article>
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">MACD histogram</p>
          <p className="ca-stat-card__value">
            {detail.macd != null ? detail.macd.toFixed(4) : "—"}
          </p>
        </article>
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">Trend (MACD)</p>
          <p className="ca-stat-card__value">{detail.trend}</p>
        </article>
      </div>

      <CommodityDetailCharts symbol={symbol} />

      <article className="ca-card" style={{ marginTop: "1rem" }}>
        <p className="ca-stat-card__label" style={{ marginBottom: "0.5rem" }}>
          Market snapshot
        </p>
        <p style={{ margin: 0, fontSize: "0.9375rem", lineHeight: 1.55, color: "var(--text-primary)" }}>
          {detail.snapshot}
        </p>
      </article>
    </div>
  );
}
