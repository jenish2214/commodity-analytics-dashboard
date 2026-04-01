import type { TimeRange } from "@/types/models";

/** Map app time range to Yahoo Finance `range` query value. */
export function timeRangeToYahooRange(tr: TimeRange): string {
  switch (tr) {
    case "1D":
      return "1d";
    case "1W":
      return "5d";
    case "1M":
      return "1mo";
    case "6M":
      return "6mo";
    case "1Y":
      return "1y";
    default:
      return "1mo";
  }
}

/** Yahoo `interval` for a given range string. */
export function yahooIntervalForRange(yahooRange: string): string {
  switch (yahooRange) {
    case "1d":
      return "5m";
    case "5d":
      return "15m";
    case "1mo":
      return "1d";
    case "3mo":
      return "1d";
    case "6mo":
      return "1d";
    case "1y":
      return "1wk";
    case "2y":
      return "1mo";
    case "5y":
      return "1mo";
    default:
      return "1d";
  }
}
