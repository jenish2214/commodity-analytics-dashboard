import { notFound } from "next/navigation";
import { CommodityDetailView } from "@/components/views/CommodityDetailView";
import type { CommodityKey } from "@/types/models";

const KEYS = new Set<CommodityKey>([
  "gold",
  "silver",
  "crudeOil",
  "naturalGas",
  "copper",
]);

type PageProps = {
  params: { symbol: string };
};

export default function CommodityDetailPage({ params }: PageProps) {
  const key = params.symbol as CommodityKey;
  if (!KEYS.has(key)) notFound();
  return <CommodityDetailView symbol={key} />;
}
