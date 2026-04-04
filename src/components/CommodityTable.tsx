"use client";

import Link from "next/link";
import { Fragment, useMemo, useState, useCallback, type KeyboardEvent } from "react";
import { ChevronRight } from "lucide-react";
import type { MarketRow } from "@/types/models";
import { useUserStore } from "@/store/userStore";
import { useMarketDataStore } from "@/store/marketDataStore";
import { convertUsdForDisplay, formatCurrencyAmount, formatPercent } from "@/utils/format";
import { MiniSparkline } from "@/components/terminal/MiniSparkline";

function Signal({ signal }: { signal: MarketRow["signal"] }) {
  const cls =
    signal === "BUY"
      ? "ca-signal ca-gain"
      : signal === "SELL"
        ? "ca-signal ca-loss"
        : "ca-signal ca-signal--hold";
  return <span className={cls}>{signal}</span>;
}

type SortKey = "commodity" | "priceUsd" | "change24h" | "volume" | "signal";

const SIGNAL_ORDER: Record<MarketRow["signal"], number> = {
  BUY: 2,
  HOLD: 1,
  SELL: 0,
};

type Props = {
  rows: MarketRow[];
  title?: string;
  variant?: "full" | "watchlist";
  expandable?: boolean;
};

export function CommodityTable({
  rows,
  title = "Market table",
  variant = "full",
  expandable = false,
}: Props) {
  const currency = useUserStore((s) => s.currency);
  const fxRates = useMarketDataStore((s) => s.fxRates);
  const fxError = useMarketDataStore((s) => s.fxError);
  const fetchedAt = useMarketDataStore((s) => s.commoditiesFetchedAt);

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "commodity",
    dir: "asc",
  });
  const [openId, setOpenId] = useState<string | null>(null);

  const onSort = useCallback((key: SortKey) => {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }, []);

  const sorted = useMemo(() => {
    const list = [...rows];
    const { key, dir } = sort;
    const direction = dir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (key === "commodity") {
        return direction * a.commodity.localeCompare(b.commodity);
      }
      if (key === "priceUsd") {
        return direction * (a.priceUsd - b.priceUsd);
      }
      if (key === "change24h") {
        return direction * (a.change24h - b.change24h);
      }
      if (key === "volume") {
        return direction * a.volume.localeCompare(b.volume, undefined, { numeric: true });
      }
      return direction * (SIGNAL_ORDER[a.signal] - SIGNAL_ORDER[b.signal]);
    });
    return list;
  }, [rows, sort]);

  const headerProps = (key: SortKey) => ({
    role: "columnheader" as const,
    tabIndex: 0,
    "aria-sort":
      sort.key === key
        ? sort.dir === "asc"
          ? ("ascending" as const)
          : ("descending" as const)
        : ("none" as const),
    onClick: () => onSort(key),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSort(key);
      }
    },
  });

  const sortHint = (key: SortKey) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  const watchColSpan = expandable ? 6 : 5;

  const toggleExpand = (id: string) => {
    setOpenId((o) => (o === id ? null : id));
  };

  return (
    <section className={`ca-card ws-panel ${variant === "watchlist" ? "ws-watch-table" : ""}`}>
      <h2 className="ws-panel-title">{title}</h2>
      <p className="ws-panel-lead" style={{ marginTop: "-0.25rem" }}>
        Sortable columns (keyboard: focus header, Enter). Prices use ECB FX when available.
        {expandable ? " Use chevron to expand row details." : ""}
        {fetchedAt ? ` Last fetch: ${new Date(fetchedAt).toLocaleString()}.` : ""}
        {fxError ? ` ${fxError}` : ""}
      </p>
      <div className="ca-table-wrap">
        <table className="ca-table table-sortable ws-table">
          <thead>
            <tr>
              {expandable && variant === "watchlist" ? (
                <th scope="col" className="ca-table__col-expand">
                  <span className="sr-only">Expand</span>
                </th>
              ) : null}
              <th scope="col" {...headerProps("commodity")}>
                Asset{sortHint("commodity")}
              </th>
              <th scope="col" {...headerProps("priceUsd")}>
                Price (unit){sortHint("priceUsd")}
              </th>
              <th scope="col" {...headerProps("change24h")}>
                Change{sortHint("change24h")}
              </th>
              <th scope="col" {...headerProps("volume")}>
                Volume{sortHint("volume")}
              </th>
              {variant === "watchlist" ? (
                <th scope="col">Trend</th>
              ) : (
                <>
                  <th scope="col">Market cap</th>
                  <th scope="col" {...headerProps("signal")}>
                    Signal{sortHint("signal")}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const conv = convertUsdForDisplay(r.priceUsd, currency, fxRates);
              const spark =
                r.sparkline && r.sparkline.length > 1
                  ? r.sparkline
                  : [r.priceUsd * 0.98, r.priceUsd, r.priceUsd * 1.01];
              const isOpen = openId === r.id;
              return (
                <Fragment key={r.id}>
                  <tr
                    className={`ws-table__row${expandable && variant === "watchlist" ? " ws-table__row--hoverable" : ""}${isOpen ? " ws-table__row--open" : ""}`}
                  >
                    {expandable && variant === "watchlist" ? (
                      <td className="ca-table__col-expand">
                        <button
                          type="button"
                          className="ws-table__expand"
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Collapse" : "Expand"} ${r.commodity}`}
                          onClick={() => toggleExpand(r.id)}
                        >
                          <ChevronRight size={16} aria-hidden />
                        </button>
                      </td>
                    ) : null}
                    <td>
                      <Link
                        href={`/commodities/${r.symbol}`}
                        className="ws-table__asset-link"
                      >
                        {r.commodity}
                      </Link>
                    </td>
                    <td className="ca-num">
                      {formatCurrencyAmount(conv.amount, conv.displayCurrency)}
                      {conv.usedUsdFallback ? (
                        <span className="ws-table__micro">USD spot (FX loading)</span>
                      ) : null}
                      <span className="ws-table__unit">/ {r.unit}</span>
                    </td>
                    <td
                      className={`ca-num ${r.change24h >= 0 ? "ca-gain" : "ca-loss"}`}
                    >
                      {formatPercent(r.change24h)}
                    </td>
                    <td>{r.volume}</td>
                    {variant === "watchlist" ? (
                      <td className="ca-num">
                        <MiniSparkline
                          values={spark}
                          positive={r.change24h >= 0}
                          width={88}
                          height={28}
                        />
                      </td>
                    ) : (
                      <>
                        <td>{r.marketCap}</td>
                        <td>
                          <Signal signal={r.signal} />
                        </td>
                      </>
                    )}
                  </tr>
                  {expandable && variant === "watchlist" && isOpen ? (
                    <tr className="ws-table__detail">
                      <td colSpan={watchColSpan}>
                        <div className="ws-table__detail-inner">
                          <p>
                            <strong>Signal</strong> <Signal signal={r.signal} /> ·{" "}
                            <strong>Market cap</strong> {r.marketCap} · <strong>RSI(14)</strong>{" "}
                            {r.rsi14 != null ? r.rsi14.toFixed(1) : "—"}
                          </p>
                          {r.opportunityTags && r.opportunityTags.length > 0 ? (
                            <p>
                              <strong>Tags</strong> {r.opportunityTags.join(", ")}
                            </p>
                          ) : null}
                          <p className="ws-table__micro">
                            Opportunity score: {r.opportunityScore ?? "—"} · Risk index:{" "}
                            {r.riskIndex ?? "—"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
