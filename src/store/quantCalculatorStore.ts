import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RiskProfile = "conservative" | "moderate" | "aggressive";

export interface AssetAllocation {
  equity: number;
  gold: number;
  silver: number;
  crudeOil: number;
  naturalGas: number;
  copper: number;
  bonds: number;
  crypto: number;
  cash: number;
  realEstate: number;
  commodities: number;
}

// Advanced Quantitative Models Interface
export interface QuantitativeMetrics {
  // Basic Metrics
  portfolioValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  beta: number;
  maxDrawdown: number;
  var95: number;
  var99: number;
  diversificationScore: number;
  riskLevel: "low" | "medium" | "high" | "extreme";
  safetyRating: "A" | "B" | "C" | "D" | "F";
  
  // Advanced Quantitative Metrics
  blackScholesMetrics: {
    optionPrice: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    impliedVolatility: number;
  };
  
  // Monte Carlo Simulation Results
  monteCarlo: {
    expectedValue: number;
    medianValue: number;
    percentile5: number;
    percentile95: number;
    probabilityOfProfit: number;
    probabilityOfLoss: number;
    probabilityOfTargetReturn: number;
  };
  
  // CAPM (Capital Asset Pricing Model)
  capm: {
    expectedReturn: number;
    alpha: number;
    rSquared: number;
    treynorRatio: number;
    informationRatio: number;
  };
  
  // Stress Testing
  stressTest: {
    marketCrash: number;      // 2008-like scenario
    inflationSpike: number;    // High inflation scenario
    interestRateRise: number;  // Rising rates scenario
    geopoliticalCrisis: number; // Political instability
    pandemicScenario: number;  // COVID-like scenario
    worstCase: number;         // Combined worst case
  };
  
  // Value at Risk (Advanced Models)
  varAdvanced: {
    historicalVaR: number;
    parametricVaR: number;
    monteCarloVaR: number;
    conditionalVaR: number;      // Expected Shortfall
    modifiedVaR: number;       // Cornish-Fisher
  };
  
  // Hedge Fund Metrics
  hedgeFundMetrics: {
    sortinoRatio: number;
    calmarRatio: number;
    sterlingRatio: number;
    burkeRatio: number;
    ulcerIndex: number;
    painIndex: number;
    painRatio: number;
    upCapture: number;
    downCapture: number;
    upNumberRatio: number;
    downNumberRatio: number;
  };
  
  // Factor Analysis
  factorAnalysis: {
    marketFactor: number;
    sizeFactor: number;
    valueFactor: number;
    momentumFactor: number;
    qualityFactor: number;
    lowVolatilityFactor: number;
  };
  
  // Efficient Frontier
  efficientFrontier: {
    optimalReturn: number;
    optimalRisk: number;
    currentDistance: number;   // Distance from optimal
    improvementPotential: number;
  };
  
  // Tail Risk Metrics
  tailRisk: {
    skewness: number;
    kurtosis: number;
    jarqueBera: number;
    maximumLoss: number;
    averageLoss: number;
    lossStdDev: number;
  };
  
  // Liquidity Risk
  liquidityRisk: {
    weightedAvgLiquidity: number;
    illiquidAssetsPercent: number;
    liquidityCoverage: number;
    stressedLiquidity: number;
  };
  
  // Scenario Analysis
  scenarios: {
    bullCase: { return: number; probability: number };
    baseCase: { return: number; probability: number };
    bearCase: { return: number; probability: number };
    sidewaysCase: { return: number; probability: number };
  };
}

export interface PortfolioInput {
  totalInvestment: number;
  monthlyContribution: number;
  investmentHorizon: number;
  targetReturn: number;
  allocation: AssetAllocation;
  riskProfile: RiskProfile;
  riskFreeRate: number;
  marketReturn: number;
  volatilityPreference: number;
  
  // Advanced Options
  monteCarloSimulations: number;
  confidenceLevel: number;
  timeHorizonDays: number;
  rebalancingFrequency: "monthly" | "quarterly" | "annually" | "never";
  taxRate: number;
  inflationRate: number;
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
  
  // Advanced Recommendations
  quantitativeInsights: {
    model: string;
    insight: string;
    confidence: number;
  }[];
  
