/**
 * Financial Data Engine — unified server-side aggregation for Next.js 14 App Router.
 * Single file: fetch utilities, caching, rate limiting, and provider integrations.
 *
 * Env: FINNHUB_KEY, TWELVEDATA_KEY, ALPHAVANTAGE_KEY, UPSTOX_TOKEN
 * CoinGecko: public API (no key required for listed endpoints).
 *
 * Indian INR commodity stack: `getIndianCommodityPrices` (Twelve Data / Yahoo + Frankfurter FX).
 * See `src/lib/indianCommodityPricingEngine.ts`.
 */

import { getIndianCommodityPrices } from "./indianCommodityPricingEngine";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 800;
const QUEUE_MAX_CONCURRENT = 3;

const LOG_PREFIX = "[FinancialDataEngine]";

function env(name: string): string {
  const v = typeof process !== "undefined" ? process.env[name] : undefined;
  return (v ?? "").trim();
}

// -----------------------------------------------------------------------------
// Unified API response
// -----------------------------------------------------------------------------

export type UnifiedSuccess<T> = { success: true; data: T };
export type UnifiedFailure = {
  success: false;
  error: string;
  code?: string;
  status?: number;
};
export type UnifiedResponse<T> = UnifiedSuccess<T> | UnifiedFailure;

function ok<T>(data: T): UnifiedSuccess<T> {
  return { success: true, data };
}

function fail(error: string, code?: string, status?: number): UnifiedFailure {
  return { success: false, error, code, status };
}

// -----------------------------------------------------------------------------
// Logging
// -----------------------------------------------------------------------------

function logDebug(message: string, extra?: Record<string, unknown>): void {
  if (extra) console.info(LOG_PREFIX, message, extra);
  else console.info(LOG_PREFIX, message);
}

function logError(message: string, extra?: Record<string, unknown>): void {
  if (extra) console.error(LOG_PREFIX, message, extra);
  else console.error(LOG_PREFIX, message);
}

// -----------------------------------------------------------------------------
// In-memory cache + in-flight deduplication
// -----------------------------------------------------------------------------

type CacheEntry<T> = { value: T; expiresAt: number };

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function cacheKey(parts: string[]): string {
  return parts.join("|");
}

function cacheGet<T>(key: string): T | null {
  const hit = memoryCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return hit.value as T;
}

function cacheSet<T>(key: string, value: T, ttlMs: number = CACHE_TTL_MS): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

// -----------------------------------------------------------------------------
// Request queue (limits concurrent outbound calls)
// -----------------------------------------------------------------------------

class AsyncQueue {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly concurrency: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.concurrency) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      const next = this.waiting.shift();
      if (next) next();
    }
  }
}

const requestQueue = new AsyncQueue(QUEUE_MAX_CONCURRENT);

// -----------------------------------------------------------------------------
// Core fetch: timeout, retries, exponential backoff, 429 handling
// -----------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function rawFetch(
  url: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const timeoutMs = init?.timeoutMs ?? FETCH_TIMEOUT_MS;
  const { timeoutMs: _, ...rest } = init ?? {};
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function resilientFetch(
  url: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  return requestQueue.run(async () => {
    let attempt = 0;
    let lastErr: Error | null = null;

    while (attempt < MAX_RETRIES) {
      try {
        const res = await rawFetch(url, init);
        if (res.status === 429) {
          const ra = res.headers.get("Retry-After");
          const waitSec = ra ? parseInt(ra, 10) : NaN;
          const backoff = Number.isFinite(waitSec)
            ? waitSec * 1000
            : BASE_BACKOFF_MS * Math.pow(2, attempt);
          logError("429 rate limited; backing off", { url, backoffMs: backoff, attempt });
          await sleep(backoff);
          attempt++;
          continue;
        }
        if (res.status >= 500 && res.status < 600) {
          const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
          logError("5xx from provider; retrying", { url, status: res.status, attempt, backoffMs: backoff });
          await sleep(backoff);
          attempt++;
          continue;
        }
        return res;
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
        logError("fetch failed; retrying", { url, attempt, message: lastErr.message, backoffMs: backoff });
        await sleep(backoff);
        attempt++;
      }
    }

    throw lastErr ?? new Error("fetch failed after retries");
  });
}

