"use client";

import { useEffect, useMemo, useState } from "react";
import { GoldWeightTicketSelector } from "@/components/GoldWeightTicketSelector";
import { goldBarSizeVisible, useUserStore } from "@/store/userStore";
import type { IndianCommodityResponse } from "@/lib/indianCommodityPricingEngine";
import {
  convertInrAmountToDisplay,
  formatCurrencyAmount,
} from "@/utils/format";
import { GRAMS_PER_TROY_OZ } from "@/services/indian/inrFormats";

export function IndianCommodityPanel() {
  const [result, setResult] = useState<IndianCommodityResponse | null>(null);
  const goldBarMode = useUserStore((s) => s.goldBarWeight);
  const currency = useUserStore((s) => s.currency);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/indian-commodities", { cache: "no-store" });
        const json = (await res.json()) as IndianCommodityResponse;
        if (!cancelled) setResult(json);
      } catch {
        if (!cancelled) {
          setResult({
            success: false,
            timestamp: Date.now(),
            error: "Failed to reach Indian commodities API",
            code: "CLIENT",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fmtInr = useMemo(() => {
    if (!result?.success) {
      return (_n: number) => "—";
    }
    const fx = result.fx;
    return (amountInr: number) => {
      const c = convertInrAmountToDisplay(amountInr, currency, fx);
      return formatCurrencyAmount(c.amount, c.displayCurrency);
    };
  }, [result, currency]);

  const fxWarning = useMemo(() => {
    if (!result?.success || currency === "INR") return null;
    const c = convertInrAmountToDisplay(100, currency, result.fx);
    return c.usedInrFallback
      ? "Displaying INR figures — full ECB cross-rates for your currency were unavailable."
      : null;
  }, [result, currency]);

  if (result === null) {
    return (
      <section className="ca-card" aria-busy="true">
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Loading Indian commodity engine…
        </p>
      </section>
    );
  }

  if (!result.success) {
    return (
      <section className="ca-card">
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}
        >
          Indian market reference (engine)
        </h2>
        <p style={{ margin: 0, color: "var(--loss, #b91c1c)" }}>{result.error}</p>
        {result.code === "CONFIG" ? (
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            Add <code style={{ fontSize: "0.8em" }}>TWELVEDATA_KEY</code> to{" "}
            <code style={{ fontSize: "0.8em" }}>.env.local</code> and restart the dev server.
          </p>
        ) : null}
      </section>
    );
  }

  const d = result.data;
  const t = new Date(result.timestamp).toLocaleString();
  const fxLine =
    result.fxAsOf != null
      ? `ECB FX as of ${result.fxAsOf}.`
      : "ECB reference rates.";

  return (
    <section className="ca-card">
      <h2
        className="ca-page__title"
        style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}
      >
        Indian market prices
      </h2>
      <p
        style={{
          margin: `0 0 ${fxWarning ? "0.35rem" : "1rem"}`,
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
        }}
      >
        Values are computed in INR then converted to your selected currency (
        <strong>{currency}</strong>
        ) via USD bridge. {fxLine} Spot USD legs:{" "}
        <strong>{result.quoteSource === "twelve" ? "Twelve Data" : "Yahoo chart"}</strong>
        {result.quoteSource === "yahoo"
          ? " — set TWELVEDATA_KEY for Twelve Data /price."
          : ""}{" "}
        · As of {t}.
      </p>
      {fxWarning ? (
        <p
          style={{
            margin: "0 0 1rem",
            fontSize: "0.8125rem",
            color: "var(--loss, #b45309)",
          }}
        >
          {fxWarning}
        </p>
      ) : null}

      <GoldWeightTicketSelector ariaPrefix="indian-gold" />

      <div
        className="ca-stat-grid"
        style={{
          marginBottom: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        }}
      >
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Gold 24K / g</p>
          <p className="ca-stat-card__value">{fmtInr(d.gold["24k"])}</p>
        </article>
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Gold 22K / g</p>
          <p className="ca-stat-card__value">{fmtInr(d.gold["22k"])}</p>
        </article>
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Gold 18K / g</p>
          <p className="ca-stat-card__value">{fmtInr(d.gold["18k"])}</p>
        </article>
        {goldBarSizeVisible(goldBarMode, "10g") ? (
          <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
            <p className="ca-stat-card__label">Gold 24K — 10 g (total)</p>
            <p className="ca-stat-card__value">{fmtInr(d.gold.per10Gram)}</p>
          </article>
        ) : null}
        {goldBarSizeVisible(goldBarMode, "100g") ? (
          <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
            <p className="ca-stat-card__label">Gold 24K — 100 g (total)</p>
            <p className="ca-stat-card__value">{fmtInr(d.gold.per100Gram)}</p>
          </article>
        ) : null}
        {goldBarSizeVisible(goldBarMode, "1kg") ? (
          <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
            <p className="ca-stat-card__label">Gold 24K — 1 kg (total)</p>
            <p className="ca-stat-card__value">{fmtInr(d.gold.per1Kg)}</p>
          </article>
        ) : null}
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Silver / g</p>
          <p className="ca-stat-card__value">{fmtInr(d.silver.perGram)}</p>
        </article>
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Silver / kg</p>
          <p className="ca-stat-card__value">{fmtInr(d.silver.perKg)}</p>
        </article>
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Crude / barrel</p>
          <p className="ca-stat-card__value">{fmtInr(d.crudeOil.perBarrel)}</p>
        </article>
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Crude / litre</p>
          <p className="ca-stat-card__value">{fmtInr(d.crudeOil.perLitre)}</p>
        </article>
        <article className="ca-card ca-stat-card" style={{ margin: 0 }}>
          <p className="ca-stat-card__label">Natural gas / MMBtu</p>
          <p className="ca-stat-card__value">{fmtInr(d.naturalGas.pricePerMMBtu)}</p>
        </article>
      </div>

      <p className="ca-stat-card__label" style={{ marginBottom: "0.5rem" }}>
        Agriculture reference (per quintal, INR basis — converted below)
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.5rem",
          fontSize: "0.875rem",
        }}
      >
        {(
          [
            ["Wheat", d.agriculture.wheat],
            ["Rice", d.agriculture.rice],
            ["Corn", d.agriculture.corn],
            ["Soybean", d.agriculture.soybean],
          ] as const
        ).map(([label, v]) => (
          <div
            key={label}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-hover)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{label}</div>
            <div>{fmtInr(v)}</div>
          </div>
        ))}
      </div>

      <hr style={{ margin: "1.25rem 0", borderColor: "var(--border)" }} />
      <p className="ca-stat-card__label" style={{ marginBottom: "0.35rem" }}>
        Indian ₹ reference formulas (MCX-style spot bridge)
      </p>
      <ul
        style={{
          margin: 0,
          paddingLeft: "1.1rem",
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
        }}
      >
        <li>
          24K ₹/g = (Gold USD/troy oz × USDINR) ÷ {GRAMS_PER_TROY_OZ}
        </li>
        <li>22K = 24K × 0.916 · 18K = 24K × 0.75</li>
        <li>
          Silver ₹/g = (Silver USD/troy oz × USDINR) ÷ {GRAMS_PER_TROY_OZ}; ₹/kg
          = ×1000
        </li>
        <li>Crude ₹/bbl = USD/bbl × USDINR; ₹/L = ₹/bbl ÷ 159</li>
      </ul>
    </section>
  );
}
