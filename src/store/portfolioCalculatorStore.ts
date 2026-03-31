import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RiskProfile = "conservative" | "moderate" | "aggressive";

export interface AssetAllocation {
  equity: number;        // Stocks
  gold: number;          // Gold
  silver: number;        // Silver
  crudeOil: number;      // Crude Oil
  naturalGas: number;    // Natural Gas
  copper: number;        // Copper
  bonds: number;         // Government/Corporate Bonds
  crypto: number;        // Cryptocurrency
  cash: number;          // Cash/Money Market
  realEstate: number;    // REITs/Real Estate
  commodities: number;   // Other Commodities
}

export interface PortfolioInput {
  totalInvestment: number;
  monthlyContribution: number;
  investmentHorizon: number; // Years
  targetReturn: number;      // Expected annual return %
  allocation: AssetAllocation;
  riskProfile: RiskProfile;
}

export interface RiskMetrics {
  portfolioValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  volatility: number;           // Standard deviation
  sharpeRatio: number;          // Risk-adjusted return
  beta: number;                // Market correlation
  maxDrawdown: number;         // Maximum loss
  var95: number;               // Value at Risk (95% confidence)
  var99: number;               // Value at Risk (99% confidence)
  diversificationScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "extreme";
  safetyRating: "A" | "B" | "C" | "D" | "F";
}

export interface AIRecommendation {
  summary: string;
  riskAssessment: string;
  recommendations: string[];
  assetClassSuggestions: {
    asset: string;
    current: number;
    suggested: number;
    reason: string;
  }[];
  rebalancingNeeded: boolean;
  projectedReturns: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
}

interface PortfolioCalculatorState {
  input: PortfolioInput;
  metrics: RiskMetrics | null;
  recommendation: AIRecommendation | null;
  isCalculating: boolean;
  lastCalculated: number | null;
  
  // Actions
  setTotalInvestment: (amount: number) => void;
  setMonthlyContribution: (amount: number) => void;
  setInvestmentHorizon: (years: number) => void;
  setTargetReturn: (percentage: number) => void;
  setRiskProfile: (profile: RiskProfile) => void;
  updateAllocation: (asset: keyof AssetAllocation, percentage: number) => void;
  calculatePortfolio: () => Promise<void>;
  resetCalculator: () => void;
}

// Historical return data for asset classes (annual %)
const ASSET_RETURNS: Record<keyof AssetAllocation, { mean: number; volatility: number; beta: number }> = {
  equity: { mean: 10.5, volatility: 15.8, beta: 1.0 },
  gold: { mean: 6.2, volatility: 12.5, beta: 0.1 },
  silver: { mean: 5.8, volatility: 18.2, beta: 0.15 },
  crudeOil: { mean: 4.5, volatility: 25.3, beta: 0.3 },
  naturalGas: { mean: 3.2, volatility: 28.5, beta: 0.25 },
  copper: { mean: 5.5, volatility: 20.1, beta: 0.4 },
  bonds: { mean: 4.5, volatility: 5.2, beta: 0.05 },
  crypto: { mean: 25.0, volatility: 65.0, beta: 0.6 },
  cash: { mean: 2.5, volatility: 0.5, beta: 0.0 },
  realEstate: { mean: 7.8, volatility: 12.0, beta: 0.35 },
  commodities: { mean: 4.0, volatility: 18.5, beta: 0.2 },
};

// Correlation matrix between assets (simplified)
const CORRELATIONS: Record<string, Record<string, number>> = {
  equity: { gold: 0.1, bonds: -0.2, crypto: 0.3, realEstate: 0.4 },
  gold: { equity: 0.1, silver: 0.7, bonds: 0.1 },
  bonds: { equity: -0.2, gold: 0.1, cash: 0.8 },
  crypto: { equity: 0.3, cash: -0.1 },
  realEstate: { equity: 0.4, bonds: 0.2 },
};

const defaultInput: PortfolioInput = {
  totalInvestment: 100000,
  monthlyContribution: 1000,
  investmentHorizon: 10,
  targetReturn: 8,
  riskProfile: "moderate",
  allocation: {
    equity: 40,
    gold: 10,
    silver: 5,
    crudeOil: 5,
    naturalGas: 2,
    copper: 3,
    bonds: 20,
    crypto: 5,
    cash: 5,
    realEstate: 5,
    commodities: 0,
  },
};

