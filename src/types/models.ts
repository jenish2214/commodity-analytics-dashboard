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
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
  signal: "BUY" | "SELL" | "HOLD";
};

export type ChartPoint = {
  period: string;
  price: number;
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

export type AiPrediction = {
  id: string;
  commodity: string;
  prediction: "Bullish" | "Bearish" | "Neutral";
  confidence: number;
};

export type AiTradingSignal = {
  id: string;
  commodity: string;
  signal: "BUY" | "SELL" | "HOLD";
  rationale: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  excerpt: string;
};

export type ReportItem = {
  id: string;
  title: string;
  description: string;
};

export type UserProfile = {
  name: string;
  email: string;
  plan: string;
};

export type NotificationPrefs = {
  emailAlerts: boolean;
  priceAlerts: boolean;
};
