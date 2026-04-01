import { NextResponse } from "next/server";
import { getIndianCommodityPrices } from "@/lib/indianCommodityPricingEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getIndianCommodityPrices();
    if (!result.success) {
      const status =
        result.code === "CONFIG" ? 503 : 502;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        timestamp: Date.now(),
        error: e instanceof Error ? e.message : "Unknown error",
        code: "ROUTE",
      },
      { status: 500 }
    );
  }
}