async function fetchJson<T>(
  url: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<{ response: Response; json: T | null }> {
  const response = await resilientFetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers as Record<string, string>),
    },
  });
  let json: T | null = null;
  const text = await response.text();
  try {
    json = text ? (JSON.parse(text) as T) : null;
  } catch {
    logError("JSON parse failed", { url, snippet: text.slice(0, 200) });
  }
  return { response, json };
}

// -----------------------------------------------------------------------------
// Types — domain models
// -----------------------------------------------------------------------------

export interface StockQuoteNormalized {
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface CompanyProfileNormalized {
  companyName: string;
  marketCap: number;
  industry: string;
  logo: string;
  exchange: string;
}

export interface FinnhubNewsItem {
  id: number;
  headline: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
}

export interface ChartPoint {
  timestamp: string;
  value: number;
}

export interface CryptoSummary {
  id: string;
  symbol: string;
  price: number;
  marketCap: number;
  change24h: number;
  volume: number;
}

export interface CryptoDetailsNormalized extends CryptoSummary {
  name: string;
  description?: string;
}

export interface IndianQuoteNormalized {
  lastTradedPrice: number;
  bid: number;
  ask: number;
  volume: number;
  high: number;
  low: number;
}

export interface IndianCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MacroSeriesPoint {
  date: string;
  value: number;
}

// -----------------------------------------------------------------------------
// Finnhub
// -----------------------------------------------------------------------------

type FinnhubQuoteRaw = {
  c?: number;
  d?: number;
  dp?: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
};

type FinnhubProfileRaw = {
  name?: string;
  marketCapitalization?: number;
  finnhubIndustry?: string;
  logo?: string;
  exchange?: string;
};

export async function getStockQuote(symbol: string): Promise<UnifiedResponse<StockQuoteNormalized>> {
  const key = env("FINNHUB_KEY");
  if (!key) return fail("FINNHUB_KEY is not set", "CONFIG");
  const sym = symbol.trim().toUpperCase();
  const ck = cacheKey(["fh", "quote", sym]);
  const cached = cacheGet<StockQuoteNormalized>(ck);
  if (cached) return ok(cached);

  return dedupe(ck, async () => {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      logDebug("Finnhub quote", { symbol: sym });
      const { response, json } = await fetchJson<FinnhubQuoteRaw>(url);
      if (!response.ok)
        return fail(`Finnhub quote HTTP ${response.status}`, "FINNHUB", response.status);
      const q = json;
      if (!q || q.c == null) return fail("Invalid Finnhub quote response", "FINNHUB");
      const out: StockQuoteNormalized = {
        price: q.c,
        change: q.d ?? 0,
        percentChange: q.dp ?? 0,
        high: q.h ?? q.c,
        low: q.l ?? q.c,
        open: q.o ?? q.c,
        previousClose: q.pc ?? q.c,
      };
      cacheSet(ck, out);
      return ok(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logError("getStockQuote", { msg, symbol: sym });
      return fail(msg, "FINNHUB");
    }
  });
}

export async function getCompanyProfile(symbol: string): Promise<UnifiedResponse<CompanyProfileNormalized>> {
  const key = env("FINNHUB_KEY");
  if (!key) return fail("FINNHUB_KEY is not set", "CONFIG");
  const sym = symbol.trim().toUpperCase();
  const ck = cacheKey(["fh", "profile", sym]);
  const cached = cacheGet<CompanyProfileNormalized>(ck);
  if (cached) return ok(cached);

  return dedupe(ck, async () => {
    try {
      const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      logDebug("Finnhub profile", { symbol: sym });
      const { response, json } = await fetchJson<FinnhubProfileRaw>(url);
      if (!response.ok)
        return fail(`Finnhub profile HTTP ${response.status}`, "FINNHUB", response.status);
      const p = json;
      if (!p) return fail("Invalid Finnhub profile response", "FINNHUB");
      const out: CompanyProfileNormalized = {
        companyName: p.name ?? sym,
        marketCap: p.marketCapitalization ?? 0,
        industry: p.finnhubIndustry ?? "",
        logo: p.logo ?? "",
        exchange: p.exchange ?? "",
      };
      cacheSet(ck, out);
      return ok(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logError("getCompanyProfile", { msg, symbol: sym });
      return fail(msg, "FINNHUB");
    }
  });
}

export async function getMarketNews(): Promise<UnifiedResponse<FinnhubNewsItem[]>> {
  const key = env("FINNHUB_KEY");
  if (!key) return fail("FINNHUB_KEY is not set", "CONFIG");
  const ck = cacheKey(["fh", "news", "general"]);
  const cached = cacheGet<FinnhubNewsItem[]>(ck);
  if (cached) return ok(cached);

  return dedupe(ck, async () => {
    try {
      const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(key)}`;
      logDebug("Finnhub news");
      const { response, json } = await fetchJson<FinnhubNewsItem[]>(url);
      if (!response.ok)
        return fail(`Finnhub news HTTP ${response.status}`, "FINNHUB", response.status);
      const arr = Array.isArray(json) ? json : [];
      cacheSet(ck, arr, CACHE_TTL_MS);
      return ok(arr);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logError("getMarketNews", { msg });
      return fail(msg, "FINNHUB");
    }
  });
}

// -----------------------------------------------------------------------------
// Twelve Data — technicals
// -----------------------------------------------------------------------------

type TwelveValuesRow = Record<string, string>;

type TwelveMetaResponse = {
  values?: TwelveValuesRow[];
  meta?: Record<string, string>;
};

function twelveChartSeries(
  raw: TwelveMetaResponse | null,
  valueKeys: string[]
): ChartPoint[] {
  const rows = raw?.values;
  if (!rows?.length) return [];
  return rows
    .map((r) => {
      const ts = r.datetime ?? r["time"] ?? "";
      let num = NaN;
      for (const k of valueKeys) {
        if (r[k] != null && r[k] !== "") {
          num = parseFloat(r[k]);
          break;
        }
      }
      return { timestamp: ts, value: num };
    })
    .filter((p) => p.timestamp && Number.isFinite(p.value))
    .reverse();
}

export async function getRSI(symbol: string): Promise<UnifiedResponse<ChartPoint[]>> {
  const api = env("TWELVEDATA_KEY");
  if (!api) return fail("TWELVEDATA_KEY is not set", "CONFIG");
  const sym = symbol.trim().toUpperCase();
  const ck = cacheKey(["td", "rsi", sym]);
  const cached = cacheGet<ChartPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url =
        `https://api.twelvedata.com/rsi?symbol=${encodeURIComponent(sym)}&interval=1day&apikey=${encodeURIComponent(api)}`;
      const { response, json } = await fetchJson<TwelveMetaResponse>(url);
      if (!response.ok) return fail(`TwelveData RSI HTTP ${response.status}`, "TWELVEDATA", response.status);
      const pts = twelveChartSeries(json, ["rsi"]);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getRSI", { e: String(e), symbol: sym });
      return fail(e instanceof Error ? e.message : String(e), "TWELVEDATA");
    }
  });
}

export async function getMACD(symbol: string): Promise<UnifiedResponse<ChartPoint[]>> {
  const api = env("TWELVEDATA_KEY");
  if (!api) return fail("TWELVEDATA_KEY is not set", "CONFIG");
  const sym = symbol.trim().toUpperCase();
  const ck = cacheKey(["td", "macd", sym]);
  const cached = cacheGet<ChartPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url =
        `https://api.twelvedata.com/macd?symbol=${encodeURIComponent(sym)}&interval=1day&apikey=${encodeURIComponent(api)}`;
      const { response, json } = await fetchJson<TwelveMetaResponse>(url);
      if (!response.ok) return fail(`TwelveData MACD HTTP ${response.status}`, "TWELVEDATA", response.status);
      const pts = twelveChartSeries(json, ["macd", "macd_macd", "value"]);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getMACD", { e: String(e), symbol: sym });
      return fail(e instanceof Error ? e.message : String(e), "TWELVEDATA");
    }
  });
}

