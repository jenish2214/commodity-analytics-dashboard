"use client";

import {
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { PortfolioPieChart } from "@/components/PortfolioPieChart";
import { StatCard } from "@/components/StatCard";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useUserStore } from "@/store/userStore";
import type { PortfolioItem, PortfolioItemStatus, PortfolioItemType } from "@/types/models";
import {
  formatCurrencyAmount,
  formatPercent,
  formatSignedCurrency,
} from "@/utils/format";

type FilterTab = "all" | "open" | "closed";
type SortKey = "name" | "value" | "date" | "gain";

const TYPES: PortfolioItemType[] = [
  "Commodity",
  "Stock",
  "Crypto",
  "ETF",
  "Other",
];

function gainPct(item: PortfolioItem): number {
  if (item.buyPrice <= 0) return 0;
  return ((item.currentPrice - item.buyPrice) / item.buyPrice) * 100;
}

export function PortfolioView() {
  const currency = useUserStore((s) => s.currency);
  const symbol = useUserStore((s) => s.currencySymbol);

  const holdings = usePortfolioStore((s) => s.holdings);
  const allocation = usePortfolioStore((s) => s.allocation);
  const totals = usePortfolioStore((s) => s.totals);
  const loading = usePortfolioStore((s) => s.loading);
  const items = usePortfolioStore((s) => s.items);
  const addItem = usePortfolioStore((s) => s.addItem);
  const updateItem = usePortfolioStore((s) => s.updateItem);
  const removeItem = usePortfolioStore((s) => s.removeItem);
  const toggleStatus = usePortfolioStore((s) => s.toggleStatus);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<PortfolioItemType>("Commodity");
  const [formBuy, setFormBuy] = useState("");
  const [formCurrent, setFormCurrent] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formStatus, setFormStatus] = useState<PortfolioItemStatus>("Open");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  const openItems = useMemo(
    () => items.filter((i) => i.status === "Open"),
    [items]
  );
  const closedItems = useMemo(
    () => items.filter((i) => i.status === "Closed"),
    [items]
  );

  const { totalValue, totalGain, gainPercent } = useMemo(() => {
    let tv = 0;
    let tg = 0;
    let cb = 0;
    for (const i of openItems) {
      tv += i.currentPrice * i.quantity;
      tg += (i.currentPrice - i.buyPrice) * i.quantity;
      cb += i.buyPrice * i.quantity;
    }
    const gp = cb > 0 ? (tg / cb) * 100 : 0;
    return {
      totalValue: tv,
      totalGain: tg,
      gainPercent: gp,
      costBasisOpen: cb,
    };
  }, [openItems]);

  const filteredSorted = useMemo(() => {
    let list = [...items];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (filter === "open") list = list.filter((i) => i.status === "Open");
    if (filter === "closed") list = list.filter((i) => i.status === "Closed");

    list.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "value": {
          const va =
            a.status === "Open" ? a.currentPrice * a.quantity : 0;
          const vb =
            b.status === "Open" ? b.currentPrice * b.quantity : 0;
          return vb - va;
        }
        case "date":
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
        case "gain":
          return gainPct(b) - gainPct(a);
        default:
          return 0;
      }
    });
    return list;
  }, [items, search, filter, sort]);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormType("Commodity");
    setFormBuy("");
    setFormCurrent("");
    setFormQty("");
    setFormStatus("Open");
    setFormNotes("");
    setFormError("");
    setEditingId(null);
  }, []);

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormType(item.type);
    setFormBuy(String(item.buyPrice));
    setFormCurrent(String(item.currentPrice));
    setFormQty(String(item.quantity));
    setFormStatus(item.status);
    setFormNotes(item.notes ?? "");
    setFormError("");
    setModalOpen(true);
  };

  const saveModal = () => {
    const buy = Number(formBuy);
    const cur = Number(formCurrent);
    const qty = Number(formQty);
    if (!formName.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!(buy > 0) || !(cur > 0) || !(qty > 0)) {
      setFormError("Prices and quantity must be greater than zero.");
      return;
    }
    setFormError("");
    if (editingId) {
      updateItem(editingId, {
        name: formName.trim(),
        type: formType,
        buyPrice: buy,
        currentPrice: cur,
        quantity: qty,
        status: formStatus,
        notes: formNotes.trim() || undefined,
      });
    } else {
      addItem({
        name: formName.trim(),
        type: formType,
        buyPrice: buy,
        currentPrice: cur,
        quantity: qty,
        status: formStatus,
        notes: formNotes.trim() || undefined,
      });
    }
    setModalOpen(false);
    resetForm();
  };

  const onDelete = (id: string) => {
    if (window.confirm("Delete this position?")) {
      removeItem(id);
    }
  };

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Portfolio</h1>
      <p className="ca-page__lead">
        Manage positions with local persistence. API snapshot below for reference.
      </p>

      {loading && holdings.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading market snapshot…</p>
      ) : null}

      <div className="ca-stat-grid" style={{ marginBottom: "1.25rem" }}>
        <StatCard
          label="Total Value (open)"
          value={formatCurrencyAmount(totalValue, currency)}
        />
        <StatCard
          label="Total Gain / Loss"
          value={formatSignedCurrency(totalGain, currency)}
          hint={formatPercent(gainPercent)}
        />
        <StatCard
          label="Open Positions"
          value={String(openItems.length)}
        />
        <StatCard
          label="Closed Positions"
          value={String(closedItems.length)}
        />
      </div>

      <div className="ca-toolbar">
        <input
          type="search"
          className="ca-input"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "open", "closed"] as FilterTab[]).map((f) => (
            <button
              key={f}
              type="button"
              className={
                filter === f
                  ? "ca-filter-tab ca-filter-tab--active"
                  : "ca-filter-tab"
              }
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "open" ? "Open" : "Closed"}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Sort
          </span>
          <select
            className="ca-input"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ width: "auto", minWidth: 140 }}
          >
            <option value="name">Name</option>
            <option value="value">Value</option>
            <option value="date">Date</option>
            <option value="gain">Gain %</option>
          </select>
        </label>
        <button type="button" className="ca-btn-primary" onClick={openAdd}>
          + Add Position
        </button>
      </div>

      {filteredSorted.length === 0 ? (
        <p style={{ textAlign: "center", padding: "3rem 1rem" }}>
          No positions yet. Add your first position.
        </p>
      ) : (
        <div className="ca-table-wrap" style={{ overflowX: "auto" }}>
          <table className="ca-portfolio-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Buy Price</th>
                <th>Current Price</th>
                <th>Qty</th>
                <th>Total Value</th>
                <th>Gain/Loss %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((row) => {
                const g = gainPct(row);
                const lineValue =
                  row.status === "Open" ? row.currentPrice * row.quantity : 0;
                return (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600 }}>{row.name}</td>
                    <td>{row.type}</td>
                    <td>
                      {symbol}
                      {row.buyPrice.toFixed(2)}
                    </td>
                    <td>
                      {symbol}
                      {row.currentPrice.toFixed(2)}
                    </td>
                    <td>{row.quantity}</td>
                    <td>
                      {row.status === "Open"
                        ? formatCurrencyAmount(lineValue, currency)
                        : "—"}
                    </td>
                    <td
                      className={g >= 0 ? "ca-gain" : "ca-loss"}
                    >
                      {formatPercent(g)}
                    </td>
                    <td>
                      <span
                        className={
                          row.status === "Open"
                            ? "ca-badge-open"
                            : "ca-badge-closed"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="ca-icon-btn"
                          aria-label="Toggle status"
                          onClick={() => toggleStatus(row.id)}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          type="button"
                          className="ca-icon-btn"
                          aria-label="Edit"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="ca-icon-btn"
                          aria-label="Delete"
                          onClick={() => onDelete(row.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "2rem",
          gridTemplateColumns: "minmax(0, 1fr)",
        }}
      >
        <section className="ca-card">
          <h2
            className="ca-page__title"
            style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
          >
            Market snapshot (API)
          </h2>
          <div className="ca-table-wrap">
            <table className="ca-table">
              <thead>
                <tr>
                  <th scope="col">Commodity</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Average Price</th>
                  <th scope="col">Current Price</th>
                  <th scope="col">Profit / Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.commodity}</td>
                    <td>
                      {h.quantity} {h.unit}
                    </td>
                    <td className="ca-num">
                      {formatCurrencyAmount(h.averagePrice, currency)}
                    </td>
                    <td className="ca-num">
                      {formatCurrencyAmount(h.currentPrice, currency)}
                    </td>
                    <td
                      className={`ca-num ${h.profitLoss >= 0 ? "ca-gain" : "ca-loss"}`}
                    >
                      {formatSignedCurrency(h.profitLoss, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="ca-card">
          <h2
            className="ca-page__title"
            style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
          >
            Allocation (API)
          </h2>
          <PortfolioPieChart data={allocation} />
          <ul
            style={{
              margin: "1rem 0 0",
              padding: 0,
              listStyle: "none",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            {allocation.map((a) => (
              <li
                key={a.symbol}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>{a.label}</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {a.percent}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {modalOpen ? (
        <div
          className="ca-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="portfolio-modal-title"
        >
          <div className="ca-modal">
            <h2 id="portfolio-modal-title" className="ca-page__title">
              {editingId ? "Edit position" : "Add position"}
            </h2>
            {formError ? (
              <p className="ca-loss" style={{ marginBottom: 12 }}>
                {formError}
              </p>
            ) : null}
            <div style={{ display: "grid", gap: 12 }}>
              <label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Name
                </span>
                <input
                  className="ca-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </label>
              <label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Type
                </span>
                <select
                  className="ca-input"
                  value={formType}
                  onChange={(e) =>
                    setFormType(e.target.value as PortfolioItemType)
                  }
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Buy price ({symbol})
                </span>
                <input
                  className="ca-input"
                  type="number"
                  min={0}
                  step="any"
                  value={formBuy}
                  onChange={(e) => setFormBuy(e.target.value)}
                />
              </label>
              <label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Current price ({symbol})
                </span>
                <input
                  className="ca-input"
                  type="number"
                  min={0}
                  step="any"
                  value={formCurrent}
                  onChange={(e) => setFormCurrent(e.target.value)}
                />
              </label>
              <label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Quantity
                </span>
                <input
                  className="ca-input"
                  type="number"
                  min={0}
                  step="any"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                />
              </label>
              <label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Status
                </span>
                <select
                  className="ca-input"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as PortfolioItemStatus)
                  }
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
              <label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Notes
                </span>
                <textarea
                  className="ca-input"
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                type="button"
                className="ca-btn-ghost"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button type="button" className="ca-btn-primary" onClick={saveModal}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
