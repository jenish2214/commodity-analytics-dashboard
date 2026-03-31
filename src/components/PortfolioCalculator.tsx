"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  Clock,
  Target,
  PieChart as PieIcon,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  usePortfolioCalculatorStore,
  type RiskProfile,
  type AssetAllocation,
} from "@/store/portfolioCalculatorStore";

const RISK_PROFILES: { value: RiskProfile; label: string; description: string; color: string }[] = [
  {
    value: "conservative",
    label: "Conservative",
    description: "Preserve capital, accept lower returns",
    color: "#22c55e",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Balance growth and safety",
    color: "#3b82f6",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    description: "Maximize returns, accept higher risk",
    color: "#f59e0b",
  },
];

const ASSET_COLORS: Record<keyof AssetAllocation, string> = {
  equity: "#0b1f33",
  gold: "#f59e0b",
  silver: "#94a3b8",
  crudeOil: "#dc2626",
  naturalGas: "#7c3aed",
  copper: "#ea580c",
  bonds: "#059669",
  crypto: "#8b5cf6",
  cash: "#64748b",
  realEstate: "#0369a1",
  commodities: "#65a30d",
};

const ASSET_NAMES: Record<keyof AssetAllocation, string> = {
  equity: "Stocks / Equity",
  gold: "Gold",
  silver: "Silver",
  crudeOil: "Crude Oil",
  naturalGas: "Natural Gas",
  copper: "Copper",
  bonds: "Bonds",
  crypto: "Cryptocurrency",
  cash: "Cash",
  realEstate: "Real Estate (REITs)",
  commodities: "Other Commodities",
};

