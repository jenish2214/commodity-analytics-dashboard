import type { CurrencyCode } from "@/types/models";
import { convertUsdForDisplay } from "@/utils/format";

/** Troy ounce to grams (international avoirdupois conversion for precious metals). */
export const GRAMS_PER_TROY_OZ = 31.1034768;

/** 24K fine gold: USD per gram from Comex GC spot (USD per troy oz). */
export function goldUsdPerGram24k(spotUsdPerTroyOz: number): number {
  return spotUsdPerTroyOz / GRAMS_PER_TROY_OZ;
}

/** Jewellery purity prices per gram in the user’s currency (spot-derived, not local making charges). */
export function goldCaratPerGramDisplay(
  spotUsdPerTroyOz: number,
  currency: CurrencyCode,
  fx: Partial<Record<CurrencyCode, number>> | null
): {
  k18: number;
  k22: number;
  k24: number;
  displayCurrency: CurrencyCode;
  usedUsdFallback: boolean;
} {
  const usdG = goldUsdPerGram24k(spotUsdPerTroyOz);
  const c24 = convertUsdForDisplay(usdG, currency, fx);
  const c22 = convertUsdForDisplay(usdG * (22 / 24), currency, fx);
  const c18 = convertUsdForDisplay(usdG * (18 / 24), currency, fx);
  return {
    k24: c24.amount,
    k22: c22.amount,
    k18: c18.amount,
    displayCurrency: c24.displayCurrency,
    usedUsdFallback: c24.usedUsdFallback,
  };
}
