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
import { useUserStore } from "@/store/userStore";
import type { CommodityKey, TimeRange } from "@/types/models";
import {
  convertUsdForDisplay,
  formatCurrencyAmount,
} from "@/utils/format";
import { smaAt } from "@/utils/indicators";

type Props = {
  symbol: CommodityKey;
};

export function CommodityDetailCharts({ symbol }: Props) {
  const [range, setRange] = useState<TimeRange>("1M");
  const chartPoints = useMarketDataStore((s) => s.chartPoints);
  const setChartContext = useMarketDataStore((s) => s.setChartContext);
  const loading = useMarketDataStore((s) => s.loading);
  const chartError = useMarketDataStore((s) => s.chartError);
  const chartFetchedAt = useMarketDataStore((s) => s.chartFetchedAt);
  const fxRates = useMarketDataStore((s) => s.fxRates);
  const currency = useUserStore((s) => s.currency);

  const { displayCurrency } = convertUsdForDisplay(1, currency, fxRates);
  const fmtPrice = (v: number) => formatCurrencyAmount(v, displayCurrency);

  useEffect(() => {
    try {
      setChartContext(symbol, range);
    } catch (e) {
      console.error("Chart context update failed:", e);
    }
  }, [symbol, range, setChartContext]);

  const priceMaData = useMemo(() => {
    const pts = chartPoints.map((p) => ({
      period: p.period,
      price: convertUsdForDisplay(p.price, currency, fxRates).amount,
    }));
    const prices = pts.map((p) => p.price);
    return pts.map((p, i) => ({
      period: p.period,
      price: p.price,
      ma: smaAt(prices, 20, i) ?? p.price,
    }));
  }, [chartPoints, currency, fxRates]);

  const volRows = useMemo(
    () =>
      chartPoints.map((p) => ({
        period: p.period,
        volume: typeof p.volume === "number" && p.volume > 0 ? p.volume : 0,
      })),
    [chartPoints]
  );

  const hasVolume = volRows.some((r) => r.volume > 0);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {(chartError || chartFetchedAt) && (
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            color: chartError ? "var(--loss, #b91c1c)" : "var(--text-secondary)",
          }}
        >
          {chartError
            ? `Chart: ${chartError}`
            : chartFetchedAt
              ? `Chart data as of ${new Date(chartFetchedAt).toLocaleString()} (provider-delayed).`
              : null}
        </p>
      )}
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
          style={{ fontSize: "1.125rem", marginBottom: "0.35rem" }}
        >
          Price history &amp; 20-period SMA
        </h2>
        <p
          style={{
            margin: "0 0 0.75rem",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          USD contract prices scaled to {displayCurrency} (navbar currency + FX).
        </p>
        <div className="ca-chart-wrap">
          {loading && chartPoints.length === 0 ? (
            <div className="ca-chart-wrap" style={{ display: "grid", placeItems: "center" }}>
              Loading…
            </div>
          ) : priceMaData.length === 0 ? (
            <div className="ca-chart-wrap" style={{ display: "grid", placeItems: "center" }}>
              No candle data for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceMaData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => fmtPrice(Number(v))}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                  }}
                  formatter={(v: number | string, name: string) => [
                    fmtPrice(Number(v)),
                    name,
                  ]}
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
                  name="SMA 20"
                  stroke="#1db954"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={600}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="ca-card">
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}
        >
          Volume
        </h2>
        {!hasVolume ? (
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            No volume series for this interval (common on some Yahoo intraday responses).
          </p>
        ) : (
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
        )}
      </section>
    </div>
  );
}
