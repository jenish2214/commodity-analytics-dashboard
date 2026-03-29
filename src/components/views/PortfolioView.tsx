"use client";

import { PortfolioPieChart } from "@/components/PortfolioPieChart";
import { usePortfolioStore } from "@/store/portfolioStore";
import { formatSignedUsd, formatUsd } from "@/utils/format";

export function PortfolioView() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const allocation = usePortfolioStore((s) => s.allocation);
  const totals = usePortfolioStore((s) => s.totals);
  const loading = usePortfolioStore((s) => s.loading);

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Portfolio</h1>
      <p className="ca-page__lead">Holdings, cost basis, and allocation mix.</p>
      {loading && holdings.length === 0 ? (
        <p style={{ color: "var(--color-label)" }}>Loading portfolio…</p>
      ) : null}
      <div className="ca-stat-grid" style={{ marginBottom: "1.25rem" }}>
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">Total value</p>
          <p className="ca-stat-card__value">{formatUsd(totals.value)}</p>
        </article>
        <article className="ca-card ca-stat-card">
          <p className="ca-stat-card__label">Total P/L</p>
          <p className="ca-stat-card__value">{formatSignedUsd(totals.pnl)}</p>
        </article>
      </div>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "minmax(0, 1fr)",
        }}
      >
        <section className="ca-card">
          <h2
            className="ca-page__title"
            style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
          >
            Holdings
          </h2>
          <div className="ca-table-wrap">
            <table className="ca-table">
              <thead>
                <tr>
                  <th scope="col">Commodity</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Average Price</th>
                  <th scope="col">Current Price</th>
                  <th scope="col">Profit / Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.commodity}</td>
                    <td>
                      {h.quantity} {h.unit}
                    </td>
                    <td className="ca-num">{formatUsd(h.averagePrice)}</td>
                    <td className="ca-num">{formatUsd(h.currentPrice)}</td>
                    <td
                      className={`ca-num ${h.profitLoss >= 0 ? "ca-pos" : "ca-neg"}`}
                    >
                      {formatSignedUsd(h.profitLoss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="ca-card">
          <h2
            className="ca-page__title"
            style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
          >
            Allocation
          </h2>
          <PortfolioPieChart data={allocation} />
          <ul
            style={{
              margin: "1rem 0 0",
              padding: 0,
              listStyle: "none",
              fontSize: "0.875rem",
              color: "var(--color-label)",
            }}
          >
            {allocation.map((a) => (
              <li key={a.symbol} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{a.label}</span>
                <span style={{ fontWeight: 700, color: "var(--color-heading)" }}>
                  {a.percent}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
