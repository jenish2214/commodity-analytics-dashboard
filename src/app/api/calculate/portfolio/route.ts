/**
 * API Route: /api/calculate/portfolio
 * 
 * Main portfolio calculation endpoint using Python backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePortfolioMetrics, PortfolioInput } from '@/lib/pythonRunner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { allocation, totalInvestment, monthlyContribution, investmentHorizon, riskFreeRate, targetReturn } = body;
    
    if (!allocation || typeof allocation !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid allocation' },
        { status: 400 }
      );
    }
    
    if (!totalInvestment || typeof totalInvestment !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid totalInvestment' },
        { status: 400 }
      );
    }
    
    // Prepare input for Python calculation
    const input: PortfolioInput = {
      allocation,
      totalInvestment,
      monthlyContribution: monthlyContribution || 0,
      investmentHorizon: investmentHorizon || 10,
      riskFreeRate: riskFreeRate || 4.5,
      targetReturn: targetReturn,
    };
    
    // Run Python calculation
    const result = await calculatePortfolioMetrics(input);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Calculation failed' },
        { status: 500 }
      );
    }
    
    // Transform Python output to frontend format
    const data = result.data;
    
    const response = {
      success: true,
      metrics: {
        // Core metrics
        portfolioValue: data.core_metrics.portfolio_value,
        totalReturn: data.core_metrics.total_return,
        totalReturnPercentage: data.core_metrics.total_return_percentage,
        annualizedReturn: data.core_metrics.annualized_return,
        volatility: data.core_metrics.volatility,
        sharpeRatio: data.core_metrics.sharpe_ratio,
        maxDrawdown: data.core_metrics.max_drawdown,
        beta: data.core_metrics.beta,
        diversificationScore: data.core_metrics.diversification_score,
        var95: data.core_metrics.var_95,
        var99: data.core_metrics.var_99,
        safetyRating: data.core_metrics.safety_rating,
        riskLevel: data.core_metrics.risk_level,
        
        // Risk models
        varAdvanced: {
          historicalVaR: data.risk_models.var_advanced.historical_var,
          parametricVaR: data.risk_models.var_advanced.parametric_var,
          monteCarloVaR: data.risk_models.var_advanced.monte_carlo_var,
          conditionalVaR: data.risk_models.var_advanced.conditional_var,
          modifiedVaR: data.risk_models.var_advanced.modified_var,
        },
        blackScholesMetrics: {
          optionPrice: data.risk_models.black_scholes.option_price,
          delta: data.risk_models.black_scholes.delta,
          gamma: data.risk_models.black_scholes.gamma,
          theta: data.risk_models.black_scholes.theta,
          vega: data.risk_models.black_scholes.vega,
          impliedVolatility: data.risk_models.black_scholes.implied_volatility,
        },
        capm: {
          expectedReturn: data.risk_models.capm.expected_return,
          alpha: data.risk_models.capm.alpha,
          beta: data.risk_models.capm.beta,
          rSquared: data.risk_models.capm.r_squared,
          treynorRatio: data.risk_models.capm.treynor_ratio,
          informationRatio: data.risk_models.capm.information_ratio,
        },
        tailRisk: {
          skewness: data.risk_models.tail_risk.skewness,
          kurtosis: data.risk_models.tail_risk.kurtosis,
          jarqueBera: data.risk_models.tail_risk.jarque_bera,
          maximumLoss: data.risk_models.tail_risk.maximum_loss,
          averageLoss: data.risk_models.tail_risk.average_loss,
          lossStdDev: data.risk_models.tail_risk.loss_std_dev,
        },
        
        // Monte Carlo
        monteCarlo: {
          probabilityOfProfit: data.monte_carlo.probability_of_profit,
          probabilityOfLoss: data.monte_carlo.probability_of_loss,
          probabilityOfTargetReturn: data.monte_carlo.probability_of_target_return,
          expectedValue: data.monte_carlo.expected_value,
          percentile5: data.monte_carlo.percentile_5,
          percentile95: data.monte_carlo.percentile_95,
          medianValue: data.monte_carlo.median_value,
          stdDeviation: data.monte_carlo.std_deviation,
        },
        
        // Stress test
        stressTest: {
          marketCrash: data.stress_test.scenarios.market_crash.value,
          inflationSpike: data.stress_test.scenarios.inflation_spike.value,
          interestRateRise: data.stress_test.scenarios.interest_rate_rise.value,
          geopoliticalCrisis: data.stress_test.scenarios.geopolitical_crisis.value,
          pandemicScenario: data.stress_test.scenarios.pandemic_scenario.value,
          worstCase: data.stress_test.scenarios.worst_case.value,
        },
        
        // Hedge fund metrics
        hedgeFundMetrics: {
          sortinoRatio: data.hedge_fund_metrics.sortino_ratio,
          calmarRatio: data.hedge_fund_metrics.calmar_ratio,
          sterlingRatio: data.hedge_fund_metrics.sterling_ratio,
          burkeRatio: data.hedge_fund_metrics.burke_ratio,
          painRatio: data.hedge_fund_metrics.pain_ratio,
          ulcerIndex: data.hedge_fund_metrics.ulcer_index,
          painIndex: data.hedge_fund_metrics.pain_index,
          upCapture: data.hedge_fund_metrics.up_capture,
          downCapture: data.hedge_fund_metrics.down_capture,
          battingAverage: data.hedge_fund_metrics.batting_average,
        },
        
        // Factor analysis
        factorAnalysis: {
          marketFactor: data.factor_analysis.market_factor,
          sizeFactor: data.factor_analysis.size_factor,
          valueFactor: data.factor_analysis.value_factor,
          momentumFactor: data.factor_analysis.momentum_factor,
          qualityFactor: data.factor_analysis.quality_factor,
          lowVolatilityFactor: data.factor_analysis.low_volatility_factor,
        },
      },
      monteCarloData: data.monte_carlo.projection_data,
      factorInterpretations: data.factor_interpretations,
      raw: data, // Include raw data for debugging
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Portfolio calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
