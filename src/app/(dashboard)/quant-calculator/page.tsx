"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Download,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { useQuantCalculatorStore } from "@/store/quantCalculatorStore";

const ASSET_COLORS: Record<string, string> = {
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

const ASSET_NAMES: Record<string, string> = {
  equity: "Stocks / Equity",
  gold: "Gold",
  silver: "Silver",
  crudeOil: "Crude Oil",
  naturalGas: "Natural Gas",
  copper: "Copper",
  bonds: "Bonds",
  crypto: "Cryptocurrency",
  cash: "Cash",
  realEstate: "Real Estate",
  commodities: "Commodities",
};

const RISK_PROFILES = [
  { value: "conservative", label: "Conservative", color: "#22c55e" },
  { value: "moderate", label: "Moderate", color: "#3b82f6" },
  { value: "aggressive", label: "Aggressive", color: "#f59e0b" },
];

export default function QuantCalculatorPage() {
  const router = useRouter();
  const {
    input,
    metrics,
    recommendation,
    isCalculating,
    calculationHistory,
    validationErrors,
    setTotalInvestment,
    setMonthlyContribution,
    setInvestmentHorizon,
    setTargetReturn,
    setRiskProfile,
    updateAllocation,
    calculatePortfolio,
    resetCalculator,
    normalizeAllocation,
  } = useQuantCalculatorStore();

  const [activeTab, setActiveTab] = useState<"overview" | "quantitative" | "stress" | "montecarlo" | "recommendations">("overview");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [monteCarloData, setMonteCarloData] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    // Generate Monte Carlo visualization data
    if (metrics) {
      const data = [];
      for (let i = 0; i <= input.investmentHorizon; i++) {
        const baseValue = input.totalInvestment * Math.pow(1 + metrics.annualizedReturn / 100, i);
        const volatility = metrics.volatility / 100 * baseValue * Math.sqrt(i);
        data.push({
          year: i,
          expected: baseValue,
          optimistic: baseValue + volatility * 1.645,
          pessimistic: baseValue - volatility * 1.645,
          worstCase: baseValue - volatility * 2.326,
        });
      }
      setMonteCarloData(data);
    }
  }, [metrics, input]);

  const handleBackToDashboard = () => {
    router.push("/ai-insights");
  };

  const pieData = Object.entries(input.allocation)
    .filter(([_, value]) => value > 0)
    .map(([asset, value]) => ({
      name: ASSET_NAMES[asset],
      value,
      color: ASSET_COLORS[asset],
    }));

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "#22c55e";
      case "medium": return "#eab308";
      case "high": return "#f97316";
      case "extreme": return "#ef4444";
      default: return "#64748b";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handleBackToDashboard}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={18} />
              Back to AI Insights
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  padding: "0.5rem",
                  background: "var(--accent)",
                  borderRadius: "8px",
                  color: "var(--bg-primary)",
                }}
              >
                <Calculator size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Quantitative Portfolio Calculator
                </h1>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                  Hedge fund-level risk analytics & AI recommendations
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={resetCalculator}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <RefreshCw size={16} />
              Reset
            </button>
            <button
              onClick={calculatePortfolio}
              disabled={isCalculating}
              style={{
                padding: "0.5rem 1.5rem",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                border: "none",
                borderRadius: "6px",
                cursor: isCalculating ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                opacity: isCalculating ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: "flex", height: "calc(100vh - 73px)" }}>
        {/* Sidebar - Inputs */}
        <aside
          style={{
            width: "380px",
            background: "var(--bg-card)",
            borderRight: "1px solid var(--border)",
            overflowY: "auto",
            padding: "1.5rem",
          }}
        >
          {/* Risk Profile */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
              Risk Profile
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {RISK_PROFILES.map((profile) => (
                <button
                  key={profile.value}
                  onClick={() => setRiskProfile(profile.value as any)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "6px",
                    border: input.riskProfile === profile.value ? `2px solid ${profile.color}` : "1px solid var(--border)",
                    background: input.riskProfile === profile.value ? `${profile.color}15` : "var(--bg-hover)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: profile.color }} />
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      {profile.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Details */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
              Investment Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Total Investment ($)
                </label>
                <input
                  type="number"
                  value={input.totalInvestment}
                  onChange={(e) => setTotalInvestment(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Monthly Contribution ($)
                </label>
                <input
                  type="number"
                  value={input.monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Investment Horizon (Years)
                </label>
                <input
                  type="number"
                  value={input.investmentHorizon}
                  onChange={(e) => setInvestmentHorizon(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                Asset Allocation
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  color:
                    Object.values(input.allocation).reduce((a, b) => a + b, 0) === 100
                      ? "#22c55e"
                      : "#f59e0b",
                }}
              >
                Total: {Object.values(input.allocation).reduce((a, b) => a + b, 0).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.entries(input.allocation).map(([asset, value]) => (
                <div key={asset}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {ASSET_NAMES[asset]}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 600 }}>
                      {value}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => updateAllocation(asset as any, Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#ef444415", borderRadius: "8px", border: "1px solid #ef444430" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={16} />
                Validation Errors
              </h3>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.75rem", color: "#ef4444" }}>
                {validationErrors.map((error, index) => (
                  <li key={index} style={{ marginBottom: "0.25rem" }}>{error}</li>
                ))}
              </ul>
              <button
                onClick={normalizeAllocation}
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem 1rem",
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                Normalize Allocation to 100%
              </button>
            </div>
          )}

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Settings size={16} />
              Advanced Options
            </span>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAdvanced && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--bg-hover)", borderRadius: "6px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Risk-Free Rate (%)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={input.riskFreeRate}
                    onChange={(e) => useQuantCalculatorStore.getState().setAdvancedOptions({ riskFreeRate: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Monte Carlo Simulations
                  </label>
                  <input
                    type="number"
                    step={1000}
                    min={1000}
                    max={50000}
                    value={input.monteCarloSimulations}
                    onChange={(e) => useQuantCalculatorStore.getState().setAdvancedOptions({ monteCarloSimulations: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Results Area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          {!metrics ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-secondary)",
              }}
            >
              <Calculator size={64} style={{ opacity: 0.3, marginBottom: "1.5rem" }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Ready to Calculate
              </h2>
              <p style={{ fontSize: "0.875rem", maxWidth: "400px", textAlign: "center", marginBottom: "1.5rem" }}>
                Enter your portfolio details and click "Calculate" to see advanced quantitative analysis
              </p>
              <button
                onClick={calculatePortfolio}
                style={{
                  padding: "0.75rem 2rem",
                  background: "var(--accent)",
                  color: "var(--bg-primary)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Start Calculation
              </button>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "1rem",
                }}
              >
                {[
                  { id: "overview", label: "Overview", icon: PieIcon },
                  { id: "quantitative", label: "Quantitative Models", icon: BarChart3 },
                  { id: "stress", label: "Stress Testing", icon: AlertTriangle },
                  { id: "montecarlo", label: "Monte Carlo", icon: Activity },
                  { id: "recommendations", label: "AI Recommendations", icon: Target },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    style={{
                      padding: "0.625rem 1rem",
                      background: activeTab === id ? "var(--accent)" : "transparent",
                      color: activeTab === id ? "var(--bg-primary)" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Key Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                    <MetricCard
                      title="Portfolio Value"
                      value={`$${metrics.portfolioValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                      subtitle={`+${metrics.totalReturnPercentage.toFixed(1)}% total return`}
                      icon={TrendingUp}
                      color="#22c55e"
                    />
                    <MetricCard
                      title="Annualized Return"
                      value={`${metrics.annualizedReturn.toFixed(2)}%`}
                      subtitle="Expected per year"
                      icon={Target}
                      color="#3b82f6"
                    />
                    <MetricCard
                      title="Volatility"
                      value={`${metrics.volatility.toFixed(2)}%`}
                      subtitle={metrics.riskLevel.toUpperCase()}
                      icon={Activity}
                      color={getRiskColor(metrics.riskLevel)}
                    />
                    <MetricCard
                      title="Sharpe Ratio"
                      value={metrics.sharpeRatio.toFixed(2)}
                      subtitle="Risk-adjusted return"
                      icon={BarChart3}
                      color={metrics.sharpeRatio > 0.5 ? "#22c55e" : "#f59e0b"}
                    />
                    <MetricCard
                      title="Safety Rating"
                      value={metrics.safetyRating}
                      subtitle="Portfolio grade"
                      icon={Shield}
                      color={
                        metrics.safetyRating === "A"
                          ? "#22c55e"
                          : metrics.safetyRating === "B"
                          ? "#84cc16"
                          : metrics.safetyRating === "C"
                          ? "#eab308"
                          : "#ef4444"
                      }
                    />
                    <MetricCard
                      title="Max Drawdown"
                      value={`${metrics.maxDrawdown.toFixed(1)}%`}
                      subtitle="Worst case loss"
                      icon={TrendingDown}
                      color="#ef4444"
                    />
                  </div>

                  {/* Charts Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    {/* Pie Chart */}
                    <div
                      style={{
                        background: "var(--bg-card)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)" }}>
                        Asset Allocation
                      </h3>
                      <div style={{ height: "250px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
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
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Risk Metrics */}
                    <div
                      style={{
                        background: "var(--bg-card)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)" }}>
                        Risk Metrics
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <RiskMetricRow label="Portfolio Beta" value={metrics.beta.toFixed(2)} />
                        <RiskMetricRow label="Diversification Score" value={`${metrics.diversificationScore.toFixed(0)}/100`} />
                        <RiskMetricRow label="Value at Risk (95%)" value={`-$${Math.abs(metrics.var95).toLocaleString("en-US", { maximumFractionDigits: 0 })}`} isNegative />
                        <RiskMetricRow label="Value at Risk (99%)" value={`-$${Math.abs(metrics.var99).toLocaleString("en-US", { maximumFractionDigits: 0 })}`} isNegative />
                        <RiskMetricRow label="CAPM Alpha" value={`${metrics.capm.alpha > 0 ? "+" : ""}${metrics.capm.alpha.toFixed(2)}%`} isPositive={metrics.capm.alpha > 0} />
                        <RiskMetricRow label="Treynor Ratio" value={metrics.capm.treynorRatio.toFixed(2)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs would continue here... */}

              {/* Quantitative Models Tab */}
              {activeTab === "quantitative" && metrics && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Model Selection Cards */}
                  {!selectedModel && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                      {/* Black-Scholes Card */}
                      <div 
                        onClick={() => setSelectedModel("blackScholes")}
                        style={{ 
                          background: "var(--bg-card)", 
                          borderRadius: "12px", 
                          padding: "1.5rem", 
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div style={{ padding: "0.75rem", background: "var(--accent)20", borderRadius: "10px" }}>
                            <Activity size={24} color="var(--accent)" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                              Black-Scholes Model
                            </h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                              Option pricing & Greeks
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Delta:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.blackScholesMetrics.delta.toFixed(3)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Option Price:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>${metrics.blackScholesMetrics.optionPrice.toFixed(0)}</span>
                        </div>
                      </div>

                      {/* VaR Models Card */}
                      <div 
                        onClick={() => setSelectedModel("var")}
                        style={{ 
                          background: "var(--bg-card)", 
                          borderRadius: "12px", 
                          padding: "1.5rem", 
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div style={{ padding: "0.75rem", background: "#ef444420", borderRadius: "10px" }}>
                            <AlertTriangle size={24} color="#ef4444" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                              Value at Risk (VaR)
                            </h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                              5 advanced VaR models
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>95% VaR:</span>
                          <span style={{ color: "#ef4444", fontWeight: 600 }}>-${Math.abs(metrics.var95).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>CVaR:</span>
                          <span style={{ color: "#ef4444", fontWeight: 600 }}>-${Math.abs(metrics.varAdvanced.conditionalVaR).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* CAPM Card */}
                      <div 
                        onClick={() => setSelectedModel("capm")}
                        style={{ 
                          background: "var(--bg-card)", 
                          borderRadius: "12px", 
                          padding: "1.5rem", 
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div style={{ padding: "0.75rem", background: "#3b82f620", borderRadius: "10px" }}>
                            <BarChart3 size={24} color="#3b82f6" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                              CAPM Analysis
                            </h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                              Expected return & alpha
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Alpha:</span>
                          <span style={{ color: metrics.capm.alpha > 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                            {metrics.capm.alpha > 0 ? "+" : ""}{metrics.capm.alpha.toFixed(2)}%
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Expected Return:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.capm.expectedReturn.toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* Hedge Fund Metrics Card */}
                      <div 
                        onClick={() => setSelectedModel("hedgeFund")}
                        style={{ 
                          background: "var(--bg-card)", 
                          borderRadius: "12px", 
                          padding: "1.5rem", 
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div style={{ padding: "0.75rem", background: "#22c55e20", borderRadius: "10px" }}>
                            <TrendingUp size={24} color="#22c55e" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                              Hedge Fund Metrics
                            </h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                              Sortino, Calmar & more
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Sortino:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.hedgeFundMetrics.sortinoRatio.toFixed(3)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Calmar:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.hedgeFundMetrics.calmarRatio.toFixed(3)}</span>
                        </div>
                      </div>

                      {/* Factor Analysis Card */}
                      <div 
                        onClick={() => setSelectedModel("factor")}
                        style={{ 
                          background: "var(--bg-card)", 
                          borderRadius: "12px", 
                          padding: "1.5rem", 
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div style={{ padding: "0.75rem", background: "#f59e0b20", borderRadius: "10px" }}>
                            <PieIcon size={24} color="#f59e0b" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                              Factor Analysis
                            </h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                              Fama-French factors
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Market Factor:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.factorAnalysis.marketFactor.toFixed(3)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Size Factor:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.factorAnalysis.sizeFactor.toFixed(3)}</span>
                        </div>
                      </div>

                      {/* Tail Risk Card */}
                      <div 
                        onClick={() => setSelectedModel("tailRisk")}
                        style={{ 
                          background: "var(--bg-card)", 
                          borderRadius: "12px", 
                          padding: "1.5rem", 
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div style={{ padding: "0.75rem", background: "#9333ea20", borderRadius: "10px" }}>
                            <TrendingDown size={24} color="#9333ea" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                              Tail Risk Metrics
                            </h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                              Skewness, kurtosis & more
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Skewness:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.tailRisk.skewness.toFixed(3)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Kurtosis:</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{metrics.tailRisk.kurtosis.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Model Detail Views */}
                  {selectedModel === "blackScholes" && (
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "2rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Activity size={24} color="var(--accent)" />
                          Black-Scholes Option Pricing Model
                        </h3>
                        <button onClick={() => setSelectedModel(null)} style={{ padding: "0.5rem 1rem", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                          ← Back to Models
                        </button>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                        The Black-Scholes model calculates theoretical option prices and sensitivities (Greeks) 
                        for your portfolio. This helps understand how your portfolio value changes with market movements.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <ModelMetricCard label="Option Price" value={`$${metrics.blackScholesMetrics.optionPrice.toFixed(2)}`} description="Theoretical value of portfolio option" />
                        <ModelMetricCard label="Delta" value={metrics.blackScholesMetrics.delta.toFixed(4)} description="Sensitivity to underlying price changes" />
                        <ModelMetricCard label="Gamma" value={metrics.blackScholesMetrics.gamma.toFixed(6)} description="Rate of change of delta" />
                        <ModelMetricCard label="Theta" value={`${metrics.blackScholesMetrics.theta.toFixed(2)}/day`} description="Time decay per day" />
                        <ModelMetricCard label="Vega" value={metrics.blackScholesMetrics.vega.toFixed(4)} description="Sensitivity to volatility changes" />
                        <ModelMetricCard label="Implied Volatility" value={`${metrics.blackScholesMetrics.impliedVolatility.toFixed(2)}%`} description="Market's expectation of volatility" />
                      </div>
                    </div>
                  )}

                  {selectedModel === "var" && (
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "2rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <AlertTriangle size={24} color="#ef4444" />
                          Value at Risk (Advanced Models)
                        </h3>
                        <button onClick={() => setSelectedModel(null)} style={{ padding: "0.5rem 1rem", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                          ← Back to Models
                        </button>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                        VaR estimates the maximum potential loss at a given confidence level over a specific time period. 
                        We calculate 5 different VaR models for comprehensive risk assessment.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                        <VaRDetailCard label="Historical VaR (95%)" value={metrics.varAdvanced.historicalVaR} description="Based on actual historical returns" />
                        <VaRDetailCard label="Parametric VaR (95%)" value={metrics.varAdvanced.parametricVaR} description="Assumes normal distribution" />
                        <VaRDetailCard label="Monte Carlo VaR (95%)" value={metrics.varAdvanced.monteCarloVaR} description="Simulated scenarios" />
                        <VaRDetailCard label="Conditional VaR (CVaR)" value={metrics.varAdvanced.conditionalVaR} description="Expected loss beyond VaR" />
                        <VaRDetailCard label="Modified VaR (Cornish-Fisher)" value={metrics.varAdvanced.modifiedVaR} description="Adjusts for skewness & kurtosis" />
                      </div>
                    </div>
                  )}

                  {selectedModel === "capm" && (
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "2rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <BarChart3 size={24} color="#3b82f6" />
                          Capital Asset Pricing Model (CAPM)
                        </h3>
                        <button onClick={() => setSelectedModel(null)} style={{ padding: "0.5rem 1rem", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                          ← Back to Models
                        </button>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                        CAPM describes the relationship between systematic risk and expected return. 
                        Alpha measures your portfolio's excess return compared to the market benchmark.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <ModelMetricCard label="Expected Return" value={`${metrics.capm.expectedReturn.toFixed(2)}%`} description="Based on CAPM formula" />
                        <ModelMetricCard label="Alpha" value={`${metrics.capm.alpha > 0 ? "+" : ""}${metrics.capm.alpha.toFixed(2)}%`} description="Excess return vs market" isPositive={metrics.capm.alpha > 0} />
                        <ModelMetricCard label="R-Squared" value={metrics.capm.rSquared.toFixed(3)} description="Correlation with market" />
                        <ModelMetricCard label="Treynor Ratio" value={metrics.capm.treynorRatio.toFixed(3)} description="Risk-adjusted return (beta)" />
                        <ModelMetricCard label="Information Ratio" value={metrics.capm.informationRatio.toFixed(3)} description="Active return per unit risk" />
                        <ModelMetricCard label="Portfolio Beta" value={metrics.beta.toFixed(3)} description="Systematic risk measure" />
                      </div>
                    </div>
                  )}

                  {selectedModel === "hedgeFund" && (
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "2rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <TrendingUp size={24} color="#22c55e" />
                          Hedge Fund Risk Metrics
                        </h3>
                        <button onClick={() => setSelectedModel(null)} style={{ padding: "0.5rem 1rem", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                          ← Back to Models
                        </button>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                        Professional hedge fund metrics for sophisticated risk assessment. 
                        These ratios focus on downside risk and risk-adjusted returns.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <ModelMetricCard label="Sortino Ratio" value={metrics.hedgeFundMetrics.sortinoRatio.toFixed(3)} description="Return per unit downside risk" />
                        <ModelMetricCard label="Calmar Ratio" value={metrics.hedgeFundMetrics.calmarRatio.toFixed(3)} description="Return vs max drawdown" />
                        <ModelMetricCard label="Sterling Ratio" value={metrics.hedgeFundMetrics.sterlingRatio.toFixed(3)} description="Return vs average drawdown" />
                        <ModelMetricCard label="Burke Ratio" value={metrics.hedgeFundMetrics.burkeRatio.toFixed(3)} description="Return vs squared drawdowns" />
                        <ModelMetricCard label="Pain Ratio" value={metrics.hedgeFundMetrics.painRatio.toFixed(3)} description="Return vs pain index" />
                        <ModelMetricCard label="Ulcer Index" value={metrics.hedgeFundMetrics.ulcerIndex.toFixed(3)} description="Depth and duration of drawdowns" />
                        <ModelMetricCard label="Pain Index" value={metrics.hedgeFundMetrics.painIndex.toFixed(3)} description="Average drawdown intensity" />
                        <ModelMetricCard label="Up Capture" value={`${(metrics.hedgeFundMetrics.upCapture * 100).toFixed(1)}%`} description="Captures market upside" />
                        <ModelMetricCard label="Down Capture" value={`${(metrics.hedgeFundMetrics.downCapture * 100).toFixed(1)}%`} description="Captures market downside" />
                      </div>
                    </div>
                  )}

                  {selectedModel === "factor" && (
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "2rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <PieIcon size={24} color="#f59e0b" />
                          Factor Exposure Analysis
                        </h3>
                        <button onClick={() => setSelectedModel(null)} style={{ padding: "0.5rem 1rem", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                          ← Back to Models
                        </button>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                        Fama-French multi-factor model analysis showing your portfolio's exposure 
                        to different risk factors that explain stock returns.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <ModelMetricCard label="Market Factor" value={metrics.factorAnalysis.marketFactor.toFixed(3)} description="Overall market exposure (Beta)" />
                        <ModelMetricCard label="Size Factor" value={metrics.factorAnalysis.sizeFactor.toFixed(3)} description="Small vs large cap tilt" />
                        <ModelMetricCard label="Value Factor" value={metrics.factorAnalysis.valueFactor.toFixed(3)} description="Value vs growth tilt" />
                        <ModelMetricCard label="Momentum Factor" value={metrics.factorAnalysis.momentumFactor.toFixed(3)} description="Trend following exposure" />
                        <ModelMetricCard label="Quality Factor" value={metrics.factorAnalysis.qualityFactor.toFixed(3)} description="High quality stock exposure" />
                        <ModelMetricCard label="Low Volatility" value={metrics.factorAnalysis.lowVolatilityFactor.toFixed(3)} description="Defensive positioning" />
                      </div>
                    </div>
                  )}

                  {selectedModel === "tailRisk" && (
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "2rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <TrendingDown size={24} color="#9333ea" />
                          Tail Risk Metrics
                        </h3>
                        <button onClick={() => setSelectedModel(null)} style={{ padding: "0.5rem 1rem", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                          ← Back to Models
                        </button>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                        Tail risk measures the probability of extreme outcomes. These metrics help 
                        understand the portfolio's behavior during market stress periods.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <ModelMetricCard label="Skewness" value={metrics.tailRisk.skewness.toFixed(3)} description="Distribution asymmetry" />
                        <ModelMetricCard label="Kurtosis" value={metrics.tailRisk.kurtosis.toFixed(3)} description="Tail thickness (fat tails)" />
                        <ModelMetricCard label="Jarque-Bera Test" value={metrics.tailRisk.jarqueBera.toFixed(2)} description="Normality test statistic" />
                        <ModelMetricCard label="Maximum Loss" value={`-$${Math.abs(metrics.tailRisk.maximumLoss).toLocaleString()}`} description="Worst case scenario" isNegative />
                        <ModelMetricCard label="Average Loss" value={`-$${Math.abs(metrics.tailRisk.averageLoss).toLocaleString()}`} description="Mean of losses" isNegative />
                        <ModelMetricCard label="Loss Std Dev" value={metrics.tailRisk.lossStdDev.toFixed(2)} description="Loss volatility" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stress Testing Tab */}
              {activeTab === "stress" && metrics && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <AlertTriangle size={18} color="#ef4444" />
                      Stress Test Scenarios
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                      Portfolio value under extreme market conditions
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                      <StressCard 
                        scenario="2008 Financial Crisis" 
                        value={metrics.stressTest.marketCrash} 
                        decline={((1 - metrics.stressTest.marketCrash / metrics.portfolioValue) * 100)}
                        color="#dc2626"
                      />
                      <StressCard 
                        scenario="High Inflation Period" 
                        value={metrics.stressTest.inflationSpike} 
                        decline={((1 - metrics.stressTest.inflationSpike / metrics.portfolioValue) * 100)}
                        color="#ea580c"
                      />
                      <StressCard 
                        scenario="Interest Rate Shock" 
                        value={metrics.stressTest.interestRateRise} 
                        decline={((1 - metrics.stressTest.interestRateRise / metrics.portfolioValue) * 100)}
                        color="#f59e0b"
                      />
                      <StressCard 
                        scenario="Geopolitical Crisis" 
                        value={metrics.stressTest.geopoliticalCrisis} 
                        decline={((1 - metrics.stressTest.geopoliticalCrisis / metrics.portfolioValue) * 100)}
                        color="#7c3aed"
                      />
                      <StressCard 
                        scenario="Pandemic Scenario" 
                        value={metrics.stressTest.pandemicScenario} 
                        decline={((1 - metrics.stressTest.pandemicScenario / metrics.portfolioValue) * 100)}
                        color="#dc2626"
                      />
                      <StressCard 
                        scenario="Combined Worst Case" 
                        value={metrics.stressTest.worstCase} 
                        decline={((1 - metrics.stressTest.worstCase / metrics.portfolioValue) * 100)}
                        color="#7f1d1d"
                      />
                    </div>
                  </div>

                  {/* Tail Risk Analysis */}
                  <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Activity size={18} color="#9333ea" />
                      Tail Risk Metrics
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                      <RiskMetricBox label="Skewness" value={metrics.tailRisk.skewness.toFixed(3)} description="Distribution asymmetry" />
                      <RiskMetricBox label="Kurtosis" value={metrics.tailRisk.kurtosis.toFixed(3)} description="Tail thickness" />
                      <RiskMetricBox label="Jarque-Bera Test" value={metrics.tailRisk.jarqueBera.toFixed(2)} description="Normality test" />
                      <RiskMetricBox label="Maximum Loss" value={`-$${Math.abs(metrics.tailRisk.maximumLoss).toLocaleString()}`} description="Worst historical loss" isNegative />
                    </div>
                  </div>
                </div>
              )}

              {/* Monte Carlo Tab */}
              {activeTab === "montecarlo" && metrics && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Monte Carlo Statistics */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Probability of Profit</div>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#22c55e" }}>{metrics.monteCarlo.probabilityOfProfit.toFixed(1)}%</div>
                    </div>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Probability of Loss</div>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ef4444" }}>{metrics.monteCarlo.probabilityOfLoss.toFixed(1)}%</div>
                    </div>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Target Return Probability</div>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6" }}>{metrics.monteCarlo.probabilityOfTargetReturn.toFixed(1)}%</div>
                    </div>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Expected Value</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>${metrics.monteCarlo.expectedValue.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Monte Carlo Projection Chart */}
                  <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <LineIcon size={18} color="var(--accent)" />
                      Monte Carlo Projection Paths
                    </h3>
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monteCarloData}>
                          <defs>
                            <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="year" stroke="var(--text-secondary)" />
                          <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                            contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                          />
                          <Area type="monotone" dataKey="optimistic" stroke="#22c55e" fillOpacity={1} fill="url(#colorOptimistic)" strokeDasharray="5 5" />
                          <Area type="monotone" dataKey="pessimistic" stroke="#ef4444" fillOpacity={1} fill="url(#colorPessimistic)" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="expected" stroke="var(--accent)" strokeWidth={2} />
                          <ReferenceLine y={input.totalInvestment} stroke="#64748b" strokeDasharray="3 3" />
                          <Legend />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "1rem", fontStyle: "italic" }}>
                      Shaded areas represent optimistic (top 5%) and pessimistic (bottom 5%) scenarios based on {input.monteCarloSimulations.toLocaleString()} simulations
                    </p>
                  </div>

                  {/* Percentile Distribution */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>5th Percentile</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#ef4444" }}>${metrics.monteCarlo.percentile5.toLocaleString()}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Worst case scenario</div>
                    </div>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Median (50th)</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--accent)" }}>${metrics.monteCarlo.medianValue.toLocaleString()}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Expected outcome</div>
                    </div>
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>95th Percentile</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#22c55e" }}>${metrics.monteCarlo.percentile95.toLocaleString()}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Best case scenario</div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommendations Tab */}
              {activeTab === "recommendations" && recommendation && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* AI Summary */}
                  <div style={{ background: "linear-gradient(135deg, var(--accent)15, var(--accent)05)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--accent)" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Target size={20} color="var(--accent)" />
                      AI Portfolio Analysis
                    </h3>
                    <p style={{ fontSize: "0.875rem", lineHeight: "1.6", color: "var(--text-primary)" }}>{recommendation.summary}</p>
                  </div>

                  {/* Quantitative Insights */}
                  <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <BarChart3 size={18} color="var(--accent)" />
                      Quantitative Model Insights
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {recommendation.quantitativeInsights?.map((insight, index) => (
                        <div key={index} style={{ padding: "0.75rem", background: "var(--bg-hover)", borderRadius: "6px", borderLeft: "3px solid var(--accent)" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600, marginBottom: "0.25rem" }}>{insight.model}</div>
                          <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{insight.insight}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Confidence: {(insight.confidence * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Mitigation */}
                  <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Shield size={18} color="#22c55e" />
                      Risk Mitigation Strategies
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>Hedging Instruments</h4>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          {recommendation.riskMitigation?.hedgingInstruments.map((item, i) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>Insurance Strategies</h4>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          {recommendation.riskMitigation?.insuranceStrategies.map((item, i) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Asset Rebalancing */}
                  {recommendation.assetClassSuggestions.length > 0 && (
                    <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Activity size={18} color="#f59e0b" />
                        Suggested Rebalancing
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {recommendation.assetClassSuggestions.map((suggestion, index) => (
                          <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--bg-hover)", borderRadius: "6px" }}>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{suggestion.asset}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{suggestion.reason}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{suggestion.current}% → {suggestion.suggested}%</span>
                              <span style={{ padding: "0.25rem 0.5rem", background: suggestion.suggested > suggestion.current ? "#22c55e20" : "#ef444420", color: suggestion.suggested > suggestion.current ? "#22c55e" : "#ef4444", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                                {suggestion.suggested > suggestion.current ? "↑ Increase" : "↓ Decrease"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  color: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "12px",
        padding: "1.25rem",
        border: "1px solid var(--border)",
        transition: "transform 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div
          style={{
            padding: "0.5rem",
            background: `${color}20`,
            borderRadius: "8px",
          }}
        >
          <Icon size={20} color={color} />
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color, marginBottom: "0.25rem" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{subtitle}</div>
    </div>
  );
}

function RiskMetricRow({ label, value, isNegative, isPositive }: { label: string; value: string; isNegative?: boolean; isPositive?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{label}</span>
      <span
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: isNegative ? "#ef4444" : isPositive ? "#22c55e" : "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function QuantMetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

function VaRCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "var(--bg-hover)", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ef4444" }}>${Math.abs(value).toLocaleString()}</div>
    </div>
  );
}

function StressCard({ scenario, value, decline, color }: { scenario: string; value: number; decline: number; color: string }) {
  return (
    <div style={{ background: "var(--bg-hover)", borderRadius: "8px", padding: "1rem", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{scenario}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "1.125rem", fontWeight: 700, color }}>${value.toLocaleString()}</div>
        <div style={{ fontSize: "0.875rem", color: "#ef4444", fontWeight: 600 }}>-{decline.toFixed(1)}%</div>
      </div>
    </div>
  );
}

function RiskMetricBox({ label, value, description, isNegative }: { label: string; value: string; description: string; isNegative?: boolean }) {
  return (
    <div style={{ background: "var(--bg-hover)", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: isNegative ? "#ef4444" : "var(--text-primary)", marginBottom: "0.25rem" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{description}</div>
    </div>
  );
}

function ModelMetricCard({ label, value, description, isPositive, isNegative }: { label: string; value: string; description: string; isPositive?: boolean; isNegative?: boolean }) {
  return (
    <div style={{ background: "var(--bg-hover)", borderRadius: "8px", padding: "1rem", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: isPositive ? "#22c55e" : isNegative ? "#ef4444" : "var(--text-primary)", marginBottom: "0.5rem" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{description}</div>
    </div>
  );
}

function VaRDetailCard({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div style={{ background: "#ef444410", borderRadius: "8px", padding: "1.25rem", border: "1px solid #ef444430" }}>
      <div style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 600, marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.5rem" }}>-${Math.abs(value).toLocaleString()}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{description}</div>
    </div>
  );
}
