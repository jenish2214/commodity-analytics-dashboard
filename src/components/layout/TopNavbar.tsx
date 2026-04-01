"use client";

import { Moon, Sun, Search, X } from "lucide-react";
import { useMarketDataStore } from "@/store/marketDataStore";
import { useUserStore } from "@/store/userStore";
import type { CurrencyCode } from "@/types/models";
import { useState, useEffect, useRef } from "react";
import { timeAgo } from "@/utils/format";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "INR", label: "INR (₹)" },
  { code: "JPY", label: "JPY (¥)" },
];

const SEARCH_SUGGESTIONS = [
  "Gold",
  "Silver",
  "Crude Oil",
  "Natural Gas",
  "Copper",
  "Platinum",
  "Wheat",
  "Rice",
  "Corn",
  "Soybean",
  "Coffee",
  "Sugar",
  "Palladium",
  "Market News",
  "Portfolio",
  "Market Indices",
  "Dashboard",
];

type Props = {
  onMenuClick?: () => void;
  menuOpen?: boolean;
};

export function TopNavbar({ onMenuClick, menuOpen }: Props) {
  const searchQuery = useMarketDataStore((s) => s.searchQuery);
  const setSearchQuery = useMarketDataStore((s) => s.setSearchQuery);
  const lastLiveUpdate = useMarketDataStore((s) => s.lastLiveUpdate);
  const fxError = useMarketDataStore((s) => s.fxError);
  const commoditiesFetchedAt = useMarketDataStore((s) => s.commoditiesFetchedAt);
  const name = useUserStore((s) => s.name);
  const theme = useUserStore((s) => s.theme);
  const currency = useUserStore((s) => s.currency);
  const setTheme = useUserStore((s) => s.setTheme);
  const setCurrency = useUserStore((s) => s.setCurrency);

  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Enhanced search functionality with case-insensitive filtering
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = SEARCH_SUGGESTIONS.filter(suggestion =>
      suggestion.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8 suggestions

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    // Convert to proper case - capitalize first letter of each word
    const normalizedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    setSearchQuery(normalizedValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      // Focus first suggestion
      const firstSuggestion = document.querySelector('.ca-search-suggestion') as HTMLElement;
      firstSuggestion?.focus();
    }
  };

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
      <div className="ca-topbar__search-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
        <label className="ca-topbar__search" style={{ position: 'relative', display: 'block' }}>
          <span className="sr-only">Search commodities and news</span>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search markets, commodities, news..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            style={{
              paddingLeft: '40px',
              paddingRight: searchQuery ? '40px' : '12px',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="ca-search-clear-btn"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </label>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            className="ca-search-suggestions"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-card)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              marginTop: '4px',
            }}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                className="ca-search-suggestion"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s ease',
                  borderBottom: index < filteredSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <Search size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ca-topbar__actions">
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
        <button
          type="button"
          className="ca-icon-btn ca-topbar__theme-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="ca-market-pill" role="status" title={fxError ?? undefined}>
          <span
            className={
              lastLiveUpdate > 0
                ? "ca-market-pill__dot ca-market-pill__dot--live"
                : "ca-market-pill__dot"
            }
            aria-hidden
          />
          {lastLiveUpdate > 0 ? "Live quotes" : "Awaiting data"}
          {lastLiveUpdate > 0 ? (
            <span className="ca-market-pill__updated">
              {timeAgo(new Date(lastLiveUpdate).toISOString())}
              {commoditiesFetchedAt
                ? ` · ${currency} via ECB FX`
                : null}
            </span>
          ) : null}
        </div>
        
        {/* Actions */}
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