export async function getSMA(symbol: string): Promise<UnifiedResponse<ChartPoint[]>> {
  const api = env("TWELVEDATA_KEY");
  if (!api) return fail("TWELVEDATA_KEY is not set", "CONFIG");
  const sym = symbol.trim().toUpperCase();
  const ck = cacheKey(["td", "sma50", sym]);
  const cached = cacheGet<ChartPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url =
        `https://api.twelvedata.com/sma?symbol=${encodeURIComponent(sym)}&interval=1day&time_period=50&apikey=${encodeURIComponent(api)}`;
      const { response, json } = await fetchJson<TwelveMetaResponse>(url);
      if (!response.ok) return fail(`TwelveData SMA HTTP ${response.status}`, "TWELVEDATA", response.status);
      const pts = twelveChartSeries(json, ["sma"]);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getSMA", { e: String(e), symbol: sym });
      return fail(e instanceof Error ? e.message : String(e), "TWELVEDATA");
    }
  });
}

export async function getBollingerBands(symbol: string): Promise<UnifiedResponse<ChartPoint[]>> {
  const api = env("TWELVEDATA_KEY");
  if (!api) return fail("TWELVEDATA_KEY is not set", "CONFIG");
  const sym = symbol.trim().toUpperCase();
  const ck = cacheKey(["td", "bb", sym]);
  const cached = cacheGet<ChartPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url =
        `https://api.twelvedata.com/bbands?symbol=${encodeURIComponent(sym)}&interval=1day&apikey=${encodeURIComponent(api)}`;
      const { response, json } = await fetchJson<TwelveMetaResponse>(url);
      if (!response.ok) return fail(`TwelveData BB HTTP ${response.status}`, "TWELVEDATA", response.status);
      const pts = twelveChartSeries(json, ["middle_band", "upper_band", "lower_band", "value"]);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getBollingerBands", { e: String(e), symbol: sym });
      return fail(e instanceof Error ? e.message : String(e), "TWELVEDATA");
    }
  });
}

