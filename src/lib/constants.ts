import type { CommodityKey, TimeRange } from "@/types/models";

export const COMMODITY_OPTIONS: { key: CommodityKey; label: string }[] = [
  { key: "gold", label: "Gold" },
  { key: "silver", label: "Silver" },
  { key: "crudeOil", label: "Crude Oil" },
  { key: "brentCrude", label: "Brent" },
  { key: "naturalGas", label: "Natural Gas" },
  { key: "copper", label: "Copper" },
  { key: "platinum", label: "Platinum" },
  { key: "wheat", label: "Wheat" },
  { key: "rice", label: "Rice" },
  { key: "corn", label: "Corn" },
  { key: "soybean", label: "Soybean" },
  { key: "coffee", label: "Coffee" },
  { key: "sugar", label: "Sugar" },
];

export const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "6M", "1Y"];

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/commodities", label: "Commodities", icon: "BarChart2" },
  { href: "/portfolio", label: "Portfolio", icon: "Briefcase" },
  { href: "/market-news", label: "Market News", icon: "Newspaper" },
  { href: "/indices", label: "Market Indices", icon: "TrendingUp" },
];

export const BOTTOM_NAV_ITEMS = [
  { href: "/logout", label: "Logout", icon: "LogOut", bottom: true }
];

export const BOTTOM_NAV: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/commodities", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/indices", label: "Indices" },
  { href: "/settings", label: "More" },
];
