"use client";

import { useMemo } from "react";
import { useAlertStore } from "@/store/alertStore";
import { useMarketDataStore } from "@/store/marketDataStore";

export function ActivityFeed() {
  const triggered = useAlertStore((s) => s.triggered);
  const lastUpdate = useMarketDataStore((s) => s.lastLiveUpdate);
  const fetchedAt = useMarketDataStore((s) => s.commoditiesFetchedAt);

  const events = useMemo(() => {
    const out: { id: string; title: string; time: string; detail: string }[] = [];
    if (lastUpdate > 0) {
      out.push({
        id: "live",
        title: "Quotes refreshed",
        time: new Date(lastUpdate).toLocaleTimeString(),
        detail: "Live commodity strip updated from desk feed.",
      });
    }
    if (fetchedAt) {
      out.push({
        id: "batch",
        title: "Bundle snapshot",
        time: new Date(fetchedAt).toLocaleTimeString(),
        detail: "Analytics & risk co-loaded with spot prices.",
      });
    }
    triggered.slice(0, 5).forEach((t, i) => {
      out.push({
        id: `${t.ruleId}-${i}`,
        title: "Alert fired",
        time: new Date(t.triggeredAt).toLocaleTimeString(),
        detail: t.message,
      });
    });
    return out.slice(0, 8);
  }, [lastUpdate, fetchedAt, triggered]);

  return (
    <section className="ca-card ws-panel ws-rail-card" aria-label="Activity feed">
      <h2 className="ws-panel-title">Activity</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.65rem" }}>
        {events.length === 0 ? (
          <li style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Waiting for session events…
          </li>
        ) : (
          events.map((e) => (
            <li
              key={e.id}
              style={{
                paddingBottom: "0.65rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginBottom: 4,
                }}
              >
                <strong style={{ fontSize: "0.8125rem" }}>{e.title}</strong>
                <time
                  dateTime={e.time}
                  style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}
                >
                  {e.time}
                </time>
              </div>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                {e.detail}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
