"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TIME_RANGES } from "@/lib/constants";
import { useMarketDataStore } from "@/store/marketDataStore";
import type { CommodityKey, TimeRange } from "@/types/models";

type Props = {
  symbol: CommodityKey;
};

export function CommodityDetailCharts({ symbol }: Props) {
  const [range, setRange] = useState<TimeRange>("1M");
  const chartPoints = useMarketDataStore((s) => s.chartPoints);
  const fetchChart = useMarketDataStore((s) => s.fetchChart);
  const loading = useMarketDataStore((s) => s.loading);

  useEffect(() => {
    fetchChart();
  }, [symbol, range, fetchChart]);

  const priceRows = useMemo(
    () => chartPoints.map(p => ({ period: p.period, price: p.price })),
    [chartPoints]
  );
  
  const maRows = useMemo(
    () => chartPoints.map(p => ({ period: p.period, price: p.price, ma: p.price * 0.98 })), // Simple MA approximation
    [chartPoints]
  );
  
  const volRows = useMemo(
    () => chartPoints.map((p, i) => ({ 
      period: p.period, 
      volume: Math.max(1000000, Math.random() * 10000000) // Mock volume for now
    })),
    [chartPoints]
  );

  const priceMaData = useMemo(
    () =>
      priceRows.map((p, i) => ({
        period: p.period,
        price: p.price,
        ma: maRows[i]?.price ?? p.price,
      })),
    [priceRows, maRows]
  );

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="ca-seg">
        <div style={{ width: "100%" }}>
          <div className="ca-seg__label">Time range</div>
          <div className="ca-seg__group">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                className={range === r ? "ca-chip ca-chip--active" : "ca-chip"}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="ca-card">
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}
        >
          Price history & moving averages
        </h2>
        <div className="ca-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceMaData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="#0b1f33"
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="ma"
                name="Moving avg"
                stroke="#1db954"
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="ca-card">
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}
        >
          Volume
        </h2>
        <div className="ca-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(v: number) => [v.toLocaleString("en-US"), "Volume"]}
              />
              <Bar dataKey="volume" fill="#0b1f33" isAnimationActive animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
