import type { CommodityKey, SeasonalityHint } from "@/types/models";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * From daily timestamps (sec) and closes, bucket month-end returns by calendar month and
 * pick the month with best average log return (small sample when range ≈ 2y).
 */
export function seasonalityHintFromSeries(
  commodity: string,
  symbol: CommodityKey,
  timestamps: number[],
  closes: number[]
): SeasonalityHint {
  if (timestamps.length !== closes.length || timestamps.length < 60) {
    return {
      commodity,
      symbol,
      strongestMonths: "—",
      avgStrongestMonthReturnPct: null,
    };
  }

  type MonthKey = number;
  const monthlyLast: { t: number; close: number; ym: string }[] = [];
  for (let i = 0; i < closes.length; i++) {
    const c = closes[i];
    const ts = timestamps[i];
    if (c == null || !Number.isFinite(c) || ts == null) continue;
    const d = new Date(ts * 1000);
    monthlyLast.push({
      t: ts,
      close: c,
      ym: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
    });
  }

  // Keep last close per calendar month
  const byMonth = new Map<string, { t: number; close: number }>();
  for (const item of monthlyLast) {
    const prev = byMonth.get(item.ym);
    if (!prev || item.t >= prev.t) {
      byMonth.set(item.ym, { t: item.t, close: item.close });
    }
  }
  const ends = [...byMonth.entries()]
    .map(([, v]) => v)
    .sort((a, b) => a.t - b.t);
  const retByStartMonth = new Map<MonthKey, number[]>();
  for (let i = 1; i < ends.length; i++) {
    const a = ends[i - 1]!.close;
    const b = ends[i]!.close;
    if (a <= 0) continue;
    const r = Math.log(b / a);
    const d = new Date(ends[i]!.t * 1000);
    const mo = d.getUTCMonth();
    const list = retByStartMonth.get(mo) ?? [];
    list.push(r);
    retByStartMonth.set(mo, list);
  }

  let bestM = 0;
  let bestAvg = -Infinity;
  for (const [mo, arr] of retByStartMonth) {
    if (arr.length < 1) continue;
    const avg = arr.reduce((s, x) => s + x, 0) / arr.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestM = mo;
    }
  }

  if (!Number.isFinite(bestAvg) || retByStartMonth.size === 0) {
    return {
      commodity,
      symbol,
      strongestMonths: "—",
      avgStrongestMonthReturnPct: null,
    };
  }

  const pct = (Math.exp(bestAvg) - 1) * 100;
  return {
    commodity,
    symbol,
    strongestMonths: MONTH_NAMES[bestM] ?? String(bestM),
    avgStrongestMonthReturnPct: parseFloat(pct.toFixed(2)),
  };
}