  hedgeFundStrategy: {
    strategy: string;
    allocation: Partial<AssetAllocation>;
    expectedSharpe: number;
    maxDrawdown: number;
  };
  
  riskMitigation: {
    hedgingInstruments: string[];
    insuranceStrategies: string[];
    diversificationImprovements: string[];
  };
  
  tailRiskHedging: {
    recommendation: string;
    cost: number;
    effectiveness: number;
  }[];
  
  taxOptimization: {
    strategy: string;
    taxSavings: number;
    implementation: string;
  }[];
}

interface QuantCalculatorState {
  input: PortfolioInput;
  metrics: QuantitativeMetrics | null;
  recommendation: AIRecommendation | null;
  isCalculating: boolean;
  lastCalculated: number | null;
  isMinimized: boolean;
  isFullScreen: boolean;
  calculationHistory: Array<{ timestamp: number; input: PortfolioInput; metrics: QuantitativeMetrics }>;
  validationErrors: string[];
  
  // Actions
  setTotalInvestment: (amount: number) => void;
  setMonthlyContribution: (amount: number) => void;
  setInvestmentHorizon: (years: number) => void;
  setTargetReturn: (percentage: number) => void;
  setRiskProfile: (profile: RiskProfile) => void;
  updateAllocation: (asset: keyof AssetAllocation, percentage: number) => void;
  setAdvancedOptions: (options: Partial<PortfolioInput>) => void;
  calculatePortfolio: () => Promise<void>;
  resetCalculator: () => void;
  toggleMinimize: () => void;
  toggleFullScreen: () => void;
  addToHistory: () => void;
  validateInputs: () => boolean;
  normalizeAllocation: () => void;
}

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
  riskFreeRate: 3.5,
  marketReturn: 10,
  volatilityPreference: 15,
  monteCarloSimulations: 10000,
  confidenceLevel: 95,
  timeHorizonDays: 252,
  rebalancingFrequency: "quarterly",
  taxRate: 20,
  inflationRate: 2.5,
};

// Historical return data with volatility and correlations
const ASSET_DATA: Record<keyof AssetAllocation, { 
  mean: number; 
  volatility: number; 
  beta: number;
  skewness: number;
  kurtosis: number;
  liquidity: number; // 0-1 scale
}> = {
  equity: { mean: 10.5, volatility: 15.8, beta: 1.0, skewness: -0.3, kurtosis: 3.5, liquidity: 0.95 },
  gold: { mean: 6.2, volatility: 12.5, beta: 0.1, skewness: 0.2, kurtosis: 4.2, liquidity: 0.90 },
  silver: { mean: 5.8, volatility: 18.2, beta: 0.15, skewness: -0.1, kurtosis: 3.8, liquidity: 0.85 },
  crudeOil: { mean: 4.5, volatility: 25.3, beta: 0.3, skewness: -0.5, kurtosis: 5.5, liquidity: 0.80 },
  naturalGas: { mean: 3.2, volatility: 28.5, beta: 0.25, skewness: -0.3, kurtosis: 4.8, liquidity: 0.75 },
  copper: { mean: 5.5, volatility: 20.1, beta: 0.4, skewness: -0.2, kurtosis: 3.6, liquidity: 0.85 },
  bonds: { mean: 4.5, volatility: 5.2, beta: 0.05, skewness: 0.1, kurtosis: 3.2, liquidity: 0.95 },
  crypto: { mean: 35.0, volatility: 65.0, beta: 0.6, skewness: 1.5, kurtosis: 8.0, liquidity: 0.90 },
  cash: { mean: 2.5, volatility: 0.5, beta: 0.0, skewness: 0.0, kurtosis: 3.0, liquidity: 1.0 },
  realEstate: { mean: 7.8, volatility: 12.0, beta: 0.35, skewness: -0.4, kurtosis: 4.5, liquidity: 0.60 },
  commodities: { mean: 4.0, volatility: 18.5, beta: 0.2, skewness: -0.3, kurtosis: 4.0, liquidity: 0.80 },
};

