"use client";

import { useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  PieChart,
  Shield,
} from "lucide-react";
import { MiniSparkline } from "@/components/terminal/MiniSparkline";
import { useMarketDataStore } from "@/store/marketDataStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUserStore } from "@/store/userStore";
import {
  formatCurrencyAmount,
  formatSignedCurrency,
} from "@/utils/format";

function TrendArrow({ up }: { up: boolean }) {
  return (
    <span className={up ? "ca-gain" : "ca-loss"} aria-hidden>
      {up ? "↑" : "↓"}
    </span>
  );
}

type KPIGridProps = {
  /** Vertical stack for hero column beside main chart */
  layout?: "strip" | "stack";
};

export function KPIGrid({ layout = "strip" }: KPIGridProps) {
  const currency = useUserStore((s) => s.currency);
  const summary = useMarketDataStore((s) => s.summary);
  const market = useMarketDataStore((s) => s.market);
  const items = usePortfolioStore((s) => s.items);
  const allocation = usePortfolioStore((s) => s.allocation);

  const open = useMemo(
    () => items.filter((i) => i.status === "Open"),
    [items]
  );

  const metrics = useMemo(() => {
    let pv = 0;
    let pnl = 0;
    for (const i of open) {
      pv += i.currentPrice * i.quantity;
      pnl += (i.currentPrice - i.buyPrice) * i.quantity;
    }
    const apiDaily = summary.dailyPnl;
    const dayPnl = open.length > 0 ? pnl : apiDaily;

    let maxAllo = 0;
    for (const a of allocation) {
      if (a.percent > maxAllo) maxAllo = a.percent;
    }
    const ris = market
      .map((r) => r.riskIndex)
      .filter((x): x is number => x != null && Number.isFinite(x));
    const riskScore = ris.length
      ? Math.round(ris.reduce((a, b) => a + b, 0) / ris.length)
      : 52;

    const exposurePct =
      allocation.length > 0
        ? Math.min(100, maxAllo)
        : Math.min(95, Math.max(28, market.length * 7));

    return {
      portfolioValue: pv || summary.portfolioValue,
      dayPnl,
      exposurePct,
      riskScore,
    };
  }, [open, summary, allocation, market]);

  const dayUp = metrics.dayPnl >= 0;
  const bench =
    market[0]?.sparkline ??
    [1, 1.01, 0.99, 1.02];

  const gridClass = layout === "stack" ? "kpi-stack" : "kpi-strip";

  return (
    <div className={gridClass} aria-label="Key performance indicators">
      <article className="kpi-card">
        <p className="kpi-card__label">
          <Wallet size={14} aria-hidden /> Portfolio value
        </p>
        <p className="kpi-card__value">
          {formatCurrencyAmount(metrics.portfolioValue, currency)}
        </p>
        <div className="kpi-card__meta">
          <span>
            <TrendArrow up={dayUp} /> Session drift
          </span>
          <MiniSparkline values={bench} positive={dayUp} width={80} height={28} />
        </div>
      </article>

      <article className="kpi-card">
        <p className="kpi-card__label">
          <TrendingUp size={14} aria-hidden /> Today P/L
        </p>
        <p className={`kpi-card__value ${dayUp ? "ca-gain" : "ca-loss"}`}>
          {formatSignedCurrency(metrics.dayPnl, currency)}
        </p>
        <div className="kpi-card__meta">
          <span className={dayUp ? "ca-gain" : "ca-loss"}>
            {open.length ? "Open book" : "Desk estimate"}
          </span>
          <MiniSparkline
            values={market.slice(0, 5).map((m) => m.change24h + 50)}
            positive={dayUp}
          />
        </div>
      </article>

      <article className="kpi-card">
        <p className="kpi-card__label">
          <PieChart size={14} aria-hidden /> Commodity exposure
        </p>
        <p className="kpi-card__value">{metrics.exposurePct.toFixed(0)}%</p>
        <div className="kpi-card__meta">
          <span>Largest sleeve / breadth</span>
          <MiniSparkline
            values={allocation.slice(0, 8).map((a) => a.percent)}
            positive
          />
        </div>
      </article>

      <article className="kpi-card">
        <p className="kpi-card__label">
          <Shield size={14} aria-hidden /> Risk score
        </p>
        <p className="kpi-card__value">{metrics.riskScore}</p>
        <div className="kpi-card__meta">
          <span>Composite (0–100)</span>
          <MiniSparkline
            values={market.slice(0, 12).map((m) => (m.riskIndex ?? 45) / 10)}
            positive={metrics.riskScore < 60}
          />
        </div>
      </article>
    </div>
  );
}
