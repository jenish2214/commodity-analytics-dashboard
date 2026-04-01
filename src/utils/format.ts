import type { CurrencyCode } from "@/types/models";

/**
 * Convert a USD spot amount for display. Uses `currency` when FX exists; otherwise USD
 * (callers should label “USD spot” when `usedUsdFallback` is true).
 */
export function convertUsdForDisplay(
  amountUsd: number,
  currency: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> | null | undefined
): { amount: number; displayCurrency: CurrencyCode; usedUsdFallback: boolean } {
  if (currency === "USD") {
    return { amount: amountUsd, displayCurrency: "USD", usedUsdFallback: false };
  }
  const r = rates?.[currency];
  if (r == null || !Number.isFinite(r) || r <= 0) {
    return { amount: amountUsd, displayCurrency: "USD", usedUsdFallback: true };
  }
  return {
    amount: amountUsd * r,
    displayCurrency: currency,
    usedUsdFallback: false,
  };
}

/**
 * Convert an amount priced in INR into the user’s currency using USD-base FX
 * (1 USD = rates.INR rupees, etc.). Falls back to INR if INR/USD or target rate is missing.
 */
export function convertInrAmountToDisplay(
  amountInr: number,
  currency: CurrencyCode,
  fxUsd: Partial<Record<CurrencyCode, number>> | null | undefined
): { amount: number; displayCurrency: CurrencyCode; usedInrFallback: boolean } {
  if (currency === "INR") {
    return { amount: amountInr, displayCurrency: "INR", usedInrFallback: false };
  }
  const inrPerUsd = fxUsd?.INR;
  if (!inrPerUsd || !Number.isFinite(inrPerUsd) || inrPerUsd <= 0) {
    return { amount: amountInr, displayCurrency: "INR", usedInrFallback: true };
  }
  const usd = amountInr / inrPerUsd;
  if (currency === "USD") {
    return { amount: usd, displayCurrency: "USD", usedInrFallback: false };
  }
  const r = fxUsd?.[currency];
  if (r == null || !Number.isFinite(r) || r <= 0) {
    return { amount: amountInr, displayCurrency: "INR", usedInrFallback: true };
  }
  return { amount: usd * r, displayCurrency: currency, usedInrFallback: false };
}

const LOCALE: Record<CurrencyCode, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  INR: "en-IN",
  JPY: "ja-JP",
};

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 100 ? 0 : 2,
  }).format(n);
}

export function formatSignedUsd(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${formatUsd(n)}`;
}

/** Format amount with Intl using currency code (preferred when code is known). */
export function formatCurrencyAmount(
  n: number,
  currency: CurrencyCode
): string {
  const digits = currency === "JPY" ? 0 : n >= 100 ? 0 : 2;
  return new Intl.NumberFormat(LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: currency === "JPY" ? 0 : undefined,
  }).format(n);
}

/** Format with explicit symbol prefix (for inline display with user-selected symbol). */
export function formatWithSymbol(
  n: number,
  symbol: string,
  currency: CurrencyCode
): string {
  const abs = Math.abs(n);
  const formatted = formatCurrencyAmount(abs, currency);
  const sign = n < 0 ? "-" : "";
  if (formatted.includes(symbol)) return `${sign}${formatted}`;
  return `${sign}${symbol}${abs.toFixed(currency === "JPY" ? 0 : 2)}`;
}

export function formatSignedCurrency(
  n: number,
  currency: CurrencyCode
): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${formatCurrencyAmount(Math.abs(n), currency)}`;
}

export function formatPercent(n: number, digits = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
};
