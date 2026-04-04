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
  { href: "/commodities", label: "Markets", icon: "LineChart" },
  { href: "/portfolio", label: "Portfolio", icon: "Briefcase" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/risk", label: "Risk Analysis", icon: "Shield" },
  { href: "/ai-insights", label: "AI Insights", icon: "Sparkles" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];

/** Sidebar footer (e.g. sign out). */
export const SIDEBAR_FOOTER_LINKS = [
  { href: "/logout", label: "Logout", icon: "LogOut" },
];

export const BOTTOM_NAV: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/commodities", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "More" },
];
