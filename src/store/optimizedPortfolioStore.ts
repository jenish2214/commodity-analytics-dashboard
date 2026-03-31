/**
 * Optimized Store with Selectors
 * ==============================
 * Performance-optimized Zustand store using selectors and memoization
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { useCallback, useMemo } from 'react';

// Types
export interface PortfolioInput {
  totalInvestment: number;
  monthlyContribution: number;
  investmentHorizon: number;
  allocation: Record<string, number>;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  targetReturn: number;
  riskFreeRate: number;
  monteCarloSimulations: number;
}

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
  monteCarlo: {
    probabilityOfProfit: number;
    probabilityOfLoss: number;
    probabilityOfTargetReturn: number;
    expectedValue: number;
    percentile5: number;
    percentile95: number;
    medianValue: number;
    stdDeviation: number;
  };
  stressTest: {
    marketCrash: number;
    inflationSpike: number;
    interestRateRise: number;
    geopoliticalCrisis: number;
    pandemicScenario: number;
    worstCase: number;
  };
  hedgeFundMetrics: {
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
  };
  factorAnalysis: {
    marketFactor: number;
    sizeFactor: number;
    valueFactor: number;
    momentumFactor: number;
    qualityFactor: number;
    lowVolatilityFactor: number;
  };
}

interface StoreState {
  input: PortfolioInput;
  metrics: PortfolioMetrics | null;
  isCalculating: boolean;
  calculationHistory: Array<{ timestamp: number; metrics: PortfolioMetrics }>;
  validationErrors: string[];
  
  // Actions
  setTotalInvestment: (value: number) => void;
  setMonthlyContribution: (value: number) => void;
  setInvestmentHorizon: (value: number) => void;
  setRiskProfile: (profile: PortfolioInput['riskProfile']) => void;
  setTargetReturn: (value: number) => void;
  updateAllocation: (asset: string, value: number) => void;
  setAdvancedOptions: (options: Partial<PortfolioInput>) => void;
  setMetrics: (metrics: PortfolioMetrics) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  setValidationErrors: (errors: string[]) => void;
  normalizeAllocation: () => void;
  resetCalculator: () => void;
  addToHistory: () => void;
}

const DEFAULT_ALLOCATION = {
  equity: 40,
  bonds: 20,
  gold: 10,
  silver: 0,
  crudeOil: 0,
  naturalGas: 0,
  copper: 0,
  crypto: 10,
  cash: 10,
  realEstate: 10,
  commodities: 0,
};

const DEFAULT_INPUT: PortfolioInput = {
  totalInvestment: 100000,
  monthlyContribution: 1000,
  investmentHorizon: 10,
  allocation: { ...DEFAULT_ALLOCATION },
  riskProfile: 'moderate',
  targetReturn: 50,
  riskFreeRate: 4.5,
  monteCarloSimulations: 10000,
};

// Create optimized store
export const usePortfolioStore = create<StoreState>()(
  devtools(
    (set, get) => ({
      input: { ...DEFAULT_INPUT },
      metrics: null,
      isCalculating: false,
      calculationHistory: [],
      validationErrors: [],

      setTotalInvestment: (value) => {
        set((state) => ({
          input: { ...state.input, totalInvestment: value },
        }));
      },

      setMonthlyContribution: (value) => {
        set((state) => ({
          input: { ...state.input, monthlyContribution: value },
        }));
      },

      setInvestmentHorizon: (value) => {
        set((state) => ({
          input: { ...state.input, investmentHorizon: value },
        }));
      },

      setRiskProfile: (profile) => {
        // Auto-adjust allocation based on risk profile
        let newAllocation = { ...get().input.allocation };
        
        if (profile === 'conservative') {
          newAllocation = {
            equity: 30, bonds: 40, gold: 10, silver: 0,
            crudeOil: 0, naturalGas: 0, copper: 0,
            crypto: 0, cash: 10, realEstate: 10, commodities: 0
          };
        } else if (profile === 'aggressive') {
          newAllocation = {
            equity: 60, bonds: 10, gold: 5, silver: 0,
            crudeOil: 0, naturalGas: 0, copper: 0,
            crypto: 15, cash: 0, realEstate: 10, commodities: 0
          };
        } else {
          newAllocation = { ...DEFAULT_ALLOCATION };
        }
        
        set((state) => ({
          input: { ...state.input, riskProfile: profile, allocation: newAllocation },
        }));
      },

      setTargetReturn: (value) => {
        set((state) => ({
          input: { ...state.input, targetReturn: value },
        }));
      },

      updateAllocation: (asset, value) => {
        set((state) => ({
          input: {
            ...state.input,
            allocation: { ...state.input.allocation, [asset]: value },
          },
        }));
      },

      setAdvancedOptions: (options) => {
        set((state) => ({
          input: { ...state.input, ...options },
        }));
      },

      setMetrics: (metrics) => {
        set({ metrics });
      },

      setIsCalculating: (isCalculating) => {
        set({ isCalculating });
      },

      setValidationErrors: (errors) => {
        set({ validationErrors: errors });
      },

      normalizeAllocation: () => {
        const current = get().input.allocation;
        const total = Object.values(current).reduce((a, b) => a + b, 0);
        
        if (total === 0) return;
        
        const normalized: Record<string, number> = {};
        for (const [asset, value] of Object.entries(current)) {
          normalized[asset] = (value / total) * 100;
        }
        
        set((state) => ({
          input: { ...state.input, allocation: normalized },
        }));
      },

      resetCalculator: () => {
        set({
          input: { ...DEFAULT_INPUT },
          metrics: null,
          isCalculating: false,
          validationErrors: [],
        });
      },

      addToHistory: () => {
        const { metrics } = get();
        if (!metrics) return;
        
        set((state) => ({
          calculationHistory: [
            { timestamp: Date.now(), metrics },
            ...state.calculationHistory.slice(0, 9), // Keep last 10
          ],
        }));
      },
    }),
    { name: 'portfolio-calculator-store' }
  )
);

// Optimized selectors - use these to prevent unnecessary re-renders
export const usePortfolioInput = () => usePortfolioStore((state) => state.input);
export const usePortfolioMetrics = () => usePortfolioStore((state) => state.metrics);
export const useIsCalculating = () => usePortfolioStore((state) => state.isCalculating);
export const useValidationErrors = () => usePortfolioStore((state) => state.validationErrors);
export const useCalculationHistory = () => usePortfolioStore((state) => state.calculationHistory);

// Granular selectors for specific input fields
export const useTotalInvestment = () => usePortfolioStore((state) => state.input.totalInvestment);
export const useMonthlyContribution = () => usePortfolioStore((state) => state.input.monthlyContribution);
export const useInvestmentHorizon = () => usePortfolioStore((state) => state.input.investmentHorizon);
export const useAllocation = () => usePortfolioStore((state) => state.input.allocation);
export const useRiskProfile = () => usePortfolioStore((state) => state.input.riskProfile);

// Granular selectors for specific metrics
export const usePortfolioValue = () => usePortfolioStore((state) => state.metrics?.portfolioValue ?? 0);
export const useAnnualizedReturn = () => usePortfolioStore((state) => state.metrics?.annualizedReturn ?? 0);
export const useVolatility = () => usePortfolioStore((state) => state.metrics?.volatility ?? 0);
export const useSharpeRatio = () => usePortfolioStore((state) => state.metrics?.sharpeRatio ?? 0);
export const useSafetyRating = () => usePortfolioStore((state) => state.metrics?.safetyRating ?? 'N/A');
export const useRiskLevel = () => usePortfolioStore((state) => state.metrics?.riskLevel ?? 'medium');

// Action selectors
export const useStoreActions = () => usePortfolioStore(
  (state) => ({
    setTotalInvestment: state.setTotalInvestment,
    setMonthlyContribution: state.setMonthlyContribution,
    setInvestmentHorizon: state.setInvestmentHorizon,
    setRiskProfile: state.setRiskProfile,
    setTargetReturn: state.setTargetReturn,
    updateAllocation: state.updateAllocation,
    setAdvancedOptions: state.setAdvancedOptions,
    setMetrics: state.setMetrics,
    setIsCalculating: state.setIsCalculating,
    normalizeAllocation: state.normalizeAllocation,
    resetCalculator: state.resetCalculator,
  }),
  shallow
);
