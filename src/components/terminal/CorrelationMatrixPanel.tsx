"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  label: string;
  correlation: number | null;
  sample: number;
};

export function CorrelationMatrixPanel() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/analytics/correlations", { cache: "no-store" });
        const json = (await res.json()) as {
          pairs?: Row[];
          error?: string;
        };
        if (cancelled) return;
        if (json.pairs) {
          setRows(json.pairs);
          setError(json.error ?? null);
        } else {
          setRows([]);
        }
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setError(e instanceof Error ? e.message : "Failed to load correlations");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (rows === null) {
    return (
      <section className="ca-card" aria-busy="true">
        <p style={{ margin: 0, fontSize: "0.875rem" }}>Loading correlation matrix…</p>
      </section>
    );
  }

  return (
    <section className="ca-card" aria-label="Cross-asset correlations">
      <h2 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        Correlation matrix
      </h2>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
        Pearson r on recent daily closes (public Yahoo). {error ? `Note: ${error}` : ""}
      </p>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        {rows.map((r) => {
          const c = r.correlation;
          const hue =
            c == null ? "var(--text-secondary)" : c >= 0 ? "var(--gain)" : "var(--loss)";
          return (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.35rem 0.5rem",
                borderRadius: 6,
                background: "var(--bg-hover)",
                fontSize: "0.78rem",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{r.label}</span>
              <span style={{ color: hue, fontVariantNumeric: "tabular-nums" }}>
                {c == null ? "—" : c.toFixed(2)}
                {r.sample ? ` · n=${r.sample}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
