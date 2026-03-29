"use client";

import Link from "next/link";
import type { MarketRow } from "@/types/models";
import { useUserStore } from "@/store/userStore";
import { formatCurrencyAmount, formatPercent } from "@/utils/format";

function Signal({ signal }: { signal: MarketRow["signal"] }) {
  const cls =
    signal === "BUY"
      ? "ca-signal ca-gain"
      : signal === "SELL"
        ? "ca-signal ca-loss"
        : "ca-signal ca-signal--hold";
  return <span className={cls}>{signal}</span>;
}

type Props = {
  rows: MarketRow[];
};

export function CommodityTable({ rows }: Props) {
  const currency = useUserStore((s) => s.currency);

  return (
    <section className="ca-card">
      <h2
        className="ca-page__title"
        style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
      >
        Market Table
      </h2>
      <div className="ca-table-wrap">
        <table className="ca-table">
          <thead>
            <tr>
              <th scope="col">Commodity</th>
              <th scope="col">Price</th>
              <th scope="col">24h Change</th>
              <th scope="col">Volume</th>
              <th scope="col">Market Cap</th>
              <th scope="col">Signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link
                    href={`/commodities/${r.symbol}`}
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {r.commodity}
                  </Link>
                </td>
                <td className="ca-num">
                  {formatCurrencyAmount(r.price, currency)}
                </td>
                <td
                  className={`ca-num ${r.change24h >= 0 ? "ca-gain" : "ca-loss"}`}
                >
                  {formatPercent(r.change24h)}
                </td>
                <td>{r.volume}</td>
                <td>{r.marketCap}</td>
                <td>
                  <Signal signal={r.signal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
