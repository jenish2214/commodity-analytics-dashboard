/**
 * Indian commodity pricing engine (server-side).
 *
 * Fetches USD-denominated quotes (Twelve Data or Yahoo), USD/INR (Frankfurter / ECB),
 * converts to Indian market units, and merges static agriculture reference (₹/quintal).
 *
 * Env: `TWELVEDATA_KEY` or pass `apiKey` in options (Next.js 14 / Node).
 *
 * @module indianCommodityPricingEngine
 */

import type { CurrencyCode } from "@/types/models";
import { fetchUsdFxRates } from "@/lib/fx";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TROY_OUNCES_TO_GRAMS = 31.1035;
const BARREL_TO_LITRES = 159;
const GOLD_22K_FACTOR = 0.916;
const GOLD_18K_FACTOR = 0.75;

const TWELVE_DATA_BASE = "https://api.twelvedata.com";
/** Frankfurter (ECB reference) — no API key. exchangerate.host now requires access_key. */
const FOREX_URL =
  "https://api.frankfurter.app/latest?from=USD&to=INR";

const SYMBOLS = {
  gold: "XAU/USD",
  silver: "XAG/USD",
  crudeOil: "WTI/USD",
  naturalGas: "NG/USD",
} as const;

/** Yahoo chart tickers (USD) when Twelve Data key is not set. */
const YAHOO_USD_TICKERS = {
  gold: "GC=F",
  silver: "SI=F",
  crudeOil: "CL=F",
  naturalGas: "NG=F",
} as const;

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 4;
const BASE_BACKOFF_MS = 400;
const CACHE_TTL_MS = 5 * 60 * 1000;

const LOG_PREFIX = "[IndianCommodityEngine]";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Gold purity prices in INR per gram (spot-derived) + 24K fine ticket sizes (total INR). */
export interface GoldPriceFormat {
  "24k": number;
  "22k": number;
  "18k": number;
  /** 24K fine — total INR for 10 g. */
  per10Gram: number;
  /** 24K fine — total INR for 100 g. */
  per100Gram: number;
  /** 24K fine — total INR for 1 kg (1000 g). */
  per1Kg: number;
}

export interface EnergyPrices {
  crudeOil: {
    perBarrel: number;
    perLitre: number;
  };
  naturalGas: {
    pricePerMMBtu: number;
  };
}

/** Reference agricultural cash — ₹ per quintal (static; replace with live feed in prod). */
export interface AgriculturePrices {
  wheat: number;
  rice: number;
  corn: number;
  soybean: number;
}

export interface CommodityPrices {
  gold: GoldPriceFormat;
  silver: {
    perGram: number;
    perKg: number;
  };
  crudeOil: EnergyPrices["crudeOil"];
  naturalGas: EnergyPrices["naturalGas"];
  agriculture: AgriculturePrices;
}

export type IndianCommoditySuccess = {
  success: true;
  timestamp: number;
  data: CommodityPrices;
  /** USD spot source for metals/energy legs. */
  quoteSource: "twelve" | "yahoo";
  /** USD-base ECB rates (1 USD = fx[currency] units). Use with `convertInrAmountToDisplay`. */
  fx: Partial<Record<CurrencyCode, number>> | null;
  fxAsOf: string | null;
};

export type IndianCommodityFailure = {
  success: false;
  timestamp: number;
  error: string;
  code?: string;
};

export type IndianCommodityResponse =
  | IndianCommoditySuccess
  | IndianCommodityFailure;

