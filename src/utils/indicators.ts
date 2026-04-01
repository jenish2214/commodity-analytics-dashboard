/** Simple moving average at index (inclusive window). */
export function smaAt(prices: number[], period: number, index: number): number | undefined {
  if (index < period - 1 || period < 1) return undefined;
  let s = 0;
  for (let i = index - period + 1; i <= index; i++) s += prices[i];
  return s / period;
}

function emaSeries(values: number[], period: number): (number | undefined)[] {
  const out: (number | undefined)[] = values.map(() => undefined);
  if (values.length < period || period < 1) return out;
  const k = 2 / (period + 1);
  let ema = 0;
  for (let i = 0; i < period; i++) ema += values[i];
  ema /= period;
  out[period - 1] = ema;
  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
    out[i] = ema;
  }
  return out;
}

/** Wilder-style RSI series (14). Undefined until index >= period. */
export function rsiSeries(prices: number[], period = 14): (number | undefined)[] {
  const rsi: (number | undefined)[] = prices.map(() => undefined);
  if (prices.length < period + 1) return rsi;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi[period] = 100 - 100 / (1 + rs0);

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i] = 100 - 100 / (1 + rs);
  }
  return rsi;
}

export function lastRsi(prices: number[], period = 14): number | undefined {
  const s = rsiSeries(prices, period);
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] != null) return s[i];
  }
  return undefined;
}

export type MacdSnapshot = { line: number; signal: number; histogram: number };

/** MACD(12,26) line and signal(9) at last bar; null if insufficient data. */
export function lastMacd(prices: number[]): MacdSnapshot | null {
  if (prices.length < 35) return null;
  const e12 = emaSeries(prices, 12);
  const e26 = emaSeries(prices, 26);
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    const a = e12[i];
    const b = e26[i];
    macdLine.push(a != null && b != null ? a - b : NaN);
  }
  const first = macdLine.findIndex((x) => Number.isFinite(x));
  if (first < 0) return null;
  const clean = macdLine.slice(first);
  const sig = emaSeries(clean, 9);
  const i = clean.length - 1;
  const line = clean[i];
  const signal = sig[i];
  if (!Number.isFinite(line) || signal == null || !Number.isFinite(signal)) return null;
  return {
    line,
    signal,
    histogram: line - signal,
  };
}
