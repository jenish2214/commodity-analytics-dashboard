/**
 * API Route: /api/calculate/monte-carlo
 * 
 * Monte Carlo simulation endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePortfolioMetrics, PortfolioInput } from '@/lib/pythonRunner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { allocation, totalInvestment, monthlyContribution, investmentHorizon, targetReturn } = body;
    
    if (!allocation || !totalInvestment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const input: PortfolioInput = {
      allocation,
      totalInvestment,
      monthlyContribution: monthlyContribution || 0,
      investmentHorizon: investmentHorizon || 10,
      targetReturn,
    };
    
    const result = await calculatePortfolioMetrics(input);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    const mc = result.data.monte_carlo;
    
    return NextResponse.json({
      success: true,
      monteCarlo: {
        probabilityOfProfit: mc.probability_of_profit,
        probabilityOfLoss: mc.probability_of_loss,
        probabilityOfTargetReturn: mc.probability_of_target_return,
        expectedValue: mc.expected_value,
        percentile5: mc.percentile_5,
        percentile95: mc.percentile_95,
        medianValue: mc.median_value,
      },
      projectionData: mc.projection_data,
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