export interface GetIndianCommodityPricesOptions {
  /** Overrides `process.env.TWELVEDATA_KEY`. */
  apiKey?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Static agriculture reference (₹ per quintal) — illustrative baseline
// ---------------------------------------------------------------------------

const AGRICULTURE_REFERENCE_INR_PER_QUINTAL: AgriculturePrices = {
  wheat: 2650,
  rice: 3850,
  corn: 2320,
  soybean: 5100,
};

// ---------------------------------------------------------------------------
// In-memory cache + inflight deduplication
// ---------------------------------------------------------------------------

type CacheEntry = { value: unknown; expiresAt: number };

const memoryCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function cacheGet<T>(key: string): T | undefined {
  const row = memoryCache.get(key);
  if (!row) return undefined;
  if (Date.now() >= row.expiresAt) {
    memoryCache.delete(key);
    return undefined;
  }
  return row.value as T;
}

function cacheSet(key: string, value: unknown, ttlMs: number): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function getOrCompute<T>(
  key: string,
  ttlMs: number,
  factory: () => Promise<T>
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = factory()
    .then((value) => {
      cacheSet(key, value, ttlMs);
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const t = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function parseRetryAfterMs(response: Response): number | null {
  const h = response.headers.get("Retry-After");
  if (!h) return null;
  const sec = Number(h);
  if (Number.isFinite(sec)) return sec * 1000;
  const d = Date.parse(h);
  if (!Number.isNaN(d)) return Math.max(0, d - Date.now());
  return null;
}

// ---------------------------------------------------------------------------
// Centralized fetch: timeout, retry, backoff, 429 handling
// ---------------------------------------------------------------------------

async function fetchJsonWithRetry<T>(
  url: string,
  label: string,
  options: {
    timeoutMs: number;
    signal?: AbortSignal;
    validate: (json: unknown) => T;
  }
): Promise<T> {
  const { timeoutMs, signal, validate } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const composite = composeAbortSignals(signal, controller.signal);
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: composite,
      });

      if (response.status === 429) {
        const waitMs =
          parseRetryAfterMs(response) ??
          BASE_BACKOFF_MS * 2 ** attempt + Math.floor(Math.random() * 200);
        logWarn(`${label}: HTTP 429, backing off ${waitMs}ms (attempt ${attempt + 1})`);
        clearTimeout(t);
        await sleep(waitMs, signal);
        continue;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `${label}: HTTP ${response.status} ${response.statusText} ${text.slice(0, 200)}`
        );
      }

      const rawText = await response.text();
      let json: unknown;
      try {
        json = JSON.parse(rawText) as unknown;
      } catch {
        throw new Error(`${label}: invalid JSON body`);
      }

      const parsed = validate(json);
      clearTimeout(t);
      return parsed;
    } catch (e) {
      clearTimeout(t);
      lastError = e;
      const retriable =
        e instanceof Error &&
        (e.name === "AbortError" ||
          e.message.includes("fetch") ||
          e.message.includes("HTTP 5"));

      if (attempt < MAX_ATTEMPTS - 1 && (retriable || e instanceof TypeError)) {
        const delay = BASE_BACKOFF_MS * 2 ** attempt + Math.floor(Math.random() * 150);
        logWarn(`${label}: retry after error (${String(e)}), wait ${delay}ms`);
        await sleep(delay, signal);
        continue;
      }
      break;
    }
  }

  logError(`${label}: exhausted retries`, lastError);
  throw lastError instanceof Error
    ? lastError
    : new Error(`${label}: ${String(lastError)}`);
}

function composeAbortSignals(
  a: AbortSignal | undefined,
  b: AbortSignal
): AbortSignal {
  if (!a) return b;
  if (a.aborted) return a;
  const out = new AbortController();
  const stop = () => out.abort();
  a.addEventListener("abort", stop);
  b.addEventListener("abort", stop);
  return out.signal;
}

function logWarn(message: string): void {
  console.warn(`${LOG_PREFIX} ${message}`);
}

function logError(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.error(`${LOG_PREFIX} ${message}`, detail);
  } else {
    console.error(`${LOG_PREFIX} ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Validators (Twelve Data + Frankfurter forex)
// ---------------------------------------------------------------------------

function validateTwelveDataPrice(json: unknown, label: string): number {
  if (!json || typeof json !== "object") {
    throw new Error(`${label}: expected object`);
  }
  const o = json as Record<string, unknown>;
  if (o.status === "error" || o.code != null) {
    const msg =
      typeof o.message === "string"
        ? o.message
        : typeof o.code === "number"
          ? `code ${o.code}`
          : "API error";
    throw new Error(`${label}: Twelve Data ${msg}`);
  }
  const priceRaw = o.price;
  const n =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number(priceRaw)
        : NaN;
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${label}: missing or invalid price`);
  }
  return n;
}

