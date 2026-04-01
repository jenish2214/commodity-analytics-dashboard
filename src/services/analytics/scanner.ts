import { lastMacd, lastRsi, smaAt } from "@/utils/indicators";

export type OpportunityScan = {
  tags: string[];
  score: number;
  rsi14: number | null;
};

/**
 * Lightweight rules: RSI zones, MACD histogram sign, short vs long SMA bias, vol of returns vs median.
 */
export function opportunityScanFromCloses(closes: number[]): OpportunityScan {
  const tags: string[] = [];
  let score = 50;

  if (closes.length < 20) {
    return { tags: ["Insufficient history"], score: 50, rsi14: null };
  }

  const rsi = lastRsi(closes, 14) ?? null;
  if (rsi != null) {
    if (rsi <= 30) {
      tags.push("RSI oversold");
      score += 12;
    } else if (rsi >= 70) {
      tags.push("RSI overbought");
      score += 8;
    } else if (rsi >= 55) {
      tags.push("RSI firm");
      score += 4;
    } else if (rsi <= 45) {
      tags.push("RSI soft");
      score += 2;
    }
  }

  const i = closes.length - 1;
  const sma20 = smaAt(closes, 20, i);
  const last = closes[i]!;
  if (sma20 != null) {
    if (last > sma20 * 1.02) {
      tags.push("Above SMA20");
      score += 6;
    } else if (last < sma20 * 0.98) {
      tags.push("Below SMA20");
      score += 4;
    }
  }

  if (closes.length >= 50) {
    const sma50 = smaAt(closes, 50, i);
    if (sma50 != null && sma20 != null && sma20 > sma50) {
      tags.push("SMA20 > SMA50");
      score += 5;
    }
  }

  const macd = lastMacd(closes);
  if (macd) {
    if (macd.histogram > 0) {
      tags.push("MACD bullish");
      score += 5;
    } else if (macd.histogram < 0) {
      tags.push("MACD bearish");
      score += 3;
    }
  }

  // Recent realized vol vs longer window — flag expansion
  if (closes.length >= 40) {
    const rets: number[] = [];
    for (let j = 1; j < closes.length; j++) {
      const a = closes[j - 1]!;
      const b = closes[j]!;
      if (a > 0) rets.push(Math.log(b / a));
    }
    if (rets.length >= 30) {
      const shortW = rets.slice(-10);
      const longW = rets.slice(-30);
      const sd = (arr: number[]) => {
        const m = arr.reduce((s, x) => s + x, 0) / arr.length;
        return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
      };
      const s10 = sd(shortW);
      const s30 = Math.max(sd(longW), 1e-8);
      if (s10 > s30 * 1.35) {
        tags.push("Vol expanding");
        score += 7;
      }
    }
  }

  const uniq = [...new Set(tags)];
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { tags: uniq, score, rsi14: rsi };
}
