/**
 * Volatility helpers from a close series (oldest → newest).
 */

/** Sample standard deviation of log returns over the last `window` steps. */
export function rollingLogReturnVol(
  closes: number[],
  window: number
): number | null {
  try {
    if (window < 2 || closes.length < window + 1) return null;
    const slice = closes.slice(-(window + 1));
    const rets: number[] = [];
    for (let i = 1; i < slice.length; i++) {
      const a = slice[i - 1];
      const b = slice[i];
      if (a <= 0 || b <= 0 || !Number.isFinite(a) || !Number.isFinite(b)) {
        return null;
      }
      rets.push(Math.log(b / a));
    }
    const mean = rets.reduce((s, x) => s + x, 0) / rets.length;
    const varSample =
      rets.reduce((s, x) => s + (x - mean) ** 2, 0) / (rets.length - 1);
    if (!Number.isFinite(varSample) || varSample < 0) return null;
    return Math.sqrt(varSample);
  } catch {
    return null;
  }
}

/** Annualize daily vol (roughly 252 trading days). */
export function annualizeDailyVol(dailySigma: number | null): number | null {
  try {
    if (dailySigma == null || !Number.isFinite(dailySigma)) return null;
    return dailySigma * Math.sqrt(252);
  } catch {
    return null;
  }
}

/** Simple 0–100 “risk index” from annualized vol (cap 100). */
export function riskIndexFromAnnualVol(annualVol: number | null): number | null {
  try {
    if (annualVol == null || !Number.isFinite(annualVol) || annualVol < 0) {
      return null;
    }
    const v = annualVol * 100;
    return Math.min(100, Math.round(v));
  } catch {
    return null;
  }
}