// Correlation matrix
const CORRELATIONS: Record<string, Record<string, number>> = {
  equity: { gold: 0.05, silver: 0.15, bonds: -0.15, crypto: 0.25, realEstate: 0.45, crudeOil: 0.20 },
  gold: { silver: 0.75, bonds: 0.10, crypto: -0.05, realEstate: 0.15 },
  silver: { gold: 0.75, crudeOil: 0.20, copper: 0.35 },
  bonds: { equity: -0.15, gold: 0.10, realEstate: 0.25 },
  crypto: { equity: 0.25, gold: -0.05 },
  realEstate: { equity: 0.45, bonds: 0.25 },
  crudeOil: { equity: 0.20, silver: 0.20, naturalGas: 0.40 },
  naturalGas: { crudeOil: 0.40 },
  copper: { silver: 0.35, equity: 0.30 },
};

// Box-Muller transform for normal distribution
function boxMullerTransform(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0;
}

// Error function approximation (since Math.erf is not available in all JS environments)
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

// Black-Scholes option pricing model
function blackScholes(S: number, K: number, T: number, r: number, sigma: number, isCall: boolean = true): {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
} {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  const Nd1 = 0.5 * (1 + erf(d1 / Math.sqrt(2)));
  const Nd2 = 0.5 * (1 + erf(d2 / Math.sqrt(2)));
  
  const price = isCall ? 
    S * Nd1 - K * Math.exp(-r * T) * Nd2 :
    K * Math.exp(-r * T) * (1 - Nd2) - S * (1 - Nd1);
  
  const delta = isCall ? Nd1 : Nd1 - 1;
  const gamma = Math.exp(-0.5 * d1 * d1) / (S * sigma * Math.sqrt(2 * Math.PI * T));
  const theta = -S * sigma * Math.exp(-0.5 * d1 * d1) / (2 * Math.sqrt(2 * Math.PI * T)) - 
    r * K * Math.exp(-r * T) * (isCall ? Nd2 : -Nd2);
  const vega = S * Math.sqrt(T) * Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
  
  return { price, delta, gamma, theta, vega };
}

// Monte Carlo simulation for portfolio returns
function monteCarloSimulation(
  allocation: AssetAllocation,
  initialValue: number,
  monthlyContribution: number,
  years: number,
  simulations: number
): {
  expectedValue: number;
  medianValue: number;
  percentile5: number;
  percentile95: number;
  probabilityOfProfit: number;
  probabilityOfLoss: number;
  probabilityOfTargetReturn: number;
  allPaths: number[];
} {
  const monthlyReturn = calculateMonthlyReturn(allocation);
  const monthlyVolatility = calculateMonthlyVolatility(allocation) / Math.sqrt(12);
  const months = years * 12;
  
  const finalValues: number[] = [];
  let profitable = 0;
  let loss = 0;
  let targetMet = 0;
  
  for (let sim = 0; sim < simulations; sim++) {
    let portfolioValue = initialValue;
    
    for (let month = 0; month < months; month++) {
      const randomReturn = boxMullerTransform() * monthlyVolatility + monthlyReturn / 100;
      portfolioValue = portfolioValue * (1 + randomReturn) + monthlyContribution;
    }
    
    finalValues.push(portfolioValue);
    
    if (portfolioValue > initialValue + monthlyContribution * months) profitable++;
    if (portfolioValue < initialValue) loss++;
    if (portfolioValue > initialValue * Math.pow(1.08, years)) targetMet++;
  }
  
  finalValues.sort((a, b) => a - b);
  
  return {
    expectedValue: finalValues.reduce((a, b) => a + b, 0) / simulations,
    medianValue: finalValues[Math.floor(simulations / 2)],
    percentile5: finalValues[Math.floor(simulations * 0.05)],
    percentile95: finalValues[Math.floor(simulations * 0.95)],
    probabilityOfProfit: (profitable / simulations) * 100,
    probabilityOfLoss: (loss / simulations) * 100,
    probabilityOfTargetReturn: (targetMet / simulations) * 100,
    allPaths: finalValues,
  };
}

// Calculate monthly return from allocation
function calculateMonthlyReturn(allocation: AssetAllocation): number {
  let annualReturn = 0;
  Object.entries(allocation).forEach(([asset, weight]) => {
    if (weight > 0) {
      annualReturn += (weight / 100) * ASSET_DATA[asset as keyof AssetAllocation].mean;
    }
  });
  return annualReturn;
}

