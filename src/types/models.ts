export type TimeRange = "1D" | "1W" | "1M" | "6M" | "1Y";

export type CommodityKey =
  | "gold"
  | "silver"
  | "crudeOil"
  | "naturalGas"
  | "copper";

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
  volume: string;
  marketCap: string;
  signal: "BUY" | "SELL" | "HOLD";
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
