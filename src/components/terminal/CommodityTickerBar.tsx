"use client";

import { useMarketDataStore } from "@/store/marketDataStore";
import { useUserStore } from "@/store/userStore";
import { convertUsdForDisplay, formatCurrencyAmount, formatPercent } from "@/utils/format";

export function CommodityTickerBar() {
  const market = useMarketDataStore((s) => s.market);
  const fxRates = useMarketDataStore((s) => s.fxRates);
  const currency = useUserStore((s) => s.currency);

  if (market.length === 0) return null;

  return (
    <div
      className="ca-ticker-bar"
      role="marquee"
      aria-label="Commodity spot strip"
      style={{
        display: "flex",
        gap: "1.25rem",
        overflowX: "auto",
        padding: "0.35rem 1rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card)",
        fontSize: "0.75rem",
        whiteSpace: "nowrap",
        scrollbarWidth: "thin",
      }}
    >
      {market.map((m) => {
        try {
          const conv = convertUsdForDisplay(m.priceUsd, currency, fxRates);
          const up = m.change24h >= 0;
          return (
            <span
              key={m.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                flexShrink: 0,
              }}
            >
              <strong style={{ color: "var(--text-primary)" }}>{m.commodity}</strong>
              <span>{formatCurrencyAmount(conv.amount, conv.displayCurrency)}</span>
              <span style={{ color: up ? "var(--gain)" : "var(--loss)" }}>
                {up ? "▲" : "▼"} {formatPercent(m.change24h)}
              </span>
              <span style={{ color: "var(--text-secondary)" }}>· vol {m.volume}</span>
            </span>
          );
        } catch {
          return null;
        }
      })}
    </div>
  );
}