// Calculate monthly volatility from allocation
function calculateMonthlyVolatility(allocation: AssetAllocation): number {
  let variance = 0;
  
  Object.entries(allocation).forEach(([asset1, weight1]) => {
    if (weight1 > 0) {
      const data1 = ASSET_DATA[asset1 as keyof AssetAllocation];
      variance += Math.pow(weight1 / 100, 2) * Math.pow(data1.volatility, 2);
      
      Object.entries(allocation).forEach(([asset2, weight2]) => {
        if (weight2 > 0 && asset1 !== asset2) {
          const correlation = CORRELATIONS[asset1]?.[asset2] || 0;
          const data2 = ASSET_DATA[asset2 as keyof AssetAllocation];
          variance += (weight1 / 100) * (weight2 / 100) * correlation * data1.volatility * data2.volatility;
        }
      });
    }
  });
  
  return Math.sqrt(variance);
}

// Stress testing scenarios
function stressTesting(allocation: AssetAllocation, currentValue: number): QuantitativeMetrics['stressTest'] {
  const scenarios = {
    marketCrash: -30,      // 2008-like
    inflationSpike: -15,   // High inflation
    interestRateRise: -10, // Rising rates
    geopoliticalCrisis: -20, // Political instability
    pandemicScenario: -25, // COVID-like
  };
  
  const results: any = {};
  
  Object.entries(scenarios).forEach(([scenario, marketDecline]) => {
    let portfolioImpact = 0;
    
    Object.entries(allocation).forEach(([asset, weight]) => {
      if (weight > 0) {
        const data = ASSET_DATA[asset as keyof AssetAllocation];
        // Assets with lower beta decline less in market crash
        const assetDecline = marketDecline * data.beta;
        portfolioImpact += (weight / 100) * assetDecline;
      }
    });
    
    results[scenario] = currentValue * (1 + portfolioImpact / 100);
  });
  
  // Worst case is combination of multiple factors
  results.worstCase = currentValue * 0.60; // 40% total decline
  
  return results;
}

