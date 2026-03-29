import type { CommodityKey, TimeRange } from "@/types/models";

export const COMMODITY_OPTIONS: { key: CommodityKey; label: string }[] = [
  { key: "gold", label: "Gold" },
  { key: "silver", label: "Silver" },
  { key: "crudeOil", label: "Crude Oil" },
  { key: "naturalGas", label: "Natural Gas" },
  { key: "copper", label: "Copper" },
];

export const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "6M", "1Y"];

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/commodities", label: "Commodities", icon: "BarChart2" },
  { href: "/portfolio", label: "Portfolio", icon: "Briefcase" },
  { href: "/ai-insights", label: "AI Insights", icon: "Brain" },
  { href: "/market-news", label: "Market News", icon: "Newspaper" },
  { 
    href: "/reports", 
    label: "Reports", 
    icon: "FileText",
    subItems: [
      { href: "/reports/pdf", label: "PDF Reports" },
      { href: "/reports/csv", label: "CSV Export" },
      { href: "/reports/scheduled", label: "Scheduled" }
    ]
  },
  {
    href: "/business",
    label: "Business setup",
    icon: "Building",
    subItems: [
      { href: "/business/settings", label: "Business settings" },
      { href: "/business/booking", label: "Online booking" },
      { href: "/business/subscription", label: "Subscription" },
      { href: "/business/locations", label: "Locations" },
      { href: "/business/payment", label: "Payment settings" }
    ]
  }
];

export const BOTTOM_NAV_ITEMS = [
  { href: "/help", label: "Help center", icon: "HelpCircle", bottom: true },
  { href: "/logout", label: "Logout", icon: "LogOut", bottom: true }
];

export const BOTTOM_NAV: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/commodities", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/ai-insights", label: "AI" },
  { href: "/settings", label: "More" },
];
