"use client";

import { CompactPortfolioCalculator } from "@/components/CompactPortfolioCalculator";

export function AiInsightsView() {
  return (
    <div className="ca-page">
      <h1 className="ca-page__title">AI Insights</h1>
      <p className="ca-page__lead">
        Advanced portfolio risk analysis with hedge fund-level quantitative models.
      </p>

      {/* Portfolio Risk Calculator - Compact Version */}
      <CompactPortfolioCalculator />
    </div>
  );
}
