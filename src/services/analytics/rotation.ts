import type { CommoditySector, MarketRow, SectorRotationRow } from "@/types/models";

const SECTOR_LABEL: Record<CommoditySector, string> = {
  precious_metals: "Precious metals",
  energy: "Energy",
  base_metals: "Base metals",
  agriculture: "Agriculture",
};

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export function sectorRotationFromRows(rows: MarketRow[]): SectorRotationRow[] {
  const bySector = new Map<CommoditySector, MarketRow[]>();
  for (const r of rows) {
    const sec = r.sector;
    if (!sec) continue;
    const list = bySector.get(sec) ?? [];
    list.push(r);
    bySector.set(sec, list);
  }

  const out: SectorRotationRow[] = [];
  for (const [sector, list] of bySector) {
    if (list.length === 0) continue;
    const changes = list.map((x) => x.change24h);
    const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
    out.push({
      sector,
      label: SECTOR_LABEL[sector],
      avgChange24h: parseFloat(avg.toFixed(3)),
      medianChange24h: parseFloat(median(changes).toFixed(3)),
      constituents: list.map((x) => x.commodity),
    });
  }

  return out.sort((a, b) => b.avgChange24h - a.avgChange24h);
}