// Calculate all quantitative metrics
function calculateQuantitativeMetrics(input: PortfolioInput): QuantitativeMetrics {
  const { allocation, totalInvestment, monthlyContribution, investmentHorizon, riskFreeRate, marketReturn } = input;
  
  const annualReturn = calculateMonthlyReturn(allocation);
  const annualVolatility = calculateMonthlyVolatility(allocation);
  
  // Basic calculations
  const totalInvested = totalInvestment + (monthlyContribution * 12 * investmentHorizon);
  const finalValue = totalInvestment * Math.pow(1 + annualReturn / 100, investmentHorizon) +
    monthlyContribution * 12 * ((Math.pow(1 + annualReturn / 100, investmentHorizon) - 1) / (annualReturn / 100));
  
  const totalReturn = finalValue - totalInvested;
  const totalReturnPercentage = (totalReturn / totalInvested) * 100;
  const annualizedReturn = (Math.pow(finalValue / totalInvestment, 1 / investmentHorizon) - 1) * 100;
  
  // Sharpe Ratio
  const sharpeRatio = (annualReturn - riskFreeRate) / annualVolatility;
  
  // Portfolio Beta
  let portfolioBeta = 0;
  Object.entries(allocation).forEach(([asset, weight]) => {
    if (weight > 0) {
      portfolioBeta += (weight / 100) * ASSET_DATA[asset as keyof AssetAllocation].beta;
    }
  });
  
  // CAPM calculations
  const capmExpectedReturn = riskFreeRate + portfolioBeta * (marketReturn - riskFreeRate);
  const alpha = annualizedReturn - capmExpectedReturn;
  
  // Black-Scholes (using portfolio as underlying)
  const bs = blackScholes(finalValue, finalValue * 0.9, investmentHorizon, riskFreeRate / 100, annualVolatility / 100);
  
  // Monte Carlo
  const mc = monteCarloSimulation(allocation, totalInvestment, monthlyContribution, investmentHorizon, input.monteCarloSimulations);
  
  // Stress Testing
  const stress = stressTesting(allocation, finalValue);
  
  // VaR calculations
  const z95 = 1.645;
  const z99 = 2.326;
  const var95 = -z95 * annualVolatility / 100 * finalValue;
  const var99 = -z99 * annualVolatility / 100 * finalValue;
  
  // Advanced VaR
  const historicalVaR = -mc.percentile5;
  const parametricVaR = var95;
  const monteCarloVaR = -mc.allPaths[Math.floor(input.monteCarloSimulations * 0.05)];
  const conditionalVaR = mc.allPaths.slice(0, Math.floor(input.monteCarloSimulations * 0.05))
    .reduce((a, b) => a + b, 0) / Math.floor(input.monteCarloSimulations * 0.05);
  
  // Hedge Fund Metrics
  const downsideDeviation = annualVolatility * 0.7; // Simplified
  const sortinoRatio = (annualReturn - riskFreeRate) / downsideDeviation;
  const maxDrawdown = -annualVolatility * 2.5;
  const calmarRatio = annualReturn / Math.abs(maxDrawdown);
  
  // Factor Analysis (simplified)
  const factorAnalysis = {
    marketFactor: portfolioBeta,
    sizeFactor: (allocation.equity / 100) * 0.3,
    valueFactor: (allocation.bonds / 100) * 0.4,
    momentumFactor: (allocation.crypto / 100) * 0.6,
    qualityFactor: (allocation.gold / 100) * 0.2,
    lowVolatilityFactor: (allocation.bonds / 100) * 0.5,
  };
  
  // Diversification
  const numAssets = Object.values(allocation).filter(w => w > 0).length;
  const herfindahlIndex = Object.values(allocation)
    .filter(w => w > 0)
    .reduce((sum, weight) => sum + Math.pow(weight / 100, 2), 0);
  const diversificationScore = Math.min(100, (1 - herfindahlIndex) * 100 + numAssets * 3);
  
  // Risk Level and Safety Rating
  let riskLevel: "low" | "medium" | "high" | "extreme";
  let safetyRating: "A" | "B" | "C" | "D" | "F";
  
  if (annualVolatility < 8) {
    riskLevel = "low";
    safetyRating = sharpeRatio > 0.8 ? "A" : "B";
  } else if (annualVolatility < 15) {
    riskLevel = "medium";
    safetyRating = sharpeRatio > 0.6 ? "B" : "C";
  } else if (annualVolatility < 25) {
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
    volatility: annualVolatility,
    sharpeRatio,
    beta: portfolioBeta,
    maxDrawdown,
    var95,
    var99,
    diversificationScore,
    riskLevel,
    safetyRating,
    
    blackScholesMetrics: {
      optionPrice: bs.price,
      delta: bs.delta,
      gamma: bs.gamma,
      theta: bs.theta,
      vega: bs.vega,
      impliedVolatility: annualVolatility,
    },
    
    monteCarlo: {
      expectedValue: mc.expectedValue,
      medianValue: mc.medianValue,
      percentile5: mc.percentile5,
      percentile95: mc.percentile95,
      probabilityOfProfit: mc.probabilityOfProfit,
      probabilityOfLoss: mc.probabilityOfLoss,
      probabilityOfTargetReturn: mc.probabilityOfTargetReturn,
    },
    
    capm: {
      expectedReturn: capmExpectedReturn,
      alpha,
      rSquared: 0.85, // Simplified
      treynorRatio: (annualizedReturn - riskFreeRate) / portfolioBeta,
      informationRatio: alpha / annualVolatility,
    },
    
    stressTest: stress,
    
    varAdvanced: {
      historicalVaR,
      parametricVaR,
      monteCarloVaR,
      conditionalVaR,
      modifiedVaR: var95 * 1.1, // Simplified Cornish-Fisher adjustment
    },
    
    hedgeFundMetrics: {
      sortinoRatio,
      calmarRatio,
      sterlingRatio: annualReturn / Math.abs(maxDrawdown),
      burkeRatio: annualReturn / Math.sqrt(Math.abs(maxDrawdown)),
      ulcerIndex: Math.sqrt(Math.abs(maxDrawdown)),
      painIndex: Math.abs(maxDrawdown) / 2,
      painRatio: annualReturn / (Math.abs(maxDrawdown) / 2),
      upCapture: 0.85,
      downCapture: 0.75,
      upNumberRatio: 1.2,
      downNumberRatio: 0.8,
    },
    
    factorAnalysis,
    
    efficientFrontier: {
      optimalReturn: annualReturn * 1.1,
      optimalRisk: annualVolatility * 0.9,
      currentDistance: 5.5,
      improvementPotential: 10.5,
    },
    
    tailRisk: {
      skewness: -0.25,
      kurtosis: 3.8,
      jarqueBera: 15.2,
      maximumLoss: var99,
      averageLoss: var95 * 0.7,
      lossStdDev: annualVolatility * 0.5,
    },
    
    liquidityRisk: {
      weightedAvgLiquidity: 0.87,
      illiquidAssetsPercent: (allocation.realEstate + allocation.commodities),
      liquidityCoverage: 0.95,
      stressedLiquidity: 0.75,
    },
    
    scenarios: {
      bullCase: { return: annualReturn + 5, probability: 20 },
      baseCase: { return: annualReturn, probability: 50 },
      bearCase: { return: annualReturn - 8, probability: 25 },
      sidewaysCase: { return: annualReturn - 3, probability: 5 },
    },
  };
}

