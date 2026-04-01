"use client";

import { GoldWeightTicketSelector } from "@/components/GoldWeightTicketSelector";
import { useMarketDataStore } from "@/store/marketDataStore";
import { goldBarSizeVisible, useUserStore } from "@/store/userStore";
import { formatCurrencyAmount } from "@/utils/format";
import { goldCaratPerGramDisplay } from "@/utils/goldCarat";

/** Spot-derived fine and jewellery purity prices per gram in the selected currency. */
export function GoldCaratPanel() {
  const currency = useUserStore((s) => s.currency);
  const goldBarMode = useUserStore((s) => s.goldBarWeight);
  const fxRates = useMarketDataStore((s) => s.fxRates);
  const fxError = useMarketDataStore((s) => s.fxError);
  const gold = useMarketDataStore((s) => s.market.find((m) => m.symbol === "gold"));

  if (!gold) return null;

  const carat = goldCaratPerGramDisplay(gold.priceUsd, currency, fxRates);
  const dc = carat.displayCurrency;
  const total24k = (grams: number) =>
    Math.round(carat.k24 * grams * 100) / 100;

  return (
    <article className="ca-card" style={{ marginBottom: "1rem" }}>
      <p className="ca-stat-card__label" style={{ marginBottom: "0.35rem" }}>
        Gold per gram (from live Comex spot)
      </p>
      <p
        style={{
          margin: "0 0 0.75rem",
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
        }}
      >
        24K = fine gold. 22K / 18K are purity fractions of spot (no making charges).
        {carat.usedUsdFallback
          ? " Shown in USD until FX loads."
          : null}
        {currency !== "USD" && fxError && !carat.usedUsdFallback ? ` ${fxError}` : null}
      </p>

      <GoldWeightTicketSelector ariaPrefix="detail-gold" />

      <div
        className="ca-stat-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        }}
      >
        <div className="ca-stat-card">
          <p className="ca-stat-card__label">24K (fine)</p>
          <p className="ca-stat-card__value">
            {formatCurrencyAmount(carat.k24, dc)}
          </p>
          <p className="ca-stat-card__label" style={{ marginTop: "0.25rem" }}>
            / gram
          </p>
        </div>
        <div className="ca-stat-card">
          <p className="ca-stat-card__label">22K</p>
          <p className="ca-stat-card__value">
            {formatCurrencyAmount(carat.k22, dc)}
          </p>
          <p className="ca-stat-card__label" style={{ marginTop: "0.25rem" }}>
            / gram
          </p>
        </div>
        <div className="ca-stat-card">
          <p className="ca-stat-card__label">18K</p>
          <p className="ca-stat-card__value">
            {formatCurrencyAmount(carat.k18, dc)}
          </p>
          <p className="ca-stat-card__label" style={{ marginTop: "0.25rem" }}>
            / gram
          </p>
        </div>
        {goldBarSizeVisible(goldBarMode, "10g") ? (
          <div className="ca-stat-card">
            <p className="ca-stat-card__label">24K — 10 g</p>
            <p className="ca-stat-card__value">
              {formatCurrencyAmount(total24k(10), dc)}
            </p>
            <p className="ca-stat-card__label" style={{ marginTop: "0.25rem" }}>
              total
            </p>
          </div>
        ) : null}
        {goldBarSizeVisible(goldBarMode, "100g") ? (
          <div className="ca-stat-card">
            <p className="ca-stat-card__label">24K — 100 g</p>
            <p className="ca-stat-card__value">
              {formatCurrencyAmount(total24k(100), dc)}
            </p>
            <p className="ca-stat-card__label" style={{ marginTop: "0.25rem" }}>
              total
            </p>
          </div>
        ) : null}
        {goldBarSizeVisible(goldBarMode, "1kg") ? (
          <div className="ca-stat-card">
            <p className="ca-stat-card__label">24K — 1 kg</p>
            <p className="ca-stat-card__value">
              {formatCurrencyAmount(total24k(1000), dc)}
            </p>
            <p className="ca-stat-card__label" style={{ marginTop: "0.25rem" }}>
              total
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
