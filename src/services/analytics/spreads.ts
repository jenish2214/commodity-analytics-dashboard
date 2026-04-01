import type { CommodityKey, CommoditySpreadQuote, MarketRow } from "@/types/models";

function rowBySymbol(rows: MarketRow[]): Partial<Record<CommodityKey, MarketRow>> {
  const m: Partial<Record<CommodityKey, MarketRow>> = {};
  for (const r of rows) {
    m[r.symbol] = r;
  }
  return m;
}

/**
 * Cross-instrument ratios from the same snapshot (units differ — ratios are indicative only).
 */
export function crossCommoditySpreads(rows: MarketRow[]): CommoditySpreadQuote[] {
  const q: CommoditySpreadQuote[] = [];
  const m = rowBySymbol(rows);
  const gold = m.gold;
  const silver = m.silver;
  if (gold && silver && silver.priceUsd > 0) {
    const gsr = gold.priceUsd / silver.priceUsd;
    q.push({
      label: "Gold / silver",
      value: parseFloat(gsr.toFixed(2)),
      detail: "Troy oz ratio from futures marks",
    });
  }
  const wti = m.crudeOil;
  const brent = m.brentCrude;
  if (wti && brent) {
    const diff = brent.priceUsd - wti.priceUsd;
    q.push({
      label: "Brent − WTI",
      value: parseFloat(diff.toFixed(2)),
      detail: "USD per barrel",
    });
  }
  const soy = m.soybean;
  const corn = m.corn;
  if (soy && corn && corn.priceUsd > 0) {
    const crush = soy.priceUsd / corn.priceUsd;
    q.push({
      label: "Soybeans / corn",
      value: parseFloat(crush.toFixed(2)),
      detail: "Price ratio (mixed units — softs marker)",
    });
  }
  return q;
}
