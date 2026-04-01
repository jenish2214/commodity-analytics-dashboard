import type { CommodityKey, CommoditySector } from "@/types/models";

export type CommodityDefinition = {
  id: CommodityKey;
  name: string;
  ticker: string;
  unit: string;
  sector: CommoditySector;
};

/**
 * Canonical futures / benchmark symbols (Yahoo Finance).
 * Business logic for quotes should use this list — keep API routes in sync.
 */
export const COMMODITY_DEFINITIONS: CommodityDefinition[] = [
  { id: "gold", name: "Gold", ticker: "GC=F", unit: "troy oz", sector: "precious_metals" },
  { id: "silver", name: "Silver", ticker: "SI=F", unit: "troy oz", sector: "precious_metals" },
  { id: "crudeOil", name: "WTI Crude", ticker: "CL=F", unit: "bbl", sector: "energy" },
  { id: "brentCrude", name: "Brent Crude", ticker: "BZ=F", unit: "bbl", sector: "energy" },
  { id: "naturalGas", name: "Natural Gas", ticker: "NG=F", unit: "MMBtu", sector: "energy" },
  { id: "copper", name: "Copper", ticker: "HG=F", unit: "lb", sector: "base_metals" },
  { id: "platinum", name: "Platinum", ticker: "PL=F", unit: "troy oz", sector: "precious_metals" },
  { id: "wheat", name: "Wheat", ticker: "ZW=F", unit: "bu", sector: "agriculture" },
  { id: "rice", name: "Rough Rice", ticker: "ZR=F", unit: "cwt", sector: "agriculture" },
  { id: "corn", name: "Corn", ticker: "ZC=F", unit: "bu", sector: "agriculture" },
  { id: "soybean", name: "Soybeans", ticker: "ZS=F", unit: "bu", sector: "agriculture" },
  { id: "coffee", name: "Coffee", ticker: "KC=F", unit: "lb", sector: "agriculture" },
  { id: "sugar", name: "Sugar", ticker: "SB=F", unit: "lb", sector: "agriculture" },
];

export function commodityIdSet(): Set<CommodityKey> {
  try {
    return new Set(COMMODITY_DEFINITIONS.map((d) => d.id));
  } catch {
    return new Set();
  }
}

export function tickerMapByCommodityId(): Record<string, string> {
  try {
    return Object.fromEntries(COMMODITY_DEFINITIONS.map((d) => [d.id, d.ticker]));
  } catch {
    return {};
  }
}