// -----------------------------------------------------------------------------
// CoinGecko (no API key)
// -----------------------------------------------------------------------------

type CoinMarketRow = {
  id: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h?: number;
  total_volume: number;
};

function normalizeCoinRow(r: CoinMarketRow): CryptoSummary {
  return {
    id: r.id,
    symbol: (r.symbol ?? "").toUpperCase(),
    price: r.current_price ?? 0,
    marketCap: r.market_cap ?? 0,
    change24h: r.price_change_percentage_24h ?? 0,
    volume: r.total_volume ?? 0,
  };
}

export async function getTopCrypto(): Promise<UnifiedResponse<CryptoSummary[]>> {
  const ck = cacheKey(["cg", "markets", "top50"]);
  const cached = cacheGet<CryptoSummary[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url =
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1";
      const { response, json } = await fetchJson<CoinMarketRow[]>(url);
      if (!response.ok)
        return fail(`CoinGecko markets HTTP ${response.status}`, "COINGECKO", response.status);
      const rows = Array.isArray(json) ? json.map(normalizeCoinRow) : [];
      cacheSet(ck, rows);
      return ok(rows);
    } catch (e) {
      logError("getTopCrypto", { e: String(e) });
      return fail(e instanceof Error ? e.message : String(e), "COINGECKO");
    }
  });
}