function validateYahooUsdSpot(json: unknown, label: string): number {
  if (!json || typeof json !== "object") {
    throw new Error(`${label}: expected object`);
  }
  const chart = (json as Record<string, unknown>).chart as
    | { result?: { meta?: { regularMarketPrice?: number } }[] }
    | undefined;
  const result = chart?.result?.[0];
  const price = result?.meta?.regularMarketPrice;
  const n = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${label}: missing regularMarketPrice`);
  }
  return n;
}

function validateUsdInr(json: unknown): number {
  if (!json || typeof json !== "object") {
    throw new Error("forex: expected object");
  }
  const o = json as Record<string, unknown>;
  const rates = o.rates;
  if (!rates || typeof rates !== "object") {
    throw new Error("forex: missing rates");
  }
  const r = (rates as Record<string, unknown>).INR;
  const n = typeof r === "number" ? r : typeof r === "string" ? Number(r) : NaN;
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("forex: invalid INR rate");
  }
  return n;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function roundInr(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

// ---------------------------------------------------------------------------
// Cached upstream fetches
// ---------------------------------------------------------------------------

function twelvePriceUrl(symbol: string, apiKey: string): string {
  const u = new URL(`${TWELVE_DATA_BASE}/price`);
  u.searchParams.set("symbol", symbol);
  u.searchParams.set("apikey", apiKey);
  return u.toString();
}

function resolveApiKey(explicit?: string): string | null {
  const raw =
    explicit ??
    (typeof process !== "undefined"
      ? process.env.TWELVEDATA_KEY ?? process.env.TWELVE_DATA_API_KEY
      : undefined);
  const k = raw?.trim() ?? "";
  if (!k || k.toLowerCase() === "demo") {
    return null;
  }
  return k;
}

async function fetchUsdInrCached(
  timeoutMs: number,
  signal?: AbortSignal
): Promise<number> {
  const key = "engine:usd-inr:frankfurter";
  return getOrCompute(key, CACHE_TTL_MS, () =>
    fetchJsonWithRetry(FOREX_URL, "USD/INR", {
      timeoutMs,
      signal,
      validate: validateUsdInr,
    })
  );
}

type FxBundleCache = { rates: Record<CurrencyCode, number>; asOf: string };

async function fetchFxBundleCached(): Promise<FxBundleCache | null> {
  return getOrCompute("engine:fx:usd-bundle", CACHE_TTL_MS, async () => {
    const r = await fetchUsdFxRates();
    if (!r) return null;
    return { rates: r.rates, asOf: r.asOf };
  });
}

async function fetchTwelveUsdPriceCached(
  symbol: string,
  apiKey: string,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<number> {
  const key = `engine:td:${symbol}`;
  const url = twelvePriceUrl(symbol, apiKey);
  return getOrCompute(key, CACHE_TTL_MS, () =>
    fetchJsonWithRetry(url, `TwelveData ${symbol}`, {
      timeoutMs,
      signal,
      validate: (j) => validateTwelveDataPrice(j, symbol),
    })
  );
}

async function fetchYahooUsdSpotCached(
  yahooTicker: string,
  label: string,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<number> {
  const cacheKey = `engine:yahoo:${yahooTicker}`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    yahooTicker
  )}?interval=1d&range=5d`;
  return getOrCompute(cacheKey, CACHE_TTL_MS, () =>
    fetchJsonWithRetry(url, `Yahoo ${label}`, {
      timeoutMs,
      signal,
      validate: (j) => validateYahooUsdSpot(j, label),
    })
  );
}

// ---------------------------------------------------------------------------
// Conversions
// ---------------------------------------------------------------------------

