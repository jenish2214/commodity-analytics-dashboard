import { NextResponse } from "next/server";

export async function GET() {
  try {
    // For now, return empty portfolio - user will add items manually
    // In a real app, this would fetch from a database
    return NextResponse.json({
      holdings: [],
      allocation: [],
      totals: {
        value: 0,
        pnl: 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to fetch portfolio data",
        holdings: [],
        allocation: [],
        totals: { value: 0, pnl: 0 }
      },
      { status: 200 }
    );
  }
}
