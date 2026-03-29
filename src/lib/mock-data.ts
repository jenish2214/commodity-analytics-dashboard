import type {
  AiPrediction,
  AiTradingSignal,
  AllocationSlice,
  ChartPoint,
  CommodityKey,
  MarketRow,
  NewsArticle,
  PortfolioHolding,
  TimeRange,
} from "@/types/models";

const LABELS: Record<TimeRange, { count: number; formatter: (i: number) => string }> =
  {
    "1D": { count: 24, formatter: (i) => `${i}:00` },
    "1W": { count: 7, formatter: (i) => `D${i + 1}` },
    "1M": { count: 30, formatter: (i) => `Mar ${i + 1}` },
    "6M": { count: 26, formatter: (i) => `W${i + 1}` },
    "1Y": { count: 12, formatter: (i) => {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return months[i % 12];
    }},
  };

const BASE: Record<CommodityKey, number> = {
  gold: 2005,
  silver: 24.6,
  crudeOil: 78.4,
  naturalGas: 2.15,
  copper: 4.12,
};

export function buildVolumeSeries(
  symbol: CommodityKey,
  range: TimeRange
): { period: string; volume: number }[] {
  const priceSeries = buildChartSeries(symbol, range);
  return priceSeries.map((p, idx) => ({
    period: p.period,
    volume: Math.round(1_000_000 + idx * 12_000 + Math.sin(idx) * 50_000),
  }));
}

export function buildMovingAverage(
  symbol: CommodityKey,
  range: TimeRange,
  window: number
): ChartPoint[] {
  const pts = buildChartSeries(symbol, range);
  const out: ChartPoint[] = [];
  for (let i = 0; i < pts.length; i += 1) {
    const start = Math.max(0, i - window + 1);
    const slice = pts.slice(start, i + 1);
    const avg =
      slice.reduce((s, x) => s + x.price, 0) / slice.length;
    out.push({ period: pts[i].period, price: Math.round(avg * 100) / 100 });
  }
  return out;
}

export function buildChartSeries(
  symbol: CommodityKey,
  range: TimeRange
): ChartPoint[] {
  const cfg = LABELS[range];
  const base = BASE[symbol];
  const out: ChartPoint[] = [];
  for (let i = 0; i < cfg.count; i += 1) {
    const wave = Math.sin(i / 4) * (base * 0.012);
    const drift = i * (base * 0.0008);
    const noise = (Math.sin(i * 1.7) * 0.004 + 0.996) * base;
    const price = Math.max(
      base * 0.85,
      noise + wave + drift * (range === "1D" ? 0.2 : 1)
    );
    out.push({
      period: cfg.formatter(i),
      price: Math.round(price * 100) / 100,
    });
  }
  return out;
}

export const dashboardSummary = {
  portfolioValue: 245800,
  dailyPnl: 2340,
  topCommodity: "Gold",
  aiSentiment: "Bullish" as const,
};

export const marketRows: MarketRow[] = [
  {
    id: "m1",
    commodity: "Gold",
    symbol: "gold",
    price: 2005,
    change24h: 1.2,
    volume: "2.4B",
    marketCap: "11T",
    signal: "BUY",
  },
  {
    id: "m2",
    commodity: "Silver",
    symbol: "silver",
    price: 24.62,
    change24h: -0.4,
    volume: "1.1B",
    marketCap: "1.4T",
    signal: "HOLD",
  },
  {
    id: "m3",
    commodity: "Crude Oil",
    symbol: "crudeOil",
    price: 78.35,
    change24h: 2.1,
    volume: "4.8B",
    marketCap: "3.2T",
    signal: "BUY",
  },
  {
    id: "m4",
    commodity: "Natural Gas",
    symbol: "naturalGas",
    price: 2.14,
    change24h: -3.2,
    volume: "890M",
    marketCap: "540B",
    signal: "SELL",
  },
  {
    id: "m5",
    commodity: "Copper",
    symbol: "copper",
    price: 4.12,
    change24h: 0.6,
    volume: "620M",
    marketCap: "280B",
    signal: "HOLD",
  },
];

