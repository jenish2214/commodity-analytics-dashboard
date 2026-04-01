"use client";

import Link from "next/link";
import type { MarketRow } from "@/types/models";
import { useUserStore } from "@/store/userStore";
import { useMarketDataStore } from "@/store/marketDataStore";
import { convertUsdForDisplay, formatCurrencyAmount, formatPercent } from "@/utils/format";
import { MiniSparkline } from "@/components/terminal/MiniSparkline";

type Props = {
  rows: MarketRow[];
};

export function CommodityMarketBoard({ rows }: Props) {
  const currency = useUserStore((s) => s.currency);
  const fxRates = useMarketDataStore((s) => s.fxRates);

  try {
    return (
      <section className="ca-card" aria-label="Commodity market board">
        <h2 className="ca-page__title" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
          Market board
        </h2>
        <div className="ca-table-wrap" style={{ overflowX: "auto" }}>
          <table className="ca-table" style={{ fontSize: "0.8rem" }}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Price</th>
                <th scope="col">24h</th>
                <th scope="col">Volume</th>
                <th scope="col">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const conv = convertUsdForDisplay(r.priceUsd, currency, fxRates);
                const up = r.change24h >= 0;
                return (
                  <tr key={r.id}>
                    <td>
                      <Link
                        href={`/commodities/${r.symbol}`}
                        style={{ fontWeight: 600, color: "var(--text-primary)" }}
                      >
                        {r.commodity}
                      </Link>
                    </td>
                    <td className="ca-num">
                      {formatCurrencyAmount(conv.amount, conv.displayCurrency)}
                    </td>
                    <td className="ca-num" style={{ color: up ? "var(--gain)" : "var(--loss)" }}>
                      {formatPercent(r.change24h)}
                    </td>
                    <td>{r.volume}</td>
                    <td>
                      {r.sparkline && r.sparkline.length > 1 ? (
                        <MiniSparkline values={r.sparkline} positive={up} />
                      ) : (
                        <span style={{ color: "var(--text-secondary)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
