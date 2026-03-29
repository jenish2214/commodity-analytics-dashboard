"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Activity, BarChart3, Settings, Maximize2, Minimize2 } from "lucide-react";
import { useMarketDataStore } from "@/store/marketDataStore";
import type { ChartPoint, CommodityKey, TimeRange } from "@/types/models";

interface TradingViewProps {
  symbol?: CommodityKey;
  showFullChart?: boolean;
}

const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "6M", "1Y"];

export function TradingView({ symbol: propSymbol, showFullChart = false }: TradingViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    market,
    chartPoints,
    selectedSymbol,
    timeRange,
    setSelectedSymbol,
    setTimeRange,
    fetchChart,
    loading
  } = useMarketDataStore();

  const currentSymbol = propSymbol || selectedSymbol;
  const currentData = market.find(item => item.symbol === currentSymbol);

  useEffect(() => {
    if (currentSymbol) {
      setSelectedSymbol(currentSymbol);
      fetchChart();
    }
  }, [currentSymbol, setSelectedSymbol, fetchChart]);

  useEffect(() => {
    if (chartPoints.length > 0 && canvasRef.current) {
      drawChart();
    }
  }, [chartPoints, timeRange]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (chartPoints.length === 0) return;

    // Find min and max values for scaling
    const prices = chartPoints.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Draw grid lines
    ctx.strokeStyle = 'var(--border)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), padding.left - 10, y + 4);
    }

    // Vertical grid lines
    const pointCount = chartPoints.length;
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw price line
    ctx.strokeStyle = (currentData?.change24h ?? 0) >= 0 ? 'var(--gain)' : 'var(--loss)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartPoints.forEach((point, index) => {
      const x = padding.left + (chartWidth / (pointCount - 1)) * index;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    if ((currentData?.change24h ?? 0) >= 0) {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    chartPoints.forEach((point, index) => {
      const x = padding.left + (chartWidth / (pointCount - 1)) * index;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw data points
    ctx.fillStyle = (currentData?.change24h ?? 0) >= 0 ? 'var(--gain)' : 'var(--loss)';
    chartPoints.forEach((point, index) => {
      const x = padding.left + (chartWidth / (pointCount - 1)) * index;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!currentData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: 'var(--text-secondary)',
      }}>
        No data available
      </div>
    );
  }

  const changePercent = currentData.change24h ? ((currentData.change24h / currentData.price) * 100).toFixed(2) : '0.00';
  const isPositive = (currentData.change24h ?? 0) >= 0;

  return (
    <div 
      ref={containerRef}
      className={`ca-trading-view ${isFullscreen ? 'ca-trading-view--fullscreen' : ''}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1000 : 1,
        height: isFullscreen ? '100vh' : showFullChart ? '500px' : '400px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
            {currentData.commodity}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>
              ${currentData.price.toFixed(2)}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              background: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isPositive ? 'var(--gain)' : 'var(--loss)',
            }}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span style={{ fontWeight: 600 }}>
                {isPositive ? '+' : ''}{currentData.change24h.toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <Settings size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: timeRange === range ? 'var(--accent)' : 'var(--bg-hover)',
              border: timeRange === range ? '1px solid var(--accent)' : '1px solid var(--border)',
              color: timeRange === range ? 'var(--bg-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
          }}>
            <Activity size={24} className="animate-spin" />
            <span style={{ marginLeft: '0.5rem' }}>Loading chart...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
            }}
          />
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: 'var(--shadow-card)',
          zIndex: 10,
          minWidth: '200px',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Chart Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: '0.875rem' }}>Show Grid</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: '0.875rem' }}>Show Volume</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" />
              <span style={{ fontSize: '0.875rem' }}>Show MA Lines</span>
            </label>
          </div>
        </div>
      )}

      {/* Close button for fullscreen */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            padding: '0.5rem',
            borderRadius: '6px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          × Close
        </button>
      )}
    </div>
  );
}
