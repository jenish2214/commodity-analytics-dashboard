import { marketRows, portfolioHoldings } from "@/lib/mock-data";

export function monthlyPortfolioReportCsv(): string {
  const header = "commodity,quantity,average_price,current_price,profit_loss\n";
  const lines = portfolioHoldings
    .map(
      (h) =>
        `${h.commodity},${h.quantity} ${h.unit},${h.averagePrice},${h.currentPrice},${h.profitLoss}`
    )
    .join("\n");
  return header + lines;
}

export function commodityPerformanceReportCsv(): string {
  const header =
    "commodity,price,change_24h_pct,volume,market_cap,signal\n";
  const lines = marketRows
    .map(
      (r) =>
        `${r.commodity},${r.price},${r.change24h},${r.volume},${r.marketCap},${r.signal}`
    )
    .join("\n");
  return header + lines;
}

export function aiPredictionReportCsv(): string {
  const lines = [
    "metric,value",
    "sentiment,Cross-asset flows favor precious metals defensively.",
    "gold_prediction,Bullish (confidence 82%)",
    "oil_prediction,Bullish (confidence 74%)",
    "gas_prediction,Bearish (confidence 68%)",
  ];
  return lines.join("\n");
}