function buildCommodityPrices(
  usdInr: number,
  goldUsdOz: number,
  silverUsdOz: number,
  crudeUsdBbl: number,
  gasUsdMmbtu: number
): CommodityPrices {
  const goldInrPerGram =
    (goldUsdOz * usdInr) / TROY_OUNCES_TO_GRAMS;
  const base24 = goldInrPerGram;

  const silverInrPerGram =
    (silverUsdOz * usdInr) / TROY_OUNCES_TO_GRAMS;

  const oilInrBarrel = crudeUsdBbl * usdInr;
  const oilInrLitre = oilInrBarrel / BARREL_TO_LITRES;

  const gasInrMmbtu = gasUsdMmbtu * usdInr;

  const g24PerGram = roundInr(base24, 2);
  return {
    gold: {
      "24k": g24PerGram,
      "22k": roundInr(base24 * GOLD_22K_FACTOR, 2),
      "18k": roundInr(base24 * GOLD_18K_FACTOR, 2),
      per10Gram: roundInr(base24 * 10, 2),
      per100Gram: roundInr(base24 * 100, 2),
      per1Kg: roundInr(base24 * 1000, 2),
    },
    silver: {
      perGram: roundInr(silverInrPerGram, 4),
      perKg: roundInr(silverInrPerGram * 1000, 2),
    },
    crudeOil: {
      perBarrel: roundInr(oilInrBarrel, 2),
      perLitre: roundInr(oilInrLitre, 4),
    },
    naturalGas: {
      pricePerMMBtu: roundInr(gasInrMmbtu, 4),
    },
    agriculture: { ...AGRICULTURE_REFERENCE_INR_PER_QUINTAL },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches live USD quotes and USD/INR, converts to Indian formats, and appends
 * static agriculture reference (₹/quintal). Results and upstream calls are cached for 5 minutes.
 */
export async function getIndianCommodityPrices(
  options?: GetIndianCommodityPricesOptions
): Promise<IndianCommodityResponse> {
  const timestamp = Date.now();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const apiKey = resolveApiKey(options?.apiKey);
  const quoteSource: "twelve" | "yahoo" = apiKey ? "twelve" : "yahoo";

  if (!apiKey) {
    logWarn(
      "TWELVEDATA_KEY not set (or set to 'demo'); using Yahoo chart spot for USD legs. Set a free key at https://twelvedata.com/apikey for Twelve Data /price quotes."
    );
  }

  try {
    const signal = options?.signal;

    const quotesPromise = apiKey
      ? Promise.all([
          fetchTwelveUsdPriceCached(SYMBOLS.gold, apiKey, timeoutMs, signal),
          fetchTwelveUsdPriceCached(SYMBOLS.silver, apiKey, timeoutMs, signal),
          fetchTwelveUsdPriceCached(SYMBOLS.crudeOil, apiKey, timeoutMs, signal),
          fetchTwelveUsdPriceCached(SYMBOLS.naturalGas, apiKey, timeoutMs, signal),
        ])
      : Promise.all([
          fetchYahooUsdSpotCached(
            YAHOO_USD_TICKERS.gold,
            "gold",
            timeoutMs,
            signal
          ),
          fetchYahooUsdSpotCached(
            YAHOO_USD_TICKERS.silver,
            "silver",
            timeoutMs,
            signal
          ),
          fetchYahooUsdSpotCached(
            YAHOO_USD_TICKERS.crudeOil,
            "crudeOil",
            timeoutMs,
            signal
          ),
          fetchYahooUsdSpotCached(
            YAHOO_USD_TICKERS.naturalGas,
            "naturalGas",
            timeoutMs,
            signal
          ),
        ]);

    const [fxBundle, [goldUsd, silverUsd, crudeUsd, gasUsd]] = await Promise.all([
      fetchFxBundleCached(),
      quotesPromise,
    ]);

    let usdInr = fxBundle?.rates.INR;
    if (!usdInr || !Number.isFinite(usdInr) || usdInr <= 0) {
      usdInr = await fetchUsdInrCached(timeoutMs, signal);
    }

    const fxOut: Partial<Record<CurrencyCode, number>> | null = fxBundle
      ? { ...fxBundle.rates }
      : { USD: 1, INR: usdInr };

    let data: CommodityPrices;
    try {
      data = buildCommodityPrices(
        usdInr,
        goldUsd,
        silverUsd,
        crudeUsd,
        gasUsd
      );
    } catch (convErr) {
      logError("conversion failed", convErr);
      return {
        success: false,
        timestamp,
        error:
          convErr instanceof Error ? convErr.message : "Conversion error",
        code: "CONVERSION",
      };
    }

    return {
      success: true,
      timestamp,
      data,
      quoteSource,
      fx: fxOut,
      fxAsOf: fxBundle?.asOf ?? null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logError("getIndianCommodityPrices failed", e);
    return {
      success: false,
      timestamp,
      error: message,
      code: "UPSTREAM",
    };
  }
}

/**
 * Re-export energy slice type alignment helper for consumers that split energy.
 */
export function toEnergyPrices(data: CommodityPrices): EnergyPrices {
  return {
    crudeOil: data.crudeOil,
    naturalGas: data.naturalGas,
  };
}
