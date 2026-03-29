import { NextResponse } from "next/server";
import {
  allocationSlices,
  portfolioHoldings,
} from "@/lib/mock-data";

export async function GET() {
  const totalValue = portfolioHoldings.reduce(
    (sum, h) => sum + h.quantity * h.currentPrice,
    0
  );
  const totalPnl = portfolioHoldings.reduce((sum, h) => sum + h.profitLoss, 0);

  return NextResponse.json({
    holdings: portfolioHoldings,
    allocation: allocationSlices,
    totals: {
      value: totalValue,
      pnl: totalPnl,
    },
  });
}
