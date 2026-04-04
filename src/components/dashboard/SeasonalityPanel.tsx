"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CommodityAnalytics } from "@/types/models";

type Props = {
  analytics: CommodityAnalytics;
};

export function SeasonalityPanel({ analytics }: Props) {
  const data = useMemo(() => {
    return analytics.seasonalityHints.slice(0, 6).map((h) => ({
      name: h.commodity.slice(0, 12),
      edge: h.avgStrongestMonthReturnPct ?? 0,
      detail: h.strongestMonths,
    }));
  }, [analytics.seasonalityHints]);

  if (data.length === 0) {
    return (
      <section className="ca-card" aria-label="Seasonality">
        <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
          Seasonality
        </h2>
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
          Seasonality hints load with the commodity bundle — add history to see strongest months.
        </p>
      </section>
    );
  }

  return (
    <section className="ca-card" aria-label="Seasonality analysis">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        Seasonality analysis
      </h2>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
        Avg. return in strongest seasonal window (%), from desk analytics.
      </p>
      <div className="ca-chart-wrap" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--text-secondary)" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="var(--text-secondary)"
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(v: number) => [`${v.toFixed(2)}%`, "Edge"]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.detail
                  ? `Strongest: ${payload[0].payload.detail}`
                  : ""
              }
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            />
            <Bar dataKey="edge" fill="var(--accent)" radius={[6, 6, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
