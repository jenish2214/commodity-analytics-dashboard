import type { CommodityKey, TimeRange } from "@/types/models";

export const COMMODITY_OPTIONS: { key: CommodityKey; label: string }[] = [
  { key: "gold", label: "Gold" },
  { key: "silver", label: "Silver" },
  { key: "crudeOil", label: "Crude Oil" },
  { key: "naturalGas", label: "Natural Gas" },
  { key: "copper", label: "Copper" },
];

export const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "6M", "1Y"];

export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Dashboard" },
  { href: "/commodities", label: "Commodities" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/ai-insights", label: "AI Insights" },
  { href: "/market-news", label: "Market News" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export const BOTTOM_NAV: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/commodities", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/ai-insights", label: "AI" },
  { href: "/settings", label: "More" },
];