export const portfolioHoldings: PortfolioHolding[] = [
  {
    id: "h1",
    commodity: "Gold",
    symbol: "gold",
    quantity: 5,
    unit: "oz",
    averagePrice: 1900,
    currentPrice: 2000,
    profitLoss: 500,
  },
  {
    id: "h2",
    commodity: "Silver",
    symbol: "silver",
    quantity: 120,
    unit: "oz",
    averagePrice: 23.5,
    currentPrice: 24.6,
    profitLoss: 132,
  },
  {
    id: "h3",
    commodity: "Crude Oil",
    symbol: "crudeOil",
    quantity: 40,
    unit: "bbl",
    averagePrice: 74,
    currentPrice: 78.35,
    profitLoss: 174,
  },
];

export const allocationSlices: AllocationSlice[] = [
  { label: "Gold", symbol: "gold", percent: 45 },
  { label: "Silver", symbol: "silver", percent: 20 },
  { label: "Oil", symbol: "crudeOil", percent: 25 },
  { label: "Copper", symbol: "copper", percent: 10 },
];

export const sentimentAnalysis =
  "Cross-asset flows show defensive rotation into precious metals while energy complex responds to supply headlines. AI models flag elevated volatility in natural gas over the next two weeks.";

export const aiPredictions: AiPrediction[] = [
  {
    id: "p1",
    commodity: "Gold",
    prediction: "Bullish",
    confidence: 82,
  },
  {
    id: "p2",
    commodity: "Crude Oil",
    prediction: "Bullish",
    confidence: 74,
  },
  {
    id: "p3",
    commodity: "Natural Gas",
    prediction: "Bearish",
    confidence: 68,
  },
];

export const aiTradingSignals: AiTradingSignal[] = [
  {
    id: "t1",
    commodity: "Gold",
    signal: "BUY",
    rationale: "Momentum and macro inflation signals aligned.",
  },
  {
    id: "t2",
    commodity: "Natural Gas",
    signal: "SELL",
    rationale: "Storage builds and mild weather outlook.",
  },
  {
    id: "t3",
    commodity: "Silver",
    signal: "HOLD",
    rationale: "Range-bound until industrial demand firms.",
  },
];

export const aiInsightsBlock = {
  commodityInsight:
    "Gold shows strong bullish momentum due to rising inflation expectations.",
  oilInsight:
    "Oil demand expected to increase due to global supply tightening.",
};

export const newsArticles: NewsArticle[] = [
  {
    id: "n1",
    title: "Gold hits record high amid inflation fears",
    source: "Bloomberg",
    publishedAt: "2 hours ago",
    excerpt: "Investors increase exposure to bullion as real yields slide.",
  },
  {
    id: "n2",
    title: "OPEC+ holds output steady; crude steadies",
    source: "Reuters",
    publishedAt: "5 hours ago",
    excerpt: "Supply discipline supports near-term price floor.",
  },
  {
    id: "n3",
    title: "Copper demand outlook improves on grid spending",
    source: "Financial Times",
    publishedAt: "Yesterday",
    excerpt: "Electrification projects lift medium-term consumption view.",
  },
];

export const defaultUser = {
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  plan: "Professional",
};

export function commodityDetail(symbol: CommodityKey) {
  const row = marketRows.find((r) => r.symbol === symbol);
  const name =
    row?.commodity ??
    symbol.charAt(0).toUpperCase() + symbol.slice(1);
  return {
    symbol,
    name,
    rsi: 58.2,
    macd: 0.42,
    trend: "Uptrend" as const,
    aiSummary:
      symbol === "gold"
        ? aiInsightsBlock.commodityInsight
        : `${name} positioning reflects balanced flows with AI indicators leaning constructive on a 30-day horizon.`,
  };
}
