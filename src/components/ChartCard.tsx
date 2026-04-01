"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { ExternalLink, Settings, TrendingUp, BarChart3, Activity, Layers } from "lucide-react";
import type { ChartPoint, CommodityKey, TimeRange } from "@/types/models";
import { COMMODITY_OPTIONS, TIME_RANGES } from "@/lib/constants";
import { useMarketDataStore } from "@/store/marketDataStore";
import { useChartPreferencesStore } from "@/store/chartPreferencesStore";
import { useMemo, useState, useCallback } from "react";
import { useUserStore } from "@/store/userStore";
import {
  convertUsdForDisplay,
  formatCurrencyAmount,
} from "@/utils/format";
import { rsiSeries } from "@/utils/indicators";

type Props = {
  title?: string;
};

export function ChartCard({ title = "Commodity Price Chart" }: Props) {
  const chartPoints = useMarketDataStore((s) => s.chartPoints);
  const selectedSymbol = useMarketDataStore((s) => s.selectedSymbol);
  const timeRange = useMarketDataStore((s) => s.timeRange);
  const loading = useMarketDataStore((s) => s.loading);
  const setSelectedSymbol = useMarketDataStore((s) => s.setSelectedSymbol);
  const setTimeRange = useMarketDataStore((s) => s.setTimeRange);
  
  const { preferences, setChartType, toggleIndicator, setShowGrid, setShowTooltip } = useChartPreferencesStore();
  const [showSettings, setShowSettings] = useState(false);

  const currency = useUserStore((s) => s.currency);
  const fxRates = useMarketDataStore((s) => s.fxRates);

  const displayCurrency = useMemo(
    () => convertUsdForDisplay(1, currency, fxRates).displayCurrency,
    [currency, fxRates]
  );

  const fmtPrice = useCallback(
    (n: number | string) =>
      formatCurrencyAmount(
        typeof n === "string" ? Number(n) : n,
        displayCurrency
      ),
    [displayCurrency]
  );

  const data: ChartPoint[] = useMemo(
    () =>
      chartPoints.map((p) => ({
        ...p,
        price: convertUsdForDisplay(p.price, currency, fxRates).amount,
      })),
    [chartPoints, currency, fxRates]
  );

  const closes = data.map((d) => d.price);
  const rsiVals = rsiSeries(closes, 14);

  const openTradingView = () => {
    window.open('/trading', '_blank');
  };

  const enhancedData = data.map((point, index) => {
    const result = { ...point } as ChartPoint & {
      sma?: number;
      ema?: number;
      rsi?: number;
      volume?: number;
    };

    if (preferences.indicators.includes("sma") && index >= 19) {
      const last20 = data.slice(index - 19, index + 1);
      const sma =
        last20.reduce((sum, p) => sum + p.price, 0) / last20.length;
      result.sma = parseFloat(sma.toFixed(2));
    }

    if (preferences.indicators.includes("ema") && index >= 19) {
      const multiplier = 2 / (20 + 1);
      let ema = data[19].price;
      for (let i = 20; i <= index; i++) {
        ema = (data[i].price - ema) * multiplier + ema;
      }
      result.ema = parseFloat(ema.toFixed(2));
    }

    if (preferences.indicators.includes("volume")) {
      const v = point.volume;
      if (typeof v === "number" && Number.isFinite(v) && v > 0) {
        result.volume = v;
      }
    }

    if (preferences.indicators.includes("rsi")) {
      const r = rsiVals[index];
      if (r != null) result.rsi = parseFloat(r.toFixed(2));
    }

    return result;
  });

  const renderChart = () => {
    const commonProps = {
      data: enhancedData,
      margin: { top: 8, right: 8, left: 0, bottom: 0 },
    };

    switch (preferences.chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            {preferences.showGrid && <CartesianGrid strokeDasharray="4 4" stroke={preferences.colors.grid} />}
            <XAxis dataKey="period" tick={{ fill: preferences.colors.text, fontSize: 11 }} tickLine={false} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: preferences.colors.text, fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v) => fmtPrice(v)}
            />
            {preferences.showTooltip && (
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number | string) => [fmtPrice(value), "Price"]}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke={preferences.colors.primary}
              fill={preferences.colors.primary}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={preferences.animationDuration}
            />
            {preferences.indicators.includes("sma") && (
              <Line
                type="monotone"
                dataKey="sma"
                stroke={preferences.colors.secondary}
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
            {preferences.indicators.includes("ema") && (
              <Line
                type="monotone"
                dataKey="ema"
                stroke="#ff6b6b"
                strokeWidth={1}
                dot={false}
              />
            )}
          </AreaChart>
        );

      case "candlestick":
        // For candlestick, we need OHLC data which we don't have, so we'll use a bar chart as approximation
        return (
          <BarChart {...commonProps}>
            {preferences.showGrid && <CartesianGrid strokeDasharray="4 4" stroke={preferences.colors.grid} />}
            <XAxis dataKey="period" tick={{ fill: preferences.colors.text, fontSize: 11 }} tickLine={false} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: preferences.colors.text, fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v) => fmtPrice(v)}
            />
            {preferences.showTooltip && (
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number | string) => [fmtPrice(value), "Price"]}
              />
            )}
            <Bar
              dataKey="price"
              fill={preferences.colors.primary}
              isAnimationActive={true}
              animationDuration={preferences.animationDuration}
            />
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            {preferences.showGrid && <CartesianGrid strokeDasharray="4 4" stroke={preferences.colors.grid} />}
            <XAxis dataKey="period" tick={{ fill: preferences.colors.text, fontSize: 11 }} tickLine={false} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: preferences.colors.text, fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v) => fmtPrice(v)}
            />
            {preferences.showTooltip && (
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number | string, name: string) => {
                  if (name === "rsi") return [`${Number(value).toFixed(2)}%`, "RSI"];
                  if (name === "volume") return [`${(Number(value) / 1000000).toFixed(1)}M`, "Volume"];
                  const label =
                    name === "sma" ? "SMA" : name === "ema" ? "EMA" : "Price";
                  return [fmtPrice(value), label];
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke={preferences.colors.primary}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={preferences.animationDuration}
            />
            {preferences.indicators.includes("sma") && (
              <Line
                type="monotone"
                dataKey="sma"
                stroke={preferences.colors.secondary}
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
            {preferences.indicators.includes("ema") && (
              <Line
                type="monotone"
                dataKey="ema"
                stroke="#ff6b6b"
                strokeWidth={1}
                dot={false}
              />
            )}
            {preferences.indicators.includes("rsi") && (
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#9333ea"
                strokeWidth={1}
                dot={false}
                yAxisId="rsi"
              />
            )}
            {preferences.indicators.includes("volume") && (
              <Bar
                dataKey="volume"
                fill={preferences.colors.volume}
                opacity={0.3}
                yAxisId="volume"
              />
            )}
            {preferences.indicators.includes("rsi") && (
              <YAxis
                yAxisId="rsi"
                domain={[0, 100]}
                orientation="right"
                tick={{ fill: "#9333ea", fontSize: 10 }}
                tickLine={false}
              />
            )}
            {preferences.indicators.includes("volume") && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                tick={{ fill: preferences.colors.volume, fontSize: 10 }}
                tickLine={false}
                hide
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <section className="ca-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <h2 className="ca-page__title" style={{ fontSize: "1.125rem", margin: 0 }}>
            {title}
          </h2>
          <p
            style={{
              margin: "0.35rem 0 0",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            Price scale: USD contract → {displayCurrency} (ECB FX from market data).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={openTradingView}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
            }}
          >
            <ExternalLink size={16} />
            More Options
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          padding: '1rem',
          background: 'var(--bg-hover)',
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid var(--border)',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Chart Type
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setChartType('line')}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: preferences.chartType === 'line' ? 'var(--accent)' : 'var(--bg-card)',
                  border: preferences.chartType === 'line' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: preferences.chartType === 'line' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <TrendingUp size={12} style={{ marginRight: '0.25rem' }} />
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: preferences.chartType === 'area' ? 'var(--accent)' : 'var(--bg-card)',
                  border: preferences.chartType === 'area' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: preferences.chartType === 'area' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <Activity size={12} style={{ marginRight: '0.25rem' }} />
                Area
              </button>
              <button
                onClick={() => setChartType('candlestick')}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: preferences.chartType === 'candlestick' ? 'var(--accent)' : 'var(--bg-card)',
                  border: preferences.chartType === 'candlestick' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: preferences.chartType === 'candlestick' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <BarChart3 size={12} style={{ marginRight: '0.25rem' }} />
                Candlestick
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Indicators
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'price', label: 'Price', icon: TrendingUp },
                { id: 'volume', label: 'Volume', icon: BarChart3 },
                { id: 'sma', label: 'SMA', icon: Activity },
                { id: 'ema', label: 'EMA', icon: Layers },
                { id: 'rsi', label: 'RSI', icon: TrendingUp },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleIndicator(id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: preferences.indicators.includes(id as any) ? 'var(--accent)' : 'var(--bg-card)',
                    border: preferences.indicators.includes(id as any) ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: preferences.indicators.includes(id as any) ? 'var(--bg-primary)' : 'var(--text-primary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={10} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Display Options
            </h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Grid
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.showTooltip}
                  onChange={(e) => setShowTooltip(e.target.checked)}
                />
                Tooltip
              </label>
            </div>
          </div>
        </div>
      )}

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
      <div className="ca-chart-wrap" style={{ height: "320px", width: "100%" }}>
        {loading && data.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
          }}>
            Loading chart data...
          </div>
        ) : data.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
          }}>
            No chart data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