// Risk calculation algorithms
function calculatePortfolioMetrics(input: PortfolioInput): RiskMetrics {
  const { allocation, totalInvestment, monthlyContribution, investmentHorizon } = input;
  
  // Calculate total invested amount
  const totalInvested = totalInvestment + (monthlyContribution * 12 * investmentHorizon);
  
  // Calculate weighted portfolio return
  let portfolioReturn = 0;
  let portfolioVolatility = 0;
  let portfolioBeta = 0;
  let totalWeight = 0;
  
  Object.entries(allocation).forEach(([asset, weight]) => {
    if (weight > 0) {
      const assetData = ASSET_RETURNS[asset as keyof AssetAllocation];
      portfolioReturn += (weight / 100) * assetData.mean;
      portfolioBeta += (weight / 100) * assetData.beta;
      totalWeight += weight / 100;
    }
  });
  
  // Calculate portfolio volatility using weighted average + correlation effects
  let variance = 0;
  Object.entries(allocation).forEach(([asset1, weight1]) => {
    if (weight1 > 0) {
      const assetData1 = ASSET_RETURNS[asset1 as keyof AssetAllocation];
      variance += Math.pow((weight1 / 100), 2) * Math.pow(assetData1.volatility, 2);
      
      // Add correlation effects
      Object.entries(allocation).forEach(([asset2, weight2]) => {
        if (weight2 > 0 && asset1 !== asset2) {
          const correlation = CORRELATIONS[asset1]?.[asset2] || 0;
          const assetData2 = ASSET_RETURNS[asset2 as keyof AssetAllocation];
          variance += (weight1 / 100) * (weight2 / 100) * 
                     correlation * assetData1.volatility * assetData2.volatility;
        }
      });
    }
  });
  
  portfolioVolatility = Math.sqrt(variance);
  
  // Calculate final portfolio value using compound interest
  const finalValue = totalInvestment * Math.pow(1 + portfolioReturn / 100, investmentHorizon) +
                     monthlyContribution * 12 * 
                     ((Math.pow(1 + portfolioReturn / 100, investmentHorizon) - 1) / (portfolioReturn / 100));
  
  // Calculate total return
  const totalReturn = finalValue - totalInvested;
  const totalReturnPercentage = (totalReturn / totalInvested) * 100;
  const annualizedReturn = (Math.pow(finalValue / totalInvestment, 1 / investmentHorizon) - 1) * 100;
  
  // Calculate Sharpe Ratio (assuming risk-free rate of 3%)
  const riskFreeRate = 3;
  const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;
  
  // Calculate Maximum Drawdown (estimated based on volatility)
  const maxDrawdown = -portfolioVolatility * 2.5;
  
  // Calculate Value at Risk
  const var95 = -1.65 * portfolioVolatility / 100 * finalValue;
  const var99 = -2.33 * portfolioVolatility / 100 * finalValue;
  
  // Calculate Diversification Score (0-100)
  const numAssets = Object.values(allocation).filter(w => w > 0).length;
  const herfindahlIndex = Object.values(allocation)
    .filter(w => w > 0)
    .reduce((sum, weight) => sum + Math.pow(weight / 100, 2), 0);
  const diversificationScore = Math.min(100, (1 - herfindahlIndex) * 100 + numAssets * 3);
  
  // Determine risk level and safety rating
  let riskLevel: "low" | "medium" | "high" | "extreme";
  let safetyRating: "A" | "B" | "C" | "D" | "F";
  
  if (portfolioVolatility < 8) {
    riskLevel = "low";
    safetyRating = sharpeRatio > 0.8 ? "A" : "B";
  } else if (portfolioVolatility < 15) {
    riskLevel = "medium";
    safetyRating = sharpeRatio > 0.6 ? "B" : "C";
  } else if (portfolioVolatility < 25) {
    riskLevel = "high";
    safetyRating = sharpeRatio > 0.4 ? "C" : "D";
  } else {
    riskLevel = "extreme";
    safetyRating = sharpeRatio > 0.3 ? "D" : "F";
  }
  
  return {
    portfolioValue: finalValue,
    totalInvested,
    totalReturn,
    totalReturnPercentage,
    annualizedReturn,
    volatility: portfolioVolatility,
    sharpeRatio,
    beta: portfolioBeta,
    maxDrawdown,
    var95,
    var99,
    diversificationScore,
    riskLevel,
    safetyRating,
  };
}

