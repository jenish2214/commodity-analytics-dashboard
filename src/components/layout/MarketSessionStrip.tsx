"use client";

import { useEffect, useState } from "react";
import { getMarketStatus } from "@/utils/marketStatus";

export function MarketSessionStrip() {
  const [status, setStatus] = useState(() => getMarketStatus());

  useEffect(() => {
    const id = setInterval(() => setStatus(getMarketStatus()), 30_000);
    return () => clearInterval(id);
  }, []);

  const pills = [
    { key: "nyse", ...status.nyse },
    { key: "london", ...status.london },
    { key: "metals", ...status.metals },
  ] as const;

  return (
    <div
      className="ca-session-strip"
      role="region"
      aria-label="Trading session status"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        alignItems: "center",
        padding: "0.35rem 1rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-hover)",
        fontSize: "0.75rem",
        color: "var(--text-secondary)",
      }}
    >
      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
        Venues
      </span>
      {pills.map((p) => (
        <span
          key={p.key}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.2rem 0.5rem",
            borderRadius: "6px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: p.open ? "var(--gain, #22c55e)" : "var(--loss, #ef4444)",
            }}
          />
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
            {p.label}
          </span>
          <span>{p.statusText}</span>
        </span>
      ))}
    </div>
  );
}
