import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CommodityKey, MarketRow } from "@/types/models";

export type PriceAlertRule = {
  id: string;
  commodity: CommodityKey;
  /** Compare spot `priceUsd` in contract units. */
  op: "gt" | "lt";
  thresholdUsd: number;
  /** When set, also fires when |24h % change| ≥ this value (e.g. 5 for a 5% move). */
  pctAbsTrigger?: number;
  enabled: boolean;
};

export type TriggeredAlert = {
  ruleId: string;
  message: string;
  triggeredAt: number;
};

type AlertState = {
  rules: PriceAlertRule[];
  triggered: TriggeredAlert[];
  addRule: (rule: Omit<PriceAlertRule, "id">) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  clearTriggered: () => void;
  /** Call after market refresh; idempotent per rule until cleared. */
  evaluateMarket: (market: MarketRow[]) => void;
};

const DEFAULT_RULES: PriceAlertRule[] = [
  {
    id: "demo-gold",
    commodity: "gold",
    op: "gt",
    thresholdUsd: 2400,
    enabled: false,
  },
  {
    id: "demo-oil",
    commodity: "crudeOil",
    op: "lt",
    thresholdUsd: 70,
    enabled: false,
  },
  {
    id: "demo-silver-move",
    commodity: "silver",
    op: "gt",
    thresholdUsd: 1e12,
    pctAbsTrigger: 5,
    enabled: false,
  },
];

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      rules: DEFAULT_RULES,
      triggered: [],

      addRule: (rule) => {
        try {
          const id =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `alert-${Date.now()}`;
          set((s) => ({
            rules: [...s.rules, { ...rule, id }],
          }));
        } catch {
          /* ignore */
        }
      },

      removeRule: (id) => {
        try {
          set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }));
        } catch {
          /* ignore */
        }
      },

      toggleRule: (id) => {
        try {
          set((s) => ({
            rules: s.rules.map((r) =>
              r.id === id ? { ...r, enabled: !r.enabled } : r
            ),
          }));
        } catch {
          /* ignore */
        }
      },

      clearTriggered: () => set({ triggered: [] }),

      evaluateMarket: (market) => {
        try {
          const { rules, triggered } = get();
          const newHits: TriggeredAlert[] = [];
          const seen = new Set(triggered.map((t) => t.ruleId));

          for (const rule of rules) {
            if (!rule.enabled) continue;
            const row = market.find((m) => m.symbol === rule.commodity);
            if (!row || !Number.isFinite(row.priceUsd)) continue;

            let fire = false;
            if (
              rule.pctAbsTrigger != null &&
              Math.abs(row.change24h) >= rule.pctAbsTrigger
            ) {
              fire = true;
            } else {
              if (rule.op === "gt" && row.priceUsd > rule.thresholdUsd) {
                fire = true;
              }
              if (rule.op === "lt" && row.priceUsd < rule.thresholdUsd) {
                fire = true;
              }
            }

            if (fire && !seen.has(rule.id)) {
              newHits.push({
                ruleId: rule.id,
                message: `${row.commodity} ${rule.op === "gt" ? "above" : "below"} $${rule.thresholdUsd} (now ${row.priceUsd.toFixed(2)})`,
                triggeredAt: Date.now(),
              });
              seen.add(rule.id);
            }
          }

          if (newHits.length > 0) {
            set({
              triggered: [...newHits, ...triggered].slice(0, 50),
            });
          }
        } catch (e) {
          console.error("alert evaluateMarket:", e);
        }
      },
    }),
    {
      name: "ca_price_alerts",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ rules: s.rules, triggered: s.triggered }),
    }
  )
);