export async function getCryptoDetails(coin: string): Promise<UnifiedResponse<CryptoDetailsNormalized>> {
  const id = coin.trim().toLowerCase();
  const ck = cacheKey(["cg", "coin", id]);
  const cached = cacheGet<CryptoDetailsNormalized>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}`;
      const { response, json } = await fetchJson<{
        id: string;
        symbol: string;
        name: string;
        description?: { en?: string };
        market_data?: {
          current_price?: { usd?: number };
          market_cap?: { usd?: number };
          price_change_percentage_24h?: number;
          total_volume?: { usd?: number };
        };
      }>(url);
      if (!response.ok)
        return fail(`CoinGecko detail HTTP ${response.status}`, "COINGECKO", response.status);
      if (!json?.id) return fail("Coin not found", "COINGECKO", 404);
      const md = json.market_data;
      const out: CryptoDetailsNormalized = {
        id: json.id,
        symbol: (json.symbol ?? "").toUpperCase(),
        name: json.name,
        description: json.description?.en,
        price: md?.current_price?.usd ?? 0,
        marketCap: md?.market_cap?.usd ?? 0,
        change24h: md?.price_change_percentage_24h ?? 0,
        volume: md?.total_volume?.usd ?? 0,
      };
      cacheSet(ck, out);
      return ok(out);
    } catch (e) {
      logError("getCryptoDetails", { e: String(e), coin: id });
      return fail(e instanceof Error ? e.message : String(e), "COINGECKO");
    }
  });
}

export async function getTrendingCrypto(): Promise<
  UnifiedResponse<Array<{ id: string; symbol: string; name: string; price: number; marketCap: number; change24h: number; volume: number }>>
> {
  const ck = cacheKey(["cg", "trending"]);
  type TrendingOut = Array<{
    id: string;
    symbol: string;
    name: string;
    price: number;
    marketCap: number;
    change24h: number;
    volume: number;
  }>;
  const cached = cacheGet<TrendingOut>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = "https://api.coingecko.com/api/v3/search/trending";
      const { response, json } = await fetchJson<{
        coins?: Array<{ item: { id: string; symbol: string; name: string } }>;
      }>(url);
      if (!response.ok)
        return fail(`CoinGecko trending HTTP ${response.status}`, "COINGECKO", response.status);
      const coins = json?.coins ?? [];
      const base = coins.map((c) => ({
        id: c.item.id,
        symbol: (c.item.symbol ?? "").toUpperCase(),
        name: c.item.name ?? c.item.id,
        price: 0,
        marketCap: 0,
        change24h: 0,
        volume: 0,
      }));
      const enriched: TrendingOut = [];
      for (const b of base.slice(0, 15)) {
        const d = await getCryptoDetails(b.id);
        if (d.success) {
          enriched.push({
            id: d.data.id,
            symbol: d.data.symbol,
            name: d.data.name,
            price: d.data.price,
            marketCap: d.data.marketCap,
            change24h: d.data.change24h,
            volume: d.data.volume,
          });
        } else {
          enriched.push(b);
        }
      }
      cacheSet(ck, enriched, CACHE_TTL_MS);
      return ok(enriched);
    } catch (e) {
      logError("getTrendingCrypto", { e: String(e) });
      return fail(e instanceof Error ? e.message : String(e), "COINGECKO");
    }
  });
}

// -----------------------------------------------------------------------------
// Upstox (India)
// -----------------------------------------------------------------------------

export async function getIndianStockQuote(symbol: string): Promise<UnifiedResponse<IndianQuoteNormalized>> {
  const token = env("UPSTOX_TOKEN");
  if (!token) return fail("UPSTOX_TOKEN is not set", "CONFIG");
  const sym = symbol.trim();
  const ck = cacheKey(["ux", "ltp", sym]);
  const cached = cacheGet<IndianQuoteNormalized>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = `https://api.upstox.com/v2/market-quote/ltp?symbol=${encodeURIComponent(sym)}`;
      logDebug("Upstox LTP", { symbol: sym });
      const { response, json } = await fetchJson<Record<string, unknown>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        return fail(`Upstox LTP HTTP ${response.status}`, "UPSTOX", response.status);

      const data = json as {
        data?: Record<
          string,
          { last_price?: number; bid?: number; ask?: number; volume?: number; high?: number; low?: number }
        >;
      };
      const firstKey = Object.keys(data?.data ?? {})[0];
      const row = firstKey ? data?.data?.[firstKey] : undefined;
      const out: IndianQuoteNormalized = {
        lastTradedPrice: row?.last_price ?? 0,
        bid: row?.bid ?? 0,
        ask: row?.ask ?? 0,
        volume: row?.volume ?? 0,
        high: row?.high ?? 0,
        low: row?.low ?? 0,
      };
      cacheSet(ck, out);
      return ok(out);
    } catch (e) {
      logError("getIndianStockQuote", { e: String(e), symbol: sym });
      return fail(e instanceof Error ? e.message : String(e), "UPSTOX");
    }
  });
}

