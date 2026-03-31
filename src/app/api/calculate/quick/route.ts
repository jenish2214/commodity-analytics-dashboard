/**
 * API Route: /api/calculate/quick
 * 
 * Quick calculation endpoint for essential metrics only
 * (faster than full portfolio calculation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePortfolioMetrics, PortfolioInput } from '@/lib/pythonRunner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { allocation, totalInvestment } = body;
    
    if (!allocation || !totalInvestment) {
      return NextResponse.json(
        { error: 'Missing required fields: allocation, totalInvestment' },
        { status: 400 }
      );
    }
    
    const input: PortfolioInput = {
      allocation,
      totalInvestment,
    };
    
    const result = await calculatePortfolioMetrics(input);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    // Return only essential metrics
    const core = result.data.core_metrics;
    
    return NextResponse.json({
      success: true,
      metrics: {
        portfolioValue: core.portfolio_value,
        annualizedReturn: core.annualized_return,
        volatility: core.volatility,
        sharpeRatio: core.sharpe_ratio,
        maxDrawdown: core.max_drawdown,
        beta: core.beta,
        safetyRating: core.safety_rating,
        riskLevel: core.risk_level,
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