// AI Recommendation Engine
function generateAIRecommendation(input: PortfolioInput, metrics: RiskMetrics): AIRecommendation {
  const { riskProfile, allocation, targetReturn } = input;
  const { volatility, sharpeRatio, diversificationScore, riskLevel, safetyRating } = metrics;
  
  // Analyze current allocation vs ideal allocation for risk profile
  const idealAllocations: Record<RiskProfile, AssetAllocation> = {
    conservative: {
      equity: 20, gold: 15, silver: 5, crudeOil: 3, naturalGas: 2,
      copper: 5, bonds: 40, crypto: 0, cash: 5, realEstate: 5, commodities: 0,
    },
    moderate: {
      equity: 45, gold: 10, silver: 5, crudeOil: 5, naturalGas: 3,
      copper: 5, bonds: 20, crypto: 2, cash: 5, realEstate: 0, commodities: 0,
    },
    aggressive: {
      equity: 60, gold: 5, silver: 8, crudeOil: 8, naturalGas: 5,
      copper: 7, bonds: 5, crypto: 10, cash: 2, realEstate: 0, commodities: 0,
    },
  };
  
  const ideal = idealAllocations[riskProfile];
  
  // Generate asset class suggestions
  const assetClassSuggestions = Object.entries(allocation)
    .filter(([asset, current]) => {
      const idealValue = ideal[asset as keyof AssetAllocation];
      return Math.abs(current - idealValue) > 3; // Only show significant differences
    })
    .map(([asset, current]) => {
      const idealValue = ideal[asset as keyof AssetAllocation];
      const diff = idealValue - current;
      const action = diff > 0 ? "increase" : "decrease";
      
      let reason = "";
      if (riskProfile === "conservative" && ["bonds", "gold", "cash"].includes(asset)) {
        reason = `Higher ${asset} allocation provides stability for conservative investors`;
      } else if (riskProfile === "aggressive" && ["equity", "crypto", "silver"].includes(asset)) {
        reason = `Higher ${asset} allocation offers growth potential for aggressive investors`;
      } else if (diff > 0) {
        reason = `Increasing ${asset} improves portfolio balance for ${riskProfile} profile`;
      } else {
        reason = `Reducing ${asset} lowers risk exposure`;
      }
      
      return {
        asset: asset.charAt(0).toUpperCase() + asset.slice(1),
        current,
        suggested: idealValue,
        reason,
      };
    });
  
  // Determine if rebalancing is needed
  const rebalancingNeeded = assetClassSuggestions.length > 0;
  
  // Generate summary
  let summary = `Your portfolio shows a ${riskLevel} risk profile with a ${safetyRating} safety rating. `;
  summary += `Expected annual return: ${metrics.annualizedReturn.toFixed(2)}% with ${volatility.toFixed(2)}% volatility. `;
  
  if (sharpeRatio > 0.8) {
    summary += "Excellent risk-adjusted returns!";
  } else if (sharpeRatio > 0.5) {
    summary += "Good risk-adjusted performance.";
  } else {
    summary += "Consider optimizing your risk-return balance.";
  }
  
  // Risk assessment
  let riskAssessment = `Based on your ${riskProfile} risk profile, `;
  if (riskLevel === "low" && riskProfile !== "conservative") {
    riskAssessment += "your portfolio is more conservative than your stated risk tolerance. You may be missing growth opportunities.";
  } else if ((riskLevel === "high" || riskLevel === "extreme") && riskProfile === "conservative") {
    riskAssessment += "your portfolio carries more risk than appropriate for your conservative profile. Consider adding more bonds and gold.";
  } else if (riskLevel === "medium" && riskProfile === "moderate") {
    riskAssessment += "your portfolio aligns well with your moderate risk tolerance.";
  } else {
    riskAssessment += "your portfolio generally aligns with your stated risk tolerance, but some adjustments could improve efficiency.";
  }
  
  // Generate specific recommendations
  const recommendations: string[] = [];
  
  if (diversificationScore < 70) {
    recommendations.push("Increase diversification across more asset classes to reduce concentration risk");
  }
  
  if (volatility > 20 && riskProfile !== "aggressive") {
    recommendations.push("Reduce high-volatility assets like crypto or commodities to lower portfolio risk");
  }
  
  if (allocation.cash > 10) {
    recommendations.push("High cash allocation may drag returns. Consider deploying into bonds or gold");
  }
  
  if (allocation.crypto > 5 && riskProfile === "conservative") {
    recommendations.push("Crypto allocation is high for a conservative profile. Consider reducing to 0-2%");
  }
  
  if (allocation.bonds < 10 && riskProfile === "conservative") {
    recommendations.push("Low bond allocation for conservative profile. Consider increasing to 30-40%");
  }
  
  if (metrics.annualizedReturn < targetReturn) {
    recommendations.push(`Current expected return (${metrics.annualizedReturn.toFixed(1)}%) is below your target (${targetReturn}%). Consider increasing equity exposure`);
  }
  
  // Calculate projected returns for different scenarios
  const projectedReturns = {
    conservative: calculateScenarioReturn(allocation, 0.7),
    moderate: calculateScenarioReturn(allocation, 1.0),
    aggressive: calculateScenarioReturn(allocation, 1.3),
  };
  
  return {
    summary,
    riskAssessment,
    recommendations,
    assetClassSuggestions,
    rebalancingNeeded,
    projectedReturns,
  };
}

