"use client";

import { useMarketDataStore } from "@/store/marketDataStore";
import { useUserStore } from "@/store/userStore";

type Props = {
  onMenuClick?: () => void;
};

export function TopNavbar({ onMenuClick }: Props) {
  const searchQuery = useMarketDataStore((s) => s.searchQuery);
  const setSearchQuery = useMarketDataStore((s) => s.setSearchQuery);
  const profile = useUserStore((s) => s.profile);

  const initials = profile.name
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
          aria-label="Open navigation"
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
