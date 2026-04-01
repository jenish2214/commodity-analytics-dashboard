import {
  annualizeDailyVol,
  riskIndexFromAnnualVol,
  rollingLogReturnVol,
} from "@/services/analytics/volatility";
import { opportunityScanFromCloses } from "@/services/analytics/scanner";
import { crossCommoditySpreads } from "@/services/analytics/spreads";
import { sectorRotationFromRows } from "@/services/analytics/rotation";
import { seasonalityHintFromSeries } from "@/services/analytics/seasonality";
import { fetchUsdFxRates } from "@/services/forex";
import type {
  CommodityAnalytics,
  CurrencyCode,
  MarketRow,
  SeasonalityHint,
} from "@/types/models";
import { COMMODITY_DEFINITIONS, type CommodityDefinition } from "./definitions";

const YAHOO_CHART_BASE =
  "https://query1.finance.yahoo.com/v8/finance/chart";

/** Daily history window for vol, RSI, and coarse seasonality */
const QUOTE_RANGE = "2y";
const QUOTE_INTERVAL = "1d";

export type CommodityMarketPayload = {
  market: MarketRow[];
  summary: {
    portfolioValue: number;
    dailyPnl: number;
    topCommodity: string;
    marketSentiment: "Bullish" | "Bearish" | "Neutral";
  };
  analytics: CommodityAnalytics;
  fetchedAt: string;
  fx: Partial<Record<CurrencyCode, number>> | null;
  fxAsOf: string | null;
  fxError: string | null;
};

type FetchPiece = {
  row: MarketRow | null;
  seasonality: SeasonalityHint | null;
};

function formatVolume(volume: number): string {
  try {
    if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(1)}B`;
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
    return volume.toString();
  } catch {
    return "—";
  }
}

const CAP_MULTIPLIER: Record<string, number> = {
  Gold: 14_000_000_000_000,
  Silver: 1_600_000_000_000,
  "WTI Crude": 3_800_000_000_000,
  "Brent Crude": 3_600_000_000_000,
  "Natural Gas": 610_000_000_000,
  Copper: 320_000_000_000,
  Platinum: 180_000_000_000,
  Wheat: 120_000_000_000,
  "Rough Rice": 45_000_000_000,
  Corn: 200_000_000_000,
  Soybeans: 180_000_000_000,
  Coffee: 55_000_000_000,
  Sugar: 40_000_000_000,
};

function formatMarketCap(commodity: string, price: number): string {
  try {
    const cap =
      (CAP_MULTIPLIER[commodity] ?? 1_000_000_000_000) * (price / 100);
    return formatVolume(cap);
  } catch {
    return "—";
  }
}

function getSignal(changePct: number): "BUY" | "SELL" | "HOLD" {
  if (changePct > 1) return "BUY";
  if (changePct < -1) return "SELL";
  return "HOLD";
}

async function fetchCommodityPiece(
  commodity: CommodityDefinition
): Promise<FetchPiece> {
  try {
    const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(
      commodity.ticker
    )}?interval=${QUOTE_INTERVAL}&range=${QUOTE_RANGE}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${commodity.name}`);
    }

    const json = (await res.json()) as {
      chart?: { result?: Array<Record<string, unknown>> };
    };

    if (!json.chart?.result?.[0]) {
      throw new Error(`No data for ${commodity.name}`);
    }

    const result = json.chart.result[0] as {
      timestamp?: number[];
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        regularMarketVolume?: number;
      };
      indicators?: { quote?: Array<{ close?: (number | null)[] }> };
    };

    const meta = result.meta ?? {};
    const tsRaw = result.timestamp ?? [];
    const closesRaw =
      result.indicators?.quote?.[0]?.close ?? ([] as (number | null)[]);

    const alignedT: number[] = [];
    const closes: number[] = [];
    for (let i = 0; i < closesRaw.length; i++) {
      const c = closesRaw[i];
      const t = tsRaw[i];
      if (c != null && Number.isFinite(c) && typeof t === "number") {
        alignedT.push(t);
        closes.push(c);
      }
    }

    const prevRaw =
      closes.length >= 2
        ? closes[closes.length - 2]!
        : meta.chartPreviousClose;
    const current = meta.regularMarketPrice as number;
    if (!Number.isFinite(current)) {
      throw new Error(`No spot for ${commodity.name}`);
    }

    const prevValid =
      typeof prevRaw === "number" &&
      Number.isFinite(prevRaw) &&
      prevRaw > 0
        ? prevRaw
        : current;
    const change = current - prevValid;
    const changePct = prevValid !== 0 ? (change / prevValid) * 100 : 0;

    const priceUsd = parseFloat(Number(current).toFixed(4));

    const dailySigma7 = rollingLogReturnVol(closes, 7);
    const dailySigma30 = rollingLogReturnVol(closes, 30);
    const vol7 = annualizeDailyVol(dailySigma7);
    const vol30 = annualizeDailyVol(dailySigma30);

    const spark =
      closes.length > 0 ? closes.slice(Math.max(0, closes.length - 14)) : [];

    const scan = opportunityScanFromCloses(closes);

    const seasonality =
      closes.length > 0
        ? seasonalityHintFromSeries(
            commodity.name,
            commodity.id,
            alignedT,
            closes
          )
        : seasonalityHintFromSeries(commodity.name, commodity.id, [], []);

    const row: MarketRow = {
      id: commodity.id,
      commodity: commodity.name,
      symbol: commodity.id,
      priceUsd,
      price: priceUsd,
      unit: commodity.unit,
      change24h: parseFloat(changePct.toFixed(2)),
      changeAbsUsd: parseFloat(change.toFixed(4)),
      volume: formatVolume(meta.regularMarketVolume || 0),
      marketCap: formatMarketCap(commodity.name, priceUsd),
      signal: getSignal(changePct),
      sparkline: spark.length > 1 ? spark : undefined,
      volatility7dAnn: vol7,
      volatility30dAnn: vol30,
      riskIndex: riskIndexFromAnnualVol(vol30),
      sector: commodity.sector,
      rsi14: scan.rsi14,
      opportunityTags: scan.tags,
      opportunityScore: scan.score,
    };

    return { row, seasonality };
  } catch (e) {
    console.error(`Commodity row ${commodity.id}:`, e);
    return { row: null, seasonality: null };
  }
}