// Generate AI recommendations
function generateAdvancedRecommendations(input: PortfolioInput, metrics: QuantitativeMetrics): AIRecommendation {
  const { riskProfile, allocation, targetReturn } = input;
  
  // Basic recommendations from previous version
  const basicRecs = generateBasicRecommendations(input, metrics);
  
  // Advanced quantitative insights
  const quantitativeInsights = [
    {
      model: "Black-Scholes Option Pricing",
      insight: `Portfolio option delta of ${metrics.blackScholesMetrics.delta.toFixed(3)} suggests ${metrics.blackScholesMetrics.delta > 0.5 ? "high" : "moderate"} sensitivity to market movements`,
      confidence: 0.85,
    },
    {
      model: "Monte Carlo Simulation",
      insight: `${metrics.monteCarlo.probabilityOfProfit.toFixed(1)}% probability of profit over ${input.investmentHorizon} years`,
      confidence: 0.92,
    },
    {
      model: "CAPM Alpha Analysis",
      insight: `Portfolio alpha of ${metrics.capm.alpha.toFixed(2)}% ${metrics.capm.alpha > 0 ? "outperforms" : "underperforms"} market expectations`,
      confidence: 0.78,
    },
    {
      model: "Stress Testing",
      insight: `Portfolio would decline ${((1 - metrics.stressTest.marketCrash / metrics.portfolioValue) * 100).toFixed(1)}% in 2008-like scenario`,
      confidence: 0.88,
    },
  ];
  
  // Hedge fund strategy recommendation
  const hedgeFundStrategy = {
    strategy: riskProfile === "conservative" ? "Risk Parity" : riskProfile === "aggressive" ? "Global Macro" : "Multi-Strategy",
    allocation: {
      equity: riskProfile === "aggressive" ? 55 : riskProfile === "moderate" ? 45 : 30,
      bonds: riskProfile === "conservative" ? 45 : 25,
      gold: 15,
      crypto: riskProfile === "aggressive" ? 15 : 5,
    } as Partial<AssetAllocation>,
    expectedSharpe: metrics.sharpeRatio * 1.2,
    maxDrawdown: metrics.maxDrawdown * 0.8,
  };
  
  // Risk mitigation strategies
  const riskMitigation = {
    hedgingInstruments: [
      "Purchase VIX calls for tail risk protection",
      "Use gold futures to hedge inflation risk",
      "Consider put options on equity index",
    ],
    insuranceStrategies: [
      "Implement stop-loss orders at -15% portfolio level",
      "Set up automatic rebalancing triggers",
      "Maintain 6-month emergency cash reserve",
    ],
    diversificationImprovements: [
      "Add international equity exposure (20% of equity allocation)",
      "Include inflation-protected bonds (TIPS)",
      "Consider alternative investments (REITs, infrastructure)",
    ],
  };
  
  // Tail risk hedging
  const tailRiskHedging = [
    {
      recommendation: "Buy out-of-the-money put options on S&P 500 (5% portfolio cost)",
      cost: input.totalInvestment * 0.05,
      effectiveness: 0.85,
    },
    {
      recommendation: "Allocate 5% to long volatility strategies",
      cost: input.totalInvestment * 0.05,
      effectiveness: 0.70,
    },
  ];
  
  // Tax optimization
  const taxOptimization = [
    {
      strategy: "Tax-loss harvesting on underperforming assets",
      taxSavings: input.totalInvestment * 0.02,
      implementation: "Quarterly review and automated harvesting",
    },
    {
      strategy: "Asset location optimization (bonds in tax-deferred accounts)",
      taxSavings: input.totalInvestment * 0.015,
      implementation: "Reallocate based on tax efficiency",
    },
  ];
  
  return {
    ...basicRecs,
    quantitativeInsights,
    hedgeFundStrategy,
    riskMitigation,
    tailRiskHedging,
    taxOptimization,
  };
}

