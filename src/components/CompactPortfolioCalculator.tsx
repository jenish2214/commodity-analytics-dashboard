"use client";

import { useRouter } from "next/navigation";
import { useQuantCalculatorStore } from "@/store/quantCalculatorStore";
import {
  Calculator,
  Maximize2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export function CompactPortfolioCalculator() {
  const router = useRouter();
  const { input, metrics } = useQuantCalculatorStore();

  const handleOpenFullCalculator = () => {
    router.push("/quant-calculator");
  };

  const totalAllocation = Object.values(input.allocation).reduce((a, b) => a + b, 0);
  const isValidAllocation = Math.abs(totalAllocation - 100) < 0.1;

  const getRiskColor = () => {
    if (!metrics) return "#64748b";
    switch (metrics.riskLevel) {
      case "low": return "#22c55e";
      case "medium": return "#eab308";
      case "high": return "#f97316";
      case "extreme": return "#ef4444";
      default: return "#64748b";
    }
  };

  return (
    <div className="ca-card" style={{ padding: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ padding: "0.625rem", background: "var(--accent)", borderRadius: "8px", color: "var(--bg-primary)" }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Portfolio Calculator
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
              Quantitative & hedge fund models
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenFullCalculator}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--accent)",
            color: "var(--bg-primary)",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Maximize2 size={16} />
          Open
        </button>
      </div>

      {/* Status Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.75rem 1rem",
        background: metrics ? `${getRiskColor()}15` : "var(--bg-hover)",
        borderRadius: "8px",
        marginBottom: "1rem",
        border: metrics ? `1px solid ${getRiskColor()}30` : "1px solid var(--border)",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
            Portfolio Status
          </div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: metrics ? getRiskColor() : "var(--text-secondary)" }}>
            {metrics ? `${metrics.riskLevel.toUpperCase()} RISK • ${metrics.safetyRating} Rating` : "Not Calculated"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Allocation</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: isValidAllocation ? "#22c55e" : "#f59e0b" }}>
            {totalAllocation.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Investment</div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
            ${(input.totalInvestment / 1000).toFixed(0)}k
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Horizon</div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {input.investmentHorizon} yrs
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Profile</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--accent)", textTransform: "capitalize" }}>
            {input.riskProfile}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Return</div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: metrics ? "#22c55e" : "var(--text-secondary)" }}>
            {metrics ? `${metrics.annualizedReturn.toFixed(1)}%` : "--"}
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!isValidAllocation && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.625rem",
          background: "#f59e0b15",
          borderRadius: "6px",
          marginBottom: "1rem",
        }}>
          <AlertCircle size={14} color="#f59e0b" />
          <span style={{ fontSize: "0.75rem", color: "#f59e0b" }}>
            Allocation must equal 100% (currently {totalAllocation.toFixed(1)}%)
          </span>
        </div>
      )}

      {/* Available Models */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          Available Models:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {["Black-Scholes", "VaR", "CAPM", "Monte Carlo", "Stress Test", "Sortino"].map((model) => (
            <span key={model} style={{
              padding: "0.25rem 0.5rem",
              background: "var(--bg-hover)",
              borderRadius: "4px",
              fontSize: "0.6875rem",
              color: "var(--text-secondary)",
            }}>
              {model}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleOpenFullCalculator}
        style={{
          width: "100%",
          padding: "0.75rem",
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
        {metrics ? "View Full Analysis" : "Open Calculator"}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
