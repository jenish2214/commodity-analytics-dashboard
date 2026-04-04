"use client";

import { useMarketDataStore } from "@/store/marketDataStore";
import { useUserStore } from "@/store/userStore";
import {
  convertUsdForDisplay,
  formatCurrencyAmount,
  formatPercent,
} from "@/utils/format";

export function CommodityTickerBar() {
  const market = useMarketDataStore((s) => s.market);
  const fxRates = useMarketDataStore((s) => s.fxRates);
  const currency = useUserStore((s) => s.currency);

  if (market.length === 0) return null;

  const doubled = [...market, ...market];

  return (
    <div className="ticker-rail" aria-label="Market ticker">
      <div className="ticker-rail__viewport">
        <div className="ticker-rail__track">
          {doubled.map((m, i) => {
            try {
              const conv = convertUsdForDisplay(m.priceUsd, currency, fxRates);
              const up = m.change24h >= 0;
              return (
                <span
                  key={`${m.id}-${i}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    flexShrink: 0,
                    fontSize: "0.75rem",
                  }}
                >
                  <strong style={{ color: "var(--text-primary)" }}>{m.commodity}</strong>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrencyAmount(conv.amount, conv.displayCurrency)}
                  </span>
                  <span className={up ? "ca-gain" : "ca-loss"} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {up ? "▲" : "▼"} {formatPercent(m.change24h)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>Vol {m.volume}</span>
                </span>
              );
            } catch {
              return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