function generateBasicRecommendations(input: PortfolioInput, metrics: QuantitativeMetrics): any {
  // Simplified version of previous recommendation logic
  const { riskProfile, allocation } = input;
  
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
  
  const assetClassSuggestions = Object.entries(allocation)
    .filter(([asset, current]) => {
      const idealValue = ideal[asset as keyof AssetAllocation];
      return Math.abs(current - idealValue) > 3;
    })
    .map(([asset, current]) => {
      const idealValue = ideal[asset as keyof AssetAllocation];
      return {
        asset: asset.charAt(0).toUpperCase() + asset.slice(1),
        current,
        suggested: idealValue,
        reason: `Adjust ${asset} to align with ${riskProfile} risk profile`,
      };
    });
  
  return {
    summary: `Portfolio analysis shows ${metrics.riskLevel} risk with ${metrics.annualizedReturn.toFixed(2)}% expected return`,
    riskAssessment: `Current allocation ${metrics.riskLevel === "medium" ? "aligns well" : "needs adjustment"} with ${riskProfile} profile`,
    recommendations: [
      "Monitor portfolio volatility monthly",
      "Rebalance quarterly to maintain target allocation",
      "Consider tax-loss harvesting opportunities",
    ],
    assetClassSuggestions,
    rebalancingNeeded: assetClassSuggestions.length > 0,
    projectedReturns: {
      conservative: metrics.annualizedReturn * 0.7,
      moderate: metrics.annualizedReturn,
      aggressive: metrics.annualizedReturn * 1.3,
    },
  };
}