export async function getIndianHistorical(
  symbol: string,
  interval: string = "1"
): Promise<UnifiedResponse<IndianCandle[]>> {
  const token = env("UPSTOX_TOKEN");
  if (!token) return fail("UPSTOX_TOKEN is not set", "CONFIG");
  const sym = encodeURIComponent(symbol.trim());
  const ck = cacheKey(["ux", "ohlc", sym, interval]);
  const cached = cacheGet<IndianCandle[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = `https://api.upstox.com/v2/historical-candle/${sym}/day/${encodeURIComponent(interval)}`;
      const { response, json } = await fetchJson<{
        data?: { candles?: [string, number, number, number, number, number][];
        };
      }>(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok)
        return fail(`Upstox historical HTTP ${response.status}`, "UPSTOX", response.status);
      const candles = json?.data?.candles ?? [];
      const out: IndianCandle[] = candles.map((c) => ({
        timestamp: c[0],
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5] ?? 0,
      }));
      cacheSet(ck, out);
      return ok(out);
    } catch (e) {
      logError("getIndianHistorical", { e: String(e), symbol });
      return fail(e instanceof Error ? e.message : String(e), "UPSTOX");
    }
  });
}

// -----------------------------------------------------------------------------
// Alpha Vantage — macro
// -----------------------------------------------------------------------------

type AvMacroRaw = {
  data?: Array<{ date: string; value: string }>;
  Information?: string;
  Note?: string;
  "Error Message"?: string;
};

function avSeries(json: AvMacroRaw | null): MacroSeriesPoint[] {
  if (json?.Note?.includes("call frequency") || json?.["Error Message"]) {
    logError("Alpha Vantage throttle or error", { note: json?.Note, err: json?.["Error Message"] });
    return [];
  }
  const rows = json?.data;
  if (!rows?.length) return [];
  return rows
    .map((r) => ({ date: r.date, value: parseFloat(r.value) }))
    .filter((r) => r.date && Number.isFinite(r.value));
}

export async function getInflation(): Promise<UnifiedResponse<MacroSeriesPoint[]>> {
  const k = env("ALPHAVANTAGE_KEY");
  if (!k) return fail("ALPHAVANTAGE_KEY is not set", "CONFIG");
  const ck = cacheKey(["av", "inflation"]);
  const cached = cacheGet<MacroSeriesPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = `https://www.alphavantage.co/query?function=INFLATION&apikey=${encodeURIComponent(k)}`;
      const { response, json } = await fetchJson<AvMacroRaw>(url);
      if (!response.ok) return fail(`AlphaVantage HTTP ${response.status}`, "ALPHAVANTAGE", response.status);
      const pts = avSeries(json);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getInflation", { e: String(e) });
      return fail(e instanceof Error ? e.message : String(e), "ALPHAVANTAGE");
    }
  });
}

export async function getGDP(): Promise<UnifiedResponse<MacroSeriesPoint[]>> {
  const k = env("ALPHAVANTAGE_KEY");
  if (!k) return fail("ALPHAVANTAGE_KEY is not set", "CONFIG");
  const ck = cacheKey(["av", "gdp"]);
  const cached = cacheGet<MacroSeriesPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = `https://www.alphavantage.co/query?function=REAL_GDP&apikey=${encodeURIComponent(k)}`;
      const { response, json } = await fetchJson<AvMacroRaw>(url);
      if (!response.ok) return fail(`AlphaVantage HTTP ${response.status}`, "ALPHAVANTAGE", response.status);
      const pts = avSeries(json);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getGDP", { e: String(e) });
      return fail(e instanceof Error ? e.message : String(e), "ALPHAVANTAGE");
    }
  });
}

