"use client";

import { useMemo } from "react";
import type { CommodityAnalytics, MarketRow } from "@/types/models";

type Props = {
  rows: MarketRow[];
  analytics: CommodityAnalytics;
};

export function OpportunityScannerPanel({ rows, analytics }: Props) {
  const ranked = useMemo(() => {
    return [...rows].sort(
      (a, b) =>
        (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0)
    );
  }, [rows]);

  if (rows.length === 0) return null;

  const { sectorRotation, spreads, marketBreadth, seasonalityHints } =
    analytics;

  return (
    <section className="ca-card" aria-label="Opportunity scanner">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Opportunity scanner &amp; desk ratios
      </h2>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
        Rule-based scores from RSI, moving averages, MACD, and realized vol — same 2y history as
        the live quote feed. Not investment advice.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
          fontSize: "0.75rem",
        }}
      >
        <span className="ca-pill ca-pill--muted">
          Breadth {marketBreadth.advancers}↑ {marketBreadth.decliners}↓ {marketBreadth.neutral} —
        </span>
        <span className="ca-pill ca-pill--muted">Sentiment {analytics.sentiment}</span>
      </div>

      {sectorRotation.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.8rem", margin: "0 0 0.5rem", color: "var(--text-secondary)" }}>
            Sector rotation (avg %chg 24h)
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              fontSize: "0.78rem",
              display: "grid",
              gap: "0.35rem",
            }}
          >
            {sectorRotation.map((s) => (
              <li key={s.sector}>
                <strong>{s.label}:</strong>{" "}
                <span
                  style={{
                    color:
                      s.avgChange24h > 0
                        ? "var(--positive, #4ade80)"
                        : s.avgChange24h < 0
                          ? "var(--negative, #f87171)"
                          : "inherit",
                  }}
                >
                  {s.avgChange24h > 0 ? "+" : ""}
                  {s.avgChange24h}%
                </span>{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  ({s.constituents.slice(0, 3).join(", ")}
                  {s.constituents.length > 3 ? "…" : ""})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {spreads.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.8rem", margin: "0 0 0.5rem", color: "var(--text-secondary)" }}>
            Cross-commodity marks
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              fontSize: "0.78rem",
              display: "grid",
              gap: "0.35rem",
            }}
          >
            {spreads.map((sp) => (
              <li key={sp.label}>
                <strong>{sp.label}:</strong> {sp.value} — <span style={{ color: "var(--text-secondary)" }}>{sp.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.75rem",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-secondary)" }}>
              <th style={{ padding: "0.35rem 0.5rem 0.35rem 0" }}>Contract</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Score</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>RSI14</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Tags</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border-subtle, #333)" }}>
                <td style={{ padding: "0.4rem 0.5rem 0.4rem 0" }}>{r.commodity}</td>
                <td style={{ padding: "0.4rem 0.5rem", fontVariantNumeric: "tabular-nums" }}>
                  {r.opportunityScore ?? "—"}
                </td>
                <td style={{ padding: "0.4rem 0.5rem", fontVariantNumeric: "tabular-nums" }}>
                  {r.rsi14 != null ? r.rsi14.toFixed(1) : "—"}
                </td>
                <td style={{ padding: "0.4rem 0.5rem" }}>
                  {(r.opportunityTags ?? []).join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {seasonalityHints.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "0.8rem", margin: "0 0 0.5rem", color: "var(--text-secondary)" }}>
            Coarse seasonality (best month by average month-end return, ~2y sample)
          </h3>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.74rem", display: "grid", gap: "0.35rem" }}>
            {seasonalityHints.slice(0, 8).map((h) => (
              <li key={h.symbol}>
                <strong>{h.commodity}:</strong> {h.strongestMonths}
                {h.avgStrongestMonthReturnPct != null
                  ? ` (~${h.avgStrongestMonthReturnPct > 0 ? "+" : ""}${h.avgStrongestMonthReturnPct}% avg)`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
