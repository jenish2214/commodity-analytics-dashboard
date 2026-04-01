export type TimeRange = "1D" | "1W" | "1M" | "6M" | "1Y";

export type CommodityKey =
  | "gold"
  | "silver"
  | "crudeOil"
  | "brentCrude"
  | "naturalGas"
  | "copper"
  | "platinum"
  | "wheat"
  | "rice"
  | "corn"
  | "soybean"
  | "coffee"
  | "sugar";

/** Desk-style bucket for rotation and relative-value views */
export type CommoditySector =
  | "precious_metals"
  | "energy"
  | "base_metals"
  | "agriculture";

export type MarketRow = {
  id: string;
  commodity: string;
  symbol: CommodityKey;
  /** Quote in USD per exchange unit (oz, bbl, lb, MMBtu). */
  priceUsd: number;
  /** Same as priceUsd; kept for older call sites. */
  price: number;
  unit: string;
  change24h: number;
  changeAbsUsd?: number;
  volume: string;
  marketCap: string;
  signal: "BUY" | "SELL" | "HOLD";
  sparkline?: number[];
  volatility7dAnn?: number | null;
  volatility30dAnn?: number | null;
  riskIndex?: number | null;
  sector?: CommoditySector;
  /** Wilder RSI(14) on daily closes when history allows */
  rsi14?: number | null;
  /** Heuristic tags from momentum / mean-reversion rules */
  opportunityTags?: string[];
  /** 0–100 opportunity-style score (higher = more “interesting” move / setup) */
  opportunityScore?: number | null;
};

/** Aggregate intelligence returned with `/api/commodities` */
export type SectorRotationRow = {
  sector: CommoditySector;
  label: string;
  avgChange24h: number;
  medianChange24h: number;
  constituents: string[];
};

export type CommoditySpreadQuote = {
  label: string;
  value: number;
  detail: string;
};

export type SeasonalityHint = {
  commodity: string;
  symbol: CommodityKey;
  strongestMonths: string;
  avgStrongestMonthReturnPct: number | null;
};

export type CommodityAnalytics = {
  sectorRotation: SectorRotationRow[];
  spreads: CommoditySpreadQuote[];
  marketBreadth: { advancers: number; decliners: number; neutral: number };
  sentiment: "Bullish" | "Bearish" | "Neutral";
  seasonalityHints: SeasonalityHint[];
};

export type ChartPoint = {
  period: string;
  price: number;
  /** Exchange volume when provided by the feed; omit if unavailable. */
  volume?: number | null;
};

export type PortfolioHolding = {
  id: string;
  commodity: string;
  symbol: CommodityKey;
  quantity: number;
  unit: string;
  averagePrice: number;
  currentPrice: number;
  profitLoss: number;
};

export type AllocationSlice = {
  label: string;
  symbol: CommodityKey;
  percent: number;
};

export type PortfolioItemType =
  | "Commodity"
  | "Stock"
  | "Crypto"
  | "ETF"
  | "Other";

export type PortfolioItemStatus = "Open" | "Closed";

export type PortfolioItem = {
  id: string;
  name: string;
  type: PortfolioItemType;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  status: PortfolioItemStatus;
  dateAdded: string;
  notes?: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  excerpt: string;
  image?: string;
  url?: string;
};

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY";

export type DashboardNotifications = {
  email: boolean;
  push: boolean;
  priceAlerts: boolean;
};

/** @deprecated Use flat name/email on user store; kept for legacy types */
export type UserProfile = {
  name: string;
  email: string;
  plan: string;
};

/** @deprecated Use new notification shape on user store */
export type NotificationPrefs = {
  emailAlerts: boolean;
  priceAlerts: boolean;
};
