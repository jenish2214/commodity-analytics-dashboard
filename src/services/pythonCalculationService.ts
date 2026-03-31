/**
 * Python Calculation API Service
 * ===============================
 * Frontend service to call Python calculation API endpoints
 */

import { PortfolioInput } from '@/lib/pythonRunner';

const API_BASE = '/api/calculate';

export interface PortfolioMetrics {
  portfolioValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  diversificationScore: number;
  var95: number;
  var99: number;
  safetyRating: string;
  riskLevel: string;
}

export interface RiskModels {
  varAdvanced: {
    historicalVaR: number;
    parametricVaR: number;
    monteCarloVaR: number;
    conditionalVaR: number;
    modifiedVaR: number;
  };
  blackScholesMetrics: {
    optionPrice: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    impliedVolatility: number;
  };
  capm: {
    expectedReturn: number;
    alpha: number;
    beta: number;
    rSquared: number;
    treynorRatio: number;
    informationRatio: number;
  };
  tailRisk: {
    skewness: number;
    kurtosis: number;
    jarqueBera: number;
    maximumLoss: number;
    averageLoss: number;
    lossStdDev: number;
  };
}

export interface MonteCarloResults {
  probabilityOfProfit: number;
  probabilityOfLoss: number;
  probabilityOfTargetReturn: number;
  expectedValue: number;
  percentile5: number;
  percentile95: number;
  medianValue: number;
  stdDeviation: number;
}

export interface StressTestResults {
  marketCrash: number;
  inflationSpike: number;
  interestRateRise: number;
  geopoliticalCrisis: number;
  pandemicScenario: number;
  worstCase: number;
}

export interface HedgeFundMetrics {
  sortinoRatio: number;
  calmarRatio: number;
  sterlingRatio: number;
  burkeRatio: number;
  painRatio: number;
  ulcerIndex: number;
  painIndex: number;
  upCapture: number;
  downCapture: number;
  battingAverage: number;
}

export interface FactorAnalysis {
  marketFactor: number;
  sizeFactor: number;
  valueFactor: number;
  momentumFactor: number;
  qualityFactor: number;
  lowVolatilityFactor: number;
}

export interface FullCalculationResult {
  success: boolean;
  metrics: PortfolioMetrics & RiskModels & {
    monteCarlo: MonteCarloResults;
    stressTest: StressTestResults;
    hedgeFundMetrics: HedgeFundMetrics;
    factorAnalysis: FactorAnalysis;
  };
  monteCarloData: Array<{
    year: number;
    expected: number;
    optimistic: number;
    pessimistic: number;
    worstCase: number;
  }>;
  factorInterpretations: Record<string, string>;
}

/**
 * Run full portfolio calculation with all metrics
 */
export async function calculateFullPortfolio(
  input: PortfolioInput
): Promise<FullCalculationResult> {
  const response = await fetch(`${API_BASE}/portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Calculation failed');
  }

  return response.json();
}

/**
 * Run quick calculation for essential metrics only
 */
export async function calculateQuickMetrics(
  allocation: Record<string, number>,
  totalInvestment: number
): Promise<PortfolioMetrics> {
  const response = await fetch(`${API_BASE}/quick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allocation, totalInvestment }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Quick calculation failed');
  }

  const data = await response.json();
  return data.metrics;
}

/**
 * Run Monte Carlo simulation
 */
export async function runMonteCarloSimulation(
  input: PortfolioInput
): Promise<{ monteCarlo: MonteCarloResults; projectionData: any[] }> {
  const response = await fetch(`${API_BASE}/monte-carlo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Monte Carlo simulation failed');
  }

  return response.json();
}

/**
 * Run stress tests
 */
export async function runStressTests(
  input: PortfolioInput
): Promise<{ stressTest: StressTestResults; summary: any }> {
  const response = await fetch(`${API_BASE}/stress-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Stress test failed');
  }

  return response.json();
}

/**
 * Transform API response to match existing store format
 */
export function transformToStoreFormat(apiResult: FullCalculationResult) {
  const m = apiResult.metrics;
  
  return {
    portfolioValue: m.portfolioValue,
    totalReturn: m.totalReturn,
    totalReturnPercentage: m.totalReturnPercentage,
    annualizedReturn: m.annualizedReturn,
    volatility: m.volatility,
    sharpeRatio: m.sharpeRatio,
    maxDrawdown: m.maxDrawdown,
    beta: m.beta,
    diversificationScore: m.diversificationScore,
    var95: m.var95,
    var99: m.var99,
    safetyRating: m.safetyRating,
    riskLevel: m.riskLevel,
    varAdvanced: m.varAdvanced,
    blackScholesMetrics: m.blackScholesMetrics,
    capm: m.capm,
    tailRisk: m.tailRisk,
    monteCarlo: m.monteCarlo,
    stressTest: m.stressTest,
    hedgeFundMetrics: m.hedgeFundMetrics,
    factorAnalysis: m.factorAnalysis,
  };
}
