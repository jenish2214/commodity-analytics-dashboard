import { NextResponse } from "next/server";
import {
  aiInsightsBlock,
  aiPredictions,
  aiTradingSignals,
  sentimentAnalysis,
} from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    sentimentAnalysis,
    predictions: aiPredictions,
    tradingSignals: aiTradingSignals,
    highlights: aiInsightsBlock,
  });
}
