"use client";

type Props = {
  values: number[];
  positive: boolean;
  height?: number;
  width?: number;
};

/** Normalized polyline sparkline (contract units). */
export function MiniSparkline({
  values,
  positive,
  height = 28,
  width = 72,
}: Props) {
  try {
    const v = values.filter((x) => Number.isFinite(x));
    if (v.length < 2) {
      return (
        <span
          style={{ display: "inline-block", width, height, opacity: 0.35 }}
          aria-hidden
        />
      );
    }
    const min = Math.min(...v);
    const max = Math.max(...v);
    const range = max - min || 1;
    const pad = 2;
    const pts = v
      .map((n, i) => {
        const x = pad + (i / (v.length - 1)) * (width - pad * 2);
        const y = pad + (1 - (n - min) / range) * (height - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const stroke = positive ? "var(--gain, #22c55e)" : "var(--loss, #ef4444)";
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          points={pts}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  } catch {
    return null;
  }
}