function breadthAndSentiment(rows: MarketRow[]): {
  breadth: CommodityAnalytics["marketBreadth"];
  sentiment: CommodityAnalytics["sentiment"];
} {
  let adv = 0;
  let dec = 0;
  let neu = 0;
  const eps = 0.02;
  for (const r of rows) {
    if (r.change24h > eps) adv++;
    else if (r.change24h < -eps) dec++;
    else neu++;
  }
  const breadth = { advancers: adv, decliners: dec, neutral: neu };
  let sentiment: CommodityAnalytics["sentiment"] = "Neutral";
  if (adv > dec + 1) sentiment = "Bullish";
  else if (dec > adv + 1) sentiment = "Bearish";
  return { breadth, sentiment };
}

function buildAnalytics(
  rows: MarketRow[],
  seasonalityHints: SeasonalityHint[]
): CommodityAnalytics {
  const { breadth, sentiment } = breadthAndSentiment(rows);
  return {
    sectorRotation: sectorRotationFromRows(rows),
    spreads: crossCommoditySpreads(rows),
    marketBreadth: breadth,
    sentiment,
    seasonalityHints: seasonalityHints.filter(
      (h): h is SeasonalityHint => h != null && h.strongestMonths !== "—"
    ),
  };
}

/**
 * Fetches all definitions, FX, builds rows + desk analytics. Single entry for `/api/commodities`.
 */
export async function buildCommodityMarketPayload(): Promise<CommodityMarketPayload> {
  const [fxResult, ...pieces] = await Promise.all([
    fetchUsdFxRates(),
    ...COMMODITY_DEFINITIONS.map((c) => fetchCommodityPiece(c)),
  ]);

  const fxUsd: Partial<Record<CurrencyCode, number>> | null = fxResult
    ? fxResult.rates
    : null;

  const rows: MarketRow[] = [];
  const hints: SeasonalityHint[] = [];
  for (const p of pieces) {
    if (p.row) {
      rows.push(p.row);
    }
    if (p.seasonality) {
      hints.push(p.seasonality);
    }
  }

  const analytics = buildAnalytics(rows, hints);

  const summaryTop =
    rows.reduce(
      (top, item) =>
        item.change24h > (top?.change24h ?? -Infinity) ? item : top,
      rows[0] ?? null
    )?.commodity ?? "Gold";

  const payload: CommodityMarketPayload = {
    market: rows,
    summary: {
      portfolioValue: rows.reduce((sum, item) => sum + item.priceUsd * 100, 0),
      dailyPnl: rows.reduce((sum, item) => sum + item.change24h * 100, 0),
      topCommodity: summaryTop,
      marketSentiment: analytics.sentiment,
    },
    analytics,
    fetchedAt: new Date().toISOString(),
    fx: fxUsd,
    fxAsOf: fxResult?.asOf ?? null,
    fxError: fxResult
      ? null
      : "FX rates unavailable; prices shown in USD until refreshed.",
  };

  return payload;
}