function calculateScenarioReturn(allocation: AssetAllocation, multiplier: number): number {
  let totalReturn = 0;
  Object.entries(allocation).forEach(([asset, weight]) => {
    if (weight > 0) {
      const assetData = ASSET_RETURNS[asset as keyof AssetAllocation];
      totalReturn += (weight / 100) * assetData.mean * multiplier;
    }
  });
  return totalReturn;
}

export const usePortfolioCalculatorStore = create<PortfolioCalculatorState>()(
  persist(
    (set, get) => ({
      input: { ...defaultInput },
      metrics: null,
      recommendation: null,
      isCalculating: false,
      lastCalculated: null,

      setTotalInvestment: (amount) =>
        set((state) => ({
          input: { ...state.input, totalInvestment: amount },
        })),

      setMonthlyContribution: (amount) =>
        set((state) => ({
          input: { ...state.input, monthlyContribution: amount },
        })),

      setInvestmentHorizon: (years) =>
        set((state) => ({
          input: { ...state.input, investmentHorizon: years },
        })),

      setTargetReturn: (percentage) =>
        set((state) => ({
          input: { ...state.input, targetReturn: percentage },
        })),

      setRiskProfile: (profile) =>
        set((state) => ({
          input: { ...state.input, riskProfile: profile },
        })),

      updateAllocation: (asset, percentage) =>
        set((state) => ({
          input: {
            ...state.input,
            allocation: {
              ...state.input.allocation,
              [asset]: percentage,
            },
          },
        })),

      calculatePortfolio: async () => {
        set({ isCalculating: true });
        
        // Simulate calculation delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { input } = get();
        
        // Validate allocation sums to 100%
        const totalAllocation = Object.values(input.allocation).reduce((sum, val) => sum + val, 0);
        
        if (totalAllocation !== 100) {
          // Auto-normalize if not 100%
          const factor = 100 / totalAllocation;
          const normalizedAllocation: AssetAllocation = { ...input.allocation };
          Object.keys(normalizedAllocation).forEach(key => {
            normalizedAllocation[key as keyof AssetAllocation] *= factor;
          });
          input.allocation = normalizedAllocation;
        }
        
        const metrics = calculatePortfolioMetrics(input);
        const recommendation = generateAIRecommendation(input, metrics);
        
        set({
          metrics,
          recommendation,
          isCalculating: false,
          lastCalculated: Date.now(),
        });
      },

      resetCalculator: () =>
        set({
          input: { ...defaultInput },
          metrics: null,
          recommendation: null,
          lastCalculated: null,
        }),
    }),
    {
      name: "portfolio-calculator",
      partialize: (state) => ({ 
        input: state.input,
        metrics: state.metrics,
        recommendation: state.recommendation,
        lastCalculated: state.lastCalculated,
      }),
    }
  )
);
