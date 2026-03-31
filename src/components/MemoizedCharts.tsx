/**
 * Memoized Chart Components
 * =========================
 * Performance-optimized chart components using React.memo
 */

import React, { memo, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';

// Memoized pie chart for asset allocation
export const MemoizedPieChart = memo(function AllocationPieChart({
  data,
  colors,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  colors: Record<string, string>;
}) {
  const memoizedData = useMemo(() => data, [JSON.stringify(data)]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={memoizedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {memoizedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value}%`, name]}
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
});

// Memoized Monte Carlo projection chart
export const MemoizedMonteCarloChart = memo(function MonteCarloProjectionChart({
  data,
}: {
  data: Array<{
    year: number;
    expected: number;
    optimistic: number;
    pessimistic: number;
  }>;
}) {
  const memoizedData = useMemo(() => data, [JSON.stringify(data)]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={memoizedData}>
        <defs>
          <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="year" stroke="var(--text-secondary)" />
        <YAxis
          stroke="var(--text-secondary)"
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="optimistic"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorOptimistic)"
          strokeDasharray="5 5"
        />
        <Area
          type="monotone"
          dataKey="pessimistic"
          stroke="#ef4444"
          fillOpacity={1}
          fill="url(#colorPessimistic)"
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="expected"
          stroke="var(--accent)"
          strokeWidth={2}
        />
        <Legend />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// Memoized metrics card
export const MemoizedMetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '1.25rem',
        border: '1px solid var(--border)',
        transition: 'transform 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            padding: '0.5rem',
            background: `${color}20`,
            borderRadius: '8px',
          }}
        >
          <Icon size={20} color={color} />
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color,
          marginBottom: '0.25rem',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {subtitle}
      </div>
    </div>
  );
});

// Memoized model metric card
export const MemoizedModelMetricCard = memo(function ModelMetricCard({
  label,
  value,
  description,
  isPositive,
  isNegative,
}: {
  label: string;
  value: string;
  description: string;
  isPositive?: boolean;
  isNegative?: boolean;
}) {
  const color = isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--text-primary)';

  return (
    <div
      style={{
        background: 'var(--bg-hover)',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color,
          marginBottom: '0.5rem',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {description}
      </div>
    </div>
  );
});

// Lazy loaded chart wrapper - create a placeholder component
export const LazyChart = React.lazy(() =>
  Promise.resolve({
    default: function LazyChartPlaceholder() {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-secondary)'
        }}>
          Loading chart...
        </div>
      );
    }
  })
);
