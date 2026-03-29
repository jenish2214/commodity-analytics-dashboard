"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint, CommodityKey, TimeRange } from "@/types/models";
import { COMMODITY_OPTIONS, TIME_RANGES } from "@/lib/constants";
import { useMarketDataStore } from "@/store/marketDataStore";

type Props = {
  title?: string;
};

export function ChartCard({ title = "Commodity Price Chart" }: Props) {
  const chartPoints = useMarketDataStore((s) => s.chartPoints);
  const selectedSymbol = useMarketDataStore((s) => s.selectedSymbol);
  const timeRange = useMarketDataStore((s) => s.timeRange);
  const setSelectedSymbol = useMarketDataStore((s) => s.setSelectedSymbol);
  const setTimeRange = useMarketDataStore((s) => s.setTimeRange);

  const data: ChartPoint[] = chartPoints;

  return (
    <section className="ca-card">
      <h2 className="ca-page__title" style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
        {title}
      </h2>
      <div className="ca-seg">
        <div style={{ width: "100%" }}>
          <div className="ca-seg__label">Commodity</div>
          <div className="ca-seg__group">
            {COMMODITY_OPTIONS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={
                  selectedSymbol === c.key ? "ca-chip ca-chip--active" : "ca-chip"
                }
                onClick={() => setSelectedSymbol(c.key as CommodityKey)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <div className="ca-seg__label">Time range</div>
          <div className="ca-seg__group">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                className={timeRange === r ? "ca-chip ca-chip--active" : "ca-chip"}
                onClick={() => setTimeRange(r as TimeRange)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ca-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis
              dataKey="period"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
              }}
              formatter={(value: number | string) => [
                `$${Number(value).toFixed(2)}`,
                "Price",
              ]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0b1f33"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
