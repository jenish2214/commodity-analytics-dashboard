"use client";

import { useMarketDataStore } from "@/store/marketDataStore";
import { useUserStore } from "@/store/userStore";
import type { CurrencyCode, DashboardFont } from "@/types/models";

const FONT_OPTIONS: DashboardFont[] = [
  "Inter",
  "Roboto",
  "Poppins",
  "Playfair Display",
  "JetBrains Mono",
];

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "INR", label: "INR (₹)" },
  { code: "JPY", label: "JPY (¥)" },
];

type Props = {
  onMenuClick?: () => void;
  menuOpen?: boolean;
};

export function TopNavbar({ onMenuClick, menuOpen }: Props) {
  const searchQuery = useMarketDataStore((s) => s.searchQuery);
  const setSearchQuery = useMarketDataStore((s) => s.setSearchQuery);
  const name = useUserStore((s) => s.name);
  const font = useUserStore((s) => s.font);
  const currency = useUserStore((s) => s.currency);
  const setFont = useUserStore((s) => s.setFont);
  const setCurrency = useUserStore((s) => s.setCurrency);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="ca-topbar">
      {onMenuClick ? (
        <button
          type="button"
          className="ca-icon-btn ca-menu-btn"
          aria-label="Toggle sidebar"
          aria-expanded={menuOpen ?? false}
          onClick={onMenuClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
            />
          </svg>
        </button>
      ) : null}
      <label className="ca-topbar__search">
        <span className="sr-only">Search commodities and news</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35"
          />
        </svg>
        <input
          type="search"
          placeholder="Search markets…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
      </label>
      <div className="ca-topbar__actions">
        <label className="ca-topbar__select-wrap">
          <span className="sr-only">Font</span>
          <select
            className="ca-topbar__select"
            value={font}
            onChange={(e) => setFont(e.target.value as DashboardFont)}
            aria-label="Font family"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="ca-topbar__select-wrap">
          <span className="sr-only">Currency</span>
          <select
            className="ca-topbar__select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            aria-label="Currency"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="ca-market-pill" role="status">
          <span className="ca-market-pill__dot" aria-hidden />
          Markets open
        </div>
        <button type="button" className="ca-icon-btn" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5L4 18h16l-2-2z"
            />
          </svg>
        </button>
        <div className="ca-avatar" aria-hidden>
          {initials}
        </div>
      </div>
    </header>
  );
}
