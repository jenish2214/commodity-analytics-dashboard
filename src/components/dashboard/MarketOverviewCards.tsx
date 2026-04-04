"use client";

import Link from "next/link";
import { MiniSparkline } from "@/components/terminal/MiniSparkline";
import { useUserStore } from "@/store/userStore";
import { useMarketDataStore } from "@/store/marketDataStore";
import {
  convertUsdForDisplay,
  formatCurrencyAmount,
  formatPercent,
} from "@/utils/format";
import type { CommodityKey, MarketRow } from "@/types/models";

type Props = {
  rows: MarketRow[];
  limit?: number;
  /** If set, show only these commodities (in order) when present in rows. */
  symbols?: CommodityKey[];
};

export function MarketOverviewCards({ rows, limit = 8, symbols }: Props) {
  const currency = useUserStore((s) => s.currency);
  const fxRates = useMarketDataStore((s) => s.fxRates);

  const slice = (() => {
    if (symbols?.length) {
      const picked: MarketRow[] = [];
      for (const sym of symbols) {
        const r = rows.find((x) => x.symbol === sym);
        if (r) picked.push(r);
      }
      return picked.length ? picked : rows.slice(0, limit);
    }
    return rows.slice(0, limit);
  })();

  return (
    <section className="ca-card ws-panel" aria-label="Market overview">
      <h2 className="ws-panel-title">Spot markets</h2>
      <p className="ws-panel-lead">
        Session quotes with microstructure and directional tint.
      </p>
      <div className="market-overview-grid ws-market-grid">
        {slice.map((r) => {
          const conv = convertUsdForDisplay(r.priceUsd, currency, fxRates);
          const up = r.change24h >= 0;
          const spark = r.sparkline?.length
            ? r.sparkline
            : [r.priceUsd * 0.99, r.priceUsd * 1.01, r.priceUsd];
          const sentiment =
            r.signal === "BUY" ? "bullish" : r.signal === "SELL" ? "bearish" : "neutral";
          return (
            <article
              key={r.id}
              className={`mo-card ws-market-card ws-market-card--${sentiment}`}
            >
              <Link
                href={`/commodities/${r.symbol}`}
                className="ws-market-card__link"
              >
                <p className="mo-card__name">{r.commodity}</p>
                <p className="mo-card__price">
                  {formatCurrencyAmount(conv.amount, conv.displayCurrency)}
                </p>
                <div className="mo-card__row">
                  <span className={up ? "ca-gain" : "ca-loss"}>
                    {formatPercent(r.change24h)}
                  </span>
                  <MiniSparkline values={spark} positive={up} width={80} height={26} />
                </div>
                <div className="mo-card__row">
                  <span className="ws-market-card__sentiment">{r.signal}</span>
                  <span>{r.volume}</span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
