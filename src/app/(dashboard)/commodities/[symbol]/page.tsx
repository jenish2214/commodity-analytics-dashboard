import { notFound } from "next/navigation";
import { CommodityDetailView } from "@/components/views/CommodityDetailView";
import { commodityIdSet } from "@/services/commodities/definitions";
import type { CommodityKey } from "@/types/models";

const KEYS = commodityIdSet();

type PageProps = {
  params: { symbol: string };
};

export default function CommodityDetailPage({ params }: PageProps) {
  const key = params.symbol as CommodityKey;
  if (!KEYS.has(key)) notFound();
  return <CommodityDetailView symbol={key} />;
}
