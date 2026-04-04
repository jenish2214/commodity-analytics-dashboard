/**
 * Client-side risk heuristics from price series — no API changes.
 */

export function dailyReturns(prices: number[]): number[] {
  const r: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const a = prices[i - 1];
    const b = prices[i];
    if (a > 0 && Number.isFinite(b)) r.push((b - a) / a);
  }
  return r;
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function stdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

/** Annualized Sharpe-style ratio (rf ≈ 0), from daily simple returns. */
export function sharpeFromDailyReturns(daily: number[], tradingDays = 252): number {
  if (daily.length < 5) return 0;
  const m = mean(daily);
  const s = stdDev(daily);
  if (s < 1e-12) return 0;
  return (m / s) * Math.sqrt(tradingDays);
}

export function maxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;
  let peak = prices[0];
  let maxDd = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    if (peak > 0) {
      const dd = (peak - p) / peak;
      if (dd > maxDd) maxDd = dd;
    }
  }
  return maxDd;
}

/** Simple historical VaR (95%) on daily returns — loss as positive fraction. */
export function valueAtRisk95(daily: number[]): number {
  if (daily.length < 8) return 0;
  const sorted = [...daily].sort((a, b) => a - b);
  const idx = Math.floor((1 - 0.95) * sorted.length);
  const q = sorted[Math.max(0, idx)];
  return q < 0 ? -q : 0;
}

/** Vs equal-weight "market" proxy from average commodity daily change — heuristic beta. */
export function heuristicBeta(assetDaily: number[], marketDaily: number[]): number {
  const n = Math.min(assetDaily.length, marketDaily.length);
  if (n < 5) return 1;
  let cov = 0;
  let varM = 0;
  const a = assetDaily.slice(-n);
  const m = marketDaily.slice(-n);
  const ma = mean(a);
  const mm = mean(m);
  for (let i = 0; i < n; i++) {
    cov += (a[i] - ma) * (m[i] - mm);
    varM += (m[i] - mm) ** 2;
  }
  if (varM < 1e-12) return 1;
  return cov / varM;
}
