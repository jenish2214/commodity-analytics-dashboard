import type { CurrencyCode } from "@/types/models";

export type FrankfurterUsdRates = {
  /** Units of each currency per 1 USD (e.g. INR: how many rupees per dollar) */
  rates: Record<CurrencyCode, number>;
  asOf: string;
};

/** Fetch USD-base FX from Frankfurter (ECB). Returns null on failure. */
export async function fetchUsdFxRates(): Promise<FrankfurterUsdRates | null> {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,INR,JPY",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      rates?: Record<string, number>;
      date?: string;
    };
    if (!json.rates) return null;
    const rates: Record<CurrencyCode, number> = {
      USD: 1,
      EUR: json.rates.EUR ?? 1,
      GBP: json.rates.GBP ?? 1,
      INR: json.rates.INR ?? 1,
      JPY: json.rates.JPY ?? 1,
    };
    return { rates, asOf: json.date ?? new Date().toISOString().slice(0, 10) };
  } catch {
    return null;
  }
}