export const useQuantCalculatorStore = create<QuantCalculatorState>()(
  persist(
    (set, get) => ({
      input: { ...defaultInput },
      metrics: null,
      recommendation: null,
      isCalculating: false,
      lastCalculated: null,
      isMinimized: false,
      isFullScreen: false,
      calculationHistory: [],
      validationErrors: [],

      setTotalInvestment: (amount) => {
        const errors: string[] = [];
        if (amount < 1000) errors.push("Minimum investment is $1,000");
        if (amount > 10000000) errors.push("Maximum investment is $10,000,000");
        set((state) => ({
          input: { ...state.input, totalInvestment: amount },
          validationErrors: errors,
        }));
      },

      setMonthlyContribution: (amount) => {
        const errors: string[] = [];
        if (amount < 0) errors.push("Monthly contribution cannot be negative");
        if (amount > 50000) errors.push("Maximum monthly contribution is $50,000");
        set((state) => ({
          input: { ...state.input, monthlyContribution: amount },
          validationErrors: errors,
        }));
      },

      setInvestmentHorizon: (years) => {
        const errors: string[] = [];
        if (years < 1) errors.push("Minimum investment horizon is 1 year");
        if (years > 50) errors.push("Maximum investment horizon is 50 years");
        set((state) => ({
          input: { ...state.input, investmentHorizon: years },
          validationErrors: errors,
        }));
      },

      setTargetReturn: (percentage) =>
        set((state) => ({
          input: { ...state.input, targetReturn: percentage },
        })),

      setRiskProfile: (profile) =>
        set((state) => ({
          input: { ...state.input, riskProfile: profile },
        })),

      updateAllocation: (asset, percentage) => {
        const { input } = get();
        const newAllocation = { ...input.allocation, [asset]: percentage };
        const totalAllocation = Object.values(newAllocation).reduce((a, b) => a + b, 0);
        
        const errors: string[] = [];
        if (totalAllocation > 100) {
          errors.push(`Total allocation is ${totalAllocation.toFixed(1)}%. Must equal 100%`);
        }
        if (percentage > 80) {
          errors.push(`Avoid putting more than 80% in a single asset for diversification`);
        }
        
        set((state) => ({
          input: { ...state.input, allocation: newAllocation },
          validationErrors: errors,
        }));
      },

      normalizeAllocation: () => {
        const { input } = get();
        const totalAllocation = Object.values(input.allocation).reduce((sum, val) => sum + val, 0);
        if (totalAllocation !== 100 && totalAllocation > 0) {
          const factor = 100 / totalAllocation;
          const normalizedAllocation: AssetAllocation = { ...input.allocation };
          Object.keys(normalizedAllocation).forEach(key => {
            normalizedAllocation[key as keyof AssetAllocation] *= factor;
          });
          set((state) => ({
            input: { ...state.input, allocation: normalizedAllocation },
            validationErrors: [],
          }));
        }
      },

      validateInputs: () => {
        const { input } = get();
        const errors: string[] = [];
        
        // Validate total investment
        if (input.totalInvestment < 1000) {
          errors.push("Minimum total investment is $1,000");
        }
        if (input.totalInvestment > 10000000) {
          errors.push("Maximum total investment is $10,000,000");
        }
        
        // Validate allocation
        const totalAllocation = Object.values(input.allocation).reduce((sum, val) => sum + val, 0);
        if (Math.abs(totalAllocation - 100) > 0.1) {
          errors.push(`Allocation must equal 100% (currently ${totalAllocation.toFixed(1)}%)`);
        }
        
        // Validate single asset concentration
        const maxAllocation = Math.max(...Object.values(input.allocation));
        if (maxAllocation > 80) {
          errors.push("Avoid putting more than 80% in a single asset");
        }
        
        // Validate at least 2 assets
        const numAssets = Object.values(input.allocation).filter(w => w > 0).length;
        if (numAssets < 2) {
          errors.push("Please allocate to at least 2 different assets for diversification");
        }
        
        // Validate investment horizon
        if (input.investmentHorizon < 1) {
          errors.push("Investment horizon must be at least 1 year");
        }
        if (input.investmentHorizon > 50) {
          errors.push("Investment horizon cannot exceed 50 years");
        }
        
        set({ validationErrors: errors });
        return errors.length === 0;
      },

      setAdvancedOptions: (options) =>
        set((state) => ({
          input: { ...state.input, ...options },
        })),

      calculatePortfolio: async () => {
        const isValid = get().validateInputs();
        if (!isValid) return;
        
        set({ isCalculating: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { input } = get();
        const metrics = calculateQuantitativeMetrics(input);
        const recommendation = generateAdvancedRecommendations(input, metrics);
        
        set({
          metrics,
          recommendation,
          isCalculating: false,
          lastCalculated: Date.now(),
        });
        
        get().addToHistory();
      },

      resetCalculator: () =>
        set({
          input: { ...defaultInput },
          metrics: null,
          recommendation: null,
          lastCalculated: null,
          validationErrors: [],
        }),

      toggleMinimize: () =>
        set((state) => ({ isMinimized: !state.isMinimized })),

      toggleFullScreen: () =>
        set((state) => ({ isFullScreen: !state.isFullScreen })),

      addToHistory: () =>
        set((state) => {
          if (!state.metrics) return state;
          
          const newEntry = {
            timestamp: Date.now(),
            input: state.input,
            metrics: state.metrics,
          };
          
          return {
            calculationHistory: [newEntry, ...state.calculationHistory].slice(0, 10),
          };
        }),
    }),
    {
      name: "quant-calculator",
      partialize: (state) => ({ 
        input: state.input,
        metrics: state.metrics,
        recommendation: state.recommendation,
        lastCalculated: state.lastCalculated,
        calculationHistory: state.calculationHistory,
        isMinimized: state.isMinimized,
      }),
    }
  )
);