export function PortfolioCalculator() {
  const {
    input,
    metrics,
    recommendation,
    isCalculating,
    setTotalInvestment,
    setMonthlyContribution,
    setInvestmentHorizon,
    setTargetReturn,
    setRiskProfile,
    updateAllocation,
    calculatePortfolio,
    resetCalculator,
  } = usePortfolioCalculatorStore();

  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"input" | "results" | "recommendations">("input");

  // Auto-calculate when allocation changes significantly
  useEffect(() => {
    const timeout = setTimeout(() => {
      calculatePortfolio();
    }, 500);
    return () => clearTimeout(timeout);
  }, [input.allocation, input.totalInvestment, input.riskProfile]);

  const getSafetyColor = (rating: string) => {
    switch (rating) {
      case "A": return "#22c55e";
      case "B": return "#84cc16";
      case "C": return "#eab308";
      case "D": return "#f97316";
      case "F": return "#ef4444";
      default: return "#64748b";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "#22c55e";
      case "medium": return "#eab308";
      case "high": return "#f97316";
      case "extreme": return "#ef4444";
      default: return "#64748b";
    }
  };

  const pieData = Object.entries(input.allocation)
    .filter(([_, value]) => value > 0)
    .map(([asset, value]) => ({
      name: ASSET_NAMES[asset as keyof AssetAllocation],
      value,
      color: ASSET_COLORS[asset as keyof AssetAllocation],
    }));

  return (
    <div className="ca-card" style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              padding: "0.75rem",
              background: "var(--accent)",
              borderRadius: "12px",
              color: "var(--bg-primary)",
            }}
          >
            <Calculator size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              AI Portfolio Risk Calculator
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
              Calculate risk, return, and get AI-powered recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        {[
          { id: "input", label: "Portfolio Input", icon: PieIcon },
          { id: "results", label: "Risk Analysis", icon: Activity },
          { id: "recommendations", label: "AI Recommendations", icon: Target },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              background: activeTab === id ? "var(--accent)" : "transparent",
              color: activeTab === id ? "var(--bg-primary)" : "var(--text-secondary)",
              border: "none",
              borderBottom: activeTab === id ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Input Tab */}
      {activeTab === "input" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Risk Profile Selection */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Select Your Risk Profile
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {RISK_PROFILES.map((profile) => (
                <button
                  key={profile.value}
                  onClick={() => setRiskProfile(profile.value)}
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    border: input.riskProfile === profile.value ? `2px solid ${profile.color}` : "1px solid var(--border)",
                    background: input.riskProfile === profile.value ? `${profile.color}15` : "var(--bg-hover)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: profile.color,
                      }}
                    />
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{profile.label}</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                    {profile.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Total Investment ($)
              </label>
              <input
                type="number"
                value={input.totalInvestment}
                onChange={(e) => setTotalInvestment(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Monthly Contribution ($)
              </label>
              <input
                type="number"
                value={input.monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Investment Horizon (Years)
              </label>
              <input
                type="number"
                value={input.investmentHorizon}
                onChange={(e) => setInvestmentHorizon(Number(e.target.value))}
                min={1}
                max={50}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Target Return (%)
              </label>
              <input
                type="number"
                value={input.targetReturn}
                onChange={(e) => setTargetReturn(Number(e.target.value))}
                min={0}
                max={50}
                step={0.1}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              />
            </div>
          </div>

          {/* Asset Allocation */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                Asset Allocation
              </h3>
              <span
                style={{
                  fontSize: "0.875rem",
                  color:
                    Object.values(input.allocation).reduce((a, b) => a + b, 0) === 100
                      ? "#22c55e"
                      : "#f59e0b",
                }}
              >
                Total: {Object.values(input.allocation).reduce((a, b) => a + b, 0).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {Object.entries(input.allocation).map(([asset, value]) => (
                <div key={asset}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      marginBottom: "0.25rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {ASSET_NAMES[asset as keyof AssetAllocation]}
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => updateAllocation(asset as keyof AssetAllocation, Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => updateAllocation(asset as keyof AssetAllocation, Number(e.target.value))}
                      style={{
                        width: "60px",
                        padding: "0.25rem",
                        borderRadius: "4px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.75rem",
                        textAlign: "center",
                      }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation Pie Chart */}
          <div style={{ height: "250px", display: "flex", gap: "2rem" }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                Allocation Breakdown
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pieData.slice(0, 6).map((item) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: item.color }} />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", flex: 1 }}>{item.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
                {pieData.length > 6 && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                    +{pieData.length - 6} more assets
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={calculatePortfolio}
              disabled={isCalculating}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isCalculating ? "not-allowed" : "pointer",
                opacity: isCalculating ? 0.7 : 1,
                transition: "all 0.2s ease",
              }}
            >
              {isCalculating ? "Calculating..." : "Calculate Risk & Return"}
            </button>
            <button
              onClick={resetCalculator}
              style={{
                padding: "0.75rem 1.5rem",
                background: "var(--bg-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && metrics && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Key Metrics Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {/* Portfolio Value */}
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-hover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <DollarSign size={16} color="var(--accent)" />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Final Portfolio Value</span>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                ${metrics.portfolioValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "0.25rem" }}>
                +{metrics.totalReturnPercentage.toFixed(1)}% total return
              </div>
            </div>

            {/* Annualized Return */}
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-hover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <TrendingUp size={16} color="#22c55e" />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Annualized Return</span>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#22c55e" }}>
                {metrics.annualizedReturn.toFixed(2)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Per year average
              </div>
            </div>

            {/* Volatility */}
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-hover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Activity size={16} color={getRiskColor(metrics.riskLevel)} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Volatility (Risk)</span>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: getRiskColor(metrics.riskLevel) }}>
                {metrics.volatility.toFixed(2)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Standard deviation
              </div>
            </div>

            {/* Sharpe Ratio */}
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-hover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Target size={16} color={metrics.sharpeRatio > 0.5 ? "#22c55e" : "#f59e0b"} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Sharpe Ratio</span>
              </div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: metrics.sharpeRatio > 0.5 ? "#22c55e" : metrics.sharpeRatio > 0.3 ? "#f59e0b" : "#ef4444",
                }}
              >
                {metrics.sharpeRatio.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Risk-adjusted return
              </div>
            </div>

            {/* Safety Rating */}
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-hover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Shield size={16} color={getSafetyColor(metrics.safetyRating)} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Safety Rating</span>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: getSafetyColor(metrics.safetyRating) }}>
                {metrics.safetyRating}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Based on risk metrics
              </div>
            </div>

            {/* Diversification */}
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-hover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <PieIcon size={16} color={metrics.diversificationScore > 70 ? "#22c55e" : "#f59e0b"} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Diversification</span>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {metrics.diversificationScore.toFixed(0)}/100
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Portfolio spread
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div
            style={{
              padding: "1rem",
              background: getRiskColor(metrics.riskLevel) + "15",
              border: `1px solid ${getRiskColor(metrics.riskLevel)}`,
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <AlertTriangle size={20} color={getRiskColor(metrics.riskLevel)} />
              <span style={{ fontWeight: 600, color: getRiskColor(metrics.riskLevel) }}>
                Risk Level: {metrics.riskLevel.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
              Your portfolio has a {metrics.riskLevel} risk profile with {metrics.volatility.toFixed(1)}% volatility.
              {metrics.riskLevel === "low" && " This is suitable for conservative investors prioritizing capital preservation."}
              {metrics.riskLevel === "medium" && " This offers a balanced approach between growth and stability."}
              {metrics.riskLevel === "high" && " This requires careful monitoring and is suitable for experienced investors."}
              {metrics.riskLevel === "extreme" && " This carries significant risk of loss and is only for highly aggressive investors."}
            </p>
          </div>

          {/* Value at Risk */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div style={{ padding: "1rem", background: "var(--bg-hover)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Value at Risk (95%)
              </h4>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>
                ${Math.abs(metrics.var95).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Potential loss in worst 5% of cases
              </p>
            </div>
            <div style={{ padding: "1rem", background: "var(--bg-hover)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Maximum Drawdown
              </h4>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>
                {metrics.maxDrawdown.toFixed(1)}%
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Largest peak-to-trough decline
              </p>
            </div>
            <div style={{ padding: "1rem", background: "var(--bg-hover)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Portfolio Beta
              </h4>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {metrics.beta.toFixed(2)}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Correlation to market (1.0 = market)
              </p>
            </div>
          </div>

          {/* Show Recommendations Button */}
          <button
            onClick={() => setActiveTab("recommendations")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--accent)",
              color: "var(--bg-primary)",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Target size={16} />
            View AI Recommendations
          </button>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && recommendation && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* AI Summary */}
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, var(--accent)15, var(--accent)05)",
              border: "1px solid var(--accent)",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  padding: "0.5rem",
                  background: "var(--accent)",
                  borderRadius: "8px",
                  color: "var(--bg-primary)",
                }}
              >
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                AI Portfolio Analysis
              </h3>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: "1.6", color: "var(--text-primary)", margin: 0 }}>
              {recommendation.summary}
            </p>
          </div>

          {/* Risk Assessment */}
          <div style={{ padding: "1rem", background: "var(--bg-hover)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
              Risk Assessment
            </h4>
            <p style={{ fontSize: "0.875rem", lineHeight: "1.6", color: "var(--text-secondary)", margin: 0 }}>
              {recommendation.riskAssessment}
            </p>
          </div>

          {/* Key Recommendations */}
          {recommendation.recommendations.length > 0 && (
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                Key Recommendations
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {recommendation.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: "var(--bg-hover)",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <CheckCircle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: "1.5" }}>
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Asset Class Suggestions */}
          {recommendation.assetClassSuggestions.length > 0 && (
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                Suggested Allocation Changes
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {recommendation.assetClassSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "1rem",
                      background: "var(--bg-hover)",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {suggestion.asset}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {suggestion.current}% → {suggestion.suggested}%
                        </span>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: suggestion.suggested > suggestion.current ? "#22c55e20" : "#ef444420",
                            color: suggestion.suggested > suggestion.current ? "#22c55e" : "#ef4444",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {suggestion.suggested > suggestion.current ? "↑ Increase" : "↓ Decrease"}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                      {suggestion.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rebalancing Alert */}
          {recommendation.rebalancingNeeded && (
            <div
              style={{
                padding: "1rem",
                background: "#f59e0b20",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Info size={20} color="#f59e0b" />
              <div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0, color: "#f59e0b" }}>
                  Rebalancing Recommended
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
                  Consider rebalancing your portfolio to optimize risk-adjusted returns
                </p>
              </div>
            </div>
          )}

          {/* Projected Returns */}
          <div style={{ padding: "1rem", background: "var(--bg-hover)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
              Projected Annual Returns
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--bg-card)", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Conservative
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#22c55e" }}>
                  {recommendation.projectedReturns.conservative.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--bg-card)", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Moderate
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#3b82f6" }}>
                  {recommendation.projectedReturns.moderate.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "0.75rem", background: "var(--bg-card)", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Aggressive
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#f59e0b" }}>
                  {recommendation.projectedReturns.aggressive.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Back to Results */}
          <button
            onClick={() => setActiveTab("results")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--bg-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Back to Risk Analysis
          </button>
        </div>
      )}

      {/* Empty State */}
      {(activeTab === "results" || activeTab === "recommendations") && !metrics && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <Calculator size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
            No Analysis Yet
          </h3>
          <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Enter your portfolio details and click "Calculate" to see risk analysis and AI recommendations
          </p>
          <button
            onClick={() => setActiveTab("input")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--accent)",
              color: "var(--bg-primary)",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to Portfolio Input
          </button>
        </div>
      )}
    </div>
  );
}
