"use client";

import { COMMODITY_OPTIONS } from "@/lib/constants";
import { useAlertStore } from "@/store/alertStore";
import type { CommodityKey } from "@/types/models";

export function AlertDock() {
  const rules = useAlertStore((s) => s.rules);
  const triggered = useAlertStore((s) => s.triggered);
  const toggleRule = useAlertStore((s) => s.toggleRule);
  const clearTriggered = useAlertStore((s) => s.clearTriggered);

  try {
    return (
      <section className="ca-card" aria-label="Price alerts">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <h2 className="ca-page__title" style={{ fontSize: "1rem", margin: 0 }}>
            Alerts
          </h2>
          {triggered.length > 0 ? (
            <button
              type="button"
              className="ca-chip"
              onClick={() => clearTriggered()}
              style={{ fontSize: "0.72rem" }}
            >
              Clear fired
            </button>
          ) : null}
        </div>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
          Demo rules (off by default). Thresholds are USD contract prices except the silver rule (|24h %| ≥ 5%).
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.35rem", fontSize: "0.78rem" }}>
          {rules.map((r) => (
            <li key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={() => toggleRule(r.id)}
                id={`alert-${r.id}`}
              />
              <label htmlFor={`alert-${r.id}`} style={{ cursor: "pointer", flex: 1 }}>
                {COMMODITY_OPTIONS.find((c) => c.key === r.commodity)?.label ?? r.commodity}{" "}
                {r.pctAbsTrigger != null ? (
                  <>move ≥ {r.pctAbsTrigger}%</>
                ) : (
                  <>
                    {r.op === "gt" ? ">" : "<"} ${r.thresholdUsd}
                  </>
                )}
              </label>
            </li>
          ))}
        </ul>
        {triggered.length > 0 ? (
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.5rem",
              borderRadius: 8,
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              fontSize: "0.78rem",
            }}
          >
            <strong>Triggered</strong>
            <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1rem" }}>
              {triggered.slice(0, 5).map((t) => (
                <li key={`${t.ruleId}-${t.triggeredAt}`}>{t.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    );
  } catch {
    return null;
  }
}
