"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Globe, Clock, Activity } from "lucide-react";
import { getMarketStatus } from "@/utils/marketStatus";

interface MarketIndex {
  symbol: string;
  name: string;
  country: string;
  currency: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  high: number;
  low: number;
  timestamp: number;
  status: string;
}

interface GroupedIndices {
  [country: string]: MarketIndex[];
}

interface Summary {
  total: number;
  marketsUp: number;
  marketsDown: number;
  avgChange: number;
}

export function MarketIndicesView() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [groupedIndices, setGroupedIndices] = useState<GroupedIndices>({});
  const [summary, setSummary] = useState<Summary>({ total: 0, marketsUp: 0, marketsDown: 0, avgChange: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [marketStatus, setMarketStatus] = useState(getMarketStatus());
  const prevMarketStatus = useRef(marketStatus);

  useEffect(() => {
    fetchIndices();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchIndices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Market specific status tracking and notifications
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const newStatus = getMarketStatus();
      const prev = prevMarketStatus.current;
      
      const changes: string[] = [];
      const warnings: string[] = [];

      if (newStatus.nyse.open !== prev.nyse.open) {
        changes.push(`NYSE is now ${newStatus.nyse.open ? "Open" : "Closed"}`);
      }
      if (newStatus.london.open !== prev.london.open) {
        changes.push(`London market is now ${newStatus.london.open ? "Open" : "Closed"}`);
      }
      
      const checkWarning = (market: any, prevMarket: any) => {
        if (market.minsToOpen <= 30 && prevMarket.minsToOpen > 30) {
          warnings.push(`${market.label} opens in 30 minutes!`);
        }
        if (market.minsToClose <= 30 && prevMarket.minsToClose > 30) {
          warnings.push(`${market.label} closes in 30 minutes!`);
        }
      };

      if ('minsToOpen' in newStatus.nyse) checkWarning(newStatus.nyse, prev.nyse);
      if ('minsToOpen' in newStatus.london) checkWarning(newStatus.london, prev.london);
      
      const allAlerts = [...changes, ...warnings];
      if (allAlerts.length > 0) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Market Alert", {
            body: allAlerts.join("\n"),
          });
        }
      }
      
      prevMarketStatus.current = newStatus;
      setMarketStatus(newStatus);
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchIndices = async () => {
    try {
      const res = await fetch("/api/indices");
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setIndices(data.indices || []);
      setGroupedIndices(data.groupedByCountry || {});
      setSummary(data.summary || { total: 0, marketsUp: 0, marketsDown: 0, avgChange: 0 });
      setLastUpdate(new Date(data.fetchedAt));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch market indices");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    // Map currency codes to standard ISO codes
    const currencyMap: Record<string, string> = {
      "USD": "USD",
      "GBP": "GBP", 
      "EUR": "EUR",
      "JPY": "JPY",
      "HKD": "HKD",
      "CNY": "CNY",
      "SGD": "SGD",
      "INR": "INR",
      "CAD": "CAD",
      "AUD": "AUD",
      "MXN": "MXN",
      "BRL": "BRL",
    };

    const isoCurrency = currencyMap[currency] || "USD";
    
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: isoCurrency,
        minimumFractionDigits: isoCurrency === "JPY" ? 0 : 2,
        maximumFractionDigits: isoCurrency === "JPY" ? 0 : 2,
      }).format(value);
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      const symbol = isoCurrency === "USD" ? "$" : 
                     isoCurrency === "EUR" ? "€" :
                     isoCurrency === "GBP" ? "£" :
                     isoCurrency === "JPY" ? "¥" :
                     isoCurrency === "CNY" ? "¥" :
                     isoCurrency === "INR" ? "₹" :
                     isoCurrency === "CAD" ? "C$" :
                     isoCurrency === "AUD" ? "A$" :
                     isoCurrency === "SGD" ? "S$" :
                     isoCurrency === "MXN" ? "Mex$" :
                     isoCurrency === "BRL" ? "R$" : isoCurrency;
      
      return `${symbol}${value.toFixed(isoCurrency === "JPY" ? 0 : 2)}`;
    }
  };

  const formatPercent = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredIndices = () => {
    if (selectedCountry === "All") {
      return indices;
    }
    return groupedIndices[selectedCountry] || [];
  };

  const countries = ["All", ...Object.keys(groupedIndices)];

  return (
    <div className="ca-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 className="ca-page__title">Global Market Indices</h1>
          <p className="ca-page__lead">Real-time market indices from around the world</p>
        </div>
        <button
          onClick={fetchIndices}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="ca-stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="ca-stat-card">
          <p className="ca-stat-card__label">Total Markets</p>
          <p className="ca-stat-card__value">{summary.total}</p>
        </div>
        <div className="ca-stat-card">
          <p className="ca-stat-card__label">Markets Up</p>
          <p className="ca-stat-card__value" style={{ color: "var(--gain)" }}>
            {summary.marketsUp}
          </p>
        </div>
        <div className="ca-stat-card">
          <p className="ca-stat-card__label">Markets Down</p>
          <p className="ca-stat-card__value" style={{ color: "var(--loss)" }}>
            {summary.marketsDown}
          </p>
        </div>
        <div className="ca-stat-card">
          <p className="ca-stat-card__label">Avg Change</p>
          <p className="ca-stat-card__value" style={{ 
            color: summary.avgChange > 0 ? "var(--gain)" : summary.avgChange < 0 ? "var(--loss)" : "var(--text-primary)"
          }}>
            {formatPercent(summary.avgChange)}
          </p>
        </div>
      </div>

      {/* Global Exchange Hours */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={18} style={{ color: "var(--accent)" }} />
          Global Exchange Hours
        </h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {([marketStatus.nyse, marketStatus.london, marketStatus.metals]).map((market) => (
            <div
              key={market.label}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "1rem",
                borderRadius: "8px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>{market.label}</span>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  background: market.open ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: market.open ? "var(--gain)" : "var(--loss)",
                  fontSize: "0.75rem",
                  fontWeight: 600
                }}>
                  {market.open ? "OPEN" : "CLOSED"}
                </span>
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {market.statusText || (market.open ? "Trading actively" : "Trading halted")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country Filter */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
          <Globe size={16} style={{ color: "var(--text-secondary)" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
            Filter by Country:
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {countries.map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: selectedCountry === country ? 'var(--accent)' : 'var(--bg-hover)',
                border: selectedCountry === country ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: selectedCountry === country ? 'var(--bg-primary)' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          <Clock size={14} />
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          background: 'var(--loss)',
          color: 'white',
          borderRadius: '6px',
          marginBottom: '1rem',
        }}>
          Error: {error}
        </div>
      )}

      {loading && indices.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{
              padding: '1rem',
              background: 'var(--bg-hover)',
              borderRadius: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ height: '20px', borderRadius: '4px', background: 'var(--bg-card)', marginBottom: '0.5rem' }} />
              <div style={{ height: '16px', borderRadius: '4px', background: 'var(--bg-card)', width: '80%' }} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Indices Grid */}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {getFilteredIndices().map((index) => (
          <div
            key={index.symbol}
            className="ca-card"
            style={{
              padding: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  {index.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                  {index.country} • {index.symbol}
                </p>
              </div>
              <div style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: index.status === 'POST' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: index.status === 'POST' ? 'var(--gain)' : 'var(--loss)',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}>
                {index.status === 'POST' ? 'OPEN' : 'CLOSED'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(index.price, index.currency)}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: index.change > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: index.change > 0 ? 'var(--gain)' : 'var(--loss)',
              }}>
                {index.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {formatPercent(index.changePct)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>H: {formatCurrency(index.high, index.currency)}</span>
              <span>L: {formatCurrency(index.low, index.currency)}</span>
              <span>{formatTime(index.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>

      {indices.length === 0 && !loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--text-secondary)',
        }}>
          <p>No market data available at the moment.</p>
          <button
            onClick={fetchIndices}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
