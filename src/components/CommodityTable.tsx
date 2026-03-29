"use client";

import Link from "next/link";
import type { MarketRow } from "@/types/models";
import { formatPercent, formatUsd } from "@/utils/format";

function Signal({ signal }: { signal: MarketRow["signal"] }) {
  const cls =
    signal === "BUY"
      ? "ca-signal ca-signal--buy"
      : signal === "SELL"
        ? "ca-signal ca-signal--sell"
        : "ca-signal ca-signal--hold";
  return <span className={cls}>{signal}</span>;
}

type Props = {
  rows: MarketRow[];
};

export function CommodityTable({ rows }: Props) {
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
                    style={{ fontWeight: 600, color: "var(--color-heading)" }}
                  >
                    {r.commodity}
                  </Link>
                </td>
                <td className="ca-num">{formatUsd(r.price)}</td>
                <td
                  className={`ca-num ${r.change24h >= 0 ? "ca-pos" : "ca-neg"}`}
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