export async function getTreasuryYield(): Promise<UnifiedResponse<MacroSeriesPoint[]>> {
  const k = env("ALPHAVANTAGE_KEY");
  if (!k) return fail("ALPHAVANTAGE_KEY is not set", "CONFIG");
  const ck = cacheKey(["av", "tsy"]);
  const cached = cacheGet<MacroSeriesPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=monthly&apikey=${encodeURIComponent(k)}`;
      const { response, json } = await fetchJson<AvMacroRaw>(url);
      if (!response.ok) return fail(`AlphaVantage HTTP ${response.status}`, "ALPHAVANTAGE", response.status);
      const pts = avSeries(json);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getTreasuryYield", { e: String(e) });
      return fail(e instanceof Error ? e.message : String(e), "ALPHAVANTAGE");
    }
  });
}

export async function getUnemployment(): Promise<UnifiedResponse<MacroSeriesPoint[]>> {
  const k = env("ALPHAVANTAGE_KEY");
  if (!k) return fail("ALPHAVANTAGE_KEY is not set", "CONFIG");
  const ck = cacheKey(["av", "unemp"]);
  const cached = cacheGet<MacroSeriesPoint[]>(ck);
  if (cached) return ok(cached);
  return dedupe(ck, async () => {
    try {
      const url = `https://www.alphavantage.co/query?function=UNEMPLOYMENT&apikey=${encodeURIComponent(k)}`;
      const { response, json } = await fetchJson<AvMacroRaw>(url);
      if (!response.ok) return fail(`AlphaVantage HTTP ${response.status}`, "ALPHAVANTAGE", response.status);
      const pts = avSeries(json);
      cacheSet(ck, pts);
      return ok(pts);
    } catch (e) {
      logError("getUnemployment", { e: String(e) });
      return fail(e instanceof Error ? e.message : String(e), "ALPHAVANTAGE");
    }
  });
}

// -----------------------------------------------------------------------------
// Dashboard bundle — single call for key widgets
// -----------------------------------------------------------------------------

export async function getDashboardSnapshot(symbol: string): Promise<
  UnifiedResponse<{
    quote: StockQuoteNormalized | null;
    profile: CompanyProfileNormalized | null;
    rsi: ChartPoint[];
    macro: { inflation: MacroSeriesPoint[]; gdp: MacroSeriesPoint[] };
    cryptoTop: CryptoSummary[];
  }>
> {
  try {
    const [q, p, rsi, inf, gdp, top] = await Promise.all([
      getStockQuote(symbol),
      getCompanyProfile(symbol),
      getRSI(symbol),
      getInflation(),
      getGDP(),
      getTopCrypto(),
    ]);
    return ok({
      quote: q.success ? q.data : null,
      profile: p.success ? p.data : null,
      rsi: rsi.success ? rsi.data : [],
      macro: {
        inflation: inf.success ? inf.data : [],
        gdp: gdp.success ? gdp.data : [],
      },
      cryptoTop: top.success ? top.data.slice(0, 10) : [],
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), "BUNDLE");
  }
}

// Named export for apps that prefer a namespace
export const FinancialDataEngine = {
  getStockQuote,
  getCompanyProfile,
  getMarketNews,
  getRSI,
  getMACD,
  getSMA,
  getBollingerBands,
  getTopCrypto,
  getCryptoDetails,
  getTrendingCrypto,
  getIndianStockQuote,
  getIndianHistorical,
  getInflation,
  getGDP,
  getTreasuryYield,
  getUnemployment,
  getDashboardSnapshot,
  resilientFetch,
  getIndianCommodityPrices,
};

export type {
  AgriculturePrices,
  CommodityPrices as IndianCommodityPrices,
  GoldPriceFormat,
  IndianCommodityFailure,
  IndianCommodityResponse,
  IndianCommoditySuccess,
} from "./indianCommodityPricingEngine";
