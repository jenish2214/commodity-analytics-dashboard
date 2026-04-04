"use client";

import { COMMODITY_OPTIONS } from "@/lib/constants";
import { useAlertStore } from "@/store/alertStore";
export function AlertDock() {
  const rules = useAlertStore((s) => s.rules);
  const triggered = useAlertStore((s) => s.triggered);
  const toggleRule = useAlertStore((s) => s.toggleRule);
  const clearTriggered = useAlertStore((s) => s.clearTriggered);

  return (
    <section className="ca-card" aria-label="Price alerts" id="desk-alerts">
      <div className="ca-panel-head">
        <h2 className="ca-panel-head__title">Alerts</h2>
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
      <p className="ca-panel-subtle">
        Demo rules (off by default). Thresholds are USD contract prices except the silver rule (|24h %| ≥ 5%).
      </p>
      <ul className="ca-alert-rules">
        {rules.map((r) => (
          <li key={r.id} className="ca-alert-rules__row">
            <input
              type="checkbox"
              checked={r.enabled}
              onChange={() => toggleRule(r.id)}
              id={`alert-${r.id}`}
            />
            <label htmlFor={`alert-${r.id}`} className="ca-alert-rules__label">
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
        <div className="ca-alert-triggered">
          <strong>Triggered</strong>
          <ul className="ca-alert-triggered__list">
            {triggered.slice(0, 5).map((t) => (
              <li key={`${t.ruleId}-${t.triggeredAt}`}>{t.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
