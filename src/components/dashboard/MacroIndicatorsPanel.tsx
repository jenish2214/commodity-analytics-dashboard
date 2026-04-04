"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

type MacroRow = {
  name: string;
  price: number;
  changePct: number;
};

export function MacroIndicatorsPanel() {
  const [rows, setRows] = useState<MacroRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/indices", { cache: "no-store" });
        const data = await res.json();
        const indices = data.indices as { name: string; changePct: number; price: number }[];
        const pick = ["S&P 500", "Dow Jones", "NASDAQ", "VIX", "Nifty 50", "FTSE 100"];
        const filtered = pick
          .map((n) => indices.find((i) => i.name === n))
          .filter(Boolean) as typeof indices;
        const slice = (filtered.length ? filtered : indices).slice(0, 4);
        if (!cancelled) {
          setRows(
            slice.map((i) => ({
              name: i.name,
              price: i.price,
              changePct: i.changePct,
            }))
          );
        }
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="ca-card" aria-label="Global macro indicators">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
        Global macro
      </h2>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
        Equity &amp; vol proxies via indices feed — use as risk backdrop for commodities.
      </p>
      {loading ? (
        <div className="ca-skeleton" style={{ height: 120 }} aria-busy />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.5rem" }}>
          {rows.map((r) => {
            const up = r.changePct >= 0;
            return (
              <li
                key={r.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Globe size={14} aria-hidden /> {r.name}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                  {r.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                  <span className={up ? "ca-gain" : "ca-loss"}>
                    {up ? "+" : ""}
                    {r.changePct.toFixed(2)}%
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
